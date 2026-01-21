import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker as RNPicker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from 'react';
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

const CreateAthleteScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const scrollViewRef = useRef(null);
    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [sportOptions, setSportOptions] = useState([]);
    const [sportsLoading, setSportsLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        country: '',
        dob: {
            day: '',
            month: '',
            year: ''
        },
        sport: '',
        agreed: false,
        type: 'Athlete',
    });

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.userId);

                const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    console.error('API error');
                }
            }
            setLoading(false);
        };

        const fetchSports = async () => {
            try {
                setSportsLoading(true);
                const response = await fetch('https://server.riyadah.app/api/sports');
                if (response.ok) {
                    const data = await response.json();
                    const options = Array.isArray(data.data) ? data.data : data;
                    setSportOptions(Array.isArray(options) ? options : []);
                } else {
                    setSportOptions([]);
                }
            } catch (error) {
                console.error('Error fetching sports:', error);
                setSportOptions([]);
            } finally {
                setSportsLoading(false);
            }
        };

        fetchUser();
        fetchSports();
    }, []);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDobChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            dob: {
                ...prev.dob,
                [name]: value
            }
        }));
    };

    const toggleAgreed = () => {
        setFormData(prev => ({
            ...prev,
            agreed: !prev.agreed
        }));
    };

    const checkAvailability = async (email) => {
        try {
            const response = await fetch('https://server.riyadah.app/api/users/check', {
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
    const handleSubmit = async () => {
        const dobComplete = formData.dob.day && formData.dob.month && formData.dob.year;

        if (!formData.name || !formData.email) {
            setError("Please fill in all required fields");
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            return;
        } else {
            setError(null);
        }

        if (formData.email != null) {
            const checkResult = await checkAvailability(formData.email);

            if (!checkResult.success) {
                setError(checkResult.msg);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                setSaving(false);
                return;
            } else {
                setError(null);
            }
        }

        const dataToSubmit = {
            ...formData,
            club: userId,
        };

        try {
            setSaving(true);
            const token = await SecureStore.getItemAsync('userToken');

            const response = await fetch('https://server.riyadah.app/api/athletes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.errors?.map(e => `${e.path}: ${e.msg}`).join('\n') ||
                    data.message ||
                    'Failed to create athlete';
                throw new Error(errorMsg);
            }

            setShowConfirmation(true);
        } catch (error) {
            setError(error.message);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };



    const handleCopy = () => {
        const loginInfo = `Hello, ${formData.name}!\nUse this email to login to your Riyadah account.\n${formData.email}`;
        Clipboard.setStringAsync(loginInfo);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

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
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                {/* <View style={styles.pageHeader}>
                    <TouchableOpacity
                        onPress={() => {
                            router.replace('/manager/dashboard');
                        }}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>Back to dashboard</Text>
                    </TouchableOpacity>

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>New Athlete</Text>
                        <Text style={styles.pageDesc}>Add an athlete account</Text>
                    </View>

                    <Text style={styles.ghostText}>Athle</Text>
                </View> */}

                <View style={styles.pageHeader}>
                    <Image
                        source={require('../../assets/logo_white.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>New Athlete</Text>
                    </View>
                </View>

                <ScrollView ref={scrollViewRef}>
                    <View style={styles.contentContainer}>
                        {error != null && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {!showConfirmation && <View>
                            <Text style={styles.sectionTitle}>Basic Information</Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter athlete name"
                                    placeholderTextColor={"#888"}
                                    value={formData.name}
                                    onChangeText={(text) => handleChange('name', text)}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Email *</Text>
                                <TextInput
                                    style={[styles.input, { marginBottom: 5 }]}
                                    placeholder="Enter email address"
                                    keyboardType="email-address"
                                    placeholderTextColor={"#888"}
                                    autoCapitalize="none"
                                    value={formData.email}
                                    onChangeText={(text) => handleChange('email', text)}
                                />
                                <Text style={styles.uploadHint}>This will be used to login</Text>
                            </View>
                            <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Athlete Information</Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Phone</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                    placeholderTextColor={"#888"}
                                    value={formData.phone}
                                    onChangeText={(text) => handleChange('phone', text)}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Gender</Text>
                                <View style={styles.pickerContainer}>
                                    <RNPicker
                                        selectedValue={formData.gender}
                                        onValueChange={(value) => handleChange('gender', value)}
                                        style={styles.picker}
                                    >
                                        <RNPicker.Item label="Select gender" value="" />
                                        <RNPicker.Item label="Male" value="Male" />
                                        <RNPicker.Item label="Female" value="Female" />
                                    </RNPicker>
                                </View>
                            </View>

                            {/* <View style={styles.formGroup}>
                                <Text style={styles.label}>Date of Birth *</Text>
                                <View style={styles.dobRow}>
                                    <TextInput
                                        ref={dayRef}
                                        style={styles.dobInput}
                                        placeholder="DD"
                                        placeholderTextColor="#aaa"
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        value={formData.dob.day}
                                        onChangeText={(text) => {
                                            handleDobChange('day', text);
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
                                        value={formData.dob.month}
                                        onChangeText={(text) => {
                                            handleDobChange('month', text);
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
                                        value={formData.dob.year}
                                        onChangeText={(text) => handleDobChange('year', text)}
                                        ref={yearRef}
                                        returnKeyType="done"
                                    />
                                </View>
                            </View> */}

                            {/* <View style={styles.formGroup}>
                                <Text style={styles.label}>Country *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter country"
                                    placeholderTextColor={"#888"}
                                    value={formData.country}
                                    onChangeText={(text) => handleChange('country', text)}
                                />
                            </View> */}

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Sport</Text>
                                <View style={styles.pickerContainer}>
                                    <RNPicker
                                        selectedValue={formData.sport}
                                        onValueChange={(value) => handleChange('sport', value)}
                                        style={styles.picker}
                                    >
                                        <RNPicker.Item label="Select sport" value="" />
                                        {sportOptions.map((sport) => (
                                            <RNPicker.Item key={sport._id || sport.name} label={sport.name} value={sport.name} />
                                        ))}
                                    </RNPicker>
                                </View>
                                {sportsLoading && (
                                    <ActivityIndicator size="small" color="#FF4000" />
                                )}
                            </View>

                            {/* <View style={styles.formGroup}>
                                <Text style={styles.label}>Account Type</Text>
                                <TextInput
                                    style={[styles.input, { opacity: 0.6 }]}
                                    value={formData.type}
                                    editable={false}
                                />
                            </View> */}

                            {/* <TouchableOpacity onPress={toggleAgreed} style={styles.checkboxContainer} activeOpacity={1}>
                                <View style={styles.checkbox}>
                                    {formData.agreed && <View style={styles.checked} >
                                        <MaterialIcons name="check" size={12} color="#fff" />
                                    </View>}
                                </View>
                                <Text style={styles.label}>
                                    I agree to the Terms & Conditions
                                </Text>
                            </TouchableOpacity> */}

                            <View style={[styles.profileActions, styles.inlineActions]}>
                                <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                                    <Text style={styles.profileButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSubmit} disabled={saving} style={[styles.profileButton, styles.savebtn]}>
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
                        </View>}

                    {showConfirmation &&
                        <View>
                            <Text style={styles.confirmationTitle}>
                                Athlete account created successfully
                            </Text>

                            <Text style={styles.confirmationSubTitle}>
                                Email: {formData.email}
                            </Text>

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
                                {`You can screenshot these credentials or copy/paste them to your athlete in order to login to their account.\nYou will not be able to see these info again.`}
                            </Text>

                            <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.replace('/manager/createAthlete')}>
                                <View style={styles.createAccountButton}>
                                    <Text style={styles.createAccountText}>Add another athlete</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.replace('/manager/dashboard')}>
                                <View style={styles.loginButton}>
                                    <Text style={styles.loginText}>Go back to dashboard</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
            </View>
        </ScrollView>
            </View >
        </KeyboardAvoidingView >
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 200,
    },
    headerTextBlock: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: width - 40,
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
    ghostText: {
        color: '#ffffff',
        fontSize: 100,
        textTransform: 'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2
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
        fontFamily: 'Acumin',
    },
    formGroup: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontFamily: 'Qatar',
        fontSize: 22,
        color: '#111',
        marginBottom: 15,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    label: {
        fontFamily: 'Qatar',
        fontSize: 18,
        color: '#111',
        marginBottom: 8,
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 20,
        color: 'black',
        borderRadius: 10
    },
    pickerContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20,
    },
    picker: {
        width: '100%',
        fontFamily: 'Acumin',
        borderWidth: 0,
        backgroundColor: '#F4F4F4',
        color: 'black'
    },
    uploadHint: {
        fontFamily: 'Acumin',
        marginBottom: 10,
        color: '#111111'
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40
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
    dobRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 20
    },
    dobInput: {
        flex: 1,
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        paddingVertical: 10
    },
    dobSeperator: {
        fontSize: 30,
        fontFamily: 'Qatar',
        fontWeight: 'bold',
        color: '#FF4000',
        marginHorizontal: 10
    },
    confirmationTitle: {
        fontFamily: 'Qatar',
        fontSize: 20,
        marginBottom: 5,
        color: 'black'
    },
    confirmationSubTitle: {
        fontFamily: 'Acumin',
        fontSize: 16,
        color: 'black'
    },
    hint: {
        color: '#525252',
        fontSize: 12,
        fontFamily: 'Acumin'
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
    loginText: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'Qatar',
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
        fontFamily: 'Qatar',
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
        columnGap: 15,
    },
    saveLoaderContainer: {
        marginLeft: 10
    },
    profileButton: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10
    },
    profileButtonText: {
        textTransform: 'uppercase',
        fontSize: 16,
        color: '#150000',
        fontFamily: 'Qatar',
    },
    savebtn: {
        flexDirection: 'row'
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
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Qatar'
    },
    logo: {
        width: 120,
        height: 40,
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    backText: {
        color: '#fff',
        fontFamily: 'Acumin',
        fontSize: 14
    },
});

export default CreateAthleteScreen;
