import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const router = useRouter();

export default function UploadAvatar() {
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [localImg, setLocalImg] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.userId);

                const response = await fetch(`https://riyadah.onrender.com/api/users/${decodedToken.userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    console.error('API error');
                }

                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleCancel = () => {
        router.replace('/profile');
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            alert("Permission to access media library is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            setUploading(true);
            const base64 = result.assets[0].base64;
            const base64Length = result.assets[0].base64.length;
            const sizeInMB = (base64Length * (3 / 4)) / (1024 * 1024);

            if (sizeInMB > 2) {
                setError("Image too large. Max 2MB");
                return;
            }

            try {
                const res = await fetch('https://riyadah.onrender.com/api/removeBG', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image: `data:image/png;base64,${base64}`,
                    }),
                });

                const data = await res.json();

                if (res.ok && data.image) {
                    updateField('image', data.image);
                } else {
                    console.error("Failed to remove background:", data);
                    alert("Background removal failed.");
                }

            } catch (err) {
                console.error("Error removing background:", err);
                alert("An error occurred while removing background.");
            } finally {
                setUploading(false);
            }
        }
    };

    const updateField = (field, value) => {
        setUser(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !userId) return;

        const response = await fetch(`https://riyadah.onrender.com/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        if (response.ok) {
            router.replace('/profile');
        } else {
            console.error("Failed to update profile");
        }
        setSaving(false);
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
                        <Text style={styles.pageTitle}>
                            {user?.type == "Club" ? 'Upload logo' : 'Upload Avatar'}
                        </Text>
                        {!loading && <Text style={styles.pageDesc}>
                            {user?.type == "Club" ? 'Change your logo' : 'Change your profile picture'}
                        </Text>}
                        {loading && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
                                <ActivityIndicator size="small" color="#ffffff" />
                            </View>
                        )}
                    </View>

                    <Text style={styles.ghostText}>
                        {user?.type == "Club" ? 'Logo' : 'Avatar'}
                    </Text>
                </View>

                {user && !loading && (
                    <ScrollView>
                        <View style={styles.contentContainer}>

                            {/* <Text style={styles.subtitle}>Profile picture</Text> */}

                            {uploading && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5, marginBottom: 20 }}>
                                    <ActivityIndicator size="small" color="#FF4000" />
                                    <Text style={[styles.uploadHint, { marginLeft: 10, paddingTop: 5 }]}>Removing background...</Text>
                                </View>
                            )}

                            {!uploading && (
                                <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                                    {localImg || user?.image ? (
                                        <View>
                                            <Image
                                                source={{ uri: localImg || user.image }}
                                                style={[styles.avatarPreview, , { backgroundColor: '#FF4000' }]}
                                            />
                                            <Text style={styles.uploadHint}>Tap to change image</Text>
                                        </View>
                                    ) : (
                                        <>
                                            <View style={styles.emptyImage}>
                                                <MaterialIcons name="add" size={40} color="#FF4000" />
                                            </View>
                                            <Text style={styles.uploadHint}>Tap to upload new image</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                            {!uploading && (
                                <View style={[styles.profileActions, styles.inlineActions]}>
                                    <TouchableOpacity onPress={handleCancel} style={styles.profileButton}>
                                        <Text style={styles.profileButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSave} style={[styles.profileButton, styles.savebtn]}>
                                        <Text style={styles.profileButtonText}>Save</Text>
                                        {saving && <ActivityIndicator size="small" color="#111" style={styles.saveLoaderContainer} />}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                    </ScrollView>
                )}

                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => router.replace('/settings')}>
                        <Image source={require('../../assets/settings.png')} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.replace('/search')}>
                        <Image source={require('../../assets/search.png')} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.replace('/landing')}>
                        <Image source={require('../../assets/home.png')} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.replace('/notifications')}>
                        <Image source={require('../../assets/notifications.png')} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.replace('/profile')}>
                        <Image source={require('../../assets/profile.png')} style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 130,
    },
    pageHeader: {
        backgroundColor: '#FF4000',
        height: 270,
    },
    logo: {
        width: 150,
        position: 'absolute',
        top: 40,
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
        fontFamily: 'Manrope',
    },
    ghostText: {
        color: '#ffffff',
        fontSize: 128,
        fontFamily: 'Bebas',
        position: 'absolute',
        bottom: 20,
        right: -5,
        opacity: 0.2,
    },
    subtitle: {
        fontSize: 18,
        width: '100%',
        fontFamily: 'Bebas',
        marginBottom: 5,
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
        marginBottom: 10,
    },
    savebtn: {
        flexDirection: 'row',
    },
    profileButtonText: {
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    saveLoaderContainer: {
        marginLeft: 10,
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
    },
    uploadBox: {
        marginBottom: 30,
        // flexDirection:'row'
    },
    avatarPreview: {
        height: 200,
        width: 200,
        borderRadius: 20,
        marginBottom: 5
    },
    uploadHint: {
        fontFamily: 'Manrope',
        marginBottom: 10
    },
    emptyImage: {
        height: 200,
        width: 200,
        borderRadius: 20,
        marginRight: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        marginBottom: 5
    }
});
