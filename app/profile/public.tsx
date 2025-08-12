import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { RadarChart } from '@salmonco/react-native-radar-chart';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Linking,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CountryFlag from "react-native-country-flag";
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function PublicProfile() {
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
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [staffLoading, setStaffLoading] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Profile');
    const [adminUser, setAdminUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const tabs = ['Profile', 'Teams', 'Schedule'];

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
                const eventDate = new Date(e.startDateTime);
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
        outputRange: [300, 175],
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
                const response = await fetch(`https://riyadah.onrender.com/api/users/${id}`);

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);

                    if (userData.role == "Coach") {
                        const coachteams = await fetch(`https://riyadah.onrender.com/api/teams/byCoach/${userData._id}`);

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
                const res = await fetch(`https://riyadah.onrender.com/api/users/findAdmin?email=${user.admin.email}`, {
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
                const res = await fetch(`https://riyadah.onrender.com/api/teams/club/${user._id}`, {
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
                const res = await fetch(`https://riyadah.onrender.com/api/schedules/club/${user._id}?${params.toString()}`);

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
                const response = await fetch(`https://riyadah.onrender.com/api/staff/byClub/${user._id}`);
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
                const response = await fetch(`https://riyadah.onrender.com/api/inventory/byClub/${user._id}`);
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
                message: `Check out ${user.name}'s profile on Riyadah!\n${url}`,
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

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.pageHeader, { height: headerHeight }]}>
                <Animated.Image
                    source={require('../../assets/logo_white.png')}
                    style={[styles.logo, { opacity: logoOpacity }]}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>{user?.name || 'Profile'}</Text>
                    {!loading && <Text style={styles.pageDesc}>
                        {user?.type} {user.role ? `/ ${user.role}` : ''}
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

                {!loading && <Text style={styles.ghostText}>{user.name.substring(0, 6)}</Text>}

                {!loading && (
                    <View style={styles.profileImage}>
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
                            <Text style={[styles.tabText, activeTab === label && styles.tabTextActive]}>
                                {label}
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
                                <Text style={[styles.title, styles.contactTitle]}>
                                    Admin
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
                                            <Text style={styles.adminName}>{adminUser.name}</Text>
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
                                            <Text style={styles.adminName}>{user.admin.name}</Text>
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
                                        <Text style={[styles.title, styles.contactTitle]}>
                                            CONTACT
                                        </Text>
                                        <View>
                                            {user.contactInfo?.description != null && user.type == "Club" && (
                                                <View style={styles.contactDescription}>
                                                    <Text>{user.contactInfo?.description}</Text>
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
                                                        <Text style={styles.locationLinkText}>Get Directions</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={[styles.title, styles.contactTitle, { marginBottom: 0 }]}>
                                            CONTACT
                                        </Text>
                                        <View>
                                            <Text style={[styles.emptyContactInfo, { marginBottom: 5 }]}>
                                                No contact info
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* BIO */}
                        {user.type != "Parent" && (
                            <View style={styles.profileSection}>
                                <Text style={styles.title}>
                                    {user.type != "Club" ? 'Bio' : 'Summary'}
                                </Text>
                                {user.bio ? (
                                    <Text style={styles.paragraph}>
                                        {user.bio}
                                    </Text>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>
                        )}

                        {/* SPORT */}
                        {user.type != "Parent" && (
                            <View style={styles.profileSection}>
                                <Text style={styles.title}>
                                    {user.type === "Scout" || user.type === "Sponsor"
                                        ? 'Interested in'
                                        : `Sport${user.sport?.length > 1 ? 's' : ''}`
                                    }
                                </Text>
                                {user.sport && user.sport.length > 0 ? (
                                    <Text style={styles.paragraph}>
                                        {user.sport.toString()}
                                    </Text>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>
                        )}

                        <View style={styles.profileSection}>
                            {/* COUNTRY */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={styles.title}>
                                    Country
                                </Text>
                                {user.country ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ marginRight: 8 }}>
                                            <CountryFlag isoCode={user.country} size={14} />
                                        </View>
                                        <Text style={styles.paragraph}>
                                            {user.country}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>

                            {/* PLAYS IN TEAMS */}
                            {user.type == "Athlete" && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={styles.title}>
                                    Plays in
                                </Text>
                                {user.memberOf.length > 0 ? (
                                    <View>
                                        <Text style={styles.paragraph}>
                                            {user.memberOf.map(team => team.name).join(", ")}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.paragraph}>0 teams</Text>
                                )}
                            </View>}

                            {/* COACH OF TEAMS */}
                            {user.role == "Coach" && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={styles.title}>
                                    Coach of
                                </Text>
                                {userCoachOf.length > 0 ? (
                                    <View>
                                        <Text style={styles.paragraph}>{userCoachOf.length} {userCoachOf.length == 1 ? 'team' : 'teams'}</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.paragraph}>0 teams</Text>
                                )}
                            </View>}

                            {/* CLUB */}
                            {user.type == "Athlete" && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.title}>
                                        Club
                                    </Text>
                                    {user.club ? (
                                        <View>
                                            {user.isStaff.length == 0 && <Text style={styles.paragraph}>{user.club}</Text>}
                                            {user.isStaff.length > 0 && user.isStaff.map((staff, index) => (
                                                <Text key={index} style={styles.paragraph}>{staff.name}</Text>
                                            ))}
                                        </View>
                                    ) : (
                                        <Text style={styles.paragraph}>-</Text>
                                    )}
                                </View>
                            )}

                            {/* Organization */}
                            {(user.type == "Scout" || user.type == "Sponsor") && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.title}>
                                        Organization
                                    </Text>
                                    {!user.organization?.independent ? (
                                        <View>
                                            <Text style={styles.paragraph}>{user.organization?.name}</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.paragraph}>Independent</Text>
                                    )}
                                </View>
                            )}

                            {/* NUMBER OF SPORTS */}
                            {user.type == "Club" && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.title}>
                                        Total number of sports
                                    </Text>
                                    {user.sport ? (
                                        <View>
                                            <Text style={styles.paragraph}>
                                                {user.sport.length}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.paragraph}>-</Text>
                                    )}
                                </View>
                            )}

                            {/* NUMBER OF TEAMS */}
                            {user.type == "Club" && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.title}>
                                        Total number of teams
                                    </Text>
                                    {user.club ? (
                                        <View>
                                            <Text style={styles.paragraph}>
                                                {user.club.length}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.paragraph}>-</Text>
                                    )}
                                </View>
                            )}

                            {/* NUMBER OF MEMBERS */}
                            {user.type == "Club" && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.title}>
                                        Total number of members
                                    </Text>
                                    {user.children ? (
                                        <View>
                                            <Text style={styles.paragraph}>
                                                {user.children.length}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.paragraph}>-</Text>
                                    )}
                                </View>
                            )}

                            {/* DOB */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={styles.title}>
                                    {user.type == "Club" ? 'Established' : 'Date of Birth'}
                                </Text>
                                {(user.dob?.day && user.dob?.month && user.dob?.year) ? (
                                    <View>
                                        <Text style={styles.paragraph}>{months[user.dob.month - 1]} {user.dob.day}, {user.dob.year}</Text>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={styles.paragraph}>-</Text>
                                    </View>
                                )}
                            </View>

                            {/* HEIGHT */}
                            {user.type == "Athlete" && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.title}>
                                        Height
                                    </Text>
                                    <View>
                                        {user.height ? (
                                            <Text style={styles.paragraph}>{user.height} cm</Text>
                                        ) : (
                                            <Text style={styles.paragraph}>-</Text>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* WEIGHT */}
                            {user.type == "Athlete" && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.title}>
                                        Weight
                                    </Text>
                                    <View>
                                        {user.weight ? (
                                            <Text style={styles.paragraph}>{user.weight} kg</Text>
                                        ) : (
                                            <Text style={styles.paragraph}>-</Text>
                                        )}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* HIGHLIGHTS */}
                        {user.type != "Scout" && user.type != "Sponsor" && (
                            <View style={styles.profileSection}>
                                {user.type != "Parent" && <Text style={styles.title}>
                                    Highlights
                                </Text>}
                                {user.type == "Parent" && <Text style={styles.title}>
                                    Children's Highlights
                                </Text>}
                                {user.highlights ? (
                                    <Text style={styles.paragraph}>{user.highlights}</Text>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>
                        )}

                        {/* STATS */}
                        {user.type != "Scout" && user.type != "Sponsor" && (
                            <View style={styles.profileSection}>
                                {user.type != "Parent" && <Text style={styles.title}>
                                    Stats
                                </Text>}
                                {user.type == "Parent" && <Text style={styles.title}>
                                    Children's Stats
                                </Text>}
                                {user.stats ? (
                                    <Text style={styles.paragraph}>{user.stats}</Text>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>
                        )}

                        {/* ACHIEVEMENTS */}
                        {user.type != "Club" && user.type != "Scout" && user.type != "Sponsor" && (
                            <View style={styles.profileSection}>
                                {user.type != "Parent" && <Text style={styles.title}>
                                    Achievements
                                </Text>}
                                {user.type == "Parent" && <Text style={styles.title}>
                                    Children's Achievements
                                </Text>}
                                {user.achievements ? (
                                    <Text style={styles.paragraph}>{user.achievements}</Text>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>
                        )}

                        {/* EVENTS */}
                        {user.type != "Scout" && user.type != "Sponsor" && (
                            <View style={styles.profileSection}>
                                {user.type != "Parent" && <Text style={styles.title}>
                                    Upcoming Events
                                </Text>}
                                {user.type == "Parent" && <Text style={styles.title}>
                                    Children's Upcoming Events
                                </Text>}
                                {user.events ? (
                                    <Text style={styles.paragraph}>{user.events}</Text>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>
                        )}

                        {/* SKILLS */}
                        {user.type == "Athlete" && (
                            <View style={styles.profileSection}>
                                <Text style={styles.title}>
                                    Skills
                                </Text>
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
                        )}

                        {/* ACIONS */}
                        <View style={[styles.profileSection, styles.profileActions]}>
                            <TouchableOpacity onPress={handleShareProfile} style={styles.profileButton}>
                                <Text style={styles.profileButtonText}>Share Profile</Text>
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
                                <Text style={styles.sectionTitle}>Club Teams</Text>
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
                                    <Text style={styles.emptyStateTitle}>No Teams Yet</Text>
                                    <Text style={styles.emptyStateText}>This club hasn't created any teams yet</Text>
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
                                <Text style={styles.sectionTitle}>Club Schedule</Text>
                            </View>

                            {schedule.length > 0 ? (
                                <View>
                                    {/** Create a Set of event dates for dots */}
                                    {(() => {
                                        const eventDatesSet = new Set(
                                            schedule.map((event) => {
                                                const d = new Date(event.startDateTime);
                                                return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
                                            })
                                        );

                                        const selectedDayEvents = schedule.filter((event) => {
                                            const d = new Date(event.startDateTime);
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
                                                                            styles.eventDot,
                                                                            isSelected && styles.selectedEventDot
                                                                        ]} />
                                                                    )}
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </View>
                                                </View>

                                                <View>
                                                    <Text style={styles.subSectionTitle}>Events of the day - {selectedDate.getDate()} {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</Text>
                                                    {selectedDayEvents.length > 0 ? (
                                                        selectedDayEvents.map((event) => {
                                                            const eventDate = new Date(event.startDateTime);
                                                            const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                            const endTime = new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                                            return (
                                                                <TouchableOpacity
                                                                    key={event._id}
                                                                    style={styles.eventCard}
                                                                    onPress={() => router.push(`/schedule/${event._id}`)}
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
                                                                                <Text style={styles.opponentText}>vs {event.opponent.name}</Text>
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
                                                        <Text style={styles.noEventsText}>No events for this day.</Text>
                                                    )}

                                                    <View style={{ marginTop: 30 }}>
                                                        <Text style={styles.subSectionTitle}>Upcoming Events</Text>
                                                        {schedule.filter(event => new Date(event.startDateTime) > new Date()).length > 0 ? (
                                                            schedule
                                                                .filter(event => new Date(event.startDateTime) > new Date())
                                                                .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)) // optional: sort chronologically
                                                                .map((event) => {
                                                                    const eventDate = new Date(event.startDateTime);
                                                                    const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                                    const endTime = new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                                                    return (
                                                                        <TouchableOpacity
                                                                            key={event._id}
                                                                            style={styles.eventCard}
                                                                            onPress={() => router.push(`/schedule/${event._id}`)}
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
                                                                                        <Text style={styles.opponentText}>vs {event.opponent.name}</Text>
                                                                                    </View>
                                                                                )}
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                    );
                                                                })
                                                        ) : (
                                                            <Text style={styles.noEventsText}>No upcoming events.</Text>
                                                        )}
                                                    </View>
                                                </View>
                                            </>
                                        );
                                    })()}
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateTitle}>No Scheduled Events</Text>
                                    <Text style={styles.emptyStateText}>
                                        {userId === user._id
                                            ? "Add your first event to get started"
                                            : "This club hasn't scheduled any events yet"}
                                    </Text>
                                    {userId === user._id && (
                                        <TouchableOpacity
                                            style={styles.emptyStateButton}
                                            onPress={() => router.push('/schedule/createEvent')}
                                        >
                                            <Text style={styles.emptyStateButtonText}>Create Event</Text>
                                        </TouchableOpacity>
                                    )}
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
                                    <Text style={styles.sectionTitle}>Club Staff</Text>
                                </View>
                                <View>
                                    {staff && staff.data?.map((member, index) => (
                                        <TouchableOpacity
                                            key={member._id}
                                            style={styles.staffCard}
                                            onPress={() => router.push(`/staff/details?id=${member._id}`)}
                                        >
                                            <View style={styles.staffHeader}>
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
                                                    <Text style={styles.staffName}>{member.name}</Text>
                                                    <Text style={styles.staffRole}>{member.role || 'Staff Member'}</Text>
                                                </View>
                                                <View style={styles.staffStats}>
                                                    <Text style={styles.staffStatValue}>
                                                        {member.teams?.length || 0}
                                                    </Text>
                                                    <Text style={styles.staffStatLabel}>
                                                        {member.teams?.length === 1 ? 'Team' : 'Teams'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.staffContact}>
                                                {member.phone && (
                                                    <TouchableOpacity
                                                        style={styles.contactButton}
                                                        onPress={() => Linking.openURL(`tel:${member.phone}`)}
                                                    >
                                                        <FontAwesome5 name="phone" size={16} color="#FF4000" />
                                                        <Text style={styles.contactButtonText}>Call</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {member.email && (
                                                    <TouchableOpacity
                                                        style={styles.contactButton}
                                                        onPress={() => Linking.openURL(`mailto:${member.email}`)}
                                                    >
                                                        <MaterialCommunityIcons name="email-outline" size={16} color="#FF4000" />
                                                        <Text style={styles.contactButtonText}>Email</Text>
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
                                    <Text style={styles.sectionTitle}>Club Staff</Text>
                                </View>
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateTitle}>No Staff Members</Text>
                                    <Text style={styles.emptyStateText}>
                                        This club hasn't added any staff members yet
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
                                    <Text style={styles.sectionTitle}>Club Inventory</Text>
                                    {userId == user._id && (
                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={() => router.push('/inventory/createInventory')}
                                        >
                                            <Text style={styles.addButtonText}>+ Add Item</Text>
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
                                            <View style={styles.inventoryHeader}>
                                                <View style={[styles.inventoryIcon, styles.defaultInventoryIcon]}>
                                                    <FontAwesome5 name="box-open" size={24} color="#fff" />
                                                </View>
                                                <View style={styles.inventoryInfo}>
                                                    <Text style={styles.inventoryName}>{item.itemName}</Text>
                                                    <Text style={styles.inventoryCategory}>{item.category}</Text>
                                                </View>
                                                <View style={styles.inventoryStats}>
                                                    <Text style={styles.inventoryStatValue}>{item.quantity}</Text>
                                                    <Text style={styles.inventoryStatLabel}>In Stock</Text>
                                                </View>
                                            </View>

                                            <View style={styles.inventoryDetails}>
                                                <View style={styles.inventoryDetailRow}>
                                                    <Text style={styles.inventoryDetailLabel}>Unit Price:</Text>
                                                    <Text style={styles.inventoryDetailValue}>${item.unitPrice?.toFixed(2) || '0.00'}</Text>
                                                </View>
                                                {item.description && (
                                                    <View style={styles.inventoryDetailRow}>
                                                        <Text style={styles.inventoryDetailLabel}>Description:</Text>
                                                        <Text style={styles.inventoryDetailValue} numberOfLines={1}>{item.description}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyStateTitle}>No Items</Text>
                                        <Text style={styles.emptyStateText}>
                                            This club hasn't added any inventory items yet
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </Animated.ScrollView>
            }

            <View style={styles.navBar}>
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
    const router = useRouter();

    return (
        <TouchableOpacity
            key={team._id}
            style={styles.teamCard}
            onPress={() => router.push({
                pathname: '/teams/details',
                params: { id: team._id },
            })}
        >
            <View style={styles.teamHeader}>
                {team.image ? (
                    <Image
                        source={{ uri: team.image }}
                        style={styles.teamLogo}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={[styles.teamLogo, styles.defaultTeamLogo]}>
                        <Text style={styles.defaultLogoText}>{team.name?.charAt(0)}</Text>
                    </View>
                )}
                <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamSport}>{team.sport}</Text>
                </View>
                <View style={styles.teamStats}>
                    <Text style={styles.teamStatValue}>{team.members?.length || 0}</Text>
                    <Text style={styles.teamStatLabel}>Members</Text>
                </View>
            </View>

            {team.coaches.length > 0 && (
                <View style={styles.coachSection}>
                    <Text style={styles.coachLabel}>{team.coaches.length == 1 ? 'Coach' : 'Coaches'}</Text>

                    <View style={styles.coachInfoDiv}>
                        {team.coaches.map((coach, index) => (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: '/profile/public',
                                    params: { id: coach._id },
                                })}
                                key={index} style={styles.coachInfo}>
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
                                <Text style={styles.coachName}>{coach.name}</Text>
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
    coachAvatar: {
        width: 25,
        height: 25,
        borderRadius: 15,
        backgroundColor: '#FF4000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    coachName: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#111111',
    },
    logo: {
        width: 120,
        position: 'absolute',
        top: 20,
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
        fontFamily: 'Bebas',
        fontSize: 30,
    },
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Manrope'
    },
    profileSection: {
        marginBottom: 30
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
        fontFamily: 'Bebas'
    },
    profileProgressTextSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profileProgressText: {
        color: 'white',
        fontFamily: 'Bebas',
        fontSize: 24,
    },
    profileProgressImg: {
        width: 15,
        height: 15,
        objectFit: 'contain',
    },
    title: {
        fontFamily: "Bebas",
        fontSize: 20,
        color: 'black'
    },
    subtitle: {
        fontFamily: "Manrope",
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black'
    },
    paragraph: {
        fontFamily: "Manrope",
        fontSize: 16,
        color: 'black'
    },
    ghostText: {
        color: '#ffffff',
        fontSize: 128,
        fontFamily: 'Bebas',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2
    },
    profileImage: {
        position: 'absolute',
        bottom: 0,
        right: -5,
        height: '70%',
        maxWidth: 200,
        overflow: 'hidden',
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
        fontFamily: 'Bebas',
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
    icon: {
        width: 24,
        height: 24,
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
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
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
        fontFamily: 'Bebas',
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
        fontFamily: 'Bebas',
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
        fontFamily: 'Bebas',
        fontSize: 20,
        textAlign: 'center'
    },
    emptyContactInfoBtnText: {
        color: '#FF4000'
    },
    emptyContactInfoBtn: {

    },
    emptyContactInfo: {
        fontFamily: 'Manrope',
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
        fontFamily: 'Manrope',
        fontSize: 16
    },
    adminLink: {
        color: '#FF4000',
        fontSize: 12,
        fontFamily: 'Manrope'
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
        fontFamily: 'Bebas',
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
        fontFamily: 'Manrope',
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
        fontFamily: 'Bebas',
        fontSize: 24,
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        fontFamily: 'Bebas',
        fontSize: 20,
        color: '#111111',
    },
    teamSport: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
    },
    teamStats: {
        alignItems: 'center',
        marginLeft: 10,
    },
    teamStatValue: {
        fontFamily: 'Bebas',
        fontSize: 20,
        color: '#FF4000',
    },
    teamStatLabel: {
        fontFamily: 'Manrope',
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
    coachLabel: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
        marginRight: 10,
    },
    coachInfo: {
        flexDirection: 'row',
        alignItems: 'center',
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
    coachName: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#111111',
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
        fontFamily: 'Manrope',
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
        fontFamily: 'Bebas',
        fontSize: 24,
        color: '#111111',
        marginBottom: 10,
    },
    emptyStateText: {
        fontFamily: 'Manrope',
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
        fontFamily: 'Bebas',
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
        fontFamily: 'Bebas',
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
        fontFamily: 'Manrope',
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
        // backgroundColor: '#dddddd'
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
        fontFamily: 'Manrope',
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
    selectedEventDot: {
        backgroundColor: '#ffffff'
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
        fontFamily: 'Bebas',
        fontSize: 24,
        color: '#FF4000',
    },
    eventMonth: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
        textTransform: 'uppercase',
    },
    eventDetails: {
        flex: 1,
    },
    eventTitle: {
        fontFamily: 'Manrope',
        fontSize: 16,
        color: '#111111',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    eventTime: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
        marginBottom: 3,
    },
    eventLocation: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
    },
    eventAction: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subSectionTitle: {
        fontFamily: 'Bebas',
        fontSize: 20,
        color: '#111111',
        marginBottom: 15,
        marginTop: 10,
    },
    noEventsText: {

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
        fontFamily: 'Bebas',
        fontSize: 20,
        color: '#111111',
    },
    staffRole: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
    },
    staffStats: {
        alignItems: 'center',
        marginLeft: 10,
    },
    staffStatValue: {
        fontFamily: 'Bebas',
        fontSize: 20,
        color: '#FF4000',
    },
    staffStatLabel: {
        fontFamily: 'Manrope',
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
        fontFamily: 'Manrope',
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
        fontFamily: 'Bebas',
        fontSize: 20,
        color: '#111111',
    },
    inventoryCategory: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
    },
    inventoryStats: {
        alignItems: 'center',
        marginLeft: 10,
    },
    inventoryStatValue: {
        fontFamily: 'Bebas',
        fontSize: 20,
        color: '#FF4000',
    },
    inventoryStatLabel: {
        fontFamily: 'Manrope',
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
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
    },
    inventoryDetailValue: {
        fontFamily: 'Manrope',
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
    }
});

