import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Schedule() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [team, setTeam] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingMember, setAddingMember] = useState<string[]>([]);
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);


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

                    if (user.role == "Coach") {
                        const coachteams = await fetch(`https://riyadah.onrender.com/api/teams/byCoach/${user._id}`);

                        if (coachteams.ok) {
                            const coachdata = await coachteams.json();
                            setUserCoachOf(coachdata.data);
                        } else {
                            console.log('Could not get teams of coach');
                        }
                    }
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
                    console.log(scheduleData)
                    setSchedule(scheduleData.data);
                } else {
                    console.error('API error');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 500)
            }
        };

        fetchSchedule();
    }, [team]);


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
                        <Text style={styles.pageTitle}>Team Events</Text>
                        {!loading && team?.name && <Text style={styles.pageDesc}>Manage upcoming events</Text>}

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

                    {!loading &&
                        <View style={styles.profileImage}>
                            {team?.image != null && <Image
                                source={{ uri: team?.image }}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />}
                        </View>
                    }
                </View>

                <ScrollView >

                    <View style={styles.contentContainer}>
                        {error != '' && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {!loading && team && <View style={styles.profileSection}>

                            {/* events */}
                            <View style={{ marginBottom: 20 }}>
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
    addChildrenButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addChildrenButtonText: {
        color: 'black',
        fontFamily: 'Bebas',
        fontSize: 18
    },
    searchLoader: {
        position: 'absolute',
        top: 15,
        right: 10,
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
});
