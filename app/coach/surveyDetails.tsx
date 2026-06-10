import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
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

type SurveyQuestion = {
    _id: string;
    text: string;
};

type Survey = {
    _id: string;
    title: string;
    questions: SurveyQuestion[];
};

type SurveyResponse = {
    _id: string;
    user: { _id: string; name?: string; email?: string } | string;
    answers: { questionId: string; value: any }[];
    createdAt: string;
};

const formatAnswer = (value: any) => {
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    if (value && typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value ?? '');
};

export default function SurveyDetailsScreen() {
    const router = useRouter();
    const { isRTL, t, language } = useLanguage();
    const params = useLocalSearchParams();
    const surveyId = params.id as string;

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [responses, setResponses] = useState<SurveyResponse[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingResponses, setLoadingResponses] = useState(true);
    const [error, setError] = useState('');

    const [filterUserId, setFilterUserId] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');

    const questionMap = useMemo(() => {
        const map = new Map<string, string>();
        (survey?.questions || []).forEach(question => {
            map.set(question._id, question.text);
        });
        return map;
    }, [survey]);

    const fetchSurvey = async () => {
        if (!surveyId) return;
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError(t('coachSurvey.userNotAuthenticated'));
                setLoading(false);
                return;
            }

            const response = await fetch(`https://server.riyadah.app/api/surveys/${surveyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || t('coachSurvey.failedSurvey'));
                setLoading(false);
                return;
            }

            const data = await response.json();
            setSurvey(data.survey);
        } catch (err) {
            setError(t('coachSurvey.failedSurvey'));
        } finally {
            setLoading(false);
        }
    };

    const fetchResponses = async () => {
        if (!surveyId) return;
        setLoadingResponses(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError(t('coachSurvey.userNotAuthenticated'));
                setLoadingResponses(false);
                return;
            }

            const params = new URLSearchParams();
            if (filterUserId.trim()) params.append('userId', filterUserId.trim());
            if (filterFrom.trim()) params.append('from', filterFrom.trim());
            if (filterTo.trim()) params.append('to', filterTo.trim());

            const response = await fetch(
                `https://server.riyadah.app/api/surveys/${surveyId}/responses?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || t('coachSurvey.failedResponses'));
                setLoadingResponses(false);
                return;
            }

            const data = await response.json();
            setResponses(data.responses || []);
            setCount(data.count || 0);
        } catch (err) {
            setError(t('coachSurvey.failedResponses'));
        } finally {
            setLoadingResponses(false);
        }
    };

    useEffect(() => {
        fetchSurvey();
        fetchResponses();
    }, [surveyId]);

    const handleApplyFilters = () => {
        fetchResponses();
    };

    const handleClearFilters = () => {
        setFilterUserId('');
        setFilterFrom('');
        setFilterTo('');
        fetchResponses();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.pageHeader}>
                    <TouchableOpacity
                        onPress={() => {
                            router.replace({
                                pathname: '/profile',
                                params: { tab: 'Surveys' }
                            })
                        }}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>{t('coachSurvey.backToSurveys')}</Text>
                    </TouchableOpacity>

                    <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                        {loading && <Text style={styles.pageTitle}>{t('coachSurvey.title')}</Text>}

                        {!loading &&
                            <Text style={styles.pageTitle}>{survey?.title}</Text>
                        }

                        {/* {!loading && <Text style={styles.pageDesc}>{team?.sport}</Text>} */}

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

                    <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('coachSurvey.ghost')}</Text>
                </View>

                <ScrollView>
                    <View style={styles.contentContainer}>
                        {error ? (
                            <View style={[styles.error,isRTL&&{flexDirection:'row-reverse'}]}>
                                <View style={[styles.errorIcon,isRTL&&{marginRight:0,marginLeft:15}]}></View>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {loading && <ActivityIndicator size="small" color="#FF4000" />}

                        {false&&<View>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Filters</Text>
                                <TouchableOpacity onPress={handleClearFilters}>
                                    <Text style={styles.linkText}>Clear</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>User ID</Text>
                            <TextInput
                                style={styles.input}
                                value={filterUserId}
                                onChangeText={setFilterUserId}
                                placeholder="Filter by user ID"
                                placeholderTextColor="#888"
                            />

                            <Text style={styles.label}>From (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                value={filterFrom}
                                onChangeText={setFilterFrom}
                                placeholder="2025-01-01"
                                placeholderTextColor="#888"
                            />

                            <Text style={styles.label}>To (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                value={filterTo}
                                onChangeText={setFilterTo}
                                placeholder="2025-01-31"
                                placeholderTextColor="#888"
                            />

                            <TouchableOpacity style={styles.primaryButton} onPress={handleApplyFilters}>
                                <Text style={styles.primaryButtonText}>Apply filters</Text>
                            </TouchableOpacity>
                        </View>}

                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('coachSurvey.submissions')}</Text>
                            {loadingResponses && <ActivityIndicator size="small" color="#FF4000" />}
                        </View>

                        {!loadingResponses && responses.length === 0 && (
                            <Text style={[styles.hintText, isRTL && styles.rtlText]}>{t('coachSurvey.noSubmissions')}</Text>
                        )}

                        {responses.map(response => {
                            const user = typeof response.user === 'string' ? null : response.user;
                            return (
                                <View key={response._id} style={styles.card}>
                                    <Text style={styles.cardTitle}>
                                        {user?.name || t('coachSurvey.unknownUser')}
                                    </Text>
                                    <Text style={styles.cardMeta}>
                                        {user?.email || user?._id || response.user}
                                    </Text>
                                    <Text style={styles.cardMeta}>
                                        {new Date(response.createdAt).toLocaleString(language === 'ar' ? 'ar' : undefined)}
                                    </Text>
                                    <View style={styles.answerList}>
                                        {response.answers.map((answer, index) => (
                                            <View key={`${response._id}-answer-${index}`} style={styles.answerRow}>
                                                <Text style={styles.answerQuestion}>
                                                    {questionMap.get(answer.questionId) || t('coachSurvey.question')}
                                                </Text>
                                                <Text style={styles.answerValue}>{formatAnswer(answer.value)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            );
                        })}
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
top: Platform.OS == 'ios' ? 60 : 40,        left: 20,
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
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Acumin'
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
    primaryButton: {
        backgroundColor: '#111111',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 10
    },
    primaryButtonText: {
        color: '#fff',
        fontFamily: 'Qatar',
        fontSize: 16
    },
    card: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12
    },
    cardTitle: {
        fontFamily: 'Qatar',
        fontSize: 16,
        color: '#111111'
    },
    cardMeta: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#666'
    },
    answerList: {
        marginTop: 10,
        gap: 8
    },
    answerRow: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 8
    },
    answerQuestion: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#111111'
    },
    answerValue: {
        fontFamily: 'Acumin',
        fontSize: 13,
        color: '#333'
    },
    hintText: {
        fontFamily: 'Acumin',
        color: '#666',
        fontSize: 14,
        marginBottom: 20
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
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
    },
    ghostText: {
        fontSize:100,textTransform:'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        color:'#ff6633',
    maxHeight:200,
    lineHeight:200
    },
    ghostTextRtl: {
        right: undefined,
        left: -5,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 10,
        width:200,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtnText: {
        color: '#FFF',
        fontSize:18,
        fontFamily:'Qatar'
    },
});
