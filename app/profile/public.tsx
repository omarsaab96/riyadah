import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Linking,
    Platform,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CountryFlag from "react-native-country-flag";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLanguage } from '../../context/language';

const { width } = Dimensions.get('window');

export default function PublicProfile() {
    const { isRTL, t } = useLanguage();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const scrollY = useRef(new Animated.Value(0)).current;
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [staff, setStaff] = useState([]);
    const [userCoachOf, setUserCoachOf] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [staffLoading, setStaffLoading] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Profile');
    const [adminUser, setAdminUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const tabs = ['Profile', 'Teams', 'Schedule'];
    const textDirectionStyle = isRTL ? styles.rtlText : styles.ltrText;
    const translateTabLabel = (label: string) => {
        const tabKeyMap: Record<string, any> = {
            Profile: 'profile.profile',
            Teams: 'profile.teams',
            Schedule: 'profile.schedule',
        };

        return tabKeyMap[label] ? t(tabKeyMap[label]) : label;
    };

    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // 0-11
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    const [calendarDays, setCalendarDays] = useState([]);
    const generateCalendarDays = (year, month, events = []) => {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = endOfMonth.getDate();
        const firstDayIndex = startOfMonth.getDay(); // Sunday = 0

        const days = [];

        for (let i = 0; i < firstDayIndex; i++) {
            days.push(null); // Fill empty cells
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEvent = events.some(e => {
                const eventDate = new Date(e.date);
                const eventStr = eventDate.toISOString().split('T')[0];
                return eventStr === dateStr;
            });

            days.push({ day, dateStr, hasEvent });
        }

        return days;
    };

    useEffect(() => {
        if (schedule) {
            const updatedDays = generateCalendarDays(calendarYear, calendarMonth, schedule);
            setCalendarDays(updatedDays);
        }
    }, [calendarMonth, calendarYear, schedule]);

    // Graph data
    const data = [
        { label: 'Attack', value: user?.skills?.attack },
        { label: 'Defense', value: user?.skills?.defense },
        { label: 'Speed', value: user?.skills?.speed },
        { label: 'Stamina', value: user?.skills?.stamina },
        { label: 'Skill', value: user?.skills?.skill }
    ];

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 300],
        outputRange: [300, 195],
        extrapolate: 'clamp',
    });

    const logoOpacity = scrollY.interpolate({
        inputRange: [0, 300],
        outputRange: [1, -1],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`https://server.riyadah.app/api/users/${id}`);

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);

                    if (userData.role == "Coach") {
                        const coachteams = await fetch(`https://server.riyadah.app/api/teams/byCoach/${userData._id}`);

                        if (coachteams.ok) {
                            const coachdata = await coachteams.json();
                            setUserCoachOf(coachdata.data);
                        } else {
                            console.log('Could not get teams of coach');
                        }
                    }
                } else {
                    console.error('API error');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    useEffect(() => {
        if (user) {
            getAdminInfo();
        }
    }, [user]);

    const getAdminInfo = async () => {
        if (user.type == "Club" && user.admin?.email) {
            try {
                const res = await fetch(`https://server.riyadah.app/api/users/findAdmin?email=${user.admin.email}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await res.json();

                if (data.success) {
                    setAdminUser(data.admin);
                }
            } catch (err) {
                console.error('Failed to fetch admin info', err);
            }
        }
    }

    const getTeams = async () => {
        if (user.type == "Club") {
            const token = await SecureStore.getItemAsync('userToken');
            try {
                const res = await fetch(`https://server.riyadah.app/api/teams/club/${user._id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const response = await res.json();

                // console.log(response)

                if (response.success) {
                    setTeams(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch teams', err);
            } finally {
                setTeamsLoading(false);
            }
        }
    }

    const getSchedule = async ({ team = null, startDate = null, endDate = null, eventType = null } = {}) => {
        if (user.type === "Club") {
            try {
                const params = new URLSearchParams();

                if (team) params.append('team', team);
                if (eventType) params.append('eventType', eventType);
                if (startDate && endDate) {
                    params.append('startDate', startDate);
                    params.append('endDate', endDate);
                }

                const token = await SecureStore.getItemAsync("token");
                const res = await fetch(`https://server.riyadah.app/api/schedules/club/${user._id}?${params.toString()}`);

                const response = await res.json();

                if (response.success) {
                    setSchedule(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch schedule', err);
            } finally {
                setScheduleLoading(false);
            }
        }
    };

    const getStaff = async () => {
        if (user.type == "Club") {
            try {
                const response = await fetch(`https://server.riyadah.app/api/staff/byClub/${user._id}`);
                const data = await response.json();

                if (response.ok) {
                    setStaff(data);
                }
            } catch (err) {
                console.error('Failed to fetch staff', err);
            } finally {
                setStaffLoading(false);
            }
        }
    };

    const getInventory = async () => {
        if (user?.type === "Club") {
            try {
                const response = await fetch(`https://server.riyadah.app/api/inventory/byClub/${user._id}`);
                const data = await response.json();

                if (response.ok) {
                    setInventory(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch inventory', err);
            } finally {
                setInventoryLoading(false);
            }
        }
    };

    const updateTab = (label: string) => {
        setActiveTab(label);

        if (label == "Teams") {
            setTeamsLoading(true);
            getTeams();
        }

        if (label == "Schedule") {
            setScheduleLoading(true);
            getSchedule();
        }

        if (label == "Staff") {
            setStaffLoading(true);
            getStaff();
        }

        if (label == "Inventory") {
            setInventoryLoading(true);
            getInventory();
        }
    }

    const handleShareProfile = async () => {
        const url = `https://riyadah.app/profile/public/${user._id}`;
        try {
            const result = await Share.share({
                message: `Check out ${user?.name || t('profile.defaultTitle')}'s profile on Riyadah!\n${url}`,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    console.log('Post shared');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing post:', error.message);
        }
    };

    const createChat = async (participantId: string) => {

        if (!participantId) {
            Alert.alert('Error', 'Please select a user to start a chat with');
            return;
        }

        setChatLoading(true);
        const token = await SecureStore.getItemAsync('userToken');

        try {
            const res = await fetch('https://server.riyadah.app/api/chats/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ participantId })
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/chat?chatId=${data._id}`)
            } else {
                Alert.alert('Error', data.message || 'Failed to create chat');
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.pageHeader, { height: headerHeight }]}>
                {/* <Animated.Image
                    source={require('../../assets/logo_white.png')}
                    style={[styles.logo, { opacity: logoOpacity }]}
                    resizeMode="contain"
                /> */}

                <TouchableOpacity
                    onPress={() => {
                        router.back()
                    }}
                    style={[styles.backBtn, isRTL && styles.backBtnRtl]}
                >
                    <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={20} color="#ffffff" />
                    <Text style={[styles.backBtnText, textDirectionStyle]}>{t('auth.back')}</Text>
                </TouchableOpacity>

                <View style={[styles.headerTextBlock]}>
                    <Text style={isRTL&&{textAlign:'right'}}>
                        {user && user.accountBadge && <MaterialIcons name="verified" size={24} color="white" />}
                    </Text>
                    <Text style={[styles.pageTitle, textDirectionStyle]}>{user?.name || t('profile.defaultTitle')}</Text>
                    {!loading && <Text style={[styles.pageDesc, textDirectionStyle]}>
                        {user?.type} {user?.role ? `/ ${user.role}` : ''}
                    </Text>}

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

                {!loading && user?.name && <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{user.name.substring(0, 6)}</Text>}

                {!loading && user && (
                    <View style={[styles.profileImage, isRTL && styles.rtlprofileImage]}>
                        {(user.image == null || user.image == "") && user.type == "Club" && (
                            <Image
                                source={require('../../assets/clublogo.png')}
                                style={[styles.profileImageAvatar, { transform: [{ translateX: -10 }] }]}
                                resizeMode="contain"
                            />
                        )}
                        {(user.image == null || user.image == "") && user.gender == "Male" && (
                            <Image
                                source={require('../../assets/avatar.png')}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />
                        )}
                        {(user.image == null || user.image == "") && user.gender == "Female" && (
                            <Image
                                source={require('../../assets/avatarF.png')}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />
                        )}
                        {user.image != null && (
                            <Image
                                source={{ uri: user.image }}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                )}
            </Animated.View>

            {/* Tabs for clubs */}
            {!loading && user?.type === "Club" && (
                <View style={styles.tabs}>
                    {tabs.map((label) => (
                        <TouchableOpacity
                            key={label}
                            style={[
                                styles.tab,
                                activeTab === label && styles.activeTab,
                            ]}
                            onPress={() => updateTab(label)}
                        >
                            <Text style={[styles.tabText, activeTab === label && styles.tabTextActive, textDirectionStyle]}>
                                {translateTabLabel(label)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* profileTab */}
            {!loading && user && activeTab == "Profile" && (
                <Animated.ScrollView
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    <View style={styles.contentContainer}>
                        {user.type == "Club" && user.admin?.email != null && (
                            <View style={styles.adminDiv}>
                                <Text style={[styles.title, styles.contactTitle, textDirectionStyle]}>
                                    {t('profile.admin')}
                                </Text>

                                {adminUser ? (
                                    <View style={styles.admin}>
                                        {adminUser.image != null ? (
                                            <Image
                                                source={{ uri: adminUser.image }}
                                                style={styles.adminAvatar}
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <Image
                                                source={require('../../assets/avatar.png')}
                                                style={styles.adminAvatar}
                                                resizeMode="contain"
                                            />
                                        )}
                                        <View>
                                            <Text style={styles.adminName}>{adminUser?.name || t('profile.defaultTitle')}</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.admin}>
                                        <Image
                                            source={require('../../assets/avatar.png')}
                                            style={styles.adminAvatar}
                                            resizeMode="contain"
                                        />
                                        <View>
                                            <Text style={styles.adminName}>{user.admin?.name || t('profile.defaultTitle')}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* CONTACT INFO */}
                        {user.type != "Parent" && (
                            <View style={[styles.profileSection, { backgroundColor: '#eeeeee', borderRadius: 10, padding: 5, marginBottom: 20 }]}>
                                {(user.contactInfo?.phone != null || user.contactInfo?.email != null || user.contactInfo?.facebook != null
                                    || user.contactInfo?.instagram != null || user.contactInfo?.whatsapp != null || user.contactInfo?.telegram != null
                                    || user.contactInfo?.tiktok != null || user.contactInfo?.snapchat != null || user.contactInfo?.location?.latitude != null
                                    || user.contactInfo?.location?.longitude != null || user.contactInfo?.description != null) ? (
                                    <View>
                                    <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' }}>
                                            <Text style={[styles.title, styles.contactTitle, { marginBottom: 0 }, textDirectionStyle]}>
                                                {t('profile.contact')}
                                            </Text>
                                            <TouchableOpacity style={styles.dmLink} onPress={() => { createChat(user._id) }}>
                                                {
                                                    chatLoading ? (
                                                        <ActivityIndicator size='small' color={'black'} />
                                                    ) : (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 }}>
                                                            <Image
                                                                style={styles.dmBtnImg}
                                                                source={require('../../assets/dm.png')}
                                                                resizeMode="contain"
                                                            />
                                                            <Text style={[styles.dmButtonText, textDirectionStyle]}>{t('profile.sendDm')}</Text>
                                                        </View>
                                                    )
                                                }

                                            </TouchableOpacity>
                                        </View>
                                        <View style={isRTL&&{flexDirection:'row-reverse'}}>
                                            {user.contactInfo?.description != null && user.type == "Club" && (
                                                <View style={styles.contactDescription}>
                                                    <Text style={textDirectionStyle}>{user.contactInfo?.description}</Text>
                                                </View>
                                            )}
                                            <View style={styles.contactInfo}>
                                                {user.contactInfo?.phone != null && (
                                                    <View style={styles.contactItem}>
                                                        <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`tel:${user.contactInfo.phone}`)}>
                                                            <FontAwesome6 name="phone" size={24} color="#000" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                {user.contactInfo?.email != null && (
                                                    <View style={styles.contactItem}>
                                                        <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`mailto:${user.contactInfo.email}`)}>
                                                            <MaterialCommunityIcons name="email-outline" size={24} color="#000" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                {user.contactInfo?.facebook != null && (
                                                    <View style={styles.contactItem}>
                                                        <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.facebook.com/${user.contactInfo.facebook}`)}>
                                                            <FontAwesome name="facebook" size={24} color="#000" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                {user.contactInfo?.instagram != null && (
                                                    <View style={styles.contactItem}>
                                                        <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.instagram.com/${user.contactInfo.instagram}`)}>
                                                            <FontAwesome name="instagram" size={24} color="#000" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                {user.contactInfo?.whatsapp != null && (
                                                    <View style={styles.contactItem}>
                                                        <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://wa.me/${user.contactInfo.whatsapp}`)}>
                                                            <FontAwesome name="whatsapp" size={24} color="#000" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                {user.contactInfo?.telegram != null && (
                                                    <View style={styles.contactItem}>
                                                        <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://t.me/${user.contactInfo.telegram}`)}>
                                                            <FontAwesome5 name="telegram-plane" size={24} color="#000" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                {user.contactInfo?.tiktok != null && (
                                                    <View style={styles.contactItem}>
                                                        <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.tiktok.com/@${user.contactInfo.tiktok}`)}>
                                                            <FontAwesome6 name="tiktok" size={24} color="#000" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                {user.contactInfo?.snapchat != null && (
                                                    <View style={styles.contactItem}>
                                                        <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.snapchat.com/add/${user.contactInfo.snapchat}`)}>
                                                            <FontAwesome name="snapchat-ghost" size={24} color="#000" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>

                                            {user.contactInfo?.location?.latitude != null && user.contactInfo?.location?.longitude != null && (
                                                <View style={styles.contactLocation}>
                                                    <View style={styles.map}>
                                                        <MapView
                                                            provider={PROVIDER_GOOGLE}

                                                            style={styles.mapPreview}
                                                            initialRegion={{
                                                                latitude: parseFloat(user.contactInfo?.location.latitude || 0),
                                                                longitude: parseFloat(user.contactInfo?.location.longitude || 0),
                                                                latitudeDelta: user.contactInfo?.location.latitude ? 0.01 : 50,
                                                                longitudeDelta: user.contactInfo?.location.longitude ? 0.01 : 50
                                                            }}
                                                        >
                                                            <Marker
                                                                coordinate={{
                                                                    latitude: parseFloat(user.contactInfo?.location.latitude || 0),
                                                                    longitude: parseFloat(user.contactInfo?.location.longitude || 0),
                                                                }}
                                                            />
                                                        </MapView>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.locationLink}
                                                        onPress={async () => {
                                                            const { latitude, longitude } = user.contactInfo?.location;
                                                            const googleMapsURL = `comgooglemaps://?center=${latitude},${longitude}&q=${latitude},${longitude}`;
                                                            const browserURL = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

                                                            try {
                                                                const supported = await Linking.canOpenURL(googleMapsURL);
                                                                if (supported) {
                                                                    await Linking.openURL(googleMapsURL);
                                                                } else {
                                                                    await Linking.openURL(browserURL);
                                                                }
                                                            } catch (error) {
                                                                console.error(error);
                                                            }
                                                        }}>
                                                        <Text style={styles.locationLinkText}>{t('profile.getDirections')}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ) : (
                                    <View>
                                    <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' }}>
                                            <Text style={[styles.title, styles.contactTitle, { marginBottom: 0 }, textDirectionStyle]}>
                                                {t('profile.contact')}
                                            </Text>
                                            <TouchableOpacity style={styles.dmLink} onPress={() => { createChat(user._id) }}>
                                                {
                                                    chatLoading ? (
                                                        <ActivityIndicator size='small' color={'black'} />
                                                    ) : (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 }}>
                                                            <Image
                                                                style={styles.dmBtnImg}
                                                                source={require('../../assets/dm.png')}
                                                                resizeMode="contain"
                                                            />
                                                            <Text style={[styles.dmButtonText, textDirectionStyle]}>{t('profile.sendDm')}</Text>
                                                        </View>
                                                    )
                                                }

                                            </TouchableOpacity>
                                        </View>
                                        <View>
                                            <Text style={[styles.emptyContactInfo, { marginBottom: 5 }, textDirectionStyle]}>
                                                {t('profile.noContactInfo')}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* BIO */}
                        {user.type != "Parent" && (
                            <View style={styles.profileSection}>
                                <Text style={[styles.title, textDirectionStyle]}>
                                    {user.type != "Club" ? t('profile.bio') : t('profile.summary')}
                                </Text>
                                {user.bio ? (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>
                                        {user.bio}
                                    </Text>
                                ) : (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                )}
                            </View>
                        )}

                        {/* SPORT */}
                        {user.type != "Parent" && (
                            <View style={styles.profileSection}>
                                <Text style={[styles.title, textDirectionStyle]}>
                                    {user.type === "Scout" || user.type === "Sponsor"
                                        ? t('profile.interestedIn')
                                        : user.sport?.length > 1 ? t('profile.sports') : t('profile.sport')
                                    }
                                </Text>
                                {user.sport && user.sport.length > 0 ? (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>
                                        {user.sport.toString()}
                                    </Text>
                                ) : (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                )}
                            </View>
                        )}

                        <View style={styles.profileSection}>
                            {/* COUNTRY */}
                            <View style={[styles.infoRow, isRTL && styles.infoRowRtl]}>
                                <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.country')}
                                </Text>
                                {user.country ? (
                                    <View style={[styles.inlineInfoRow, isRTL && styles.inlineInfoRowRtl]}>
                                        <View style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }}>
                                            <CountryFlag isoCode={user.country} size={14} />
                                        </View>
                                        <Text style={[styles.paragraph, textDirectionStyle]}>
                                            {user.country}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                )}
                            </View>

                            {/* PLAYS IN TEAMS */}
                            {user.type == "Athlete" && user.role != "Coach" && <View style={[styles.infoRow, isRTL && styles.infoRowRtl]}>
                                <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.playsIn')}
                                </Text>
                                {user.memberOf.length > 0 ? (
                                    <View>
                                        <Text style={[styles.paragraph, textDirectionStyle]}>
                                            {(user.memberOf || []).filter(Boolean).map(team => team?.name || t('profile.defaultTitle')).join(", ")}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>0 {t('profile.teamsCount')}</Text>
                                )}
                            </View>}

                            {/* COACH OF TEAMS */}
                            {user.role == "Coach" && <View style={[styles.infoRow, isRTL && styles.infoRowRtl]}>
                                <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.coachOf')}
                                </Text>
                                {userCoachOf.length > 0 ? (
                                    <View>
                                        <Text style={[styles.paragraph, textDirectionStyle]}>{userCoachOf.length} {userCoachOf.length == 1 ? t('profile.team') : t('profile.teamsCount')}</Text>
                                    </View>
                                ) : (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>0 {t('profile.teamsCount')}</Text>
                                )}
                            </View>}

                            {/* CLUB */}
                            {user.type == "Athlete" && (
                                <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, isRTL && styles.infoRowRtl]}>
                                    <Text style={[styles.title, textDirectionStyle]}>
                                        {t('profile.club')}
                                    </Text>
                                    {user.club ? (
                                        <View>
                                            {user.isStaff.length == 0 && <Text style={[styles.paragraph, textDirectionStyle]}>{user.club}</Text>}
                                            {user.isStaff.length > 0 && user.isStaff.map((staff, index) => (
                                                <Text key={index} style={[styles.paragraph, textDirectionStyle]}>{staff?.name || t('profile.defaultTitle')}</Text>
                                            ))}
                                        </View>
                                    ) : (
                                        <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                    )}
                                </View>
                            )}

                            {/* Organization */}
                            {(user.type == "Scout" || user.type == "Sponsor") && (
                                <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, isRTL && styles.infoRowRtl]}>
                                    <Text style={[styles.title, textDirectionStyle]}>
                                        {t('profile.organization')}
                                    </Text>
                                    {!user.organization?.independent ? (
                                        <View>
                                            <Text style={[styles.paragraph, textDirectionStyle]}>{user.organization?.name || t('profile.defaultTitle')}</Text>
                                        </View>
                                    ) : (
                                        <Text style={[styles.paragraph, textDirectionStyle]}>{t('profile.independent')}</Text>
                                    )}
                                </View>
                            )}

                            {/* NUMBER OF SPORTS */}
                            {user.type == "Club" && (
                                <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, isRTL && styles.infoRowRtl]}>
                                    <Text style={[styles.title, textDirectionStyle]}>
                                        {t('profile.totalSports')}
                                    </Text>
                                    {user.sport ? (
                                        <View>
                                            <Text style={[styles.paragraph, textDirectionStyle]}>
                                                {user.sport.length}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                    )}
                                </View>
                            )}

                            {/* NUMBER OF TEAMS */}
                            {user.type == "Club" && (
                                <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, isRTL && styles.infoRowRtl]}>
                                    <Text style={[styles.title, textDirectionStyle]}>
                                        {t('profile.totalTeams')}
                                    </Text>
                                    {user.club ? (
                                        <View>
                                            <Text style={[styles.paragraph, textDirectionStyle]}>
                                                {user.club.length}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                    )}
                                </View>
                            )}

                            {/* NUMBER OF MEMBERS */}
                            {user.type == "Club" && (
                                <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, isRTL && styles.infoRowRtl]}>
                                    <Text style={[styles.title, textDirectionStyle]}>
                                        {t('profile.totalMembers')}
                                    </Text>
                                    {user.children ? (
                                        <View>
                                            <Text style={[styles.paragraph, textDirectionStyle]}>
                                                {user.children.length}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                    )}
                                </View>
                            )}

                            {/* DOB */}
                            <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, isRTL && styles.infoRowRtl]}>
                                <Text style={[styles.title, textDirectionStyle]}>
                                    {user.type == "Club" ? t('profile.established') : t('profile.dateOfBirth')}
                                </Text>
                                {(user.dob?.day && user.dob?.month && user.dob?.year) ? (
                                    <View>
                                        {(user.type == "Club" || user.type == "Association") && <Text style={[styles.paragraph, textDirectionStyle]}>{months[user.dob.month - 1]} {user.dob.year}</Text>}
                                        {(user.type != "Club" && user.type != "Association") && <Text style={[styles.paragraph, textDirectionStyle]}>{months[user.dob.month - 1]} {user.dob.day}, {user.dob.year}</Text>}
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                    </View>
                                )}
                            </View>

                            {/* HEIGHT */}
                            {user.type == "Athlete" && (
                                <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, isRTL && styles.infoRowRtl]}>
                                    <Text style={[styles.title, textDirectionStyle]}>
                                        {t('profile.height')}
                                    </Text>
                                    <View>
                                        {user.height ? (
                                            <Text style={[styles.paragraph, textDirectionStyle]}>{user.height} cm</Text>
                                        ) : (
                                            <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* WEIGHT */}
                            {user.type == "Athlete" && (
                                <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, isRTL && styles.infoRowRtl]}>
                                    <Text style={[styles.title, textDirectionStyle]}>
                                        {t('profile.weight')}
                                    </Text>
                                    <View>
                                        {user.weight ? (
                                            <Text style={[styles.paragraph, textDirectionStyle]}>{user.weight} kg</Text>
                                        ) : (
                                            <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                        )}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* HIGHLIGHTS */}
                        {user.type != "Scout" && user.type != "Sponsor" && (
                            <View style={styles.profileSection}>
                                {user.type != "Parent" && <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.highlights')}
                                </Text>}
                                {user.type == "Parent" && <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.childrenHighlights')}
                                </Text>}
                                {user.highlights ? (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>{user.highlights}</Text>
                                ) : (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                )}
                            </View>
                        )}

                        {/* STATS */}
                        {user.type != "Scout" && user.type != "Sponsor" && (
                            <View style={styles.profileSection}>
                                {user.type != "Parent" && <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.stats')}
                                </Text>}
                                {user.type == "Parent" && <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.childrenStats')}
                                </Text>}
                                {user.stats ? (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>{user.stats}</Text>
                                ) : (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                )}
                            </View>
                        )}

                        {/* ACHIEVEMENTS */}
                        {user.type != "Club" && user.type != "Scout" && user.type != "Sponsor" && (
                            <View style={styles.profileSection}>
                                {user.type != "Parent" && <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.achievements')}
                                </Text>}
                                {user.type == "Parent" && <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.childrenAchievements')}
                                </Text>}
                                {user.achievements ? (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>{user.achievements}</Text>
                                ) : (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                )}
                            </View>
                        )}

                        {/* EVENTS */}
                        {user.type != "Scout" && user.type != "Sponsor" && (
                            <View style={styles.profileSection}>
                                {user.type != "Parent" && <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.upcomingEvents')}
                                </Text>}
                                {user.type == "Parent" && <Text style={[styles.title, textDirectionStyle]}>
                                    {t('profile.childrenUpcomingEvents')}
                                </Text>}
                                {user.events ? (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>{user.events}</Text>
                                ) : (
                                    <Text style={[styles.paragraph, textDirectionStyle]}>-</Text>
                                )}
                            </View>
                        )}

                        {/* SKILLS */}
                        {/* {user.type == "Athlete" && (
                            <View style={[styles.profileSection, styles.skillsSection]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 }}>
                                    <Text style={styles.title}>
                                        Skills
                                    </Text>
                                    {user.skillsAreVerified?.by != null &&
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                            <Octicons name="verified" size={16} color="#009933" />
                                            <Text style={{ color: "#009933" }}>Verified</Text>
                                        </View>
                                    }
                                </View>
                                <View style={user.skills != null ? { alignItems: 'center' } : { alignItems: 'flex-start' }}>
                                    <RadarChart
                                        data={data}
                                        maxValue={100}
                                        gradientColor={{
                                            startColor: '#FF9432',
                                            endColor: '#FFF8F1',
                                            count: 5,
                                        }}
                                        stroke={['#FFE8D3', '#FFE8D3', '#FFE8D3', '#FFE8D3', '#ff9532']}
                                        strokeWidth={[0.5, 0.5, 0.5, 0.5, 1]}
                                        strokeOpacity={[1, 1, 1, 1, 0.13]}
                                        labelColor="#111111"
                                        dataFillColor="#FF9432"
                                        dataFillOpacity={0.8}
                                        dataStroke="#FF4000"
                                        dataStrokeWidth={2}
                                        isCircle
                                    />
                                </View>
                            </View>
                        )} */}

                        {/* ACIONS */}
                        <View style={[styles.profileSection, styles.profileActions]}>
                            <TouchableOpacity onPress={handleShareProfile} style={styles.profileButton}>
                                <Text style={[styles.profileButtonText, textDirectionStyle]}>{t('profile.shareProfile')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.ScrollView>
            )}

            {/* teamsTab */}
            {
                !loading && user && activeTab == "Teams" && <Animated.ScrollView
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {teamsLoading ? (
                        <View style={[styles.contentContainer, { paddingTop: 20, flexDirection: 'row', alignItems: 'center' }]}>
                            <ActivityIndicator
                                size="small"
                                color="#FF4000"
                                style={{ transform: [{ scale: 1.25 }] }}
                            />
                        </View>
                    ) : (
                        <View style={styles.contentContainer}>
                            {/* Header with Add button */}
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, textDirectionStyle]}>{t('profile.clubTeams')}</Text>
                            </View>

                            {teams && teams.length > 0 ? (
                                teams.map((team) => (
                                    <TeamCard
                                        key={team._id}
                                        team={team}
                                    />
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={[styles.emptyStateTitle, textDirectionStyle]}>{t('profile.noTeamsYet')}</Text>
                                    <Text style={[styles.emptyStateText, textDirectionStyle]}>{t('profile.noClubTeamsYet')}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </Animated.ScrollView>
            }

            {/* scheduleTab */}
            {
                !loading && user && activeTab == "Schedule" && <Animated.ScrollView
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {scheduleLoading ? (
                        <View style={[styles.contentContainer, { paddingTop: 20, flexDirection: 'row', alignItems: 'center' }]}>
                            <ActivityIndicator
                                size="small"
                                color="#FF4000"
                                style={{ transform: [{ scale: 1.25 }] }}
                            />
                        </View>
                    ) : (
                        <View style={styles.contentContainer}>
                            {/* Header with Add button */}
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, textDirectionStyle]}>{t('profile.clubSchedule')}</Text>
                            </View>

                            {schedule.length > 0 ? (
                                <View>
                                    {/** Create a Set of event dates for dots */}
                                    {(() => {
                                        const eventDatesSet = new Set(
                                            schedule.map((event) => {
                                                const d = new Date(event.date);
                                                return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
                                            })
                                        );

                                        const selectedDayEvents = schedule.filter((event) => {
                                            const d = new Date(event.date);
                                            return (
                                                d.getFullYear() === selectedDate.getFullYear() &&
                                                d.getMonth() === selectedDate.getMonth() &&
                                                d.getDate() === selectedDate.getDate()
                                            );
                                        });

                                        return (
                                            <>
                                                <View style={styles.calendarContainer}>
                                                    <View style={styles.calendarHeader}>
                                                        <TouchableOpacity onPress={() => {
                                                            if (calendarMonth === 0) {
                                                                setCalendarMonth(11);
                                                                setCalendarYear(calendarYear - 1);
                                                            } else {
                                                                setCalendarMonth(calendarMonth - 1);
                                                            }
                                                        }}>
                                                            {/* <Text style={styles.navArrow}>previous</Text> */}
                                                            <Image source={require('../../assets/leftArrow.png')} style={styles.calArrow} />
                                                        </TouchableOpacity>

                                                        <Text style={styles.monthHeader}>
                                                            {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                        </Text>

                                                        <TouchableOpacity onPress={() => {
                                                            if (calendarMonth === 11) {
                                                                setCalendarMonth(0);
                                                                setCalendarYear(calendarYear + 1);
                                                            } else {
                                                                setCalendarMonth(calendarMonth + 1);
                                                            }
                                                        }}>
                                                            {/* <Text style={styles.navArrow}>next</Text> */}
                                                            <Image source={require('../../assets/rightArrow.png')} style={styles.calArrow} />
                                                        </TouchableOpacity>
                                                    </View>

                                                    {/* <Text style={styles.monthHeader}>July 2025</Text> */}
                                                    <View style={styles.daysOfWeek}>
                                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                            <Text key={day} style={styles.dayHeader}>
                                                                {day}
                                                            </Text>
                                                        ))}
                                                    </View>

                                                    <View style={styles.calendarGrid}>
                                                        {calendarDays.map((item, index) => {
                                                            if (!item) {
                                                                return <View key={index} style={styles.calendarDay} />;
                                                            }

                                                            const day = item.day;
                                                            const date = new Date(item.dateStr);

                                                            const isToday =
                                                                new Date().toDateString() === date.toDateString();

                                                            const isSelected =
                                                                selectedDate.toDateString() === date.toDateString();

                                                            return (
                                                                <TouchableOpacity
                                                                    key={index}
                                                                    style={[
                                                                        styles.calendarDay,
                                                                        isToday && styles.currentDay,
                                                                        isSelected && styles.selectedDay,
                                                                    ]}
                                                                    onPress={() => setSelectedDate(date)}
                                                                >
                                                                    <Text
                                                                        style={[
                                                                            styles.dayNumber,
                                                                            isToday && styles.currentDayText,
                                                                            isSelected && styles.selectedDayText,
                                                                        ]}
                                                                    >
                                                                        {day}
                                                                    </Text>

                                                                    {item.hasEvent && (
                                                                        <View style={[
                                                                            styles.eventDot
                                                                        ]} />
                                                                    )}
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </View>
                                                </View>

                                                <View>
                                                    <Text style={[styles.subSectionTitle, textDirectionStyle]}>{t('profile.eventsOfDay')} - {selectedDate.getDate()} {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</Text>
                                                    {selectedDayEvents.length > 0 ? (
                                                        selectedDayEvents.map((event) => {
                                                            const eventDate = new Date(event.date);
                                                            const formattedTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                            const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


                                                            return (
                                                                <TouchableOpacity
                                                                    key={event._id}
                                                                    style={styles.eventCard}
                                                                    onPress={() => router.push({
                                                                        pathname: '/schedule/details',
                                                                        params: { id: event._id }
                                                                    })
                                                                    }
                                                                >
                                                                    <View style={styles.eventDate}>
                                                                        <Text style={styles.eventDay}>{eventDate.getDate()}</Text>
                                                                        <Text style={styles.eventMonth}>
                                                                            {eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={styles.eventDetails}>
                                                                        <Text style={[styles.eventTitle, textDirectionStyle]}>{event.title}</Text>
                                                                        <Text style={[styles.eventTime, textDirectionStyle]}>
                                                                            {formattedTime} - {endTime}
                                                                        </Text>
                                                                        <Text style={[styles.eventLocation, textDirectionStyle]}>
                                                                            {event.locationType === 'online'
                                                                                ? t('profile.onlineEvent')
                                                                                : event.venue?.name || t('profile.locationTbd')}
                                                                        </Text>
                                                                        {event.eventType === 'match' && event.opponent && (
                                                                            <View style={styles.opponentContainer}>
                                                                                <Text style={[styles.opponentText, textDirectionStyle]}>{t('profile.versus')} {event.opponent?.name || t('profile.defaultTitle')}</Text>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                    <TouchableOpacity
                                                                        style={styles.eventAction}
                                                                        onPress={(e) => {
                                                                            e.stopPropagation();
                                                                            // Handle menu press
                                                                        }}
                                                                    >
                                                                        <FontAwesome5 name="ellipsis-v" size={16} color="#666" />
                                                                    </TouchableOpacity>
                                                                </TouchableOpacity>
                                                            );
                                                        })
                                                    ) : (
                                                        <Text style={[styles.noEventsText, textDirectionStyle]}>{t('profile.noEventsToday')}</Text>
                                                    )}

                                                    {/* <View style={{ marginTop: 30 }}>
                                                        <Text style={styles.subSectionTitle}>Upcoming Events</Text>
                                                        {schedule.filter(event => new Date(event.date) > new Date()).length > 0 ? (
                                                            schedule
                                                                .filter(event => new Date(event.date) > new Date())
                                                                .sort((a, b) => new Date(a.date) - new Date(b.date)) // optional: sort chronologically
                                                                .map((event) => {
                                                                    const eventDate = new Date(event.date);
                                                                    const formattedTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                                    const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                                                    return (
                                                                        <TouchableOpacity
                                                                            key={event._id}
                                                                            style={styles.eventCard}
                                                                            onPress={() => router.push(`/schedule/details?id=${event._id}`)}
                                                                        >
                                                                            <View style={styles.eventDate}>
                                                                                <Text style={styles.eventDay}>{eventDate.getDate()}</Text>
                                                                                <Text style={styles.eventMonth}>
                                                                                    {eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}
                                                                                </Text>
                                                                            </View>
                                                                            <View style={styles.eventDetails}>
                                                                                <Text style={styles.eventTitle}>{event.title}</Text>
                                                                                <Text style={styles.eventTime}>
                                                                                    {formattedTime} - {endTime}
                                                                                </Text>
                                                                                <Text style={styles.eventLocation}>
                                                                                    {event.locationType === 'online'
                                                                                        ? 'Online Event'
                                                                                        : event.venue?.name || 'Location TBD'}
                                                                                </Text>
                                                                                {event.eventType === 'match' && event.opponent && (
                                                                                    <View style={styles.opponentContainer}>
                                                                                        <Text style={styles.opponentText}>vs {event.opponent?.name || 'TBD'}</Text>
                                                                                    </View>
                                                                                )}
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                    );
                                                                })
                                                        ) : (
                                                            <Text style={styles.noEventsText}>No upcoming events.</Text>
                                                        )}
                                                    </View> */}
                                                </View>
                                            </>
                                        );
                                    })()}
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={[styles.emptyStateTitle, textDirectionStyle]}>{t('profile.noScheduledEvents')}</Text>
                                    <Text style={[styles.emptyStateText, textDirectionStyle]}>
                                        {userId === user._id
                                            ? t('profile.createEvent')
                                            : t('profile.noScheduledEvents')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </Animated.ScrollView>
            }

            {/* staffTab */}
            {
                !loading && user && activeTab == "Staff" && <Animated.ScrollView
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    <View style={styles.contentContainer}>
                        {staffLoading ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ActivityIndicator
                                    size="small"
                                    color="#FF4000"
                                    style={{ transform: [{ scale: 1.25 }] }}
                                />
                            </View>
                        ) : staff && staff.data?.length > 0 ? (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, textDirectionStyle]}>{t('profile.clubStaff')}</Text>
                                </View>
                                <View>
                                    {staff && staff.data?.map((member, index) => (
                                        <TouchableOpacity
                                            key={member._id}
                                            style={styles.staffCard}
                                            onPress={() => router.push(`/staff/details?id=${member._id}`)}
                                        >
                                            <View style={[styles.staffHeader, isRTL && styles.teamHeaderRtl]}>
                                                {member.image ? (
                                                    <Image
                                                        source={{ uri: member.image }}
                                                        style={styles.staffAvatar}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View style={[styles.staffAvatar, styles.defaultStaffAvatar]}>
                                                        <FontAwesome5 name="user" size={24} color="#fff" />
                                                    </View>
                                                )}
                                                <View style={styles.staffInfo}>
                                                    <Text style={[styles.staffName, textDirectionStyle]}>{member?.name || t('profile.defaultTitle')}</Text>
                                                    <Text style={[styles.staffRole, textDirectionStyle]}>{member.role || t('profile.staff')}</Text>
                                                </View>
                                                <View style={styles.staffStats}>
                                                    <Text style={styles.staffStatValue}>
                                                        {member.teams?.length || 0}
                                                    </Text>
                                                    <Text style={styles.staffStatLabel}>
                                                        {member.teams?.length === 1 ? t('profile.team') : t('profile.teamsCount')}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={[styles.staffContact, isRTL && styles.coachSectionRtl]}>
                                                {member.phone && (
                                                    <TouchableOpacity
                                                        style={styles.contactButton}
                                                        onPress={() => Linking.openURL(`tel:${member.phone}`)}
                                                    >
                                                        <FontAwesome5 name="phone" size={16} color="#FF4000" />
                                                        <Text style={styles.contactButtonText}>{t('profile.call')}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {member.email && (
                                                    <TouchableOpacity
                                                        style={styles.contactButton}
                                                        onPress={() => Linking.openURL(`mailto:${member.email}`)}
                                                    >
                                                        <MaterialCommunityIcons name="email-outline" size={16} color="#FF4000" />
                                                        <Text style={styles.contactButtonText}>{t('profile.email')}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, textDirectionStyle]}>{t('profile.clubStaff')}</Text>
                                </View>
                                <View style={styles.emptyState}>
                                    <Text style={[styles.emptyStateTitle, textDirectionStyle]}>{t('profile.noStaffMembers')}</Text>
                                    <Text style={[styles.emptyStateText, textDirectionStyle]}>
                                        {t('profile.noClubStaffYet')}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </Animated.ScrollView>
            }

            {/* inventoryTab */}
            {
                !loading && user && activeTab == "Inventory" && <Animated.ScrollView
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    <View style={styles.contentContainer}>
                        {inventoryLoading ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 20 }}>
                                <ActivityIndicator
                                    size="small"
                                    color="#FF4000"
                                    style={{ transform: [{ scale: 1.25 }] }}
                                />
                            </View>
                        ) : (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, textDirectionStyle]}>{t('profile.clubInventory')}</Text>
                                    {userId == user._id && (
                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={() => router.push('/inventory/createInventory')}
                                        >
                                            <Text style={styles.addButtonText}>{t('profile.addItem')}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {inventory && inventory.length > 0 ? (
                                    inventory.map((item) => (
                                        <TouchableOpacity
                                            key={item._id}
                                            style={styles.inventoryCard}
                                            onPress={() => router.push(`/inventory/${item._id}`)}
                                        >
                                            <View style={[styles.inventoryHeader, isRTL && styles.teamHeaderRtl]}>
                                                <View style={[styles.inventoryIcon, styles.defaultInventoryIcon]}>
                                                    <FontAwesome5 name="box-open" size={24} color="#fff" />
                                                </View>
                                                <View style={styles.inventoryInfo}>
                                                    <Text style={[styles.inventoryName, textDirectionStyle]}>{item.itemName}</Text>
                                                    <Text style={[styles.inventoryCategory, textDirectionStyle]}>{item.category}</Text>
                                                </View>
                                                <View style={styles.inventoryStats}>
                                                    <Text style={styles.inventoryStatValue}>{item.quantity}</Text>
                                                    <Text style={styles.inventoryStatLabel}>{t('profile.inStock')}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.inventoryDetails}>
                                                <View style={styles.inventoryDetailRow}>
                                                    <Text style={[styles.inventoryDetailLabel, textDirectionStyle]}>{t('profile.unitPrice')}</Text>
                                                    <Text style={[styles.inventoryDetailValue, textDirectionStyle]}>${item.unitPrice?.toFixed(2) || '0.00'}</Text>
                                                </View>
                                                {item.description && (
                                                    <View style={styles.inventoryDetailRow}>
                                                        <Text style={[styles.inventoryDetailLabel, textDirectionStyle]}>{t('profile.description')}</Text>
                                                        <Text style={[styles.inventoryDetailValue, textDirectionStyle]} numberOfLines={1}>{item.description}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Text style={[styles.emptyStateTitle, textDirectionStyle]}>{t('profile.noItems')}</Text>
                                        <Text style={[styles.emptyStateText, textDirectionStyle]}>
                                            {t('profile.noClubInventoryYet')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </Animated.ScrollView>
            }

            <View style={[styles.navBar, isRTL && styles.navBarRtl]}>
                <TouchableOpacity onPress={() => router.replace('/settings')}>
                    <Image source={require('../../assets/settings.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/search')}>
                    <Image source={require('../../assets/search.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/landing')}>
                    <Image source={require('../../assets/home.png')} style={[styles.icon, styles.icon]} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/notifications')}>
                    <Image source={require('../../assets/notifications.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/profile')}>
                    <Image source={require('../../assets/profile.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View >
    );
}

const TeamCard = ({ team }) => {
    const { isRTL, t } = useLanguage();
    const router = useRouter();
    const textDirectionStyle = isRTL ? styles.rtlText : styles.ltrText;

    return (
        <TouchableOpacity
            key={team._id}
            style={styles.teamCard}
            onPress={() => router.push({
                pathname: '/teams/details',
                params: { id: team._id },
            })}
        >
            <View style={[styles.teamHeader, isRTL && styles.teamHeaderRtl]}>
                {team.image ? (
                    <Image
                        source={{ uri: team.image }}
                        style={styles.teamLogo}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={[styles.teamLogo, styles.defaultTeamLogo]}>
                        <Text style={styles.defaultLogoText}>{team?.name?.charAt(0)}</Text>
                    </View>
                )}
                <View style={styles.teamInfo}>
                    <Text style={[styles.teamName, textDirectionStyle]}>{team?.name || t('profile.defaultTitle')}</Text>
                    <Text style={[styles.teamSport, textDirectionStyle]}>{team.sport}</Text>
                </View>
                <View style={styles.teamStats}>
                    <Text style={styles.teamStatValue}>{team.members?.length || 0}</Text>
                    <Text style={styles.teamStatLabel}>{t('profile.members')}</Text>
                </View>
            </View>

            {(team.coaches || []).filter(Boolean).length > 0 && (
                <View style={[styles.coachSection, isRTL && styles.coachSectionRtl]}>
                    <Text style={[styles.coachLabel, textDirectionStyle]}>{(team.coaches || []).filter(Boolean).length == 1 ? t('profile.coach') : t('profile.coaches')}</Text>

                    <View style={styles.coachInfoDiv}>
                        {(team.coaches || []).filter(Boolean).map((coach, index) => (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: '/profile/public',
                                    params: { id: coach._id },
                                })}
                                key={index} style={[styles.coachInfo, isRTL && styles.coachInfoRtl]}>
                                {coach.image ? (
                                    <Image
                                        source={{ uri: coach.image }}
                                        style={styles.coachAvatar}
                                    />
                                ) : (
                                    <Image
                                        source={require('../../assets/avatar.png')}
                                        style={styles.coachAvatar}
                                        resizeMode="contain"
                                    />
                                )}
                                <Text style={[styles.coachName, textDirectionStyle]}>{coach?.name || t('profile.defaultTitle')}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View >
            )}

            {/* <View style={styles.teamActions}>
                <TouchableOpacity
                    style={styles.teamActionButton}
                    onPress={() => router.push({
                        pathname: '/teams/members',
                        params: { id: team._id },
                    })}
                >
                    <FontAwesome5 name="users" size={18} color="#FF4000" />
                    <Text style={styles.teamActionText}>Members</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.teamActionButton}
                    onPress={() => router.push({
                        pathname: '/teams/schedule',
                        params: { id: team._id },
                    })}
                >
                    <FontAwesome5 name="calendar-alt" size={18} color="#FF4000" />
                    <Text style={styles.teamActionText}>Schedule</Text>
                </TouchableOpacity>
            </View> */}
        </TouchableOpacity>
    )
};

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
    coachInfoDiv: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5
    },
    coachInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eeeeee',
        padding: 5,
        borderRadius: 20,
    },
    coachInfoRtl: {
        flexDirection: 'row-reverse',
    },
    coachName: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#111111',
    },
    logo: {
        width: 120,
        height: 40,
        position: 'absolute',
top: Platform.OS == 'ios' ? 60 : 40,
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
    profileSection: {
        marginBottom: 30
    },
    skillsSection: {
        backgroundColor: '#f2f2f2',
        padding: 10,
        borderRadius: 10
    },
    profileProgress: {
        backgroundColor: '#222222',
        padding: 5,
        paddingRight: 10,
        borderTopLeftRadius: 40,
        borderBottomLeftRadius: 40,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    profileProgressPercentage: {
        width: 60,
        height: 60,
        borderRadius: 60,
        borderWidth: 5,
        borderColor: '#FF4000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    profileProgressPercentageText: {
        color: '#FF4000',
        textAlign: 'center',
        fontSize: 24,
        fontFamily: 'Qatar'
    },
    profileProgressTextSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profileProgressText: {
        color: 'white',
        fontFamily: 'Qatar',
        fontSize: 24,
    },
    profileProgressImg: {
        width: 15,
        height: 15,
        objectFit: 'contain',
    },
    title: {
        fontFamily: "Qatar",
        fontSize: 16,
        color: 'black'
    },
    subtitle: {
        fontFamily: "Acumin",
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black'
    },
    paragraph: {
        fontFamily: "Acumin",
        fontSize: 16,
        color: 'black'
    },
    dmButtonText: {
        color: 'black',
    },
    ghostText: {
        fontSize: 100, textTransform: 'uppercase',
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
    profileImage: {
        position: 'absolute',
        bottom: 0,
        right: -5,
        height: '70%',
        maxWidth: 200,
        overflow: 'hidden',
    },
    rtlprofileImage: {
        right: 'auto',
        left: -5
    },
    profileImageAvatar: {
        height: '100%',
        width: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    fullButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    button: {
        flex: 1,
        backgroundColor: '#000000',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'Qatar',
    },
    navBar: {
        position: 'absolute',
        bottom: 50,
        left: 10,
        width: width - 20,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e0e0e0',

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,

        // Android shadow
        elevation: 5,
    },
    navBarRtl: {
        flexDirection: 'row-reverse',
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#111111'
    },
    activeIcon: {
        width: 24,
        height: 24,
        tintColor: '#FF4000',
    },
    profileActions: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.2)',
        paddingTop: 10
    },
    profileButton: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10
    },
    profileButtonText: {
        textTransform: 'uppercase',
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Qatar',
    },
    uploadImage: {
        backgroundColor: '#111111',
        padding: 2,
        paddingRight: 5,
        borderRadius: 10,
        textAlign: 'center',
        // position: 'absolute',
        // bottom: 5,
        // left: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadImageText: {
        color: '#FF4000',
        fontFamily: 'Qatar',
        fontSize: 16,
    },
    tabs: {
        backgroundColor: '#111111',
        flexDirection: 'row',
        paddingLeft: 10
    },
    tab: {
        padding: 10,
        paddingBottom: 5,
        borderBottomWidth: 5,
        borderBottomColor: '#111111'
    },
    activeTab: {
        borderBottomColor: '#FF4000'
    },
    tabText: {
        // color: '#FF4000',
        color: '#888888',
        fontFamily: 'Qatar',
        fontSize: 18
    },
    tabTextActive: {
        color: '#FF4000'
    },
    contactInfo: {
        flexDirection: 'row',
        columnGap: 10,
    },
    contactTitle: {
        marginBottom: 10
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoRowRtl: {
        flexDirection: 'row-reverse',
    },
    inlineInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inlineInfoRowRtl: {
        flexDirection: 'row-reverse',
    },
    dmBtnImg: {
        width: 15,
        height: 15,
    },
    contactItem: {
        borderRadius: 10,
        backgroundColor: '#cccccc',
        width: (width - 120) / 8,
        height: (width - 120) / 8,
    },
    contactDescription: {
        marginBottom: 15
    },
    contactLink: {
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dmLink: {
        backgroundColor: "#cccccc",
        borderRadius: 8,
        padding: 5
    },
    contactLocation: {
        marginTop: 15,
        rowGap: 10,
    },
    map: {
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: "#cccccc"
    },
    mapPreview: {
        width: '100%',
        height: 150,
    },
    locationLink: {
        backgroundColor: '#cccccc',
        borderRadius: 8,
        paddingVertical: 5
    },
    locationLinkText: {
        color: '#000',
        fontFamily: 'Qatar',
        fontSize: 14,
        textAlign: 'center'
    },
    emptyContactInfoBtnText: {
        color: '#FF4000'
    },
    emptyContactInfoBtn: {

    },
    emptyContactInfo: {
        fontFamily: 'Acumin',
        fontStyle: 'italic',
        fontSize: 14,
        color: '#888888'
    },
    adminDiv: {
        // backgroundColor: '#eeeeee',
        marginBottom: 20,
        // padding: 5,
        // borderRadius: 8,
    },
    admin: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eeeeee',
        padding: 5,
        borderRadius: 8
    },
    adminAvatar: {
        width: 60,
        aspectRatio: 1,
        borderRadius: 30,
        backgroundColor: '#FF4000',
        marginRight: 20
    },
    adminName: {
        fontFamily: 'Acumin',
        fontSize: 16,
        color: 'black'
    },
    adminLink: {
        color: '#FF4000',
        fontSize: 12,
        fontFamily: 'Acumin'
    },
    adminButton: {

    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'Qatar',
        fontSize: 24,
        color: '#111111',
    },
    addButton: {
        backgroundColor: '#FF4000',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    addButtonText: {
        color: 'white',
        fontFamily: 'Acumin',
        fontSize: 14,
        fontWeight: 'bold',
    },
    teamCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    teamHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    teamHeaderRtl: {
        flexDirection: 'row-reverse',
    },
    teamLogo: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    defaultTeamLogo: {
        backgroundColor: '#FF4000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultLogoText: {
        color: 'white',
        fontFamily: 'Qatar',
        fontSize: 24,
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        fontFamily: 'Qatar',
        fontSize: 20,
        color: '#111111',
    },
    teamSport: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#666666',
    },
    teamStats: {
        alignItems: 'center',
        marginLeft: 10,
    },
    teamStatValue: {
        fontFamily: 'Qatar',
        fontSize: 20,
        color: '#FF4000',
    },
    teamStatLabel: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#666666',
    },
    coachSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
    },
    coachSectionRtl: {
        flexDirection: 'row-reverse',
    },
    coachLabel: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#666666',
        marginRight: 10,
    },
    coachAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FF4000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    teamActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
        paddingTop: 10,
    },
    teamActionButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    teamActionText: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#FF4000',
        marginTop: 5,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateImage: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontFamily: 'Qatar',
        fontSize: 24,
        color: '#111111',
        marginBottom: 10,
    },
    emptyStateText: {
        fontFamily: 'Acumin',
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 20,
        maxWidth: '80%',
    },
    emptyStateButton: {
        backgroundColor: '#FF4000',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    emptyStateButtonText: {
        color: 'white',
        fontFamily: 'Qatar',
        fontSize: 18,
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    monthHeader: {
        fontFamily: 'Qatar',
        fontSize: 22,
        color: '#111111',
        textAlign: 'center',
    },
    daysOfWeek: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dayHeader: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
        width: `${100 / 7}%`,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDay: {
        width: `${100 / 7}%`,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 5,
    },
    currentDay: {
        borderRadius: 20,
        backgroundColor: '#dddddd'
    },
    selectedDay: {
        backgroundColor: '#FF4000',
        borderRadius: 20,
    },
    currentDayText: {
        fontWeight: 'bold'
    },
    selectedDayText: {
        color: 'white',
    },
    dayNumber: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#111111',
    },
    eventDot: {
        position: 'absolute',
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#FF4000',
        bottom: 2,
    },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    eventDate: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#eeeeee',
        marginRight: 15,
    },
    eventDay: {
        fontFamily: 'Qatar',
        fontSize: 24,
        color: '#FF4000',
    },
    eventMonth: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#666666',
        textTransform: 'uppercase',
    },
    eventDetails: {
        flex: 1,
    },
    eventTitle: {
        fontFamily: 'Acumin',
        fontSize: 16,
        color: '#111111',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    eventTime: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#666666',
        marginBottom: 3,
    },
    eventLocation: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#666666',
    },
    eventAction: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subSectionTitle: {
        fontFamily: 'Qatar',
        fontSize: 20,
        color: '#111111',
        marginBottom: 15,
        marginTop: 10,
    },
    noEventsText: {
        color: 'black'
    },
    opponentContainer: {

    },
    opponentText: {

    },
    staffCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    staffHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    staffAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    defaultStaffAvatar: {
        backgroundColor: '#FF4000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    staffInfo: {
        flex: 1,
    },
    staffName: {
        fontFamily: 'Qatar',
        fontSize: 20,
        color: '#111111',
    },
    staffRole: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#666666',
    },
    staffStats: {
        alignItems: 'center',
        marginLeft: 10,
    },
    staffStatValue: {
        fontFamily: 'Qatar',
        fontSize: 20,
        color: '#FF4000',
    },
    staffStatLabel: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#666666',
    },
    staffContact: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
        paddingTop: 10,
        gap: 10,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 64, 0, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 5,
    },
    contactButtonText: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#FF4000',
    },
    inventoryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inventoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    inventoryIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultInventoryIcon: {
        backgroundColor: '#FF4000',
    },
    inventoryInfo: {
        flex: 1,
    },
    inventoryName: {
        fontFamily: 'Qatar',
        fontSize: 20,
        color: '#111111',
    },
    inventoryCategory: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#666666',
    },
    inventoryStats: {
        alignItems: 'center',
        marginLeft: 10,
    },
    inventoryStatValue: {
        fontFamily: 'Qatar',
        fontSize: 20,
        color: '#FF4000',
    },
    inventoryStatLabel: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#666666',
    },
    inventoryDetails: {
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
        paddingTop: 10,
    },
    inventoryDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    inventoryDetailLabel: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#666666',
    },
    inventoryDetailValue: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#111111',
        flexShrink: 1,
        marginLeft: 10,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    calArrow: {
        width: 20,
        height: 20
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 10,
        width: 200,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtnRtl: {
        flexDirection: 'row-reverse',
        width: '100%',
        left: 'auto',
        right: 10
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Qatar',
        lineHeight: 18
    },
    ltrText: {
        textAlign: 'left',
        writingDirection: 'ltr',
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
});

