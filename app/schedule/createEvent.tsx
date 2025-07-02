import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const CreateEventScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [teams, setTeams] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventType: 'training',
        team: '',
        startDateTime: new Date(),
        endDateTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // Default 2 hours later
        locationType: 'venue',
        venue: {
            name: '',
            address: ''
        },
        onlineLink: '',
        trainingFocus: '',
        opponent: {
            name: '',
            logo: ''
        },
        isHomeGame: false,
        requiredEquipment: []
    });

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [equipmentInput, setEquipmentInput] = useState('');

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const response = await fetch('https://riyadah.onrender.com/api/teams', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setTeams(data.data);
                    if (data.data.length > 0) {
                        setFormData(prev => ({ ...prev, team: data.data[0]._id }));
                    }
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };

        fetchTeams();
    }, []);

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showDatepicker = (type) => {
        setShowStartPicker(false);
        setShowEndPicker(false);
        // Then open the correct one


        if (Platform.OS === 'android') {
            // On Android, we need to set the picker visibility immediately
            if (type === 'start') {
                setShowStartPicker(true);
            } else {
                setShowEndPicker(true);
            }
        } else {
            // On iOS, we can toggle the picker
            if (type === 'start') {
                setShowStartPicker(!showStartPicker);
            } else {
                setShowEndPicker(!showEndPicker);
            }
        }
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

    const handleDateChange = (event: any, selectedDate: Date | undefined, type: 'start' | 'end') => {
        // For Android, we need to handle the case when the picker is dismissed
        if (!selectedDate) {
            // User cancelled the picker
            if (type === 'start') setShowStartPicker(false);
            else setShowEndPicker(false);
            return;
        }

        const currentDate = selectedDate || (type === 'start' ? formData.startDateTime : formData.endDateTime);

        // Always close the picker on selection
        if (type === 'start') {
            setShowStartPicker(false);
            setFormData(prev => ({ ...prev, startDateTime: currentDate }));

            // Auto-adjust end time if it becomes before start time
            if (currentDate > formData.endDateTime) {
                setFormData(prev => ({
                    ...prev,
                    endDateTime: new Date(currentDate.getTime() + 2 * 60 * 60 * 1000)
                }));
            }
        } else {
            setShowEndPicker(false);
            setFormData(prev => ({ ...prev, endDateTime: currentDate }));
        }
    };

    const addEquipment = () => {
        if (equipmentInput.trim()) {
            setFormData(prev => ({
                ...prev,
                requiredEquipment: [...prev.requiredEquipment, equipmentInput.trim()]
            }));
            setEquipmentInput('');
        }
    };

    const removeEquipment = (index) => {
        setFormData(prev => ({
            ...prev,
            requiredEquipment: prev.requiredEquipment.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.team) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (formData.endDateTime <= formData.startDateTime) {
            Alert.alert('Error', 'End time must be after start time');
            return;
        }

        try {
            setSaving(true);
            const token = await SecureStore.getItemAsync('userToken');

            // Prepare the request body
            const requestBody = {
                ...formData,
                startDateTime: formData.startDateTime.toISOString(),
                endDateTime: formData.endDateTime.toISOString()
            };

            // Clean up empty fields
            if (formData.locationType !== 'online') delete requestBody.onlineLink;
            if (formData.locationType !== 'venue') delete requestBody.venue;
            if (formData.eventType !== 'match') delete requestBody.opponent;
            if (formData.eventType !== 'training') delete requestBody.trainingFocus;

            const response = await fetch('https://riyadah.onrender.com/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Event created successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error(data.message || 'Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        router.back()
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
                        <Text style={styles.pageTitle}>New Event</Text>
                        {!loading && <Text style={styles.pageDesc}>Create an event for your club</Text>}

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

                    <Text style={styles.ghostText}>Events</Text>
                </View>

                <ScrollView >
                    {error != '' && <View style={styles.error}>
                        <View style={styles.errorIcon}></View>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>}
                    <View style={styles.contentContainer}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Event Title *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter event title"
                                value={formData.title}
                                onChangeText={(text) => handleChange('title', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input]}
                                placeholder="Enter description"
                                multiline
                                value={formData.description}
                                onChangeText={(text) => handleChange('description', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Event Type *</Text>
                            <Picker
                                selectedValue={formData.eventType}
                                onValueChange={(value) => handleChange('eventType', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Training Session" value="training" />
                                <Picker.Item label="Match" value="match" />
                                <Picker.Item label="Meeting" value="meeting" />
                                <Picker.Item label="Tournament" value="tournament" />
                            </Picker>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Team *</Text>
                            <Picker
                                selectedValue={formData.team}
                                onValueChange={(value) => handleChange('team', value)}
                                style={styles.picker}
                            >
                                {teams.map(team => (
                                    <Picker.Item
                                        key={team._id}
                                        label={`${team.name} (${team.sport})`}
                                        value={team._id}
                                    />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Start Date & Time *</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => showDatepicker('start')}
                            >
                                <Text>{formData.startDateTime.toLocaleString()}</Text>
                                <FontAwesome5 name="calendar-alt" size={18} color="#666" />
                            </TouchableOpacity>
                            {showStartPicker && (
                                <View>
                                    <DateTimePicker
                                        value={formData.startDateTime}
                                        mode="datetime"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, date) => handleDateChange(event, date, 'start')}
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>End Date & Time *</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => showDatepicker('end')}
                            >
                                <Text>{formData.endDateTime.toLocaleString()}</Text>
                                <FontAwesome5 name="calendar-alt" size={18} color="#666" />
                            </TouchableOpacity>
                            {showEndPicker && (
                                <DateTimePicker
                                    value={formData.endDateTime}
                                    mode="datetime"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    minimumDate={formData.startDateTime}
                                    onChange={(event, date) => handleDateChange(event, date, 'end')}
                                />
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Location Type</Text>
                            <Picker
                                selectedValue={formData.locationType}
                                onValueChange={(value) => handleChange('locationType', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Venue" value="venue" />
                                <Picker.Item label="Online" value="online" />
                                <Picker.Item label="To Be Determined" value="tbd" />
                            </Picker>
                        </View>

                        {formData.locationType === 'venue' && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Venue Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter venue name"
                                        value={formData.venue.name}
                                        onChangeText={(text) => handleNestedChange('venue', 'name', text)}
                                    />
                                </View>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Venue Address</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter venue address"
                                        value={formData.venue.address}
                                        onChangeText={(text) => handleNestedChange('venue', 'address', text)}
                                    />
                                </View>
                            </>
                        )}

                        {formData.locationType === 'online' && (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Online Meeting Link</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter meeting link"
                                    value={formData.onlineLink}
                                    onChangeText={(text) => handleChange('onlineLink', text)}
                                />
                            </View>
                        )}

                        {formData.eventType === 'training' && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Training Focus</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="E.g. Passing drills, defensive positioning"
                                        value={formData.trainingFocus}
                                        onChangeText={(text) => handleChange('trainingFocus', text)}
                                    />
                                </View>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Required Equipment</Text>
                                    <View style={styles.equipmentContainer}>
                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            placeholder="Add equipment (e.g. cones, balls)"
                                            value={equipmentInput}
                                            onChangeText={setEquipmentInput}
                                            onSubmitEditing={addEquipment}
                                        />
                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={addEquipment}
                                        >
                                            <Text style={styles.addButtonText}>Add</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.equipmentList}>
                                        {formData.requiredEquipment.map((item, index) => (
                                            <View key={index} style={styles.equipmentItem}>
                                                <Text style={styles.equipmentText}>{item}</Text>
                                                <TouchableOpacity onPress={() => removeEquipment(index)}>
                                                    <FontAwesome5 name="times" size={14} color="#FF4000" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </>
                        )}

                        {formData.eventType === 'match' && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Opponent Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter opponent team name"
                                        value={formData.opponent.name}
                                        onChangeText={(text) => handleNestedChange('opponent', 'name', text)}
                                    />
                                </View>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Opponent Logo URL</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter opponent logo URL"
                                        value={formData.opponent.logo}
                                        onChangeText={(text) => handleNestedChange('opponent', 'logo', text)}
                                    />
                                </View>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Home or Away</Text>
                                    <Picker
                                        selectedValue={formData.isHomeGame}
                                        onValueChange={(value) => handleChange('isHomeGame', value)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Home Game" value={true} />
                                        <Picker.Item label="Away Game" value={false} />
                                    </Picker>
                                </View>
                            </>
                        )}


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
    contentContainer: {
        padding: 20,
        paddingBottom: 130
    },
    formGroup: {
        marginBottom: 20,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Platform.OS === 'android' ? 10 : 0,
    },
    equipmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#FF4000',
        padding: 10,
        borderRadius: 8,
        marginLeft: 10,
    },
    addButtonText: {
        color: '#fff',
        fontFamily: 'Manrope',
        fontWeight: 'bold',
    },
    equipmentList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    equipmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    equipmentText: {
        marginRight: 8,
        fontFamily: 'Manrope',
    },
    submitButton: {
        backgroundColor: '#FF4000',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Bebas',
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        // marginBottom: 30
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontFamily: 'Bebas',
        fontSize: 24,
        color: '#111',
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
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontFamily: "Bebas",
        fontSize: 20,
        marginBottom: 10
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontFamily: 'Manrope',
        fontSize: 16,
    },
    inputError: {
        borderColor: '#FF4000',
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
});

export default CreateEventScreen;