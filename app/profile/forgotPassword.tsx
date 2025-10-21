import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from "expo-clipboard";
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
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

const { width } = Dimensions.get('window');

export default function ForgotPassword() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [checkedEmail, setCheckedEmail] = useState(false);
    const [checkedEmailIsVerified, setCheckedEmailIsVerified] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verifyingEmailOTP, setVerifyingEmailOTP] = useState(false);
    const [emailOTPSent, setEmailOTPSent] = useState(false);
    const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const timerRef = useRef(null);
    const emailInputsRef = useRef([]);


    const handleCancel = () => {
        router.back();
    }

    const isValidEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    };

    const isValidPassword = (password: string) => {
        return password.length >= 6;
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

    // Auto-verify when email OTP is complete
    useEffect(() => {
        if (emailOTPSent && emailOtp.join("").length === 6) {
            emailInputsRef.current.forEach(ref => ref?.blur());
            handleVerifyEmailOTP();
        }
    }, [emailOtp]);

    const handleChange = (text: string, index: number) => {
        let newOtp = [...emailOtp]

        newOtp[index] = text.slice(-1); // only last char

        setEmailOtp(newOtp)

        // Move to next input if text entered
        if (text && index < 5) {
            emailInputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        let otp = emailOtp

        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            emailInputsRef.current[index - 1]?.focus();
        }
    };

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

    const handleNext = async () => {

        if (userEmail.trim() == "" || !isValidEmail(userEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        setCheckingEmail(true)
        try {
            const response = await fetch(`http://193.187.132.170:5000/api/users/check/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail
                })
            });

            const resp = await response.json();

            if (response.ok && !resp.success && resp.msg == "Email already exists") {
                setCheckedEmail(true)
                setError(null)
                handleSendEmailOTP();
            } else {
                setCheckedEmail(false)
                setError('No account found')
            }
        } catch (error) {
            setCheckedEmail(false);
            setError('Something went wrong.');
        } finally {
            setCheckingEmail(false);
        }
    }

    const handleSendEmailOTP = async () => {

        const response = await fetch(`http://193.187.132.170:5000/api/verify/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userEmail
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
    }

    const handleResendEmailOTP = () => {
        handleSendEmailOTP()
        setEmailOtp(["", "", "", "", "", ""]);
        emailInputsRef.current[0]?.focus();
    };

    const handleVerifyEmailOTP = async () => {
        setVerifyingEmailOTP(true)

        const response = await fetch(`http://193.187.132.170:5000/api/verify/emailOtp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                otp: emailOtp.join(""),
                verificationToken: SecureStore.getItem("emailOTPToken"),
            })
        });

        const res = await response.json();

        if (res.result == "success") {
            setEmailOTPSent(false)
            setError(null)
            setCheckedEmailIsVerified(true)
        } else {
            setEmailOTPSent(true)
            console.error(res)
            setError(res.error);
        }

        setVerifyingEmailOTP(false)
    };

    const handleSave = async () => {

        if (newPassword != newPassword2) {
            setError("Passwords do not match");
            return;
        }

        if (!isValidPassword(newPassword)) {
            setError("Password must be at least 6 characters");
            return;
        }

        setError(null)
        setSaving(true)
        const response = await fetch(`http://193.187.132.170:5000/api/users/resetPassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                password: newPassword
            })
        });

        if (response.ok) {
            console.log("Password updated");
            router.replace('/login');
        } else {
            setSaving(false)
            console.error("Failed to update password");
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
                        <Text style={styles.pageTitle}>Forgot password</Text>
                        {!loading && <Text style={styles.pageDesc}>Reset your account's password</Text>}

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

                    <Text style={styles.ghostText}>Forgo</Text>
                </View>

                {!loading && <ScrollView>
                    <View style={styles.contentContainer}>
                        {error != null && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {!checkedEmail &&
                            <View>
                                <View style={styles.entity}>
                                    <Text style={styles.title}>
                                        Email
                                    </Text>
                                    <TextInput
                                        style={[styles.input, { marginBottom: 5 }]}
                                        placeholder="Email"
                                        placeholderTextColor="#A8A8A8"
                                        value={userEmail}
                                        onChangeText={setUserEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                <View style={[styles.profileActions, styles.inlineActions]}>
                                    <TouchableOpacity onPress={() => { handleCancel() }} style={styles.profileButton}>
                                        <Text style={styles.profileButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { handleNext() }} style={[styles.profileButton, styles.savebtn]}>
                                        <Text style={styles.profileButtonText}>
                                            {!checkingEmail && 'Next'}
                                        </Text>
                                        {checkingEmail && (
                                            <ActivityIndicator
                                                size="small"
                                                color="#111111"
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }

                        {checkedEmail && emailOTPSent &&
                            <View>
                                <Text style={{ textAlign: 'center', marginBottom: 10, color: 'black', fontSize: 14 }}>We sent you a code on</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                    <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 14 }}>
                                        {userEmail}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between", marginVertical: 20 }}>
                                    {emailOtp.map((digit, idx) => (
                                        <TextInput
                                            key={idx}
                                            ref={el => (emailInputsRef.current[idx] = el)}
                                            style={styles.otpInput}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={text => handleChange(text, idx, 'email')}
                                            onKeyPress={e => handleKeyPress(e, idx, 'email')}
                                        />
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
                                        <TouchableOpacity onPress={handleVerifyEmailOTP} disabled={verifyingEmailOTP} style={[styles.profileButton, { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 0, paddingVertical: 10, paddingHorizontal: 15 }]}>
                                            <Text style={styles.profileButtonText}>
                                                {verifyingEmailOTP ? 'Verifying' : 'Verify'}
                                            </Text>
                                            {verifyingEmailOTP && <ActivityIndicator size="small" color={'black'} />}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        }

                        {checkedEmail && checkedEmailIsVerified &&
                        <View>
                            <View style={styles.entity}>
                                <Text style={styles.title}>
                                    New Password
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Password"
                                    placeholderTextColor="#A8A8A8"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                />
                            </View>
                            <View style={styles.entity}>
                                <Text style={styles.title}>
                                    Repeat New Password
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Password"
                                    placeholderTextColor="#A8A8A8"
                                    value={newPassword2}
                                    onChangeText={setNewPassword2}
                                    secureTextEntry
                                />
                            </View>

                            <View style={[styles.profileActions, styles.inlineActions]}>
                                <TouchableOpacity onPress={() => { handleCancel() }} style={styles.profileButton}>
                                    <Text style={styles.profileButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { handleSave() }} style={[styles.profileButton, styles.savebtn]}>
                                    <Text style={styles.profileButtonText}>
                                        {saving ? 'Resetting password' : 'Reset password'}
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
                        </View>}


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
        paddingRight: 15,
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
