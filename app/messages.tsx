import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
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
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import io from "socket.io-client";

const { width } = Dimensions.get('window');

export default function Messages() {
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [chats, setChats] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const router = useRouter();
    const pageLimit = 10;
    const moreOptionsRef = useRef<BottomSheet>(null);
    const newChatRef = useRef<BottomSheet>(null);
    const [socket, setSocket] = useState(null);
    const [participantId, setParticipantId] = useState('');
    const [selectedChatId, setSelectedChatId] = useState('');
    const [loadingParticipants, setLoadingParticipants] = useState(true);
    const [participants, setParticipants] = useState([]);

    const snapPoints = useMemo(() => ["50%", "85%"], []);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (!userId) return;

        // Connect to your backend socket server
        const newSocket = io("https://riyadah.onrender.com", {
            transports: ["websocket"],
        });

        setSocket(newSocket);

        // Join a room identified by userId to get only relevant messages
        newSocket.emit("join", userId);

        // Listen for new message event
        newSocket.on("newMessage", ({ chatId }) => {
            console.log("New message in chat:", chatId);
            refreshChats();  // Your existing function to refresh chat list
        });



        // Clean up on unmount or userId change
        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    const fetchUser = async () => {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            const decodedToken: any = jwtDecode(token);
            setUserId(decodedToken.userId || decodedToken.id);

            // Optionally fetch user details here if needed
            setLoading(false);
            fetchParticipants();
            refreshChats();
        } else {
            setLoading(false);
        }
    };

    const fetchParticipants = () => {
        
    }

    const loadChats = useCallback(async () => {
        if (!hasMore || loading) return;

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/chats?page=${page}&limit=${pageLimit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setChats(prev => {
                    // Avoid duplicates by ID
                    const ids = new Set(prev.map(c => c._id));
                    const newChats = data.filter(c => !ids.has(c._id));
                    return [...prev, ...newChats];
                });
                setHasMore(data.length >= pageLimit);
                setPage(prev => prev + 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, hasMore, loading]);

    const refreshChats = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/chats?page=1&limit=${pageLimit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setChats(data);
                setHasMore(data.length === pageLimit);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const handleMoreOptions = (chat: any) => {
        setSelectedChat(chat);
        moreOptionsRef.current?.expand();
    };

    const handleCreateNewChat = useCallback(() => {
        newChatRef.current?.snapToIndex(0);
    }, []);

    const handleCloseModalPress = () => {
        moreOptionsRef.current?.close();
        newChatRef.current?.close();
        setSelectedChat(null);
        setDeleteConfirmation('');
    };

    const handleDeleteChat = (id: string) => {
        setDeleteConfirmation(id);
    };

    const handleConfirmDeleteChat = async (chatId: string) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/chats/delete/${chatId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });

            const data = await res.json();
            if (!res.ok) {
                alert(`Error: ${data.message}`);
                return;
            }

            setChats(prev => prev.filter(chat => chat._id !== chatId));
            handleCloseModalPress();
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
        }
    };

    const handleCancelDeleteChat = () => {
        setDeleteConfirmation('');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
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

    const renderChat = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: "chat", params: { chatId: item._id } })}
            style={styles.chatContainer}
        >
            <View style={styles.chatContent}>
                {!item.otherParticipant?.image ? (
                    <View style={styles.profileImage}>
                        {item.otherParticipant?.gender === "Male" && (
                            <Image source={require('../assets/avatar.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                        )}
                        {item.otherParticipant?.gender === "Female" && (
                            <Image source={require('../assets/avatarF.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                        )}
                        {item.otherParticipant?.type === "Club" && (
                            <Image source={require('../assets/clublogo.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                        )}
                    </View>
                ) : (
                    <Image source={{ uri: item.otherParticipant.image }} style={styles.avatar} resizeMode="contain" />
                )}

                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatUserName}>{item.otherParticipant?.name || "Unknown User"}</Text>
                        <Text style={styles.chatDate}>{formatDate(item.lastMessage?.timestamp)}</Text>
                    </View>
                    <Text style={styles.lastReply}>{item.lastMessage?.text || "No messages yet"}</Text>
                </View>

                <TouchableOpacity onPress={() => handleMoreOptions(item)} style={styles.postOptions}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#888888" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const createChat = async () => {
        if (!participantId) {
            Alert.alert('Error', 'Please enter participant ID');
            return;
        }

        setLoading(true);
        const token = await SecureStore.getItemAsync('userToken');

        try {
            const res = await fetch('https://riyadah.onrender.com/api/chats/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ participantId })
            });

            const data = await res.json();
            if (res.ok) {
                setSelectedChatId(data._id);
                Alert.alert('Chat Created', `Chat ID: ${data._id}`);
            } else {
                Alert.alert('Error', data.message || 'Failed to create chat');
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
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
                        data={chats}
                        renderItem={renderChat}
                        keyExtractor={item => `${item._id}-${item.lastMessage?.timestamp || ''}`}
                        ListHeaderComponent={
                            <View style={styles.header}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Image source={require('../assets/logo_white.png')} style={styles.logo} resizeMode="contain" />
                                    <View style={styles.headerActions}>
                                        <TouchableOpacity
                                            onPress={handleCreateNewChat}
                                            style={loading
                                                ? { opacity: 0.3 }
                                                : {}}
                                            disabled={loading ? true : false}
                                        >
                                            <Image
                                                style={styles.postBtnImg}
                                                source={require('../assets/addPost.png')}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>

                                    </View>
                                </View>
                            </View>
                        }
                        onEndReached={() => { if (hasMore && !loading) loadChats(); }}
                        onEndReachedThreshold={0.5}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshChats} colors={['#FF4000']} tintColor="#FF4000" />}
                        ListFooterComponent={<View style={styles.loadingFooter}>{loading && <ActivityIndicator size="large" color="#FF4000" />}</View>}
                    />
                </View>

                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => router.replace('/settings')}>
                        <Image source={require('../assets/settings.png')} style={styles.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/search')}>
                        <Image source={require('../assets/news.png')} style={styles.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/landing')}>
                        <Image source={require('../assets/home.png')} style={[styles.icon, styles.icon]} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/notifications')}>
                        <Image source={require('../assets/notifications.png')} style={styles.activeIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/profile')}>
                        <Image source={require('../assets/profile.png')} style={styles.icon} />
                    </TouchableOpacity>
                </View>

                {selectedChat && (
                    <BottomSheet
                        ref={moreOptionsRef}
                        enablePanDownToClose
                        handleIndicatorStyle={{ width: 50, backgroundColor: '#aaa' }}
                        backdropComponent={props => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />}
                    >
                        <BottomSheetView style={{ flex: 1, paddingBottom: 50 }}>
                            <View style={{ padding: 20 }}>
                                {selectedChat.otherParticipant?._id === userId && (
                                    <View>
                                        {deleteConfirmation === '' && (
                                            <TouchableOpacity onPress={() => handleDeleteChat(selectedChat._id)} style={[styles.profileButton, { marginTop: 10 }]}>
                                                <Text style={[styles.profileButtonText, { color: '#FF4000' }]}>Delete chat</Text>
                                            </TouchableOpacity>
                                        )}
                                        {deleteConfirmation === selectedChat._id && (
                                            <View style={[styles.profileButton, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }]}>
                                                <Text style={[styles.profileButtonText, { color: '#FF4000' }]}>Are you sure?</Text>
                                                <View style={{ flexDirection: 'row', columnGap: 30, alignItems: 'center' }}>
                                                    <TouchableOpacity onPress={() => handleConfirmDeleteChat(selectedChat._id)} style={[styles.profileButton, { backgroundColor: 'transparent', padding: 0 }]}>
                                                        <Text style={[styles.profileButtonText, { textAlign: 'center' }]}>Yes, delete</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={handleCancelDeleteChat} style={[styles.profileButton, { backgroundColor: 'transparent', padding: 0 }]}>
                                                        <Text style={[styles.profileButtonText, { textAlign: 'center' }]}>No</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}
                                <TouchableOpacity onPress={handleCloseModalPress} style={[styles.profileButton, { marginTop: 20, backgroundColor: '#111111' }]}>
                                    <Text style={[styles.profileButtonText, { textAlign: 'center', color: '#fff' }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </BottomSheetView>
                    </BottomSheet>
                )}

                <BottomSheet
                    ref={newChatRef}
                    index={-1}
                    snapPoints={snapPoints}
                    enableDynamicSizing={false}
                    enablePanDownToClose={true}
                    handleIndicatorStyle={{ width: 50, backgroundColor: '#aaa' }}
                    backdropComponent={props => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />}
                    keyboardBehavior="interactive"
                    keyboardBlurBehavior="restore"
                >
                    <BottomSheetView style={{ backgroundColor: 'white', zIndex: 1 }}>
                        <View style={[styles.commentModalHeader, {}]}>
                            <Text style={styles.commentModalTitle}>New message</Text>
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
                        {loadingParticipants ? (
                            <View style={styles.commentLoading}>
                                <ActivityIndicator size="large" color="#FF4000" />
                            </View>
                        ) : (
                            participants.length === 0 ? (
                                <View style={styles.noComments}>
                                    <Text style={styles.noCommentsText}>No users yet</Text>
                                </View>
                            ) : (
                                participants.map((item) => (
                                    <View key={item._id} style={styles.commentItem}>
                                        <View style={styles.profileImage}>
                                            {/* Default avatars */}
                                            {(item?.image == null || item?.image === '') && item?.type === 'Club' && (
                                                <Image source={require('../assets/clublogo.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                                            )}
                                            {(item?.image == null || item?.image === '') && item?.gender === 'Male' && (
                                                <Image source={require('../assets/avatar.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                                            )}
                                            {(item?.image == null || item?.image === '') && item?.gender === 'Female' && (
                                                <Image source={require('../assets/avatarF.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                                            )}
                                            {item?.image && (
                                                <Image source={{ uri: item.image }} style={styles.profileImageAvatar} resizeMode="contain" />
                                            )}
                                        </View>
                                        <View style={styles.commentContent}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={styles.commentAuthor}>{item.name}</Text>
                                                    </View>
                                                    <Text style={styles.commentText}>{item.type}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )
                        )}
                    </BottomSheetScrollView>
                </BottomSheet>

            </SafeAreaView>
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