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
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CountryFlag from "react-native-country-flag";

const { width } = Dimensions.get('window');
const router = useRouter();

export default function Profile() {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Profile');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const tabs = ['Profile', 'Teams', 'Schedule', 'Staff', 'Inventory'];

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

    useEffect(() => {
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

    const handleEdit = async () => {
        router.push('/profile/editProfile');
        console.log('Edit clicked');
    };

    const handleShareProfile = async () => {
        console.log('Share clicked');
    };

    const getProfileProgress = () => {
        let progress = 0;
        let filledFields = 0;

        if (user.type == "Club") {
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
                        {user?.type}
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
                                {(user.image == null || user.image == "") && user.type == "Club" && <Image
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
                                        {user.type == "Club" ? 'Upload logo' : 'Upload avatar'}
                                    </Text>
                                </TouchableOpacity>
                            }

                            {user.image != null && user.image != "" &&
                                <TouchableOpacity style={[styles.uploadImage, { padding: 5, }]} onPress={() => router.push('/profile/uploadAvatar')}>
                                    <FontAwesome name="refresh" size={16} color="#FF4000" />
                                    <Text style={[styles.uploadImageText, { marginLeft: 5 }]}>
                                        {user.type == "Club" ? 'Change logo' : 'Change avatar'}
                                    </Text>
                                </TouchableOpacity>
                            }
                        </View>
                    ) : (
                        <View style={styles.profileImage}>
                            {(user.image == null || user.image == "") && user.type == "Club" && <Image
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
                            onPress={() => setActiveTab(label)}
                        >
                            <Text style={[styles.tabText, activeTab === label && styles.tabTextActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* profileTab */}
            {!loading && user && activeTab == "Profile" && <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >

                <View style={styles.contentContainer}>
                    {userId == user._id && (getProfileProgress() < 100) &&
                        <TouchableOpacity style={[styles.profileSection, styles.profileProgress]} onPress={handleEdit}>
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
                        </TouchableOpacity>}


                    <Text style={[styles.paragraph, { backgroundColor: '#cccccc', borderRadius: 10, padding: 5, marginBottom: 20, opacity: 0.5 }]}>
                        //Add contact info for clubs, each club has an admin
                    </Text>

                    {/* CONTACT INFO */}
                    {user.type != "Parent" && <View style={[styles.profileSection, { backgroundColor: '#eeeeee', borderRadius: 10, padding: 5, marginBottom: 20 }]}>
                        <Text style={styles.title}>
                            CONTACT
                        </Text>
                        <View style={styles.contactInfo}>
                            {user.contactInfo.phone &&
                                <View style={styles.contactItem}>
                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`tel:${user.contactInfo.phone}`)}>
                                        <FontAwesome6 name="phone" size={24} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>
                            }
                            {user.contactInfo.email &&
                                <View style={styles.contactItem}>
                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`mailto:${user.contactInfo.email}`)}>
                                        <MaterialCommunityIcons name="email-outline" size={24} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>
                            }
                            {user.contactInfo.facebook &&
                                <View style={styles.contactItem}>
                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.facebook.com/${user.contactInfo.facebook}`)}>
                                        <FontAwesome name="facebook" size={24} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>
                            }
                            {user.contactInfo.instagram &&
                                <View style={styles.contactItem}>
                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.instagram.com/${user.contactInfo.instagram}`)}>
                                        <FontAwesome name="instagram" size={24} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>
                            }
                            {user.contactInfo.whatsapp &&
                                <View style={styles.contactItem}>
                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://wa.me/${user.contactInfo.whatsapp}`)}>
                                        <FontAwesome name="whatsapp" size={24} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>
                            }
                            {user.contactInfo.telegram &&
                                <View style={styles.contactItem}>
                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://t.me/${user.contactInfo.telegram}`)}>
                                        <FontAwesome5 name="telegram-plane" size={24} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>
                            }
                            {user.contactInfo.tiktok &&
                                <View style={styles.contactItem}>
                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.tiktok.com/@${user.contactInfo.tiktok}`)}>
                                        <FontAwesome6 name="tiktok" size={24} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>
                            }
                            {user.contactInfo.snapchat &&
                                <View style={styles.contactItem}>
                                    <TouchableOpacity style={styles.contactLink} onPress={() => Linking.openURL(`https://www.snapchat.com/add/${user.contactInfo.snapchat}`)}>
                                        <FontAwesome name="snapchat-ghost" size={24} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>

                        {!user.contactInfo.location &&
                            <View style={styles.contactLocation}>
                                <View style={styles.contactLocation}>
                                    <View style={styles.map}>
                                        <Image source={require('../../assets/settings.png')} />
                                    </View>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            const locationQuery = encodeURIComponent('Beirut Lebanon');
                                            const googleMapsURL = `comgooglemaps://?q=${locationQuery}`;
                                            const browserURL = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;

                                            try {
                                                const supported = await Linking.canOpenURL(googleMapsURL);
                                                if (supported) {
                                                    // Open in Google Maps app
                                                    await Linking.openURL(googleMapsURL);
                                                } else {
                                                    // Fallback to browser
                                                    await Linking.openURL(browserURL);
                                                }
                                            } catch (error) {
                                                Alert.alert("Error", "Could not open map.");
                                                console.error(error);
                                            }
                                        }}>
                                        <Text>Get Directions</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                    </View>}

                    {/* BIO */}
                    {user.type != "Parent" && <View style={styles.profileSection}>
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

                    </View>}

                    {/* SPORT */}
                    {user.type != "Parent" && <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Sport{user.sport.length > 1 ? 's' : ''}
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

                        {/* TEAM/CLUB */}
                        {user.type == "Athlete" && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Team/club
                            </Text>
                            {user.club ? (
                                <View>
                                    <Text style={styles.paragraph}>{user.club}</Text>
                                </View>
                            ) : (
                                <Text style={styles.paragraph}>-</Text>
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
                            {user.club ? (
                                <View>
                                    <Text style={styles.paragraph}>
                                        {user.club.length}
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
                            {user.children ? (
                                <View>
                                    <Text style={styles.paragraph}>
                                        {user.children.length}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.paragraph}>-</Text>
                            )}
                        </View>}

                        {/* DOB */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                {user.type == "Club" ? 'Established' : 'Date of Birth'}
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

                    {/* STATS */}
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

                    {/* ACHIEVEMENTS */}
                    {user.type != "Club" && <View style={styles.profileSection}>
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
            {!loading && user && activeTab == "Teams" && <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >

                <View style={styles.contentContainer}>
                    <Text>TEAMS TAB</Text>

                    <Text style={[styles.paragraph, { backgroundColor: '#cccccc', borderRadius: 10, padding: 5, marginBottom: 20, opacity: 0.5 }]}>
                        //Each team should have a coach
                    </Text>
                </View>
            </Animated.ScrollView>
            }

            {/* scheduleTab */}
            {!loading && user && activeTab == "Schedule" && <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >

                <View style={styles.contentContainer}>
                    <Text>SCHEDULE TAB</Text>
                    <Text style={[styles.paragraph, { backgroundColor: '#cccccc', borderRadius: 10, padding: 5, marginBottom: 20, opacity: 0.5 }]}>
                        //create events or training sessions
                    </Text>
                </View>
            </Animated.ScrollView>
            }

            {/* staffTab */}
            {!loading && user && activeTab == "Staff" && <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >

                <View style={styles.contentContainer}>
                    <Text>STAFF TAB</Text>
                    <Text style={[styles.paragraph, { backgroundColor: '#cccccc', borderRadius: 10, padding: 5, marginBottom: 20, opacity: 0.5 }]}>
                        //manage staff, coaches, admins, board members...
                    </Text>
                </View>
            </Animated.ScrollView>
            }

            {/* inventoryTabs */}
            {!loading && user && activeTab == "Inventory" && <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >

                <View style={styles.contentContainer}>
                    <Text>INVENTORY TAB</Text>

                    <Text style={[styles.paragraph, { backgroundColor: '#cccccc', borderRadius: 10, padding: 5, marginBottom: 20, opacity: 0.5 }]}>
                        //keep track of stock for sports equipment, sportswear, jerseys and accessories
                    </Text>
                </View>
            </Animated.ScrollView>
            }

            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.replace('/settings')}>
                    <Image source={require('../../assets/settings.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/news')}>
                    <Image source={require('../../assets/news.png')} style={styles.icon} />
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
        </View>
    );
}

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
        width: 150,
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
        paddingTop: 10,
    },
    contactItem: {
        borderRadius: 10,
        backgroundColor: '#cccccc',
    },
    contactLink: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
