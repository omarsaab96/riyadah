import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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

export default function TeamDetails() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [team, setTeam] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const nameEditRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [changeTeamNameLoading, setChangeTeamNameLoading] = useState(false);

    const { id } = useLocalSearchParams();

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
                // setLoading(false)
            } else {
                console.log("no token",)
            }
        };

        fetchUser();
    }, [id]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await fetch(`https://riyadah.onrender.com/api/teams/${id}`);

                if (response.ok) {
                    const userData = await response.json();
                    setTeam(userData.data);
                    setTeamName(userData.data.name)

                } else {
                    console.error('API error');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };

        fetchTeam();
    }, [user]);

    useEffect(() => {
        const fetchSchedule = async () => {
            const token = await SecureStore.getItemAsync('userToken');

            try {
                const response = await fetch(`https://riyadah.onrender.com/api/schedules/team/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const scheduleData = await response.json();
                    // console.log(scheduleData)
                    setSchedule(scheduleData.data);
                } else {
                    console.error('API error');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [team]);

    const updateTeamName = async () => {
        const token = await SecureStore.getItemAsync('userToken');
        setChangeTeamNameLoading(true);

        if (token) {
            try {
                const response = await fetch(`https://riyadah.onrender.com/api/teams/${team._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: teamName,
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    setTeamName(data.data.name)
                    team.name = data.data.name;
                } else {
                    console.error('Update failed:', data.message);
                }
            } catch (error) {
                console.error('Error:', error.message);
            } finally {
                setChangeTeamNameLoading(false)
            }
        } else {
            console.log("no token",)
        }
    }

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
                        {loading && <Text style={styles.pageTitle}>Team details</Text>}

                        {!loading && user._id != userId &&
                            <Text style={styles.pageTitle}>{team?.name}</Text>
                        }

                        {!loading && user._id == userId &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: 200, zIndex: 1 }}>
                                <TextInput
                                    style={[
                                        styles.pageTitle,
                                        { padding: 0, maxWidth: 140 },
                                        isFocused && styles.inputFocused
                                    ]}
                                    value={teamName}
                                    onChangeText={(text) => setTeamName(text)}
                                    placeholderTextColor="#65676b"
                                    selectionColor="#fff"
                                    ref={nameEditRef}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                />

                                {changeTeamNameLoading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : isFocused ? (
                                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => { updateTeamName(); nameEditRef.current?.blur(); }}>
                                            <AntDesign name="check" size={24} color="#FFFFFF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { setTeamName(team.name); nameEditRef.current?.blur(); }}>
                                            <AntDesign name="close" size={24} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={() => nameEditRef.current?.focus()}>
                                        <AntDesign name="edit" size={24} color="#FFFFFF" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        }

                        {!loading && <Text style={styles.pageDesc}>{team?.sport}</Text>}

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

                    <Text style={styles.ghostText}>{teamName.substring(0, 6)}</Text>

                    {!loading && team && user && <>
                        {userId == user._id ? (
                            <View style={styles.profileImage}>
                                <TouchableOpacity onPress={() => router.push('/teams/uploadLogo')}>
                                    {(team.image == null || team.image == "") && <Image
                                        source={require('../../assets/teamlogo.png')}
                                        style={styles.profileImageAvatar}
                                        resizeMode="contain"
                                    />}
                                    {team.image != null && <Image
                                        source={{ uri: team.image }}
                                        style={styles.profileImageAvatar}
                                        resizeMode="contain"
                                    />}
                                </TouchableOpacity>

                                {(team.image == null || team.image == "") &&
                                    <TouchableOpacity style={styles.uploadImage} onPress={() => router.push('/teams/uploadLogo')}>
                                        <Entypo name="plus" size={20} color="#FF4000" />
                                        <Text style={styles.uploadImageText}>
                                            Upload logo
                                        </Text>
                                    </TouchableOpacity>
                                }

                                {team.image != null && team.image != "" &&
                                    <TouchableOpacity style={[styles.uploadImage, { padding: 5, }]} onPress={() => router.push('/teams/uploadLogo')}>
                                        <FontAwesome name="refresh" size={16} color="#FF4000" />
                                        <Text style={[styles.uploadImageText, { marginLeft: 5 }]}>
                                            Change logo
                                        </Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        ) : (
                            <View style={styles.profileImage}>
                                {(team.image == null || team.image == "") && <Image
                                    source={require('../../assets/teamlogo.png')}
                                    style={styles.profileImageAvatar}
                                    resizeMode="contain"
                                />}
                                {team.image != null && <Image
                                    source={{ uri: team.image }}
                                    style={styles.profileImageAvatar}
                                    resizeMode="contain"
                                />}
                            </View>
                        )}
                    </>}
                </View>

                <ScrollView >

                    <View style={styles.contentContainer}>
                        {error != '' && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {team && <View style={styles.profileSection}>

                            {/* age group */}
                            {team.ageGroup && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={styles.title}>
                                    Age Group
                                </Text>
                                {team.ageGroup ? (
                                    <View>
                                        <Text style={styles.paragraph}>{team.ageGroup}</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>}

                            {/* gender */}
                            {team.gender && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={styles.title}>
                                    Gender
                                </Text>
                                {team.gender ? (
                                    <View>
                                        <Text style={styles.paragraph}>{team.gender}</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.paragraph}>-</Text>
                                )}
                            </View>}

                            {/* club */}
                            {team.club && (
                                <View style={{ marginVertical: 20 }}>
                                    <Text style={[styles.title, { marginBottom: 10 }]}>Club</Text>
                                    <View>
                                        <TouchableOpacity
                                            style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#eeeeee', paddingVertical: 10, borderRadius: 8 }}
                                            onPress={() => router.push({
                                                pathname: '/profile/public',
                                                params: { id: team.club._id },
                                            })}>
                                            {team.club.image ? (
                                                <Image
                                                    source={{ uri: team.club.image }}
                                                    style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
                                                />
                                            ) : (
                                                <Image
                                                    source={require('../../assets/clublogo.png')}
                                                    style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
                                                />
                                            )}

                                            <View style={{ flex: 1, flexShrink: 1, width: '100%' }}>

                                                <Text
                                                    style={[styles.paragraph, { fontWeight: 'bold' }]}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                >
                                                    {team.club.name}
                                                </Text>

                                                <Text
                                                    style={[styles.paragraph, { fontSize: 14, opacity: 0.5, marginBottom: 10 }]}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                >
                                                    {team.club.sport.toString().replaceAll(',', ', ')}
                                                </Text>

                                                {/* <View style={styles.locationLink}>
                                                    <Text style={styles.locationLinkText}>View club profile</Text>
                                                </View> */}


                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            )}

                            {/* coaches */}
                            <View style={{ marginVertical: 20 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={styles.title}>{team.coaches.length} Coach{team.coaches.length == 1 ? '' : 'es'}</Text>
                                    {user._id == userId && <TouchableOpacity style={styles.editToggle}
                                        onPress={() => router.push({
                                            pathname: '/teams/coaches',
                                            params: { id: team._id },
                                        })}
                                    >
                                        <Entypo name="edit" size={16} color="#FF4000" />
                                        <Text style={styles.editToggleText}>Manage</Text>
                                    </TouchableOpacity>}
                                </View>

                                {team.coaches && team.coaches.length > 0 ? (
                                    <View style={{ marginBottom: 20 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
                                            {team.coaches.map((coach) => (
                                                <TouchableOpacity
                                                    key={coach._id}
                                                    style={{ alignItems: 'center', backgroundColor: '#eeeeee', width: '30.64%', padding: 10, borderRadius: 8 }}
                                                    onPress={() => router.push({
                                                        pathname: '/profile/public',
                                                        params: { id: coach._id },
                                                    })}>
                                                    <View style={{ alignItems: 'center' }}>
                                                        {coach.image ? (
                                                            <View style={[styles.searchResultItemImageContainer, { width: '100%', backgroundColor: '#dddddd', borderRadius: 100, overflow: 'hidden' }]}>
                                                                <Image
                                                                    source={{ uri: coach.image }}
                                                                    style={{ width: '100%', aspectRatio: 1 }}
                                                                />
                                                            </View>
                                                        ) : (
                                                            <View style={[styles.searchResultItemImageContainer, { width: '100%', backgroundColor: '#dddddd', borderRadius: 100, overflow: 'hidden' }]}>
                                                                {coach.gender == "Male" ? (
                                                                    <Image
                                                                        style={styles.searchResultItemImage}
                                                                        source={require('../../assets/avatar.png')}
                                                                        resizeMode="contain"
                                                                    />
                                                                ) : (
                                                                    <Image
                                                                        style={styles.searchResultItemImage}
                                                                        source={require('../../assets/avatarF.png')}
                                                                        resizeMode="contain"
                                                                    />
                                                                )}
                                                            </View>
                                                        )}

                                                        <Text style={styles.paragraph}>{coach.name.trim()}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={styles.paragraph}>No coaches</Text>
                                )}
                            </View>

                            {/* members */}
                            <View style={{ marginVertical: 20 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={styles.title}>{team.members.length} Member{team.members.length == 1 ? '' : 's'}</Text>
                                    {user._id == userId && <TouchableOpacity style={styles.editToggle}
                                        onPress={() => router.push({
                                            pathname: '/teams/members',
                                            params: { id: team._id },
                                        })}
                                    >
                                        <Entypo name="edit" size={16} color="#FF4000" />
                                        <Text style={styles.editToggleText}>Manage</Text>
                                    </TouchableOpacity>}
                                </View>

                                {team.members && team.members.length > 0 ? (
                                    <View style={{ marginBottom: 20 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
                                            {team.members.map((member) => (
                                                <TouchableOpacity
                                                    key={member._id}
                                                    style={{ alignItems: 'center', backgroundColor: '#eeeeee', width: '30.64%', padding: 10, borderRadius: 8 }}
                                                    onPress={() => router.push({
                                                        pathname: '/profile/public',
                                                        params: { id: member._id },
                                                    })}>
                                                    <View style={{ alignItems: 'center' }}>
                                                        <View style={{ marginBottom: 10 }}>
                                                            {member.image ? (
                                                                <View style={[styles.searchResultItemImageContainer, { width: '100%', backgroundColor: '#dddddd', borderRadius: 100, overflow: 'hidden' }]}>
                                                                    <Image
                                                                        source={{ uri: member.image }}
                                                                        style={{ width: '100%', aspectRatio: 1 }}
                                                                    />
                                                                </View>
                                                            ) : (
                                                                <View style={[styles.searchResultItemImageContainer, { width: '100%', backgroundColor: '#dddddd', borderRadius: 100, overflow: 'hidden' }]}>
                                                                    {member.gender == "Male" ? (
                                                                        <Image
                                                                            style={styles.searchResultItemImage}
                                                                            source={require('../../assets/avatar.png')}
                                                                            resizeMode="contain"
                                                                        />
                                                                    ) : (
                                                                        <Image
                                                                            style={styles.searchResultItemImage}
                                                                            source={require('../../assets/avatarF.png')}
                                                                            resizeMode="contain"
                                                                        />
                                                                    )}
                                                                </View>
                                                            )}
                                                        </View>
                                                        <Text style={styles.paragraph}>{member?.name?.trim()}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                ) : (
                                    <Text style={styles.paragraph}>No members</Text>
                                )}
                            </View>

                            {/* events */}
                            <View style={{ marginVertical: 20 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={styles.title}>Upcoming events</Text>
                                </View>

                                {schedule && schedule.length > 0 ? (
                                    schedule.map((event) => {
                                        const eventDate = new Date(event.startDateTime);
                                        const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        const endTime = new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <TouchableOpacity
                                                key={event._id}
                                                style={styles.eventCard}
                                                onPress={() => router.push(`/schedule/${event._id}`)}
                                            >
                                                <View style={styles.eventDate}>
                                                    <Text style={styles.eventDay}>{eventDate.getDate()}</Text>
                                                    <Text style={styles.eventMonth}>
                                                        {eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}
                                                    </Text>
                                                </View>
                                                <View style={styles.eventDetails}>
                                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                                    <Text style={styles.eventTime}>
                                                        {formattedTime} - {endTime}
                                                    </Text>
                                                    <Text style={styles.eventLocation}>
                                                        {event.locationType === 'online'
                                                            ? 'Online Event'
                                                            : event.venue?.name || 'Location TBD'}
                                                    </Text>
                                                    {event.eventType === 'match' && event.opponent && (
                                                        <View style={styles.opponentContainer}>
                                                            <Text style={styles.opponentText}>vs {event.opponent.name}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.eventAction}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        // Handle menu press here
                                                    }}
                                                >
                                                    <FontAwesome5 name="ellipsis-v" size={16} color="#666" />
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                        );
                                    })
                                ) : (
                                    <Text style={styles.paragraph}>No events</Text>
                                )}
                            </View>


                        </View>}


                    </View>
                </ScrollView >


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
    inputFocused: {
        color: '#fff',
        paddingRight: 30,
        marginBottom: 5,
        lineHeight: 25,
        borderBottomWidth: 1,
        borderColor: '#fff',
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
    },
    profileImage: {
        position: 'absolute',
        bottom: 0,
        right: -5,
        height: '70%',
        maxWidth: 200,
        overflow: 'hidden',
    },
    profileImageAvatar: {
        height: '100%',
        width: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    profileSection: {
        marginBottom: 30
    },
    title: {
        fontFamily: "Bebas",
        fontSize: 20
    },
    subtitle: {
        fontFamily: "Manrope",
        fontSize: 16,
        fontWeight: 'bold'
    },
    paragraph: {
        fontFamily: "Manrope",
        fontSize: 16
    },
    profileLink: {
        color: '#FF4000',
        fontSize: 14,
        fontFamily: 'Manrope'
    },
    locationLink: {
        backgroundColor: '#cccccc',
        borderRadius: 8,
        paddingVertical: 5
    },
    locationLinkText: {
        color: '#000',
        fontFamily: 'Bebas',
        fontSize: 20,
        textAlign: 'center'
    },
    editToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    editToggleText: {
        color: 'black',
        fontFamily: 'Bebas',
        fontSize: 18
    },
    searchLoader: {
        position: 'absolute',
        top: '50%',
        right: 10,
        transform: [{ translateY: '-50%' }]
    },
    searchLoadingText: {
        fontFamily: 'Manrope',
        color: '#888',
        marginVertical: 5
    },
    searchNoResultText: {
        fontFamily: 'Manrope',
        color: '#555',
        marginVertical: 5
    },
    searchResultItem: {
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
    },
    searchResultItemImageContainer: {
        width: 40,
        aspectRatio: 1,
        borderRadius: 20,
        backgroundColor: '#f4f4f4'
    },
    searchResultItemImage: {
        objectFit: 'contain',
        height: '100%',
        width: '100%'
    },
    searchResultItemInfo: {
        fontFamily: 'Manrope',
        fontSize: 16,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    searchResultItemLink: {
        color: '#FF4000'
    },
    searchResultItemDescription: {
        // fontSize:16,
        marginBottom: 5
    },
    searchResultItemName: {
        fontWeight: 'bold',
        fontSize: 16,
        // marginBottom:5
    },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    eventDate: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#eeeeee',
        marginRight: 15,
    },
    eventDay: {
        fontFamily: 'Bebas',
        fontSize: 24,
        color: '#FF4000',
    },
    eventMonth: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
        textTransform: 'uppercase',
    },
    eventDetails: {
        flex: 1,
    },
    eventTitle: {
        fontFamily: 'Manrope',
        fontSize: 16,
        color: '#111111',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    eventTime: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
        marginBottom: 3,
    },
    eventLocation: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#666666',
    },
    eventAction: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadImage: {
        backgroundColor: '#000000',
        padding: 2,
        paddingRight: 5,
        borderRadius: 10,
        textAlign: 'center',
        position: 'absolute',
        bottom: 5,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadImageText: {
        color: '#FF4000',
        fontFamily: 'Bebas',
        fontSize: 16,
    },
});
