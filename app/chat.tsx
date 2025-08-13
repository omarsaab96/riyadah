import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const socketRef = useRef<any>(null);

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

    // Fetch chat and messages from API
    const fetchChat = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`https://riyadah.onrender.com/api/chats/${chatId}/messages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch chat');

            const data = await res.json();
            setChat(data.chat);
            setMessages(data.messages || []);
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
        const isMine = item.senderId === chat?.participants[0]?._id; // or your logged userId

        return (
            <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.otherMessage]}>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.messageTimestamp}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
            keyboardVerticalOffset={90}
        >
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, idx) => item._id || idx.toString()}
                inverted
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', padding: 10 }}
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messageContainer: {
        maxWidth: '80%',
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
    },
    myMessage: {
        backgroundColor: '#FF4000',
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: '#eee',
        alignSelf: 'flex-start',
    },
    messageText: {
        color: '#000',
    },
    messageTimestamp: {
        fontSize: 10,
        color: '#555',
        textAlign: 'right',
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
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
        paddingVertical: 8,
        backgroundColor: '#f1f1f1',
        borderRadius: 20,
        fontSize: 16,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#FF4000',
        borderRadius: 20,
        padding: 10,
    },
});
