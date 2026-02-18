import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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

const SportsManagerScreen = () => {
    const router = useRouter();
    const [sports, setSports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const fetchSports = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch('https://server.riyadah.app/api/sports?includeHidden=true', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setSports(data.data || []);
                setError(null);
            } else {
                setError(data.message || 'Failed to load sports');
            }
        } catch (err) {
            console.error('Failed to load sports', err);
            setError('Failed to load sports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSports();
    }, []);

    const pickIcon = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Please allow access to your photos.');
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 0.7
        });

        if (result.canceled || !result.assets?.length) {
            return null;
        }

        const asset = result.assets[0];
        if (!asset.base64) {
            return null;
        }

        return `data:image/jpeg;base64,${asset.base64}`;
    };

    const handleCreate = async () => {
        if (!newName.trim()) {
            setError('Sport name is required');
            return;
        }

        try {
            setSaving(true);
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch('https://server.riyadah.app/api/sports', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newName.trim(),
                    icon: newIcon
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create sport');
            }

            setNewName('');
            setNewIcon(null);
            setError(null);
            await fetchSports();
        } catch (err: any) {
            setError(err.message || 'Failed to create sport');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateName = async (sportId: string) => {
        if (!editName.trim()) {
            setError('Sport name is required');
            return;
        }

        try {
            setSaving(true);
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch(`https://server.riyadah.app/api/sports/${sportId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: editName.trim() })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update sport');
            }

            setEditingId(null);
            setEditName('');
            setError(null);
            await fetchSports();
        } catch (err: any) {
            setError(err.message || 'Failed to update sport');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleVisibility = async (sport: any) => {
        try {
            setSaving(true);
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch(`https://server.riyadah.app/api/sports/${sport._id}/visibility`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isVisible: !sport.isVisible })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update visibility');
            }

            setError(null);
            await fetchSports();
        } catch (err: any) {
            setError(err.message || 'Failed to update visibility');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (sportId: string) => {
        Alert.alert('Delete sport', 'Are you sure you want to delete this sport?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setSaving(true);
                        const token = await SecureStore.getItemAsync('userToken');
                        const response = await fetch(`https://server.riyadah.app/api/sports/${sportId}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const data = await response.json();
                        if (!response.ok) {
                            throw new Error(data.message || 'Failed to delete sport');
                        }
                        setError(null);
                        await fetchSports();
                    } catch (err: any) {
                        setError(err.message || 'Failed to delete sport');
                    } finally {
                        setSaving(false);
                    }
                }
            }
        ]);
    };

    const handleChangeIcon = async (sportId: string) => {
        const icon = await pickIcon();
        if (!icon) return;

        try {
            setUploadingId(sportId);
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch(`https://server.riyadah.app/api/sports/${sportId}/icon`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ icon })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload icon');
            }

            setError(null);
            await fetchSports();
        } catch (err: any) {
            setError(err.message || 'Failed to upload icon');
        } finally {
            setUploadingId(null);
        }
    };

    const handlePickNewIcon = async () => {
        const icon = await pickIcon();
        if (icon) {
            setNewIcon(icon);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.pageHeader}>
                    <TouchableOpacity
                        onPress={() => router.replace('/manager/dashboard')}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={20} color="#ffffff" />
                        <Text style={styles.backBtnText}>Back to dashboard</Text>
                    </TouchableOpacity>

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.pageTitle}>Sports Manager</Text>
                        <Text style={styles.pageDesc}>Create, edit, and manage sports</Text>
                    </View>

                    <Text style={styles.ghostText}>Sports</Text>
                </View>

                <ScrollView>
                    <View style={styles.contentContainer}>
                        {error && (
                            <View style={styles.error}>
                                <View style={styles.errorIcon}></View>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Add New Sport</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Sport name"
                                placeholderTextColor="#888"
                                value={newName}
                                onChangeText={setNewName}
                            />

                            <View style={styles.iconRow}>
                                <View style={styles.iconPreview}>
                                    {newIcon ? (
                                        <Image source={{ uri: newIcon }} style={styles.iconImage} />
                                    ) : (
                                        <Image source={require('../../assets/athlete.png')} style={styles.iconImage} />
                                    )}
                                </View>
                                <TouchableOpacity style={styles.secondaryButton} onPress={handlePickNewIcon}>
                                    <Text style={styles.secondaryButtonText}>Upload Icon</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.primaryButton} onPress={handleCreate} disabled={saving}>
                                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Create Sport'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>All Sports</Text>
                            {loading && (
                                <ActivityIndicator size="small" color="#FF4000" />
                            )}
                            {!loading && sports.length === 0 && (
                                <Text style={styles.emptyText}>No sports found.</Text>
                            )}
                            {!loading && sports.map((sport) => (
                                <View key={sport._id} style={styles.sportCard}>
                                    <View style={styles.cardHeader}>
                                        <Image
                                            source={sport.icon ? { uri: sport.icon } : require('../../assets/athlete.png')}
                                            style={styles.cardIcon}
                                        />
                                        {editingId === sport._id ? (
                                            <TextInput
                                                style={styles.cardInput}
                                                value={editName}
                                                onChangeText={setEditName}
                                            />
                                        ) : (
                                            <Text style={styles.cardTitle}>{sport.name}</Text>
                                        )}
                                    </View>
                                    <Text style={styles.cardSubTitle}>
                                        {sport.isVisible ? 'Visible' : 'Hidden'}
                                    </Text>
                                    <View style={styles.cardActions}>
                                        {editingId === sport._id ? (
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => handleUpdateName(sport._id)}
                                            >
                                                <Text style={styles.actionButtonText}>Save</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => {
                                                    setEditingId(sport._id);
                                                    setEditName(sport.name);
                                                }}
                                            >
                                                <Text style={styles.actionButtonText}>Edit</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleToggleVisibility(sport)}
                                        >
                                            <Text style={styles.actionButtonText}>{sport.isVisible ? 'Hide' : 'Show'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleChangeIcon(sport._id)}
                                        >
                                            <Text style={styles.actionButtonText}>
                                                {uploadingId === sport._id ? 'Uploading...' : 'Icon'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.dangerButton]}
                                            onPress={() => handleDelete(sport._id)}
                                        >
                                            <Text style={[styles.actionButtonText, styles.dangerText]}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 220,
    },
    headerTextBlock: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: width - 40,
    },
    pageTitle: {
        color: '#ffffff',
        fontFamily: 'Qatar',
        fontSize: 30,
    },
    pageDesc: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Acumin'
    },
    ghostText: {
        color: '#ffffff',
        fontSize: 100,
        textTransform: 'uppercase',
        fontFamily: 'Qatar',
        position: 'absolute',
        bottom: 10,
        right: -5,
        opacity: 0.2
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 10,
        width: 200,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Qatar'
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
    section: {
        marginBottom: 30
    },
    sectionTitle: {
        fontFamily: 'Qatar',
        fontSize: 20,
        color: '#111',
        marginBottom: 10,
    },
    input: {
        fontSize: 14,
        padding: 15,
        backgroundColor: '#F4F4F4',
        marginBottom: 12,
        color: 'black',
        borderRadius: 10
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    iconPreview: {
        width: 60,
        height: 60,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f4f4f4',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconImage: {
        width: 50,
        height: 50,
        resizeMode: 'contain'
    },
    primaryButton: {
        backgroundColor: '#FF4000',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center'
    },
    primaryButtonText: {
        color: '#fff',
        fontFamily: 'Qatar',
        fontSize: 16
    },
    secondaryButton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14
    },
    secondaryButtonText: {
        fontFamily: 'Qatar',
        fontSize: 14,
        color: '#150000'
    },
    emptyText: {
        fontFamily: 'Acumin',
        color: '#666',
        fontStyle: 'italic'
    },
    sportCard: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        marginRight: 12
    },
    cardTitle: {
        fontFamily: 'Qatar',
        fontSize: 18,
        color: '#111'
    },
    cardInput: {
        flex: 1,
        fontSize: 16,
        backgroundColor: '#F4F4F4',
        padding: 8,
        borderRadius: 8,
        color: '#111'
    },
    cardSubTitle: {
        fontFamily: 'Acumin',
        color: '#666',
        marginBottom: 8
    },
    cardActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    actionButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#fff'
    },
    actionButtonText: {
        fontFamily: 'Acumin',
        color: '#111'
    },
    dangerButton: {
        borderColor: '#f2b3b3'
    },
    dangerText: {
        color: '#c0392b'
    }
});

export default SportsManagerScreen;
