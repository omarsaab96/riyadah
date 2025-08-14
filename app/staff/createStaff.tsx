import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker, Picker as RNPicker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

const CreateStaffScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const scrollViewRef = useRef();
    const [error, setError] = useState(null);
    const [image, setImage] = useState(null);
    const [teams, setTeams] = useState([]);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [countryCode, setCountryCode] = useState('LB');
    const [callingCode, setCallingCode] = useState('961');
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searching, setSearching] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [qualificationInput, setQualificationInput] = useState('');
    const [certificationInput, setCertificationInput] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showBasicInfo, setShowBasicInfo] = useState(false);
    const [showSearchSection, setShowSearchSection] = useState(true);
    const [showSearchRetrySection, setShowSearchRetrySection] = useState(true);
    const [showProfessionalInfo, setShowProfessionalInfo] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [searchindex, setSearchindex] = useState(0);
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Coach',
        club: '',
        qualifications: [],
        certifications: [],
        employmentType: 'Full-time',
        salary: '0 USD',
        teams: [],
        isActive: true,
    });

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const token = await SecureStore.getItemAsync('userToken');
                const response = await fetch('https://riyadah.onrender.com/api/teams', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    setTeams(data.data);
                } else {
                    Alert.alert('Error', 'Failed to load teams');
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
                Alert.alert('Error', 'Failed to load teams');
            } finally {
                setLoading(false);
            }
        };

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
                setLoading(false)
            } else {
                console.log("no token",)
            }
        };

        fetchUser();
        fetchTeams();
    }, []);

    useEffect(() => {
    }, [user]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (parent, name, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [name]: value
            }
        }));
    };

    const addQualification = () => {
        if (qualificationInput.trim()) {
            setFormData(prev => ({
                ...prev,
                qualifications: [...prev.qualifications, qualificationInput.trim()]
            }));
            setQualificationInput('');
        }
    };

    const removeQualification = (index) => {
        setFormData(prev => ({
            ...prev,
            qualifications: prev.qualifications.filter((_, i) => i !== index)
        }));
    };

    const addCertification = () => {
        if (certificationInput.trim()) {
            setFormData(prev => ({
                ...prev,
                certifications: [...prev.certifications, certificationInput.trim()]
            }));
            setCertificationInput('');
        }
    };

    const removeCertification = (index) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.role) {
            setError("Please fill in all required fields");
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            return;
        } else {
            setError(null)
        }

        if (selectedUser == null && formData.email != null) {
            const checkResult = await checkAvailability(formData.email);

            if (!checkResult.success) {
                setError(checkResult.msg);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                setSaving(false);
                return;
            } else {
                setError(null)
            }
        }

        const dataToSubmit = {
            ...formData,
            club: userId
        };


        try {
            setSaving(true);
            const token = await SecureStore.getItemAsync('userToken');

            const response = await fetch('https://riyadah.onrender.com/api/staff', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit)
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle validation errors from server
                const errorMsg = data.errors?.map(e => `${e.path}: ${e.msg}`).join('\n') ||
                    data.message ||
                    'Failed to create staff';
                throw new Error(errorMsg);
            }

            if (selectedUser == null) {
                setShowBasicInfo(false)
                setShowProfessionalInfo(false)
                setShowSearchSection(false)
                setShowSearchRetrySection(false)
                setShowConfirmation(true)
            } else {
                router.replace({
                    pathname: '/profile',
                    params: { tab: 'Staff' }
                })
            }

        } catch (error) {
            // console.error('Error creating staff:', error);
            setError(error.message);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleSearchInput = (text: string) => {
        setKeyword(text);
        if (text.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        // Clear previous timeout
        if (debounceTimeout) clearTimeout(debounceTimeout);

        // Set new debounce timeout
        const timeout = setTimeout(() => {
            if (text.trim().length >= 3) {
                searchUsers(text);
            } else {
                setSearchResults([]);
            }
        }, 500); // delay: 500ms

        setDebounceTimeout(timeout);
    };

    const searchUsers = async (text: string) => {
        setSearchindex(1)

        try {
            setSearching(true);
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch(`https://riyadah.onrender.com/api/users/search?keyword=${text}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            } else {
                Alert.alert('Error', 'Failed to search users');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            Alert.alert('Error', 'Failed to search users');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleUserSelect = (user: any) => {
        if (user == null) {
            setShowBasicInfo(true)
            setSelectedUser(user);
            setSearchResults([]);
            setKeyword('');

            setFormData(prev => ({
                ...prev,
                name: '',
                email: '',
                userRef: null
            }));

            setImage(null);
            setShowBasicInfo(true)
            setShowProfessionalInfo(true)
            setShowSearchSection(false)
            return;
        }

        setSelectedUser(user);
        setSearchResults([]);
        setKeyword('');
        setShowProfessionalInfo(true)
        setShowSearchSection(false)

        // Populate form fields with user data
        setFormData(prev => ({
            ...prev,
            name: user.name,
            email: user.email,
            userRef: user._id
        }));

        console.log("image=", user.image)

        setImage(user.image)
    };

    const handleClearSelection = () => {
        setSelectedUser(null);
        setShowBasicInfo(false)
        setShowProfessionalInfo(false)
        setShowSearchSection(true)
        setSearchindex(0)
        setError(null);
        setFormData(prev => ({
            ...prev,
            name: '',
            email: '',
        }));
        setImage(null);
    };

    const checkAvailability = async (email: string) => {
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
                            router.replace({
                                pathname: '/profile',
                                params: { tab: 'Staff' }
                            })
                        }}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>Back to staff</Text>
                    </TouchableOpacity>

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>New Staff</Text>
                        <Text style={styles.pageDesc}>Add a staff member for your club</Text>
                    </View>

                    <Text style={styles.ghostText}>Staff</Text>
                </View>

                <ScrollView ref={scrollViewRef}>
                    <View style={styles.contentContainer}>
                        {error != null && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {/* User Search Section */}
                        {showSearchSection && <View style={styles.formGroup}>
                            <Text style={styles.label}>Check for Existing Account</Text>

                            {!selectedUser && <View style={styles.searchContainer}>
                                <View style={{
                                    marginBottom: 16,
                                    flexDirection: 'row'
                                }}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                        placeholder="Search by name or email (min. 3 characters)"
                                        placeholderTextColor="#A8A8A8"
                                        value={keyword}
                                        onChangeText={handleSearchInput}
                                    />
                                    {searching &&
                                        <ActivityIndicator
                                            size="small"
                                            color="#FF4000"
                                            style={styles.searchLoader}
                                        />
                                    }
                                </View>
                            </View>}

                            {!searching && !selectedUser && searchResults.length > 0 && (
                                <View>

                                    <View style={styles.resultsContainer}>
                                        {searchResults.map((item) => (
                                            <TouchableOpacity
                                                key={item._id}
                                                style={styles.userItem}
                                                onPress={() => handleUserSelect(item)}
                                            >
                                                <Image
                                                    source={
                                                        item.image
                                                            ? { uri: item.image }
                                                            : require('../../assets/avatar.png')
                                                    }
                                                    style={[styles.userAvatar]}
                                                    resizeMode="contain"
                                                />
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <View>
                                                        <Text style={styles.userName}>{item.name}</Text>
                                                        <Text style={styles.userEmail}>{item.email}</Text>
                                                    </View>
                                                    <View>
                                                        <Text style={{ color: '#FF4000' }}>Add as staff</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={{ fontFamily: 'Manrope', marginTop: 10, fontWeight: 'bold', color: 'black' }}>
                                        Can't find the account you are looking for?
                                    </Text>

                                    <Text style={{ fontFamily: 'Manrope', marginBottom: 10, color: 'black' }}>
                                        Don't worry you can still create a new staff by clicking on the button below.
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.addStaffAccountBtn}
                                        onPress={() => handleUserSelect(null)}
                                    >
                                        <Text style={styles.addStaffAccountBtnText}>Add new staff without account</Text>
                                    </TouchableOpacity>

                                </View>
                            )}

                            {!searching && !selectedUser && searchResults.length == 0 && searchindex > 0 && keyword.trim().length >= 3 && (
                                <View style={[styles.resultsContainer, { borderWidth: 0 }]}>
                                    <Text style={{ fontFamily: 'Manrope', fontWeight: 'bold', color: 'black' }}>
                                        No results.
                                    </Text>

                                    <Text style={{ fontFamily: 'Manrope', marginBottom: 10, color: 'black' }}>
                                        Looks like the staff you are looking for does not have an account on Riyadah.
                                    </Text>

                                    <Text style={{ fontFamily: 'Manrope', marginBottom: 10, color: 'black' }}>
                                        Don't worry you can still create a new staff by clicking on the button below.
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.addStaffAccountBtn}
                                        onPress={() => handleUserSelect(null)}
                                    >
                                        <Text style={styles.addStaffAccountBtnText}>Add new staff without account</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>}

                        {selectedUser != null && !showSearchSection && !showConfirmation && (
                            <View>
                                <View>
                                    <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Selected user</Text>
                                </View>
                                <View style={styles.selectedUserContainer}>
                                    <Image
                                        source={
                                            selectedUser.image != null
                                                ? { uri: selectedUser.image }
                                                : require('../../assets/avatar.png')
                                        }
                                        style={styles.userAvatar}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.selectedUserInfo}>
                                        <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
                                        <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.clearSelectionButton}
                                        onPress={handleClearSelection}
                                    >
                                        <MaterialIcons name="close" size={20} color="#FF4000" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {selectedUser == null && !showSearchSection && showSearchRetrySection && (

                            <TouchableOpacity
                                style={[styles.clearSelectionButton, { marginLeft: 0 }]}
                                onPress={handleClearSelection}
                            >
                                <View style={styles.selectedUserContainer}>
                                    <View style={styles.selectedUserInfo}>
                                        <Text style={styles.selectedUserName}>Tap here to retry search</Text>
                                        <Text style={styles.selectedUserEmail}>Search for an existing account and skip basic information</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                        )}

                        {/* Basic Information */}
                        {showBasicInfo && <View>
                            <Text style={styles.sectionTitle}>Basic Information</Text>

                            {/* <View style={styles.formGroup}>
                                <Text style={styles.label}>Image</Text>

                                {!uploading && (
                                    <TouchableOpacity style={styles.uploadBox} onPress={handleImagePick}>
                                        {image != null ? (
                                            <View>
                                                <Image
                                                    source={{ uri: `data:image/png;base64,${image}` }}
                                                    style={[styles.avatarPreview,]}
                                                />
                                                <Text style={styles.uploadHint}>Tap to change image</Text>
                                            </View>
                                        ) : (
                                            <>
                                                <View style={styles.emptyImage}>
                                                    <MaterialIcons name="add" size={40} color="#FF4000" />
                                                </View>
                                                <Text style={styles.uploadHint}>Tap to upload new image</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View> */}

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter staff name"
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

                        </View>}

                        {/* Professional Information */}
                        {showProfessionalInfo && <View>
                            <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Professional Information</Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Role *</Text>
                                <View style={styles.pickerContainer}>
                                    <RNPicker
                                        selectedValue={formData.role}
                                        onValueChange={(value) => handleChange('role', value)}
                                        style={styles.picker}
                                    >
                                        <RNPicker.Item label="Coach" value="Coach" />
                                        {/* <RNPicker.Item label="Assistant Coach" value="Assistant Coach" /> */}
                                        <RNPicker.Item label="Manager" value="Manager" />
                                        {/* <RNPicker.Item label="Admin" value="Admin" /> */}
                                        <RNPicker.Item label="Board Member" value="Board Member" />
                                        <RNPicker.Item label="Medical Staff" value="Medical Staff" />
                                        {/* <RNPicker.Item label="Other" value="Other" /> */}
                                    </RNPicker>
                                </View>
                            </View>

                            {/* Team Assignments */}
                            {formData.role == "Coach" && <View>
                                <View style={[styles.formGroup, { marginBottom: 20 }]}>
                                    <Text style={styles.label}>Assigned Teams</Text>
                                    {teams.length > 0 ? (
                                        teams.map(team => (
                                            <TouchableOpacity
                                                key={team._id}
                                                style={styles.teamItem}
                                                onPress={() => {
                                                    const isSelected = formData.teams.includes(team._id);
                                                    if (isSelected) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            teams: prev.teams.filter(id => id !== team._id)
                                                        }));
                                                    } else {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            teams: [...prev.teams, team._id]
                                                        }));
                                                    }
                                                }}
                                            >
                                                <View style={styles.checkbox}>
                                                    {formData.teams.includes(team._id) && <View style={styles.checked} >
                                                        <Image source={require('../../assets/check.png')} style={styles.checkImage} />
                                                    </View>
                                                    }
                                                </View>
                                                <Text style={styles.teamName}>{team.name} ({team.sport})</Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <Text style={styles.noTeamsText}>No teams available</Text>
                                    )}
                                </View>
                            </View>}

                            {/* <View style={styles.formGroup}>
                            <Text style={styles.label}>Specialization</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="E.g. Goalkeeping, Fitness, etc."
                                value={formData.specialization}
                                onChangeText={(text) => handleChange('specialization', text)}
                            />
                        </View> */}

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Employment Type</Text>
                                <View style={styles.pickerContainer}>
                                    <RNPicker
                                        selectedValue={formData.employmentType}
                                        onValueChange={(value) => handleChange('employmentType', value)}
                                        style={styles.picker}
                                    >
                                        <RNPicker.Item label="Full-time" value="Full-time" />
                                        <RNPicker.Item label="Part-time" value="Part-time" />
                                        <RNPicker.Item label="Contract" value="Contract" />
                                        <RNPicker.Item label="Volunteer" value="Volunteer" />
                                    </RNPicker>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Salary (per month)</Text>
                                <View style={{ flexDirection: 'row', columnGap: 10 }}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Salary amount"
                                        keyboardType="numeric"
                                        value={formData.salary?.split(' ')[0] || '0'}
                                        onChangeText={(text) => {
                                            const amount = text.trim();
                                            const currency = formData.salary?.split(' ')[1] || 'USD';
                                            handleChange('salary', `${amount} ${currency}`);
                                        }}
                                    />
                                    <View style={[styles.pickerContainer, { flex: 1 }]}>
                                        <Picker
                                            style={styles.picker}
                                            selectedValue={formData.salary?.split(' ')[1] || 'USD'}
                                            onValueChange={(currency) => {
                                                const amount = formData.salary?.split(' ')[0] || '0';
                                                handleChange('salary', `${amount} ${currency}`);
                                            }}
                                        >
                                            <Picker.Item label="USD" value="USD" />
                                            <Picker.Item label="LBP" value="LBP" />
                                            <Picker.Item label="EUR" value="EUR" />
                                        </Picker>
                                    </View>
                                </View>
                            </View>

                            {/* <View style={styles.formGroup}>
                            <Text style={styles.label}>Bio</Text>
                            <TextInput
                                style={styles.textarea}
                                placeholder="About this staff member"
                                placeholderTextColor="#A8A8A8"
                                value={formData.bio}
                                onChangeText={(text) => handleChange('bio', text)}
                                multiline={true}
                                blurOnSubmit={false}
                                returnKeyType="default"
                            />
                        </View> */}

                            {/* Qualifications */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Qualifications</Text>
                                <View style={styles.listInputContainer}>
                                    <TextInput
                                        style={[styles.input, { marginBottom: 0, flex: 1 }]}
                                        placeholder="Add qualification"
                                        placeholderTextColor={"#888"}
                                        value={qualificationInput}
                                        onChangeText={setQualificationInput}
                                        onSubmitEditing={addQualification}
                                    />
                                    <TouchableOpacity
                                        style={styles.addItemButton}
                                        onPress={addQualification}
                                    >
                                        <Text style={styles.addItemButtonText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.itemsList}>
                                    {formData.qualifications.map((item, index) => (
                                        <View key={index} style={styles.item}>
                                            <Text style={styles.itemText}>{item}</Text>
                                            <TouchableOpacity onPress={() => removeQualification(index)}>
                                                <MaterialIcons name="close" size={18} color="#FF4000" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Certifications */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Certifications</Text>
                                <View style={styles.listInputContainer}>
                                    <TextInput
                                        style={[styles.input, { marginBottom: 0, flex: 1 }]}
                                        placeholder="Add certification"
                                        placeholderTextColor={"#888"}
                                        value={certificationInput}
                                        onChangeText={setCertificationInput}
                                        onSubmitEditing={addCertification}
                                    />
                                    <TouchableOpacity
                                        style={styles.addItemButton}
                                        onPress={addCertification}
                                    >
                                        <Text style={styles.addItemButtonText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.itemsList}>
                                    {formData.certifications.map((item, index) => (
                                        <View key={index} style={styles.item}>
                                            <Text style={styles.itemText}>{item}</Text>
                                            <TouchableOpacity onPress={() => removeCertification(index)}>
                                                <MaterialIcons name="close" size={18} color="#FF4000" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>


                            {/* Emergency Contact */}
                            {/* <Text style={styles.sectionTitle}>Emergency Contact</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter emergency contact name"
                                value={formData.emergencyContact.name}
                                onChangeText={(text) => handleNestedChange('emergencyContact', 'name', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Relationship</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="E.g. Spouse, Parent, etc."
                                value={formData.emergencyContact.relationship}
                                onChangeText={(text) => handleNestedChange('emergencyContact', 'relationship', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter emergency phone number"
                                keyboardType="phone-pad"
                                value={formData.emergencyContact.phone}
                                onChangeText={(text) => handleNestedChange('emergencyContact', 'phone', text)}
                            />
                        </View> */}

                            {/* Address */}
                            {/* <Text style={styles.sectionTitle}>Address</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Street Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter street address"
                                value={formData.address.street}
                                onChangeText={(text) => handleNestedChange('address', 'street', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter city"
                                value={formData.address.city}
                                onChangeText={(text) => handleNestedChange('address', 'city', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>State/Province</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter state or province"
                                value={formData.address.state}
                                onChangeText={(text) => handleNestedChange('address', 'state', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Postal Code</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter postal code"
                                value={formData.address.postalCode}
                                onChangeText={(text) => handleNestedChange('address', 'postalCode', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Country</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter country"
                                value={formData.address.country}
                                onChangeText={(text) => handleNestedChange('address', 'country', text)}
                            />
                        </View> */}

                            {/* Status */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Status</Text>
                                <View style={styles.statusContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            formData.isActive && styles.activeStatusButton
                                        ]}
                                        onPress={() => handleChange('isActive', true)}
                                    >
                                        <Text style={[
                                            styles.statusButtonText,
                                            formData.isActive && styles.activeStatusButtonText
                                        ]}>
                                            Active
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            !formData.isActive && styles.inactiveStatusButton
                                        ]}
                                        onPress={() => handleChange('isActive', false)}
                                    >
                                        <Text style={[
                                            styles.statusButtonText,
                                            !formData.isActive && styles.inactiveStatusButtonText
                                        ]}>
                                            Inactive
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[styles.profileActions, styles.inlineActions]}>
                                <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                                    <Text style={styles.profileButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSubmit} style={[styles.profileButton, styles.savebtn]}>
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
                                    Staff account created successfully
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
                                    {`You can screenshot these credentials or copy/paste them to your staff in order to login to their account.\nYou will not be able to see these info again.`}
                                </Text>

                                <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.replace('/staff/createStaff')}>
                                    <Image source={require('../../assets/buttonBeforeLight.png')} style={styles.sideRect} />
                                    <View style={styles.createAccountButton}>
                                        <Text style={styles.createAccountText}>Add another staff</Text>
                                    </View>
                                    <Image source={require('../../assets/buttonAfterLight.png')} style={styles.sideRectAfter} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.fullButtonRow} onPress={() => router.replace({
                                    pathname: '/profile',
                                    params: { tab: 'Staff' }
                                })}>
                                    <Image source={require('../../assets/buttonBefore_black.png')} style={styles.sideRect} />
                                    <View style={styles.loginButton}>
                                        <Text style={styles.loginText}>Go back to staff list</Text>
                                    </View>
                                    <Image source={require('../../assets/buttonAfter_black.png')} style={styles.sideRectAfter} />
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
        height: 270,
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
    ghostText: {
        color: '#ffffff',
        fontSize: 128,
        fontFamily: 'Bebas',
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
        fontFamily: 'Manrope',
    },
    formGroup: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontFamily: 'Bebas',
        fontSize: 22,
        color: '#111',
        marginBottom: 15,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    searchLoader: {
        position: 'absolute',
        top: 15,
        right: 10,
    },
    label: {
        fontFamily: 'Bebas',
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
        fontFamily: 'Manrope',
        borderWidth: 0,
        backgroundColor: '#F4F4F4',
        color: 'black'
    },
    dateInput: {
        backgroundColor: '#F4F4F4',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    imagePicker: {
        alignItems: 'center',
        marginBottom: 15,
    },
    listInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    addItemButton: {
        backgroundColor: '#FF4000',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginLeft: 10,
    },
    addItemButtonText: {
        color: '#fff',
        fontFamily: 'Manrope',
        fontWeight: 'bold',
    },
    itemsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    itemText: {
        marginRight: 8,
        fontFamily: 'Manrope',
        color:'black'
    },
    teamItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        color: 'black'
    },
    teamCheckbox: {
        marginRight: 10,
    },
    teamName: {
        fontFamily: 'Manrope',
        fontSize: 16,
        color: 'black'
    },
    noTeamsText: {
        fontFamily: 'Manrope',
        color: '#666',
        fontStyle: 'italic',
    },
    statusContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    statusButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
    },
    activeStatusButton: {
        backgroundColor: '#FF4000',
    },
    inactiveStatusButton: {
        backgroundColor: '#111',
    },
    statusButtonText: {
        fontFamily: 'Manrope',
        fontWeight: 'bold',
        color: 'black'
    },
    activeStatusButtonText: {
        color: '#fff',
    },
    inactiveStatusButtonText: {
        color: '#fff',
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    disabledActions: {
        opacity: 0.6,
    },
    cancelButton: {
        flex: 1,
        padding: 15,
        backgroundColor: '#eee',
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 10,
    },
    cancelButtonText: {
        fontFamily: 'Bebas',
        fontSize: 18,
        color: '#111',
    },
    submitButton: {
        flex: 2,
        padding: 15,
        backgroundColor: '#FF4000',
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        fontFamily: 'Bebas',
        fontSize: 18,
        color: '#fff',
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
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    savebtn: {
        flexDirection: 'row'
    },
    addStaffAccountBtn: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10,
        alignSelf: 'flex-start'
    },
    addStaffAccountBtnText: {
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
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
    checkImage: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },
    uploadBox: {
        marginBottom: 10,
        // flexDirection:'row'
    },
    avatarPreview: {
        height: 120,
        width: 120,
        borderRadius: 20,
        marginBottom: 5
    },
    uploadHint: {
        fontFamily: 'Manrope',
        marginBottom: 10,
        color: '#111111'
    },
    emptyImage: {
        height: 120,
        width: 120,
        borderRadius: 20,
        marginRight: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        marginBottom: 5
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingContainer: {
        padding: 10,
        alignItems: 'center',
    },
    resultsContainer: {

    },
    userItem: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 5,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    userName: {
        fontFamily: 'Manrope',
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black'
    },
    userEmail: {
        fontFamily: 'Manrope',
        color: '#666',
        fontSize: 14,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },
    selectedUserContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    selectedUserInfo: {
        flex: 1,
    },
    selectedUserName: {
        fontFamily: 'Manrope',
        fontWeight: 'bold',
        fontSize: 16,
        color: 'black'
    },
    selectedUserEmail: {
        fontFamily: 'Manrope',
        color: '#666',
        fontSize: 14,
    },
    clearSelectionButton: {
        marginLeft: 10,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: "#FF4000"
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
    hint: {
        color: '#525252',
        fontSize: 12,
        fontFamily: 'Manrope'
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
    }, backBtn: {
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

export default CreateStaffScreen;