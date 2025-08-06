import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
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


export default function Profile() {

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        router.replace('/')
        console.log('Token deleted');
    };

    const handleDeactivateAccount = async () => {
        console.log('deactivate account clicked');
    };

    const handleNotificationsSettings = async () => {
        console.log('notifications settings clicked');
    };

    const handleChangePassword = async () => {
        console.log('change password clicked');
    };

    const handleAccountSettings = async () => {
        console.log('account settings clicked');
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
                    <Text style={styles.pageTitle}>Settings</Text>
                    <Text style={styles.pageDesc}>Account settings</Text>
                </View>

                <Text style={styles.ghostText}>Settin</Text>
            </View>
            

            <ScrollView>
                <View style={styles.contentContainer}>
                    <View style={styles.settings}>
                        <TouchableOpacity onPress={handleAccountSettings} style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>Account</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleChangePassword} style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>Change password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNotificationsSettings} style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>Notifications settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeactivateAccount} style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>Deactivate account</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            

            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.replace('/settings')}>
                    <Image source={require('../assets/settings.png')} style={styles.activeIcon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/search')}>
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
    ghostText: {
        color: '#ffffff',
        fontSize: 128,
        fontFamily: 'Bebas',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2
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
    settings:{
        // backgroundColor: 'rgba(0,0,0,0.05)',
        // borderRadius:5,
        // padding:10
    },
    profileButton:{
        paddingVertical:10,
        marginBottom:5
    },
    profileButtonText:{
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
    }
});
