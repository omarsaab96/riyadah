import { registerForPushNotificationsAsync } from '@/hooks/usePushToken';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFooter, BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import MasonryList from '@react-native-seoul/masonry-list';
import { Buffer } from 'buffer';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { jwtDecode } from "jwt-decode";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    Share, StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const CommentFooter = ({ footerProps, user, submittingComment, onSubmitComment }) => {
    const [newComment, setNewComment] = useState('');

    const handlePress = () => {
        onSubmitComment(newComment);
        setNewComment('');
    };

    return (
        <BottomSheetFooter {...footerProps}>
            <View style={styles.commentInputContainer}>
                <View style={styles.profileImage}>
                    {(user?.image == null || user?.image == "") && (user?.type == "Club" || user?.type == "Association") && <Image
                        source={require('../assets/clublogo.png')}
                        style={styles.profileImageAvatar}
                        resizeMode="contain"
                    />}
                    {(user?.image == null || user?.image == "") && user?.gender == "Male" && <Image
                        source={require('../assets/avatar.png')}
                        style={styles.profileImageAvatar}
                        resizeMode="contain"
                    />}
                    {(user?.image == null || user?.image == "") && user?.gender == "Female" && <Image
                        source={require('../assets/avatarF.png')}
                        style={styles.profileImageAvatar}
                        resizeMode="contain"
                    />}
                    {user?.image != null && <Image
                        source={{ uri: user?.image }}
                        style={styles.profileImageAvatar}
                        resizeMode="contain"
                    />}
                </View>
                <BottomSheetTextInput
                    style={styles.commentInput}
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Write a comment..."
                    placeholderTextColor="#888"
                />
                <TouchableOpacity
                    style={styles.commentSubmit}
                    onPress={handlePress}
                    disabled={!newComment.trim() || submittingComment}
                >
                    {!submittingComment ? (
                        <Ionicons
                            name="send"
                            size={20}
                            color={newComment.trim() ? "#FF4000" : "#888"}
                        />
                    ) : (
                        <ActivityIndicator size={'small'} color="#FF4000" />
                    )}
                </TouchableOpacity>
            </View>
        </BottomSheetFooter>
    );
};

export default function Landing() {
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [liking, setLiking] = useState('');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    // const [newPostText, setNewPostText] = useState('');
    const router = useRouter();
    const pageLimit = 10;

    const [currentPostId, setCurrentPostId] = useState<string | null>(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
    const [content, setContent] = useState('');
    const [media, setMedia] = useState([]);
    const [createLoading, setCreateLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [createdNewPosts, setCreatedNewPosts] = useState([])

    // ref
    const bottomSheetRef = useRef<BottomSheet>(null);
    const moreOptionsRef = useRef<BottomSheet>(null);
    const newPostRef = useRef<BottomSheet>(null);


    // variables
    const snapPoints = useMemo(() => ["50%", "85%"], []);

    const handlePresentModalPress = useCallback(() => {
        bottomSheetRef.current?.snapToIndex(0);
    }, []);
    const handleOpenMoreOptions = useCallback(() => {
        moreOptionsRef.current?.expand();
    }, [selectedPost]);
    const handleOpenNewPostModal = useCallback(() => {
        setCreateLoading(true)
        newPostRef.current?.snapToIndex(0);
        setCreateLoading(false)
    }, []);
    const handleCloseModalPress = useCallback(() => {
        bottomSheetRef.current?.close();
        moreOptionsRef.current?.close();
        newPostRef.current?.close();
    }, []);

    // renders
    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
            />
        ),
        []
    );

    useEffect(() => {
        fetchUser();

        if (posts.length === 0) {
            loadPosts();
        }
    }, []);

    // Load posts
    const loadPosts = useCallback(async () => {
        // Exit early if no more posts or already loading
        if (!hasMore || loading) {
            console.log('Stopping loadPosts - hasMore:', hasMore, 'loading:', loading);
            return;
        }

        setLoading(true);
        // console.log(`Loading page ${page} with limit ${pageLimit}`);

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/posts?page=${page}&limit=${pageLimit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // console.log(`API Response`,data);

                setPosts(prev => {
                    // Merge new posts ensuring no duplicates
                    const merged = [...prev, ...data];
                    // console.log(`Total posts after merge: ${merged.length}`);
                    return merged;
                });

                // More accurate hasMore calculation
                setHasMore(data.length >= pageLimit);
                setPage(prev => prev + 1);
            }
        } catch (err) {
            console.error('Fetch error', err);
        } finally {
            setLoading(false);
        }
    }, [page, hasMore, loading, pageLimit]);

    // Handle refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/posts?page=1&limit=${pageLimit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setPosts(data);  
                setPage(1);      
                setHasMore(data.length === pageLimit);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    }, []);

    // Handle like animation
    const handleLike = async (postId: string) => {
        setCreatedNewPosts(prevPosts =>
            prevPosts.map(post => {
                if (post._id === postId) {
                    const alreadyLiked = post.likes?.some(like => like._id === userId);
                    if (alreadyLiked) {
                        // Unlike: remove userId
                        return {
                            ...post,
                            likes: post.likes.filter(like => like._id !== userId),
                        };
                    } else {
                        // Like: add userId
                        return {
                            ...post,
                            likes: [...(post.likes || []), { _id: userId }],
                        };
                    }
                }
                return post;
            })
        );

        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post._id === postId) {
                    const alreadyLiked = post.likes?.some(like => like._id === userId);
                    if (alreadyLiked) {
                        return {
                            ...post,
                            likes: post.likes.filter(like => like._id !== userId),
                        };
                    } else {
                        return {
                            ...post,
                            likes: [...(post.likes || []), { _id: userId }],
                        };
                    }
                }
                return post;
            })
        );

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/posts/like/${postId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json(); // ✅ parse the response

                if (createdNewPosts.some(post => post._id === postId)) {
                    setCreatedNewPosts(prev => prev.map(post => {
                        if (post._id === postId) {
                            return {
                                ...post,
                                likes: data.likes, // ✅ use parsed data
                            };
                        }
                        return post;
                    }));
                }

                setPosts(prev => prev.map(post => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            likes: data.likes, // ✅ use parsed data
                        };
                    }
                    return post;
                }));
            } else {
                console.log('Failed to like')
            }
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    const handleComment = async (postId: string) => {
        setCurrentPostId(postId);
        setLoadingComments(true);
        handlePresentModalPress()

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/posts/comments/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                console.log('clicked')
                setComments(data.comments || []); // Ensure comments is an array
            }
        } catch (err) {
            console.error('Error loading comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleMoreOptions = async (post: any) => {
        setSelectedPost(post);
        handleOpenMoreOptions();
    };

    const handleSubmitComment = async (commentText: string) => {
        if (!commentText.trim() || !currentPostId) return;
        setSubmittingComment(true)

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/posts/comments/${currentPostId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: commentText })
            });

            if (res.ok) {
                const data = await res.json();
                // console.log(data)
                setComments(data.comments || []); // Ensure comments is an array

                if (createdNewPosts.some(post => post._id === currentPostId)) {
                    setCreatedNewPosts(prev => prev.map(post => {
                        if (post._id === currentPostId) {
                            return {
                                ...post,
                                comments: data.comments, // ✅ use parsed data
                            };
                        }
                        return post;
                    }));
                }
                // Update the post's comment count
                setPosts(prev => prev.map(post => {
                    if (post._id === currentPostId) {
                        return {
                            ...post,
                            comments: data.comments
                        };
                    }
                    return post;
                }));
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
        } finally {
            setSubmittingComment(false)
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);

        if (diffInMinutes < 1) {
            return 'now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    // Render post item
    const renderPost = ({ item }: { item: any }) => {

        const isLiked = userId && item.likes?.some((like: any) => like._id === userId);

        return (
            <View style={styles.postContainer}>
                <View style={styles.postHeader}>
                    {(item.created_by.image == null || item.created_by.image == "") ? (
                        <View style={styles.profileImage}>
                            {item.created_by.gender == "Male" && <Image
                                source={require('../assets/avatar.png')}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />}
                            {item.created_by.gender == "Female" && <Image
                                source={require('../assets/avatarF.png')}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />}
                            {item.created_by.type == "Club" && <Image
                                source={require('../assets/clublogo.png')}
                                style={styles.profileImageAvatar}
                                resizeMode="contain"
                            />}
                        </View>
                    ) : (
                        <Image
                            source={{ uri: item.created_by.image }}
                            style={styles.avatar}
                            resizeMode="contain"
                        />
                    )}

                    <View style={styles.postHeaderInfo}>
                        <Text style={styles.postUserName}>{item.created_by.name}</Text>
                        <Text style={styles.postDate}>{formatDate(item.date)}</Text>
                    </View>

                    <TouchableOpacity onPress={() => handleMoreOptions(item)} style={[styles.postOptions, {}]}>
                        <Ionicons name="ellipsis-horizontal" size={24} color="#888888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.post}>
                    <View style={styles.postContent}>
                        {item.title && <Text style={styles.postTitle}>{item.title}</Text>}
                        {item.content?.trim() !== '' && (
                            <Text style={styles.postText}>{item.content}</Text>
                        )}

                        {/* Render images */}
                        {item.type === 'image' && item.media.images?.length > 0 && (() => {
                            const images = item.media.images;
                            const isMoreThanFour = images.length >= 4;
                            const previewImages = isMoreThanFour ? images.slice(0, 4) : images;

                            return (
                                images.length === 1 ? (
                                    <Image
                                        source={{ uri: images[0] }}
                                        style={[styles.postImage, { marginTop: 10 }]}
                                        resizeMode="cover"
                                        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                    />
                                ) : (
                                    <MasonryList
                                        data={previewImages}
                                        keyExtractor={(uri, index) => uri + index}
                                        numColumns={2}
                                        containerStyle={{ marginTop: 10 }}
                                        style={{ margin: -5 }}
                                        renderItem={({ item: image }) => {
                                            const currentIndex = previewImages.findIndex(img => img === image);
                                            const isLastPreview = isMoreThanFour && currentIndex === 3;

                                            return (
                                                <View
                                                    style={{
                                                        borderRadius: 8,
                                                        overflow: 'hidden',
                                                        margin: 5,
                                                        backgroundColor: 'black',
                                                        position: 'relative',
                                                    }}
                                                >
                                                    <Image
                                                        source={{ uri: image }}
                                                        resizeMode="cover"
                                                        style={{ width: '100%', aspectRatio: 1 }}
                                                    />

                                                    {isLastPreview && (
                                                        <View
                                                            style={{
                                                                position: 'absolute',
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                zIndex: 3,
                                                            }}
                                                        >
                                                            <Text style={{ color: '#fff', fontFamily: 'Bebas', fontSize: 30 }}>
                                                                + {images.length - 3}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        }}
                                    />
                                )
                            );
                        })()}

                        {/* Render videos */}
                        {item.type === 'video' && item.media.videos?.length > 0 && (() => {
                            const videos = item.media.videos;
                            const isMoreThanFour = videos.length >= 4;
                            const previewVideos = isMoreThanFour ? videos.slice(0, 4) : videos;

                            return (
                                videos.length === 1 ? (
                                    <View
                                        style={{
                                            borderRadius: 8,
                                            backgroundColor: 'black',
                                            overflow: 'hidden',
                                            marginTop: 10,
                                            aspectRatio: 1
                                        }}>
                                        {/* <Video
                                            source={{ uri: videos[0] }}
                                            style={{
                                                width: '100%',
                                                aspectRatio: 1,
                                                backgroundColor: 'black',
                                            }}
                                            resizeMode="cover"
                                            isLooping
                                        /> */}

                                        <VideoPlayer
                                            uri={videos[0]}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </View>
                                ) : (
                                    <MasonryList
                                        data={previewVideos}
                                        keyExtractor={(uri, index) => uri + index}
                                        numColumns={2}
                                        containerStyle={{ marginTop: 10 }}
                                        style={{ marginVertical: -5, marginHorizontal: -0, }}
                                        renderItem={({ item: video }) => {
                                            const currentIndex = previewVideos.findIndex(v => v === video);
                                            const isLastPreview = isMoreThanFour && currentIndex === 3;

                                            return (
                                                <View
                                                    style={{
                                                        borderRadius: 8,
                                                        backgroundColor: 'black',
                                                        overflow: 'hidden',
                                                        marginVertical: 5,
                                                        marginHorizontal: 0,
                                                        position: 'relative',
                                                        aspectRatio: 1,
                                                        borderWidth: 1
                                                    }}>
                                                    {/* <Video
                                                        source={{ uri: video }}
                                                        style={{
                                                            width: '100%',
                                                            aspectRatio: 1,
                                                            backgroundColor: 'black',
                                                        }}
                                                        resizeMode="cover"
                                                        isLooping
                                                    /> */}

                                                    <VideoPlayer
                                                        uri={videos[0]}
                                                        style={{ width: '100%', height: '100%' }}
                                                        showFullscreenToggle={true}
                                                    />

                                                    {isLastPreview && (
                                                        <View
                                                            style={{
                                                                position: 'absolute',
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                zIndex: 3,
                                                            }}
                                                        >
                                                            <Text style={{ color: '#fff', fontFamily: 'Bebas', fontSize: 30 }}>
                                                                + {videos.length - 3}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        }}
                                    />
                                )
                            );
                        })()}


                        {/* Render multiple media */}
                        {item.type === 'multipleMedia' && (() => {
                            const images = item.media.images || [];
                            const videos = item.media.videos || [];

                            const allMedia = [
                                ...images.map(uri => ({ uri, type: 'image' })),
                                ...videos.map(uri => ({ uri, type: 'video' }))
                            ];

                            const isMoreThanFour = allMedia.length > 4;
                            const previewMedia = isMoreThanFour ? allMedia.slice(0, 4) : allMedia;

                            return (
                                <MasonryList
                                    data={previewMedia}
                                    keyExtractor={(item, index) => item.uri + index}
                                    numColumns={2}
                                    containerStyle={{ marginTop: 10 }}
                                    style={{ margin: -5 }}
                                    renderItem={({ item }) => {
                                        const currentIndex = previewMedia.findIndex(m => m.uri === item.uri && m.type === item.type);
                                        const isLastPreview = isMoreThanFour && currentIndex === 3;

                                        return (
                                            <View
                                                style={{
                                                    borderRadius: 8,
                                                    backgroundColor: 'black',
                                                    overflow: 'hidden',
                                                    margin: 5,
                                                    position: 'relative',
                                                }}
                                            >
                                                {item.type === 'image' ? (
                                                    <Image
                                                        source={{ uri: item.uri }}
                                                        style={{ width: '100%', aspectRatio: 1 }}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <Video
                                                        source={{ uri: item.uri }}
                                                        style={{ width: '100%', aspectRatio: 1, backgroundColor: 'black' }}
                                                        resizeMode="cover"
                                                        isLooping
                                                    />
                                                )}

                                                {isLastPreview && (
                                                    <View
                                                        style={{
                                                            position: 'absolute',
                                                            width: '100%',
                                                            height: '100%',
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            zIndex: 3,
                                                        }}
                                                    >
                                                        <Text style={{ color: '#fff', fontFamily: 'Bebas', fontSize: 30 }}>
                                                            + {allMedia.length - 3}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    }}
                                />
                            );
                        })()}
                    </View>

                    <View style={styles.postStats}>
                        <TouchableOpacity onPress={() => handleLike(item._id)} style={styles.postActionBtn}>
                            <View>
                                {/* {liking == item._id ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FF4000"
                                        style={{ marginBottom: 5 }}
                                    />
                                ) : ( */}
                                <FontAwesome
                                    name={isLiked ? "heart" : "heart-o"}
                                    size={24}
                                    color={isLiked ? "#FF4000" : "#888888"}
                                />
                                {/* )} */}

                            </View>
                            <Text style={styles.postActionText}>
                                {item.likes?.length}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleComment(item._id)} style={styles.postActionBtn}>
                            <View style={styles.postActionBtn}>
                                <FontAwesome name="comment-o" size={24} color="#888888" />
                                <Text style={styles.postActionText}>{item.comments?.length}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleShare(item._id)} style={[styles.postActionBtn, { marginBottom: 14 }]}>
                            <View style={[styles.postActionBtn, styles.postActionBtnLast]}>
                                <FontAwesome name="share-square-o" size={24} color="#888888" />
                                {/* <Text style={styles.postActionText}></Text> */}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const fetchUser = async () => {
        const token = await SecureStore.getItemAsync('userToken');

        console.log(token)
        if (token) {
            const decodedToken = jwtDecode(token);
            console.log("DECODED token: ", decodedToken)
            setUserId(decodedToken.userId);

            const pushToken = await registerForPushNotificationsAsync(decodedToken.userId, token);
            console.log('Push token from registration function:', pushToken);

            const response = await fetch(`https://riyadah.onrender.com/api/users/${decodedToken.userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });


            if (response.ok) {
                const user = await response.json();
                setUser(user)
            } else {
                console.log(user)
                console.error('Token API error:', response)
            }
            setLoading(false)
        } else {
            console.log("no token",)
        }
    };

    const VideoPlayer = ({ uri, style, showFullscreenToggle = false }: {
        uri: string;
        style: any;
        showFullscreenToggle?: boolean;
    }) => {
        const videoRef = React.useRef<Video>(null);
        const fullscreenVideoRef = React.useRef<Video>(null);
        const [status, setStatus] = React.useState<any>({});
        const [fullscreenStatus, setFullscreenStatus] = React.useState<any>({});
        const [isPlaying, setIsPlaying] = React.useState(false);
        const [duration, setDuration] = React.useState(0);
        const [currentPosition, setCurrentPosition] = React.useState(0);
        const [isFullscreen, setIsFullscreen] = React.useState(false);
        const [showControls, setShowControls] = React.useState(false);

        // Format time from milliseconds to MM:SS
        const formatTime = (millis: number) => {
            if (!millis) return "0:00";
            const totalSeconds = Math.floor(millis / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };

        // Get the time to display (remaining when playing, total when paused)
        const getDisplayTime = () => {
            if (isPlaying) {
                return formatTime(duration - currentPosition);
            }
            return formatTime(duration);
        };

        // Update current position and duration when playback status updates
        const handlePlaybackStatusUpdate = (status: any) => {
            setStatus(status);
            if (status.positionMillis !== undefined) {
                setCurrentPosition(status.positionMillis);
            }
            if (status.durationMillis !== undefined) {
                setDuration(status.durationMillis);
            }
        };

        const handleFullscreenPlaybackStatusUpdate = (status: any) => {
            setFullscreenStatus(status);
            if (status.positionMillis !== undefined) {
                setCurrentPosition(status.positionMillis);
            }
            if (status.durationMillis !== undefined) {
                setDuration(status.durationMillis);
            }
        };

        const togglePlayPause = () => {
            if (isFullscreen) {
                isPlaying ? fullscreenVideoRef.current?.pauseAsync() : fullscreenVideoRef.current?.playAsync();
            } else {
                isPlaying ? videoRef.current?.pauseAsync() : videoRef.current?.playAsync();
            }
            setIsPlaying(!isPlaying);
            setShowControls(true);
        };

        const toggleFullscreen = () => {
            setIsFullscreen(!isFullscreen);
            setShowControls(true);

            // Sync playback state when entering/exiting fullscreen
            if (isFullscreen) {
                // Exiting fullscreen - sync with main player
                videoRef.current?.setPositionAsync(currentPosition);
                if (isPlaying) {
                    videoRef.current?.playAsync();
                }
            } else {
                // Entering fullscreen - sync with fullscreen player
                fullscreenVideoRef.current?.setPositionAsync(currentPosition);
                if (isPlaying) {
                    fullscreenVideoRef.current?.playAsync();
                }
            }
        };

        return (
            <>
                {/* Regular Video Player */}
                <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
                    <View style={style}>
                        <Video
                            ref={videoRef}
                            source={{ uri }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                            isLooping
                            shouldPlay={isPlaying && !isFullscreen}
                            useNativeControls={false}
                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        />

                        {/* Overlay controls */}
                        <View style={[styles.overlay, !showControls && !isPlaying && styles.centerOverlay]}>
                            {/* Play/Pause button */}
                            {(!isPlaying || showControls) && (
                                <TouchableOpacity
                                    onPress={togglePlayPause}
                                    style={styles.playButton}
                                >
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={20}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            )}

                            {showFullscreenToggle && (
                                <TouchableOpacity onPress={toggleFullscreen}
                                    style={{ position: 'absolute', right: 0, top: 0, width: '100%', height: '70%' }}
                                >
                                    {/* <Entypo name="resize-full-screen" size={18} color="white" /> */}
                                </TouchableOpacity>
                            )}

                            {/* Video duration - now shows remaining time when playing */}
                            {(showControls || !isPlaying) && (
                                <View style={styles.bottomBar}>
                                    <Text style={styles.durationText}>
                                        {getDisplayTime()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>

                {/* Fullscreen Modal */}
                <Modal
                    visible={isFullscreen}
                    transparent={true}
                    animationType="slide"
                    supportedOrientations={['portrait', 'landscape']}
                    onRequestClose={toggleFullscreen}
                >
                    <View style={styles.fullscreenContainer}>
                        <Video
                            ref={fullscreenVideoRef}
                            source={{ uri }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                            isLooping
                            shouldPlay={isPlaying}
                            useNativeControls={true}
                            onPlaybackStatusUpdate={handleFullscreenPlaybackStatusUpdate}
                        />

                        {/* Fullscreen controls overlay */}
                        <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
                            <View style={[styles.fullscreenOverlay, !showControls && !isPlaying && styles.centerOverlay]}>

                                {/* Bottom bar with duration and close button */}
                                {(showControls || !isPlaying) && (
                                    <View style={styles.fullscreenBottomBar}>
                                        {/* Play/Pause button */}
                                        {(!isPlaying || showControls) && (
                                            <TouchableOpacity
                                                onPress={togglePlayPause}
                                                style={[styles.playButton, styles.fixedPlayButton]}
                                            >
                                                <Ionicons
                                                    name={isPlaying ? "pause" : "play"}
                                                    size={36}
                                                    color="white"
                                                />
                                            </TouchableOpacity>
                                        )}

                                        <Text style={styles.fullscreenDurationText}>
                                            {getDisplayTime()}
                                        </Text>

                                        <TouchableOpacity onPress={toggleFullscreen}>
                                            <Ionicons
                                                name="contract"
                                                size={36}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </Modal>
            </>
        );
    };

    const handleDeletePost = (id: string) => {
        console.log('clicked delete')
        setDeleteConfirmation(id);
    }

    const handleConfirmDeletePost = async (postid: string) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');

            const res = await fetch(`https://riyadah.onrender.com/api/posts/delete/${postid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            const data = await res.json();

            if (!res.ok) {
                alert(`Error: ${data.message}`);
                return;
            }

            setDeleteConfirmation('');
            setPosts(prevPosts => prevPosts.filter(post => post._id !== postid));
            console.log('Unlinked post:', data.post);
            handleCloseModalPress()

            if (createdNewPosts.some(post => post._id === postid)) {
                const filteredPosts = createdNewPosts.filter(post => post._id !== postid);
                setCreatedNewPosts(filteredPosts);
            }

            // Optionally update UI here (e.g., hide post, update state)
        } catch (err) {
            console.error('Failed to unlink post:', err);
            alert('Something went wrong. Please try again.');
        }
    }

    const handleCancelDeletePost = (id: string) => {
        setDeleteConfirmation('');
    }

    const handleShare = async (postId: string) => {
        const url = `https://riyadah.app/posts/${postId}`;
        try {
            const result = await Share.share({
                message: `Check out this post on Riyadah: ${url}`,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    console.log('Post shared');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing post:', error.message);
        }
    };

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
        if (media.length == 0 && content.trim().length == 0) {
            console.log('empty')
            return;
        }
        setPosting(true);
        try {
            // Upload media files first
            const uploadedMedia = await Promise.all(
                media.map(async (item) => {
                    return await uploadToImageKit(item.uri);
                })
            );

            // Separate by type
            const images = uploadedMedia
                .filter((item) => item.type === 'image' && item.url)
                .map((item) => item.url);

            const videos = uploadedMedia
                .filter((item) => item.type === 'video' && item.url)
                .map((item) => item.url);

            const type = videos.length
                ? (images.length ? 'multipleMedia' : 'video')
                : (images.length ? 'image' : 'text');

            const postData = {
                type,
                content: content.trim(),
                media: { images, videos },
                created_by: userId,
            };

            // console.log('posting: ', postData);

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
                setCreatedNewPosts([result.post, ...createdNewPosts]);
                handleCloseModalPress();
                setPosting(false);
            } else {
                console.error('Failed to create post:', await response.text());

            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const uploadToImageKit = async (uri: string) => {
        try {
            const fileName = uri.split('/').pop() || 'upload';
            const fileExtension = fileName.split('.').pop()?.toLowerCase();
            const mimeType = fileExtension?.match(/mp4|mov|avi|webm|mkv/)
                ? `video/${fileExtension}`
                : `image/${fileExtension}`;

            const formData = new FormData();
            formData.append('file', {
                uri,
                name: fileName,
                type: mimeType,
            } as any);
            formData.append('fileName', fileName);
            formData.append('folder', '/uploads');

            const privateAPIKey = 'private_pdmJIJI6e538/CVmr4CyBdHW2wc=';
            const encodedAuth = Buffer.from(privateAPIKey + ':').toString('base64');

            const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Basic ${encodedAuth}`,
                },
                body: formData,
            });

            if (uploadResponse.ok) {
                const result = await uploadResponse.json();
                return {
                    type: mimeType.startsWith('video') ? 'video' : 'image',
                    url: result.url
                };
            } else {
                console.error('Failed to upload file:', await uploadResponse.text());
                return null;
            }
        } catch (error) {
            console.error('Error uploading to ImageKit:', error);
            return null;
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView>
                {Platform.OS === 'ios' ? (
                    <View style={{ height: 44, backgroundColor: 'white' }} />
                ) : (
                    <View style={{ height: 25, backgroundColor: '#FF4000' }} />
                )}

                <StatusBar style="light" translucent={false} backgroundColor="#FF4000" />

                <View style={{ height: '100%', paddingBottom: 100 }}>
                    <FlatList
                        data={posts}
                        renderItem={renderPost}
                        keyExtractor={item => {
                            return `${item._id}-${item.createdAt || item.date}`;
                        }}
                        ListHeaderComponent={
                            <>
                                <View style={styles.header}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} >
                                        <Image
                                            source={require('../assets/logo_white.png')}
                                            style={styles.logo}
                                            resizeMode="contain"
                                        />
                                        <View style={styles.headerActions}>
                                            <TouchableOpacity
                                                onPress={handleOpenNewPostModal}
                                                style={(createLoading || loading || posts.length === 0)
                                                    ? { opacity: 0.3 }
                                                    : {}}
                                                disabled={(createLoading || loading || posts.length == 0) ? true : false}
                                            >
                                                <Image
                                                    style={styles.postBtnImg}
                                                    source={require('../assets/addPost.png')}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => { router.push("/messages") }}>
                                                <Image
                                                    style={styles.dmBtnImg}
                                                    source={require('../assets/dm.png')}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                </View>

                                {createdNewPosts.length > 0 &&
                                    createdNewPosts.map((newPost, index) => {
                                        const isLiked = userId && newPost.likes?.some((like: any) => like._id === userId);

                                        return (
                                            <View key={index} style={styles.postContainer}>
                                                <View style={styles.postHeader}>
                                                    {(newPost.created_by.image == null || newPost.created_by.image == "") ? (
                                                        <View style={styles.profileImage}>
                                                            {newPost.created_by.gender == "Male" && <Image
                                                                source={require('../assets/avatar.png')}
                                                                style={styles.profileImageAvatar}
                                                                resizeMode="contain"
                                                            />}
                                                            {newPost.created_by.gender == "Female" && <Image
                                                                source={require('../assets/avatarF.png')}
                                                                style={styles.profileImageAvatar}
                                                                resizeMode="contain"
                                                            />}
                                                            {newPost.created_by.type == "Club" && <Image
                                                                source={require('../assets/clublogo.png')}
                                                                style={styles.profileImageAvatar}
                                                                resizeMode="contain"
                                                            />}
                                                        </View>
                                                    ) : (
                                                        <Image
                                                            source={{ uri: newPost.created_by.image }}
                                                            style={styles.avatar}
                                                            resizeMode="contain"
                                                        />
                                                    )}

                                                    <View style={styles.postHeaderInfo}>
                                                        <Text style={styles.postUserName}>{newPost.created_by.name}</Text>
                                                        <Text style={styles.postDate}>{formatDate(newPost.date)}</Text>
                                                    </View>

                                                    <TouchableOpacity onPress={() => handleMoreOptions(newPost)} style={[styles.postOptions, {}]}>
                                                        <Ionicons name="ellipsis-horizontal" size={24} color="#888888" />
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={styles.post}>
                                                    <View style={styles.postContent}>
                                                        {newPost.title && <Text style={styles.postTitle}>{newPost.title}</Text>}
                                                        {newPost.content?.trim() !== '' && (
                                                            <Text style={styles.postText}>{newPost.content}</Text>
                                                        )}

                                                        {/* Render images */}
                                                        {newPost.type === 'image' && newPost.media.images?.length > 0 && (() => {
                                                            const images = newPost.media.images;
                                                            const isMoreThanFour = images.length >= 4;
                                                            const previewImages = isMoreThanFour ? images.slice(0, 4) : images;

                                                            return (
                                                                images.length === 1 ? (
                                                                    <Image
                                                                        source={{ uri: images[0] }}
                                                                        style={[styles.postImage, { marginTop: 10 }]}
                                                                        resizeMode="cover"
                                                                        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                                                    />
                                                                ) : (
                                                                    <MasonryList
                                                                        data={previewImages}
                                                                        keyExtractor={(uri, index) => uri + index}
                                                                        numColumns={2}
                                                                        containerStyle={{ marginTop: 10 }}
                                                                        style={{ margin: -5 }}
                                                                        renderItem={({ item: image }) => {
                                                                            const currentIndex = previewImages.findIndex(img => img === image);
                                                                            const isLastPreview = isMoreThanFour && currentIndex === 3;

                                                                            return (
                                                                                <View
                                                                                    style={{
                                                                                        borderRadius: 8,
                                                                                        overflow: 'hidden',
                                                                                        margin: 5,
                                                                                        backgroundColor: 'black',
                                                                                        position: 'relative',
                                                                                    }}
                                                                                >
                                                                                    <Image
                                                                                        source={{ uri: image }}
                                                                                        resizeMode="cover"
                                                                                        style={{ width: '100%', aspectRatio: 1 }}
                                                                                    />

                                                                                    {isLastPreview && (
                                                                                        <View
                                                                                            style={{
                                                                                                position: 'absolute',
                                                                                                width: '100%',
                                                                                                height: '100%',
                                                                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                                                                justifyContent: 'center',
                                                                                                alignItems: 'center',
                                                                                                zIndex: 3,
                                                                                            }}
                                                                                        >
                                                                                            <Text style={{ color: '#fff', fontFamily: 'Bebas', fontSize: 30 }}>
                                                                                                + {images.length - 3}
                                                                                            </Text>
                                                                                        </View>
                                                                                    )}
                                                                                </View>
                                                                            );
                                                                        }}
                                                                    />
                                                                )
                                                            );
                                                        })()}

                                                        {/* Render videos */}
                                                        {newPost.type === 'video' && newPost.media.videos?.length > 0 && (() => {
                                                            const videos = newPost.media.videos;
                                                            const isMoreThanFour = videos.length >= 4;
                                                            const previewVideos = isMoreThanFour ? videos.slice(0, 4) : videos;

                                                            return (
                                                                videos.length === 1 ? (
                                                                    <View
                                                                        style={{
                                                                            borderRadius: 8,
                                                                            backgroundColor: 'black',
                                                                            overflow: 'hidden',
                                                                            marginTop: 10,
                                                                            aspectRatio: 1
                                                                        }}>
                                                                        {/* <Video
                                            source={{ uri: videos[0] }}
                                            style={{
                                                width: '100%',
                                                aspectRatio: 1,
                                                backgroundColor: 'black',
                                            }}
                                            resizeMode="cover"
                                            isLooping
                                        /> */}

                                                                        <VideoPlayer
                                                                            uri={videos[0]}
                                                                            style={{ width: '100%', height: '100%' }}
                                                                        />
                                                                    </View>
                                                                ) : (
                                                                    <MasonryList
                                                                        data={previewVideos}
                                                                        keyExtractor={(uri, index) => uri + index}
                                                                        numColumns={2}
                                                                        containerStyle={{ marginTop: 10 }}
                                                                        style={{ marginVertical: -5, marginHorizontal: -0, }}
                                                                        renderItem={({ item: video }) => {
                                                                            const currentIndex = previewVideos.findIndex(v => v === video);
                                                                            const isLastPreview = isMoreThanFour && currentIndex === 3;

                                                                            return (
                                                                                <View
                                                                                    style={{
                                                                                        borderRadius: 8,
                                                                                        backgroundColor: 'black',
                                                                                        overflow: 'hidden',
                                                                                        marginVertical: 5,
                                                                                        marginHorizontal: 0,
                                                                                        position: 'relative',
                                                                                        aspectRatio: 1,
                                                                                        borderWidth: 1
                                                                                    }}>
                                                                                    {/* <Video
                                                        source={{ uri: video }}
                                                        style={{
                                                            width: '100%',
                                                            aspectRatio: 1,
                                                            backgroundColor: 'black',
                                                        }}
                                                        resizeMode="cover"
                                                        isLooping
                                                    /> */}

                                                                                    <VideoPlayer
                                                                                        uri={videos[0]}
                                                                                        style={{ width: '100%', height: '100%' }}
                                                                                        showFullscreenToggle={true}
                                                                                    />

                                                                                    {isLastPreview && (
                                                                                        <View
                                                                                            style={{
                                                                                                position: 'absolute',
                                                                                                width: '100%',
                                                                                                height: '100%',
                                                                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                                                                justifyContent: 'center',
                                                                                                alignItems: 'center',
                                                                                                zIndex: 3,
                                                                                            }}
                                                                                        >
                                                                                            <Text style={{ color: '#fff', fontFamily: 'Bebas', fontSize: 30 }}>
                                                                                                + {videos.length - 3}
                                                                                            </Text>
                                                                                        </View>
                                                                                    )}
                                                                                </View>
                                                                            );
                                                                        }}
                                                                    />
                                                                )
                                                            );
                                                        })()}


                                                        {/* Render multiple media */}
                                                        {newPost.type === 'multipleMedia' && (() => {
                                                            const images = newPost.media.images || [];
                                                            const videos = newPost.media.videos || [];

                                                            const allMedia = [
                                                                ...images.map(uri => ({ uri, type: 'image' })),
                                                                ...videos.map(uri => ({ uri, type: 'video' }))
                                                            ];

                                                            const isMoreThanFour = allMedia.length > 4;
                                                            const previewMedia = isMoreThanFour ? allMedia.slice(0, 4) : allMedia;

                                                            return (
                                                                <MasonryList
                                                                    data={previewMedia}
                                                                    keyExtractor={(item, index) => item.uri + index}
                                                                    numColumns={2}
                                                                    containerStyle={{ marginTop: 10 }}
                                                                    style={{ margin: -5 }}
                                                                    renderItem={({ item }) => {
                                                                        const currentIndex = previewMedia.findIndex(m => m.uri === item.uri && m.type === item.type);
                                                                        const isLastPreview = isMoreThanFour && currentIndex === 3;

                                                                        return (
                                                                            <View
                                                                                style={{
                                                                                    borderRadius: 8,
                                                                                    backgroundColor: 'black',
                                                                                    overflow: 'hidden',
                                                                                    margin: 5,
                                                                                    position: 'relative',
                                                                                }}
                                                                            >
                                                                                {item.type === 'image' ? (
                                                                                    <Image
                                                                                        source={{ uri: item.uri }}
                                                                                        style={{ width: '100%', aspectRatio: 1 }}
                                                                                        resizeMode="cover"
                                                                                    />
                                                                                ) : (
                                                                                    <Video
                                                                                        source={{ uri: item.uri }}
                                                                                        style={{ width: '100%', aspectRatio: 1, backgroundColor: 'black' }}
                                                                                        resizeMode="cover"
                                                                                        isLooping
                                                                                    />
                                                                                )}

                                                                                {isLastPreview && (
                                                                                    <View
                                                                                        style={{
                                                                                            position: 'absolute',
                                                                                            width: '100%',
                                                                                            height: '100%',
                                                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                                                            justifyContent: 'center',
                                                                                            alignItems: 'center',
                                                                                            zIndex: 3,
                                                                                        }}
                                                                                    >
                                                                                        <Text style={{ color: '#fff', fontFamily: 'Bebas', fontSize: 30 }}>
                                                                                            + {allMedia.length - 3}
                                                                                        </Text>
                                                                                    </View>
                                                                                )}
                                                                            </View>
                                                                        );
                                                                    }}
                                                                />
                                                            );
                                                        })()}
                                                    </View>

                                                    <View style={styles.postStats}>
                                                        <TouchableOpacity onPress={() => handleLike(newPost._id)} style={styles.postActionBtn}>
                                                            <View>
                                                                <FontAwesome
                                                                    name={isLiked ? "heart" : "heart-o"}
                                                                    size={24}
                                                                    color={isLiked ? "#FF4000" : "#888888"}
                                                                />

                                                            </View>
                                                            <Text style={styles.postActionText}>
                                                                {newPost.likes?.length}
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => handleComment(newPost._id)} style={styles.postActionBtn}>
                                                            <View style={styles.postActionBtn}>
                                                                <FontAwesome name="comment-o" size={24} color="#888888" />
                                                                <Text style={styles.postActionText}>{newPost.comments?.length}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => handleShare(newPost._id)} style={[styles.postActionBtn, { marginBottom: 14 }]}>
                                                            <View style={[styles.postActionBtn, styles.postActionBtnLast]}>
                                                                <FontAwesome name="share-square-o" size={24} color="#888888" />
                                                                {/* <Text style={styles.postActionText}></Text> */}
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })
                                }
                            </>
                        }
                        onEndReached={() => {
                            // Only trigger if we have more posts and aren't already loading
                            if (hasMore && !loading) {
                                loadPosts();
                            }
                        }}
                        onEndReachedThreshold={0.5} // Balanced threshold
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#FF4000']}
                                tintColor="#FF4000"
                            />
                        }
                        ListFooterComponent={
                            <View style={styles.loadingFooter}>
                                {loading && <ActivityIndicator size="large" color="#FF4000" />}
                            </View>
                        }
                    />

                </View>

                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => router.replace('/settings')}>
                        <Image source={require('../assets/settings.png')} style={styles.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/search')}>
                        <Image source={require('../assets/search.png')} style={styles.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/landing')}>
                        <Image source={require('../assets/home.png')} style={[styles.activeIcon]} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/notifications')}>
                        <Image source={require('../assets/notifications.png')} style={styles.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/profile')}>
                        <Image source={require('../assets/profile.png')} style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView >

            {user != null &&
                <>
                    <BottomSheet
                        ref={bottomSheetRef}
                        index={-1}
                        snapPoints={snapPoints}
                        enableDynamicSizing={false}
                        enablePanDownToClose={true}
                        handleIndicatorStyle={{ width: 50, backgroundColor: '#aaa' }}
                        backdropComponent={renderBackdrop}
                        footerComponent={(footerProps) => (
                            <CommentFooter
                                footerProps={footerProps} // pass footer props separately
                                user={user}
                                submittingComment={submittingComment}
                                onSubmitComment={handleSubmitComment}
                            />
                        )}
                        keyboardBehavior="interactive"
                        keyboardBlurBehavior="restore"
                    >
                        <BottomSheetView style={{ backgroundColor: 'white', zIndex: 1 }}>
                            <View style={[styles.commentModalHeader, {}]}>
                                <Text style={styles.commentModalTitle}>Comments</Text>
                                <TouchableOpacity
                                    style={styles.commentModalClose}
                                    onPress={handleCloseModalPress}
                                >
                                    <Ionicons name="close" size={24} color="#888" />
                                </TouchableOpacity>
                            </View>
                        </BottomSheetView>

                        <BottomSheetScrollView
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ paddingHorizontal: 15, marginTop: 50, paddingBottom: 140 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {loadingComments ? (
                                <View style={styles.commentLoading}>
                                    <ActivityIndicator size="large" color="#FF4000" />
                                </View>
                            ) : (
                                comments.length === 0 ? (
                                    <View style={styles.noComments}>
                                        <Text style={styles.noCommentsText}>No comments yet</Text>
                                    </View>
                                ) : (
                                    comments.map((item) => (
                                        <View key={item._id} style={styles.commentItem}>
                                            <View style={styles.profileImage}>
                                                {/* Default avatars */}
                                                {(item.user?.image == null || item.user?.image === '') && item.user?.type === 'Club' && (
                                                    <Image source={require('../assets/clublogo.png')} style={[styles.profileImageAvatar, { transform: [{ translateX: -10 }] }]} resizeMode="contain" />
                                                )}
                                                {(item.user?.image == null || item.user?.image === '') && item.user?.gender === 'Male' && (
                                                    <Image source={require('../assets/avatar.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                                                )}
                                                {(item.user?.image == null || item.user?.image === '') && item.user?.gender === 'Female' && (
                                                    <Image source={require('../assets/avatarF.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                                                )}
                                                {item.user?.image && (
                                                    <Image source={{ uri: item.user.image }} style={styles.profileImageAvatar} resizeMode="contain" />
                                                )}
                                            </View>
                                            <View style={styles.commentContent}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <Text style={styles.commentAuthor}>{item.user.name}</Text>
                                                            <Text style={styles.commentDate}>{formatDate(item.date)}</Text>
                                                        </View>
                                                        <Text style={styles.commentText}>{item.content}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                )
                            )}
                        </BottomSheetScrollView>
                    </BottomSheet>

                    <BottomSheet
                        ref={newPostRef}
                        index={-1}
                        snapPoints={snapPoints}
                        enableDynamicSizing={false}
                        enablePanDownToClose={true}
                        handleIndicatorStyle={{ width: 50, backgroundColor: '#aaa' }}
                        backdropComponent={renderBackdrop}
                    >
                        <BottomSheetView style={{ backgroundColor: 'white', zIndex: 1 }}>
                            <View style={[styles.commentModalHeader, { borderBottomWidth: 0 }]}>
                                <Text style={styles.commentModalTitle}>New Post</Text>
                                <TouchableOpacity
                                    style={styles.commentModalClose}
                                    onPress={handleCloseModalPress}
                                >
                                    <Ionicons name="close" size={24} color="#888" />
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingHorizontal: 10 }}>
                                <View style={styles.newPostContainer}>
                                    <View style={{ flexDirection: 'row' }}>

                                        <View style={[
                                            styles.avatarContainer,
                                            (user.image == null || user.image == "") && { backgroundColor: '#ff4000' }
                                        ]}>
                                            {(user.image == null || user.image == "") && user.type == "Club" && <Image
                                                source={require('../assets/clublogo.png')}
                                                style={styles.postAvatar}
                                                resizeMode="contain"
                                            />}
                                            {(user.image == null || user.image == "") && user.gender == "Male" && <Image
                                                source={require('../assets/avatar.png')}
                                                style={styles.postAvatar}
                                                resizeMode="contain"
                                            />}
                                            {(user.image == null || user.image == "") && user.gender == "Female" && <Image
                                                source={require('../assets/avatarF.png')}
                                                style={styles.postAvatar}
                                                resizeMode="contain"
                                            />}
                                            {user.image != null && <Image
                                                source={{ uri: user.image }}
                                                style={styles.postAvatar}
                                                resizeMode="contain"
                                            />}
                                        </View>


                                        <TextInput
                                            style={styles.textInput}
                                            multiline
                                            placeholder="What's on your mind?"
                                            placeholderTextColor="#A8A8A8"
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

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <TouchableOpacity onPress={handleCloseModalPress} style={[styles.postButton, styles.postSec]}>
                                        <Text style={styles.postSecBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handlePost} style={[styles.postButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }]} disabled={posting}>
                                        {posting && <ActivityIndicator size={'small'} color={'#fff'} />}
                                        <Text style={styles.postBtnText}>Post{posting ? 'ing' : ''}</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </BottomSheetView>
                    </BottomSheet>
                </>
            }

            {selectedPost != null && <BottomSheet
                ref={moreOptionsRef}
                enablePanDownToClose={true}
                handleIndicatorStyle={{ width: 50, backgroundColor: '#aaa' }}
                backdropComponent={renderBackdrop}
            >
                <BottomSheetView style={{
                    flex: 1, paddingBottom: 50
                }}>
                    <View style={{ padding: 20 }}>
                        {selectedPost.created_by._id == userId ? (
                            <TouchableOpacity
                                onPress={() => {
                                    handleCloseModalPress();
                                    router.push('/profile')
                                }
                                }
                                style={styles.profileButton}>
                                <Text style={styles.profileButtonText}>Go to your profile</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => {
                                    handleCloseModalPress();
                                    router.push({
                                        pathname: '/profile/public',
                                        params: { id: selectedPost.created_by._id },
                                    })
                                }}
                                style={styles.profileButton}>
                                <Text style={styles.profileButtonText}>Go to {selectedPost.created_by.name} 's profile</Text>
                            </TouchableOpacity>
                        )
                        }

                        {selectedPost && selectedPost.created_by._id == userId && (
                            <View>
                                {deleteConfirmation == '' && <TouchableOpacity onPress={() => { handleDeletePost(selectedPost._id) }} style={[styles.profileButton, { marginTop: 10 }]}>
                                    <Text style={[styles.profileButtonText, { color: '#FF4000' }]}>Delete post</Text>
                                </TouchableOpacity>}
                                {deleteConfirmation == selectedPost._id &&
                                    <View style={[styles.profileButton, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }]}>
                                        <Text style={[styles.profileButtonText, { color: '#FF4000' }]}>Are you sure?</Text>
                                        <View style={{ flexDirection: 'row', columnGap: 30, alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => handleConfirmDeletePost(selectedPost._id)}
                                                style={[styles.profileButton, { backgroundColor: 'transparent', padding: 0 }]}>
                                                <Text style={[styles.profileButtonText, { textAlign: 'center' }]}>Yes, delete</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => handleCancelDeletePost(selectedPost._id)}
                                                style={[styles.profileButton, { backgroundColor: 'transparent', padding: 0 }]}>
                                                <Text style={[styles.profileButtonText, { textAlign: 'center' }]}>No</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>}
                            </View>
                        )}

                        <TouchableOpacity onPress={() => {
                            handleCloseModalPress();
                            setSelectedPost(null);
                        }
                        } style={[styles.profileButton, { marginTop: 20, backgroundColor: '#111111' }]}>
                            <Text style={[styles.profileButtonText, { textAlign: 'center', color: '#fff' }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheet>
            }
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f4f4f4',
        height: '100%',
    },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    logo: {
        width: 120,
        height: 30,
        tintColor: '#111111',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
    },
    loadingFooter: {
        paddingVertical: 20,
        marginBottom: 50
    },
    headerActions: {
        flexDirection: 'row',
        columnGap: 20,
        alignItems: 'center'
    },
    profileButton: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    profileButtonText: {
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    dmBtnImg: {
        width: 25,
        height: 25
    },
    postBtnImg: {
        width: 25,
        height: 25
    },
    navBar: {
        position: 'absolute',
        bottom: 70,
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
    createPostContainer: {
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 15,
        marginBottom: 10,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    createPostHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: "#FF4000"
    },
    postInput: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: '#050505',
    },
    createPostActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    createPostButton: {
        borderRadius: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    createPostButtonText: {
        fontSize: 18,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    postContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        marginBottom: 10,
        marginHorizontal: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    post: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
    },
    postContent: {
        width: width - 100,
    },
    postStats: {
        width: 30,
    },
    postActionBtn: {
        alignItems: 'center',
        marginBottom: 15,
    },
    postActionBtnLast: {
        marginBottom: 0,
    },
    postActionText: {
        fontFamily: 'Manrope',
        fontSize: 14,
        color: '#888888'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    postAvatar: {
        width: undefined,
        height: '100%',
        maxWidth: 44,
        aspectRatio: 1
    },
    postHeaderInfo: {
        flex: 1,
    },
    postUserName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#050505',
    },
    postDate: {
        fontSize: 12,
        color: '#65676b',
        marginTop: 2,
    },
    postOptions: {
        padding: 5,
    },
    postTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
        color: '#050505',
        fontFamily: 'Manrope'
    },
    postImage: {
        width: '100%',
        height: width * 0.8,
        borderRadius: 8,
    },
    videoContainer: {
        width: '100%',
        marginBottom: 15,
    },
    videoPlaceholder: {
        width: '100%',
        height: width * 0.6,
        backgroundColor: '#000',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentShareStat: {
        flexDirection: 'row',
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    playButton: {
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: 'blue',
        position: 'absolute',
        bottom: 0,
        left: 0
    },
    fixedPlayButton: {
        position: 'relative',
    },
    durationText: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 4,
        borderRadius: 4,
        fontSize: 12,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    centerOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
    },
    fullscreenOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    fullscreenBottomBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 15,
        padding: 10
    },
    fullscreenDurationText: {
        color: 'white',
        fontSize: 18,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    commentModal: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '80%',
    },
    commentModalHandleContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    commentModalHandle: {
        width: 40,
        height: 5,
        borderRadius: 5,
        backgroundColor: '#ccc',
    },
    commentModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    commentModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    commentModalClose: {
        padding: 5,
    },
    commentLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    commentList: {
        flex: 1,
    },
    commentItem: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
    },
    commentAuthor: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
        marginBottom: 3,
        marginRight: 15
    },
    commentText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 3,
    },
    commentDate: {
        fontSize: 12,
        color: '#888',
    },
    noComments: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    noCommentsText: {
        fontSize: 16,
        color: '#888',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 50,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: 'white'
    },
    commentInputAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 18,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 14,
        color: '#333',
    },
    commentSubmit: {
        marginLeft: 10,
        padding: 8,
    },
    profileImage: {
        width: 36,
        height: 36,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#FF4000',
        overflow: 'hidden',
    },
    profileImageAvatar: {
        height: '100%',
        width: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    newPostContainer: {
        backgroundColor: '#f4f4f4',
        borderRadius: 10,
        padding: 5,
        marginBottom: 20
    },
    avatarContainer: {
        width: 50,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    textInput: {
        fontSize: 16,
        minHeight: 100,
        padding: 12,
        borderRadius: 10,
        textAlignVertical: 'top',
        color: 'black'
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
        fontSize: 14,
        marginLeft: 5,
        color: '#150000',
        fontFamily: 'Bebas',
    },
    postButton: {
        backgroundColor: '#000000',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1
    },
    postSec: {
        backgroundColor: '#f4f4f4',
    },
    postBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 18,
        fontFamily: 'Bebas'
    },
    postSecBtnText: {
        color: '#000',
        fontWeight: '600',
        fontSize: 18,
        fontFamily: 'Bebas'
    },
    postText: {
        fontSize: 16,
        lineHeight: 22,
        color: '#050505',
        fontFamily: 'Manrope'
    },
});