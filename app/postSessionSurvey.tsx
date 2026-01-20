import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
};

type Survey = {
    _id: string;
    title: string;
    type: string;
    questions: SurveyQuestion[];
};

const postSessionSurvey = () => {
    const router = useRouter();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [timer, setTimer] = useState(5);
    const [error, setError] = useState('');

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
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            const response = await fetch('https://server.riyadah.app/api/surveys/active', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to load survey');
                setLoading(false);
                return;
            }

            const data = await response.json();
            setSurvey(data.survey);
            setAnswers(buildInitialAnswers(data.survey?.questions || []));
        } catch (err) {
            setError('Failed to load survey');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurvey();
    }, []);

    const isAnswerFilled = (question: SurveyQuestion, value: any) => {
        if (!question.required) return true;
        if (question.type === 'rating') return value !== undefined && value !== null;
        if (question.type === 'multi') return Array.isArray(value) && value.length > 0;
        if (question.type === 'text' || question.type === 'long-text') {
            return typeof value === 'string' && value.trim().length > 0;
        }
        return value !== undefined && value !== null && value !== '';
    };

    const handleSubmit = async () => {
        if (!survey) {
            Alert.alert('Survey unavailable', 'No survey was found to submit.');
            return;
        }

        const missing = survey.questions.filter(question => !isAnswerFilled(question, answers[question._id]));
        if (missing.length > 0) {
            Alert.alert('Please fill all required fields', 'All required fields are mandatory.');
            return;
        }

        const payloadAnswers = survey.questions
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
                setError('User not authenticated');
                setSaving(false);
                return;
            }

            const response = await fetch(`https://server.riyadah.app/api/surveys/${survey._id}/responses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ answers: payloadAnswers })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to submit survey');
                setSaving(false);
                return;
            }

            setSubmitted(true);
            setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            Alert.alert('Error', 'Failed to submit post session survey.');
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = () => {
        router.replace("/landing");
    }

    useEffect(() => {
        if (timer == 0) {
            router.replace("/landing");
        }
    }, [timer]);

    const handleMultiToggle = (questionId: string, optionValue: string) => {
        setAnswers(prev => {
            const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
            if (current.includes(optionValue)) {
                return { ...prev, [questionId]: current.filter((item: string) => item !== optionValue) };
            }
            return { ...prev, [questionId]: [...current, optionValue] };
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Image
                    source={require('../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>{survey?.title || 'Post-Session Feedback'}</Text>
                    {loading &&
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
                            <ActivityIndicator
                                size="small"
                                color="#fff"
                                style={{ transform: [{ scale: 1.25 }] }}
                            />
                        </View>
                    }
                </View>

                <Text style={styles.ghostText}>Survey</Text>
            </View>

            {!loading && !submitted && <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView>
                    <View style={styles.contentContainer}>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        {!survey && !error && (
                            <Text style={styles.hint}>No survey is available right now.</Text>
                        )}
                        {survey?.questions?.map(question => (
                            <View key={question._id} style={styles.questionBlock}>
                                <Text style={styles.label}>
                                    {question.text}{question.required ? ' *' : ''}
                                </Text>
                                {!!question.description && <Text style={styles.hint}>{question.description}</Text>}

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
                                        <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 10 }}>
                                            {answers[question._id] ?? question.scale?.min ?? 0}
                                        </Text>
                                    </View>
                                )}

                                {question.type === 'single' && (
                                    <View style={styles.radioGroup}>
                                        {(question.options || []).map(option => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={styles.radioButtonContainer}
                                                onPress={() => setAnswers(prev => ({ ...prev, [question._id]: option.value }))}
                                            >
                                                <View style={styles.outerCircle}>
                                                    {answers[question._id] === option.value && <View style={styles.innerCircle} />}
                                                </View>
                                                <Text style={styles.optionText}>{option.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {question.type === 'multi' && (
                                    <View style={styles.radioGroup}>
                                        {(question.options || []).map(option => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={styles.radioButtonContainer}
                                                onPress={() => handleMultiToggle(question._id, option.value)}
                                            >
                                                <View style={styles.checkboxOuter}>
                                                    {Array.isArray(answers[question._id]) && answers[question._id].includes(option.value) && (
                                                        <View style={styles.checkboxInner} />
                                                    )}
                                                </View>
                                                <Text style={styles.optionText}>{option.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {(question.type === 'text' || question.type === 'long-text') && (
                                    <TextInput
                                        style={question.type === 'long-text' ? styles.textarea : styles.input}
                                        placeholder={question.type === 'long-text' ? 'Type your response' : 'Answer'}
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

            {!submitted && !loading && <View style={styles.fixedBottomSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity style={styles.fullButtonRow} onPress={handleSkip}>
                        <View style={[styles.loginButton, { backgroundColor: '#888' }]}>
                            <Text style={styles.loginText}>
                                Skip
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fullButtonRow} onPress={handleSubmit}>
                        <View style={styles.loginButton}>
                            <Text style={styles.loginText}>
                                {saving ? 'Submitting' : 'Submit Feedback'}
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
            </View>}

            {submitted && !loading && !saving && <View>
                <View style={styles.childConfirmation}>
                    <View style={{
                        backgroundColor: '#009933',
                        borderRadius: 50,
                        width: 50,
                        height: 50,
                        marginBottom: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Image
                            source={require('../assets/check.png')}
                            style={{ width: 30, height: 30 }}
                            resizeMode="contain"
                            tintColor={'#ffffff'}
                        />
                    </View>

                    <Text style={styles.confirmationTitle}>
                        Feedback submitted successfully!
                    </Text>

                    <Text style={[styles.hint, { marginTop: 10, marginBottom: 50 }]}>
                        You will be redirected in {timer}
                    </Text>
                </View>
            </View>}
        </View >
    );
};

export default postSessionSurvey;

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
        height: 270,
        // marginBottom: 30
    },
    logo: {
        width: 120,
        height: 40,
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
    headerTextBlock: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: width - 40,
    },
    pageTitle: {
        color: '#ffffff',
        fontFamily: 'Qatar',
        fontSize: 30,
    },
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Acumin'
    },
    ghostText: {
        color: '#ffffff',
        fontSize: 100, textTransform: 'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2
    },
    label: {
        fontFamily: "Qatar",
        fontSize: 20,
        // marginBottom: 10
    },
    questionBlock: {
        marginBottom: 20
    },
    rangeContainer: {

    },
    subtitle: {
        fontFamily: "Acumin",
        fontSize: 16,
        fontWeight: 'bold'
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
    sideRect: {
        height: 48,
        width: 13,
    },
    sideRectAfter: {
        height: 48,
        width: 13,
        marginLeft: -1
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
    },
    hint: {
        marginBottom: 5,
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#888'
    },
    radioGroup: {
        // flexDirection: 'row',
        marginTop: 10,
        marginBottom: 30,
        gap: 8
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    innerCircle: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#FF4400',
    },
    optionText: {
        fontSize: 15,
    },
});
