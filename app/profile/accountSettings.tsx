import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';

const { width } = Dimensions.get('window');

export default function AccountSettings() {
    const router = useRouter();
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

                const response = await fetch(`https://riyadah.onrender.com/api/users/${decodedToken.userId}`, {
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
        // validate email
        if (!isValidEmail(emailAddress)) {
            setError("Invalid email address")
            return;
        }

        //validate phone number
        if (!isValidPhoneNumber("" + phoneNumber, countryCode)) {
            setError("Invalid phone number");
            return;
        }

        const updatedFields = { verified: {} };

        // Add field only if it changed
        if (emailAddress != user.email) {
            updatedFields.email = emailAddress;
            updatedFields.verified.email = null;
        }
        if ("+" + callingCode + phoneNumber != user.phone) {
            updatedFields.phone = "+" + callingCode + phoneNumber;
            updatedFields.verified.phone = null;
        }

        if (Object.keys(updatedFields.verified).length === 0) {
            setError('Nothing changed');
            return;
        }

        setSaving(true)
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        const response = await fetch(`https://riyadah.onrender.com/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...user,
                ...updatedFields
            })
        });

        if (response.ok) {
            console.log("Profile updated successfully");
            router.back();
        } else {
            console.error("Failed to update profile");
        }
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
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>Account settings</Text>
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

                    <Text style={styles.ghostText}>Accou</Text>

                    {user && !loading && <View style={styles.profileImage}>
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
                    </View>}
                </View>

                {user && !loading && <ScrollView>
                    <View style={styles.contentContainer}>
                        {error != null && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}


                        <View style={styles.entity}>
                            <Text style={styles.title}>
                                Email
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#A8A8A8"
                                value={emailAddress}
                                onChangeText={setEmailAddress}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.entity}>
                            <Text style={styles.title}>
                                Phone
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
                                    placeholder="Phone number"
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                />
                            </View>
                        </View>

                        <View style={[styles.profileActions, styles.inlineActions]}>
                            <TouchableOpacity onPress={() => { handleCancel() }} style={styles.profileButton}>
                                <Text style={styles.profileButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { handleSave() }} style={[styles.profileButton, styles.savebtn]}>
                                <Text style={styles.profileButtonText}>
                                    {saving ? 'Saving' : 'Save'}
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
        alignItems: 'flex-start'
    },
    errorIcon: {
        width: 3,
        height: 15,
        backgroundColor: 'red',
        borderRadius: 5,
        marginRight: 10,
        marginTop: 3
    },
    errorText: {
        color: 'red',
        fontFamily: 'Manrope',
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
    entity: {
        marginBottom: 20
    },
    title: {
        fontFamily: "Bebas",
        fontSize: 22,
        color: 'black'
    },
    subtitle: {
        fontFamily: "Manrope",
        fontSize: 16,
        // fontWeight: 600,
        width: '100%',
        textTransform: 'capitalize',
        color: 'black'
    },
    paragraph: {
        fontFamily: "Manrope",
        fontSize: 16,
        color: 'black'
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
        padding: 5,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10
    },
    savebtn: {
        flexDirection: 'row'
    },
    profileButtonText: {
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Bebas',
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
        alignContent: 'center',
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Bebas'
    },
    statNumber: {
        fontSize: 44,
        fontFamily: 'Bebas',
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
