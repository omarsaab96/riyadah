import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker as RNPicker } from '@react-native-picker/picker';
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
    conditional?: {
        questionId?: string | null;
        values?: string[];
    };
};

type Survey = {
    _id: string;
    title: string;
    isActive: boolean;
    repeating?: { enabled: boolean; cadence: 'monthly' | 'post-training' | null };
    restrictedTo?: { scope: 'none' | 'club' | 'coach' | 'team'; refId: string | null };
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
    conditionalQuestionId: string;
    conditionalValues: string;
};

const defaultQuestion = (): QuestionForm => ({
    text: '',
    description: '',
    type: 'single',
    required: true,
    options: [''],
    scale: { min: '0', max: '10', step: '1' },
    conditionalQuestionId: '',
    conditionalValues: ''
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
    const [isRepeating, setIsRepeating] = useState(false);
    const [repeatCadence, setRepeatCadence] = useState<'monthly' | 'post-training'>('monthly');
    const [restrictionScope, setRestrictionScope] = useState<'none' | 'club' | 'coach' | 'team'>('none');
    const [restrictionRefId, setRestrictionRefId] = useState('');
    const [restrictionLabel, setRestrictionLabel] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
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
        setIsRepeating(false);
        setRepeatCadence('monthly');
        setRestrictionScope('none');
        setRestrictionRefId('');
        setRestrictionLabel('');
        setSearchKeyword('');
        setSearchResults([]);
        setQuestions([defaultQuestion()]);
        setError('');
    };

    const startEditing = (survey: Survey) => {
        setEditingSurveyId(survey._id);
        setTitle(survey.title);
        setIsActive(survey.isActive);
        setIsRepeating(Boolean(survey.repeating?.enabled));
        setRepeatCadence(survey.repeating?.cadence === 'post-training' ? 'post-training' : 'monthly');
        setRestrictionScope(survey.restrictedTo?.scope || 'none');
        setRestrictionRefId(survey.restrictedTo?.refId || '');
        setRestrictionLabel('');
        setSearchKeyword('');
        setSearchResults([]);
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
                },
                conditionalQuestionId: question.conditional?.questionId ? String(question.conditional.questionId) : '',
                conditionalValues: question.conditional?.values?.length ? question.conditional.values.join(', ') : ''
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

            if (question.conditionalQuestionId) {
                const values = question.conditionalValues
                    .split(',')
                    .map(value => value.trim())
                    .filter(Boolean);
                if (values.length > 0) {
                    payload.conditional = {
                        questionId: question.conditionalQuestionId,
                        values
                    };
                }
            }

            return payload;
        });
    };

    const validateForm = () => {
        if (!title.trim()) {
            setError('Survey title is required.');
            return false;
        }
        if (isRepeating && repeatCadence !== 'monthly' && repeatCadence !== 'post-training') {
            setError('Repeating cadence is required.');
            return false;
        }
        if (restrictionScope !== 'none' && !restrictionRefId) {
            setError('Restriction selection is required.');
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
                repeating: { enabled: isRepeating, cadence: isRepeating ? repeatCadence : null },
                restrictedTo: {
                    scope: restrictionScope,
                    refId: restrictionScope === 'none' ? null : restrictionRefId
                },
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

    const handleRestrictionSearchInput = (text: string) => {
        setSearchKeyword(text);
        if (text.trim().length < 3) {
            setSearchResults([]);
            return;
        }
        searchRestriction(text);
    };

    const searchRestriction = async (keyword: string) => {
        if (!keyword.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError('User not authenticated');
                setSearching(false);
                return;
            }

            let url = '';
            if (restrictionScope === 'club') {
                url = `https://server.riyadah.app/api/users/search?keyword=${encodeURIComponent(keyword)}&type=Club`;
            } else if (restrictionScope === 'coach') {
                url = `https://server.riyadah.app/api/users/search?keyword=${encodeURIComponent(keyword)}&role=Coach`;
            } else if (restrictionScope === 'team') {
                url = `https://server.riyadah.app/api/teams/search?keyword=${encodeURIComponent(keyword)}`;
            }

            if (!url) {
                setSearchResults([]);
                setSearching(false);
                return;
            }

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to search');
                setSearchResults([]);
                setSearching(false);
                return;
            }

            const data = await response.json();
            if (restrictionScope === 'team') {
                setSearchResults(data.teams || []);
            } else {
                setSearchResults(data || []);
            }
        } catch (err) {
            setError('Failed to search');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectRestriction = (item: any) => {
        setRestrictionRefId(item._id);
        setRestrictionLabel(item.name || item.email || item._id);
        setSearchResults([]);
        setSearchKeyword('');
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

                        <TouchableOpacity style={styles.toggleRow} onPress={() => setIsRepeating(prev => !prev)}>
                            <View style={[styles.toggleBox, isRepeating && styles.toggleBoxActive]}>
                                {isRepeating && <Feather name="check" size={16} color="#fff" />}
                            </View>
                            <Text style={styles.toggleLabel}>Repeating survey</Text>
                        </TouchableOpacity>

                        {isRepeating && (
                            <View style={styles.inlineRow}>
                                {['monthly', 'post-training'].map(item => (
                                    <TouchableOpacity
                                        key={item}
                                        style={[styles.chip, repeatCadence === item && styles.activeChip]}
                                        onPress={() => setRepeatCadence(item as 'monthly' | 'post-training')}
                                    >
                                        <Text style={[styles.chipText, repeatCadence === item && styles.activeChipText]}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Text style={styles.label}>Restriction</Text>
                        <View style={styles.inlineRow}>
                            {['none', 'club', 'coach', 'team'].map(item => (
                                <TouchableOpacity
                                    key={item}
                                    style={[styles.chip, restrictionScope === item && styles.activeChip]}
                                    onPress={() => {
                                        setRestrictionScope(item as 'none' | 'club' | 'coach' | 'team');
                                        setRestrictionRefId('');
                                        setRestrictionLabel('');
                                        setSearchKeyword('');
                                        setSearchResults([]);
                                    }}
                                >
                                    <Text style={[styles.chipText, restrictionScope === item && styles.activeChipText]}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {restrictionScope !== 'none' && (
                            <View style={styles.restrictionBox}>
                                <Text style={styles.hintText}>Search {restrictionScope} (min 3 characters)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={searchKeyword}
                                    onChangeText={handleRestrictionSearchInput}
                                    placeholder={`Search ${restrictionScope}`}
                                    placeholderTextColor="#888"
                                />
                                {searching && <ActivityIndicator size="small" color="#FF4400" />}

                                {restrictionRefId ? (
                                    <View style={styles.selectedRestriction}>
                                        <Text style={styles.selectedRestrictionText}>
                                            Selected: {restrictionLabel || restrictionRefId}
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setRestrictionRefId('');
                                            setRestrictionLabel('');
                                        }}>
                                            <Text style={styles.linkText}>Clear</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}

                                {searchResults.length > 0 && (
                                    <View style={styles.searchResults}>
                                        {searchResults.map(item => (
                                            <TouchableOpacity
                                                key={item._id}
                                                style={styles.searchResultItem}
                                                onPress={() => handleSelectRestriction(item)}
                                            >
                                                <Text style={styles.searchResultText}>
                                                    {item.name || item.email || item._id}
                                                </Text>
                                                <Text style={styles.searchResultSub}>{item._id}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

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

                                <Text style={styles.label}>Conditional display</Text>
                                <View style={styles.conditionalRow}>
                                    <View style={styles.conditionalPicker}>
                                        <RNPicker
                                            selectedValue={question.conditionalQuestionId}
                                            onValueChange={(value) => updateQuestion(index, { conditionalQuestionId: value })}
                                            style={styles.picker}
                                        >
                                            <RNPicker.Item label="Always show" value="" />
                                            {questions
                                                .slice(0, index)
                                                .filter(item => item._id)
                                                .map((item, idx) => (
                                                    <RNPicker.Item
                                                        key={`${item._id}-${idx}`}
                                                        label={item.text || `Question ${idx + 1}`}
                                                        value={String(item._id)}
                                                    />
                                                ))}
                                        </RNPicker>
                                    </View>
                                    <TextInput
                                        style={[styles.input, styles.conditionalInput]}
                                        value={question.conditionalValues}
                                        onChangeText={(value) => updateQuestion(index, { conditionalValues: value })}
                                        placeholder="Show if answer is (comma separated)"
                                        placeholderTextColor="#888"
                                    />
                                </View>
                                <Text style={styles.hintText}>
                                    Save the survey to enable conditional logic for new questions.
                                </Text>

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
                                        <Text style={styles.surveyMeta}>
                                            {survey.questions?.length || 0} questions
                                            {survey.repeating?.enabled && survey.repeating?.cadence ? ` - ${survey.repeating.cadence}` : ''}
                                            {survey.restrictedTo?.scope && survey.restrictedTo?.scope !== 'none' ? ` - ${survey.restrictedTo.scope}` : ''}
                                        </Text>
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
                                    <TouchableOpacity
                                        style={styles.secondaryButton}
                                        onPress={() => router.push({ pathname: '/manager/surveyDetails', params: { id: survey._id } })}
                                    >
                                        <Text style={styles.secondaryButtonText}>Submissions</Text>
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
    conditionalRow: {
        marginBottom: 12
    },
    conditionalPicker: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: '#F4F4F4'
    },
    conditionalInput: {
        marginBottom: 0
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
    restrictionBox: {
        marginBottom: 10
    },
    selectedRestriction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    selectedRestrictionText: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#111111'
    },
    searchResults: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10
    },
    searchResultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0'
    },
    searchResultText: {
        fontFamily: 'Acumin',
        fontSize: 13,
        color: '#111111'
    },
    searchResultSub: {
        fontFamily: 'Acumin',
        fontSize: 11,
        color: '#666'
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
