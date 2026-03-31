import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker as RNPicker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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
import { useLanguage } from '../../context/language';

const { width } = Dimensions.get('window');

const CreateAthleteScreen = () => {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
    const [saving, setSaving] = useState(false);
    const scrollViewRef = useRef(null);
    const [error, setError] = useState(null);
    const [sportOptions, setSportOptions] = useState([]);
    const [sportsLoading, setSportsLoading] = useState(false);
    const [clubKeyword, setClubKeyword] = useState('');
    const [clubResults, setClubResults] = useState([]);
    const [clubSearching, setClubSearching] = useState(false);
    const [clubDebounceTimeout, setClubDebounceTimeout] = useState(null);
    const [selectedClub, setSelectedClub] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        sport: '',
    });

    useEffect(() => {
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

        fetchSports();
    }, []);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClubSearchInput = (text) => {
        setClubKeyword(text);
        if (selectedClub && text.trim() !== selectedClub.name) {
            setSelectedClub(null);
        }
        if (text.trim().length < 3) {
            setClubResults([]);
            return;
        }

        if (clubDebounceTimeout) clearTimeout(clubDebounceTimeout);

        const timeout = setTimeout(() => {
            if (text.trim().length >= 3) {
                searchClubs(text);
            } else {
                setClubResults([]);
            }
        }, 500);

        setClubDebounceTimeout(timeout);
    };

    const searchClubs = async (text) => {
        try {
            setClubSearching(true);
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch(`https://server.riyadah.app/api/users/search?keyword=${encodeURIComponent(text)}&type=Club`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                setClubResults(Array.isArray(data) ? data : []);
            } else {
                setClubResults([]);
            }
        } catch (error) {
            console.error('Error searching clubs:', error);
            setClubResults([]);
        } finally {
            setClubSearching(false);
        }
    };

    const handleClubSelect = (club) => {
        setSelectedClub(club);
        setClubResults([]);
        setClubKeyword(club.name);
        setClubKeyword('');
    };

    const handleClearClub = () => {
        setSelectedClub(null);
        setClubKeyword('');
        setClubResults([]);
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
        if (!formData.name || !formData.email) {
            setError(t('managerAthlete.requiredFields'));
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
            sport: formData.sport ? [formData.sport] : [],
            type: 'Athlete',
            personalAccount: false,
            accountBadge: false,
            verified: {
                email: null,
                phone: null
            },
            isStaff: [],
            clubs: selectedClub?._id ? [selectedClub._id] : [],
            password:null
        };

        try {
            setSaving(true);
            const token = await SecureStore.getItemAsync('userToken');

            const response = await fetch('https://server.riyadah.app/api/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit)
            });

            console.log(response)

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.errors?.map(e => `${e.path}: ${e.msg}`).join('\n') ||
                    data.message ||
                    t('managerAthlete.failedCreate');
                throw new Error(errorMsg);
            }

            setFormData(prev => ({
                ...prev,
            }));
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
        const loginInfo = `Hello, ${formData.name}!\nUse these credentials to login to your Riyadah account.\nEmail: ${formData.email}\nPassword: You can set a new password while you login`;
        Clipboard.setStringAsync(loginInfo);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `Hello, ${formData.name}!\nUse these credentials to login to your Riyadah account.\nEmail: ${formData.email}\nPassword: You can set a new password while you login`,
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
                        <Text style={styles.backText}>{t('managerAthlete.back')}</Text>
                    </TouchableOpacity>

                    <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                        <Text style={styles.pageTitle}>{t('managerAthlete.newAthlete')}</Text>
                    </View>
                </View>

                <ScrollView ref={scrollViewRef}>
                    <View style={styles.contentContainer}>
                        {error != null && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {!showConfirmation && <View>
                            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('managerAthlete.basicInfo')}</Text>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, isRTL && styles.rtlText]}>{t('managerAthlete.name')} *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('managerAthlete.enterAthleteName')}
                                    placeholderTextColor={"#888"}
                                    value={formData.name}
                                    onChangeText={(text) => handleChange('name', text)}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, isRTL && styles.rtlText]}>{t('managerAthlete.email')} *</Text>
                                <TextInput
                                    style={[styles.input, { marginBottom: 5 }]}
                                    placeholder={t('managerAthlete.enterEmail')}
                                    keyboardType="email-address"
                                    placeholderTextColor={"#888"}
                                    autoCapitalize="none"
                                    value={formData.email}
                                    onChangeText={(text) => handleChange('email', text)}
                                />
                                <Text style={[styles.uploadHint, isRTL && styles.rtlText]}>{t('managerAthlete.loginHint')}</Text>
                            </View>
                            <Text style={[styles.sectionTitle, { marginTop: 30 }, isRTL && styles.rtlText]}>{t('managerAthlete.athleteInfo')}</Text>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, isRTL && styles.rtlText]}>{t('managerAthlete.phone')}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('managerAthlete.enterPhone')}
                                    keyboardType="phone-pad"
                                    placeholderTextColor={"#888"}
                                    value={formData.phone}
                                    onChangeText={(text) => handleChange('phone', text)}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, isRTL && styles.rtlText]}>{t('managerAthlete.gender')}</Text>
                                <View style={styles.pickerContainer}>
                                    <RNPicker
                                        selectedValue={formData.gender}
                                        onValueChange={(value) => handleChange('gender', value)}
                                        style={styles.picker}
                                    >
                                        <RNPicker.Item label={t('managerAthlete.selectGender')} value="" />
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
                                <Text style={[styles.label, isRTL && styles.rtlText]}>{t('managerAthlete.sport')}</Text>
                                <View style={styles.pickerContainer}>
                                    <RNPicker
                                        selectedValue={formData.sport}
                                        onValueChange={(value) => handleChange('sport', value)}
                                        style={styles.picker}
                                    >
                                        <RNPicker.Item label={t('managerAthlete.selectSport')} value="" />
                                        {sportOptions.map((sport) => (
                                            <RNPicker.Item key={sport._id || sport.name} label={sport.name} value={sport.name} />
                                        ))}
                                    </RNPicker>
                                </View>
                                {sportsLoading && (
                                    <ActivityIndicator size="small" color="#FF4000" />
                                )}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, isRTL && styles.rtlText]}>{t('managerAthlete.club')}</Text>
                                <View style={styles.searchContainer}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                        placeholder={t('managerAthlete.searchClub')}
                                        placeholderTextColor="#888"
                                        value={clubKeyword}
                                        onChangeText={handleClubSearchInput}
                                    />
                                    {clubSearching && (
                                        <ActivityIndicator size="small" color="#FF4000" style={styles.searchLoader} />
                                    )}
                                </View>

                                {selectedClub && (
                                    <TouchableOpacity style={styles.selectedClub} onPress={handleClearClub}>
                                        <View style={styles.clubRow}>
                                            <Image
                                                source={selectedClub.image ? { uri: selectedClub.image } : require('../../assets/club.png')}
                                                style={styles.clubAvatar}
                                            />
                                            <Text style={styles.selectedClubText}>{selectedClub.name}</Text>
                                        </View>
                                        <Text style={styles.clearClubText}>{t('managerAthlete.remove')}</Text>
                                    </TouchableOpacity>
                                )}

                                {!selectedClub && clubResults.length > 0 && (
                                    <View style={styles.resultsContainer}>
                                        {clubResults.map((club) => (
                                            <TouchableOpacity
                                                key={club._id}
                                                style={styles.clubItem}
                                                onPress={() => handleClubSelect(club)}
                                            >
                                                <View style={styles.clubRow}>
                                                    <Image
                                                        source={club.image ? { uri: club.image } : require('../../assets/club.png')}
                                                        style={styles.clubAvatar}
                                                    />
                                                    <View>
                                                        <Text style={styles.clubName}>{club.name}</Text>
                                                        {club.email && <Text style={styles.clubEmail}>{club.email}</Text>}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
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
                                    <Text style={styles.profileButtonText}>{t('managerAthlete.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSubmit} disabled={saving} style={[styles.profileButton, styles.savebtn]}>
                                    <Text style={styles.profileButtonText}>{saving ? t('managerAthlete.saving') : t('managerAthlete.save')}</Text>
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
                                {t('managerAthlete.created')}
                            </Text>

                            <Text style={styles.confirmationSubTitle}>
                                {t('managerAthlete.emailLabel', { email: formData.email })}
                            </Text>
                            {/* <Text style={styles.confirmationSubTitle}>
                                Password: {formData.password}
                            </Text> */}

                            <View style={[styles.profileActions, styles.inlineActions]}>
                                <TouchableOpacity onPress={handleCopy} style={styles.profileButton}>
                                    {copied ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                            <Feather name="check" size={16} color="black" />
                                            <Text style={styles.profileButtonText}>{t('managerAthlete.copied')}</Text>
                                        </View>
                                    ) : (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                            <Feather name="copy" size={16} color="black" />
                                            <Text style={styles.profileButtonText}>{t('managerAthlete.copy')}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleShare} style={[styles.profileButton, styles.savebtn]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Feather name="share-2" size={16} color="black" />
                                        <Text style={styles.profileButtonText}>{t('managerAthlete.share')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.hint, { marginTop: 30, marginBottom: 50 }]}>
                                {t('managerAthlete.credentialsHint')}
                            </Text>

                            <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.replace('/manager/createAthlete')}>
                                <View style={styles.createAccountButton}>
                                    <Text style={styles.createAccountText}>{t('managerAthlete.addAnother')}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.replace('/manager/dashboard')}>
                                <View style={styles.loginButton}>
                                    <Text style={styles.loginText}>{t('managerAthlete.backToDashboard')}</Text>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchLoader: {
        position: 'absolute',
        right: 10,
    },
    resultsContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        padding: 5
    },
    clubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    clubAvatar: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#f0f0f0'
    },
    clubItem: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1'
    },
    clubName: {
        fontFamily: 'Qatar',
        fontSize: 16,
        color: '#111'
    },
    clubEmail: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#666'
    },
    selectedClub: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f4f4f4',
        padding: 10,
        borderRadius: 8
    },
    selectedClubText: {
        fontFamily: 'Qatar',
        fontSize: 16,
        color: '#111'
    },
    clearClubText: {
        fontFamily: 'Acumin',
        fontSize: 12,
        color: '#FF4000'
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
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
});

export default CreateAthleteScreen;
