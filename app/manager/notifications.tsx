import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker as RNPicker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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

const TARGET_MODES = [
    { key: 'user', label: 'User' },
    { key: 'users', label: 'Users' },
    { key: 'club', label: 'Club' },
    { key: 'team', label: 'Team' },
    { key: 'event', label: 'Event' },
    { key: 'coach', label: 'Coach' },
    { key: 'sport', label: 'Sport' }
];

const NOTIFICATION_TYPES = [
    { key: 'survey', label: 'Survey' },
    { key: 'event', label: 'Event' },
    { key: 'event_reminder', label: 'Event reminder' },
    { key: 'monthly_payment_reminder', label: 'Payment reminder' },
    { key: 'offer', label: 'Offer' },
    { key: 'post_like', label: 'Post like' },
    { key: 'post_comment', label: 'Post comment' },
    { key: 'team_member', label: 'Team member' },
    { key: 'team_coach', label: 'Team coach' },
    { key: 'chat_message', label: 'Chat message' },
    { key: 'info', label: 'Info' },
    { key: 'alert', label: 'Alert' },
    { key: 'system', label: 'System' }
];

const TYPE_TEMPLATES: Record<string, { title: string; body: string }> = {
    survey: { title: '📝 Survey', body: 'Please complete your survey.' },
    event: { title: '🗓️ Event', body: 'You have a new event scheduled.' },
    event_reminder: { title: '⏰ Event Reminder', body: 'Your event starts soon.' },
    monthly_payment_reminder: { title: '💳 Payment Reminder', body: 'Please note that your club membership fee is due today.' },
    offer: { title: '🎁 Offer', body: 'A new offer is available for you.' },
    post_like: { title: '❤️ New Like', body: 'Someone liked your post.' },
    post_comment: { title: '🗨️ New Comment', body: 'Someone commented on your post.' },
    team_member: { title: '👥 Added as member', body: 'You have been added to a team.' },
    team_coach: { title: '📋 Added as coach', body: 'You have been assigned to coach a team.' },
    chat_message: { title: '💬 New Message', body: 'You have a new message.' },
    info: { title: 'ℹ️ Info', body: 'Here is an update.' },
    alert: { title: '⚠️ Alert', body: 'Please take action.' },
    system: { title: '⚙️ System Notice', body: 'System update.' }
};

export default function ManagerNotificationsScreen() {
    const router = useRouter();
    const { isRTL, t, language } = useLanguage();
    const [targetMode, setTargetMode] = useState('user');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [sports, setSports] = useState<any[]>([]);
    const [selectedSport, setSelectedSport] = useState('');

    const [notificationType, setNotificationType] = useState('survey');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [dataJson, setDataJson] = useState('{}');
    const [randomTest, setRandomTest] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isSearchMode = useMemo(() => ['user', 'users', 'club', 'team', 'event', 'coach'].includes(targetMode), [targetMode]);
    const targetModes = useMemo(() => ([
        { key: 'user', label: language === 'ar' ? 'مستخدم' : 'User' },
        { key: 'users', label: language === 'ar' ? 'مستخدمون' : 'Users' },
        { key: 'club', label: language === 'ar' ? 'نادي' : 'Club' },
        { key: 'team', label: language === 'ar' ? 'فريق' : 'Team' },
        { key: 'event', label: language === 'ar' ? 'فعالية' : 'Event' },
        { key: 'coach', label: language === 'ar' ? 'مدرب' : 'Coach' },
        { key: 'sport', label: language === 'ar' ? 'رياضة' : 'Sport' }
    ]), [language]);
    const notificationTypes = useMemo(() => ([
        { key: 'survey', label: language === 'ar' ? 'استبيان' : 'Survey' },
        { key: 'event', label: language === 'ar' ? 'فعالية' : 'Event' },
        { key: 'event_reminder', label: language === 'ar' ? 'تذكير فعالية' : 'Event reminder' },
        { key: 'monthly_payment_reminder', label: language === 'ar' ? 'تذكير دفع' : 'Payment reminder' },
        { key: 'offer', label: language === 'ar' ? 'عرض' : 'Offer' },
        { key: 'post_like', label: language === 'ar' ? 'إعجاب بمنشور' : 'Post like' },
        { key: 'post_comment', label: language === 'ar' ? 'تعليق على منشور' : 'Post comment' },
        { key: 'team_member', label: language === 'ar' ? 'عضو فريق' : 'Team member' },
        { key: 'team_coach', label: language === 'ar' ? 'مدرب فريق' : 'Team coach' },
        { key: 'chat_message', label: language === 'ar' ? 'رسالة محادثة' : 'Chat message' },
        { key: 'info', label: language === 'ar' ? 'معلومة' : 'Info' },
        { key: 'alert', label: language === 'ar' ? 'تنبيه' : 'Alert' },
        { key: 'system', label: language === 'ar' ? 'نظام' : 'System' }
    ]), [language]);
    const getTemplate = (type: string) => {
        const templates: Record<string, { title: string; body: string }> = {
            survey: { title: language === 'ar' ? 'استبيان جديد' : 'New survey', body: language === 'ar' ? 'يرجى إكمال الاستبيان الخاص بك.' : 'Please complete your survey.' },
            event: { title: language === 'ar' ? 'فعالية جديدة' : 'New event', body: language === 'ar' ? 'لديك فعالية جديدة مجدولة.' : 'You have a new event scheduled.' },
            event_reminder: { title: language === 'ar' ? 'تذكير بالفعالية' : 'Event reminder', body: language === 'ar' ? 'ستبدأ فعاليتك قريبًا.' : 'Your event starts soon.' },
            monthly_payment_reminder: { title: language === 'ar' ? 'تذكير بالدفع' : 'Payment reminder', body: language === 'ar' ? 'رسوم عضوية النادي مستحقة اليوم.' : 'Your club membership fee is due today.' },
            offer: { title: language === 'ar' ? 'عرض جديد' : 'New offer', body: language === 'ar' ? 'هناك عرض جديد متاح لك.' : 'A new offer is available for you.' },
            post_like: { title: language === 'ar' ? 'إعجاب جديد' : 'New like', body: language === 'ar' ? 'أعجب أحدهم بمنشورك.' : 'Someone liked your post.' },
            post_comment: { title: language === 'ar' ? 'تعليق جديد' : 'New comment', body: language === 'ar' ? 'علّق أحدهم على منشورك.' : 'Someone commented on your post.' },
            team_member: { title: language === 'ar' ? 'تمت إضافتك كعضو' : 'Added as member', body: language === 'ar' ? 'تمت إضافتك إلى فريق.' : 'You have been added to a team.' },
            team_coach: { title: language === 'ar' ? 'تم تعيينك كمدرب' : 'Added as coach', body: language === 'ar' ? 'تم تعيينك لتدريب فريق.' : 'You have been assigned to coach a team.' },
            chat_message: { title: language === 'ar' ? 'رسالة جديدة' : 'New message', body: language === 'ar' ? 'لديك رسالة جديدة.' : 'You have a new message.' },
            info: { title: language === 'ar' ? 'معلومة' : 'Info', body: language === 'ar' ? 'إليك تحديث جديد.' : 'Here is an update.' },
            alert: { title: language === 'ar' ? 'تنبيه' : 'Alert', body: language === 'ar' ? 'يرجى اتخاذ إجراء.' : 'Please take action.' },
            system: { title: language === 'ar' ? 'إشعار نظام' : 'System notice', body: language === 'ar' ? 'يوجد تحديث للنظام.' : 'System update.' }
        };
        return templates[type];
    };

    useEffect(() => {
        if (targetMode === 'sport') {
            fetchSports();
        }
        setSearchKeyword('');
        setSearchResults([]);
        setSelectedTarget(null);
        setSelectedUsers([]);
        setSelectedSport('');
        setError('');
        setSuccess('');
    }, [targetMode]);

    const fetchSports = async () => {
        try {
            const response = await fetch('https://server.riyadah.app/api/sports');
            if (!response.ok) return;
            const data = await response.json();
            setSports(data?.data || []);
        } catch (err) {
            // ignore
        }
    };

    const handleSearchInput = (text: string) => {
        setSearchKeyword(text);
        if (text.trim().length < 3) {
            setSearchResults([]);
            return;
        }
        searchTargets(text);
    };

    const searchTargets = async (keyword: string) => {
        if (!keyword.trim()) return;
        setSearching(true);
        setError('');
        setSuccess('');
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError(t('coachSurvey.userNotAuthenticated'));
                setSearching(false);
                return;
            }

            let url = '';
            if (targetMode === 'user' || targetMode === 'users') {
                url = `https://server.riyadah.app/api/users/search?keyword=${encodeURIComponent(keyword)}`;
            } else if (targetMode === 'club') {
                url = `https://server.riyadah.app/api/users/search?keyword=${encodeURIComponent(keyword)}&type=Club`;
            } else if (targetMode === 'coach') {
                url = `https://server.riyadah.app/api/users/search?keyword=${encodeURIComponent(keyword)}&role=Coach`;
            } else if (targetMode === 'team') {
                url = `https://server.riyadah.app/api/teams/search?keyword=${encodeURIComponent(keyword)}`;
            } else if (targetMode === 'event') {
                url = `https://server.riyadah.app/api/search?category=Events&keyword=${encodeURIComponent(keyword)}&limit=20`;
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
                setError(t('manager.failedSearch'));
                setSearchResults([]);
                setSearching(false);
                return;
            }

            const data = await response.json();
            if (targetMode === 'team') {
                setSearchResults(data.teams || []);
            } else if (targetMode === 'event') {
                setSearchResults(data.events || []);
            } else {
                setSearchResults(data || []);
            }
        } catch (err) {
            setError(t('manager.failedSearch'));
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectTarget = (item: any) => {
        setSelectedTarget(item);
        setSearchKeyword('');
        setSearchResults([]);
    };

    const handleAddUser = (user: any) => {
        setSelectedUsers(prev => {
            if (prev.some(item => item._id === user._id)) return prev;
            return [...prev, user];
        });
        setSearchKeyword('');
        setSearchResults([]);
    };

    const removeUser = (userId: string) => {
        setSelectedUsers(prev => prev.filter(item => item._id !== userId));
    };

    const applyTemplate = () => {
        const template = getTemplate(notificationType);
        if (template) {
            setTitle(template.title);
            setBody(template.body);
        }
    };

    const applyRandom = () => {
        const template = getTemplate(notificationType);
        if (!template) return;
        setTitle(template.title);
        setBody(template.body);
        setRandomTest(true);
    };

    const buildTargetPayload = () => {
        if (targetMode === 'user') return { mode: 'user', userId: selectedTarget?._id };
        if (targetMode === 'users') return { mode: 'users', userIds: selectedUsers.map(item => item._id) };
        if (targetMode === 'club') return { mode: 'club', clubId: selectedTarget?._id };
        if (targetMode === 'team') return { mode: 'team', teamId: selectedTarget?._id };
        if (targetMode === 'coach') return { mode: 'coach', coachId: selectedTarget?._id };
        if (targetMode === 'event') return { mode: 'event', eventId: selectedTarget?._id };
        if (targetMode === 'sport') return { mode: 'sport', sport: selectedSport };
        return { mode: '' };
    };

    const handleSend = async () => {
        setError('');
        setSuccess('');

        const targetPayload = buildTargetPayload();
        if (!targetPayload.mode) {
            setError(t('manager.selectTarget'));
            return;
        }

        if (targetMode === 'users' && selectedUsers.length === 0) {
            setError(t('manager.selectAtLeastOneUser'));
            return;
        }
        if (targetMode !== 'users' && targetMode !== 'sport' && !selectedTarget?._id) {
            setError(t('manager.selectTarget'));
            return;
        }
        if (targetMode === 'sport' && !selectedSport) {
            setError(t('manager.selectSport'));
            return;
        }

        let data = {};
        try {
            const trimmed = dataJson.trim();
            if (trimmed.length > 0) {
                data = JSON.parse(trimmed);
            }
        } catch (err) {
            setError(t('manager.invalidJson'));
            return;
        }

        setSending(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError(t('coachSurvey.userNotAuthenticated'));
                setSending(false);
                return;
            }

            const payload = {
                target: targetPayload,
                notification: {
                    type: notificationType,
                    title: title.trim(),
                    body: body.trim(),
                    data,
                    random: randomTest
                }
            };

            const response = await fetch('https://server.riyadah.app/api/notifications/manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || t('manager.failedSendNotifications'));
                setSending(false);
                return;
            }

            const result = await response.json();
            setSuccess(t('manager.sentNotifications', { sent: result.sent || 0, total: result.total || 0 }));
        } catch (err) {
            setError(t('manager.failedSendNotifications'));
        } finally {
            setSending(false);
        }
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
                        <Text style={styles.backText}>{t('manager.back')}</Text>
                    </TouchableOpacity>

                    <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                        <Text style={[styles.pageTitle, isRTL && styles.rtlText]}>{t('manager.notifications')}</Text>
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
                        {success ? (
                            <View style={styles.success}>
                                <Text style={styles.successText}>{success}</Text>
                            </View>
                        ) : null}

                        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('manager.target')}</Text>
                        <View style={[styles.inlineRow, isRTL && styles.inlineRowRtl]}>
                            {targetModes.map(item => (
                                <TouchableOpacity
                                    key={item.key}
                                    style={[styles.chip, targetMode === item.key && styles.activeChip]}
                                    onPress={() => setTargetMode(item.key)}
                                >
                                    <Text style={[styles.chipText, isRTL && styles.rtlText, targetMode === item.key && styles.activeChipText]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {isSearchMode && (
                            <>
                                <TextInput
                                    style={[styles.input, isRTL && styles.rtlText]}
                                    value={searchKeyword}
                                    onChangeText={handleSearchInput}
                                    placeholder={t('manager.searchPlaceholder')}
                                    placeholderTextColor="#888"
                                />
                                {searching && <ActivityIndicator size="small" color="#FF4400" />}
                                {searchResults.length > 0 && (
                                    <View style={styles.searchResults}>
                                        {searchResults.map((item, idx) => (
                                            <TouchableOpacity
                                                key={`${item._id}-${idx}`}
                                                style={[styles.searchResultItem, isRTL && styles.searchResultItemRtl]}
                                                onPress={() => (targetMode === 'users' ? handleAddUser(item) : handleSelectTarget(item))}
                                            >
                                                <Text style={[styles.searchResultText, isRTL && styles.rtlText]}>{item.name || item.title || item.email}</Text>
                                                {!!item.email && <Text style={[styles.searchResultSub, isRTL && styles.rtlText]}>{item.email}</Text>}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}

                        {targetMode === 'sport' && (
                            <View style={styles.pickerWrapper}>
                                <RNPicker
                                    selectedValue={selectedSport}
                                    onValueChange={(value) => setSelectedSport(value)}
                                    style={styles.picker}
                                >
                                    <RNPicker.Item label={t('manager.selectSportPlaceholder')} value="" />
                                    {sports.map(sport => (
                                        <RNPicker.Item key={sport._id} label={sport.name} value={sport.name} />
                                    ))}
                                </RNPicker>
                            </View>
                        )}

                        {targetMode === 'users' && selectedUsers.length > 0 && (
                            <View style={[styles.selectedList, isRTL && styles.inlineRowRtl]}>
                                {selectedUsers.map(user => (
                                    <View key={user._id} style={[styles.selectedChip, isRTL && styles.selectedChipRtl]}>
                                        <Text style={[styles.selectedChipText, isRTL && styles.rtlText]}>{user.name || user.email}</Text>
                                        <TouchableOpacity onPress={() => removeUser(user._id)}>
                                            <Feather name="x" size={14} color="#FF4400" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {targetMode !== 'users' && targetMode !== 'sport' && selectedTarget && (
                            <View style={[styles.selectedSingle, isRTL && styles.selectedSingleRtl]}>
                                <Text style={[styles.selectedSingleText, isRTL && styles.rtlText]}>
                                    {selectedTarget.name || selectedTarget.title || selectedTarget.email}
                                </Text>
                                <TouchableOpacity onPress={() => setSelectedTarget(null)}>
                                    <Feather name="x" size={16} color="#FF4400" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('manager.notification')}</Text>
                        <View style={[styles.inlineRow, isRTL && styles.inlineRowRtl]}>
                            {notificationTypes.map(item => (
                                <TouchableOpacity
                                    key={item.key}
                                    style={[styles.chip, notificationType === item.key && styles.activeChip]}
                                    onPress={() => setNotificationType(item.key)}
                                >
                                    <Text style={[styles.chipText, isRTL && styles.rtlText, notificationType === item.key && styles.activeChipText]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={[styles.inlineRow, isRTL && styles.inlineRowRtl]}>
                            <TouchableOpacity style={styles.secondaryButton} onPress={applyTemplate}>
                                <Text style={styles.secondaryButtonText}>{t('manager.useTemplate')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryButton} onPress={applyRandom}>
                                <Text style={styles.secondaryButtonText}>{t('manager.randomTest')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.toggleRow, isRTL && styles.toggleRowRtl]} onPress={() => setRandomTest(prev => !prev)}>
                                <View style={[styles.toggleBox, randomTest && styles.toggleBoxActive]}>
                                    {randomTest && <Feather name="check" size={14} color="#fff" />}
                                </View>
                                <Text style={styles.toggleLabel}>{t('manager.random')}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>{t('manager.title')}</Text>
                        <TextInput
                            style={[styles.input, isRTL && styles.rtlText]}
                            value={title}
                            onChangeText={setTitle}
                            placeholder={t('manager.notificationTitlePlaceholder')}
                            placeholderTextColor="#888"
                        />

                        <Text style={styles.label}>{t('manager.body')}</Text>
                        <TextInput
                            style={[styles.textarea, isRTL && styles.rtlText]}
                            value={body}
                            onChangeText={setBody}
                            placeholder={t('manager.notificationBodyPlaceholder')}
                            placeholderTextColor="#888"
                            multiline
                        />

                        <Text style={styles.label}>{t('manager.dataJson')}</Text>
                        <TextInput
                            style={[styles.textarea, isRTL && styles.rtlText]}
                            value={dataJson}
                            onChangeText={setDataJson}
                            placeholder='{"screen":"survey","id":"..."}'
                            placeholderTextColor="#888"
                            multiline
                        />

                        <TouchableOpacity style={styles.primaryButton} onPress={handleSend} disabled={sending}>
                            {sending && <ActivityIndicator size="small" color="#fff" />}
                            <Text style={styles.primaryButtonText}>{sending ? t('manager.sendingNotification') : t('manager.sendNotification')}</Text>
                        </TouchableOpacity>
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
        left: undefined,
        right: 20,
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
    sectionTitle: {
        fontFamily: 'Qatar',
        fontSize: 18,
        color: '#111111',
        marginTop: 10,
        marginBottom: 10
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
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
    textarea: {
        fontSize: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: '#000',
        color: 'black',
        borderRadius: 10,
        fontFamily: 'Acumin',
        marginBottom: 12,
        height: 90,
        textAlignVertical: 'top'
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
    selectedSingle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10
    },
    selectedSingleRtl: {
        flexDirection: 'row-reverse',
    },
    selectedSingleText: {
        fontFamily: 'Acumin',
        fontSize: 13,
        color: '#111111'
    },
    selectedList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10
    },
    selectedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 16
    },
    selectedChipRtl: {
        flexDirection: 'row-reverse',
    },
    selectedChipText: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#111111'
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
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    toggleRowRtl: {
        flexDirection: 'row-reverse',
    },
    toggleBox: {
        width: 18,
        height: 18,
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
        fontSize: 12,
        color: '#111111'
    },
    pickerWrapper: {
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F4F4F4',
        marginBottom: 12
    },
    picker: {
        height: 44
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
    success: {
        marginBottom: 15,
        backgroundColor: '#e6f6ec',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8
    },
    successText: {
        color: '#1b6b39',
        fontFamily: 'Acumin',
    }
});
