import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

const CreateEventScreen = () => {
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [teams, setTeams] = useState([]);
    const [repeat, setRepeat] = useState('No');
    const [location, setLocation] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventType: 'Training',
        team: '',
        date: new Date(),
        startTime: new Date(new Date().getTime() * 60 * 60 * 1000),
        endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
        locationType: 'venue',
        venue: {
            name: '',
            address: ''
        },
        location: {
            latitude: null,
            longitude: null
        },
        onlineLink: '',
        trainingFocus: '',
        repeats: 'No',
        opponent: {
            name: '',
            logo: ''
        },
        status: 'scheduled',
        isHomeGame: false,
        requiredEquipment: [] as Array<{ itemId: string, name: string, quantity: number }>
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickedDate, setPickedDate] = useState(new Date());

    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [pickedStartTime, setPickedStartTime] = useState(new Date());

    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [pickedEndTime, setPickedEndTime] = useState(new Date());

    const [searching, setSearching] = useState(false);
    const [equipmentSearch, setEquipmentSearch] = useState('');
    const [inventoryItems, setInventoryItems] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const dateStr = d.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return `${dateStr}`;
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);

        const timeStr = d.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // set true if you want AM/PM
        });
        return ` ${timeStr}`;
    };

    const setEventDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            if (event.type === 'dismissed') {
                setShowDatePicker(false);
                return;
            }

            setPickedDate(selectedDate)
            setShowDatePicker(false);

            // Finalize datetime
            // const finalDateTime = new Date(
            //     pickerState.tempDate.getFullYear(),
            //     pickerState.tempDate.getMonth(),
            //     pickerState.tempDate.getDate(),
            //     selectedDate.getHours(),
            //     selectedDate.getMinutes()
            // );
        }

        if (Platform.OS === 'ios') {
            if (event.type === 'set') {
                setPickedDate(selectedDate)
            }
        }
    }

    const setEventStartTime = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            if (event.type === 'dismissed') {
                setShowStartTimePicker(false);
                return;
            }

            setPickedStartTime(selectedDate)
            setShowStartTimePicker(false);

            // Finalize datetime
            // const finalDateTime = new Date(
            //     pickerState.tempDate.getFullYear(),
            //     pickerState.tempDate.getMonth(),
            //     pickerState.tempDate.getDate(),
            //     selectedDate.getHours(),
            //     selectedDate.getMinutes()
            // );
        }

        if (Platform.OS === 'ios') {
            if (event.type === 'set') {
                setPickedStartTime(selectedDate)
            }
        }
    }

    const setEventEndTime = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            if (event.type === 'dismissed') {
                setShowEndTimePicker(false);
                return;
            }

            setPickedEndTime(selectedDate)
            setShowEndTimePicker(false);

            // Finalize datetime
            // const finalDateTime = new Date(
            //     pickerState.tempDate.getFullYear(),
            //     pickerState.tempDate.getMonth(),
            //     pickerState.tempDate.getDate(),
            //     selectedDate.getHours(),
            //     selectedDate.getMinutes()
            // );
        }

        if (Platform.OS === 'ios') {
            if (event.type === 'set') {
                setPickedEndTime(selectedDate)
            }
        }
    }

    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');

            console.log(token)
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
                } else {
                    console.error('API error')
                }
                setLoading(false)
            } else {
                console.log("no token",)
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const response = await fetch('http://193.187.132.170:5000/api/teams', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
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

        const fetchInventory = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const response = await fetch(`http://193.187.132.170:5000/api/inventory/byClub/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                console.log("data= ", data)
                if (data.success) {
                    setInventoryItems(data.data);
                } else {
                    console.log("Error fetching inventory")
                }
            } catch (error) {
                console.error('Error fetching inventory:', error);
            }
        };

        fetchTeams();
        fetchInventory();
    }, [user]);

    useEffect(() => {
        console.log(inventoryItems)
    }, [inventoryItems]);

    const handleSearch = (text: string) => {
        setEquipmentSearch(text);

        if (text.trim().length < 3) {
            setSearchResults([]);
            return;
        }


        if (text.trim().length >= 3 && inventoryItems.length > 0) {
            setSearching(true)
            const results = inventoryItems.filter(item =>
                item.itemName.toLowerCase().includes(text.trim().toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
        setSearching(false)
    };

    const addEquipment = () => {
        if (selectedItem && quantity > 0) {
            setFormData(prev => ({
                ...prev,
                requiredEquipment: [
                    ...prev.requiredEquipment,
                    {
                        itemId: selectedItem._id,
                        name: selectedItem.itemName,
                        quantity: quantity
                    }
                ]
            }));
            setSelectedItem(null);
            setEquipmentSearch('');
            setSearchResults([]);
            setQuantity(1);
        }
    };

    const removeEquipment = (index) => {
        setFormData(prev => ({
            ...prev,
            requiredEquipment: prev.requiredEquipment.filter((_, i) => i !== index)
        }));
    };

    const updateQuantity = (index, newQuantity) => {
        if (newQuantity >= 0) {
            setFormData(prev => {
                const newEquipment = [...prev.requiredEquipment];
                newEquipment[index].quantity = newQuantity;
                return { ...prev, requiredEquipment: newEquipment };
            });
        }
    };

    const handleChange = (name: string, value: string) => {
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

    const handleCancel = async () => {
        router.back()
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.team) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (pickedEndTime <= pickedStartTime) {
            Alert.alert('Error', 'End time must be after start time');
            return;
        }

        try {
            setSaving(true);
            const token = await SecureStore.getItemAsync('userToken');

            // Prepare the request body
            const requestBody = {
                ...formData,
                date: pickedDate.toISOString(),
                startTime: pickedStartTime.toISOString(),
                endTime: pickedEndTime.toISOString(),
                team: formData.team,
                repeats: repeat,
                status: 'scheduled'
            };

            // Clean up empty fields
            if (formData.locationType !== 'Online') delete requestBody.onlineLink;
            if (formData.locationType !== 'Venue') delete requestBody.venue;
            if (formData.eventType !== 'Match') delete requestBody.opponent;
            if (formData.eventType !== 'Training') delete requestBody.trainingFocus;

            // console.log(requestBody)

            const response = await fetch('http://193.187.132.170:5000/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            // console.warn("Response data: ", data)

            if (response.ok) {
                router.replace({
                    pathname: '/profile',
                    params: { tab: 'Schedule' }
                })
            } else {
                throw new Error(data.message || 'Failed to create event');
            }
        } catch (error) {
            // console.error('Error creating event:', error);
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
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
                                params: { tab: 'Schedule' }
                            })
                        }}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>Back to Schedule</Text>
                    </TouchableOpacity>

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
                                placeholderTextColor={"#888"}
                                value={formData.title}
                                onChangeText={(text) => handleChange('title', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Date*</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.inputText}>
                                    {formatDate(pickedDate)}
                                </Text>
                                <FontAwesome5 name="calendar-alt" size={18} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Event Time start-end */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>From*</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowStartTimePicker(true)}
                                >
                                    <Text style={styles.inputText}>
                                        {formatTime(pickedStartTime)}
                                    </Text>
                                    <FontAwesome5 name="clock" size={18} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Till*</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowEndTimePicker(true)}
                                >
                                    <Text style={styles.inputText}>
                                        {formatTime(pickedEndTime)}
                                    </Text>
                                    <FontAwesome5 name="clock" size={18} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* //show datetime picker */}
                        {showDatePicker && <DateTimePicker
                            value={pickedDate}
                            mode="date"
                            is24Hour={true}
                            display={'default'}
                            onChange={setEventDate}
                        />}

                        {showStartTimePicker && (
                            <DateTimePicker
                                value={pickedStartTime}
                                mode="time"
                                is24Hour={false}
                                display={'spinner'}
                                onChange={setEventStartTime}
                            />
                        )}

                        {showEndTimePicker && (
                            <DateTimePicker
                                value={pickedEndTime}
                                mode="time"
                                is24Hour={false}
                                display={'spinner'}
                                onChange={setEventEndTime}
                            />
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Event Type *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.eventType}
                                    onValueChange={(value) => handleChange('eventType', value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Training Session" value="Training" />
                                    <Picker.Item label="Match" value="Match" />
                                    <Picker.Item label="Meeting" value="Meeting" />
                                    <Picker.Item label="Tournament" value="Tournament" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Team *</Text>
                            <View style={styles.pickerContainer}>
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
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input]}
                                placeholder="Enter description"
                                placeholderTextColor={"#888"}
                                multiline
                                value={formData.description}
                                onChangeText={(text) => handleChange('description', text)}
                            />
                        </View>

                        < View style={styles.formGroup}>
                            <Text style={[styles.label,{marginBottom:0}]}>Recurring event</Text>
                            <Text style={styles.hint}>Recurrence will expire automatically after one year.</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={'No'}
                                    onValueChange={setRepeat}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="No" value="No" />
                                    <Picker.Item label="Daily" value="Daily" />
                                    <Picker.Item label="Weekly" value="Weekly" />
                                    <Picker.Item label="Monthly" value="Monthly" />
                                    {/* <Picker.Item label="Yearly" value="Yearly" /> */}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Location Type</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.locationType}
                                    onValueChange={(value) => handleChange('locationType', value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Venue" value="Venue" />
                                    <Picker.Item label="Online" value="Online" />
                                    <Picker.Item label="To Be Determined" value="tbd" />
                                </Picker>
                            </View>
                        </View>

                        {formData.locationType === 'Venue' && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Venue Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholderTextColor={"#888"}
                                        placeholder="Enter venue name"
                                        value={formData.venue.name}
                                        onChangeText={(text) => handleNestedChange('venue', 'name', text)}
                                    />
                                </View>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Venue Address</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholderTextColor={"#888"}
                                        placeholder="Enter venue address"
                                        value={formData.venue.address}
                                        onChangeText={(text) => handleNestedChange('venue', 'address', text)}
                                    />
                                </View>
                            </>
                        )}

                        {formData.locationType === 'Online' && (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Online Meeting Link</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor={"#888"}
                                    placeholder="Enter meeting link"
                                    value={formData.onlineLink}
                                    onChangeText={(text) => handleChange('onlineLink', text)}
                                />
                            </View>
                        )}

                        {formData.locationType !== 'Online' &&
                            <View>
                                <Text style={styles.label}>Venue Location</Text>
                                <View style={styles.map}>
                                    <MapView
                                        provider={PROVIDER_GOOGLE}
                                        style={styles.mapPreview}
                                        region={{
                                            latitude: formData.location?.latitude || 0,
                                            longitude: formData.location?.longitude || 0,
                                            latitudeDelta: formData.location?.latitude ? 0.01 : 50,
                                            longitudeDelta: formData.location?.longitude ? 0.01 : 50
                                        }}
                                        onPress={(e) => {
                                            const coords = e.nativeEvent.coordinate;
                                            setLocation(coords);
                                            handleChange('location.latitude', String(coords.latitude))
                                            handleChange('location.longitude', String(coords.longitude))
                                        }}
                                    >
                                        {location && (
                                            <Marker
                                                coordinate={location}
                                                draggable
                                                onDragEnd={(e) => {
                                                    const coords = e.nativeEvent.coordinate;
                                                    setLocation(coords);
                                                    handleChange('location.latitude', String(coords.latitude))
                                                    handleChange('location.longitude', String(coords.longitude))
                                                }}
                                            />
                                        )}
                                    </MapView>
                                </View>
                            </View>
                        }

                        {formData.eventType === 'Training' && (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Training Focus</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor={"#888"}
                                    placeholder="E.g. Passing drills, defensive positioning"
                                    value={formData.trainingFocus}
                                    onChangeText={(text) => handleChange('trainingFocus', text)}
                                />
                            </View>
                        )}

                        {formData.eventType === 'Training' && inventoryItems.length > 0 && (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Required Equipment</Text>
                                <View>
                                    <View style={styles.equipmentContainer}>
                                        <TextInput
                                            style={[styles.input, { marginBottom: 0, flex: 1 }]}
                                            placeholder="Search equipment (min. 3 characters)"
                                            value={equipmentSearch}
                                            placeholderTextColor={"#888"}
                                            onChangeText={handleSearch}
                                        />
                                    </View>
                                    {searching &&
                                        <ActivityIndicator
                                            size="small"
                                            color="#FF4000"
                                            style={styles.searchLoader}
                                        />
                                    }
                                </View>

                                {!searching && searchResults.length > 0 && (
                                    <View style={styles.searchResults}>
                                        {searchResults.map(item => (
                                            <TouchableOpacity
                                                key={item._id}
                                                style={styles.searchResultItem}
                                                onPress={() => {
                                                    setSelectedItem(item);
                                                    setEquipmentSearch('');
                                                    setSearchResults([]);
                                                }}
                                            >
                                                <Text style={styles.searchResultText}>{item.itemName}</Text>
                                                <Text style={styles.searchResultSubText}>Available: {item.quantity}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                                {!searching && equipmentSearch.trim().length >= 3 && searchResults.length == 0 && (
                                    <Text style={{ fontFamily: 'Manrope', color: 'black' }}>
                                        No results. Try another keyword
                                    </Text>
                                )}

                                {selectedItem && (
                                    <View style={styles.quantitySelector}>
                                        <Text style={styles.selectedItemText}>{selectedItem.itemName}</Text>
                                        <View style={styles.quantityControls}>
                                            <TouchableOpacity
                                                style={styles.quantityButton}
                                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                            >
                                                <Text style={styles.quantityButtonText}>-</Text>
                                            </TouchableOpacity>
                                            <TextInput
                                                style={styles.quantityInput}
                                                value={quantity.toString()}
                                                onChangeText={(text) => setQuantity(parseInt(text) || 0)}
                                                keyboardType="numeric"
                                            />
                                            <TouchableOpacity
                                                style={styles.quantityButton}
                                                onPress={() => setQuantity(quantity + 1)}
                                            >
                                                <Text style={styles.quantityButtonText}>+</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.addSelectedButton}
                                                onPress={addEquipment}
                                            >
                                                <Text style={styles.addSelectedButtonText}>Add</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.equipmentList}>
                                    {formData.requiredEquipment.map((item, index) => (
                                        <View key={index} style={styles.equipmentItem}>
                                            <Text style={styles.equipmentText}>{item.name}</Text>
                                            <View style={styles.equipmentQuantity}>
                                                <TouchableOpacity
                                                    style={styles.quantityButtonSmall}
                                                    onPress={() => updateQuantity(index, item.quantity - 1)}
                                                >
                                                    <Text style={styles.quantityButtonText}>-</Text>
                                                </TouchableOpacity>
                                                <TextInput
                                                    style={styles.quantityInputSmall}
                                                    value={item.quantity.toString()}
                                                    onChangeText={(text) => updateQuantity(index, parseInt(text) || 0)}
                                                    keyboardType="numeric"
                                                />
                                                <TouchableOpacity
                                                    style={styles.quantityButtonSmall}
                                                    onPress={() => updateQuantity(index, item.quantity + 1)}
                                                >
                                                    <Text style={styles.quantityButtonText}>+</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity onPress={() => removeEquipment(index)}>
                                                <FontAwesome5 name="times" size={14} color="#FF4000" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {formData.eventType === 'Match' && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Opponent Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter opponent team name"
                                        placeholderTextColor={"#888"}
                                        value={formData.opponent.name}
                                        onChangeText={(text) => handleNestedChange('opponent', 'name', text)}
                                    />
                                </View>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Opponent Logo URL</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter opponent logo URL"
                                        placeholderTextColor={"#888"}
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
                                <Text style={styles.profileButtonText}>
                                    {saving ? 'Saving' : 'save'}
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
            </View >
        </KeyboardAvoidingView >
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
    searchLoader: {
        position: 'absolute',
        top: 15,
        right: 10,
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
        // flexDirection: 'row',
        // flexWrap: 'wrap',
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
        marginBottom: 10,
        color: 'black'
    },
    hint: {
        fontFamily: 'Manrope',
        fontSize: 13,
        marginBottom: 5,
        color: '#666'
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10
    },
    inputError: {
        borderColor: '#FF4000',
    },
    pickerContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        fontFamily: 'Manrope',
        backgroundColor: '#F4F4F4',
        color: 'black'
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F4F4',
        padding: 12,
        borderRadius: 4,
        justifyContent: 'space-between',
    },
    // dateInput: {
    //     borderWidth: 1,
    //     borderColor: '#ddd',
    //     borderRadius: 8,
    //     padding: 12,
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     marginBottom: Platform.OS === 'android' ? 10 : 0,
    // },
    inputText: {
        fontSize: 16,
        color: '#333',
    },
    searchResults: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        maxHeight: 200,
    },
    searchResultItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchResultText: {
        fontSize: 16,
        fontFamily: 'Manrope',
        color: 'black'
    },
    searchResultSubText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Manrope',
    },
    quantitySelector: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    selectedItemText: {
        fontSize: 16,
        fontFamily: 'Manrope',
        marginBottom: 8,
        color: 'black'
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        backgroundColor: '#FF4000',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    quantityButtonSmall: {
        backgroundColor: '#FF4000',
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    quantityButtonText: {
        color: '#fff',
        fontSize: 24,
        lineHeight: 24
    },
    quantityInput: {
        width: 50,
        height: 30,
        textAlign: 'center',
        marginHorizontal: 5,
        backgroundColor: '#fff',
        borderRadius: 4,
        fontSize: 16,
        padding: 0,
        lineHeight: 1,
        color: 'black'
    },
    quantityInputSmall: {
        width: 40,
        // height: 24,
        textAlign: 'center',
        marginHorizontal: 5,
        backgroundColor: '#fff',
        borderRadius: 4,
        fontSize: 14,
        lineHeight: 1,
        color: 'black'
    },
    addSelectedButton: {
        backgroundColor: '#FF4000',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 4,
        marginLeft: 10,
    },
    addSelectedButtonText: {
        color: '#fff',
        fontFamily: 'Manrope',
        fontWeight: 'bold',
    },
    equipmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        flex: 1
    },
    equipmentText: {
        marginRight: 8,
        fontFamily: 'Manrope',
        fontSize: 14,
        flex: 1,
        color: 'black'
    },
    equipmentQuantity: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        color: 'black'
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
    iosPickerContainer: {
        backgroundColor: '#fff',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    iosPickerButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    iosPickerButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginLeft: 10,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
    },
    iosPickerButtonConfirm: {
        backgroundColor: '#FF4000',
    },
    iosPickerButtonText: {
        color: '#000',
        fontFamily: 'Manrope',
    },
    map: {
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: "#cccccc",
        marginBottom: 20
    },
    mapPreview: {
        width: '100%',
        height: 150,
    },
});

export default CreateEventScreen;