import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../../context/language';

const { width } = Dimensions.get('window');

export default function ManagerDashboardScreen() {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef(null);


    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log("DECODED: ", decodedToken)
                setUserId(decodedToken.userId);

                const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    // console.log("MANAGER USER: ", user)
                    setUser(user)
                    setLoading(false)
                } else {
                    console.error('API error')
                }
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        router.replace('/')
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
                    <TouchableOpacity style={styles.logout} onPress={() => { handleLogout() }}>
                        <Text style={styles.logoutText}>{t('manager.logout')}</Text>
                    </TouchableOpacity>


                    <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                        <Text style={styles.pageTitle}>{t('manager.dashboard')}</Text>
                        {!loading && <Text style={styles.pageDesc}>{user.name}</Text>}

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
                </View>

                {user && !loading && <ScrollView ref={scrollRef}>
                    <View style={styles.contentContainer}>
                        {error != null && <View style={[styles.error, isRTL && { flexDirection: 'row-reverse' }]}>
                            <View style={[styles.errorIcon, isRTL && { marginRight: 0, marginLeft: 15 }]}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('manager.quickLinks')}</Text>

                        <TouchableOpacity
                            style={styles.fullButtonRow}
                            onPress={() => router.push('/manager/skillsTesting')}>
                            <Text style={styles.fullButtonText}>{t('manager.performanceTests')}</Text>
                            <Feather name="arrow-right" size={20} color="#FF4400" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.fullButtonRow, { marginTop: 10 }]}
                            onPress={() => router.push('/manager/surveys')}>
                            <Text style={styles.fullButtonText}>{t('manager.surveyManager')}</Text>
                            <Feather name="arrow-right" size={20} color="#FF4400" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.fullButtonRow, { marginTop: 10 }]}
                            onPress={() => router.push('/manager/sports')}>
                            <Text style={styles.fullButtonText}>{t('manager.sportsManager')}</Text>
                            <Feather name="arrow-right" size={20} color="#FF4400" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.fullButtonRow, { marginTop: 10 }]}
                            onPress={() => router.push('/manager/notifications')}>
                            <Text style={styles.fullButtonText}>{t('manager.manualNotifications')}</Text>
                            <Feather name="arrow-right" size={20} color="#FF4400" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.fullButtonRow, { marginTop: 10 }]}
                            onPress={() => router.push('/manager/bulkAthletes')}>
                            <Text style={styles.fullButtonText}>{t('manager.addBulkAthletes')}</Text>
                            <Feather name="arrow-right" size={20} color="#FF4400" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.fullButtonRow, { marginTop: 10 }]}
                            onPress={() => router.push('/manager/createAthlete')}>
                            <Text style={styles.fullButtonText}>{t('manager.addAthlete')}</Text>
                            <Feather name="arrow-right" size={20} color="#FF4400" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                }
            </View >
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130
    },
    error: {
        marginBottom: 15,
        backgroundColor: '#fce3e3',
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'stretch'
    },
    errorIcon: {
        width: 3,
        height: 15,
        backgroundColor: 'red',
        borderRadius: 5,
        marginRight: 10,
    },
    errorText: {
        color: 'red',
        fontFamily: 'Acumin',
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 200,
        // marginBottom: 30
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
    headerTextBlockRtl: {
        left: 'auto',
        right: 20,
        maxWidth: 200
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
    entity: {
        marginBottom: 20
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
        fontSize: 20,
        marginBottom: 10,
        color: 'black'
    },
    subtitle: {
        fontFamily: "Acumin",
        fontSize: 16,
        // fontWeight: 'bold',
        width: '100%',
        textTransform: 'capitalize',
        color: 'black'
    },
    contactSubTitle: {
        marginBottom: 5,
        // fontSize: 14,
    },
    paragraph: {
        fontFamily: "Acumin",
        fontSize: 16,
        color: 'black'
    },
    ghostText: {
        fontSize: 100, textTransform: 'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        color: '#ff6633',
        maxHeight: 200,
        lineHeight: 200
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
        padding: 10,
        // backgroundColor:'#000',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        justifyContent: 'space-between'
    },
    sectionTitle: {
        color: "#000",
        fontSize: 14,
        marginBottom: 20
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    fullButtonText: {
        fontFamily: 'Qatar',
        fontSize: 14,
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
    inlineActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        columnGap: 15
    },
    profileButton: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10
    },
    savebtn: {
        flexDirection: 'row'
    },
    profileButtonText: {
        textTransform: 'uppercase',
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Qatar',
    },
    textarea: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
        height: 170,
        textAlignVertical: 'top',
    },
    contactItem: {
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        marginBottom: 10,
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        fontSize: 14,
        padding: 15,
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10
    },
    contactInput: {
        marginBottom: 0,
        padding: 10,
        flex: 1,
        paddingLeft: 20
    },
    select: {
        padding: 10
    },
    dobRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    dobInput: {
        flex: 1,
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 10
    },
    dobSeperator: {
        fontSize: 30,
        fontFamily: 'Qatar',
        fontWeight: 'bold',
        color: '#FF4000',
        marginHorizontal: 10
    },
    saveLoaderContainer: {
        marginLeft: 10
    },
    rangeContainer: {

    },
    rangeSliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    rangeSlider: {
        flex: 1,
        height: 40
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
    childrenList: {

    },
    childItem: {

    },
    noChildrenView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    addChildrenButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addChildrenButtonText: {
        color: 'black',
        fontFamily: 'Qatar',
        fontSize: 18
    },
    noChildrenText: {
        marginBottom: 10,
        fontSize: 16,
        fontFamily: 'Acumin'
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
    locationBtn: {
    },
    locationBtnText: {
        color: '#FF4000',
        fontFamily: 'Acumin',
        fontSize: 14
    },
    hint: {
        marginBottom: 10,
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#000000'
    },
    adminDiv: {
        marginBottom: 20
    },
    logout: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff',
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },
    logoutText: {
        color: '#fff',
        fontFamily: 'Acumin',
        fontSize: 16
    }
});
