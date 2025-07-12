import Entypo from '@expo/vector-icons/Entypo';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function TeamDetails() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);


    const { id } = useLocalSearchParams();

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
                setLoading(false)
            } else {
                console.log("no token",)
            }
        };

        fetchUser();
        fetchTeam();
    }, [id]);

    useEffect(() => {
    }, [team]);

    const handleAddMembers = () => {
        setOpenSearch(true)
    }

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
                searchAthletes(text);
            } else {
                setSearchResults([]);
            }
        }, 500); // delay: 500ms

        setDebounceTimeout(timeout);
    };

    const searchAthletes = async (name: string) => {
        try {
            setSearching(true);
            const res = await fetch(`https://riyadah.onrender.com/api/users/search?keyword=${name}&type=Athlete`);

            if (res.ok) {
                const data = await res.json();
                // console.log(data)
                setSearchResults(data); // expected array
            } else {
                console.error("Search failed");
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Error during search:", err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleAddMember = (athlete: any) => {
        const alreadyMember = team.members.some((m: any) => m._id === athlete._id);
        if (alreadyMember) return;

        // Add athlete to team members
        setTeam((prev: any) => ({
            ...prev,
            members: [...prev.members, athlete._id]
        }));

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
                        <Text style={styles.pageTitle}>{loading ? 'Team details' : team?.name}</Text>
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

                    {!loading &&
                        <View style={styles.profileImage}>
                            {team.image != null && <Image
                                source={{ uri: team.image }}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />}
                        </View>
                    }

                    <Text style={styles.ghostText}>{team?.name.substring(0, 6)}</Text>
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
                            {team.coaches && team.coaches.length > 0 ? (
                                <View style={{ marginVertical: 20 }}>
                                    <Text style={[styles.title, { marginBottom: 10 }]}>Coach{team.coaches.length > 1 && 'es'}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
                                        {team.coaches.map((coach) => (
                                            <TouchableOpacity
                                                style={{ alignItems: 'center', backgroundColor: '#eeeeee', width: '30%', padding: 10, borderRadius: 8 }}
                                                onPress={() => router.push({
                                                    pathname: '/profile/public',
                                                    params: { id: coach._id },
                                                })}>
                                                <View key={coach._id} style={{ alignItems: 'center' }}>
                                                    {coach.image && (
                                                        <Image
                                                            source={{ uri: coach.image }}
                                                            style={{ width: '100%', aspectRatio: 1, borderRadius: 25, marginBottom: 5 }}
                                                        />
                                                    )}
                                                    <Text style={styles.paragraph}>{coach.name.trim()}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View style={{ marginVertical: 20 }}>
                                    <Text style={styles.title}>Coaches</Text>
                                    <Text style={styles.paragraph}>No coaches</Text>
                                </View>
                            )}

                            {/* members */}
                            {team.members && team.members.length > 0 ? (
                                <View style={{ marginVertical: 20 }}>
                                    <Text style={styles.title}>Member{team.members.length > 1 && 's'}</Text>
                                    <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 10 }}>
                                        {team.members.map((member) => (
                                            <TouchableOpacity
                                                style={{ alignItems: 'center', backgroundColor: '#eeeeee', width: '30%', padding: 10, borderRadius: 8 }}
                                                onPress={() => router.push({
                                                    pathname: '/profile/public',
                                                    params: { id: member._id },
                                                })}>
                                                <View key={member._id} style={{ alignItems: 'center' }}>
                                                    {member.image && (
                                                        <Image
                                                            source={{ uri: member.image }}
                                                            style={{ width: '100%', aspectRatio: 1, borderRadius: 25, marginBottom: 5 }}
                                                        />
                                                    )}
                                                    <Text style={styles.paragraph}>{member?.name?.trim()}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                            ) : (
                                <View style={{ marginVertical: 20 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={styles.title}>Members</Text>
                                        <TouchableOpacity style={styles.addChildrenButton} onPress={handleAddMembers}>
                                            <Entypo name="plus" size={20} color="#FF4000" />
                                            <Text style={styles.addChildrenButtonText}>Add Members</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {openSearch && <View style={{
                                        marginVertical: 16
                                    }}>
                                        <TextInput
                                            style={[styles.input, { marginBottom: 0 }]}
                                            placeholder="Athlete name or email (min. 3 characters)"
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
                                    </View>}

                                    {keyword.trim().length >= 3 && !searching && (
                                        <View style={{ marginTop: 10 }}>
                                            {searchResults.length > 0 && !searching &&
                                                searchResults.map((athlete, i) => (
                                                    <View key={i} >
                                                        <TouchableOpacity
                                                            style={styles.searchResultItem}
                                                            onPress={() => { handleAddMember(athlete) }}>
                                                            <View style={styles.searchResultItemImageContainer}>
                                                                <Image
                                                                    style={styles.searchResultItemImage}
                                                                    source={{ uri: athlete.image }}
                                                                />
                                                            </View>
                                                            <View style={styles.searchResultItemInfo}>
                                                                <View>
                                                                    <Text style={styles.searchResultItemName}>{athlete.name}</Text>
                                                                    <Text style={styles.searchResultItemDescription}>{athlete.sport}</Text>
                                                                </View>
                                                                <Text style={styles.searchResultItemLink}>+ Add As Member</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                ))
                                            }

                                            {searchResults.length == 0 && !searching &&
                                                <View>
                                                    <Text style={styles.searchNoResultText}>
                                                        No results.{'\n'}Can't find your child's account?
                                                    </Text>
                                                </View>
                                            }
                                        </View>
                                    )}

                                    <Text style={styles.paragraph}>No members</Text>
                                </View>
                            )}
                        </View>}


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
        columnGap: 20
    },
    searchResultItemImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 10,
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
        justifyContent: 'space-between'
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
});
