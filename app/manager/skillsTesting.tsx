
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function skillsTestingScreen() {
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserTest, setSelectedUserTest] = useState(null);
    const [searching, setSearching] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSelectedUser, setLoadingSelectedUser] = useState(false);
    const [loadingSubmittingTest, setLoadingSubmittingTest] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [keyword, setKeyword] = useState('');
    const router = useRouter();

    const tabs = ['All', 'Athletes', 'Clubs', 'Federations', 'Coaches'];
    const roles = ['All', 'Athlete', 'Coach', 'Club', 'Association']
    const categories = ['All', 'Users', 'Teams', 'Events', 'Posts']
    const sport = ['All', 'Football', 'Basketball', 'Tennis', 'Swimming', 'Gymnastics']
    const genders = ['All', 'Male', 'Female']

    const [activeTab, setActiveTab] = useState('All');
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSport, setSelectedSport] = useState('All');
    const [selectedGender, setSelectedGender] = useState('All');
    const [position, setPosition] = useState('');

    const [selectedAccount, setSelectedAccount] = useState('');

    const [testedSkills,setTestedSkills] = useState([]);

    useEffect(() => {
        fetchUser();
    }, []);

    const handleSearch = () => {
        search(keyword)
    }

    const search = async (text: string) => {
        setSearching(true);
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            console.log("No token found");
            setSearching(false);
            return;
        }

        let params = `keyword=${text}`;

        params += `&category=${selectedCategory}`;
        params += `&sport=${selectedSport}`;
        params += `&gender=${selectedGender}`;
        params += `&position=${position}`;

        if (selectedRole == 'Coach') {
            params += "&userType=Athlete&role=Coach";
        } else {
            params += `&userType=${selectedRole}`;
        }

        // console.log(params)

        try {
            const response = await fetch(`http://193.187.132.170:5000/api/search?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // console.log("Search results: ", data);

                // Separate users by type
                const groupedUsers = {
                    athlete: [],
                    club: [],
                    association: [],
                    coaches: [],
                    other: [],
                };

                (data.users || []).forEach(user => {
                    switch (user.type) {
                        case 'Athlete':
                            groupedUsers.athlete.push(user);
                            break;
                        case 'Club':
                            groupedUsers.club.push(user);
                            break;
                        case 'Association':
                            groupedUsers.association.push(user);
                            break;
                        default:
                            groupedUsers.other.push(user);
                    }
                });

                (data.users || []).forEach(user => {
                    if (user.role == "Coach") {
                        groupedUsers.coaches.push(user);
                    }
                });

                setSearchResults({
                    users: groupedUsers,
                    events: data.events || [],
                    posts: data.posts || []
                });
            } else {
                console.error('Search API error');
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setSearching(false);
        }
    };

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
                search(text);
            } else {
                setSearchResults([]);
            }
        }, 500); // delay: 500ms

        setDebounceTimeout(timeout);
    };

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

    const handleAccountSelected = async (accountId: string) => {
        setLoadingSelectedUser(true)
        setSelectedAccount(accountId);
        try {
            const response = await fetch(`http://193.187.132.170:5000/api/users/${accountId}`);

            if (response.ok) {
                const userData = await response.json();
                setSelectedUser(userData);
                if (userData.type != "Athlete") {
                    setError("Selected user is not an athlete.");
                } else {
                    setError("");

                    const testResponse = await fetch(`http://193.187.132.170:5000/api/test/user/${userData._id}`);

                    if (response.ok) {
                        const testData = await testResponse.json();
                        setSelectedUserTest(testData.test);
                        setTestedSkills(testData.test.results||[]);
                    } else {
                        setSelectedUserTest(null);
                        console.error('Test API error');
                    }
                }
            } else {
                console.error('API error');
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setLoadingSelectedUser(false);
        }
    }

    const handleCancelAccountSelection = () => {
        setSelectedAccount('');
        setSelectedUser(null);
        setSelectedUserTest(null);
        setError('');
    }

    const handleSubmitTestResults = async () => {
        setLoadingSubmittingTest(false);

        try {
            const nowdate = new Date();

            const dynamicResults = testedSkills.map(s => ({
                testedSkill: s.testedSkill,
                score: Number(s.score),
                date: nowdate
            }));

            const test = {
                testedSubject: selectedAccount,
                lastTested: nowdate,
                results: dynamicResults
            }

            const response = await fetch(`http://193.187.132.170:5000/api/test/add-result/${selectedUser._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ testData: test }),
            });

            if (response.ok) {
                console.error("Submitted test results successfully");
            } else {
                console.error("Couldn't submit test results");
            }
        } catch (error) {
            console.error('Failed to submit test results:', error);
        } finally {
            setLoadingSubmittingTest(false);
        }
    }

    return (
        <View style={styles.container}>
            {Platform.OS === 'ios' ? (
                <View style={{ height: 60, backgroundColor: '#FF4000' }} />
            ) : (
                <View style={{ height: 25, backgroundColor: '#FF4000' }} />
            )}

            <StatusBar style="light" translucent={false} backgroundColor="#FF4000" />

            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/logo_orangeBlack.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {selectedAccount == '' && <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.input, Platform.OS === 'ios' && { padding: 15 }]}
                    value={keyword}
                    onChangeText={handleSearchInput}
                    placeholderTextColor={'#888888'}
                    placeholder="Search (Min. 3 characters)"
                />

                {searching &&
                    <ActivityIndicator
                        size="small"
                        color="#FF4000"
                        style={styles.searchLoader}
                    />
                }
            </View>}

            {selectedAccount == '' && <View style={styles.filters}>
                <Text style={styles.filterTitle} onPress={() => { setShowFilters(prev => !prev) }}>Filters</Text>
                {showFilters && <View style={{ marginTop: 20 }} >
                    <View style={styles.filter}>
                        <Text style={styles.filterLabel}>Search by position</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#fff' }, Platform.OS === 'ios' && { padding: 15 }]}
                            value={position}
                            onChangeText={setPosition}
                            placeholderTextColor={'#888888'}
                            placeholder="Enter position"
                        />
                    </View>
                    <View style={styles.filter}>
                        <Text style={styles.filterLabel}>Search in</Text>
                        <View style={styles.tabs}>
                            {categories.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    onPress={() => setSelectedCategory(c)}
                                    style={[
                                        styles.filterButton,
                                        c == "All" && { paddingHorizontal: 12 },
                                        selectedCategory === c && styles.activeFilterButton
                                    ]}
                                >
                                    <Text style={[styles.filterText, selectedCategory === c && styles.activeFilterText]}>
                                        {c}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filter}>
                        <Text style={styles.filterLabel}>Search for</Text>
                        <View style={styles.tabs}>
                            {roles.map(r => (
                                <TouchableOpacity
                                    key={r}
                                    onPress={() => setSelectedRole(r)}
                                    style={[
                                        styles.filterButton,
                                        r == "All" && { paddingHorizontal: 12 },
                                        selectedRole === r && styles.activeFilterButton
                                    ]}
                                >
                                    <Text style={[styles.filterText, selectedRole === r && styles.activeFilterText]}>
                                        {r}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {(selectedCategory == "All" || selectedCategory == "Users") && <View style={styles.filter}>
                        <Text style={styles.filterLabel}>Gender</Text>
                        <View style={styles.tabs}>
                            {genders.map(g => (
                                <TouchableOpacity
                                    key={g}
                                    onPress={() => setSelectedGender(g)}
                                    style={[
                                        styles.filterButton,
                                        g == "All" && { paddingHorizontal: 12 },
                                        selectedGender === g && styles.activeFilterButton
                                    ]}
                                >
                                    <Text style={[styles.filterText, selectedGender === g && styles.activeFilterText]}>
                                        {g}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>}

                    <View style={styles.filter}>
                        <Text style={styles.filterLabel}>Sport</Text>
                        <View style={styles.tabs}>
                            {sport.map(s => (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => setSelectedSport(s)}
                                    style={[
                                        styles.filterButton,
                                        s == "All" && { paddingHorizontal: 12 },
                                        selectedSport === s && styles.activeFilterButton
                                    ]}
                                >
                                    <Text style={[styles.filterText, selectedSport === s && styles.activeFilterText]}>
                                        {s}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleSearch} style={styles.filterBtn}>
                        <Text style={styles.filterBtnText}>Filter</Text>
                    </TouchableOpacity>
                </View>}
            </View>}

            <ScrollView>
                {selectedAccount == '' && <View>
                    {(activeTab === 'All' || activeTab === 'Athletes') && searchResults.users?.athlete?.length > 0 && (
                        <View style={styles.searchResultsContainer}>
                            <Text style={styles.sectionTitle}>
                                {searchResults.users.athlete.length} {searchResults.users.athlete.length == 1 ? 'Athlete' : 'Athletes'}
                            </Text>
                            {searchResults.users.athlete.map(user => (
                                <TouchableOpacity
                                    key={user._id}
                                    style={styles.searchResultsItem}
                                    onPress={() => handleAccountSelected(user._id)}
                                >
                                    <View style={[
                                        styles.avatarContainer,
                                        (user.image == null || user.image == "") && { backgroundColor: '#ff4000' }
                                    ]}>
                                        {(user.image == null || user.image == "") && user.gender == "Male" && <Image
                                            source={require('../../assets/avatar.png')}
                                            style={styles.avatar}
                                            resizeMode="contain"
                                        />}
                                        {(user.image == null || user.image == "") && user.gender == "Female" && <Image
                                            source={require('../../assets/avatarF.png')}
                                            style={styles.avatar}
                                            resizeMode="contain"
                                        />}
                                        {user.image != null && <Image
                                            source={{ uri: user.image }}
                                            style={styles.avatar}
                                            resizeMode="contain"
                                        />}
                                    </View>
                                    <View style={{ justifyContent: 'center' }}>
                                        <Text style={styles.name}>{user.name}</Text>
                                        {user.sport && <Text style={styles.role}>{user.sport}</Text>}
                                    </View>

                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {(activeTab === 'All' || activeTab === 'Clubs') && searchResults.users?.club?.length > 0 && (
                        <View style={styles.searchResultsContainer}>
                            <Text style={styles.sectionTitle}>
                                {searchResults.users.club.length} {searchResults.users.club.length == 1 ? 'Club' : 'Clubs'}
                            </Text>
                            {searchResults.users.club.map(user => (
                                <TouchableOpacity
                                    key={user._id}
                                    style={styles.searchResultsItem}
                                    onPress={() => handleAccountSelected(user._id)}
                                >
                                    <View style={[
                                        styles.avatarContainer,
                                        (user.image == null || user.image == "") && { backgroundColor: '#ff4000' }
                                    ]}>
                                        {(user.image == null || user.image == "") && <Image
                                            source={require('../../assets/clublogo.png')}
                                            style={styles.avatar}
                                            resizeMode="contain"
                                        />}
                                        {user.image != null && <Image
                                            source={{ uri: user.image }}
                                            style={styles.avatar}
                                            resizeMode="contain"
                                        />}
                                    </View>
                                    <View style={{ justifyContent: 'center' }}>
                                        <Text style={styles.name}>{user.name}</Text>
                                        {user.sport && <Text style={styles.role}>
                                            {user.sport.map(s => s).join(", ")}
                                        </Text>}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {(activeTab === 'All' || activeTab === 'Federations') && searchResults.users?.association?.length > 0 && (
                        <View style={styles.searchResultsContainer}>
                            <Text style={styles.sectionTitle}>
                                {searchResults.users.association.length} {searchResults.users.association.length == 1 ? 'Federation' : 'Federations'}
                            </Text>
                            {searchResults.users.association.map(user => (
                                <TouchableOpacity
                                    key={user._id}
                                    style={styles.searchResultsItem}
                                    onPress={() => handleAccountSelected(user._id)}
                                >
                                    <View style={[
                                        styles.avatarContainer,
                                        (user.image == null || user.image == "") && { backgroundColor: '#ff4000' }
                                    ]}>
                                        {(user.image == null || user.image == "") && <Image
                                            source={require('../../assets/association.png')}
                                            style={styles.avatar}
                                            resizeMode="contain"
                                        />}
                                        {user.image != null && <Image
                                            source={{ uri: user.image }}
                                            style={styles.avatar}
                                            resizeMode="contain"
                                        />}
                                    </View>
                                    <View style={{ justifyContent: 'center' }}>
                                        <Text style={styles.name}>{user.name}</Text>
                                        {user.sport && <Text style={styles.role}>
                                            {user.sport.map(s => s).join(", ")}
                                        </Text>}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {(activeTab === 'All' || activeTab === 'Coaches') && searchResults.users?.coaches?.length > 0 && (
                        <View style={styles.searchResultsContainer}>
                            <Text style={styles.sectionTitle}>
                                {searchResults.users.coaches.length} {searchResults.users.coaches.length == 1 ? 'Coach' : 'Coaches'}
                            </Text>
                            {searchResults.users.coaches.map(user => (
                                <TouchableOpacity
                                    key={user._id}
                                    style={styles.searchResultsItem}
                                    onPress={() => handleAccountSelected(user._id)}
                                >
                                    <View style={[
                                        styles.avatarContainer,
                                        (user.image == null || user.image == "") && { backgroundColor: '#ff4000' }
                                    ]}>
                                        {(user.image == null || user.image == "") && user.gender == "Male" && <Image
                                            source={require('../../assets/avatar.png')}
                                            style={styles.avatar}
                                            resizeMode="contain"
                                        />}
                                        {(user.image == null || user.image == "") && user.gender == "Female" && <Image
                                            source={require('../../assets/avatarF.png')}
                                            style={styles.avatar}
                                            resizeMode="contain"
                                        />}
                                        {user.image != null && <Image
                                            source={{ uri: user.image }}
                                            style={styles.avatar}
                                            resizeMode="contain"
                                        />}
                                    </View>
                                    <View style={{ justifyContent: 'center' }}>
                                        <Text style={styles.name}>{user.name}</Text>
                                        {user.sport && <Text style={styles.role}>{user.sport}</Text>}
                                    </View>

                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>}

                {selectedAccount != '' && selectedUser != null && <View style={styles.contentContainer}>
                    {error != '' && <View style={styles.error}>
                        <View style={styles.errorIcon}></View>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>}

                    <TouchableOpacity onPress={() => { handleCancelAccountSelection() }} style={{ marginBottom: 20 }}>
                        <Text>Back to search</Text>
                    </TouchableOpacity>

                    <View>
                        <Text>Selected {selectedAccount}</Text>
                        <Text>{selectedUser.name}</Text>
                    </View>

                    <TouchableOpacity onPress={() => { handleSubmitTestResults() }}>
                        <Text>New test result</Text>
                    </TouchableOpacity>

                    {selectedUserTest != null ? (<View style={{ marginTop: 20 }}>
                        <Text>Test Details:</Text>
                        <Text>Test ID: {selectedUserTest._id}</Text>
                        <Text>Test Date: {new Date(selectedUserTest.testDate).toLocaleDateString()}</Text>
                    </View>
                    ) : (
                        <Text style={{ marginTop: 20 }}>No test data found for this user.</Text>
                    )}
                </View>}
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130
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
        fontFamily: 'Acumin',
    },
    logoContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10
    },
    logo: {
        width: 120,
        height: 30,
    },
    navBar: {
        position: 'absolute',
        bottom: 50,
        left: 10,
        width: width - 20,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e0e0e0',

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,

        // Android shadow
        elevation: 5,
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#111111'
    },
    activeIcon: {
        width: 24,
        height: 24,
        tintColor: '#FF4000',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    input: {
        fontSize: 14,
        paddingHorizontal: 15,
        backgroundColor: '#F4F4F4',
        color: 'black',
        borderRadius: 10,
        fontFamily: 'Acumin',
    },
    searchLoader: {
        position: 'absolute',
        top: 15,
        right: 30,
    },
    searchResultsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30
    },
    searchResultsSection: {
        borderWidth: 1
    },
    searchResultsItem: {
        flexDirection: 'row',
        alignContent: 'center',
        marginBottom: 10,
        backgroundColor: '#F4F4F4',
        padding: 5,
        borderRadius: 10
    },
    avatarContainer: {
        width: 50,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginRight: 15,
        overflow: 'hidden',
    },
    avatar: {
        width: undefined,
        height: '100%',
        maxWidth: 50,
        aspectRatio: 1
    },
    name: {
        fontFamily: 'Qatar',
        fontSize: 16,
        color: '#111111',
    },
    role: {
        fontFamily: 'Acumin',
        fontSize: 14,
        color: '#888888',
    },
    sectionTitle: {
        fontFamily: 'Qatar',
        color: '#111111',
        fontSize: 18,
        marginBottom: 10,
    },
    filters: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 20,
        backgroundColor: '#f4f4f4',
    },
    filterTitle: {
        fontFamily: 'Qatar',
        color: '#111111',
        fontSize: 16
    },
    filterBtn: {
        backgroundColor: '#dddddd',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterBtnText: {
        color: '#111111',
        fontWeight: '600',
        fontSize: 16,
        fontFamily: 'Qatar'
    },
    tabs: {
        flexDirection: 'row',
        gap: 5,
        flexWrap: 'wrap'
    },
    filter: {
        marginBottom: 15
    },
    picker: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
    },
    filterLabel: {
        fontSize: 14,
        color: '#111111',
        marginBottom: 5,
        fontFamily: 'Acumin',
    },
    filterButton: {
        padding: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#111111',
    },
    activeFilterButton: {
        backgroundColor: '#111111',
    },
    filterText: {
        fontSize: 14,
        color: '#555',
        fontFamily: 'Acumin'
    },
    activeFilterText: {
        color: '#fff',
    },
});