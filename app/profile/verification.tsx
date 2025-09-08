import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Octicons from '@expo/vector-icons/Octicons';
import * as Clipboard from "expo-clipboard";
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import React, { useEffect, useRef, useState } from 'react';
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


const { width } = Dimensions.get('window');

export default function VerifyProfile() {
    const router = useRouter();

    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countryCode, setCountryCode] = useState<any>("EG");
    const [callingCode, setCallingCode] = useState<any>(20);
    const [emailAddress, setEmailAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState<any>(null);

    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [verifyingPhone, setVerifyingPhone] = useState(false);

    const [emailOTPSent, setEmailOTPSent] = useState(false);
    const [phoneOTPSent, setPhoneOTPSent] = useState(false);

    const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
    const [phoneOtp, setPhoneOtp] = useState(["", "", "", "", "", ""]);

    const [secondsLeft, setSecondsLeft] = useState(0);
    const timerRef = useRef(null);
    const emailInputsRef = useRef([]);
    const phoneInputsRef = useRef([]);

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

        return () => clearInterval(timerRef.current);

    }, []);

    // Auto-verify when email OTP is complete
    useEffect(() => {
        if (emailOTPSent && emailOtp.join("").length === 6) {
            emailInputsRef.current.forEach(ref => ref?.blur());
            handleVerifyEmailOTP();
        }
    }, [emailOtp]);

    // Auto-verify when phone OTP is complete
    useEffect(() => {
        if (phoneOTPSent && phoneOtp.join("").length === 6) {
            phoneInputsRef.current.forEach(ref => ref?.blur());
            handleVerifyPhoneOTP();
        }
    }, [phoneOtp]);

    const isValidEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    };

    const startCountdown = (duration = 60) => {
        clearInterval(timerRef.current); // clear any existing timer
        setSecondsLeft(duration);

        timerRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleChange = (text: string, index: number, refType: 'email' | 'phone') => {
        let newOtp = refType === 'email' ? [...emailOtp] : [...phoneOtp];
        const currentRef = refType === 'email' ? emailInputsRef : phoneInputsRef;

        newOtp[index] = text.slice(-1); // only last char

        refType === 'email' ? setEmailOtp(newOtp) : setPhoneOtp(newOtp);

        // Move to next input if text entered
        if (text && index < 5) {
            currentRef.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number, refType: 'email' | 'phone') => {
        const currentRef = refType === 'email' ? emailInputsRef : phoneInputsRef;
        let otp = refType === 'email' ? emailOtp : phoneOtp;

        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            currentRef.current[index - 1]?.focus();
        }
    };

    const onChangeEmail = () => {
        setEmailOtp(["", "", "", "", "", ""]);
        emailInputsRef.current.forEach(ref => ref?.blur());
        setEmailOTPSent(false);
        setVerifyingEmail(false);
    }

    const onChangePhone = () => {
        setPhoneOtp(["", "", "", "", "", ""]);
        phoneInputsRef.current.forEach(ref => ref?.blur());
        setPhoneOTPSent(false);
        setVerifyingPhone(false);
    }

    const pasteEmailOTP = async () => {
        const pasteData = (await Clipboard.getStringAsync()).trim();

        if (!/^\d+$/.test(pasteData)) return; // only digits allowed

        const digits = pasteData.split("").slice(0, 6); // take max 6
        const newOtp = [...emailOtp];

        digits.forEach((digit, i) => {
            newOtp[i] = digit;
        });

        setEmailOtp(newOtp);

    };

    const pastePhoneOTP = async () => {
        console.log('gettinf paste data')
        const pasteData = (await Clipboard.getStringAsync()).trim();
        console.log('pasteData ', pasteData)

        if (!/^\d+$/.test(pasteData)) return;

        const digits = pasteData.split("").slice(0, 6);
        const newOtp = [...phoneOtp];

        digits.forEach((digit, i) => {
            newOtp[i] = digit;
        });

        setPhoneOtp(newOtp);
    };

    //OTP handling
    const handleSendEmailOTP = async () => {
        // validate email
        // if (!isValidEmail(emailAddress)) {
        //     setError("Please enter a valid email address to verify.")
        //     return;
        // }

        setVerifyingEmail(true)
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        const response = await fetch(`https://riyadah.onrender.com/api/verify/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'email'
            })
        });

        const res = await response.json();

        if (res.result == "success") {
            setEmailOTPSent(true)
            setError(null)
            SecureStore.setItem('emailOTPToken', res.verificationToken)
            emailInputsRef.current[0]?.focus();
            startCountdown();
        } else {
            setEmailOTPSent(false)
            console.error(res)
            setError("Failed to send email OTP");
        }

        setVerifyingEmail(false)
    }

    const handleSendPhoneOTP = async () => {
        //validate phone number
        // if (!isValidPhoneNumber(phoneNumber, countryCode)) {
        //     setError("Invalid phone number");
        //     return;
        // }

        setVerifyingPhone(true)
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        const response = await fetch(`https://riyadah.onrender.com/api/verify/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'phone'
            })
        });

        const res = await response.json();

        if (res.result == "success") {
            setPhoneOTPSent(true)
            setError(null)
            SecureStore.setItem('phoneOTPToken', res.verificationToken)
            phoneInputsRef.current[0]?.focus();
            startCountdown();
        } else {
            setPhoneOTPSent(false)
            setError("Failed to send phone OTP");
        }

        setVerifyingPhone(false)
    }

    const handleResendEmailOTP = () => {
        handleSendEmailOTP()
        setEmailOtp(["", "", "", "", "", ""]);
        emailInputsRef.current[0]?.focus();
    };

    const handleResendPhoneOTP = () => {
        handleSendPhoneOTP()
        setPhoneOtp(["", "", "", "", "", ""]);
        phoneInputsRef.current[0]?.focus();
    };

    const handleVerifyEmailOTP = async () => {
        setVerifyingEmail(true)
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        const response = await fetch(`https://riyadah.onrender.com/api/verify/${userId}/otp`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'email',
                otp: emailOtp.join(""),
                verificationToken: SecureStore.getItem("emailOTPToken"),
            })
        });

        const res = await response.json();

        if (res.result == "success") {
            setEmailOTPSent(false)
            setError(null)
            setUser({
                ...user,
                verified: {
                    email: Date.now(),
                    phone: user.verified?.phone
                }
            });

            if (user.verified.phone != null) {
                router.replace('/settings')
            }
        } else {
            setEmailOTPSent(true)
            console.error(res)
            setError(res.error);
        }

        setVerifyingEmail(false)
    };

    const handleVerifyPhoneOTP = async () => {
        setVerifyingPhone(true)
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        const response = await fetch(`https://riyadah.onrender.com/api/verify/${userId}/otp`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'phone',
                otp: phoneOtp.join(""),
                verificationToken: SecureStore.getItem("phoneOTPToken"),
            })
        });

        const res = await response.json();

        if (res.result == "success") {
            setPhoneOTPSent(false)
            setError(null)
            setUser({
                ...user,
                verified: {
                    email: user.verified?.email,
                    phone: Date.now()
                }
            });
            setTimeout(() => {
                if (user.verified.email != null) {
                    router.replace('/settings')
                }
            }, 1000)
        } else {
            setPhoneOTPSent(true)
            console.error(res)
            setError("Failed to verify phone OTP");
        }

        setVerifyingPhone(false)
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
                        <Text style={styles.pageTitle}>Verify account</Text>
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

                    <Text style={styles.ghostText}>Verify</Text>

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

                        {!emailOTPSent && !phoneOTPSent &&
                            <View>
                                <View style={styles.entity}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={styles.title}>
                                            Email address
                                        </Text>
                                        {user.verified.email == null &&
                                            <TouchableOpacity onPress={handleSendEmailOTP} style={[styles.profileButton, styles.savebtn]}>
                                                <Text style={styles.profileButtonText}>
                                                    {verifyingEmail ? 'Sending OTP' : 'Send OTP'}
                                                </Text>
                                                {verifyingEmail && (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color="#111111"
                                                        style={styles.saveLoaderContainer}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        }

                                        {user.verified.email != null &&
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                <Octicons name="verified" size={14} color="#009933" />
                                                <Text style={styles.verifiedbadge}>
                                                    Verified
                                                </Text>
                                            </View>
                                        }
                                    </View>

                                    {/* {user.verified.email == null &&
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email"
                                            placeholderTextColor="#A8A8A8"
                                            value={emailAddress}
                                            onChangeText={setEmailAddress}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    } */}

                                    {/* {user.verified.email != null && */}
                                    <Text style={{ paddingTop: 5, paddingBottom: 20, color: 'black', fontSize: 16 }}>
                                        {user.email}
                                    </Text>
                                    {/* } */}
                                </View>

                                <View style={styles.entity}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={styles.title}>
                                            Phone number
                                        </Text>

                                        {user.verified.phone == null &&
                                            <TouchableOpacity onPress={handleSendPhoneOTP} style={[styles.profileButton, styles.savebtn]}>
                                                <Text style={styles.profileButtonText}>
                                                    {verifyingPhone ? 'Sending OTP' : 'Send OTP'}
                                                </Text>
                                                {verifyingPhone && (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color="#111111"
                                                        style={styles.saveLoaderContainer}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        }

                                        {user.verified.phone != null &&
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                <Octicons name="verified" size={14} color="#009933" />
                                                <Text style={styles.verifiedbadge}>
                                                    Verified
                                                </Text>
                                            </View>
                                        }
                                    </View>
                                    {/* {user.verified.phone == null &&
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
                                    } */}

                                    {/* {user.verified.phone != null && */}
                                    <Text style={{ paddingTop: 5, paddingBottom: 20, color: 'black', fontSize: 16 }}>
                                        {user.phone}
                                    </Text>
                                    {/* } */}
                                </View>
                            </View>
                        }

                        {emailOTPSent &&
                            <View>
                                <Text style={{ textAlign: 'center', marginBottom: 10, color: 'black', fontSize: 14 }}>We sent you a code on</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                    <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 14 }}>
                                        {emailAddress}
                                    </Text>
                                    {/* <TouchableOpacity onPress={onChangeEmail} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ color: "#000", fontSize: 14 }}>(</Text>
                                        <Text style={{ color: "#FF4000", fontSize: 14 }}>Change</Text>
                                        <Text style={{ color: "#000", fontSize: 14 }}>)</Text>
                                    </TouchableOpacity> */}
                                </View>

                                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between", marginVertical: 20 }}>
                                    {emailOtp.map((digit, idx) => (
                                        <View style={styles.otpInputContainer} key={idx}>
                                            <TextInput
                                                ref={el => (emailInputsRef.current[idx] = el)}
                                                style={styles.otpInput}
                                                keyboardType="number-pad"
                                                maxLength={1}
                                                value={digit}
                                                onChangeText={text => handleChange(text, idx, 'email')}
                                                onKeyPress={e => handleKeyPress(e, idx, 'email')}
                                            />
                                        </View>
                                    ))}
                                    <TouchableOpacity onPress={() => pasteEmailOTP()} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialIcons name="content-paste" size={24} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'space-between' }}>
                                    {secondsLeft > 0 ? (
                                        <Text style={{ color: "#aaa" }}>Get a new code {secondsLeft}s</Text>
                                    ) : (
                                        <TouchableOpacity onPress={handleResendEmailOTP}>
                                            <Text style={{ color: "#FF4000" }}>Get a new code</Text>
                                        </TouchableOpacity>
                                    )}
                                    <View style={[styles.profileActions, styles.inlineActions, { paddingTop: 0, borderTopWidth: 0 }]}>
                                        <TouchableOpacity onPress={handleVerifyEmailOTP} disabled={verifyingEmail} style={[styles.profileButton, { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 0, paddingVertical: 10, paddingHorizontal: 15 }]}>
                                            <Text style={styles.profileButtonText}>
                                                {verifyingEmail ? 'Verifying' : 'Verify'}
                                            </Text>
                                            {verifyingEmail && <ActivityIndicator size="small" color={'black'} />}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        }

                        {phoneOTPSent &&
                            <View>
                                <Text style={{ textAlign: 'center', marginBottom: 10, color: 'black', fontSize: 14 }}>We sent you a code on</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                    <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 14 }}>
                                        {'+' + callingCode + phoneNumber}
                                    </Text>
                                    {/* <TouchableOpacity onPress={onChangePhone} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ color: "#000", fontSize: 14 }}>(</Text>
                                        <Text style={{ color: "#FF4000", fontSize: 14 }}>Change</Text>
                                        <Text style={{ color: "#000", fontSize: 14 }}>)</Text>
                                    </TouchableOpacity> */}
                                </View>

                                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between", marginVertical: 20 }}>
                                    {phoneOtp.map((digit, idx) => (
                                        <TextInput
                                            key={idx}
                                            ref={el => (phoneInputsRef.current[idx] = el)}
                                            style={styles.otpInput}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={text => handleChange(text, idx, 'phone')}
                                            onKeyPress={e => handleKeyPress(e, idx, 'phone')}
                                        />
                                    ))}
                                    <TouchableOpacity onPress={() => pastePhoneOTP()} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialIcons name="content-paste" size={24} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'space-between' }}>
                                    {secondsLeft > 0 ? (
                                        <Text style={{ color: "#aaa" }}>Get a new code {secondsLeft}s</Text>
                                    ) : (
                                        <TouchableOpacity onPress={handleResendPhoneOTP}>
                                            <Text style={{ color: "#FF4000" }}>Get a new code OTP</Text>
                                        </TouchableOpacity>
                                    )}
                                    <View style={[styles.profileActions, styles.inlineActions, { paddingTop: 0, borderTopWidth: 0 }]}>
                                        <TouchableOpacity onPress={handleVerifyPhoneOTP} disabled={verifyingPhone} style={[styles.profileButton, { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 0, paddingVertical: 10, paddingHorizontal: 15 }]}>
                                            <Text style={styles.profileButtonText}>
                                                {verifyingPhone ? 'Verifying' : 'Verify'}
                                            </Text>
                                            {verifyingPhone && <ActivityIndicator size="small" color={'black'} />}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        }
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
        fontSize: 20,
        color: 'black'
    },
    subtitle: {
        fontFamily: "Manrope",
        fontSize: 16,
        // fontWeight: 'bold',
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
    otpInputContainer: {
        borderWidth: 1,
        // borderColor: 'red',
        width: Platform.OS=='ios' ? 40 : 35,
        height: 50,
        borderRadius: 10,
        marginHorizontal: 5,
        overflow: 'hidden',
        justifyContent: 'center',
        alignContent:'center'
    },
    otpInput: {
        fontSize: 40,
        color: 'black',
        lineHeight: 45,
        padding: 0,
        includeFontPadding: false,
        textAlign:'center',
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
});
