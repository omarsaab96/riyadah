import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";

import React, { useEffect, useState } from 'react';

import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const CreatePostScreen = () => {
    const [content, setContent] = useState('');
    const [media, setMedia] = useState([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [posting, setPosting] = useState(false);

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
                setCreateLoading(false)
            } else {
                console.log("no token",)
            }
        };
        fetchUser();
    }, []);

    const pickMedia = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access media library is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const selected = result.assets || [result];
            setMedia([...media, ...selected]);
        }
    };

    const handlePost = async () => {
        setPosting(true);
        try {
            // Upload media files first
            const uploadedMediaUrls = await Promise.all(
                media.map(async (item) => {
                    if (item.type?.includes('video') || item.uri?.endsWith('.mp4')) {
                        // Upload video to api.video
                        return await uploadVideoToApiVideo(item.uri);
                    } else {
                        // Upload image to bbimg
                        return await uploadImageToBbimg(item.uri);
                    }
                })
            );

            // Filter out any failed uploads
            const successfulUploads = uploadedMediaUrls.filter(url => url !== null);

            // Prepare the post data
            const postData = {
                content,
                media: successfulUploads,
                userId
            };

            // Send the post to your backend
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch('https://riyadah.onrender.com/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Post created successfully:', result);
                // Reset form after successful post
                setContent('');
                setMedia([]);
                // You might want to navigate away or show a success message
            } else {
                console.error('Failed to create post:', await response.text());
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setPosting(false);
        }
    };

    const uploadImageToBbimg = async (uri: string) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const base64 = await blobToBase64(blob);

            const IMGBB_API_KEY = '19502061a9826ed492f9746cbb1fedec';

            const uploadResponse = await fetch(`https://api.imgbb.com/1/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `key=${IMGBB_API_KEY}&image=${encodeURIComponent(base64)}`
            });

            if (uploadResponse.ok) {
                const result = await uploadResponse.json();
                console.log('Image uploaded successfully:', result);
                return result.data.url; // this is the direct image URL
            } else {
                console.error('Failed to upload image:', await uploadResponse.text());
                return null;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                const base64data = reader.result?.toString().split(',')[1];
                resolve(base64data || '');
            };
            reader.readAsDataURL(blob);
        });
    };

    // Helper function to upload video to api.video
    const uploadVideoToApiVideo = async (uri: string) => {
        try {
            // First create a video container
            const createResponse = await fetch('https://ws.api.video/videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_API_VIDEO_TOKEN'
                },
                body: JSON.stringify({
                    title: `User Video - ${new Date().toISOString()}`,
                    description: 'Uploaded from Riyadah app'
                })
            });

            if (!createResponse.ok) {
                console.error('Failed to create video container:', await createResponse.text());
                return null;
            }

            const videoContainer = await createResponse.json();
            const uploadUrl = videoContainer.assets?.upload;
            const videoId = videoContainer.videoId;

            if (!uploadUrl) {
                console.error('No upload URL in response');
                return null;
            }

            // Get the file as blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Upload the video file
            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: createFormData(blob, 'file')
            });

            if (uploadResponse.ok) {
                // Return the playback URL or video ID as needed
                return `https://embed.api.video/vod/${videoId}`;
            } else {
                console.error('Failed to upload video:', await uploadResponse.text());
                return null;
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            return null;
        }
    };

    // Helper function to create FormData
    const createFormData = (file: Blob, fieldName: string) => {
        const formData = new FormData();
        formData.append(fieldName, file);
        return formData;
    };

    return (
        <ScrollView style={styles.container}>

            {user && <>
                <View style={styles.newPostContainer}>
                    <View style={{ flexDirection: 'row' }}>

                        <View style={[
                            styles.avatarContainer,
                            (user.image == null || user.image == "") && { backgroundColor: '#ff4000' }
                        ]}>
                            {(user.image == null || user.image == "") && user.gender == "Male" && <Image
                                source={require('../assets/avatar.png')}
                                style={styles.avatar}
                                resizeMode="contain"
                            />}
                            {(user.image == null || user.image == "") && user.gender == "Female" && <Image
                                source={require('../assets/avatarF.png')}
                                style={styles.avatar}
                                resizeMode="contain"
                            />}
                            {user.image != null && <Image
                                source={{ uri: user.image }}
                                style={styles.avatar}
                                resizeMode="contain"
                            />}
                        </View>


                        <TextInput
                            style={styles.textInput}
                            multiline
                            placeholder="What's on your mind?"
                            value={content}
                            onChangeText={setContent}
                        />
                    </View>

                    <View style={styles.mediaContainer}>
                        {media.map((item, index) => (
                            <View key={index} style={styles.mediaWrapper}>
                                {item.type?.includes('video') || item.uri?.endsWith('.mp4') ? (
                                    <Video
                                        source={{ uri: item.uri }}
                                        rate={1.0}
                                        volume={1.0}
                                        isMuted={true}
                                        resizeMode="cover"
                                        shouldPlay={false}
                                        style={styles.media}
                                    />
                                ) : (
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={styles.media}
                                    />
                                )}

                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() =>
                                        setMedia((prev) => prev.filter((_, i) => i !== index))
                                    }
                                >
                                    <Ionicons name="close-circle" size={22} color="red" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={pickMedia} style={styles.actionBtn}>
                            <Ionicons name="images" size={22} color="#000000" />
                            <Text style={styles.actionText}>Photo/Video</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity onPress={handlePost} style={styles.postButton}>
                    <Text style={styles.postText}>Post</Text>
                </TouchableOpacity>
            </>}

        </ScrollView>
    );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '600',
    },
    mediaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    media: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 8,
    },
    mediaWrapper: {
        position: 'relative',
        marginRight: 8,
        marginBottom: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#fff',
        borderRadius: 12,
        zIndex: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    actionText: {
        marginLeft: 6,
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    postButton: {
        backgroundColor: '#000000',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    postText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    newPostContainer: {
        backgroundColor: '#f4f4f4',
        borderRadius: 10,
        padding: 5,
        marginBottom: 20
    },
    fakeBorderRadius: {
        width: 10,
        height: 10,
        position: 'absolute',
        top: 0,
        left: 70,
    },
    fakeBorderRadiusBottom: {
        top: 70,
        left: 0,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    avatar: {
        width: undefined,
        height: '100%',
        maxWidth: 44,
        aspectRatio: 1
    },
    textInput: {
        fontSize: 16,
        minHeight: 100,
        padding: 12,
        borderRadius: 10,
        textAlignVertical: 'top',
    },
});
