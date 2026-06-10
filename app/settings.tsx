import Feather from '@expo/vector-icons/Feather';
import Octicons from '@expo/vector-icons/Octicons';
import Constants from "expo-constants";
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../context/language';


const { width } = Dimensions.get('window');


export default function Profile() {
    const router = useRouter();
    const { isRTL, language, setLanguage, t } = useLanguage();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [verificationLoading, setVerificationLoading] = useState(true);
    const year = new Date().getFullYear();
    const textDirectionStyle = isRTL ? styles.rtlText : styles.ltrText;

    useEffect(() => {
        const fetchUser = async () => {
            setVerificationLoading(true)
            const token = await SecureStore.getItemAsync('userToken');

            console.log(token)
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log("DECODED: ", decodedToken)
                setUserId(decodedToken.userId);

                const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    setUser(user)
                } else {
                    console.error('API error')
                }
                setVerificationLoading(false)
            } else {
                console.log("no token",)
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        router.replace('/')
    };

    const handleDeactivateAccount = async () => {
        console.log('deactivate account clicked');
    };

    const handleNotificationsSettings = async () => {
        console.log('notifications settings clicked');
    };

    const handleAccountVerification = async () => {
        router.push('/profile/verification')
    }

    const handleAccountBadge = async () => {
        router.push('/profile/badge')
    }

    const handleChangePassword = async () => {
        router.push('/profile/changePassword')
    };

    const handleAccountSettings = async () => {
        router.push('/profile/accountSettings')
    };

    const openLink = async (url:string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Cannot open \n" + url);
            }
        } catch (err) {
            console.error("Failed to open link: ", err);
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

                <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                    <Text style={[styles.pageTitle, textDirectionStyle]}>{t('settings.title')}</Text>
                    <Text style={[styles.pageDesc, textDirectionStyle]}>{t('settings.subtitle')}</Text>
                </View>

                <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('settings.ghost')}</Text>
            </View>

            <ScrollView>
                <View style={styles.contentContainer}>
                    <View style={styles.settings}>
                        <TouchableOpacity onPress={handleAccountSettings} style={styles.profileButton}>
                            <Text style={[styles.profileButtonText, textDirectionStyle]}>{t('settings.accountSettings')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleChangePassword} style={styles.profileButton}>
                            <Text style={[styles.profileButtonText, textDirectionStyle]}>{t('settings.changePassword')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleAccountBadge} style={styles.profileButton}>
                            <Text style={[styles.profileButtonText, textDirectionStyle]}>{t('settings.badge')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleAccountVerification} style={[styles.profileButton, styles.verificationButton, isRTL && styles.verificationButtonRtl]}>
                            <Text style={[styles.profileButtonText, textDirectionStyle]}>{t('settings.verification')}</Text>
                            {verificationLoading ? (
                                <ActivityIndicator size='small' color={'black'} />
                            ) : (
                                (user && user.verified && user.verified.email && user.verified.phone) ? (
                                    <View style={[styles.statusRow, isRTL && styles.statusRowRtl]}>
                                        <Octicons name="verified" size={16} color="#009933" />
                                        <Text style={[styles.verifiedText, textDirectionStyle]}>{t('common.verified')}</Text>
                                    </View>
                                ) : (
                                    <View style={[styles.statusRow, isRTL && styles.statusRowRtl]}>
                                        <Octicons name="unverified" size={16} color="#ffc400" />
                                        <Text style={[styles.pendingText, textDirectionStyle]}>{t('common.pending')}</Text>
                                    </View>
                                )
                            )}
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={handleNotificationsSettings} style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>Notifications settings</Text>
                        </TouchableOpacity> */}
                    </View>

                    <View style={styles.languageSection}>
                        <Text style={[styles.sectionTitle, textDirectionStyle]}>{t('settings.language')}</Text>
                        <Text style={[styles.sectionHint, textDirectionStyle]}>{t('settings.languageHint')}</Text>
                        <View style={[styles.languageOptions, isRTL && styles.languageOptionsRtl]}>
                            <TouchableOpacity
                                onPress={() => setLanguage('en')}
                                style={[styles.languageChip, language === 'en' && styles.languageChipActive]}
                            >
                                <Text style={[styles.languageChipText, language === 'en' && styles.languageChipTextActive]}>{t('common.english')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setLanguage('ar')}
                                style={[styles.languageChip, language === 'ar' && styles.languageChipActive]}
                            >
                                <Text style={[styles.languageChipText, language === 'ar' && styles.languageChipTextActive]}>{t('common.arabic')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.settings}>
                            <View style={[styles.footerSection,isRTL&&{flexDirection:'row-reverse'}]}>
                                <View style={styles.footerLinks}>
                                    <TouchableOpacity onPress={() => openLink("https://riyadah.app/terms")} style={[styles.footerLinkRow, isRTL && styles.footerLinkRowRtl]}>
                                        <Feather name="external-link" size={12} color="#FF4000" />
                                        <Text style={[styles.footerLink, textDirectionStyle]}>{t('settings.terms')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => openLink("https://riyadah.app/privacy")} style={[styles.footerLinkRow, isRTL && styles.footerLinkRowRtl]}>
                                        <Feather name="external-link" size={12} color="#FF4000" />
                                        <Text style={[styles.footerLink, textDirectionStyle]}>{t('settings.privacy')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => openLink("https://riyadah.app/")} style={[styles.footerLinkRow, isRTL && styles.footerLinkRowRtl]}>
                                        <Feather name="external-link" size={12} color="#FF4000" />
                                        <Text style={[styles.footerLink, textDirectionStyle]}>{t('settings.website')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity onPress={handleDeactivateAccount} style={[styles.profileButton, styles.deactivateBtn]}>
                                <Text style={[styles.profileButtonText, styles.deactivateBtnText]}>{t('settings.deactivate')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLogout} style={[styles.profileButton, styles.logoutBtn]}>
                                <Text style={[styles.profileButtonText, styles.logoutText]}>{t('settings.logout')}</Text>
                            </TouchableOpacity>

                            <Text style={styles.disclaimer}>{year} {"\u00A9"} {t('common.riyadah')} v{Constants.expoConfig.version}</Text>

                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.navBar, isRTL && styles.navBarRtl]}>
                <TouchableOpacity onPress={() => router.replace('/settings')}>
                    <Image source={require('../assets/settings.png')} style={styles.activeIcon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/search')}>
                    <Image source={require('../assets/search.png')} style={styles.icon} />
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
        paddingBottom: 130
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        // marginBottom: 30
    },
    logo: {
        width: 120 ,
        height:40,
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
        maxWidth:200
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
    ltrText: {
        textAlign: 'left',
        writingDirection: 'ltr'
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl'
    },
    ghostText: {
        fontSize: 100,
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
        tintColor:'#111111'
    },
    activeIcon: {
        width: 24,
        height: 24,
        tintColor: '#FF4000',
    },
    settings: {
        // backgroundColor: 'rgba(0,0,0,0.05)',
        // borderRadius:5,
        // padding:10
        width: '100%'
    },
    profileButton: {
        paddingVertical: 5,
    },
    profileButtonText: {
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Qatar',
    },
    verificationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10
    },
    verificationButtonRtl: {
        flexDirection: 'row-reverse',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    statusRowRtl: {
        flexDirection: 'row-reverse',
    },
    verifiedText: {
        color: "#009933"
    },
    pendingText: {
        color: "#ffc400"
    },
    languageSection: {
        marginTop: 30,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#f8f8f8',
    },
    sectionTitle: {
        color: '#150000',
        fontFamily: 'Qatar',
        fontSize: 18,
        marginBottom: 4,
    },
    sectionHint: {
        color: '#666666',
        fontFamily: 'Acumin',
        fontSize: 13,
        marginBottom: 12,
    },
    languageOptions: {
        flexDirection: 'row',
        gap: 10,
    },
    languageOptionsRtl: {
        flexDirection: 'row-reverse',
    },
    languageChip: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    languageChipActive: {
        backgroundColor: '#FF4000',
        borderColor: '#FF4000',
    },
    languageChipText: {
        color: '#150000',
        fontFamily: 'Qatar',
        fontSize: 15,
    },
    languageChipTextActive: {
        color: '#ffffff',
    },
    deactivateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        justifyContent: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        marginBottom:10,
        paddingVertical:10
    },
    deactivateBtnText: {
        color: '#FF4000',
        fontSize: 14,
        width:'100%',
        textAlign:'center'
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        justifyContent: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        marginBottom: 20,
        paddingVertical:10
    },
    footer: {
        // position: 'absolute',
        // bottom: 130,
        // left: 10,
        // width: width - 20,
        paddingTop: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
    },
    footerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    footerLinks: {
        gap: 5
    },
    footerLinkRow: {
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center'
    },
    footerLinkRowRtl: {
        flexDirection: 'row-reverse',
    },
    footerLink: {
        color: '#FF4000',
        fontFamily: 'Acumin',
        fontSize: 12
    },
    logoutText: {
        fontSize: 14,
        width: '100%',
        textAlign: 'center'
    },
    disclaimer: {
        textAlign: 'center',
        color: '#aaa',
        fontFamily: 'Acumin',
        fontSize: 14
    }
});
