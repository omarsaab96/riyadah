import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';

import {
    ActivityIndicator,
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
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                // console.log("DECODED: ", decodedToken)
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
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);

                const response = await fetch(`https://riyadah.onrender.com/api/notifications/${user._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const notifications = await response.json();
                    setNotifications(notifications)
                    setLoading(false)
                } else {
                    console.error('API error')
                }
            }
        };

        fetchNotifications();
    }, [user]);

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Image
                    source={require('../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.headerTextBlock}>
                    <Text style={styles.pageTitle}>Notifications</Text>
                    {!loading && <Text style={styles.pageDesc}>You have 3 unread notifications</Text>}
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

                <Text style={styles.ghostText}>Notifica</Text>
            </View>

            {!loading && <ScrollView>

                {notifications.length == 0 ?
                    (
                        <View style={styles.contentContainer}>
                            <Text style={styles.emptyNotifications}>No notifications</Text>
                        </View>
                    ) : (
                        <View style={styles.contentContainer}>
                            <View style={styles.notification}>
                                <Text style={styles.notificationText}>
                                    X added you as a friend
                                </Text>
                                <View style={styles.notificationUnread}></View>
                            </View>
                            <View style={styles.notification}>
                                <Text style={styles.notificationText}>
                                    X added you as a friend
                                </Text>
                            </View>
                        </View>
                    )}

            </ScrollView>
            }

            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.replace('/settings')}>
                    <Image source={require('../assets/settings.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/search')}>
                    <Image source={require('../assets/news.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/landing')}>
                    <Image source={require('../assets/home.png')} style={[styles.icon, styles.icon]} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/notifications')}>
                    <Image source={require('../assets/notifications.png')} style={styles.activeIcon} />
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
    notification: {
        backgroundColor: '#dedede',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    notificationText: {
        fontFamily: "Manrope",
        fontSize: 14,
        flex: 1,
        paddingRight: 20
    },
    notificationUnread: {
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: '#FF4000',
        marginTop: 6
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
    emptyNotifications: {
        fontFamily:'Manrope',
        fontSize:16
    }
});
