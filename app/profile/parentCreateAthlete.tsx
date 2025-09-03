import Feather from '@expo/vector-icons/Feather';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from 'react';
import { useRegistration } from '../../context/registration';

import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const sportTypes = [
    { label: 'Football', icon: require('../../assets/football.png') },
    { label: 'Basketball', icon: require('../../assets/basketball.png') },
    { label: 'Gymnastics', icon: require('../../assets/gymnastics.png') },
    { label: 'Racing', icon: require('../../assets/racing.png') },
    { label: 'Golf', icon: require('../../assets/golf.png') },
];

const featuredClubs = [
    { label: 'FC Barcelona', icon: require('../../assets/fcb.png') },
    { label: 'Manchester United', icon: require('../../assets/manun.png') },
    { label: 'Juventus FC', icon: require('../../assets/juvi.png') },
    { label: 'Bayern Munich', icon: require('../../assets/bayern.png') },
    { label: 'Paris Saint-Germain (PSG)', icon: require('../../assets/psg.png') },
];

const genders = [
    { label: 'Male', icon: require('../../assets/male.png') },
    { label: 'Female', icon: require('../../assets/female.png') }
];

export default function ParentCreateAthlete() {
    const { formData, updateFormData } = useRegistration();
    const router = useRouter();
    const [countryCode, setCountryCode] = useState('LB');
    const [callingCode, setCallingCode] = useState('961');

    const [name, setName] = useState<string | null>(formData.name || null);
    const [email, setEmail] = useState<string | null>(formData.email || null);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(formData.phone || null);
    const [password, setPassword] = useState<string | null>(formData.password || null);
    const [agreed, setAgreed] = useState<boolean | null>(formData.agreed || null);
    const [day, setDay] = useState<string | null>(formData.dob.day || null);
    const [month, setMonth] = useState<string | null>(formData.dob.month || null);
    const [year, setYear] = useState<string | null>(formData.dob.year || null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [selectedSport, setSelectedSport] = useState<string | null>(formData.sport || null);
    const [independent, setIndependent] = useState<boolean>(formData.club == 'Independent' ? true : false);
    const [selectedClub, setSelectedClub] = useState<string | null>(formData.club != 'Independent' ? formData.club : null);
    const [selectedGender, setSelectedGender] = useState<string | null>(formData.gender || null);
    const [childRegistered, setChildRegistered] = useState(false);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);


    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);

    const checkAvailability = async (email: string, phone?: string) => {
        try {
            const response = await fetch('https://riyadah.onrender.com/api/users/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Availability check error:', err);
            return { success: false, msg: 'Server error' };
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');

            console.log(token)
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
                } else {
                    console.error('API error')
                }
            } else {
                console.log("no token",)
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        console.log("User: ", user)
    }, [user]);

    useEffect(() => {
        console.warn("formData: ", formData)
    }, [formData]);

    const toggleCheckbox = () => {
        setAgreed(prev => !prev);
    };

    const toggleCheckboxIndependent = () => {
        setIndependent(prev => !prev);
    };

    const handleCopy = () => {
        const loginInfo = `Hello, ${formData.name}!\nUse this email to login to your Riyadah account.\n${formData.email}`;
        Clipboard.setStringAsync(loginInfo);
        setCopied(true);

        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `Hello, ${formData.name}!\nUse this email to login to your Riyadah account.\n${formData.email}`,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    console.log('Credentials shared');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing post:', error.message);
        }
    };

    const handleRegister = async () => {
        setSaving(true)

        // if (!agreed) {
        //     setError('Kindly agree to terms')
        //     return;
        // }

        // if (!selectedGender) {
        //     setError('Kindly select a gender')
        //     return;
        // }

        // if (!independent && !selectedClub) {
        //     setError('Kindly select a club')
        // }

        // if (!selectedSport) {
        //     setError('Kindly select a sport type')
        // }

        // if (!day && !month && !year) {
        //     setError('Kindly fill date of birth')
        // }

        if (name != null && email != null) {
            const checkResult = await checkAvailability(email);

            if (!checkResult.success) {
                setError(checkResult.msg);
                setSaving(false);
                return;
            }

        } else {
            setSaving(false)
            setError('Please fill name and email');
        }

        updateFormData({
            name: name,
            email: email,
            // phone: phoneNumber,
            // gender: selectedGender,
            // country: countryCode,
            // agreed: agreed,
            parentEmail: user.email,
            type: "Athlete",
            // sport: selectedSport,
            // dob: {
            //     day: day,
            //     month: month,
            //     year: year
            // },
            // club: independent ? 'Independent' : selectedClub,
            verified: {
                email: null,
                phone: null
            },
            personalAccount: false,
            skillsAreVerified: false,
            isStaff: []
        });

        try {
            const newUserData = { ...formData }

            console.log('Submitting user data:', newUserData);

            const response = await fetch('https://riyadah.onrender.com/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserData),
            });

            console.log(response)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (err) {
            console.error('Child creation failed:', err);
            setError('Something went wrong. Please try again later.');
        } finally {
            setSaving(false);
        }



        setChildRegistered(true)
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust as needed
            >

                <View style={styles.pageHeader}>
                    <Image
                        source={require('../../assets/logo_white.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>
                            Child Account
                        </Text>
                        <Text style={styles.pageDesc}>
                            Turn your child into a real Riyadah athlete
                        </Text>
                    </View>

                    <Text style={styles.ghostText}>
                        Childr
                    </Text>

                </View>

                {!childRegistered && <ScrollView>
                    <View style={styles.form}>

                        <TextInput
                            style={styles.input}
                            placeholder="Child name"
                            placeholderTextColor="#A8A8A8"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                        <TextInput
                            style={[styles.input, { marginBottom: 5 }]}
                            placeholder="Child email"
                            placeholderTextColor="#A8A8A8"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Text style={styles.uploadHint}>This will be used to login</Text>

                        {/* <View style={styles.phoneContainer}>
                            <View style={styles.phonePicker}>
                                <CountryPicker
                                    countryCode={countryCode}
                                    withFilter
                                    withFlag
                                    withCallingCode
                                    withAlphaFilter
                                    withCallingCodeButton
                                    withEmoji={false}
                                    theme={{
                                        itemHeight: 44,
                                        fontSize: 14
                                    }}
                                    onSelect={(country) => {
                                        setCountryCode(country.cca2);
                                        setCallingCode(country.callingCode[0]);
                                    }}
                                />
                            </View>
                            <TextInput
                                style={[styles.input, styles.phoneInput]}
                                placeholder="Child phone number"
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                            />
                        </View>

                        <View style={styles.dobRow}>
                            <TextInput
                                ref={dayRef}
                                style={styles.dobInput}
                                placeholder="DD"
                                placeholderTextColor="#aaa"
                                keyboardType="number-pad"
                                maxLength={2}
                                value={day}
                                onChangeText={(text) => {
                                    setDay(text);
                                    if (text.length === 2) {
                                        monthRef.current?.focus();
                                    }
                                }}
                                returnKeyType="next"
                            />
                            <Text style={styles.dobSeperator}>/</Text>
                            <TextInput
                                style={styles.dobInput}
                                placeholder="MM"
                                placeholderTextColor="#aaa"
                                keyboardType="number-pad"
                                maxLength={2}
                                value={month}
                                onChangeText={(text) => {
                                    setMonth(text);
                                    if (text.length === 2) {
                                        yearRef.current?.focus();
                                    }
                                }}
                                ref={monthRef}
                                returnKeyType="next"
                            />
                            <Text style={styles.dobSeperator}>/</Text>
                            <TextInput
                                style={styles.dobInput}
                                placeholder="YYYY"
                                placeholderTextColor="#aaa"
                                keyboardType="number-pad"
                                maxLength={4}
                                value={year}
                                onChangeText={setYear}
                                ref={yearRef}
                                returnKeyType="done"
                            />
                        </View>

                        <Text style={styles.formLabel}>Select child gender</Text>
                        <View style={styles.wizardContainer}>
                            {genders.map(({ label, icon }, idx) => (
                                <TouchableOpacity
                                    key={label}
                                    style={[
                                        styles.accountOption,
                                        selectedGender === label && styles.accountOptionSelected,
                                    ]}
                                    onPress={() => setSelectedGender(label)}
                                >
                                    <Image source={icon} style={styles.icon} resizeMode="contain" />
                                    <Text style={[styles.accountText, selectedGender === label && styles.accountTextSelected]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.formLabel}>What does your child do?</Text>
                        <View style={styles.wizardContainer}>
                            {sportTypes.map(({ label, icon }, idx) => (
                                <TouchableOpacity
                                    key={label}
                                    style={[
                                        styles.accountOption,
                                        selectedSport === label && styles.accountOptionSelected,
                                    ]}
                                    onPress={() => setSelectedSport(label)}
                                >
                                    <Image source={icon} style={styles.icon} resizeMode="contain" />
                                    <Text style={[styles.accountText, selectedSport === label && styles.accountTextSelected]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.formLabel}>What club is your child in?</Text>
                        <TouchableOpacity onPress={toggleCheckboxIndependent} style={styles.checkboxContainerIndependent} activeOpacity={1}>
                            <View style={styles.checkbox}>
                                {independent && <View style={styles.checked} >
                                    <Image source={require('../../assets/check.png')} style={styles.checkImage} />
                                </View>}
                            </View>

                            <Text style={styles.label}>
                                My child is independent and does not have a club.
                            </Text>
                        </TouchableOpacity>

                        {!independent && <View style={styles.wizardContainer}>
                            {featuredClubs.map(({ label, icon }, idx) => (
                                <TouchableOpacity
                                    key={label}
                                    style={[
                                        styles.accountOption,
                                        selectedSport === label && styles.accountOptionSelected,
                                    ]}
                                    onPress={() => setSelectedSport(label)}
                                >
                                    <Image source={icon} style={styles.icon} resizeMode="contain" />
                                    <Text style={[styles.accountText, selectedSport === label && styles.accountTextSelected]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>} */}

                        {/* <TouchableOpacity onPress={toggleCheckbox} style={styles.checkboxContainer} activeOpacity={1}>
                            <View style={styles.checkbox}>
                                {agreed && <View style={styles.checked} >
                                    <Image source={require('../../assets/check.png')} style={styles.checkImage} />
                                </View>}
                            </View>

                            <Text style={styles.label}>
                                I agree to the{' '}
                                <Text style={styles.link} onPress={() => router.push('/termsConditions')}>
                                    Terms & Conditions
                                </Text>
                            </Text>
                        </TouchableOpacity> */}


                        {error != '' && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {/* <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.replace('/profile/addChildren')}>
                            <Image source={require('../../assets/buttonBeforeLight.png')} style={styles.sideRect} />
                            <View style={styles.createAccountButton}>
                                <Text style={styles.createAccountText}>cancel</Text>
                            </View>
                            <Image source={require('../../assets/buttonAfterLight.png')} style={styles.sideRectAfter} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.fullButtonRow} onPress={handleRegister}>
                            <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} />
                            <View style={styles.loginButton}>
                                <Text style={styles.loginText}>CREATE Child ACCOUNT</Text>
                                {loading && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                        style={styles.loginLoader}
                                    />
                                )}
                            </View>
                            <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
                        </TouchableOpacity> */}

                        <View style={[styles.profileActions, styles.inlineActions]}>
                            <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                                <Text style={styles.profileButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleRegister} style={[styles.profileButton, styles.savebtn]}>
                                <Text style={styles.profileButtonText}>{saving ? 'Saving' : 'Save'}</Text>
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

                    {/* <View style={styles.disclaimer}>
                        <Text style={styles.hint}>
                            By agreeing to the above terms, you are consenting that your personal information will be collected, stored, and processed on behalf of RIYADAH
                        </Text>
                    </View> */}
                </ScrollView>
                }

                {childRegistered &&
                    <View style={styles.childConfirmation}>
                        <Text style={styles.confirmationTitle}>
                            Child account created successfully
                        </Text>

                        <Text style={styles.confirmationSubTitle}>
                            Email: {formData.email}
                        </Text>
                        {/* 
                        <Text style={styles.confirmationSubTitle}>
                            Password: {formData.password}
                        </Text> */}

                        <View style={[styles.profileActions, styles.inlineActions]}>
                            <TouchableOpacity onPress={handleCopy} style={styles.profileButton}>
                                {copied ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Feather name="check" size={16} color="black" />
                                        <Text style={styles.profileButtonText}>Copied</Text>
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Feather name="copy" size={16} color="black" />
                                        <Text style={styles.profileButtonText}>Copy</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShare} style={[styles.profileButton, styles.savebtn]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Feather name="share-2" size={16} color="black" />
                                    <Text style={styles.profileButtonText}>Share</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.hint, { marginTop: 30, marginBottom: 50 }]}>
                            {`You can screenshot these credentials or copy/paste them to your child in order to login to their account.\nYou will not be able to see these info again.`}
                        </Text>

                        <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.replace('/profile/addChildren')}>
                            <Image source={require('../../assets/buttonBeforeLight.png')} style={styles.sideRect} />
                            <View style={styles.createAccountButton}>
                                <Text style={styles.createAccountText}>Add another child</Text>
                            </View>
                            <Image source={require('../../assets/buttonAfterLight.png')} style={styles.sideRectAfter} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.replace('/profile/editProfile')}>
                            <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} />
                            <View style={styles.loginButton}>
                                <Text style={styles.loginText}>continue editing your profile</Text>
                            </View>
                            <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
                        </TouchableOpacity>

                    </View>
                }
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%',
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        marginBottom: 30
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
        marginBottom: 10
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
    form: {
        paddingLeft: 20,
        paddingRight: 20
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        paddingLeft: 15,
    },
    phonePicker: {
        paddingTop: 10
    },
    phoneInput: {
        marginBottom: 0,
        flexGrow: 1,
        backgroundColor: 'transparent',
    },
    passwordInput: {
        letterSpacing: 1,
        marginBottom: 0
    },
    fullButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    loginButton: {
        flex: 1,
        backgroundColor: '#000000',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    loginLoader: {
        marginLeft: 10
    },
    loginText: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'Bebas',
    },
    sideRect: {
        height: 48,
        width: 13,
    },
    sideRectAfter: {
        height: 48,
        width: 13,
        marginLeft: -1
    },
    forgotPassword: {
        marginTop: 10,
        marginBottom: 40
    },
    forgotPasswordText: {
        alignSelf: 'flex-end',
        color: '#525252',
        textDecorationLine: 'underline'
    },
    switchLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    switchLink: {
        marginLeft: 5,
        fontFamily: 'Bebas',
        fontSize: 16,
        paddingTop: 3,
        lineHeight: 16
    },
    hintContainer: {
        marginTop: 5,
        marginBottom: 20
    },
    disclaimer: {
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 40,
        marginBottom: 80
    },
    hint: {
        color: '#525252',
        fontSize: 12,
        fontFamily: 'Manrope'
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40
    },
    checkboxContainerIndependent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    checkbox: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#000000',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    checked: {
        width: 16,
        height: 16,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkImage: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },
    label: {
        color: '#000000',
        fontFamily: 'Manrope',
    },
    formLabel: {
        color: '#000000',
        fontFamily: 'Manrope',
        fontWeight: 'bold',
        marginBottom: 10,
        fontSize: 16
    },
    link: {
        color: '#000000',
        fontWeight: 'bold',
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
    wizardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 40
    },
    accountOption: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
        width: (width - 60) / 2,
        position: 'relative',
        height: 80,
        fontFamily: 'Manrope'
    },
    accountOptionSelected: {
        borderColor: '#FF4000',
        backgroundColor: '#FFE6D8',
        fontFamily: 'Manrope'
    },
    accountText: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'Manrope',
    },
    icon: {
        width: 50,
        height: 50,
        position: 'absolute',
        bottom: 0,
        right: 0
    },
    accountTextSelected: {
        color: '#FF4000',
        fontWeight: 'bold',
    },
    dobRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 20
    },
    dobInput: {
        flex: 1,
        fontSize: 18,
        color: 'black',
        textAlign: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 10
    },
    dobSeperator: {
        fontSize: 30,
        fontFamily: 'Bebas',
        fontWeight: 'bold',
        color: '#FF4000',
        marginHorizontal: 10
    },
    childConfirmation: {
        paddingHorizontal: 20
    },
    confirmationTitle: {
        fontFamily: 'Bebas',
        fontSize: 20,
        marginBottom: 5,
        color: 'black'
    },
    confirmationSubTitle: {
        fontFamily: 'Manrope',
        fontSize: 16,
        color: 'black'
    },
    profileActions: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.2)',
        paddingTop: 10,
        marginTop: 20
    },
    inlineActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        columnGap: 15
    },
    profileButtonText: {
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    profileButton: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    savebtn: {
        flexDirection: 'row'
    },
    createAccountButton: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createAccountText: {
        fontSize: 20,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    uploadHint: {
        fontFamily: 'Manrope',
        marginBottom: 10,
        color: '#111111'
    },
    saveLoaderContainer: {
        marginLeft: 10
    },
});
