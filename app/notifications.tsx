import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from 'react';
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

export default function Notifications() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.userId);

                const response = await fetch(`https://riyadah.onrender.com/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    console.error('API error');
                }
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const response = await fetch(`https://riyadah.onrender.com/api/notifications/${user._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const notifData = await response.json();
                    notifData.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setNotifications(notifData);
                    setLoading(false);
                } else {
                    console.error('API error');
                }
            }
        };

        fetchNotifications();
    }, [user]);

    const handleMarkAsRead = async (notificationID) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await fetch(`https://riyadah.onrender.com/api/notifications/mark-read/${notificationID}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif._id === notificationID ? { ...notif, read: true } : notif
                    )
                );
            } else {
                console.error('Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
            console.error('No token found');
            return;
        }
        try {
            const res = await fetch(`https://riyadah.onrender.com/api/notifications/mark-all-read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to mark notifications as read');
            }

            const data = await res.json();
            data.notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
            setNotifications(data.notifications);
            console.log('All notifications marked as read');
        } catch (err) {
            console.error('Error:', err.message);
        }
    };

    const handleDelete = async (notificationID) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await fetch(`https://riyadah.onrender.com/api/notifications/delete/${notificationID}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.filter(notif => notif._id !== notificationID)
                );
            } else {
                console.error('Failed to delete notification');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);

        if (diffInMinutes < 1) {
            return 'now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

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
                    {notifications && !loading && <Text style={styles.pageDesc}>
                        You have {notifications.filter(n => !n.read).length} unread notification{notifications.filter(n => !n.read).length == 1 ? '' : 's'}
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

                <Text style={styles.ghostText}>Notifi</Text>
            </View>

            {!loading && <ScrollView>
                <View style={styles.contentContainer}>
                    {notifications.length == 0 ?
                        (
                            <Text style={styles.emptyNotifications}>No notifications</Text>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.btn,
                                        notifications.filter(n => !n.read).length === 0 ? { opacity: 0.3 } : {}
                                    ]}
                                    onPress={() => { handleMarkAllRead() }}
                                    disabled={notifications.filter(n => !n.read).length === 0 ? true : false}
                                >
                                    <Entypo name="notifications-off" size={18} color="black" />
                                    <Text style={styles.btnText}>Mark all as read</Text>
                                </TouchableOpacity>
                                <View>
                                    {notifications.map((notif, index) => (
                                        <View key={index} style={styles.notification}>
                                            <View style={styles.notificationContent}>
                                                {!notif.read && <View style={styles.notificationUnread} />}
                                                <Text style={styles.notificationDate}>{timeAgo(notif.date)}</Text>
                                            </View>
                                            <Text style={styles.notificationText}>
                                                {notif.message}
                                            </Text>
                                            <View style={{ flexDirection: 'row', gap: 20 }}>
                                                {!notif.read && <TouchableOpacity onPress={() => handleMarkAsRead(notif._id)}>
                                                    <Text style={styles.notificationBtnTxt}>Mark as read</Text>
                                                </TouchableOpacity>}

                                                <TouchableOpacity onPress={() => handleDelete(notif._id)}>
                                                    <Text style={styles.notificationBtnTxt}>Delete</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}

                </View>


            </ScrollView>
            }

            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.replace('/settings')}>
                    <Image source={require('../assets/settings.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/search')}>
                    <Image source={require('../assets/search.png')} style={styles.icon} />
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
        paddingBottom: 130
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
        borderWidth:1
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
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 0
    },
    notificationText: {
        fontFamily: "Manrope",
        fontSize: 14,
        flex: 1,
        paddingRight: 20,
        color: 'black',
        marginBottom: 10
    },
    notificationUnread: {
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: '#FF4000',
        marginTop: 6,
        marginRight: 5
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
        fontFamily: 'Manrope',
        fontSize: 16,
        color: 'black'
    },
    notificationBtnTxt: {
        color: '#FF4000'
    },
    notificationDate: {
        fontSize: 12,
        color: '#65676b',
        marginTop: 2,
    },
    btn: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 5,
        marginBottom: 15
    },
    btnText: {
        color: 'black',
        fontFamily: 'Bebas',
        fontSize: 18
    },
});
