import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


const { width } = Dimensions.get('window');
const router = useRouter();


export default function EditProfile() {
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log("DECODED: ", decodedToken)
                setUserId(decodedToken.userId);

                // const response = await fetch(`https://riyadah.onrender.com/api/users/${decodedToken.userId}`, {
                //     headers: { Authorization: `Bearer ${token}` }
                // });

                // if (response.ok) {
                //     const user = await response.json();
                //     setUser(user)
                // } else {
                //     console.error('API error')
                // }

                const u = {
                    "id": "684ec2ddc15b465ac1228ae4",
                    "name": "Omar Saab",
                    "email": "omar",
                    "phone": "dsa",
                    "country": "LB",
                    "password": "123",
                    "dob": {
                        "day": "01",
                        "month": "09",
                        "year": "1996"
                    },
                    "parentEmail": "kj",
                    "type": "Club",
                    "sport": "Basketball",
                    "club": "Independent",
                    "gender": "Male",
                    "bio": null,
                    "height": null,
                    "weight": null,
                    "createdAt": "2025-06-15T12:55:57.944Z",
                    "updatedAt": "2025-06-15T12:55:57.944Z",
                    "__v": 0
                }
                setUser(u);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        console.log("User: ", user)
    }, [user]);

    const handleCancel = () => {
        console.log("Cancel clicked")
    }

    const handleSave = () => {
        console.log("Save clicked")
    }

    return (
        <View style={styles.container}>
            {user && <View style={styles.pageHeader}>
                <Image
                    source={require('../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>Edit profile</Text>
                    <Text style={styles.pageDesc}>Change your data</Text>
                </View>

                <Text style={styles.ghostText}>Edit Prof</Text>

                <View style={styles.profileImage}>
                    <Image
                        source={require('../assets/avatar.png')}
                        style={styles.profileImageAvatar}
                        resizeMode="contain"
                    />
                </View>
            </View>
            }

            {user && <ScrollView>
                <View style={styles.contentContainer}>
                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Bio
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Country
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Team/club
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Date of Birth
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Height
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>
                                Weight
                            </Text>
                        </View>
                        <Text style={styles.title}>
                            Highlights
                        </Text>
                        <Text style={styles.title}>
                            Stats
                        </Text>
                        <Text style={styles.title}>
                            Achievements
                        </Text>
                        <Text style={styles.title}>
                            Upcoming Events
                        </Text>
                        <Text style={styles.title}>
                            Skills
                        </Text>
                    </View>

                    <View style={[styles.profileSection, styles.profileActions]}>
                        <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            }

            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.replace('/settings')}>
                    <Image source={require('../assets/settings.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/news')}>
                    <Image source={require('../assets/news.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/landing')}>
                    <Image source={require('../assets/home.png')} style={[styles.icon, styles.icon]} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/notifications')}>
                    <Image source={require('../assets/notifications.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/profile')}>
                    <Image source={require('../assets/profile.png')} style={styles.icon} />
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
