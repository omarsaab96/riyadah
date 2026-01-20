import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
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

const { width } = Dimensions.get('window');

type SurveyOption = {
    label: string;
    value: string;
};

type SurveyQuestion = {
    _id?: string;
    text: string;
    description?: string;
    type: 'rating' | 'single' | 'multi' | 'text' | 'long-text';
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
    isActive: boolean;
    questions: SurveyQuestion[];
};

type QuestionForm = {
    _id?: string;
    text: string;
    description: string;
    type: 'rating' | 'single' | 'multi' | 'text' | 'long-text';
    required: boolean;
    options: string[];
    scale: {
        min: string;
        max: string;
        step: string;
    };
};

const defaultQuestion = (): QuestionForm => ({
    text: '',
    description: '',
    type: 'single',
    required: true,
    options: [''],
    scale: { min: '0', max: '10', step: '1' }
});

export default function ManagerSurveysScreen() {
    const router = useRouter();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [questions, setQuestions] = useState<QuestionForm[]>([defaultQuestion()]);

    const fetchSurveys = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            const response = await fetch('https://server.riyadah.app/api/surveys', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to load surveys');
                setLoading(false);
                return;
            }

            const data = await response.json();
            setSurveys(data.surveys || []);
        } catch (err) {
            setError('Failed to load surveys');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurveys();
    }, []);

    const resetForm = () => {
        setEditingSurveyId(null);
        setTitle('');
        setIsActive(false);
        setQuestions([defaultQuestion()]);
        setError('');
    };

    const startEditing = (survey: Survey) => {
        setEditingSurveyId(survey._id);
        setTitle(survey.title);
        setIsActive(survey.isActive);
        setQuestions(
            (survey.questions || []).map(question => ({
                _id: question._id,
                text: question.text || '',
                description: question.description || '',
                type: question.type,
                required: question.required !== false,
                options: (question.options || []).map(option => option.label || option.value),
                scale: {
                    min: String(question.scale?.min ?? 0),
                    max: String(question.scale?.max ?? 10),
                    step: String(question.scale?.step ?? 1)
                }
            }))
        );
    };

    const updateQuestion = (index: number, updates: Partial<QuestionForm>) => {
        setQuestions(prev => prev.map((question, idx) => (idx === index ? { ...question, ...updates } : question)));
    };

    const addQuestion = () => {
        setQuestions(prev => [...prev, defaultQuestion()]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(prev => prev.filter((_, idx) => idx !== index));
    };

    const addOption = (index: number) => {
        setQuestions(prev => prev.map((question, idx) => {
            if (idx !== index) return question;
            return { ...question, options: [...question.options, ''] };
        }));
    };

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        setQuestions(prev => prev.map((question, idx) => {
            if (idx !== questionIndex) return question;
            const options = [...question.options];
            options[optionIndex] = value;
            return { ...question, options };
        }));
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        setQuestions(prev => prev.map((question, idx) => {
            if (idx !== questionIndex) return question;
            const options = question.options.filter((_, optIdx) => optIdx !== optionIndex);
            return { ...question, options: options.length ? options : [''] };
        }));
    };

    const buildPayload = () => {
        return questions.map(question => {
            const payload: SurveyQuestion = {
                _id: question._id,
                text: question.text.trim(),
                description: question.description.trim(),
                type: question.type,
                required: question.required,
            };

            if (question.type === 'single' || question.type === 'multi') {
                const cleaned = question.options.map(option => option.trim()).filter(option => option.length > 0);
                payload.options = cleaned.map(option => ({ label: option, value: option }));
            }

            if (question.type === 'rating') {
                payload.scale = {
                    min: Number(question.scale.min || 0),
                    max: Number(question.scale.max || 10),
                    step: Number(question.scale.step || 1)
                };
            }

            return payload;
        });
    };

    const validateForm = () => {
        if (!title.trim()) {
            setError('Survey title is required.');
            return false;
        }
        for (const question of questions) {
            if (!question.text.trim()) {
                setError('All questions need text.');
                return false;
            }
            if ((question.type === 'single' || question.type === 'multi') && question.options.every(option => !option.trim())) {
                setError('Choice questions need at least one option.');
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleSaveSurvey = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError('User not authenticated');
                setSaving(false);
                return;
            }

            const payload = {
                title: title.trim(),
                isActive,
                questions: buildPayload()
            };

            const url = editingSurveyId
                ? `https://server.riyadah.app/api/surveys/${editingSurveyId}`
                : 'https://server.riyadah.app/api/surveys';

            const response = await fetch(url, {
                method: editingSurveyId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to save survey');
                setSaving(false);
                return;
            }

            await fetchSurveys();
            resetForm();
        } catch (err) {
            setError('Failed to save survey');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSurvey = async (surveyId: string) => {
        Alert.alert('Delete survey', 'Are you sure you want to delete this survey?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        if (!token) {
                            setError('User not authenticated');
                            return;
                        }

                        const response = await fetch(`https://server.riyadah.app/api/surveys/${surveyId}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            setError(errorData.error || 'Failed to delete survey');
                            return;
                        }

                        await fetchSurveys();
                        if (editingSurveyId === surveyId) {
                            resetForm();
                        }
                    } catch (err) {
                        setError('Failed to delete survey');
                    }
                }
            }
        ]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.pageHeader}>
                    <Image
                        source={require('../../assets/logo_white.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>Survey Manager</Text>
                    </View>
                </View>

                <ScrollView>
                    <View style={styles.contentContainer}>
                        {error ? (
                            <View style={styles.error}>
                                <View style={styles.errorIcon}></View>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{editingSurveyId ? 'Edit Survey' : 'Create Survey'}</Text>
                            {editingSurveyId ? (
                                <TouchableOpacity onPress={resetForm}>
                                    <Text style={styles.linkText}>New survey</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <Text style={styles.label}>Survey title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Survey title"
                            placeholderTextColor="#888"
                        />

                        <TouchableOpacity style={styles.toggleRow} onPress={() => setIsActive(prev => !prev)}>
                            <View style={[styles.toggleBox, isActive && styles.toggleBoxActive]}>
                                {isActive && <Feather name="check" size={16} color="#fff" />}
                            </View>
                            <Text style={styles.toggleLabel}>Set as active survey</Text>
                        </TouchableOpacity>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Questions</Text>
                            <TouchableOpacity onPress={addQuestion}>
                                <Text style={styles.linkText}>Add question</Text>
                            </TouchableOpacity>
                        </View>

                        {questions.map((question, index) => (
                            <View key={`${question._id || 'q'}-${index}`} style={styles.questionCard}>
                                <View style={styles.questionHeader}>
                                    <Text style={styles.questionTitle}>Question {index + 1}</Text>
                                    <TouchableOpacity onPress={() => removeQuestion(index)}>
                                        <Feather name="trash-2" size={18} color="#FF4400" />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={styles.input}
                                    value={question.text}
                                    onChangeText={(value) => updateQuestion(index, { text: value })}
                                    placeholder="Question text"
                                    placeholderTextColor="#888"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={question.description}
                                    onChangeText={(value) => updateQuestion(index, { description: value })}
                                    placeholder="Helper text (optional)"
                                    placeholderTextColor="#888"
                                />

                                <Text style={styles.label}>Question type</Text>
                                <View style={styles.inlineRow}>
                                    {['single', 'multi', 'rating', 'text', 'long-text'].map(item => (
                                        <TouchableOpacity
                                            key={item}
                                            style={[styles.chip, question.type === item && styles.activeChip]}
                                            onPress={() => updateQuestion(index, { type: item as QuestionForm['type'] })}
                                        >
                                            <Text style={[styles.chipText, question.type === item && styles.activeChipText]}>{item}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity style={styles.toggleRow} onPress={() => updateQuestion(index, { required: !question.required })}>
                                    <View style={[styles.toggleBox, question.required && styles.toggleBoxActive]}>
                                        {question.required && <Feather name="check" size={16} color="#fff" />}
                                    </View>
                                    <Text style={styles.toggleLabel}>Required</Text>
                                </TouchableOpacity>

                                {(question.type === 'single' || question.type === 'multi') && (
                                    <View style={styles.optionSection}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionTitle}>Options</Text>
                                            <TouchableOpacity onPress={() => addOption(index)}>
                                                <Text style={styles.linkText}>Add option</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {question.options.map((option, optionIndex) => (
                                            <View key={`${index}-option-${optionIndex}`} style={styles.optionRow}>
                                                <TextInput
                                                    style={[styles.input, styles.optionInput]}
                                                    value={option}
                                                    onChangeText={(value) => updateOption(index, optionIndex, value)}
                                                    placeholder={`Option ${optionIndex + 1}`}
                                                    placeholderTextColor="#888"
                                                />
                                                <TouchableOpacity onPress={() => removeOption(index, optionIndex)}>
                                                    <Feather name="x" size={16} color="#FF4400" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {question.type === 'rating' && (
                                    <View>
                                        <Text style={styles.label}>Scale settings</Text>
                                        <View style={styles.scaleRow}>
                                            <TextInput
                                                style={[styles.input, styles.scaleInput]}
                                                value={question.scale.min}
                                                onChangeText={(value) => updateQuestion(index, { scale: { ...question.scale, min: value } })}
                                                placeholder="Min"
                                                placeholderTextColor="#888"
                                                keyboardType="numeric"
                                            />
                                            <TextInput
                                                style={[styles.input, styles.scaleInput]}
                                                value={question.scale.max}
                                                onChangeText={(value) => updateQuestion(index, { scale: { ...question.scale, max: value } })}
                                                placeholder="Max"
                                                placeholderTextColor="#888"
                                                keyboardType="numeric"
                                            />
                                            <TextInput
                                                style={[styles.input, styles.scaleInput]}
                                                value={question.scale.step}
                                                onChangeText={(value) => updateQuestion(index, { scale: { ...question.scale, step: value } })}
                                                placeholder="Step"
                                                placeholderTextColor="#888"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveSurvey} disabled={saving}>
                            {saving && <ActivityIndicator size="small" color="#fff" />}
                            <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : editingSurveyId ? 'Update survey' : 'Create survey'}</Text>
                        </TouchableOpacity>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Existing surveys</Text>
                            {loading && <ActivityIndicator size="small" color="#FF4400" />}
                        </View>

                        {surveys.length === 0 && !loading ? (
                            <Text style={styles.hintText}>No surveys created yet.</Text>
                        ) : null}

                        {surveys.map(survey => (
                            <View key={survey._id} style={styles.surveyCard}>
                                <View style={styles.surveyHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.surveyTitle}>{survey.title}</Text>
                                        <Text style={styles.surveyMeta}>{survey.questions?.length || 0} questions</Text>
                                    </View>
                                    {survey.isActive && (
                                        <View style={styles.activeBadge}>
                                            <Text style={styles.activeBadgeText}>Active</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={styles.secondaryButton} onPress={() => startEditing(survey)}>
                                        <Text style={styles.secondaryButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.secondaryButton} onPress={() => handleDeleteSurvey(survey._id)}>
                                        <Text style={[styles.secondaryButtonText, { color: '#FF4400' }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 200,
    },
    logo: {
        width: 120,
        height: 40,
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 50,
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
    pageTitle: {
        color: '#ffffff',
        fontFamily: 'Qatar',
        fontSize: 30,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10
    },
    sectionTitle: {
        fontFamily: 'Qatar',
        fontSize: 18,
        color: '#111111'
    },
    linkText: {
        fontFamily: 'Acumin',
        color: '#FF4400'
    },
    label: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#111111',
        marginBottom: 5
    },
    input: {
        fontSize: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: '#000',
        color: 'black',
        borderRadius: 10,
        fontFamily: 'Acumin',
        marginBottom: 12
    },
    inlineRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#111111'
    },
    activeChip: {
        backgroundColor: '#111111'
    },
    chipText: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#111111'
    },
    activeChipText: {
        color: '#fff'
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10
    },
    toggleBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center'
    },
    toggleBoxActive: {
        backgroundColor: '#111111'
    },
    toggleLabel: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#111111'
    },
    questionCard: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
        backgroundColor: '#fafafa'
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    questionTitle: {
        fontFamily: 'Qatar',
        fontSize: 16,
        color: '#111111'
    },
    optionSection: {
        marginTop: 10
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    optionInput: {
        flex: 1
    },
    scaleRow: {
        flexDirection: 'row',
        gap: 10
    },
    scaleInput: {
        flex: 1
    },
    primaryButton: {
        backgroundColor: '#111111',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 10,
        marginBottom: 20
    },
    primaryButtonText: {
        color: '#fff',
        fontFamily: 'Qatar',
        fontSize: 16
    },
    surveyCard: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12
    },
    surveyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    surveyTitle: {
        fontFamily: 'Qatar',
        fontSize: 16,
        color: '#111111'
    },
    surveyMeta: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#666'
    },
    activeBadge: {
        backgroundColor: '#111111',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4
    },
    activeBadgeText: {
        color: '#fff',
        fontFamily: 'Acumin',
        fontSize: 12
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10
    },
    secondaryButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#111111'
    },
    secondaryButtonText: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#111111'
    },
    hintText: {
        fontFamily: 'Acumin',
        color: '#666',
        fontSize: 14,
        marginBottom: 20
    },
    error: {
        marginBottom: 15,
        backgroundColor: '#fce3e3',
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    errorIcon: {
        width: 3,
        height: 15,
        backgroundColor: 'red',
        borderRadius: 5,
        marginRight: 10,
        marginTop: 3
    },
    errorText: {
        color: 'red',
        fontFamily: 'Acumin',
    }
});
