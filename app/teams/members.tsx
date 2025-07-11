import Entypo from '@expo/vector-icons/Entypo';
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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Members() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [team, setTeam] = useState(null);
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
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [user]);

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

    const handleAddMember = async (athlete: any) => {
        setAddingMember(prev => [...prev, athlete._id]); // Add to array
        try {
            const alreadyMember = team.members.some((m: any) => m._id === athlete._id);
            if (alreadyMember) {
                console.log('duplicate')
                setAddingMember(prev => prev.filter(id => id !== athlete._id));
                return;
            };

            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                setError('Authentication token missing');
                setAddingMember(prev => prev.filter(id => id !== athlete._id));
                return;
            }

            const res = await fetch(`https://riyadah.onrender.com/api/teams/${team._id}/members`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    memberIds: [athlete._id], // sending as an array
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setTeam(data.data);
                setAddingMember(prev => prev.filter(id => id !== athlete._id));
            } else {
                setAddingMember(prev => prev.filter(id => id !== athlete._id));
                console.error(data.message);
                setError(data.message || 'Failed to add member.');
            }
        } catch (err) {
            console.error('Error adding member:', err);
            setError('Something went wrong while adding the member.');
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
                        <Text style={styles.pageTitle}>Team Members</Text>
                        {!loading && <Text style={styles.pageDesc}>Manage members of {team?.name}</Text>}

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

                    <Text style={styles.ghostText}>members</Text>

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

                        {team && <View style={styles.profileSection}>
                            <View style={{ marginBottom: 20 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={styles.title}>Members</Text>
                                    <TouchableOpacity style={styles.addChildrenButton} onPress={handleAddMembers}>
                                        <Entypo name="plus" size={20} color="#FF4000" />
                                        <Text style={styles.addChildrenButtonText}>Add Members</Text>
                                    </TouchableOpacity>
                                </View>

                                {openSearch && <View style={{
                                    marginBottom: 16
                                }}>
                                    <TextInput
                                        style={[styles.input, { marginBottom: 0 }]}
                                        placeholder="Search athletes name or email (min. 3 characters)"
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
                                    <View style={{ marginBottom: 5 }}>
                                        {searchResults.length > 0 && !searching &&
                                            searchResults.map((athlete) => {
                                                const alreadyMember = team.members.some((m) => m._id === athlete._id);

                                                return (
                                                    <View key={athlete._id}>
                                                        <TouchableOpacity
                                                            style={styles.searchResultItem}
                                                            onPress={() => !alreadyMember && handleAddMember(athlete)}
                                                            disabled={alreadyMember}
                                                        >
                                                            <View style={styles.searchResultItemImageContainer}>
                                                                {athlete.image ? (
                                                                    <Image
                                                                        style={styles.searchResultItemImage}
                                                                        source={{ uri: athlete.image }}
                                                                    />
                                                                ) : (

                                                                    athlete.gender == "Male" ? (
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
                                                                    )


                                                                )}
                                                            </View>
                                                            <View style={styles.searchResultItemInfo}>
                                                                <View>
                                                                    <Text style={styles.searchResultItemName}>{athlete.name}</Text>
                                                                    <Text style={[styles.searchResultItemDescription, athlete.sport == null && { opacity: 0.5, fontStyle: 'italic' }]}>{athlete.sport || 'no sport'}</Text>
                                                                </View>
                                                                {addingMember.includes(athlete._id) ? (
                                                                    <ActivityIndicator
                                                                        size="small"
                                                                        color="#FF4000"
                                                                    />
                                                                ) : (
                                                                    <Text
                                                                        style={
                                                                            [
                                                                                styles.searchResultItemLink,
                                                                                alreadyMember && { color: 'gray', fontStyle: 'italic' }
                                                                            ]
                                                                        }
                                                                    >
                                                                        {alreadyMember ? 'Already a member' : '+ Add As Member'}
                                                                    </Text>
                                                                )}

                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            })
                                        }

                                        {searchResults.length == 0 && !searching &&
                                            <View>
                                                <Text style={[styles.searchNoResultText, { marginBottom: 15 }]}>
                                                    No results
                                                </Text>
                                            </View>
                                        }
                                    </View>
                                )}

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
});
