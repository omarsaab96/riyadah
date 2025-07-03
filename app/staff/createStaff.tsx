import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker as RNPicker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
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
    const [error, setError] = useState('');
    const [image, setImage] = useState(null);
    const [teams, setTeams] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Coach',
        specialization: '',
        bio: '',
        qualifications: [],
        certifications: [],
        employmentType: 'Full-time',
        salary: '',
        emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
        },
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
        },
        teams: [],
        isActive: true
    });

    const [qualificationInput, setQualificationInput] = useState('');
    const [certificationInput, setCertificationInput] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dob, setDob] = useState(new Date());

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

        fetchTeams();
    }, []);

    const handleImagePick = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

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

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDob(selectedDate);
            const day = selectedDate.getDate();
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            setFormData(prev => ({
                ...prev,
                dob: { day, month, year }
            }));
        }
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
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);
            const token = await SecureStore.getItemAsync('userToken');

            // Prepare form data for submission
            const staffData = new FormData();

            // Append all form fields
            Object.keys(formData).forEach(key => {
                if (key === 'teams') {
                    staffData.append(key, JSON.stringify(formData[key]));
                } else if (typeof formData[key] === 'object' && formData[key] !== null) {
                    staffData.append(key, JSON.stringify(formData[key]));
                } else {
                    staffData.append(key, formData[key]);
                }
            });

            // Append image if selected
            if (image) {
                const localUri = image;
                const filename = localUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                staffData.append('image', { uri: localUri, name: filename, type });
            }

            const response = await fetch('https://riyadah.onrender.com/api/staff', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                body: staffData
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Staff member created successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error(data.message || 'Failed to create staff member');
            }
        } catch (error) {
            console.error('Error creating staff:', error);
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.pageHeader}>
                    <Image
                        source={require('../../assets/logo_white.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>New Staff</Text>
                        <Text style={styles.pageDesc}>Add a staff member for your club</Text>
                    </View>

                    <Text style={styles.ghostText}>Staff</Text>
                </View>

                <ScrollView>
                    {error && (
                        <View style={styles.error}>
                            <MaterialIcons name="error-outline" size={20} color="#FF4000" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <View style={styles.contentContainer}>
                        {/* Profile Image */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Profile Image</Text>
                            <TouchableOpacity
                                style={styles.imagePicker}
                                onPress={handleImagePick}
                            >
                                {image ? (
                                    <Image
                                        source={{ uri: image }}
                                        style={styles.selectedImage}
                                    />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <MaterialIcons name="add-a-photo" size={32} color="#FF4000" />
                                        <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Basic Information */}
                        <Text style={styles.sectionTitle}>Basic Information</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter full name"
                                value={formData.name}
                                onChangeText={(text) => handleChange('name', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(text) => handleChange('email', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(text) => handleChange('phone', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text>
                                    {dob ? dob.toLocaleDateString() : 'Select date of birth'}
                                </Text>
                                <MaterialIcons name="date-range" size={20} color="#666" />
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={dob || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>

                        {/* Professional Information */}
                        <Text style={styles.sectionTitle}>Professional Information</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Role *</Text>
                            <View style={styles.pickerContainer}>
                                <RNPicker
                                    selectedValue={formData.role}
                                    onValueChange={(value) => handleChange('role', value)}
                                    style={styles.picker}
                                >
                                    <RNPicker.Item label="Coach" value="Coach" />
                                    <RNPicker.Item label="Assistant Coach" value="Assistant Coach" />
                                    <RNPicker.Item label="Manager" value="Manager" />
                                    <RNPicker.Item label="Admin" value="Admin" />
                                    <RNPicker.Item label="Board Member" value="Board Member" />
                                    <RNPicker.Item label="Medical Staff" value="Medical Staff" />
                                    <RNPicker.Item label="Other" value="Other" />
                                </RNPicker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Specialization</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="E.g. Goalkeeping, Fitness, etc."
                                value={formData.specialization}
                                onChangeText={(text) => handleChange('specialization', text)}
                            />
                        </View>

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
                            <TextInput
                                style={styles.input}
                                placeholder="Enter salary amount"
                                keyboardType="numeric"
                                value={formData.salary}
                                onChangeText={(text) => handleChange('salary', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Bio</Text>
                            <TextInput
                                style={[styles.input, { height: 100 }]}
                                placeholder="Tell us about this staff member"
                                multiline
                                value={formData.bio}
                                onChangeText={(text) => handleChange('bio', text)}
                            />
                        </View>

                        {/* Qualifications */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Qualifications</Text>
                            <View style={styles.listInputContainer}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Add qualification"
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
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Add certification"
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

                        {/* Team Assignments */}
                        <Text style={styles.sectionTitle}>Team Assignments</Text>
                        <View style={styles.formGroup}>
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
                                        <View style={styles.teamCheckbox}>
                                            {formData.teams.includes(team._id) ? (
                                                <MaterialIcons name="check-box" size={24} color="#FF4000" />
                                            ) : (
                                                <MaterialIcons name="check-box-outline-blank" size={24} color="#666" />
                                            )}
                                        </View>
                                        <Text style={styles.teamName}>{team.name} ({team.sport})</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.noTeamsText}>No teams available</Text>
                            )}
                        </View>

                        {/* Emergency Contact */}
                        <Text style={styles.sectionTitle}>Emergency Contact</Text>

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
                        </View>

                        {/* Address */}
                        <Text style={styles.sectionTitle}>Address</Text>

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
                        </View>

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
                                <Text style={styles.profileButtonText}>Save</Text>
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
            </View>
        </KeyboardAvoidingView>
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
        width: 150,
        position: 'absolute',
        top: 40,
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
        paddingBottom: 100
    },
    error: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 64, 0, 0.1)',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    errorText: {
        color: '#FF4000',
        fontFamily: 'Manrope',
        marginLeft: 5,
    },
    formGroup: {
        marginBottom: 20,
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
    label: {
        fontFamily: 'Bebas',
        fontSize: 18,
        color: '#111',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontFamily: 'Manrope',
        fontSize: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        fontFamily: 'Manrope',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ddd',
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
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF4000',
        borderStyle: 'dashed',
    },
    imagePlaceholderText: {
        marginTop: 5,
        fontFamily: 'Manrope',
        color: '#666',
    },
    selectedImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#FF4000',
    },
    listInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
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
    },
    teamItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    teamCheckbox: {
        marginRight: 10,
    },
    teamName: {
        fontFamily: 'Manrope',
        fontSize: 16,
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
        backgroundColor: '#666',
    },
    statusButtonText: {
        fontFamily: 'Manrope',
        fontWeight: 'bold',
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
        paddingTop: 10
    },
    inlineActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        columnGap: 15
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
});

export default CreateStaffScreen;