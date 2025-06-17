import { RadarChart } from '@salmonco/react-native-radar-chart';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
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

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 300],
        outputRange: [300, 175],
        extrapolate: 'clamp',
    });

    const logoOpacity = scrollY.interpolate({
        inputRange: [0, 300],
        outputRange: [1, 0],
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
            }else{
                console.log("no token",)
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        console.log("User: ", user)
    }, [user]);

    const handleEdit = async () => {
        router.push('/profile/editProfile');
        console.log('Edit clicked');
    };

    const handleShareProfile = async () => {
        console.log('Share clicked');
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'december']

    //graph data
    const data = [
        { label: 'Attack', value: 90 },
        { label: 'Defense', value: 40 },
        { label: 'Speed', value: 70 },
        { label: 'Stamina', value: 35 },
        { label: 'Skill', value: 80 }
    ];

    const getProfileProgress = () => {
        const totalFields = 20;

        let filledFields = 0;

        if (user.name) filledFields++;
        if (user.email) filledFields++;
        if (user.phone) filledFields++;
        if (user.country) filledFields++;
        if (user.password) filledFields++;
        if (user.dob?.day && user.dob?.month && user.dob?.year) filledFields++;
        if (user.parentEmail) filledFields++;
        if (user.type) filledFields++;
        if (user.sport) filledFields++;
        if (user.club) filledFields++;
        if (user.gender) filledFields++;
        if (user.bio) filledFields++;
        if (user.height) filledFields++;
        if (user.weight) filledFields++;
        if (user.agreed === true) filledFields++;
        if (user.highlights && user.highlights.length > 0) filledFields++;
        if (user.stats && user.stats.length > 0) filledFields++;
        if (user.achievements && user.achievements.length > 0) filledFields++;
        if (user.events && user.events.length > 0) filledFields++;
        if (user.skills && user.skills.length > 0) filledFields++;

        const progress = Math.round((filledFields / totalFields) * 100);

        return progress;
    };

    return (
        <View style={styles.container}>
            {user && <Animated.View style={[styles.pageHeader, { height: headerHeight }]}>
                <Animated.Image
                    source={require('../../assets/logo_white.png')}
                    style={[styles.logo, { opacity: logoOpacity }]}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>{user.name}</Text>
                    <Text style={styles.pageDesc}>{user.sport} player</Text>
                </View>

                <Text style={styles.ghostText}>{user.name.substring(0, 6)}</Text>

                <View style={styles.profileImage}>
                    <Image
                        source={require('../../assets/avatar.png')}
                        style={styles.profileImageAvatar}
                        resizeMode="contain"
                    />
                </View>
            </Animated.View>
            }

            {user && <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >


                <View style={styles.contentContainer}>

                    {userId == user._id && 
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

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Bio
                        </Text>
                        {user.bio ? (
                            <Text style={styles.paragraph}>
                                {user.bio}
                            </Text>
                        ) : (
                            <Text style={styles.paragraph}>-</Text>
                        )}

                    </View>

                    <View style={styles.profileSection}>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Date of Birth
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Height
                            </Text>
                            <View>
                                {user.height ? (
                                    <Text style={styles.paragraph}>{user.height} m</Text>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Weight
                            </Text>
                            <View>
                                {user.weight ? (
                                    <Text style={styles.paragraph}>{user.weight} Kg</Text>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Highlights
                        </Text>
                        {user.highlights ? (
                            <Text style={styles.paragraph}>{user.highlights}</Text>
                        ) : (
                            <Text style={styles.paragraph}>-</Text>
                        )}

                    </View>

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Stats
                        </Text>
                        {user.stats ? (
                            <Text style={styles.paragraph}>{user.stats}</Text>
                        ) : (
                            <Text style={styles.paragraph}>-</Text>
                        )}
                    </View>

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Achievements
                        </Text>
                        {user.achievements ? (
                            <Text style={styles.paragraph}>{user.achievements}</Text>
                        ) : (
                            <Text style={styles.paragraph}>-</Text>
                        )}
                    </View>

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Upcoming Events
                        </Text>
                        {user.events ? (
                            <Text style={styles.paragraph}>{user.events}</Text>
                        ) : (
                            <Text style={styles.paragraph}>-</Text>
                        )}
                    </View>

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Skills
                        </Text>
                        <View style={user.skills != null ? { alignItems: 'center' } : { alignItems: 'flex-start' }}>
                            {user.skills ? (
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
                                />) : (
                                <Text style={styles.paragraph}>-</Text>
                            )}

                        </View>
                    </View>

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
    }
});
