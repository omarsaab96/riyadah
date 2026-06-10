import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../../context/language';

const { width } = Dimensions.get('window');

type SurveyOption = {
    label: string;
    value: string;
};

type SurveyQuestion = {
    _id: string;
    text: string;
    type: 'rating' | 'single' | 'multi' | 'text' | 'long-text';
    description?: string;
    required?: boolean;
    options?: SurveyOption[];
    scale?: {
        min?: number;
        max?: number;
        step?: number;
    };
    conditional?: {
        questionId?: string;
        values?: string[];
    };
};

type Survey = {
    _id: string;
    title: string;
    repeating?: { enabled: boolean; cadence: 'monthly' | 'post-training' | null };
    questions: SurveyQuestion[];
};

export default function SurveyRespondScreen() {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
    const params = useLocalSearchParams();
    const surveyId = params.id as string;
    const sessionId = params.sessionId as string | undefined;
    const isPreview = params.preview === '1' || params.preview === 'true';

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const textDirectionStyle = isRTL ? styles.rtlText : styles.ltrText;

    const buildInitialAnswers = (questions: SurveyQuestion[]) => {
        const initial: Record<string, any> = {};
        questions.forEach(question => {
            if (question.type === 'rating') {
                initial[question._id] = question.scale?.min ?? 0;
            }
            if (question.type === 'multi') {
                initial[question._id] = [];
            }
        });
        return initial;
    };

    const fetchSurvey = async () => {
        if (!surveyId) return;
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError(t('surveyRespond.userNotAuthenticated'));
                setLoading(false);
                return;
            }

            const response = await fetch(`https://server.riyadah.app/api/surveys/${surveyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || t('surveyRespond.failedToLoad'));
                setLoading(false);
                return;
            }

            const data = await response.json();
            setSurvey(data.survey);
            setAnswers(buildInitialAnswers(data.survey?.questions || []));
        } catch (err) {
            setError(t('surveyRespond.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurvey();
    }, [surveyId]);

    const shouldShowQuestion = (question: SurveyQuestion) => {
        if (!question.conditional?.questionId) return true;
        const conditionalValue = answers[question.conditional.questionId];
        if (conditionalValue === undefined || conditionalValue === null) return false;

        const expectedValues = (question.conditional.values || []).map(value => String(value));
        if (expectedValues.length === 0) {
            return Boolean(conditionalValue);
        }

        if (Array.isArray(conditionalValue)) {
            return conditionalValue.some(value => expectedValues.includes(String(value)));
        }

        return expectedValues.includes(String(conditionalValue));
    };

    const isAnswerFilled = (question: SurveyQuestion, value: any) => {
        if (!shouldShowQuestion(question)) return true;
        if (!question.required) return true;
        if (question.type === 'rating') return value !== undefined && value !== null;
        if (question.type === 'multi') return Array.isArray(value) && value.length > 0;
        if (question.type === 'text' || question.type === 'long-text') {
            return typeof value === 'string' && value.trim().length > 0;
        }
        return value !== undefined && value !== null && value !== '';
    };

    const handleMultiToggle = (questionId: string, optionValue: string) => {
        setAnswers(prev => {
            const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
            if (current.includes(optionValue)) {
                return { ...prev, [questionId]: current.filter((item: string) => item !== optionValue) };
            }
            return { ...prev, [questionId]: [...current, optionValue] };
        });
    };

    const handleSubmit = async () => {
        if (!survey) {
            Alert.alert(t('surveyRespond.unavailableTitle'), t('surveyRespond.unavailableMessage'));
            return;
        }

        if (!isPreview && survey.repeating?.enabled && survey.repeating?.cadence === 'post-training' && !sessionId) {
            Alert.alert(t('surveyRespond.sessionRequiredTitle'), t('surveyRespond.sessionRequiredMessage'));
            return;
        }

        const visibleQuestions = survey.questions.filter(question => shouldShowQuestion(question));
        const missing = visibleQuestions.filter(question => !isAnswerFilled(question, answers[question._id]));
        if (missing.length > 0) {
            Alert.alert(t('surveyRespond.requiredFieldsTitle'), t('surveyRespond.requiredFieldsMessage'));
            return;
        }

        const payloadAnswers = visibleQuestions
            .map(question => {
                const value = answers[question._id];
                if (value === undefined || value === null) return null;
                if (typeof value === 'string' && value.trim().length === 0) return null;
                if (Array.isArray(value) && value.length === 0) return null;
                return { questionId: question._id, value };
            })
            .filter(Boolean);

        setSaving(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError(t('surveyRespond.userNotAuthenticated'));
                setSaving(false);
                return;
            }

            const response = await fetch(`https://server.riyadah.app/api/surveys/${survey._id}/responses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ answers: payloadAnswers, sessionId, preview: isPreview })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || t('surveyRespond.failedToSubmit'));
                setSaving(false);
                return;
            }

            setSubmitted(true);
        } catch (err) {
            Alert.alert(t('surveyRespond.errorTitle'), t('surveyRespond.failedToSubmitMessage'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Image
                    source={require('../../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <TouchableOpacity style={[styles.backButton, isRTL && styles.backButtonRtl]} onPress={() => router.back()}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={20} color="#fff" />
                    <Text style={[styles.backText, textDirectionStyle]}>{t('surveyRespond.back')}</Text>
                </TouchableOpacity>

                <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                    {isPreview && <Text style={[styles.previewLabel, textDirectionStyle]}>{t('surveyRespond.previewMode')}</Text>}
                    <Text style={[styles.pageTitle, textDirectionStyle]}>{survey?.title || t('surveyRespond.titleFallback')}</Text>
                    {/* {isPreview && <Text style={styles.previewHint}>Preview mode. Submissions are saved separately.</Text>} */}
                    {loading &&
                        <View style={[styles.headerLoaderRow, isRTL && styles.headerLoaderRowRtl]}>
                            <ActivityIndicator
                                size="small"
                                color="#fff"
                                style={{ transform: [{ scale: 1.25 }] }}
                            />
                        </View>
                    }
                </View>
            </View>

            {!loading && !submitted && <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView>
                    <View style={styles.contentContainer}>
                        {error ? <Text style={[styles.errorText, textDirectionStyle]}>{error}</Text> : null}
                        {survey?.repeating?.enabled && survey?.repeating?.cadence === 'post-training' && !sessionId && (
                            <Text style={[styles.hint, textDirectionStyle]}>{t('surveyRespond.afterTrainingHint')}</Text>
                        )}
                        {survey?.questions?.filter(question => shouldShowQuestion(question)).map(question => (
                            <View key={question._id} style={styles.questionBlock}>
                                <Text style={[styles.label, textDirectionStyle]}>
                                    {question.text}{question.required ? ' *' : ''}
                                </Text>
                                {!!question.description && <Text style={[styles.hint, textDirectionStyle]}>{question.description}</Text>}

                                {question.type === 'rating' && (
                                    <View style={styles.rangeSliderContainer}>
                                        <Slider
                                            style={styles.rangeSlider}
                                            minimumValue={question.scale?.min ?? 0}
                                            maximumValue={question.scale?.max ?? 10}
                                            step={question.scale?.step ?? 1}
                                            value={answers[question._id] ?? question.scale?.min ?? 0}
                                            onValueChange={(value) => setAnswers(prev => ({ ...prev, [question._id]: value }))}
                                            minimumTrackTintColor="#FF4000"
                                            maximumTrackTintColor="#111111"
                                            thumbTintColor="#FF4000"
                                        />
                                        <Text style={styles.sliderValue}>
                                            {answers[question._id] ?? question.scale?.min ?? 0}
                                        </Text>
                                    </View>
                                )}

                                {question.type === 'single' && (
                                    <View style={styles.radioGroup}>
                                        {(question.options || []).map(option => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[styles.radioButtonContainer, isRTL && styles.radioButtonContainerRtl]}
                                                onPress={() => setAnswers(prev => ({ ...prev, [question._id]: option.value }))}
                                            >
                                                <View style={[styles.outerCircle, isRTL && styles.outerCircleRtl]}>
                                                    {answers[question._id] === option.value && <View style={styles.innerCircle} />}
                                                </View>
                                                <Text style={[styles.optionText, textDirectionStyle]}>{option.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {question.type === 'multi' && (
                                    <View style={styles.radioGroup}>
                                        {(question.options || []).map(option => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[styles.radioButtonContainer, isRTL && styles.radioButtonContainerRtl]}
                                                onPress={() => handleMultiToggle(question._id, option.value)}
                                            >
                                                <View style={[styles.checkboxOuter, isRTL && styles.checkboxOuterRtl]}>
                                                    {Array.isArray(answers[question._id]) && answers[question._id].includes(option.value) && (
                                                        <View style={styles.checkboxInner} />
                                                    )}
                                                </View>
                                                <Text style={[styles.optionText, textDirectionStyle]}>{option.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {(question.type === 'text' || question.type === 'long-text') && (
                                    <TextInput
                                        style={[
                                            question.type === 'long-text' ? styles.textarea : styles.input,
                                            textDirectionStyle
                                        ]}
                                        placeholder={question.type === 'long-text' ? t('surveyRespond.typeYourResponse') : t('surveyRespond.answer')}
                                        placeholderTextColor="#A8A8A8"
                                        value={answers[question._id] || ''}
                                        onChangeText={(value) => setAnswers(prev => ({ ...prev, [question._id]: value }))}
                                        multiline={question.type === 'long-text'}
                                        blurOnSubmit={false}
                                        returnKeyType="default"
                                    />
                                )}
                            </View>
                        ))}

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>}

            {!submitted && !loading && (
                <View style={styles.fixedBottomSection}>
                    <TouchableOpacity style={styles.fullButtonRow} onPress={handleSubmit}>
                        <View style={styles.loginButton}>
                            <Text style={styles.loginText}>
                                {saving ? t('surveyRespond.submitting') : t('surveyRespond.submit')}
                            </Text>
                            {saving && (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                    style={styles.loginLoader}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {submitted && !loading && !saving && (
                <View style={styles.childConfirmation}>
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={24} color="#fff" />
                    </View>
                    <Text style={[styles.confirmationTitle, textDirectionStyle]}>{t('surveyRespond.submittedSuccessfully')}</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
                        <Text style={styles.primaryButtonText}>{t('surveyRespond.back')}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 220,
    },
    logo: {
        width: 120,
        height: 40,
        position: 'absolute',
        top: Platform.OS == 'ios' ? 60 : 40,
        left: 20,
        zIndex: 1,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS == 'ios' ? 60 : 40,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    backButtonRtl: {
        right: undefined,
        left: 20,
        flexDirection: 'row-reverse',
    },
    backText: {
        color: '#fff',
        fontFamily: 'Acumin',
        fontSize: 14
    },
    headerTextBlock: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: width - 40,
    },
    headerTextBlockRtl: {
        left: 'auto',
        right: 20,
        maxWidth: 200
    },
    pageTitle: {
        color: '#ffffff',
        fontFamily: 'Qatar',
        fontSize: 28,
    },
    previewLabel: {
        marginTop: 8,
        alignSelf: 'flex-start',
        backgroundColor: '#111111',
        color: '#fff',
        fontFamily: 'Acumin',
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    ltrText: {
        textAlign: 'left',
        writingDirection: 'ltr'
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl'
    },
    headerLoaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 5
    },
    headerLoaderRowRtl: {
        flexDirection: 'row-reverse',
    },
    label: {
        fontFamily: "Qatar",
        fontSize: 20,
        color: '#111'
    },
    questionBlock: {
        marginBottom: 20
    },
    rangeSliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    rangeSlider: {
        flex: 1,
        height: 40
    },
    sliderValue: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 10,
        color: '#111'
    },
    textarea: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
        height: 100,
        textAlignVertical: 'top',
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
        marginTop: 10
    },
    errorText: {
        color: 'red',
        fontFamily: 'Acumin',
        marginBottom: 10
    },
    fixedBottomSection: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        width: width,
        paddingLeft: 20,
        paddingRight: 20
    },
    fullButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
        flex: 1
    },
    loginButton: {
        flex: 1,
        backgroundColor: '#000000',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 15
    },
    loginText: {
        fontSize: 18,
        color: 'white',
        fontFamily: 'Qatar',
    },
    loginLoader: {
        marginLeft: 10
    },
    childConfirmation: {
        paddingHorizontal: 20,
        paddingTop: 40,
        alignItems: 'center',
    },
    confirmationTitle: {
        fontFamily: 'Qatar',
        fontSize: 20,
        marginBottom: 20
    },
    hint: {
        marginBottom: 5,
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#888'
    },
    previewHint: {
        marginBottom: 10,
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#666'
    },
    radioGroup: {
        marginTop: 10,
        marginBottom: 30,
        gap: 8
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButtonContainerRtl: {
        flexDirection: 'row-reverse',
    },
    checkboxOuter: {
        height: 22,
        width: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#FF4400',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    checkboxOuterRtl: {
        marginRight: 0,
        marginLeft: 6,
    },
    checkboxInner: {
        height: 12,
        width: 12,
        borderRadius: 2,
        backgroundColor: '#FF4400',
    },
    outerCircle: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#FF4400',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    outerCircleRtl: {
        marginRight: 0,
        marginLeft: 6,
    },
    innerCircle: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#FF4400',
    },
    optionText: {
        fontSize: 15,
        color: '#111'
    },
    checkCircle: {
        backgroundColor: '#009933',
        borderRadius: 30,
        width: 50,
        height: 50,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#111111',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    primaryButtonText: {
        color: '#fff',
        fontFamily: 'Qatar',
        fontSize: 16
    }
});
