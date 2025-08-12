import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { jwtDecode } from "jwt-decode";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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
export default function messages() {
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [chats, setChats] = useState([]);

    const [hasMore, setHasMore] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
    const router = useRouter();
    const pageLimit = 10;
    const moreOptionsRef = useRef<BottomSheet>(null);

    const handleOpenMoreOptions = useCallback(() => {
        moreOptionsRef.current?.expand();
    }, [selectedChat]);

    const handleCloseModalPress = useCallback(() => {
        moreOptionsRef.current?.close();
    }, []);

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

        if (chats.length === 0) {
            loadChats();
        }
    }, []);

    // Load posts
    const loadChats = useCallback(async () => {
        // Exit early if no more posts or already loading
        if (!hasMore || loading) {
            console.log('Stopping loadPosts - hasMore:', hasMore, 'loading:', loading);
            return;
        }

        setLoading(true);
        // console.log(`Loading page ${page} with limit ${pageLimit}`);

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/chats?page=${page}&limit=${pageLimit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // console.log(`API Response`,data);

                setChats(prev => {
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
            const res = await fetch(`https://riyadah.onrender.com/api/chats?page=1&limit=${pageLimit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setChats(data);  // Completely replace posts
                setPage(1);
                setHasMore(data.length === pageLimit);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const handleMoreOptions = async (post: any) => {
        setSelectedChat(post);
        handleOpenMoreOptions();
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

    // Render chat item
    const renderChat = ({ item }: { item: any }) => (
        <View style={styles.chatContainer}>
            <View style={styles.chatContent}>
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

                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatUserName}>{item.created_by.name}</Text>
                        <Text style={styles.chatDate}>{formatDate(item.date)}</Text>
                    </View>
                    <Text style={styles.lastReply}>Last reply</Text>
                </View>

                <TouchableOpacity onPress={() => handleMoreOptions(item)} style={[styles.postOptions, {}]}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#888888" />
                </TouchableOpacity>
            </View>
        </View>
    )

    const fetchUser = async () => {
        const token = await SecureStore.getItemAsync('userToken');

        console.log(token)
        if (token) {
            const decodedToken = jwtDecode(token);
            console.log("DECODED token: ", decodedToken)
            setUserId(decodedToken.userId);

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

    const handleDeleteChat = (id: string) => {
        console.log('clicked delete')
        setDeleteConfirmation(id);
    }

    const handleConfirmDeleteChat = async (chatid: string) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');

            const res = await fetch(`https://riyadah.onrender.com/api/chats/delete/${postid}`, {
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
            setChats(prevChats => prevChats.filter(chat => chat._id !== chatid));
            console.log('Unlinked chat:', data.chat);
            handleCloseModalPress()
        } catch (err) {
            console.error('Failed to unlink post:', err);
            alert('Something went wrong. Please try again.');
        }
    }

    const handleCancelDeleteChat = (id: string) => {
        setDeleteConfirmation('');
    }

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
                        data={chats}
                        renderItem={renderChat}
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

                                        </View>
                                    </View>

                                </View>
                            </>
                        }
                        onEndReached={() => {
                            // Only trigger if we have more posts and aren't already loading
                            if (hasMore && !loading) {
                                loadChats();
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


            {selectedChat != null && <BottomSheet
                ref={moreOptionsRef}
                enablePanDownToClose={true}
                handleIndicatorStyle={{ width: 50, backgroundColor: '#aaa' }}
                backdropComponent={renderBackdrop}
            >
                <BottomSheetView style={{
                    flex: 1, paddingBottom: 50
                }}>
                    <View style={{ padding: 20 }}>
                        {selectedChat && selectedChat.created_by._id == userId && (
                            <View>
                                {deleteConfirmation == '' && <TouchableOpacity onPress={() => { handleDeleteChat(selectedChat._id) }} style={[styles.profileButton, { marginTop: 10 }]}>
                                    <Text style={[styles.profileButtonText, { color: '#FF4000' }]}>Delete chat</Text>
                                </TouchableOpacity>}
                                {deleteConfirmation == selectedChat._id &&
                                    <View style={[styles.profileButton, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }]}>
                                        <Text style={[styles.profileButtonText, { color: '#FF4000' }]}>Are you sure?</Text>
                                        <View style={{ flexDirection: 'row', columnGap: 30, alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => handleConfirmDeleteChat(selectedChat._id)}
                                                style={[styles.profileButton, { backgroundColor: 'transparent', padding: 0 }]}>
                                                <Text style={[styles.profileButtonText, { textAlign: 'center' }]}>Yes, delete</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => handleCancelDeleteChat(selectedChat._id)}
                                                style={[styles.profileButton, { backgroundColor: 'transparent', padding: 0 }]}>
                                                <Text style={[styles.profileButtonText, { textAlign: 'center' }]}>No</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>}
                            </View>
                        )}

                        <TouchableOpacity onPress={() => {
                            handleCloseModalPress();
                            setSelectedChat(null);
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