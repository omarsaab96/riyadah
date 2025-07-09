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
    View,
} from 'react-native';


const { width } = Dimensions.get('window');

interface CreateInventoryProps {
    clubId: string;
    onCreated?: () => void;
}

export default function CreateInventory({ clubId, onCreated }: CreateInventoryProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        itemName: '',
        category: 'Equipment',
        quantity: '',
        unitPrice: '0 USD',
        description: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.userId);

                const response = await fetch(`https://riyadah.onrender.com/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    setUser(user);
                } else {
                    console.error('API error');
                }
                setLoading(false);
            } else {
                console.log("no token");
            }
        };

        fetchUser();
    }, []);

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        if (!userId) {
            Alert.alert('Error', 'User ID is required.');
            return;
        }
        if (!formData.itemName.trim() || !formData.category.trim()) {
            Alert.alert('Validation', 'Item Name and Category are required.');
            return;
        }

        setSaving(true);

        const payload = {
            itemName: formData.itemName.trim(),
            category: formData.category.trim(),
            quantity: Number(formData.quantity) || 0,
            unitPrice: formData.unitPrice,
            description: formData.description.trim(),
            club: userId,
        };

        try {
            const token = await SecureStore.getItemAsync('userToken');

            const response = await fetch('https://riyadah.onrender.com/api/inventory/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Inventory item created successfully!', [
                    { text: 'OK', onPress: () => onCreated && onCreated() }
                ]);
                setFormData({
                    itemName: '',
                    category: '',
                    quantity: '',
                    unitPrice: '',
                    description: '',
                });
            } else {
                throw new Error(data.message || 'Failed to create inventory item');
            }
        } catch (error) {
            console.error('Create Inventory Error:', error);
            Alert.alert('Error', error.message || 'An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.back();
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
                        <Text style={styles.pageTitle}>New Inventory Item</Text>
                        {!loading && <Text style={styles.pageDesc}>Add a new item to your club's inventory</Text>}

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

                    <Text style={styles.ghostText}>Invento</Text>
                </View>

                <ScrollView>
                    {error != '' && <View style={styles.error}>
                        <View style={styles.errorIcon}></View>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>}
                    <View style={styles.contentContainer}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Item Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter item name"
                                value={formData.itemName}
                                onChangeText={(text) => handleChange('itemName', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category *</Text>
                            {/* <TextInput
                                style={styles.input}
                                placeholder="Enter category"
                                value={formData.category}
                                onChangeText={(text) => handleChange('category', text)}
                            /> */}
                            <View style={styles.pickerContainer}>
                                <Picker
                                    style={styles.picker}
                                    selectedValue={formData.category}
                                    onValueChange={(value) => handleChange('category', value)}
                                >
                                    {/* <Picker.Item label="Select a category..." value="" enabled={false} /> */}
                                    <Picker.Item label="Equipment" value="Equipment" />
                                    <Picker.Item label="Uniform" value="Uniform" />
                                    <Picker.Item label="Accessories" value="Accessories" />
                                    <Picker.Item label="Medical supplies" value="Medical supplies" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Quantity</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter quantity"
                                keyboardType="numeric"
                                value={formData.quantity}
                                onChangeText={(text) => handleChange('quantity', text)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Unit Price</Text>
                            <View style={{ flexDirection: 'row', columnGap: 10 }}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Amount"
                                    keyboardType="numeric"
                                    value={formData.unitPrice?.split(' ')[0] || ''}
                                    onChangeText={(text) => {
                                        const amount = text.trim();
                                        const currency = formData.unitPrice?.split(' ')[1] || 'USD';
                                        handleChange('unitPrice', `${amount} ${currency}`);
                                    }}
                                />
                                <View style={[styles.pickerContainer, { flex: 1 }]}>
                                    <Picker
                                        style={styles.picker}
                                        selectedValue={formData.unitPrice?.split(' ')[1] || 'USD'}
                                        onValueChange={(currency) => {
                                            const amount = formData.unitPrice?.split(' ')[0] || '0';
                                            handleChange('unitPrice', `${amount} ${currency}`);
                                        }}
                                    >
                                        <Picker.Item label="USD" value="USD" />
                                        <Picker.Item label="LBP" value="LBP" />
                                        <Picker.Item label="EUR" value="EUR" />
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput style={styles.textarea}
                                placeholder="Enter description"
                                placeholderTextColor="#A8A8A8"
                                value={formData.description || ""}
                                onChangeText={(text) => handleChange('description', text)}
                                multiline={true}
                                blurOnSubmit={false}
                                returnKeyType="default"
                            />
                        </View>

                        <View style={[styles.profileActions, styles.inlineActions]}>
                            <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                                <Text style={styles.profileButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCreate}
                                style={[styles.profileButton, styles.savebtn]}
                                disabled={saving}
                            >
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
    formGroup: {
        marginBottom: 20,
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
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
    ghostText: {
        color: '#ffffff',
        fontSize: 128,
        fontFamily: 'Bebas',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2
    },
    profileActions: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.2)',
        paddingTop: 10
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
    error: {
        backgroundColor: '#FF4000',
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    errorIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginRight: 10,
    },
    errorText: {
        color: '#fff',
        fontFamily: 'Manrope',
        fontSize: 16,
    },
    pickerContainer: {
        overflow: 'hidden',
        borderRadius: 8,
    },
    picker: {
        width: '100%',
        fontFamily: 'Manrope',
        fontSize: 14,
        backgroundColor: '#F4F4F4',
        borderRadius: 8,
    },
});
