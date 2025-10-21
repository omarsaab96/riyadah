import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
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

const { width } = Dimensions.get('window');

export default function ChangePassword() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [oldPassword, setOldPassword] = useState("");
    const [oldPasswordVerified, setOldPasswordVerified] = useState(false);
    const [checkingCurrentPassword, setCheckingCurrentPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
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

                const response = await fetch(`http://193.187.132.170:5000/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    setUser(user)
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

    const isValidPassword = (password: string) => {
        return password.length >= 6;
    };

    const handleNext = async () => {

        if (oldPassword.trim() == "") {
            setError("Please enter your current password");
            return;
        }

        setCheckingCurrentPassword(true)
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        try {
            const response = await fetch(`http://193.187.132.170:5000/api/users/checkpassword/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: oldPassword
                })
            });

            const resp = await response.json();

            if (response.ok && resp.success) {
                setOldPasswordVerified(true)
                setError(null)
            } else {
                setOldPasswordVerified(false)
                setError('Current password is wrong')
            }
        } catch (error) {
            setOldPasswordVerified(false);
            setError('Something went wrong.');
        } finally {
            setCheckingCurrentPassword(false);
        }
    }

    const handleSave = async () => {

        if (newPassword != newPassword2) {
            setError("Passwords do not match");
            return;
        }

        if (oldPassword == newPassword) {
            setError("New password cannot be the same as the old one");
            return;
        }

        if (!isValidPassword(newPassword)) {
            setError("Password must be at least 6 characters");
            return;
        }

        setError(null)
        setSaving(true)
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        const response = await fetch(`http://193.187.132.170:5000/api/users/updatePassword`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: newPassword
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
                        <Text style={styles.pageTitle}>Change password</Text>
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

                    <Text style={styles.ghostText}>Passwo</Text>

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

                        {!oldPasswordVerified &&
                            <View>
                                <View style={styles.entity}>
                                    <Text style={styles.title}>
                                        Current Password
                                    </Text>
                                    <TextInput
                                        style={[styles.input, styles.passwordInput]}
                                        placeholder="Password"
                                        placeholderTextColor="#A8A8A8"
                                        value={oldPassword}
                                        onChangeText={setOldPassword}
                                        secureTextEntry
                                    />
                                </View>
                                <View style={[styles.profileActions, styles.inlineActions]}>
                                    <TouchableOpacity onPress={() => { handleCancel() }} style={styles.profileButton}>
                                        <Text style={styles.profileButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { handleNext() }} style={[styles.profileButton, styles.savebtn]}>
                                        <Text style={styles.profileButtonText}>
                                            {!checkingCurrentPassword && 'Next'}
                                        </Text>
                                        {checkingCurrentPassword && (
                                            <ActivityIndicator
                                                size="small"
                                                color="#111111"
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>}

                        {oldPasswordVerified && <View>
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
        paddingRight:15,
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
