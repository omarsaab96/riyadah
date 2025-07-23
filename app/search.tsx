
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
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [searching, setSearching] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [tab, setTab] = useState('All');
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    const search = async (text: string) => {
        setSearching(true);
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            console.log("No token found");
            setSearching(false);
            return;
        }

        try {
            const response = await fetch(`https://riyadah.onrender.com/api/search?keyword=${keyword}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Search results: ", data);
            } else {
                console.error('Search API error');
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setSearching(false);
        }
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

            const response = await fetch(`https://riyadah.onrender.com/api/users/${decodedToken.userId}`, {
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

    return (
        <SafeAreaView style={styles.container}>
            {Platform.OS === 'ios' ? (
                <View style={{ height: 44, backgroundColor: 'white' }} />
            ) : (
                <View style={{ height: 25, backgroundColor: '#FF4000' }} />
            )}

            <StatusBar style="light" />

            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    value={keyword}
                    onChangeText={handleSearchInput}
                    placeholderTextColor={'#888888'}
                    placeholder="Search for athletes, clubs, or events...(Min. 3 characters)"
                />

                {searching &&
                    <ActivityIndicator
                        size="small"
                        color="#FF4000"
                        style={styles.searchLoader}
                    />
                }
            </View>

            {(tab == 'All' || tab == 'Athletes') && <View style={styles.searchResultsContainer}>
                <View style={styles.searchResultsSection}>
                    <Text style={styles.sectionTitle}>Athletes</Text>
                </View>
            </View>}

            {(tab == 'All' || tab == 'Clubs') && <View style={styles.searchResultsContainer}>
                <View style={styles.searchResultsSection}>
                    <Text style={styles.sectionTitle}>Clubs</Text>
                </View>
            </View>}

            {(tab == 'All' || tab == 'Federations') && <View style={styles.searchResultsContainer}>
                <View style={styles.searchResultsSection}>
                    <Text style={styles.sectionTitle}>Federations</Text>
                </View>
            </View>}

            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.replace('/settings')}>
                    <Image source={require('../assets/settings.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/search')}>
                    <Image source={require('../assets/search.png')} style={styles.activeIcon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/landing')}>
                    <Image source={require('../assets/home.png')} style={[styles.icon]} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/notifications')}>
                    <Image source={require('../assets/notifications.png')} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/profile')}>
                    <Image source={require('../assets/profile.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    logoContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10
    },
    logo: {
        width: 120,
        height: 30,
        tintColor: '#111111',
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
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        color: 'black',
        borderRadius: 10,
        fontFamily: 'Manrope'
    },
    searchLoader: {
        position: 'absolute',
        top: '50%',
        right: 30,
        transform: [{ translateY: '-50%' }]
    },
    searchResultsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30
    },
    searchResultsSection: {
        borderWidth: 1
    },
    sectionTitle: {
        fontFamily: 'Bebas',
        color: '#111111',
        fontSize: 18,
        marginBottom: 10,
    }
});