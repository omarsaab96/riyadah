import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { jwtDecode } from "jwt-decode";
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


const { width } = Dimensions.get('window');

// Types
type Post = {
    id: string;
    date: string;
    type: 'text' | 'image' | 'video';
    created_by: {
        id: string;
        name: string;
        avatar: string;
    };
    likes: number;
    comments: number;
    shares: number;
    title: string;
    content: string;
    isLiked: boolean;
};

type User = {
    id: string;
    name: string;
    avatar: string;
};

export default function Landing() {
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [newPostText, setNewPostText] = useState('');
    const router = useRouter();

    // Load posts
    const loadPosts = useCallback(async () => {
        if (!hasMore) return;
        setLoading(true);

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/posts?page=${page}&limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data: Post[] = await res.json();
                setPosts(prev => [...prev, ...data]);
                setPage(prev => prev + 1);
                if (data.length < 5) setHasMore(false);
            } else {
                console.error('Error loading posts');
            }
        } catch (err) {
            console.error('Fetch error', err);
        } finally {
            setLoading(false)
        }
    }, [page, hasMore]);

    // Handle refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/posts?page=1&limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data: Post[] = await res.json();
                setPosts(data);
                setPage(2);
            } else {
                console.error('Refresh error');
            }
        } catch (err) {
            console.error(err);
        }

        setRefreshing(false);
    }, []);

    // Handle like animation
    const handleLike = (postId: string) => {
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    isLiked: !post.isLiked
                };
            }
            return post;
        }));
    };

    // Handle post creation
    const handlePost = () => {
        if (!newPostText.trim() || !user) return;

        const newPost: Post = {
            id: `post-new-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'text',
            created_by: user,
            likes: 0,
            comments: 0,
            shares: 0,
            title: 'New Post',
            content: newPostText,
            isLiked: false,
        };

        setPosts(prev => [newPost, ...prev]);
        setNewPostText('');
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
    const renderPost = ({ item }: { item: Post }) => {
        const likeAnimation = new Animated.Value(item.isLiked ? 1 : 0);

        const animateLike = () => {
            handleLike(item.id);

            Animated.sequence([
                Animated.spring(likeAnimation, {
                    toValue: 1.2,
                    friction: 2,
                    useNativeDriver: true,
                }),
                Animated.spring(likeAnimation, {
                    toValue: 1,
                    friction: 2,
                    useNativeDriver: true,
                }),
            ]).start();
        };

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

                        {item.type === 'text' && (
                            <Text style={styles.postText}>{item.content}</Text>
                        )}

                        {item.type === 'image' && (
                            <Image source={{ uri: item.content }} style={styles.postImage} resizeMode="cover" />
                        )}

                        {item.type === 'video' && (
                            <View style={styles.videoContainer}>
                                <View style={styles.videoPlaceholder}>
                                    <MaterialIcons name="play-circle-outline" size={50} color="white" />
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.postStats}>
                        <View style={styles.postActionBtn}>
                            <FontAwesome name="heart-o" size={24} color="#888888" />
                            <Text style={styles.postActionText}>
                                {item.likes}
                            </Text>
                        </View>
                        <View style={styles.postActionBtn}>
                            <FontAwesome name="comment-o" size={24} color="#888888" />
                            <Text style={styles.postActionText}>
                                {item.comments}
                            </Text>
                        </View>
                        <View style={[styles.postActionBtn, styles.postActionBtnLast]}>
                            <FontAwesome name="share-square-o" size={24} color="#888888" />
                            <Text style={styles.postActionText}>
                                {item.shares}
                            </Text>
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

    useEffect(() => {
        fetchUser();
        loadPosts();
    }, []);

    if (loading && posts.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4000" />
            </View>
        );
    }

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
                    keyExtractor={item => item._id}
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
                    onEndReached={loadPosts}
                    onEndReachedThreshold={2.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#FF4000']}
                            tintColor="#FF4000"
                        />
                    }
                    ListFooterComponent={
                        loading ? (
                            <View style={styles.loadingFooter}>
                                <ActivityIndicator size="large" color="#FF4000" />
                            </View>
                        ) : null
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
        marginBottom: 15,
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
});