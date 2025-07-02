import { FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
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

export default function CreateTeam() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [teamData, setTeamData] = useState({
        name: '',
        sport: 'Football',
        ageGroup: 'U12',
        gender: 'Mixed',
        image: null,
        coach: null,
    });

    const sports = [
        'Football', 'Basketball', 'Volleyball', 'Tennis',
        'Swimming', 'Athletics', 'Handball', 'Hockey'
    ];

    const ageGroups = [
        'U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'U21', 'Senior'
    ];

    const genders = ['Male', 'Female', 'Mixed'];

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
                    setLoading(false)
                } else {
                    console.error('API error')
                }
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
    }, [user])

    const validateForm = () => {
        const newErrors = {};
        if (!teamData.name.trim()) setError('Team name is required');
        if (!teamData.sport) setError('Please select a sport');
        return newErrors;
    };

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: true
            });

            if (!result.canceled) {
                // Check image size (max 2MB)
                const base64Length = result.assets[0].base64.length;
                const sizeInMB = (base64Length * (3 / 4)) / (1024 * 1024);

                if (sizeInMB > 2) {
                    Alert.alert('Image too large', 'Please select an image smaller than 2MB');
                    return;
                }

                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setTeamData({ ...teamData, image: base64Image });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image: ' + error.message);
        }
    };

    const handleSubmit = async () => {
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            return;
        }

        setSaving(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');

            // Prepare the request body with Base64 image
            const requestBody = {
                name: teamData.name,
                sport: teamData.sport,
                ageGroup: teamData.ageGroup,
                gender: teamData.gender,
                image: teamData.image
            };

            const response = await fetch('https://riyadah.onrender.com/api/teams', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('response:', response);
            const data = await response.json();
            



            if (response.ok) {
                Alert.alert('Success', 'Team created successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                throw new Error(data.message || 'Failed to create team');
            }
        } catch (error) {
            console.error('Error creating team:', error);
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
                        <Text style={styles.pageTitle}>New Team</Text>
                        {!loading && <Text style={styles.pageDesc}>Add a team in your club</Text>}

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

                    <Text style={styles.ghostText}>Teams</Text>
                </View>

                {/* <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color="#FF4000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create New Team</Text>
                    <View style={{ width: 24 }} />
                </View> */}

                <ScrollView >
                    {error != '' && <View style={styles.error}>
                        <View style={styles.errorIcon}></View>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>}
                    <View style={styles.contentContainer}>
                        {/* Team Logo */}
                        <View style={styles.imageUploadContainer}>
                            <Text style={styles.label}>Team Logo</Text>
                            <TouchableOpacity
                                style={styles.imageUploadButton}
                                onPress={pickImage}
                            >
                                {teamData.image ? (
                                    <Image
                                        source={{ uri: teamData.image }}
                                        style={styles.teamImage}
                                    />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <FontAwesome5 name="camera" size={24} color="#FF4000" />
                                        <Text style={styles.imageUploadText}>Upload Logo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Team Name */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Team Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter team name"
                                value={teamData.name}
                                onChangeText={(text) => setTeamData({ ...teamData, name: text })}
                            />
                        </View>

                        {/* Sport Selection */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Sport</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={teamData.sport}
                                    onValueChange={(itemValue) =>
                                        setTeamData({ ...teamData, sport: itemValue })
                                    }
                                    style={styles.picker}
                                >
                                    {sports.map((sport, index) => (
                                        <Picker.Item key={index} label={sport} value={sport} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Age Group */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Age Group</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={teamData.ageGroup}
                                    onValueChange={(itemValue) =>
                                        setTeamData({ ...teamData, ageGroup: itemValue })
                                    }
                                    style={styles.picker}
                                >
                                    {ageGroups.map((group, index) => (
                                        <Picker.Item key={index} label={group} value={group} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Gender */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={teamData.gender}
                                    onValueChange={(itemValue) =>
                                        setTeamData({ ...teamData, gender: itemValue })
                                    }
                                    style={styles.picker}
                                >
                                    {genders.map((gender, index) => (
                                        <Picker.Item key={index} label={gender} value={gender} />
                                    ))}
                                </Picker>
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
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130
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
    formContainer: {
        padding: 20,
    },
    imageUploadContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    imageUploadButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#FF4000',
    },
    imagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageUploadText: {
        marginTop: 10,
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#FF4000',
    },
    teamImage: {
        width: '100%',
        height: '100%',
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
    submitButton: {
        backgroundColor: '#FF4000',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontFamily: 'Bebas',
        fontSize: 20,
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
    }
});



/////////
/////////
/////////      test create team
/////////
/////////