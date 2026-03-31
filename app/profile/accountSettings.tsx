import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { useLanguage } from '../../context/language';

const { width } = Dimensions.get('window');

export default function AccountSettings() {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [emailAddress, setEmailAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState<any>(null);
    const [countryCode, setCountryCode] = useState<any>("EG");
    const [callingCode, setCallingCode] = useState<any>(20);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
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
                    setUser(user)

                    setEmailAddress(user.email)
                    const parsedUserPhone = parsePhoneNumberFromString(user.phone);
                    setCountryCode(parsedUserPhone?.country)
                    setCallingCode(parsedUserPhone?.countryCallingCode)
                    setPhoneNumber(parsedUserPhone?.nationalNumber)

                    setLoading(false)
                } else {
                    console.error('API error')
                }
            }
        };

        fetchUser();

    }, []);

    const handleCancel = () => {
        router.back();
    }

    const isValidEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    };

    const handleSave = async () => {
        if (!isValidEmail(emailAddress)) {
            setError(t('account.invalidEmail'))
            return;
        }
        if (!isValidPhoneNumber("" + phoneNumber, countryCode)) {
            setError(t('account.invalidPhone'));
            return;
        }
        if ((emailAddress == user.email) && ("+" + callingCode + phoneNumber == user.phone)) {
            setError(t('account.nothingChanged'));
            return;
        }
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        setError(null);
        setSaving(true)

        if (emailAddress != user.email) {
            try {
                const response = await fetch(`https://server.riyadah.app/api/users/updateEmail`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: emailAddress
                    })
                });

                const resp = await response.json();

                if (response.ok && await resp.success) {
                    console.log("Email updated successfully");
                    if ("+" + callingCode + phoneNumber == user.phone) {
                        setSaving(false)
                        router.replace('/settings')
                    }

                } else {
                    setError(resp.message);
                    setSaving(false)
                }
            } catch (err) {
                setError(t('account.emailUpdateFailed'))
            }
        }
        if ("+" + callingCode + phoneNumber != user.phone) {
            try {
                const response = await fetch(`https://server.riyadah.app/api/users/updatePhone`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phone: "+" + callingCode + phoneNumber
                    })
                });

                const resp = await response.json();

                if (response.ok && await resp.success) {
                    console.log("Phone updated successfully");
                    setSaving(false)
                    router.replace('/settings')
                } else {
                    setSaving(false)
                    setError(t('account.failedUpdatePhone'));
                }
            } catch (err) {
                setError(t('account.phoneUpdateFailed'))
            }
        }

        setSaving(false)
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.pageHeader}>
                    {/* <Image
                        source={require('../../assets/logo_white.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    /> */}

                    <TouchableOpacity
                        onPress={() => {
                            router.back()
                        }}
                        style={[styles.backBtn, isRTL && styles.backBtnRtl]}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>{t('account.back')}</Text>
                    </TouchableOpacity>

                    <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                        <Text style={styles.pageTitle}>{t('account.accountSettings')}</Text>
                        {!loading && user && <Text style={styles.pageDesc}>{user?.name}</Text>}

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

                    <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('account.accountGhost')}</Text>

                    {/* {user && !loading && <View style={styles.profileImage}>
                        {(user.image == null || user.image == "") && (user.type == "Club" || user.type == "Association") && <Image
                            source={require('../../assets/clublogo.png')}
                            style={styles.profileImageAvatar}
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
                    </View>} */}
                </View>

                {user && !loading && <ScrollView>
                    <View style={styles.contentContainer}>
                        {error != null && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}


                        <View style={styles.entity}>
                            <Text style={[styles.title, isRTL && styles.rtlText]}>
                                {t('account.emailAddress')}
                            </Text>
                            <TextInput
                                style={[styles.input,{marginBottom:5}, isRTL && styles.rtlText]}
                                placeholder={t('account.emailAddress')}
                                placeholderTextColor="#A8A8A8"
                                value={emailAddress}
                                onChangeText={setEmailAddress}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Text style={[styles.hint, isRTL && styles.rtlText]}>You use this email to login</Text>

                        </View>

                        <View style={styles.entity}>
                            <Text style={[styles.title, isRTL && styles.rtlText]}>
                                {t('account.phoneNumber')}
                            </Text>
                            <View style={styles.phoneContainer}>
                                <View style={styles.phonePicker}>
                                    <CountryPicker
                                        countryCode={countryCode}
                                        withFilter
                                        withFlag
                                        withCallingCode
                                        withAlphaFilter
                                        withCallingCodeButton
                                        withEmoji={false}
                                        onSelect={(country) => {
                                            setCountryCode(country.cca2);
                                            setCallingCode(country.callingCode[0]);
                                        }}
                                        containerButtonStyle={Platform.OS == "ios" ? { marginTop: -5 } : { marginTop: -2 }}
                                    />
                                </View>
                                <TextInput
                                    style={[styles.input, styles.phoneInput]}
                                    placeholder={t('account.phoneNumber')}
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                />
                            </View>
                        </View>

                        <Text style={[styles.hint, isRTL && styles.rtlText]}>You'll be asked to verify your email and/or phone number if you update them</Text>

                        <View style={[styles.profileActions, styles.inlineActions, isRTL && styles.inlineActionsRtl]}>
                            <TouchableOpacity onPress={() => { handleCancel() }} style={styles.profileButton}>
                                <Text style={styles.profileButtonText}>{t('account.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { handleSave() }} style={[styles.profileButton, styles.savebtn]}>
                                <Text style={styles.profileButtonText}>
                                    {saving ? t('account.saving') : t('account.save')}
                                </Text>
                                {saving && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#111111"
                                        style={styles.saveLoaderContainer}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
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
        height: 270,
        // marginBottom: 30
    },
    logo: {
        width: 120 ,
        height:30,
        position: 'absolute',
        top: 30,
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
        left: undefined,
        right: 20,
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
        marginBottom: 0
    },
    hint: {
        color: 'black',
        opacity: 0.5,
        fontSize: 12,
        fontFamily: 'Acumin',
        marginBottom: 20
    },
    title: {
        fontFamily: "Qatar",
        fontSize: 22,
        color: 'black'
    },
    subtitle: {
        fontFamily: "Acumin",
        fontSize: 16,
        // fontWeight: 600,
        width: '100%',
        textTransform: 'capitalize',
        color: 'black'
    },
    paragraph: {
        fontFamily: "Acumin",
        fontSize: 16,
        color: 'black'
    },
    ghostText: {
        color: '#ffffff',
        fontSize:100,textTransform:'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2
    },
    ghostTextRtl: {
        right: undefined,
        left: -5,
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
    inlineActionsRtl: {
        flexDirection: 'row-reverse',
    },
    profileButton: {
        borderRadius: 5,
        padding: 5,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10
    },
    savebtn: {
        flexDirection: 'row'
    },
    profileButtonText: {textTransform:'uppercase',
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Qatar',
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10
    },
    passwordInput: {
        letterSpacing: 1,
        marginBottom: 0
    },
    saveLoaderContainer: {
        marginLeft: 10
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        gap: 5
    },
    phonePicker: {
        justifyContent: 'center',
        fontSize: 16
    },
    phoneInput: {
        marginBottom: 0,
        backgroundColor: 'transparent',
        flex: 1,
        padding: 0,
        fontSize: 16,
        lineHeight: Platform.OS == 'ios' ? 17 : 16,
    },
    verifiedbadge: {
        color: '#009933',
    },
    otpInput: {
        borderWidth: 1,
        aspectRatio: 0.76,
        flex: 1,
        textAlign: "center",
        fontSize: 40,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 10,
        width: 200,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtnRtl: {
        left: undefined,
        right: 10,
        flexDirection: 'row-reverse',
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Qatar'
    },
    statNumber: {
        fontSize: 44,
        fontFamily: 'Qatar',
        color: '#FF4000',
        textAlign: 'center',
        flex: 1
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
