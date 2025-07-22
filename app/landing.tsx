import { FontAwesome, Ionicons } from '@expo/vector-icons';
import MasonryList from '@react-native-seoul/masonry-list';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { jwtDecode } from "jwt-decode";
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';


const { width } = Dimensions.get('window');

export default function Landing() {
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [liking, setLiking] = useState('');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [newPostText, setNewPostText] = useState('');
    const router = useRouter();
    const pageLimit = 5;

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
            const res = await fetch(`https://riyadah.onrender.com/api/posts?page=1&limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setPosts(data);  // Completely replace posts
                setPage(2);      // Reset to page 2
                setHasMore(data.length === 5);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    }, []);

    // Handle like animation
    const handleLike = async (postId: string) => {
        console.log("liking post ID:", postId);
        setLiking(postId)

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
                console.log('Fail')
            }
        } catch (err) {
            console.error('Like error:', err);
        } finally {
            setLiking('');
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    // Render post item
    const renderPost = ({ item }: { item: any }) => {
        console.log(
            "item.likes",
            item.likes,
            item.likes?.length
        );
        const isLiked = userId && item.likes?.some((like: any) => like._id === userId);

        return (
            <View style={styles.postContainer}>
                <View style={styles.postHeader}>
                    <Image source={{ uri: item.created_by.image }} style={styles.avatar} resizeMode="contain" />
                    <View style={styles.postHeaderInfo}>
                        <Text style={styles.postUserName}>{item.created_by.name}</Text>
                        <Text style={styles.postDate}>{formatDate(item.date)}</Text>
                    </View>
                    <TouchableOpacity style={styles.postOptions}>
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
                                {liking == item._id ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FF4000"
                                        style={{ marginBottom: 5 }}
                                    />
                                ) : (
                                    <FontAwesome
                                        name={isLiked ? "heart" : "heart-o"}
                                        size={24}
                                        color={isLiked ? "#FF4000" : "#888888"}
                                    />
                                )}

                            </View>
                            <Text style={styles.postActionText}>
                                {item.likes?.length}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.postActionBtn}>
                            <FontAwesome name="comment-o" size={24} color="#888888" />
                            <Text style={styles.postActionText}>{item.comments}</Text>
                        </View>
                        <View style={[styles.postActionBtn, styles.postActionBtnLast]}>
                            <FontAwesome name="share-square-o" size={24} color="#888888" />
                            <Text style={styles.postActionText}>{item.shares}</Text>
                        </View>
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

    if (loading && posts.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4000" />
            </View>
        );
    }

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

    return (
        <SafeAreaView style={styles.container}>
            {Platform.OS === 'ios' ? (
                <View style={{ height: 44, backgroundColor: 'white' }} />
            ) : (
                <View style={{ height: 25, backgroundColor: '#FF4000' }} />
            )}

            <StatusBar
                style="light"
            />

            <View style={{ paddingBottom: 100 }}>
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
                                        <TouchableOpacity onPress={() => { router.push("/createPost") }}>
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

                            {/* <View style={styles.createPostContainer}>
                                <View style={styles.createPostHeader}>
                                    <Image
                                        source={
                                            user?.image
                                                ? { uri: user.image }
                                                : require('../assets/avatar.png')
                                        }
                                        style={styles.userAvatar}
                                        resizeMode="contain"
                                    />
                                    <TextInput
                                        style={styles.postInput}
                                        placeholder="What's on your mind?"
                                        value={newPostText}
                                        onChangeText={setNewPostText}
                                        placeholderTextColor="#65676b"
                                    />
                                </View>
                                <View style={styles.createPostActions}>
                                    <TouchableOpacity style={styles.createPostButton} onPress={handlePost}>
                                        <Text style={styles.createPostButtonText}>Post</Text>
                                    </TouchableOpacity>
                                </View>
                            </View> */}
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
        </SafeAreaView>
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
        columnGap: 15,
        alignItems: 'center'
    },
    dmBtnImg: {
        width: 20,
        height: 20
    },
    postBtnImg: {
        width: 20,
        height: 20
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
    postText: {
        fontSize: 15,
        lineHeight: 22,
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
    actionText: {
        fontSize: 14,
        marginLeft: 5,
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

});