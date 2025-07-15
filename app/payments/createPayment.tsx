import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
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

export default function AddPayment() {
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [athletes, setAthletes] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [searchindex, setSearchindex] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('0 USD');


    const [payment, setPayment] = useState({
        athleteId: '',
        amount: '',
        description: '',
        dueDate: '',
        status: 'Pending'
    });

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
                setLoading(false)
            } else {
                console.log("no token",)
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        // const fetchAthletes = async () => {
        //     try {
        //         const token = await SecureStore.getItemAsync('userToken');
        //         const response = await fetch(`https://riyadah.onrender.com/api/users/byclub/${userId}`, {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             }
        //         });
        //         const data = await response.json();
        //         if (data.success) {
        //             setAthletes(data.data);
        //             setLoading(false)
        //         }
        //     } catch (error) {
        //         console.error('Error fetching teams:', error);
        //     }
        // };

        // fetchAthletes();
    }, [user]);

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
                searchUsers(text);
            } else {
                setSearchResults([]);
            }
        }, 500); // delay: 500ms

        setDebounceTimeout(timeout);
    };

    const searchUsers = async (text: string) => {
        setSearchindex(1)

        try {
            setSearching(true);
            const token = await SecureStore.getItemAsync('userToken');
            const url = `https://riyadah.onrender.com/api/users/byclub/${userId}?keyword=${encodeURIComponent(text)}`;
            // console.log('Search URL:', url); // 👈 Log the URL being called

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            // console.log('API Response:', data); // 👈 Log the full response

            if (data.success) {
                setSearchResults(data.data);
            } else {
                Alert.alert('Error', 'Failed to search users');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            Alert.alert('Error', 'Failed to search users');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const token = await SecureStore.getItemAsync('userToken');

        try {
            const res = await fetch(`https://riyadah.onrender.com/api/payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payment)
            });

            console.log(res)

            if (!res.ok) throw new Error('Failed to save payment');

            Alert.alert('Success', 'Payment recorded successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUserSelect = (user: any) => {
        setSelectedUser(user)
    };

    const handleClearSelection = () => {
        setSelectedUser(null);
        setKeyword('');
        setSearchResults([])
        setSearchindex(0)
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
                        <Text style={styles.pageTitle}>New Payment</Text>
                        {!loading && <Text style={styles.pageDesc}>Create a new payment for your club</Text>}

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

                    <Text style={styles.ghostText}>Payment</Text>
                </View>

                <ScrollView>
                    <View style={styles.contentContainer}>
                        {error != '' && <View style={styles.error}>
                            <View style={styles.errorIcon}></View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>}

                        {!selectedUser && <View style={styles.inputContainer}>
                            <Text style={styles.label}>Athlete or coach</Text>
                            <View style={styles.formGroup}>
                                <View style={styles.searchContainer}>
                                    <View style={{
                                        marginBottom: 16,
                                        flexDirection: 'row'
                                    }}>
                                        <TextInput
                                            style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                            placeholder="Search by name or email (min. 3 characters)"
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

                                {!searching && !selectedUser && searchResults.length > 0 && (
                                    <View>
                                        <View style={styles.resultsContainer}>
                                            {searchResults.map((item) => (
                                                <TouchableOpacity
                                                    key={item._id}
                                                    style={styles.userItem}
                                                    onPress={() => handleUserSelect(item)}
                                                >
                                                    <Image
                                                        source={
                                                            item.image
                                                                ? { uri: item.image }
                                                                : require('../../assets/avatar.png')
                                                        }
                                                        style={[styles.userAvatar]}
                                                        resizeMode="contain"
                                                    />
                                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <View>
                                                            <Text style={styles.userName}>{item.name}</Text>
                                                            <Text style={styles.userEmail}>{item.email}</Text>
                                                        </View>
                                                        <View>
                                                            <Text style={{ color: '#FF4000' }}>Select</Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {!searching && !selectedUser && searchResults.length == 0 && searchindex > 0 && keyword.trim().length >= 3 && (
                                    <View style={[styles.resultsContainer, { borderWidth: 0 }]}>
                                        <Text style={{ fontFamily: 'Manrope', fontWeight: 'bold' }}>
                                            No results.
                                        </Text>

                                        <Text style={{ fontFamily: 'Manrope', marginBottom: 10 }}>
                                            Looks like the user you are looking for does not have an account on Riyadah.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>}

                        {selectedUser && <View>

                            <Text style={styles.label}>Selected athlete or coach</Text>

                            <View style={styles.selectedUserContainer}>
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
                                    <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
                                    <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.clearSelectionButton}
                                    onPress={handleClearSelection}
                                >
                                    <MaterialIcons name="close" size={20} color="#FF4000" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Amount (USD)</Text>

                                <View style={{ flexDirection: 'row', columnGap: 10 }}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="e.g. 50.00"
                                        keyboardType="numeric"
                                        value={paymentAmount.split(' ')[0] || '0'}
                                        onChangeText={(text) => {
                                            const amount = text.trim();
                                            const currency = paymentAmount.split(' ')[1] || 'USD';
                                            setPaymentAmount(`${amount} ${currency}`)
                                        }}
                                    />
                                    <View style={[styles.pickerContainer, { flex: 1 }]}>
                                        <Picker
                                            style={styles.picker}
                                            selectedValue={paymentAmount.split(' ')[1] || 'USD'}
                                            onValueChange={(currency) => {
                                                const amount = paymentAmount?.split(' ')[0] || '0';
                                                setPaymentAmount(`${amount} ${currency}`)
                                            }}
                                        >
                                            <Picker.Item label="USD" value="USD" />
                                            <Picker.Item label="LBP" value="LBP" />
                                            <Picker.Item label="EUR" value="EUR" />
                                        </Picker>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={styles.input}
                                    value={payment.description}
                                    onChangeText={(val) => setPayment({ ...payment, description: val })}
                                    placeholder="e.g. Registration Fee"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Due Date</Text>
                                <TextInput
                                    style={styles.input}
                                    value={payment.dueDate}
                                    onChangeText={(val) => setPayment({ ...payment, dueDate: val })}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Payment</Text>
                                )}
                            </TouchableOpacity>
                        </View>}
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
    inputContainer: {
        marginBottom: 15
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#444'
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 20,
        color: 'black',
        borderRadius: 10
    },
    pickerContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20,
    },
    picker: {
        width: '100%',
        fontFamily: 'Manrope',
        borderWidth: 0,
        backgroundColor: '#F4F4F4',
    },
    saveButton: {
        backgroundColor: '#FF4000',
        padding: 15,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 20
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold'
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
    contentContainer: {
        padding: 20,
        paddingBottom: 130
    },
    formGroup: {
        marginBottom: 10,
    },
    searchLoader: {
        position: 'absolute',
        top: '50%',
        right: 10,
        transform: [{ translateY: '-50%' }]
    },
    resultsContainer: {

    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userItem: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 5,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    userName: {
        fontFamily: 'Manrope',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userEmail: {
        fontFamily: 'Manrope',
        color: '#666',
        fontSize: 14,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: "#FF4000"
    },
    addStaffAccountBtn: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 10,
        alignSelf: 'flex-start'
    },
    addStaffAccountBtnText: {
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    selectedUserContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    selectedUserInfo: {
        flex: 1,
    },
    selectedUserName: {
        fontFamily: 'Manrope',
        fontWeight: 'bold',
        fontSize: 16,
    },
    selectedUserEmail: {
        fontFamily: 'Manrope',
        color: '#666',
        fontSize: 14,
    },
    clearSelectionButton: {
        marginLeft: 10,
    },
});
