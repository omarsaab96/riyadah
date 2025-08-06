import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


const { width } = Dimensions.get('window');
const router = useRouter();


export default function AddChildren() {
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [error, setError] = useState('');
    const [children, setChildren] = useState([]);


    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);
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
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        getChildren();
    }, [user])

    const getChildren = async () => {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !user || !user.children || user.children.length === 0) {
            setLoading(false)
            return;
        }

        try {
            const childData = [];

            for (const childId of user.children) {
                console.log('geting child: ', childId)
                const res = await fetch(`https://riyadah.onrender.com/api/users/${childId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('child: ', res)

                if (res.ok) {
                    const data = await res.json();
                    childData.push(data);
                } else {
                    console.warn(`Failed to fetch child with ID: ${childId}`);
                }
            }

            setChildren(childData);
            setLoading(false)
        } catch (err) {
            console.error('Error fetching children:', err);
        }
    };

    const updateField = (field, value) => {
        const path = field.split('.');
        setUser(prev => {
            const updated = { ...prev };
            let current = updated;

            for (let i = 0; i < path.length - 1; i++) {
                const key = path[i];
                if (!current[key]) current[key] = {};
                current = current[key];
            }

            current[path[path.length - 1]] = value;
            return updated;
        });
    };

    const handleCancel = () => {
        router.replace('/profile');
    }

    const handleSave = async () => {
        setSaving(true)
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        console.log("Saving user: ", JSON.stringify(user))

        const response = await fetch(`https://riyadah.onrender.com/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            console.log("Profile updated successfully");
            router.replace('/profile/editProfile');
        } else {
            console.error("Failed to update profile");
        }
    }

    const handleAddChildren = () => {
        router.replace('/profile/addChildren');
    }

    const handleSearchInput = (text: string) => {
        setKeyword(text);
        if(text.trim().length<3){
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
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/users/search?keyword=${name}&type=Athlete`);

            if (res.ok) {
                const data = await res.json();
                console.log(data)
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

    const handleAddChildToParent = (child: Object) => {
        setUser(prev => {
            const updatedChildren = [...(prev.children || [])];

            const alreadyExists = updatedChildren.some(c => c._id === child._id);
            if (!alreadyExists) {
                updatedChildren.push(child);
                setError('')
            } else {
                setError(`${child.name} is already added as a child`);
            }

            return { ...prev, children: updatedChildren };
        });
    };

    const handleCreateNewAthlete = () => {
        router.push('/profile/parentCreateAthlete');
    }

    return (
        <View>
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
                            <Text style={styles.pageTitle}>Add Children</Text>
                            {!loading && <Text style={styles.pageDesc}>Search for an athlete to add as your child</Text>}

                            {loading &&
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
                                    <ActivityIndicator
                                        size="small"
                                        color="#ffffff"
                                        style={{ transform: [{ scale: 1.25 }] }}
                                    />
                                </View>
                            }
                        </View>

                        <Text style={styles.ghostText}>Children</Text>
                    </View>

                    {user && !loading && <ScrollView>

                        <View style={styles.contentContainer}>
                            {error != '' && <View style={styles.error}>
                                <View style={styles.errorIcon}></View>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>}
                            {user.type == "Parent" && <View style={styles.entity}>
                                <View style={styles.noChildrenView}>
                                    <Text style={[styles.title, { marginBottom: 0 }]}>
                                        Children ({children?.length || 0})
                                    </Text>
                                </View>
                                {children?.length > 0 ? (<View style={styles.childrenList}>
                                    {children.map((child, index) => (
                                        <View key={index} style={styles.childItem}>
                                            <Text>{child.name}</Text>
                                        </View>
                                    ))}
                                </View>) : (
                                    <View>
                                        <Text style={styles.noChildrenText}>No children added yet</Text>
                                    </View>
                                )}
                            </View>}

                            <View style={styles.entity}>
                                <View>
                                    <Text style={styles.title}>
                                        Search
                                    </Text>
                                    <View style={{
                                        marginBottom: 16,
                                    }}>
                                        <TextInput
                                            style={styles.input}
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
                                    </View>
                                </View>

                                {keyword.trim().length >= 3 && !searching && (
                                    <View style={{ marginTop: 10 }}>
                                        {searchResults.length > 0 && !searching &&
                                            searchResults.map((athlete, i) => (
                                                <View key={i} >
                                                    <TouchableOpacity
                                                        style={styles.searchResultItem}
                                                        onPress={() => { handleAddChildToParent(athlete) }}>
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
                                                            <Text style={styles.searchResultItemLink}>+ Add As Child</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            ))
                                        }

                                        {searchResults.length == 0 && !searching && user.type == "Parent" &&
                                            <View>
                                                <Text style={styles.searchNoResultText}>
                                                    No results.{'\n'}Can't find your child's account?
                                                </Text>

                                                <TouchableOpacity style={styles.createChildAccountBtn} onPress={handleCreateNewAthlete}>
                                                    <Text style={styles.createChildAccountBtnText}>Create a New Account</Text>
                                                </TouchableOpacity>
                                            </View>
                                        }

                                        {/* {searchResults.length == 0 && !searching && user.type != "Parent" &&
                                        <View>
                                            <Text style={styles.searchNoResultText}>
                                                No results
                                            </Text>
                                        </View>
                                    } */}
                                    </View>
                                )}
                            </View>

                            <View style={[styles.profileActions, styles.inlineActions]}>
                                <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                                    <Text style={styles.profileButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSave} style={[styles.profileButton, styles.savebtn]}>
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
                    }


                </View >
            </KeyboardAvoidingView>
            
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.replace('/settings')}>
                    <Image source={require('../../assets/settings.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/search')}>
                    <Image source={require('../../assets/search.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/landing')}>
                    <Image source={require('../../assets/home.png')} style={[styles.icon, styles.icon]} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/notifications')}>
                    <Image source={require('../../assets/notifications.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/profile')}>
                    <Image source={require('../../assets/profile.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
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
    entity: {
        marginBottom: 20
    },
    profileProgress: {
        backgroundColor: '#222222',
        padding: 5,
        paddingRight: 10,
        borderTopLeftRadius: 40,
        borderBottomLeftRadius: 40,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    profileProgressPercentage: {
        width: 60,
        height: 60,
        borderRadius: 60,
        borderWidth: 5,
        borderColor: '#FF4000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    profileProgressPercentageText: {
        color: '#FF4000',
        textAlign: 'center',
        fontSize: 24,
        fontFamily: 'Bebas'
    },
    profileProgressTextSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profileProgressText: {
        color: 'white',
        fontFamily: 'Bebas',
        fontSize: 24,
    },
    profileProgressImg: {
        width: 15,
        height: 15,
        objectFit: 'contain',
    },
    title: {
        fontFamily: "Bebas",
        fontSize: 20,
        marginBottom: 10
    },
    subtitle: {
        fontFamily: "Manrope",
        fontSize: 16,
        // fontWeight: 'bold',
        width: '100%',
        textTransform: 'capitalize',
    },
    paragraph: {
        fontFamily: "Manrope",
        fontSize: 16
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
    fullButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    button: {
        flex: 1,
        backgroundColor: '#000000',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'Bebas',
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
    },
    activeIcon: {
        width: 24,
        height: 24,
        tintColor: '#FF4000',
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
    profileButton: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10
    },
    savebtn: {
        flexDirection: 'row'
    },
    profileButtonText: {
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    textarea: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 16,
        color: 'black',
        borderRadius: 10,
        height: 170,
        textAlignVertical: 'top',
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        color: 'black',
        borderRadius: 10
    },
    select: {
        padding: 10
    },
    dobRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    dobInput: {
        flex: 1,
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 10
    },
    dobSeperator: {
        fontSize: 30,
        fontFamily: 'Bebas',
        fontWeight: 'bold',
        color: '#FF4000',
        marginHorizontal: 10
    },
    saveLoaderContainer: {
        marginLeft: 10
    },   
    uploadImage: {
        backgroundColor: '#111111',
        padding: 2,
        paddingRight: 5,
        borderRadius: 10,
        textAlign: 'center',
        // position: 'absolute',
        // bottom: 5,
        // left: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadImageText: {
        color: '#FF4000',
        fontFamily: 'Bebas',
        fontSize: 16,
    },
    childrenList: {

    },
    childItem: {

    },
    noChildrenView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
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
    noChildrenText: {
        marginBottom: 10,
        fontSize: 16,
        fontFamily: 'Manrope'
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
    searchLoader: {
        position: 'absolute',
        top: 15,
        right: 10,
    },
    createChildAccountBtn: {
        backgroundColor: 'transparent'
    },
    createChildAccountBtnText: {
        color: '#FF4000'
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
