import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { RadarChart } from '@salmonco/react-native-radar-chart';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Image,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CountryFlag from "react-native-country-flag";
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function Profile() {
    const router = useRouter();

    const scrollY = useRef(new Animated.Value(0)).current;
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState(null);
    const [userCoachOf, setUserCoachOf] = useState([]);
    const [schedule, setSchedule] = useState(null);
    const [staff, setStaff] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [paidPayments, setPaidPayments] = useState([]);
    const [unpaidPayments, setUnpaidPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [staffLoading, setStaffLoading] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [financialsLoading, setFinancialsLoading] = useState(true);
    const [clubsLoading, setClubsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Profile');
    const [activePaymentTab, setActivePaymentTab] = useState('pending');
    const [adminUser, setAdminUser] = useState(null);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const tabs = ['Profile', 'Teams', 'Schedule', 'Staff', 'Inventory', 'Financials'];
    const tabsAssociations = ['Profile', 'Clubs'];
    const tabsCoach = ['Profile', 'Teams'];
    const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
    const flexDivRef = useRef(null);
    const [cellWidth, setCellWidth] = useState(0);
    const [cellHeight, setCellHeight] = useState(0);
    const [addingClub, setaddingClub] = useState<string[]>([]);
    const [keyword, setKeyword] = useState('');
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [removingClub, setremovingClub] = useState<string[]>([]);
    const [loadingRemoveClub, setLoadingRemoveClub] = useState<string[]>([]);

    //graph data
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

    const forceLogout = async () => {
        //FORCE LOGOUT -> EMERGENCY USE ONLY
        await SecureStore.deleteItemAsync('userToken');
    }

    useEffect(() => {
        // forceLogout();
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');

            console.log(token)
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log("DECODED: ", decodedToken)
                setUserId(decodedToken.userId);

                const response = await fetch(`https://riyadah.onrender.com/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    setUser(user)

                    if (user.role == "Coach") {
                        const coachteams = await fetch(`https://riyadah.onrender.com/api/teams/byCoach/${user._id}`);

                        if (coachteams.ok) {
                            const coachdata = await coachteams.json();
                            setUserCoachOf(coachdata.data);
                        } else {
                            console.log('Could not get teams of coach');
                        }
                    }
                } else {
                    console.error('API error')
                }
                setLoading(false)
            } else {
                console.log("no token",)
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        getAdminInfo();
    }, [user]);

    const getAdminInfo = async () => {
        if (user.type == "Club") {
            try {
                const res = await fetch(`https://riyadah.onrender.com/api/users/findAdmin?email=${user.admin.email}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await res.json();

                if (data.success) {
                    setAdminUser(data.admin)
                } else {
                    setAdminUser(null)
                }
            } catch (err) {
                console.error('Failed to fetch children', err);
            }
        }
    }

    const getTeams = async () => {
        if (user.type == "Club") {
            const token = await SecureStore.getItemAsync('userToken');

            try {
                const res = await fetch(`https://riyadah.onrender.com/api/teams/club/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const response = await res.json();

                if (response.success) {
                    setTeams(response.data)
                    setTeamsLoading(false);
                } else {
                    setTeams(null)
                }
            } catch (err) {
                console.error('Failed to fetch teams', err);
            }
        }

        if (user.role == "Coach") {
            const token = await SecureStore.getItemAsync('userToken');

            try {
                const res = await fetch(`https://riyadah.onrender.com/api/teams/byCoach/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const response = await res.json();

                if (response.success) {
                    setTeams(response.data)
                    setTeamsLoading(false);
                } else {
                    setTeams(null)
                }
            } catch (err) {
                console.error('Failed to fetch teams', err);
            }
        }
    }

    const getSchedule = async () => {
        if (user.type == "Club") {
            try {
                const res = await fetch(`https://riyadah.onrender.com/api/schedules`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const response = await res.json();

                // console.log(response)

                if (response.success) {
                    setSchedule(response.data)
                    setScheduleLoading(false);
                } else {
                    setSchedule(null)
                }
            } catch (err) {
                console.error('Failed to fetch schedule', err);
            }
        }
    }

    const getStaff = async () => {
        if (user.type == "Club") {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const response = await fetch(`https://riyadah.onrender.com/api/staff/byClub/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                // console.log("data= ", JSON.stringify(data.data, null, 2));

                if (response.ok) {
                    setStaff(data);
                } else {
                    setStaff([]);
                }
            } catch (err) {
                console.error('Failed to fetch staff', err);
                setStaff([]);
            } finally {
                setStaffLoading(false);
            }
        }
    };

    const getInventory = async () => {
        if (user?.type === "Club") {
            try {
                setInventoryLoading(true);
                const token = await SecureStore.getItemAsync('userToken');
                const response = await fetch(`https://riyadah.onrender.com/api/inventory/byClub/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                // console.log(data)
                if (response.ok) {
                    setInventory(data.data);
                } else {
                    setInventory([]);
                }
            } catch (err) {
                console.error('Failed to fetch inventory', err);
                setInventory([]);
            } finally {
                setInventoryLoading(false);
            }
        }
    };

    const getFinancials = async () => {
        if (user?.type === "Club") {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const res = await fetch(`https://riyadah.onrender.com/api/financials/club/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await res.json();
                if (res.ok) {
                    const unpaid = data.data.filter(p => !p.paid);
                    const paid = data.data.filter(p => p.paid);
                    setUnpaidPayments(unpaid);
                    setPaidPayments(paid);
                } else {
                    console.error(data.message);
                }
            } catch (err) {
                console.error('Failed to fetch inventory', err);
                setInventory([]);
            } finally {
                setFinancialsLoading(false)
            }
        };
    }

    const getClubs = async () => {
        setClubs(user.clubs);
        setClubsLoading(false)
        // if (user?.type === "Association") {
        //     try {
        //         const token = await SecureStore.getItemAsync('userToken');
        //         const res = await fetch(`https://riyadah.onrender.com/api/users/clubs/byAssociation/${userId}`, {
        //             headers: { Authorization: `Bearer ${token}` }
        //         });

        //         if (!res.ok) {
        //             throw new Error(`Server error: ${res.status}`);
        //         }

        //         const json = await res.json();
        //         if (json.success) {
        //             setClubs(json.data);
        //         } else {
        //             console.warn('Backend returned error:', json.message);
        //         }
        //     } catch (err) {
        //         console.error('Failed to fetch clubs', err);
        //         setClubs([]);
        //     } finally {
        //         setClubsLoading(false)
        //     }
        // };
    }

    const handleEdit = async () => {
        router.push('/profile/editProfile');
    };

    const handleShareProfile = async () => {
        console.log('Share clicked');
    };

    const getProfileProgress = () => {
        let progress = 0;
        let filledFields = 0;

        if (user.type == "Scout" || user.type == "Sponsor") {
            const totalFields = 8;

            if (user.name != null) filledFields++;
            if (user.email != null) filledFields++;
            if (user.phone != null) filledFields++;
            if (user.country != null) filledFields++;
            if (user.dob?.day != null && user.dob?.month != null && user.dob?.year != null) filledFields++;
            if (user.type != null) filledFields++;
            if (user.sport != null && user.sport.length >= 1) filledFields++;
            if (user.bio != null) filledFields++;

            progress = Math.round((filledFields / totalFields) * 100);

        } else if (user.type == "Club") {
            const totalFields = 11;

            if (user.name != null) filledFields++;
            if (user.email != null) filledFields++;
            if (user.phone != null) filledFields++;
            if (user.country != null) filledFields++;
            if (user.dob?.day != null && user.dob?.month != null && user.dob?.year != null) filledFields++;
            if (user.type != null) filledFields++;
            if (user.sport != null && user.sport.length >= 1) filledFields++;
            if (user.bio != null) filledFields++;
            if (user.highlights != null) filledFields++;
            if (user.stats != null) filledFields++;
            if (user.events != null) filledFields++;

            progress = Math.round((filledFields / totalFields) * 100);

        } else if (user.type == "Association") {
            const totalFields = 8;

            if (user.name != null) filledFields++;
            if (user.email != null) filledFields++;
            if (user.phone != null) filledFields++;
            if (user.country != null) filledFields++;
            if (user.dob?.day != null && user.dob?.month != null && user.dob?.year != null) filledFields++;
            if (user.type != null) filledFields++;
            if (user.sport != null && user.sport.length >= 1) filledFields++;
            if (user.bio != null) filledFields++;

            progress = Math.round((filledFields / totalFields) * 100);

        } else {
            const totalFields = 21;

            if (user.name != null) filledFields++;
            if (user.email != null) filledFields++;
            if (user.phone != null) filledFields++;
            if (user.country != null) filledFields++;
            if (user.dob?.day != null && user.dob?.month != null && user.dob?.year != null) filledFields++;
            if (user.type != null) filledFields++;
            if (user.sport != null && user.sport.length >= 1) filledFields++;
            if (user.club != null) filledFields++;
            if (user.gender != null) filledFields++;
            if (user.bio != null) filledFields++;
            if (user.height != null) filledFields++;
            if (user.weight != null) filledFields++;
            if (user.highlights != null) filledFields++;
            if (user.stats != null) filledFields++;
            if (user.achievements != null) filledFields++;
            if (user.events != null) filledFields++;
            if (user.skills.attack != null) filledFields++;
            if (user.skills.skill != null) filledFields++;
            if (user.skills.stamina != null) filledFields++;
            if (user.skills.speed != null) filledFields++;
            if (user.skills.defense != null) filledFields++;

            progress = Math.round((filledFields / totalFields) * 100);
        }

        return progress;
    };

    const handleGoToAdminProfile = (id: string) => {
        router.push({
            pathname: '/profile/public',
            params: { id: id },
        });
    }

    const updateTab = (label: string) => {
        setActiveTab(label)

        if (label == "Teams") {
            setTeamsLoading(true)
            getTeams();
        }

        if (label == "Schedule") {
            setScheduleLoading(true)
            getSchedule();
        }

        if (label == "Staff") {
            setStaffLoading(true);
            getStaff();
        }

        if (label == "Staff") {
            setInventoryLoading(true);
            getInventory();
        }

        if (label == "Financials") {
            setFinancialsLoading(true);
            getFinancials();
        }

        if (label == "Clubs") {
            setClubsLoading(true);
            getClubs();
        }
    }

    const handleLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        const { height } = event.nativeEvent.layout;
        setCellWidth(width);
        setCellHeight(height);
    };

    const handleSearchInput = (text: string) => {
        setKeyword(text);
        if (text.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        // Clear previous timeout
        if (debounceTimeout) clearTimeout(debounceTimeout);

        // Set new debounce timeout
        const timeout = setTimeout(() => {
            if (text.trim().length >= 3) {
                searchClubs(text);
            } else {
                setSearchResults([]);
            }
        }, 500); // delay: 500ms

        setDebounceTimeout(timeout);
    };

    const searchClubs = async (name: string) => {
        try {
            setSearching(true);
            const res = await fetch(`https://riyadah.onrender.com/api/users/search?keyword=${name}&type=Club`);

            if (res.ok) {
                const data = await res.json();
                // console.log(data)
                setSearchResults(data); // expected array
            } else {
                console.error("Search failed");
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Error during search:", err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleAddClub = async (club: any) => {
        setaddingClub(prev => [...prev, club._id]); // Add to array
        try {
            const alreadyCoach = clubs.some((m: any) => m._id === club._id);
            if (alreadyCoach) {
                setaddingClub(prev => prev.filter(id => id !== club._id));
                return;
            };

            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError('Authentication token missing');
                setaddingClub(prev => prev.filter(id => id !== club._id));
                return;
            }

            const res = await fetch(`https://riyadah.onrender.com/api/users/association/${user._id}/add-club`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    coachIds: [club._id], // sending as an array
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setClubs(data.data);
                setaddingClub(prev => prev.filter(id => id !== club._id));
            } else {
                setaddingClub(prev => prev.filter(id => id !== club._id));
                console.error(data.message);
                setError(data.message || 'Failed to add coach.');
            }
        } catch (err) {
            console.error('Error adding coach:', err);
            setError('Something went wrong while adding the coach.');
        }
    };

    const handleRemoveClub = async (clubid: string) => {
        setLoadingRemoveClub([...loadingRemoveClub, clubid])

        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                throw new Error('Authentication token missing');
            }

            const res = await fetch(`https://riyadah.onrender.com/api/users/association/${user._id}/remove-clubs`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clubsIds: [clubid],
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setUser(prev => prev ? { ...prev, clubs: data.data } : prev);
                setClubs(data.data); // also update clubs array shown in UI
            } else {
                console.error(data.message || 'Failed to remove coach');
            }
        } catch (err) {
            setError('Error removing coach')
            console.log('Error removing coach:', err);
        } finally {
            setLoadingRemoveClub(prev => prev.filter(_id => _id !== clubid));
            setremovingClub(prev => prev.filter(_id => _id !== clubid));
        }
    }

    // Get or create animated value
    const getAnimatedValue = (memberId: string) => {
        if (!animatedValues.current[memberId]) {
            animatedValues.current[memberId] = new Animated.Value(0);
        }
        return animatedValues.current[memberId];
    };

    // Animate to 0 or 1
    const animateDeleteBtn = (memberId: string, toValue: number) => {
        const animVal = getAnimatedValue(memberId);
        Animated.timing(animVal, {
            toValue,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const animateRemoveBtn = (coachId: string, toValue: number) => {
        const animVal = getAnimatedValue(coachId);
        Animated.timing(animVal, {
            toValue,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const [loadingDelete, setLoadingDelete] = useState<string[]>([]);


    const deleteTeam = (teamid: string) => {
        animateDeleteBtn(teamid, 1);
    }

    const cancelDeleteTeam = (teamid: string) => {
        // setLoadingDelete((prev) => prev.filter((id) => id !== teamid));
        animateDeleteBtn(teamid, 0);
    }

    const handleDeleteTeam = async (teamid: string) => {
        setLoadingDelete((prev) => [...prev, teamid]);

        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                throw new Error('Authentication token missing');
            }

            const res = await fetch(`https://riyadah.onrender.com/api/teams/${teamid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });

            const data = await res.json();

            if (res.ok) {
                setTeams(prev => prev.filter(team => team._id !== teamid));
            } else {
                console.error(data.message || 'Failed to remove member');
            }
        } catch (err) {
            setError('Error removing team')
            console.log('Error removing team:', err);
        } finally {
            setLoadingDelete(prev => prev.filter(_id => _id !== teamid));
            // setRemovingMember(prev => prev.filter(_id => _id !== memberid));
        }
    }

    const getUserClubs = () => {
        if (!user) return;

        const teams = user.memberOf || [];
        const staffAt = user.isStaff || [];

        const clubsFromTeams = teams
            .map(team => team.club)
            .filter(Boolean);

        const allClubs = [...clubsFromTeams, ...staffAt];

        // Deduplicate based on _id
        const seenClubIds = new Set();
        const uniqueClubs = [];

        allClubs.forEach(club => {
            if (club && club._id && !seenClubIds.has(club._id.toString())) {
                seenClubIds.add(club._id.toString());
                uniqueClubs.push(club); // full object
            }
        });


        if (uniqueClubs.length > 1) {
            return `${uniqueClubs.length} clubs`;
        } else if (uniqueClubs.length === 1) {
            return uniqueClubs[0].name; // full club object
        } else {
            return null;
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

                {!loading && <>
                    {userId == user._id ? (
                        <View style={styles.profileImage}>
                            <TouchableOpacity onPress={() => router.push('/profile/uploadAvatar')}>
                                {(user.image == null || user.image == "") && (user.type == "Club" || user.type == "Association") && <Image
                                    source={require('../../assets/clublogo.png')}
                                    style={[styles.profileImageAvatar, { transform: [{ translateX: -10 }] }]}
                                    resizeMode="contain"
                                />}
                                {(user.image == null || user.image == "") && user.gender == "Male" && <Image
                                    source={require('../../assets/avatar.png')}
                                    style={styles.profileImageAvatar}
                                    resizeMode="contain"
                                />}
                                {(user.image == null || user.image == "") && user.gender == "Female" && <Image
                                    source={require('../../assets/avatarF.png')}
                                    style={styles.profileImageAvatar}
                                    resizeMode="contain"
                                />}
                                {user.image != null && <Image
                                    source={{ uri: user.image }}
                                    style={styles.profileImageAvatar}
                                    resizeMode="contain"
                                />}
                            </TouchableOpacity>

                            {(user.image == null || user.image == "") &&
                                <TouchableOpacity style={styles.uploadImage} onPress={() => router.push('/profile/uploadAvatar')}>
                                    <Entypo name="plus" size={20} color="#FF4000" />
                                    <Text style={styles.uploadImageText}>
                                        {(user.type == "Club" || user.type == "Association") ? 'Upload logo' : 'Upload avatar'}
                                    </Text>
                                </TouchableOpacity>
                            }

                            {user.image != null && user.image != "" &&
                                <TouchableOpacity style={[styles.uploadImage, { padding: 5, }]} onPress={() => router.push('/profile/uploadAvatar')}>
                                    <FontAwesome name="refresh" size={16} color="#FF4000" />
                                    <Text style={[styles.uploadImageText, { marginLeft: 5 }]}>
                                        {(user.type == "Club" || user.type == "Association") ? 'Change logo' : 'Change avatar'}
                                    </Text>
                                </TouchableOpacity>
                            }
                        </View>
                    ) : (
                        <View style={styles.profileImage}>
                            {(user.image == null || user.image == "") && (user.type == "Club" || user.type == "Association") && <Image
                                source={require('../../assets/clublogo.png')}
                                style={[styles.profileImageAvatar, { transform: [{ translateX: -10 }] }]}
                                resizeMode="contain"
                            />}
                            {(user.image == null || user.image == "") && user.gender == "Male" && <Image
                                source={require('../../assets/avatar.png')}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />}
                            {(user.image == null || user.image == "") && user.gender == "Female" && <Image
                                source={require('../../assets/avatarF.png')}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />}
                            {user.image != null && <Image
                                source={{ uri: user.image }}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />}
                        </View>
                    )}
                </>}

            </Animated.View>

            {/* Tabs for clubs */}
            {!loading && user?.type === "Club" && (

                <View style={styles.tabs}>
                    {tabs.map((label, index) => (
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

            {/* Tabs for associations */}
            {!loading && user?.type === "Association" && (

                <View style={styles.tabs}>
                    {tabsAssociations.map((label, index) => (
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

            {/* Tabs for Coach */}
            {!loading && user?.role === "Coach" && (

                <View style={styles.tabs}>
                    {tabsCoach.map((label, index) => (
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

            {false && <View>
                <TouchableOpacity onPress={() => { router.push("/feedbackForm") }}>
                    <Text>Form</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/attendanceSheet',
                        params: { teamId: '686e736b35ef2e1ae46fb24b' },
                    })}
                >
                    <Text>Attendance</Text>
                </TouchableOpacity>
            </View>}


            {/* profileTab */}
            {!loading && user && activeTab == "Profile" && <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >

                <View style={styles.contentContainer}>
                    {userId == user._id && (getProfileProgress() < 100) && <TouchableOpacity style={[styles.profileSection, styles.profileProgress]} onPress={handleEdit}>
                        <View style={styles.profileProgressPercentage}>
                            <Text style={styles.profileProgressPercentageText}>{getProfileProgress()} %</Text>
                        </View>
                        <View style={styles.profileProgressTextSection}>
                            <Text style={styles.profileProgressText}>Complete your profile now</Text>
                            <Image
                                style={styles.profileProgressImg}
                                source={require('../../assets/rightArrow.png')}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                    }

                    {user.type == "Club" && user.admin.email != null &&
                        <View style={styles.adminDiv}>
                            <Text style={[styles.title, styles.contactTitle]}>
                                Admin
                            </Text>

                            {adminUser &&
                                <TouchableOpacity style={styles.adminButton} onPress={() => { handleGoToAdminProfile(adminUser.id) }}>
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
                                            <Text style={styles.adminLink}>Check profile</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            }

                            {adminUser == null &&
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
                            }
                        </View>
                    }


                    {/* CONTACT INFO */}
                    {user.type != "Parent" && <View style={[styles.profileSection, { backgroundColor: '#eeeeee', borderRadius: 10, padding: 5, marginBottom: 20 }]}>
                        {(user.contactInfo?.phone != null || user.contactInfo?.email != null || user.contactInfo?.facebook != null
                            || user.contactInfo?.instagram != null || user.contactInfo?.whatsapp != null || user.contactInfo?.telegram != null
                            || user.contactInfo?.tiktok != null || user.contactInfo?.snapchat != null || user.contactInfo?.location.latitude != null
                            || user.contactInfo?.location.longitude != null || user.contactInfo?.description != null) ?
                            (
                                <View>
                                    <Text style={[styles.title, styles.contactTitle]}>
                                        CONTACT
                                    </Text>
                                    <View>
                                        {user.contactInfo?.description != null && user.type == "Club" &&
                                            <View style={styles.contactDescription}>
                                                <Text>{user.contactInfo?.description}</Text>
                                            </View>
                                        }
                                        <View style={styles.contactInfo}>
                                            {user.contactInfo?.phone != null &&
                                                <View style={styles.contactItem}>
                                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`tel:${user.contactInfo.phone}`)}>
                                                        <FontAwesome6 name="phone" size={24} color="#000" />
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                            {user.contactInfo?.email != null &&
                                                <View style={styles.contactItem}>
                                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`mailto:${user.contactInfo.email}`)}>
                                                        <MaterialCommunityIcons name="email-outline" size={24} color="#000" />
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                            {user.contactInfo?.facebook != null &&
                                                <View style={styles.contactItem}>
                                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.facebook.com/${user.contactInfo.facebook}`)}>
                                                        <FontAwesome name="facebook" size={24} color="#000" />
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                            {user.contactInfo?.instagram != null &&
                                                <View style={styles.contactItem}>
                                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.instagram.com/${user.contactInfo.instagram}`)}>
                                                        <FontAwesome name="instagram" size={24} color="#000" />
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                            {user.contactInfo?.whatsapp != null &&
                                                <View style={styles.contactItem}>
                                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://wa.me/${user.contactInfo.whatsapp}`)}>
                                                        <FontAwesome name="whatsapp" size={24} color="#000" />
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                            {user.contactInfo?.telegram != null &&
                                                <View style={styles.contactItem}>
                                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://t.me/${user.contactInfo.telegram}`)}>
                                                        <FontAwesome5 name="telegram-plane" size={24} color="#000" />
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                            {user.contactInfo?.tiktok != null &&
                                                <View style={styles.contactItem}>
                                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.tiktok.com/@${user.contactInfo.tiktok}`)}>
                                                        <FontAwesome6 name="tiktok" size={24} color="#000" />
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                            {user.contactInfo?.snapchat != null &&
                                                <View style={styles.contactItem}>
                                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.snapchat.com/add/${user.contactInfo.snapchat}`)}>
                                                        <FontAwesome name="snapchat-ghost" size={24} color="#000" />
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                        </View>

                                        {user.contactInfo?.location.latitude != null && user.contactInfo?.location.longitude != null &&
                                            <View style={styles.contactLocation}>
                                                <View style={styles.map}>
                                                    <MapView
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
                                                            Alert.alert("Error", "Could not open map.");
                                                            console.error(error);
                                                        }
                                                    }}>
                                                    <Text style={styles.locationLinkText}>Get Directions</Text>
                                                </TouchableOpacity>
                                            </View>
                                        }
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' }}>
                                        <Text style={[styles.title, styles.contactTitle, { marginBottom: 0 }]}>
                                            CONTACT
                                        </Text>

                                        {userId == user._id && <TouchableOpacity onPress={handleEdit} style={styles.emptyContactInfoBtn}>
                                            <Text style={styles.emptyContactInfoBtnText}>+Add contact info</Text>
                                        </TouchableOpacity>}

                                    </View>
                                    <View>
                                        <Text style={[styles.emptyContactInfo, { marginBottom: 5 }]}>
                                            No contact info
                                        </Text>
                                    </View>
                                </View>
                            )
                        }
                    </View>}

                    {/* BIO */}
                    {user.type != "Parent" && <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            {(user.type != "Club" && user.type != "Association") ? 'Bio' : 'Summary'}
                        </Text>
                        {user.bio ? (
                            <Text style={styles.paragraph}>
                                {user.bio}
                            </Text>
                        ) : (
                            <Text style={styles.paragraph}>-</Text>
                        )}

                    </View>}

                    {/* SPORT */}
                    {user.type != "Parent" && <View style={styles.profileSection}>
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
                    </View>}


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
                                    <Text style={styles.paragraph}>{user.memberOf.toString()}</Text>
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
                        {user.type == "Athlete" && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Club
                            </Text>
                            {user.clubs && (
                                <View>
                                    {(user.clubs.length == 0 && (!user.memberOf || user.memberOf == null || user.memberOf.length == 0) && (!user.isStaff || user.isStaff == null || user.isStaff.length == 0)) &&
                                        <Text style={styles.paragraph}>Independent</Text>
                                    }

                                    {user.clubs.length == 0 && ((user.memberOf && user.memberOf != null && user.memberOf.length > 0) || (user.isStaff && user.isStaff != null && user.isStaff.length > 0)) &&
                                        <Text style={styles.paragraph}>{getUserClubs()}</Text>
                                    }

                                    {user.clubs.length > 0 && ((user.memberOf && user.memberOf != null && user.memberOf.length > 0) || (user.isStaff && user.isStaff != null && user.isStaff.length > 0)) && (
                                        (() => {
                                            const additionalClubs = getUserClubs();
                                            const currentClubName = user.clubs[0].name;

                                            if (!additionalClubs || additionalClubs === currentClubName) {
                                                return <Text style={styles.paragraph}>{currentClubName}</Text>;
                                            } else {
                                                return (
                                                    <Text style={styles.paragraph}>
                                                        {currentClubName} and {additionalClubs.replace('clubs', 'more clubs')}
                                                    </Text>
                                                );
                                            }
                                        })
                                    )}
                                </View>
                            )}
                        </View>}

                        {/* Organization */}
                        {(user.type == "Scout" || user.type == "Sponsor") && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Organization
                            </Text>
                            {!user.organization.independent ? (
                                <View>
                                    <Text style={styles.paragraph}>{user.organization.name}</Text>
                                </View>
                            ) : (
                                <Text style={styles.paragraph}>Independent</Text>
                            )}
                        </View>}

                        {/* NUMBER OF SPORTS */}
                        {user.type == "Club" && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                        </View>}

                        {/* NUMBER OF TEAMS */}
                        {user.type == "Club" && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Total number of teams
                            </Text>
                            {user.teams ? (
                                <View>
                                    <Text style={styles.paragraph}>
                                        {user.teams.length}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.paragraph}>-</Text>
                            )}
                        </View>}

                        {/* NUMBER OF MEMBERS */}
                        {user.type == "Club" && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Total number of members
                            </Text>
                            {teams ? (
                                <View>
                                    <Text style={styles.paragraph}>
                                        {teams.reduce((total, team) => total + (team.members?.length || 0), 0)}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.paragraph}>-</Text>
                            )}
                        </View>}

                        {/* DOB */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                {(user.type == "Club" || user.type == "Association") ? 'Established' : 'Date of Birth'}
                            </Text>
                            {(user.dob.day && user.dob.month && user.dob.year) ? (
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
                        {user.type == "Athlete" && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                        </View>}

                        {/* WEIGHT */}
                        {user.type == "Athlete" && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                        </View>}
                    </View>

                    {/* HIGHLIGHTS */}
                    {user.type != "Scout" && user.type != "Sponsor" && user.type != "Association" && <View style={styles.profileSection}>
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

                    </View>}

                    {/* STATS */}
                    {user.type != "Scout" && user.type != "Sponsor" && user.type != "Association" && <View style={styles.profileSection}>
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
                    </View>}

                    {/* ACHIEVEMENTS */}
                    {user.type != "Club" && user.type != "Scout" && user.type != "Association" && user.type != "Sponsor" && <View style={styles.profileSection}>
                        {user.type != "Parent" && <Text style={styles.title}>
                            Achievements
                        </Text>
                        }
                        {user.type == "Parent" && <Text style={styles.title}>
                            Children's Achievements
                        </Text>
                        }
                        {user.achievements ? (
                            <Text style={styles.paragraph}>{user.achievements}</Text>
                        ) : (
                            <Text style={styles.paragraph}>-</Text>
                        )}
                    </View>}

                    {/* EVENTS */}
                    {user.type != "Scout" && user.type != "Sponsor" && user.type != "Association" && <View style={styles.profileSection}>
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
                    </View>}

                    {/* SKILLS */}
                    {user.type == "Athlete" && <View style={styles.profileSection}>
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
                    </View>}

                    {/* ACIONS */}
                    {userId == user._id && <View style={[styles.profileSection, styles.profileActions]}>
                        <TouchableOpacity onPress={handleEdit} style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>Edit profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShareProfile} style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>Share Profile</Text>
                        </TouchableOpacity>
                    </View>}
                </View>
            </Animated.ScrollView>
            }

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
                                {userId == user._id && (
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => router.push('/teams/createTeam')}
                                    >
                                        <Text style={styles.addButtonText}>+ Add Team</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {teams && teams.length > 0 ? (
                                teams.map((team) => (
                                    <TeamCard
                                        key={team._id}
                                        team={team}
                                        getAnimatedValue={getAnimatedValue}
                                        loadingDelete={loadingDelete}
                                        deleteTeam={deleteTeam}
                                        cancelDeleteTeam={cancelDeleteTeam}
                                        handleDeleteTeam={handleDeleteTeam}
                                    />
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    {/* <Image
                                    source={require('../../assets/empty_teams.png')}
                                    style={styles.emptyStateImage}
                                    resizeMode="contain"
                                /> */}
                                    <Text style={styles.emptyStateTitle}>No Teams Yet</Text>
                                    <Text style={styles.emptyStateText}>
                                        {userId == user._id
                                            ? "Create your first team to get started"
                                            : "This club hasn't created any teams yet"}
                                    </Text>
                                    {userId == user._id && (
                                        <TouchableOpacity
                                            style={styles.emptyStateButton}
                                            onPress={() => router.push('/teams/createTeam')}
                                        >
                                            <Text style={styles.emptyStateButtonText}>Create Team</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </Animated.ScrollView>
            }

            {/* clubsTab */}
            {
                !loading && user && activeTab == "Clubs" && <Animated.ScrollView
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {clubsLoading ? (
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
                            {/* <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Association Clubs</Text>
                                {userId == user._id && (
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => router.push('/clubs/manage')}
                                    >
                                        <Text style={styles.addButtonText}>Manage clubs</Text>
                                    </TouchableOpacity>
                                )}
                            </View> */}

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={styles.sectionTitle}>{clubs.length} Association club{clubs.length == 1 ? '' : 's'}</Text>

                                {user._id == userId && !editMode &&
                                    <TouchableOpacity style={styles.editToggle} onPress={() => { setKeyword(''); setEditMode(true) }}>
                                        <Entypo name="edit" size={16} color="#FF4000" />
                                        <Text style={styles.editToggleText}>Manage</Text>
                                    </TouchableOpacity>}

                                {user._id == userId && editMode &&
                                    <TouchableOpacity style={styles.editToggle} onPress={() => { setEditMode(false) }}>
                                        <AntDesign name="close" size={16} color="#FF4000" />
                                        <Text style={styles.editToggleText}>Cancel</Text>
                                    </TouchableOpacity>}
                            </View>

                            {editMode && <View>
                                <View style={{ marginBottom: 16 }}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="search clubs (min. 3 characters)"
                                        placeholderTextColor="#A8A8A8"
                                        value={keyword}
                                        onChangeText={handleSearchInput}
                                    />
                                    {searching &&
                                        <ActivityIndicator
                                            size="small"
                                            color="#FF4000"
                                            style={styles.searchLoader}
                                        />
                                    }
                                </View>
                                {keyword.trim().length >= 3 && !searching && (
                                    <View style={{ marginBottom: 15 }}>
                                        {searchResults.length > 0 && !searching &&
                                            searchResults.map((club) => {
                                                const alreadyCoach = clubs.some((m) => m._id === club._id);

                                                return (
                                                    <View key={club._id}>
                                                        <TouchableOpacity
                                                            style={styles.searchResultItem}
                                                            onPress={() => !alreadyCoach && handleAddClub(club)}
                                                            disabled={alreadyCoach}
                                                        >
                                                            <View style={styles.searchResultItemImageContainer}>
                                                                {club.image ? (
                                                                    <Image
                                                                        style={styles.searchResultItemImage}
                                                                        source={{ uri: club.image }}
                                                                    />
                                                                ) : (
                                                                    <Image
                                                                        style={styles.searchResultItemImage}
                                                                        source={require('../../assets/clublogo.png')}
                                                                        resizeMode="contain"
                                                                    />
                                                                )}
                                                            </View>
                                                            <View style={styles.searchResultItemInfo}>
                                                                <View>
                                                                    <Text style={styles.searchResultItemName}>{club.name}</Text>
                                                                    {/* <Text style={[styles.searchResultItemDescription, club.sport == null && { opacity: 0.5, fontStyle: 'italic' }]}>{club.sport || 'no sport'}</Text> */}
                                                                </View>
                                                                {addingClub.includes(club._id) ? (
                                                                    <ActivityIndicator
                                                                        size="small"
                                                                        color="#FF4000"
                                                                    />
                                                                ) : (
                                                                    <Text
                                                                        style={
                                                                            [
                                                                                styles.searchResultItemLink,
                                                                                alreadyCoach && { color: 'gray', fontStyle: 'italic' }
                                                                            ]
                                                                        }
                                                                    >
                                                                        {alreadyCoach ? 'Already added' : '+ Add'}
                                                                    </Text>
                                                                )}

                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            })
                                        }

                                        {searchResults.length == 0 && !searching &&
                                            <View>
                                                <Text style={[styles.searchNoResultText, { marginBottom: 15 }]}>
                                                    No results
                                                </Text>
                                            </View>
                                        }
                                    </View>
                                )}
                            </View>}

                            {clubs && clubs.length > 0 ? (
                                <View style={{ marginBottom: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
                                        {clubs.map((club) => {
                                            const animVal = getAnimatedValue(club._id);
                                            const animatedWidth = animVal.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [25, cellWidth],
                                            });
                                            const animatedHeight = animVal.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [25, cellHeight],
                                            });
                                            const animatedColor = animVal.interpolate({
                                                inputRange: [0, 0],
                                                outputRange: ['#FF4000', '#000000'],
                                            });
                                            const animatedPositionTopLeft = animVal.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-5, 0],
                                            });
                                            const animatedRadius = animVal.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [15, 8],
                                            });
                                            const animatedOpacity = animVal.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 1],
                                            });

                                            return (
                                                <View
                                                    ref={flexDivRef}
                                                    onLayout={handleLayout}
                                                    key={club._id}
                                                    style={{
                                                        alignItems: 'center',
                                                        width: '30.64%',
                                                        position: 'relative',
                                                    }}
                                                >
                                                    {user._id == userId && editMode && (
                                                        <Animated.View
                                                            style={{
                                                                width: animatedWidth,
                                                                height: animatedHeight,
                                                                backgroundColor: animatedColor,
                                                                borderRadius: animatedRadius,
                                                                position: 'absolute',
                                                                top: animatedPositionTopLeft,
                                                                left: animatedPositionTopLeft,
                                                                zIndex: 2,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            {removingClub.includes(club._id) ? (
                                                                <View style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    {loadingRemoveClub.includes(club._id) ? (
                                                                        <ActivityIndicator size="small" color={'#FF4000'} style={{ transform: [{ scale: 1.5 }] }} />
                                                                    ) : (
                                                                        <Animated.View style={{
                                                                            opacity: animatedOpacity,
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            <Text style={{ color: '#FF4000', fontFamily: 'Bebas', fontSize: 22, marginBottom: 30 }}>
                                                                                Sure?
                                                                            </Text>
                                                                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                                                                <TouchableOpacity onPress={() => handleRemoveClub(club._id)}>
                                                                                    <Text
                                                                                        style={{
                                                                                            fontFamily: 'Bebas',
                                                                                            fontSize: 22,
                                                                                            color: '#000',
                                                                                            paddingHorizontal: 5,
                                                                                            backgroundColor: '#6ef99dff',
                                                                                            borderRadius: 5,
                                                                                        }}
                                                                                    >
                                                                                        Yes
                                                                                    </Text>
                                                                                </TouchableOpacity>
                                                                                <TouchableOpacity
                                                                                    onPress={() => {
                                                                                        animateRemoveBtn(club._id, 0);
                                                                                        setremovingClub((prev) => prev.filter((id) => id !== club._id));
                                                                                    }}
                                                                                >
                                                                                    <Text
                                                                                        style={{
                                                                                            fontFamily: 'Bebas',
                                                                                            fontSize: 22,
                                                                                            color: '#000',
                                                                                            paddingHorizontal: 8,
                                                                                            backgroundColor: '#f97d7dff',
                                                                                            borderRadius: 5,
                                                                                        }}
                                                                                    >
                                                                                        No
                                                                                    </Text>
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        </Animated.View>
                                                                    )}
                                                                </View>
                                                            ) : (
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        setremovingClub((prev) => [...prev, club._id]);
                                                                        animateRemoveBtn(club._id, 1);
                                                                    }}
                                                                >
                                                                    <AntDesign name="closecircle" size={25} color="#000" />
                                                                </TouchableOpacity>
                                                            )}
                                                        </Animated.View>
                                                    )}

                                                    <TouchableOpacity
                                                        style={{
                                                            alignItems: 'center',
                                                            padding: 10,
                                                            borderRadius: 8,
                                                            backgroundColor: '#eeeeee',
                                                        }}
                                                        onPress={() =>
                                                            router.push({
                                                                pathname: '/profile/public',
                                                                params: { id: club._id },
                                                            })
                                                        }
                                                    >
                                                        <View style={{ marginBottom: 10 }}>
                                                            {club.image ? (
                                                                <View
                                                                    style={[
                                                                        styles.searchResultItemImageContainer,
                                                                        {
                                                                            width: '100%',
                                                                            backgroundColor: '#dddddd',
                                                                            borderRadius: 100,
                                                                            overflow: 'hidden',
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Image
                                                                        source={{ uri: club.image }}
                                                                        style={{ width: '100%', aspectRatio: 1 }}
                                                                    />
                                                                </View>
                                                            ) : (
                                                                <View
                                                                    style={[
                                                                        styles.searchResultItemImageContainer,
                                                                        {
                                                                            width: '100%',
                                                                            backgroundColor: '#dddddd',
                                                                            borderRadius: 100,
                                                                            overflow: 'hidden',
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Image
                                                                        style={styles.searchResultItemImage}
                                                                        source={
                                                                            require('../../assets/clublogo.png')
                                                                        }
                                                                        resizeMode="contain"
                                                                    />
                                                                </View>
                                                            )}
                                                        </View>
                                                        <Text>{club?.name?.trim()}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateTitle}>No Clubs Yet</Text>
                                    <Text style={styles.emptyStateText}>
                                        {userId == user._id
                                            ? "Add your first club to get started"
                                            : "This Association hasn't added any clubs yet"}
                                    </Text>
                                    {userId == user._id && (
                                        <TouchableOpacity
                                            style={styles.emptyStateButton}
                                            onPress={() => { setKeyword(''); setEditMode(true) }}
                                        >
                                            <Text style={styles.emptyStateButtonText}>Add Clubs</Text>
                                        </TouchableOpacity>
                                    )}
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
                                {userId == user._id && (
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => router.push('/schedule/createEvent')}
                                    >
                                        <Text style={styles.addButtonText}>+ Add Event</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {schedule.length > 0 ? (
                                <View>
                                    {/** Create a Set of event dates for dots */}
                                    {(() => {
                                        const eventDatesSet = new Set(
                                            schedule.map((event) => {
                                                const d = new Date(event.startDateTime);
                                                return d.toISOString().split('T')[0];
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
                                                    <Text style={styles.monthHeader}>July 2025</Text>
                                                    <View style={styles.daysOfWeek}>
                                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                            <Text key={day} style={styles.dayHeader}>
                                                                {day}
                                                            </Text>
                                                        ))}
                                                    </View>

                                                    <View style={styles.calendarGrid}>
                                                        {Array.from({ length: 31 }).map((_, i) => {
                                                            const day = i + 1;
                                                            const dateStr = `2025-07-${String(day).padStart(2, '0')}`;
                                                            const isToday =
                                                                new Date().getDate() === day &&
                                                                new Date().getMonth() === 6 &&
                                                                new Date().getFullYear() === 2025;
                                                            const isSelected =
                                                                selectedDate.getDate() === day &&
                                                                selectedDate.getMonth() === 6 &&
                                                                selectedDate.getFullYear() === 2025;

                                                            return (
                                                                <TouchableOpacity
                                                                    key={day}
                                                                    style={[
                                                                        styles.calendarDay,
                                                                        isToday && styles.currentDay,
                                                                        isSelected && styles.selectedDay,
                                                                    ]}
                                                                    onPress={() => setSelectedDate(new Date(`2025-07-${day}`))}
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
                                                                    {eventDatesSet.has(dateStr) && (
                                                                        <View style={styles.eventDot} />
                                                                    )}
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </View>
                                                </View>

                                                <View>
                                                    <Text style={styles.subSectionTitle}>Upcoming Events</Text>
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
                                    {userId == user._id && (
                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={() => router.push('/staff/createStaff')}
                                        >
                                            <Text style={styles.addButtonText}>+ Add Staff</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View>
                                    {staff && staff.data?.map((member, index) => (
                                        <TouchableOpacity
                                            key={member._id}
                                            style={styles.staffCard}
                                            onPress={() => router.push(`/staff/details?id=${member._id}`)}
                                        >
                                            <View style={styles.staffHeader}>
                                                {member.userRef.image ? (
                                                    <Image
                                                        source={{ uri: member.userRef.image }}
                                                        style={styles.staffAvatar}
                                                        resizeMode="contain"
                                                    />
                                                ) : (
                                                    <View style={[styles.staffAvatar, styles.defaultStaffAvatar]}>
                                                        <FontAwesome5 name="user" size={24} color="#fff" />
                                                    </View>
                                                )}
                                                <View style={styles.staffInfo}>
                                                    <Text style={styles.staffName}>{member.userRef.name}</Text>
                                                    <Text style={styles.staffRole}>{member.role || 'Staff Member'}</Text>
                                                </View>
                                                {member.role == "Coach" && <View style={styles.staffStats}>
                                                    <Text style={styles.staffStatValue}>
                                                        {member.teams?.length || 0}
                                                    </Text>
                                                    <Text style={styles.staffStatLabel}>
                                                        {member.teams?.length === 1 ? 'Team' : 'Teams'}
                                                    </Text>
                                                </View>}
                                            </View>

                                            <View style={styles.staffContact}>
                                                {member.userRef.phone ? (
                                                    <TouchableOpacity
                                                        style={styles.contactButton}
                                                        onPress={() => Linking.openURL(`tel:${member.userRef.phone}`)}
                                                    >
                                                        <FontAwesome5 name="phone" size={16} color="#FF4000" />
                                                        <Text style={styles.contactButtonText}>Call</Text>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity
                                                        style={[styles.contactButton, { opacity: 0.5 }]}
                                                        disabled={true}
                                                        onPress={() => { }}
                                                    >
                                                        <FontAwesome5 name="phone" size={16} color="#FF4000" />
                                                        <Text style={styles.contactButtonText}>Call</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {member.userRef.email ? (
                                                    <TouchableOpacity
                                                        style={styles.contactButton}
                                                        onPress={() => Linking.openURL(`mailto:${member.userRef.email}`)}
                                                    >
                                                        <MaterialCommunityIcons name="email-outline" size={16} color="#FF4000" />
                                                        <Text style={styles.contactButtonText}>Email</Text>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity
                                                        style={[styles.contactButton, { opacity: 0.5 }]}
                                                        disabled={true}
                                                        onPress={() => { }}
                                                    >
                                                        <MaterialCommunityIcons name="email-outline" size={16} color="#FF4000" />
                                                        <Text style={styles.contactButtonText}>Email</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {member.role == "Coach" && (
                                                    <TouchableOpacity
                                                        style={styles.contactButton}
                                                        onPress={() => console.log(member._id)}
                                                    >
                                                        <AntDesign name="team" size={16} color="#FF4000" />
                                                        <Text style={styles.contactButtonText}>View teams</Text>
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
                                    {userId == user._id && (
                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={() => router.push('/staff/createStaff')}
                                        >
                                            <Text style={styles.addButtonText}>+ Add Staff</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateTitle}>No Staff Members</Text>
                                    <Text style={styles.emptyStateText}>
                                        {userId == user._id
                                            ? "Add your first staff member to get started"
                                            : "This club hasn't added any staff members yet"}
                                    </Text>
                                    {userId == user._id && (
                                        <TouchableOpacity
                                            style={styles.emptyStateButton}
                                            onPress={() => router.push('/staff/createStaff')}
                                        >
                                            <Text style={styles.emptyStateButtonText}>Add Staff</Text>
                                        </TouchableOpacity>
                                    )}
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
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                                                    <Text style={styles.inventoryDetailValue}>{item.unitPrice}</Text>
                                                </View>
                                                {item.description && (
                                                    <View style={[styles.inventoryDetailRow, { marginTop: 5 }]}>
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
                                            {userId == user._id
                                                ? "Add your first inventory item to get started"
                                                : "This club hasn't added any inventory items yet"}
                                        </Text>
                                        {userId == user._id && (
                                            <TouchableOpacity
                                                style={styles.emptyStateButton}
                                                onPress={() => router.push('/inventory/createInventory')}
                                            >
                                                <Text style={styles.emptyStateButtonText}>Add Item</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </Animated.ScrollView>
            }

            {/* FinancialsTab */}
            {
                !loading && user && activeTab == "Financials" && <Animated.ScrollView
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    <View style={styles.contentContainer}>
                        {financialsLoading ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ActivityIndicator
                                    size="small"
                                    color="#FF4000"
                                    style={{ transform: [{ scale: 1.25 }] }}
                                />
                            </View>
                        ) : (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Club Financials</Text>
                                    {userId == user._id && (
                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={() => router.push('/payments/createPayment')}
                                        >
                                            <Text style={styles.addButtonText}>+ Add Payment</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {(unpaidPayments && unpaidPayments.length > 0) || (paidPayments && paidPayments.length > 0) ? (
                                    <View>
                                        <View style={styles.sectionTabs}>
                                            <TouchableOpacity style={[
                                                styles.sectionTab,
                                                activePaymentTab == "pending" && styles.sectionTabActive
                                            ]}
                                                onPress={() => { setActivePaymentTab('pending') }}
                                            >
                                                <Text style={styles.sectionTabText}>Pending</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[
                                                styles.sectionTab,
                                                activePaymentTab == "paid" && styles.sectionTabActive
                                            ]}
                                                onPress={() => { setActivePaymentTab('paid') }}
                                            >
                                                <Text style={styles.sectionTabText}>Paid</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {activePaymentTab == "pending" &&
                                            <>
                                                {/* <Text style={[styles.title, { marginBottom: 10 }]}>Pending payments</Text> */}
                                                {unpaidPayments && unpaidPayments.length > 0 ? (
                                                    <View>
                                                        {unpaidPayments.map((item) => (
                                                            <TouchableOpacity
                                                                key={item._id}
                                                                style={styles.inventoryCard}
                                                                onPress={() => router.push({
                                                                    pathname: '/payments/details',
                                                                    params: { id: item._id },
                                                                })}>
                                                                <View style={styles.inventoryHeader}>
                                                                    <View style={styles.inventoryInfo}>
                                                                        <Text style={styles.inventoryName}>{item.user.name}</Text>
                                                                        <Text style={styles.inventoryCategory}>{item.type}</Text>
                                                                    </View>
                                                                    <View style={styles.inventoryStats}>
                                                                        <Text style={styles.inventoryStatValue}>{item.amount}</Text>
                                                                        <Text style={styles.inventoryStatLabel}>Amount</Text>
                                                                    </View>
                                                                </View>

                                                                <View style={styles.inventoryDetails}>
                                                                    <View style={styles.inventoryDetailRow}>
                                                                        <Text style={styles.inventoryDetailLabel}>Due date:</Text>
                                                                        <Text style={styles.inventoryDetailValue}>{item.dueDate}</Text>
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                ) : (
                                                    <Text>No pending payments</Text>
                                                )}
                                            </>
                                        }

                                        {activePaymentTab == "paid" &&
                                            <>
                                                {/* <Text style={[styles.title, { marginBottom: 10 }]}>Paid payments</Text> */}
                                                {paidPayments && paidPayments.length > 0 ? (
                                                    <View>
                                                        {paidPayments.map((item) => (
                                                            <TouchableOpacity
                                                                key={item._id}
                                                                style={styles.inventoryCard}
                                                                onPress={() => router.push({
                                                                    pathname: '/payments/details',
                                                                    params: { id: item._id },
                                                                })}>
                                                                <View style={styles.inventoryHeader}>
                                                                    <View style={styles.inventoryInfo}>
                                                                        <Text style={styles.inventoryName}>{item.user.name}</Text>
                                                                        <Text style={styles.inventoryCategory}>{item.type}</Text>
                                                                    </View>
                                                                    <View style={styles.inventoryStats}>
                                                                        <Text style={styles.inventoryStatValue}>{item.amount}</Text>
                                                                        <Text style={styles.inventoryStatLabel}>Amount</Text>
                                                                    </View>
                                                                </View>

                                                                <View style={styles.inventoryDetails}>
                                                                    <View style={styles.inventoryDetailRow}>
                                                                        <Text style={styles.inventoryDetailLabel}>Due date:</Text>
                                                                        <Text style={styles.inventoryDetailValue}>{item.dueDate}</Text>
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                ) : (
                                                    <Text>No paid payments</Text>
                                                )}
                                            </>
                                        }
                                    </View>
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyStateTitle}>No payments</Text>
                                        <Text style={styles.emptyStateText}>
                                            {userId == user._id
                                                ? "Add your first payment to get started"
                                                : "This club hasn't added any payments yet"}
                                        </Text>
                                        {userId == user._id && (
                                            <TouchableOpacity
                                                style={styles.emptyStateButton}
                                                onPress={() => router.push('/payments/createPayment')}
                                            >
                                                <Text style={styles.emptyStateButtonText}>Add Payment</Text>
                                            </TouchableOpacity>
                                        )}
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
                    <Image source={require('../../assets/profile.png')} style={styles.activeIcon} />
                </TouchableOpacity>
            </View>
        </View >
    );
}

const TeamCard = ({ team, deleteTeam, cancelDeleteTeam, loadingDelete, handleDeleteTeam, getAnimatedValue }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const router = useRouter();

    const animVal = getAnimatedValue(team._id);

    const animatedStyle = {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [60, 0],
        }),
        bottom: animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
        }),
        backgroundColor: 'rgba(0,0,0,1)',
        borderRadius: 12,
        width: animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [0, dimensions.width],
        }),
        height: animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [0, dimensions.height],
        }),
        opacity: animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        })
    };

    return (
        <TouchableOpacity
            key={team._id}
            onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setDimensions({ width, height });
            }}
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

            <View style={styles.teamActions}>
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

                <TouchableOpacity
                    style={styles.teamActionButton}
                    onPress={() => deleteTeam(team._id)}
                >
                    <MaterialCommunityIcons name="delete" size={18} color="#FF4000" />
                    <Text style={styles.teamActionText}>Delete</Text>
                </TouchableOpacity>
            </View>

            <Animated.View style={animatedStyle}>
                <View style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    {loadingDelete.includes(team._id) ? (
                        <ActivityIndicator size="small" color={'#FF4000'} style={{ transform: [{ scale: 1.5 }] }} />
                    ) : (
                        <Animated.View style={{
                            opacity: animVal.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                            }),
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={{ color: '#FF4000', fontFamily: 'Bebas', fontSize: 22, marginBottom: 30 }}>
                                Sure?
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity onPress={() => handleDeleteTeam(team._id)}>
                                    <Text
                                        style={{
                                            fontFamily: 'Bebas',
                                            fontSize: 22,
                                            color: '#000',
                                            paddingHorizontal: 5,
                                            backgroundColor: '#6ef99dff',
                                            borderRadius: 5,
                                        }}
                                    >
                                        Yes
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        cancelDeleteTeam(team._id);
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: 'Bebas',
                                            fontSize: 22,
                                            color: '#000',
                                            paddingHorizontal: 8,
                                            backgroundColor: '#f97d7dff',
                                            borderRadius: 5,
                                        }}
                                    >
                                        No
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}
                </View>
            </Animated.View>
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
        paddingBottom: 100
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        // marginBottom: 30
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
        fontSize: 20
    },
    subtitle: {
        fontFamily: "Manrope",
        fontSize: 16,
        fontWeight: 'bold'
    },
    paragraph: {
        fontFamily: "Manrope",
        fontSize: 16
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
        backgroundColor: '#000000',
        padding: 2,
        paddingRight: 5,
        borderRadius: 10,
        textAlign: 'center',
        position: 'absolute',
        bottom: 5,
        left: '50%',
        transform: [{ translateX: '-50%' }],
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
        fontSize: 14,
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
        position: 'relative'
    },
    teamDelete: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        backgroundColor: 'black',
        borderRadius: 20
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
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
    },
    coachLabel: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
        marginRight: 10,
        paddingTop: 8
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
        marginBottom: 15,
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
        bottom: 0,
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
    sectionTabs: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: '#ddd',
        padding: 3,
        gap: 5
    },
    sectionTab: {
        flex: 1,
        backgroundColor: '#ddd',
        borderRadius: 20,
        alignItems: 'center'
    },
    sectionTabText: {
        fontFamily: 'Bebas',
        fontSize: 20,
        padding: 5,
    },
    sectionTabActive: {
        backgroundColor: '#FF4000'
    },
    searchResultItemImageContainer: {
        width: 40,
        aspectRatio: 1,
        borderRadius: 20,
        backgroundColor: '#f4f4f4'
    },
    searchResultItemImage: {
        objectFit: 'contain',
        height: '100%',
        width: '100%'
    },
    editToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    editToggleText: {
        color: 'black',
        fontFamily: 'Bebas',
        fontSize: 18
    },
    searchLoader: {
        position: 'absolute',
        top: '50%',
        right: 10,
        transform: [{ translateY: '-50%' }]
    },
    searchLoadingText: {
        fontFamily: 'Manrope',
        color: '#888',
        marginVertical: 5
    },
    searchNoResultText: {
        fontFamily: 'Manrope',
        color: '#555',
        marginVertical: 5
    },
    searchResultItem: {
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
    },
    searchResultItemInfo: {
        fontFamily: 'Manrope',
        fontSize: 16,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    searchResultItemLink: {
        color: '#FF4000'
    },
    searchResultItemDescription: {
        // fontSize:16,
        marginBottom: 5
    },
    searchResultItemName: {
        fontWeight: 'bold',
        fontSize: 16,
        // marginBottom:5
    },
    removeBtn: {
        width: 25,
        height: 25,
        borderRadius: 15,
        backgroundColor: '#FF4000',
        position: 'absolute',
        top: -5,
        left: -5,
        zIndex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    removeBtnConfirmation: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        backgroundColor: '#000',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 2,
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        // marginBottom: 16,
        color: 'black',
        borderRadius: 10
    },
});
