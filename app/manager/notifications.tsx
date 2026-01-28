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
                setError('User not authenticated');
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
                setError('Failed to search');
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
            setError('Failed to search');
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
        const template = TYPE_TEMPLATES[notificationType];
        if (template) {
            setTitle(template.title);
            setBody(template.body);
        }
    };

    const applyRandom = () => {
        const template = TYPE_TEMPLATES[notificationType];
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
            setError('Select a target.');
            return;
        }

        if (targetMode === 'users' && selectedUsers.length === 0) {
            setError('Select at least one user.');
            return;
        }
        if (targetMode !== 'users' && targetMode !== 'sport' && !selectedTarget?._id) {
            setError('Select a target.');
            return;
        }
        if (targetMode === 'sport' && !selectedSport) {
            setError('Select a sport.');
            return;
        }

        let data = {};
        try {
            const trimmed = dataJson.trim();
            if (trimmed.length > 0) {
                data = JSON.parse(trimmed);
            }
        } catch (err) {
            setError('Data must be valid JSON.');
            return;
        }

        setSending(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError('User not authenticated');
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
                setError(errorData.error || 'Failed to send notifications');
                setSending(false);
                return;
            }

            const result = await response.json();
            setSuccess(`Sent ${result.sent || 0}/${result.total || 0} notifications.`);
        } catch (err) {
            setError('Failed to send notifications');
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
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>Notifications</Text>
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

                        <Text style={styles.sectionTitle}>Target</Text>
                        <View style={styles.inlineRow}>
                            {TARGET_MODES.map(item => (
                                <TouchableOpacity
                                    key={item.key}
                                    style={[styles.chip, targetMode === item.key && styles.activeChip]}
                                    onPress={() => setTargetMode(item.key)}
                                >
                                    <Text style={[styles.chipText, targetMode === item.key && styles.activeChipText]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {isSearchMode && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    value={searchKeyword}
                                    onChangeText={handleSearchInput}
                                    placeholder="Search by name or email"
                                    placeholderTextColor="#888"
                                />
                                {searching && <ActivityIndicator size="small" color="#FF4400" />}
                                {searchResults.length > 0 && (
                                    <View style={styles.searchResults}>
                                        {searchResults.map((item, idx) => (
                                            <TouchableOpacity
                                                key={`${item._id}-${idx}`}
                                                style={styles.searchResultItem}
                                                onPress={() => (targetMode === 'users' ? handleAddUser(item) : handleSelectTarget(item))}
                                            >
                                                <Text style={styles.searchResultText}>{item.name || item.title || item.email}</Text>
                                                {!!item.email && <Text style={styles.searchResultSub}>{item.email}</Text>}
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
                                    <RNPicker.Item label="Select a sport" value="" />
                                    {sports.map(sport => (
                                        <RNPicker.Item key={sport._id} label={sport.name} value={sport.name} />
                                    ))}
                                </RNPicker>
                            </View>
                        )}

                        {targetMode === 'users' && selectedUsers.length > 0 && (
                            <View style={styles.selectedList}>
                                {selectedUsers.map(user => (
                                    <View key={user._id} style={styles.selectedChip}>
                                        <Text style={styles.selectedChipText}>{user.name || user.email}</Text>
                                        <TouchableOpacity onPress={() => removeUser(user._id)}>
                                            <Feather name="x" size={14} color="#FF4400" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {targetMode !== 'users' && targetMode !== 'sport' && selectedTarget && (
                            <View style={styles.selectedSingle}>
                                <Text style={styles.selectedSingleText}>
                                    {selectedTarget.name || selectedTarget.title || selectedTarget.email}
                                </Text>
                                <TouchableOpacity onPress={() => setSelectedTarget(null)}>
                                    <Feather name="x" size={16} color="#FF4400" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <Text style={styles.sectionTitle}>Notification</Text>
                        <View style={styles.inlineRow}>
                            {NOTIFICATION_TYPES.map(item => (
                                <TouchableOpacity
                                    key={item.key}
                                    style={[styles.chip, notificationType === item.key && styles.activeChip]}
                                    onPress={() => setNotificationType(item.key)}
                                >
                                    <Text style={[styles.chipText, notificationType === item.key && styles.activeChipText]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.inlineRow}>
                            <TouchableOpacity style={styles.secondaryButton} onPress={applyTemplate}>
                                <Text style={styles.secondaryButtonText}>Use template</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryButton} onPress={applyRandom}>
                                <Text style={styles.secondaryButtonText}>Random test</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toggleRow} onPress={() => setRandomTest(prev => !prev)}>
                                <View style={[styles.toggleBox, randomTest && styles.toggleBoxActive]}>
                                    {randomTest && <Feather name="check" size={14} color="#fff" />}
                                </View>
                                <Text style={styles.toggleLabel}>Random</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Notification title"
                            placeholderTextColor="#888"
                        />

                        <Text style={styles.label}>Body</Text>
                        <TextInput
                            style={styles.textarea}
                            value={body}
                            onChangeText={setBody}
                            placeholder="Notification message"
                            placeholderTextColor="#888"
                            multiline
                        />

                        <Text style={styles.label}>Data (JSON)</Text>
                        <TextInput
                            style={styles.textarea}
                            value={dataJson}
                            onChangeText={setDataJson}
                            placeholder='{"screen":"survey","id":"..."}'
                            placeholderTextColor="#888"
                            multiline
                        />

                        <TouchableOpacity style={styles.primaryButton} onPress={handleSend} disabled={sending}>
                            {sending && <ActivityIndicator size="small" color="#fff" />}
                            <Text style={styles.primaryButtonText}>{sending ? 'Sending...' : 'Send notification'}</Text>
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
    sectionTitle: {
        fontFamily: 'Qatar',
        fontSize: 18,
        color: '#111111',
        marginTop: 10,
        marginBottom: 10
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
