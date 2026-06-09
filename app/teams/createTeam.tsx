import { MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
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
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../../context/language';

const { width } = Dimensions.get('window');

export default function CreateTeam() {
    const router = useRouter();
    const { isRTL, t } = useLanguage();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [localImg, setLocalImg] = useState<string | null>(null);
    const [coaches, setCoaches] = useState<string[]>([]);
    const [visibleCoaches, setVisibleCoaches] = useState<string[]>([]);
    const [staff, setStaff] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [showNewAgeGroupInput, setShowNewAgeGroupInput] = useState(false);
    const [newAgeGroupError, setNewAgeGroupError] = useState(false);
    const [newAgeGroup, setNewAgeGroup] = useState('');
    const newAgeGroupRef = useRef(null);
    const [ageGroups, setAgeGroups] = useState(['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'U21', 'Senior']);

    const [teamData, setTeamData] = useState({
        name: '',
        sport: 'Football',
        ageGroup: 'U12',
        gender: 'Mixed',
        image: null,
        coaches: [],
    });

    const sports = [
        'Football', 'Basketball', 'Gymnastics', 'Volleyball', 'Swimming', 'Tennis',
        // 'Athletics', 'Handball', 'Hockey'
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

                const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
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
        if (user?.type === "Club") {
            getStaff()
        }
    }, [user])

    const validateForm = () => {
        const newErrors = {};
        if (!teamData.name.trim()) setError(t('teamCreate.teamNameRequired'));
        if (!teamData.sport) setError(t('teamCreate.selectSport'));
        return newErrors;
    };

    const pickImage = async () => {
        setError('');
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            alert(t('teamCreate.mediaPermission'));
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
                    setError(t('teamCreate.imageTooLarge'));
                    return;
                }

                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setTeamData({ ...teamData, image: base64Image });
            }
        } catch (error) {
            Alert.alert(t('teamCreate.errorTitle'), `${t('teamCreate.failedPickImage')}: ${error.message}`);
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


            const response = await fetch('https://server.riyadah.app/api/teams', {
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
                router.replace({
                    pathname: '/profile',
                    params: { tab: 'Teams' }
                })
            } else {
                throw new Error(data.message || t('teamCreate.failedCreate'));
            }
        } catch (error) {
            console.error('Error creating team:', error);
            Alert.alert(t('teamCreate.errorTitle'), error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        router.back()
    };

    const getStaff = async () => {
        if (user?.type == "Club") {
            setStaffLoading(true)
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const response = await fetch(`https://server.riyadah.app/api/staff/byClub/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    // console.log("Staff=", data.data)
                    setStaff(data.data);
                    setVisibleCoaches(data.data.filter(member => member.role === "Coach"))
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

    const handleAddNewAgeGroup = () => {
        setShowNewAgeGroupInput(true);
        setTimeout(() => {
            newAgeGroupRef.current?.focus();
        }, 100);
    };

    const handleCancelNewAgeGroup = () => {
        setShowNewAgeGroupInput(false);
        setNewAgeGroup('')
    };
    const handleSubmitNewAgeGroup = () => {
        if (newAgeGroup.trim() == "") {
            setNewAgeGroupError(true)
            setTimeout(() => {
                newAgeGroupRef.current?.focus();
            }, 100);
            return;
        }
        setNewAgeGroupError(false)
        setAgeGroups([...ageGroups, newAgeGroup]);
        setShowNewAgeGroupInput(false)
        setTeamData({ ...teamData, ageGroup: newAgeGroup })
        console.log("New age group:", ageGroups);
        setNewAgeGroup('')
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
                                params: { tab: 'Teams' }
                            })
                        }}
                            style={[styles.backBtn, isRTL && styles.backBtnRtl]}
                    >
                        <Ionicons name={isRTL?"chevron-forward":"chevron-back"} size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>{t('teamCreate.backToTeams')}</Text>
                    </TouchableOpacity>

                    <View style={[styles.headerTextBlock, isRTL && styles.headerTextBlockRtl]}>
                        <Text style={styles.pageTitle}>{t('teamCreate.newTeam')}</Text>
                        {!loading && <Text style={[styles.pageDesc, isRTL && styles.rtlText]}>{t('teamCreate.newTeamDesc')}</Text>}

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

                    <Text style={[styles.ghostText, isRTL && styles.ghostTextRtl]}>{t('teamCreate.ghost')}</Text>
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

                        {error != '' && <View style={[styles.error,isRTL&&{flexDirection:'row-reverse'}]}>
                            <View style={[styles.errorIcon,isRTL&&{marginRight:0,marginLeft:15}]}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {/* Team Logo */}
                        <View style={styles.imageUploadContainer}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('teamCreate.teamLogo')}</Text>

                            <TouchableOpacity style={[styles.uploadBox]} onPress={pickImage}>
                                {localImg || teamData?.image ? (
                                    <View style={isRTL&&{flexDirection:'row-reverse'}}>
                                        <Image
                                            source={{ uri: localImg || teamData.image }}
                                            style={[styles.avatarPreview, , { backgroundColor: '#FF4000' }]}
                                        />
                                        <Text style={[styles.uploadHint, isRTL && styles.rtlText]}>{t('teamCreate.tapChangeImage')}</Text>
                                    </View>
                                ) : (
                                    <View style={isRTL&&{flexDirection:'row-reverse'}}>
                                        <View style={[styles.emptyImage,isRTL&&{marginRight: 0,marginLeft: 20}]}>
                                            <MaterialIcons name="add" size={40} color="#FF4000" />
                                        </View>
                                        <Text style={[styles.uploadHint, isRTL && styles.rtlText,]}>{t('teamCreate.tapUploadImage')}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Team Name */}
                        <View style={[styles.inputContainer]}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('teamCreate.teamName')}</Text>
                            <TextInput
                                style={[styles.input,isRTL&&{textAlign:'right'}]}
                                placeholder={t('teamCreate.enterTeamName')}
                                placeholderTextColor={"#888888"}
                                value={teamData.name}
                                onChangeText={(text) => setTeamData({ ...teamData, name: text })}
                                selectionColor={'#FF4400'}
                            />
                        </View>

                        {/* Coaches */}
                        <View style={[styles.inputContainer]}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('teamCreate.coaches')}</Text>
                            {/* <TextInput
                                style={[styles.input,isRTL&&{textAlign:'right'}]}
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
                                        {visibleCoaches.length == 0 && <Text>No coaches in your staff yet</Text>}
                                        {visibleCoaches.length > 0 && visibleCoaches.map((coach, index) => {
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
                                                    style={[{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                    },isRTL&&{flexDirection:'row-reverse'
                                                    }]}
                                                >
                                                    <MaterialIcons
                                                        name={isSelected ? "check-box" : "check-box-outline-blank"}
                                                        size={20}
                                                        color={isSelected ? "#FF4000" : "#333"}
                                                    />
                                                    <Text style={{ marginLeft: 5, color: "#000" }}>
                                                        {coach.userRef?.name || 'Staff Member'}
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
                        <View style={[styles.inputContainer]}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('teamCreate.sport')}</Text>
                            {/* <View style={styles.pickerContainer}>
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
                            </View> */}
                            <View style={[{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' },isRTL&&{flexDirection:'row-reverse'}]}>
                                {sports.map((sport, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.multipleChoice, teamData.sport == sport && styles.selectedChoice]}
                                        onPress={() => { setTeamData({ ...teamData, sport: sport }) }}
                                    >
                                        <Text style={[styles.multipleChoiceText, teamData.sport == sport && styles.selectedChoiceText]}>
                                            {sport}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Age Group */}
                        <View style={[styles.inputContainer]}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('teamCreate.ageGroup')}</Text>
                            <View style={styles.pickerContainer}>
                                {/* <Picker
                                    selectedValue={teamData.ageGroup}
                                    onValueChange={(itemValue) =>
                                        setTeamData({ ...teamData, ageGroup: itemValue })
                                    }
                                    style={styles.picker}
                                >
                                    {ageGroups.map((group, index) => (
                                        <Picker.Item key={index} label={group} value={group} />
                                    ))}
                                </Picker> */}
                            <View style={[{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' },isRTL&&{flexDirection:'row-reverse'}]}>
                                    {ageGroups.map((group, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.multipleChoice, teamData.ageGroup == group && styles.selectedChoice]}
                                            onPress={() => { setTeamData({ ...teamData, ageGroup: group }) }}
                                        >
                                            <Text style={[styles.multipleChoiceText, teamData.ageGroup == group && styles.selectedChoiceText]}>
                                                {group}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}

                                    {!showNewAgeGroupInput && <TouchableOpacity
                                        style={[styles.multipleChoice]}
                                        onPress={() => { handleAddNewAgeGroup() }}
                                    >
                                        <Entypo name="plus" size={20} color="black" />
                                    </TouchableOpacity>}

                                    {showNewAgeGroupInput && <View style={[styles.newAgeGroupContainer, newAgeGroupError && { borderWidth: 1, borderColor: '#ff4400' }]}>
                                        <TextInput
                                            style={[styles.input,isRTL&&{textAlign:'right'}, styles.newAgeGroupInput]}
                                            placeholder={t('teamCreate.newAgeGroup')}
                                            placeholderTextColor={"#888888"}
                                            value={newAgeGroup}
                                            onChangeText={setNewAgeGroup}
                                            selectionColor={'#FF4400'}
                                            ref={newAgeGroupRef}
                                        />
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <TouchableOpacity onPress={() => { handleCancelNewAgeGroup() }}>
                                                <MaterialIcons name="close" size={20} color="black" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => { handleSubmitNewAgeGroup() }}>
                                                <FontAwesome6 name="check" size={18} color="black" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>}


                                </View>

                            </View>
                        </View>

                        {/* Gender */}
                        <View style={[styles.inputContainer]}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('teamCreate.gender')}</Text>
                            {/* <View style={styles.pickerContainer}>
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
                            </View> */}
                            <View style={[{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' },isRTL&&{flexDirection:'row-reverse'}]}>
                                {genders.map((gender, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.multipleChoice, teamData.gender == gender && styles.selectedChoice]}
                                        onPress={() => { setTeamData({ ...teamData, gender: gender }) }}
                                    >
                                        <Text style={[styles.multipleChoiceText, teamData.gender == gender && styles.selectedChoiceText]}>
                                            {gender}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.profileActions, styles.inlineActions, isRTL && styles.inlineActionsRtl]}>
                            <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                                <Text style={styles.profileButtonText}>{t('teamCreate.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmit} style={[styles.profileButton, styles.savebtn]}>
                                <Text style={styles.profileButtonText}>{saving ? t('teamCreate.saving') : t('teamCreate.save')}</Text>
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
    inlineActionsRtl: {
        justifyContent: 'flex-start'
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
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
        // marginBottom: 30
    },
    logo: {
        width: 120,
        height: 40,
        position: 'absolute',
        top: 30,
        left: 20,
        zIndex: 1,
    },
    headerTextBlock: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: width - 40,
    },
    headerTextBlockRtl: {
        left: 'auto',
        right: 20,
        maxWidth:200
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontFamily: 'Qatar',
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
        fontFamily: 'Acumin',
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
        fontFamily: "Qatar",
        fontSize: 20,
        marginBottom: 10,
        color: 'black'
    },
    input: {
        fontFamily: 'Acumin',
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10
    },
    newAgeGroupInput: {
        borderRadius: 30,
        marginBottom: 0,
        padding: 0,
        paddingLeft: 0,
        maxWidth: 200
    },
    newAgeGroupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F4F4F4',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5
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
        fontFamily: 'Acumin',
        borderWidth: 0,
        backgroundColor: '#F4F4F4',
        color: 'black'
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
        fontFamily: 'Qatar',
        fontSize: 20,
    },
    ghostText: {
        fontSize: 100, textTransform: 'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 20,
        right: -5,
        color:'#ff6633',
    maxHeight:200,
    lineHeight:200
    },
    ghostTextRtl: {
        right: undefined,
        left: -5,
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
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
        fontFamily: 'Acumin',
        marginBottom: 10,
        color: '#111111'
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
        marginBottom: 5,
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
    backBtnRtl: {
        flexDirection: 'row-reverse',
        width:'100%',
        right:10,
        left: 'auto',
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Qatar'
    },
    multipleChoice: {
        backgroundColor: '#F4F4F4',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    multipleChoiceText: {
        fontFamily: 'Acumin',
        color: '#000',
        fontSize: 16,
    },
    selectedChoice: {
        backgroundColor: '#1a491e'
    },
    selectedChoiceText: {
        color: '#fff'
    }
});
