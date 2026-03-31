import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { jwtDecode } from "jwt-decode";
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
import { useLanguage } from '../../context/language';

const { width } = Dimensions.get('window');

export default function skillsTestingScreen() {
    const { isRTL, t, language } = useLanguage();
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

    const [addNewResultsModalVisible, setAddNewResultsModalVisible] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState('');

    const [testedSkills, setTestedSkills] = useState([]);
    const [previouslyTestedSkills, setPreviouslyTestedSkills] = useState({});
    const getSectionLabel = (key: 'athlete' | 'club' | 'association' | 'coach', count: number) => {
        if (key === 'athlete') return `${count} ${count === 1 ? t('search.athlete') : t('search.athletes')}`;
        if (key === 'club') return `${count} ${count === 1 ? t('search.club') : t('search.clubs')}`;
        if (key === 'association') return `${count} ${count === 1 ? t('search.federation') : t('search.federations')}`;
        return `${count} ${count === 1 ? t('search.coach') : t('search.coaches')}`;
    };

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
            console.log(t('skillsTesting.noToken'));
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

        try {
            const response = await fetch(`https://server.riyadah.app/api/search?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();

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

        if (debounceTimeout) clearTimeout(debounceTimeout);

        const timeout = setTimeout(() => {
            if (text.trim().length >= 3) {
                search(text);
            } else {
                setSearchResults([]);
            }
        }, 500);

        setDebounceTimeout(timeout);
    };

    const fetchUser = async () => {
        const token = await SecureStore.getItemAsync('userToken');

        if (token) {
            const decodedToken = jwtDecode(token);
            setUserId(decodedToken.userId);

            const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
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
            const response = await fetch(`https://server.riyadah.app/api/users/${accountId}`);

            if (response.ok) {
                const userData = await response.json();
                setSelectedUser(userData);

                if (userData.type != "Athlete") {
                    setError(t('skillsTesting.selectedUserNotAthlete'));
                } else {
                    setError("");

                    const testResponse = await fetch(`https://server.riyadah.app/api/test/user/${userData._id}`);

                    if (testResponse.ok) { // ✅ fixed
                        const testData = await testResponse.json();
                        setSelectedUserTest(testData.test);
                        const grouped = groupSkills(testData.test?.results || []);
                        setPreviouslyTestedSkills(grouped);
                    } else {
                        setSelectedUserTest(null);
                        setPreviouslyTestedSkills({});
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

    const groupSkills = (results) => {
        return results.reduce((acc, item) => {
            if (!acc[item.testedSkill]) {
                acc[item.testedSkill] = [];
            }
            acc[item.testedSkill].push(item);
            return acc;
        }, {});
    };

    const handleCancelAccountSelection = () => {
        setSelectedAccount('');
        setSelectedUser(null);
        setSelectedUserTest(null);
        setError('');
        setAddNewResultsModalVisible(false);
        setTestedSkills([]);
    }

    // ✅ add a new empty row (for NEW skill)
    const addSkillRow = () => {
        setTestedSkills(prev => [...prev, { testedSkill: "", score: "" }]);
    };

    // ✅ remove a row
    const removeSkillRow = (index) => {
        setTestedSkills(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitTestResults = async () => {
        setLoadingSubmittingTest(true); // ✅ fixed

        try {
            const nowdate = new Date();

            const dynamicResults = testedSkills
                .filter(s => s.testedSkill.trim() !== "" && s.score !== "")
                .map(s => ({
                    testedSkill: s.testedSkill.trim(),
                    score: Number(s.score),
                    date: nowdate
                }));

            const test = {
                testedSubject: selectedAccount,
                lastTested: nowdate,
                results: dynamicResults
            }

            console.log("Submitting test data:", test);

            const response = await fetch(`https://server.riyadah.app/api/test/add-result/${selectedUser._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // keep your payload style
                body: JSON.stringify({ testData: test }),
            });

            if (response.ok) {
                console.log("Submitted test results successfully");
                setAddNewResultsModalVisible(false);
                setTestedSkills([]);
                // refresh user test
                handleAccountSelected(selectedUser._id);
            } else {
                console.error("Couldn't submit test results");
            }
        } catch (error) {
            console.error('Failed to submit test results:', error);
        } finally {
            setLoadingSubmittingTest(false);
        }
    }

    const handleOpenAddResults = () => {
        // Prefill a row for each existing skill so you can add a NEW record under it
        const existingSkillNames = previouslyTestedSkills
            ? Object.keys(previouslyTestedSkills)
            : [];
        const prefilledRows =
            existingSkillNames.length > 0
                ? existingSkillNames.map(name => ({ testedSkill: name, score: "" }))
                : [];

        // Always add one empty row to allow new skill
        setTestedSkills([...prefilledRows, { testedSkill: "", score: "" }]);
        setAddNewResultsModalVisible(true);
    }

    return (
        <KeyboardAvoidingView style={[styles.container, { flex: 1 }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
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
                <Text style={{marginBottom:5,fontFamily:'Qatar',fontSize:14, textAlign: isRTL ? 'right' : 'left'}}>
                    {t('skillsTesting.testedSubject')}
                </Text>
                <TextInput
                    style={[styles.input, Platform.OS === 'ios' && { padding: 15 }, isRTL && styles.rtlText]}
                    value={keyword}
                    onChangeText={handleSearchInput}
                    placeholderTextColor={'#888888'}
                    placeholder={t('skillsTesting.searchPlaceholder')}
                />

                {searching &&
                    <ActivityIndicator
                        size="small"
                        color="#FF4000"
                        style={styles.searchLoader}
                    />
                }
            </View>}

            {/* {selectedAccount == '' && <View style={styles.filters}>
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
            </View>} */}

            <ScrollView>
                {selectedAccount == '' && <View>
                    {(activeTab === 'All' || activeTab === 'Athletes') && searchResults.users?.athlete?.length > 0 && (
                        <View style={styles.searchResultsContainer}>
                            <Text style={styles.sectionTitle}>
                                {getSectionLabel('athlete', searchResults.users.athlete.length)}
                            </Text>
                            {searchResults.users.athlete.map(user => (
                                <TouchableOpacity
                                    key={user._id}
                                    style={[styles.searchResultsItem, isRTL && styles.searchResultsItemRtl]}
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
                                        <Text style={[styles.name, isRTL && styles.rtlText]}>{user.name}</Text>
                                        {user.sport && <Text style={[styles.role, isRTL && styles.rtlText]}>{user.sport}</Text>}
                                    </View>

                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {(activeTab === 'All' || activeTab === 'Clubs') && searchResults.users?.club?.length > 0 && (
                        <View style={styles.searchResultsContainer}>
                            <Text style={styles.sectionTitle}>
                                {getSectionLabel('club', searchResults.users.club.length)}
                            </Text>
                            {searchResults.users.club.map(user => (
                                <TouchableOpacity
                                    key={user._id}
                                    style={[styles.searchResultsItem, isRTL && styles.searchResultsItemRtl]}
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
                                        <Text style={[styles.name, isRTL && styles.rtlText]}>{user.name}</Text>
                                        {user.sport && <Text style={[styles.role, isRTL && styles.rtlText]}>
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
                                {getSectionLabel('association', searchResults.users.association.length)}
                            </Text>
                            {searchResults.users.association.map(user => (
                                <TouchableOpacity
                                    key={user._id}
                                    style={[styles.searchResultsItem, isRTL && styles.searchResultsItemRtl]}
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
                                        <Text style={[styles.name, isRTL && styles.rtlText]}>{user.name}</Text>
                                        {user.sport && <Text style={[styles.role, isRTL && styles.rtlText]}>
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
                                {getSectionLabel('coach', searchResults.users.coaches.length)}
                            </Text>
                            {searchResults.users.coaches.map(user => (
                                <TouchableOpacity
                                    key={user._id}
                                    style={[styles.searchResultsItem, isRTL && styles.searchResultsItemRtl]}
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
                                        <Text style={[styles.name, isRTL && styles.rtlText]}>{user.name}</Text>
                                        {user.sport && <Text style={[styles.role, isRTL && styles.rtlText]}>{user.sport}</Text>}
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

                    <TouchableOpacity onPress={() => { handleCancelAccountSelection() }} style={{marginBottom: 30,flexDirection: isRTL ? 'row-reverse' : 'row',alignItems:'center',gap:10  }}>
                        <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={20} color="black" />
                        <Text style={{fontFamily:'Qatar', textAlign: isRTL ? 'right' : 'left'}}>
                            {t('skillsTesting.backToSearch')}
                        </Text>
                    </TouchableOpacity>

                    <View style={{flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={[styles.label, isRTL && styles.rtlText]}>{t('skillsTesting.selectedUser')}</Text>
                        <Text style={[styles.selectedUserEmail, isRTL && styles.rtlText]}>{selectedAccount}</Text>
                    </View>
                    <View style={[styles.selectedUserContainer, isRTL && styles.selectedUserContainerRtl]}>
                        <Image
                            source={
                                selectedUser.image != null
                                    ? { uri: selectedUser.image }
                                    : require('../../assets/avatar.png')
                            }
                            style={styles.userAvatar}
                            resizeMode="contain"
                        />
                        <View style={styles.selectedUserInfo}>
                            <Text style={[styles.selectedUserName, isRTL && styles.rtlText]}>{selectedUser.name}</Text>
                            <Text style={[styles.selectedUserEmail, isRTL && styles.rtlText]}>{selectedUser.email}</Text>
                            <Text style={[styles.selectedUserEmail, isRTL && styles.rtlText]}>{[selectedUser.type, selectedUser.role, selectedUser.sport].filter(Boolean).join(' | ')}</Text>
                        </View>
                    </View>

                    {selectedUserTest != null ? (<View style={{ marginTop: 20 }}>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={isRTL ? styles.rtlText : undefined}>{t('skillsTesting.lastUpdated', { date: new Date(selectedUserTest.lastTested).toLocaleDateString(language === 'ar' ? 'ar' : 'en-US') })}</Text>

                            {/* OPEN ADD RESULTS */}
                            {!addNewResultsModalVisible && <TouchableOpacity onPress={handleOpenAddResults} style={styles.addbtn}>
                                <Text style={{ fontWeight: "bold",color:'#fff' }}>{t('skillsTesting.addNewResult')}</Text>
                            </TouchableOpacity>}

                            {/* CLOSE */}
                            {addNewResultsModalVisible && <TouchableOpacity onPress={() => setAddNewResultsModalVisible(false)} style={styles.addbtn}>
                                <Text style={{ fontWeight: "bold",color:'#fff' }}>{t('skillsTesting.cancel')}</Text>
                            </TouchableOpacity>}
                        </View>

                        {/* ADD RESULTS SECTION */}
                        {addNewResultsModalVisible && (
                            <View style={{ padding: 10, marginTop: 10, marginBottom: 20, backgroundColor: "#f4f4f4", borderRadius: 10 }}>

                                <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                                    {t('skillsTesting.newTestResults')}
                                </Text>

                                {testedSkills.map((skill, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            marginBottom: 12
                                        }}
                                    >
                                        {/* Skill input */}
                                        <TextInput
                                            placeholder={t('skillsTesting.skill')}
                                            value={skill.testedSkill}
                                            onChangeText={(text) => {
                                                const updated = [...testedSkills];
                                                updated[index].testedSkill = text;
                                                setTestedSkills(updated);
                                            }}
                                            style={{
                                                flex: 1,
                                                backgroundColor: "#ddd",
                                                padding: 10,
                                                borderRadius: 8,
                                                marginRight: 8
                                            }}
                                        />

                                        {/* Score input */}
                                        <TextInput
                                            placeholder={t('skillsTesting.score')}
                                            value={skill.score}
                                            onChangeText={(text) => {
                                                const updated = [...testedSkills];
                                                updated[index].score = text;
                                                setTestedSkills(updated);
                                            }}
                                            keyboardType="numeric"
                                            style={{
                                                width: 90,
                                                backgroundColor: "#ddd",
                                                padding: 10,
                                                borderRadius: 8,
                                                textAlign: "center",
                                                marginRight: 8
                                            }}
                                        />

                                        {/* Remove row */}
                                        <TouchableOpacity onPress={() => removeSkillRow(index)}>
                                            <Ionicons name="remove-circle" size={18} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    {/* Add new row */}
                                    <TouchableOpacity onPress={addSkillRow} style={styles.addbtn}>
                                        <Text style={{ fontWeight: "bold",color:'#fff' }}>
                                            {t('skillsTesting.addAnotherSkill')}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Submit */}
                                    <TouchableOpacity
                                        onPress={handleSubmitTestResults}
                                        disabled={loadingSubmittingTest}
                                        style={[styles.addbtn, { backgroundColor:'#FF4400',flexDirection: 'row', alignItems: 'center', gap: 5 }]}
                                    >
                                        {loadingSubmittingTest && <ActivityIndicator size="small" color="#fff" />}
                                        <Text style={{ fontWeight: "bold", color: "#fff" }}>
                                            {loadingSubmittingTest ? t('skillsTesting.submitting') : t('skillsTesting.submitResults')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {Object.keys(previouslyTestedSkills).length > 0 ? (
                            Object.entries(previouslyTestedSkills).map(([skillName, entries], idx) => (
                                <View key={idx} style={{ marginTop: 10 }}>
                                    <Text style={{ fontWeight: "bold" }}>
                                        {skillName.toUpperCase()}
                                    </Text>

                                    {entries.map((entry, i) => (
                                        <View
                                            key={i}
                                            style={{
                                                marginLeft: 10,
                                                marginTop: 5,
                                                flexDirection: "row",
                                                gap: 10,
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                backgroundColor: i % 2 === 0 ? "#f4f4f4" : "#dedede",
                                            }}
                                        >
                                            <Text>{new Date(entry.date).toLocaleString()}</Text>
                                            <Text>{entry.score}</Text>
                                        </View>
                                    ))}
                                </View>
                            ))
                        ) : (
                            <Text>{t('skillsTesting.noSkills')}</Text>
                        )}

                    </View>
                    ) : (
                        <Text style={{ marginTop: 20 }}>{t('skillsTesting.noUserData')}</Text>
                    )}

                </View>}
            </ScrollView>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    contentContainer: {
        padding: 20,
        paddingTop:0,
        paddingBottom: 130
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
    logoContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10
    },
    logo: {
        width: 120,
        height: 40,
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

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
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
        borderWidth:1,
        borderColor:'#000',
        color: 'black',
        borderRadius: 10,
        fontFamily: 'Acumin',
    },
    searchLoader: {
        position: 'absolute',
        top: Platform.OS=='ios'? 30 : 40,
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
    searchResultsItemRtl: {
        flexDirection: 'row-reverse',
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
    addbtn: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#000',
    },
    selectedUserContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    selectedUserContainerRtl: {
        flexDirection: 'row-reverse',
    },
    selectedUserInfo: {
        flex: 1,
    },
    selectedUserName: {
        fontFamily: 'Acumin',
        fontWeight: 'bold',
        fontSize: 16,
        color: 'black'
    },
    selectedUserEmail: {
        fontFamily: 'Acumin',
        color: '#666',
        fontSize: 14,
    },
    userAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 10,
        backgroundColor: "#FF4000"
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#444'
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
});
