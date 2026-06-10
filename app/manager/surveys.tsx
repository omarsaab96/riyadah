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
import { useLanguage } from '../../context/language';

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
    const { isRTL, t, language } = useLanguage();
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
    const getCadenceLabel = (value: 'monthly' | 'post-training') => value === 'monthly' ? (language === 'ar' ? 'شهري' : 'Monthly') : (language === 'ar' ? 'بعد التدريب' : 'Post-training');
    const getRestrictionLabel = (value: 'none' | 'club' | 'coach' | 'team') => {
        if (value === 'none') return language === 'ar' ? 'بدون' : 'None';
        if (value === 'club') return language === 'ar' ? 'نادي' : 'Club';
        if (value === 'coach') return language === 'ar' ? 'مدرب' : 'Coach';
        return language === 'ar' ? 'فريق' : 'Team';
    };
    const getQuestionTypeLabel = (value: QuestionForm['type']) => {
        if (value === 'single') return language === 'ar' ? 'اختيار واحد' : 'Single choice';
        if (value === 'multi') return language === 'ar' ? 'اختيارات متعددة' : 'Multiple choice';
        if (value === 'rating') return language === 'ar' ? 'تقييم' : 'Rating';
        if (value === 'text') return language === 'ar' ? 'نص قصير' : 'Short text';
        return language === 'ar' ? 'نص طويل' : 'Long text';
    };

    const fetchSurveys = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError(t('managerSurvey.userNotAuthenticated'));
                setLoading(false);
                return;
            }

            const response = await fetch('https://server.riyadah.app/api/surveys', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || t('managerSurvey.failedLoad'));
                setLoading(false);
                return;
            }

            const data = await response.json();
            setSurveys(data.surveys || []);
        } catch (err) {
            setError(t('managerSurvey.failedLoad'));
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
            setError(t('managerSurvey.titleRequired'));
            return false;
        }
        if (isRepeating && repeatCadence !== 'monthly' && repeatCadence !== 'post-training') {
            setError(t('managerSurvey.cadenceRequired'));
            return false;
        }
        if (restrictionScope !== 'none' && !restrictionRefId) {
            setError(t('managerSurvey.restrictionRequired'));
            return false;
        }
        for (const question of questions) {
            if (!question.text.trim()) {
                setError(t('managerSurvey.questionsNeedText'));
                return false;
            }
            if ((question.type === 'single' || question.type === 'multi') && question.options.every(option => !option.trim())) {
                setError(t('managerSurvey.choicesNeedOption'));
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
                setError(t('managerSurvey.userNotAuthenticated'));
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
                setError(errorData.error || t('managerSurvey.failedSave'));
                setSaving(false);
                return;
            }

            await fetchSurveys();
            resetForm();
        } catch (err) {
            setError(t('managerSurvey.failedSave'));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSurvey = async (surveyId: string) => {
        Alert.alert(t('managerSurvey.deleteTitle'), t('managerSurvey.deleteMessage'), [
            { text: t('managerAthlete.cancel'), style: 'cancel' },
            {
                text: t('managerSurvey.delete'),
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        if (!token) {
                            setError(t('managerSurvey.userNotAuthenticated'));
                            return;
                        }

                        const response = await fetch(`https://server.riyadah.app/api/surveys/${surveyId}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            setError(errorData.error || t('managerSurvey.failedDelete'));
                            return;
                        }

                        await fetchSurveys();
                        if (editingSurveyId === surveyId) {
                            resetForm();
                        }
                    } catch (err) {
                        setError(t('managerSurvey.failedDelete'));
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
                setError(t('managerSurvey.userNotAuthenticated'));
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
                setError(errorData.error || t('managerSurvey.failedSearch'));
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
            setError(t('managerSurvey.failedSearch'));
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
                    <TouchableOpacity style={[styles.backButton, isRTL && styles.backButtonRtl]} onPress={() => router.back()}>
                        <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={20} color="#fff" />
                        <Text style={styles.backText}>{t('managerAthlete.back')}</Text>
                    </TouchableOpacity>

                    <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                        <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{t('managerSurvey.title')}</Text>
                    </View>
                </View>

                <ScrollView>
                    <View style={styles.contentContainer}>
                        {error ? (
                            <View style={[styles.error,isRTL&&{flexDirection:'row-reverse'}]}>
                                <View style={[styles.errorIcon,isRTL&&{marginRight:0,marginLeft:15}]}></View>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{editingSurveyId ? t('managerSurvey.editSurvey') : t('managerSurvey.createSurvey')}</Text>
                            {editingSurveyId ? (
                                <TouchableOpacity onPress={resetForm}>
                                    <Text style={styles.linkText}>{t('managerSurvey.newSurvey')}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <Text style={styles.label}>{t('managerSurvey.surveyTitle')}</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder={t('managerSurvey.surveyTitle')}
                            placeholderTextColor="#888"
                        />

                        <TouchableOpacity style={styles.toggleRow} onPress={() => setIsActive(prev => !prev)}>
                            <View style={[styles.toggleBox, isActive && styles.toggleBoxActive]}>
                                {isActive && <Feather name="check" size={16} color="#fff" />}
                            </View>
                            <Text style={styles.toggleLabel}>{t('managerSurvey.setActive')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toggleRow} onPress={() => setIsRepeating(prev => !prev)}>
                            <View style={[styles.toggleBox, isRepeating && styles.toggleBoxActive]}>
                                {isRepeating && <Feather name="check" size={16} color="#fff" />}
                            </View>
                            <Text style={styles.toggleLabel}>{t('managerSurvey.repeatingSurvey')}</Text>
                        </TouchableOpacity>

                        {isRepeating && (
                            <View style={[styles.inlineRow, isRTL && styles.inlineRowRtl]}>
                                {['monthly', 'post-training'].map(item => (
                                    <TouchableOpacity
                                        key={item}
                                        style={[styles.chip, repeatCadence === item && styles.activeChip]}
                                        onPress={() => setRepeatCadence(item as 'monthly' | 'post-training')}
                                    >
                                        <Text style={[styles.chipText, isRTL && styles.rtlText, repeatCadence === item && styles.activeChipText]}>{getCadenceLabel(item as 'monthly' | 'post-training')}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Text style={styles.label}>{t('managerSurvey.restriction')}</Text>
                        <View style={[styles.inlineRow, isRTL && styles.inlineRowRtl]}>
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
                                    <Text style={[styles.chipText, isRTL && styles.rtlText, restrictionScope === item && styles.activeChipText]}>{getRestrictionLabel(item as 'none' | 'club' | 'coach' | 'team')}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {restrictionScope !== 'none' && (
                            <View style={styles.restrictionBox}>
                                <Text style={[styles.hintText, isRTL && styles.rtlText]}>{t('managerSurvey.searchRestriction', { scope: getRestrictionLabel(restrictionScope) })}</Text>
                                <TextInput
                                    style={[styles.input, isRTL && styles.rtlText]}
                                    value={searchKeyword}
                                    onChangeText={handleRestrictionSearchInput}
                                    placeholder={t('managerSurvey.searchScope', { scope: getRestrictionLabel(restrictionScope) })}
                                    placeholderTextColor="#888"
                                />
                                {searching && <ActivityIndicator size="small" color="#FF4400" />}

                                {restrictionRefId ? (
                                    <View style={[styles.selectedRestriction, isRTL && styles.selectedRestrictionRtl]}>
                                        <Text style={[styles.selectedRestrictionText, isRTL && styles.rtlText]}>
                                            {t('managerSurvey.selectedRestriction', { label: restrictionLabel || restrictionRefId })}
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setRestrictionRefId('');
                                            setRestrictionLabel('');
                                        }}>
                                            <Text style={styles.linkText}>{t('managerSurvey.clear')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}

                                {searchResults.length > 0 && (
                                    <View style={styles.searchResults}>
                                        {searchResults.map(item => (
                                            <TouchableOpacity
                                                key={item._id}
                                                style={[styles.searchResultItem, isRTL && styles.searchResultItemRtl]}
                                                onPress={() => handleSelectRestriction(item)}
                                            >
                                                <Text style={[styles.searchResultText, isRTL && styles.rtlText]}>
                                                    {item.name || item.email || item._id}
                                                </Text>
                                                <Text style={[styles.searchResultSub, isRTL && styles.rtlText]}>{item._id}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('managerSurvey.questions')}</Text>
                            <TouchableOpacity onPress={addQuestion}>
                                <Text style={styles.linkText}>{t('managerSurvey.addQuestion')}</Text>
                            </TouchableOpacity>
                        </View>

                        {questions.map((question, index) => (
                            <View key={`${question._id || 'q'}-${index}`} style={styles.questionCard}>
                                <View style={styles.questionHeader}>
                                    <Text style={styles.questionTitle}>{t('managerSurvey.question', { index: index + 1 })}</Text>
                                    <TouchableOpacity onPress={() => removeQuestion(index)}>
                                        <Feather name="trash-2" size={18} color="#FF4400" />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={styles.input}
                                    value={question.text}
                                    onChangeText={(value) => updateQuestion(index, { text: value })}
                                    placeholder={t('managerSurvey.questionText')}
                                    placeholderTextColor="#888"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={question.description}
                                    onChangeText={(value) => updateQuestion(index, { description: value })}
                                    placeholder={t('managerSurvey.helperText')}
                                    placeholderTextColor="#888"
                                />

                                <Text style={styles.label}>{t('managerSurvey.questionType')}</Text>
                                <View style={[styles.inlineRow, isRTL && styles.inlineRowRtl]}>
                                    {['single', 'multi', 'rating', 'text', 'long-text'].map(item => (
                                        <TouchableOpacity
                                            key={item}
                                            style={[styles.chip, question.type === item && styles.activeChip]}
                                            onPress={() => updateQuestion(index, { type: item as QuestionForm['type'] })}
                                        >
                                            <Text style={[styles.chipText, isRTL && styles.rtlText, question.type === item && styles.activeChipText]}>{getQuestionTypeLabel(item as QuestionForm['type'])}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity style={styles.toggleRow} onPress={() => updateQuestion(index, { required: !question.required })}>
                                    <View style={[styles.toggleBox, question.required && styles.toggleBoxActive]}>
                                        {question.required && <Feather name="check" size={16} color="#fff" />}
                                    </View>
                                    <Text style={styles.toggleLabel}>{t('managerSurvey.required')}</Text>
                                </TouchableOpacity>

                                <Text style={styles.label}>{t('managerSurvey.conditionalDisplay')}</Text>
                                <View style={styles.conditionalRow}>
                                    <View style={styles.conditionalPicker}>
                                        <RNPicker
                                            selectedValue={question.conditionalQuestionId}
                                            onValueChange={(value) => updateQuestion(index, { conditionalQuestionId: value })}
                                            style={styles.picker}
                                        >
                                            <RNPicker.Item label={t('managerSurvey.alwaysShow')} value="" />
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
                                        placeholder={t('managerSurvey.conditionalAnswer')}
                                        placeholderTextColor="#888"
                                    />
                                </View>
                                <Text style={styles.hintText}>
                                    {t('managerSurvey.conditionalHint')}
                                </Text>

                                {(question.type === 'single' || question.type === 'multi') && (
                                    <View style={styles.optionSection}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionTitle}>{t('managerSurvey.options')}</Text>
                                            <TouchableOpacity onPress={() => addOption(index)}>
                                                <Text style={styles.linkText}>{t('managerSurvey.addOption')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {question.options.map((option, optionIndex) => (
                                            <View key={`${index}-option-${optionIndex}`} style={styles.optionRow}>
                                                <TextInput
                                                    style={[styles.input, styles.optionInput]}
                                                    value={option}
                                                    onChangeText={(value) => updateOption(index, optionIndex, value)}
                                                    placeholder={t('managerSurvey.option', { index: optionIndex + 1 })}
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
                                        <Text style={styles.label}>{t('managerSurvey.scaleSettings')}</Text>
                                        <View style={styles.scaleRow}>
                                            <TextInput
                                                style={[styles.input, styles.scaleInput]}
                                                value={question.scale.min}
                                                onChangeText={(value) => updateQuestion(index, { scale: { ...question.scale, min: value } })}
                                                placeholder={t('managerSurvey.min')}
                                                placeholderTextColor="#888"
                                                keyboardType="numeric"
                                            />
                                            <TextInput
                                                style={[styles.input, styles.scaleInput]}
                                                value={question.scale.max}
                                                onChangeText={(value) => updateQuestion(index, { scale: { ...question.scale, max: value } })}
                                                placeholder={t('managerSurvey.max')}
                                                placeholderTextColor="#888"
                                                keyboardType="numeric"
                                            />
                                            <TextInput
                                                style={[styles.input, styles.scaleInput]}
                                                value={question.scale.step}
                                                onChangeText={(value) => updateQuestion(index, { scale: { ...question.scale, step: value } })}
                                                placeholder={t('managerSurvey.step')}
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
                            <Text style={styles.primaryButtonText}>{saving ? t('managerAthlete.saving') : editingSurveyId ? t('managerSurvey.update') : t('managerSurvey.create')}</Text>
                        </TouchableOpacity>

                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('managerSurvey.existingSurveys')}</Text>
                            {loading && <ActivityIndicator size="small" color="#FF4400" />}
                        </View>

                        {surveys.length === 0 && !loading ? (
                            <Text style={styles.hintText}>{t('managerSurvey.noSurveys')}</Text>
                        ) : null}

                        {surveys.map(survey => (
                            <View key={survey._id} style={styles.surveyCard}>
                                <View style={styles.surveyHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.surveyTitle}>{survey.title}</Text>
                                        <Text style={[styles.surveyMeta, isRTL && styles.rtlText]}>
                                            {t('managerSurvey.questionsCount', { count: survey.questions?.length || 0 })}
                                            {survey.repeating?.enabled && survey.repeating?.cadence ? ` - ${getCadenceLabel(survey.repeating.cadence)}` : ''}
                                            {survey.restrictedTo?.scope && survey.restrictedTo?.scope !== 'none' ? ` - ${getRestrictionLabel(survey.restrictedTo.scope)}` : ''}
                                        </Text>
                                    </View>
                                    {survey.isActive && (
                                        <View style={styles.activeBadge}>
                                            <Text style={styles.activeBadgeText}>{t('managerSurvey.active')}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={styles.secondaryButton} onPress={() => startEditing(survey)}>
                                        <Text style={styles.secondaryButtonText}>{t('managerSurvey.editSurvey')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.secondaryButton}
                                        onPress={() => router.push({ pathname: '/manager/surveyDetails', params: { id: survey._id } })}
                                    >
                                        <Text style={styles.secondaryButtonText}>{t('managerSurvey.submissions')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.secondaryButton}
                                        onPress={() => router.push({ pathname: '/surveys/respond', params: { id: survey._id, preview: '1' } })}
                                    >
                                        <Text style={styles.secondaryButtonText}>{t('managerSurvey.preview')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.secondaryButton} onPress={() => handleDeleteSurvey(survey._id)}>
                                        <Text style={[styles.secondaryButtonText, { color: '#FF4400' }]}>{t('managerSurvey.delete')}</Text>
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
top: Platform.OS == 'ios' ? 60 : 40,
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
        maxWidth:200
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
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
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
    inlineRowRtl: {
        flexDirection: 'row-reverse',
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
    selectedRestrictionRtl: {
        flexDirection: 'row-reverse',
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
    searchResultItemRtl: {
        alignItems: 'flex-end',
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
        alignItems: 'stretch'
    },
    errorIcon: {
        width: 3,
        height: 15,
        backgroundColor: 'red',
        borderRadius: 5,
        marginRight: 10,
    },
    errorText: {
        color: 'red',
        fontFamily: 'Acumin',
    }
});

