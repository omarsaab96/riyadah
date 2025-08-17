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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import io from 'socket.io-client';

interface Message {
    _id?: string;
    tempId?: string;
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
    const insets = useSafeAreaInsets();

    const router = useRouter();
    const { chatId } = useLocalSearchParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState(null);

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const socketRef = useRef<any>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 300); // slight delay so UI mounts fully before focus
        return () => clearTimeout(timer);
    }, []);

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
        const token = await SecureStore.getItemAsync('userToken');

        try {
            const res = await fetch(`https://riyadah.onrender.com/api/chats/${chatId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch chat');


            const data = await res.json();
            setChat(data.chat || null);
            setMessages(data.messages.reverse() || []);

        } catch (error) {
            console.error(error);
            alert('Failed to load chat');
        }
        finally {
            setLoading(false);
            console.log("updating last open")
            await fetch(`https://riyadah.onrender.com/api/chats/open/${chatId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
        }
        
    };

    // Connect to socket.io
    const connectSocket = async () => {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) return;

        const socket = io('https://riyadah.onrender.com', {
            auth: { token },
            query: { chatId },
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('newMessage', (data: { chatId: string, message: Message }) => {
            if (data.chatId === chatId) {
                setMessages((prevMessages) => {
                    const withoutPending = prevMessages.filter(
                        (msg) => msg.tempId == data.message.tempId
                    );
                    return [data.message, ...withoutPending];
                });

            }
        });

        socketRef.current = socket;
    };

    // Send new message
    const handleSendMessage = async () => {
        if (!text.trim()) return;

        const tempId = Date.now().toString() + Math.random().toString(36).substring(2, 9);

        const optimisticMessage: Message = {
            tempId,
            text,
            senderId: userId!,
            timestamp: new Date().toISOString(),
        };


        setMessages((prev) => [optimisticMessage, ...prev]);
        let msgContent = text;
        setText('')
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/chats/${chatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: msgContent }),
            });

            if (!res.ok) throw new Error('Failed to send message');

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

    // if (loading) {
    //     return (
    //         <View style={styles.loadingContainer}>
    //             <ActivityIndicator size="large" color="#FF4000" />
    //         </View>
    //     );
    // }

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
            <View style={{ height: insets.top, backgroundColor: '#FF4000' }} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >

                <View style={{ flex: 1 }}>
                    <View style={styles.topBanner}>
                        <TouchableOpacity
                            onPress={() => {
                                router.back()
                            }}
                            style={styles.backBtn}
                        >
                            <Ionicons name="chevron-back" size={20} color="#ffffff" />
                            <Text style={styles.backBtnText}>chats</Text>
                        </TouchableOpacity>

                        {chat && chat.participants && (() => {
                            const otherParticipant = chat.participants.find(p => p._id !== userId);
                            return (
                                <TouchableOpacity
                                    style={{
                                        position: 'absolute',
                                        left: '50%',
                                        transform: [{ translateX: -25 }],
                                        bottom: 10,
                                        zIndex: 1
                                    }}
                                    onPress={() => {
                                        router.push({
                                            pathname: '/profile/public',
                                            params: { id: otherParticipant._id },
                                        })
                                    }}
                                >
                                    <View style={styles.profileImage}>
                                        {otherParticipant ? (
                                            otherParticipant.image ? (
                                                <Image
                                                    source={{ uri: otherParticipant.image }}
                                                    style={styles.profileImageAvatar}
                                                    resizeMode="contain"
                                                />
                                            ) : otherParticipant.type === "Club" ? (
                                                <Image
                                                    source={require('../assets/clublogo.png')}
                                                    style={styles.profileImageAvatar}
                                                    resizeMode="contain"
                                                />
                                            ) : otherParticipant.gender === "Female" ? (
                                                <Image
                                                    source={require('../assets/avatarF.png')}
                                                    style={styles.profileImageAvatar}
                                                    resizeMode="contain"
                                                />
                                            ) : (
                                                <Image
                                                    source={require('../assets/avatar.png')}
                                                    style={styles.profileImageAvatar}
                                                    resizeMode="contain"
                                                />
                                            )
                                        ) : null}
                                    </View>
                                </TouchableOpacity>
                            );
                        })()}

                        {(!chat || !chat.participants) &&
                            <View
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    transform: [{ translateX: -10 }],
                                    bottom: 20,
                                    zIndex: 1
                                }}
                            >
                                <ActivityIndicator size={'large'} color={'#fff'} />
                            </View>
                        }
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        inverted
                        renderItem={renderMessage}
                        keyExtractor={(item, idx) => item._id || idx.toString()}
                        contentContainerStyle={{
                            padding: 15
                        }}
                        ListFooterComponent={
                            <View style={styles.chatHeader}>
                                <Text style={styles.disclaimer}>By chatting through Riyadah app, you agree to the terms and conditions and privacy policy</Text>
                            </View>
                        }
                    />

                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={inputRef}
                            placeholder="Type a message..."
                            placeholderTextColor='#888'
                            value={text}
                            onChangeText={setText}
                            style={styles.input}
                            multiline
                        />
                        <TouchableOpacity disabled={loading} onPress={handleSendMessage} style={[styles.sendButton, loading && { backgroundColor: 'transparent' }]}>
                            {!loading && <Ionicons name="send" size={24} color="#fff" />}
                            {loading && <ActivityIndicator size="small" color="#FF4000" />}
                        </TouchableOpacity>
                    </View>
                </View>

            </KeyboardAvoidingView>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    topBanner: {
        backgroundColor: '#FF4000',
        paddingTop: 30,
        paddingBottom: 15,
        paddingHorizontal: 10,
        position: 'relative',
        height: 80
    },
    backBtn: {
        width: 200,
        zIndex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        // borderWidth: 1
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
        backgroundColor: '#dedede',
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
        backgroundColor: '#f4f4f4',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        maxHeight: 100,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#dedede',
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
        backgroundColor: '#ddd',
        overflow: 'hidden',
    },
    profileImageAvatar: {
        height: '100%',
        width: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30
    },
    disclaimer: {
        fontSize: 12,
        color: '#aaa',
        fontStyle: 'italic',
        maxWidth: 300,
        textAlign: 'center'
    }
});
