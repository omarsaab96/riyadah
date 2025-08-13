import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import io from 'socket.io-client';

interface Message {
    _id?: string;
    text: string;
    senderId: string;
    timestamp: string;
}

interface Chat {
    _id: string;
    participants: any[];
    lastMessage: Message;
    messages: Message[];
}

export default function ChatPage() {
    const router = useRouter();
    const { chatId } = useLocalSearchParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState(null);

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const socketRef = useRef<any>(null);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (!chatId) return;

        // Load chat messages on mount
        fetchChat();

        // Connect socket
        connectSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [chatId]);

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

    // Fetch chat and messages from API
    const fetchChat = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/chats/${chatId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch chat');

            const data = await res.json();
            setChat(data);
            console.log(data)

            try {
                const token = await SecureStore.getItemAsync('userToken');
                const res = await fetch(`https://riyadah.onrender.com/api/chats/${chatId}/messages`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Failed to fetch chat');

                const data = await res.json();
                setMessages(data || []);
            } catch (error) {
                console.error(error);
                alert('Failed to load chat');
            }

        } catch (error) {
            console.error(error);
            alert('Failed to load chat');
        } finally {
            setLoading(false);
        }
    };

    // Connect to socket.io
    const connectSocket = async () => {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) return;

        const socket = io('https://riyadah.onrender.com', {
            auth: { token },
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('newMessage', (data: { chatId: string }) => {
            if (data.chatId === chatId) {
                // Refetch messages or update locally
                fetchChat();
            }
        });

        socketRef.current = socket;
    };

    // Send new message
    const handleSendMessage = async () => {
        if (!text.trim()) return;

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/chats/${chatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text }),
            });
            if (!res.ok) throw new Error('Failed to send message');

            setText('');
            fetchChat(); // Refresh messages after sending
        } catch (error) {
            console.error(error);
            alert('Failed to send message');
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = item.senderId === userId;

        return (
            <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.otherMessage]}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4000" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBanner}>
                <TouchableOpacity
                    onPress={() => {
                        router.replace({
                            pathname: '/profile',
                            params: { tab: 'Inventory' }
                        })
                    }}
                    style={styles.backBtn}
                >
                    <Ionicons name="chevron-back" size={20} color="#ffffff" />
                    <Text style={styles.backBtnText}>chats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{position:'absolute',left:'50%',transform:[{translateX:-25}], bottom:10}}>
                    {!chat?.otherParticipant?.image ? (
                        <View style={styles.profileImage}>
                            {chat?.otherParticipant?.gender === "Male" && (
                                <Image source={require('../assets/avatar.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                            )}
                            {chat?.otherParticipant?.gender === "Female" && (
                                <Image source={require('../assets/avatarF.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                            )}
                            {chat?.otherParticipant?.type === "Club" && (
                                <Image source={require('../assets/clublogo.png')} style={styles.profileImageAvatar} resizeMode="contain" />
                            )}
                        </View>
                    ) : (
                        <Image source={{ uri: chat?.otherParticipant.image }} style={styles.profileImageAvatar} resizeMode="contain" />
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, idx) => item._id || idx.toString()}
                    contentContainerStyle={{ justifyContent: 'flex-end', flexGrow: 1, padding: 15 }}
                    ListHeaderComponent={
                        <View style={styles.chatHeader}>
                            <Text style={styles.pageTitle}>{chat._id}</Text>
                        </View>
                    }
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Type a message..."
                        value={text}
                        onChangeText={setText}
                        style={styles.input}
                        multiline
                    />
                    <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                        <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingBottom: 60 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBanner: {
        backgroundColor: '#FF4000',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 10,
        position:'relative',
        height:100
    },
    backBtn: {
        width: 200,
        zIndex: 1,
        flexDirection: 'row',
        alignContent: 'center',
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Bebas',
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 10,
        marginVertical: 2,
        borderRadius: 8,
    },
    myMessage: {
        backgroundColor: '#f1f1f1',
        alignSelf: 'flex-end',

    },
    otherMessage: {
        backgroundColor: '#eee',
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
        color: 'black'
    },
    messageTimestamp: {
        fontSize: 10,
        color: '#555',
        textAlign: 'right',
        marginTop: 4,
        position: 'absolute',
        bottom: 5,
        right: '100%'
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        maxHeight: 100,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f1f1f1',
        borderRadius: 20,
        fontSize: 16,
        color: 'black'
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#FF4000',
        borderRadius: 20,
        padding: 10,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#dddddd',
        overflow: 'hidden',
    },
    profileImageAvatar: {
        height: '100%',
        width: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
});
