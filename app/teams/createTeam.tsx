import { MaterialIcons } from '@expo/vector-icons';
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
    const [localImg, setLocalImg] = useState<string | null>(null);
    const [coaches, setCoaches] = useState<string[]>([]);
    const [staff, setStaff] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);


    const [teamData, setTeamData] = useState({
        name: '',
        sport: 'Football',
        ageGroup: 'U12',
        gender: 'Mixed',
        image: null,
        coaches: [],
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
        getStaff()
    }, [user])

    const validateForm = () => {
        const newErrors = {};
        if (!teamData.name.trim()) setError('Team name is required');
        if (!teamData.sport) setError('Please select a sport');
        return newErrors;
    };

    const pickImage = async () => {
        setError('');
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            alert("Permission to access media library is required!");
            return;
        }

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                base64: true
            });

            if (!result.canceled) {
                // Check image size (max 2MB)
                const base64Length = result.assets[0].base64.length;
                const sizeInMB = (base64Length * (3 / 4)) / (1024 * 1024);

                if (sizeInMB > 2) {
                    setError("Image too large. Max 2MB");
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
                image: teamData.image,
                coaches: teamData.coaches
            };

            // console.log("sending OBJ = ", requestBody)


            const response = await fetch('https://riyadah.onrender.com/api/teams', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            // console.log("res = ", response)

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

    const getStaff = async () => {
        setStaffLoading(true)
        if (user.type == "Club") {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const response = await fetch(`https://riyadah.onrender.com/api/staff/byClub/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    console.log("Staff=", data.data)
                    setStaff(data.data);
                } else {
                    setStaff([]);
                }
            } catch (err) {
                console.error('Failed to fetch staff', err);
                setStaff([]);
            } finally {
                setStaffLoading(false)
            }
        }
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
                        {!loading && <Text style={styles.pageDesc}>Create a new team in your club</Text>}

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

                    <View style={styles.contentContainer}>

                        {error != '' && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {/* Team Logo */}
                        <View style={styles.imageUploadContainer}>
                            <Text style={styles.label}>Team Logo</Text>

                            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                                {localImg || teamData?.image ? (
                                    <View>
                                        <Image
                                            source={{ uri: localImg || teamData.image }}
                                            style={[styles.avatarPreview, , { backgroundColor: '#FF4000' }]}
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

                        {/* Coaches */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Coaches</Text>
                            {/* <TextInput
                                style={styles.input}
                                placeholder="Enter coach name"
                                value={coaches}
                                onChangeText={(text) => setCoaches(text)}
                            /> */}
                            {staffLoading ? (
                                <View style={{ alignItems: 'flex-start' }}>
                                    <ActivityIndicator
                                        size="small"
                                        color="#FF4000"
                                    />
                                </View>
                            ) : (
                                <View style={styles.pickerContainer}>
                                    <View style={{ gap: 10 }}>
                                        {staff
                                            .filter(member => member.role === "Coach")
                                            .map((coach, index) => {
                                                const isSelected = coaches.includes(coach._id);
                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => {
                                                            let updated;
                                                            if (isSelected) {
                                                                updated = coaches.filter(id => id !== coach._id);
                                                            } else {
                                                                updated = [...coaches, coach._id];
                                                            }
                                                            setCoaches(updated);
                                                            setTeamData({ ...teamData, coaches: updated });
                                                        }}
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <MaterialIcons
                                                            name={isSelected ? "check-box" : "check-box-outline-blank"}
                                                            size={20}
                                                            color={isSelected ? "#FF4000" : "#333"}
                                                        />
                                                        <Text style={{ marginLeft: 5, color: "#000" }}>
                                                            {coach.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                    </View>

                                </View>
                            )
                            }
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
            </View >
        </KeyboardAvoidingView >
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
    formContainer: {
        padding: 20,
    },
    imageUploadContainer: {
        // alignItems: 'center',
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
        borderWidth: 0,
        backgroundColor: '#F4F4F4',
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
    },
    uploadBox: {
        // marginBottom: 30,
        // flexDirection:'row'
    },
    avatarPreview: {
        height: 100,
        width: 100,
        borderRadius: 20,
        marginBottom: 5
    },
    uploadHint: {
        fontFamily: 'Manrope',
        marginBottom: 10
    },
    emptyImage: {
        height: 100,
        width: 100,
        borderRadius: 20,
        marginRight: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        marginBottom: 5
    }
});
