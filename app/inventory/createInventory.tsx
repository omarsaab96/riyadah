import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateInventoryProps {
    clubId: string; // Pass the current club id here
    onCreated?: () => void; // optional callback after success
}

export default function CreateInventory({ clubId, onCreated }: CreateInventoryProps) {
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);


    useEffect(() => {
        // forceLogout();
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

    const handleCreate = async () => {
        if (!userId) {
            Alert.alert('Error', 'UserId is required.');
            return;
        }
        if (!itemName.trim() || !category.trim()) {
            Alert.alert('Validation', 'Item Name and Category are required.');
            return;
        }

        setLoading(true);

        const payload = {
            itemName: itemName.trim(),
            category: category.trim(),
            quantity: Number(quantity) || 0,
            unitPrice: Number(unitPrice) || 0,
            description: description.trim(),
            club: userId,  // must be non-null here
        };

        console.log('formdata= ', payload)

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

            console.log(data)

            if (response.ok) {
                Alert.alert('Success', 'Inventory item created successfully!');
                setItemName('');
                setCategory('');
                setQuantity('');
                setUnitPrice('');
                setDescription('');
                onCreated && onCreated();
            } else {
                Alert.alert('Error', data.message || 'Failed to create inventory.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred. Please try again.');
            console.error('Create Inventory Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Inventory Item</Text>

            <TextInput
                placeholder="Item Name *"
                style={styles.input}
                value={itemName}
                onChangeText={setItemName}
            />

            <TextInput
                placeholder="Category *"
                style={styles.input}
                value={category}
                onChangeText={setCategory}
            />

            <TextInput
                placeholder="Quantity"
                style={styles.input}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
            />

            <TextInput
                placeholder="Unit Price"
                style={styles.input}
                keyboardType="numeric"
                value={unitPrice}
                onChangeText={setUnitPrice}
            />

            <TextInput
                placeholder="Description"
                style={[styles.input, { height: 80 }]}
                multiline
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Create Inventory</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        margin: 10,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        marginBottom: 12,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#FF4000',
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
