const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const imageRoutes = require('./routes/imageRoutes');
const teamsRoutes = require('./routes/teamRoutes');
const schedulesRoutes = require('./routes/scheduleRoutes');
const staffRoutes = require('./routes/staffRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const postRoutes = require('./routes/postRoutes')
const searchRoutes = require('./routes/searchRoutes')
const chatRouter = require('./routes/chatRoutes');
const verificationRoutes = require("./routes/verificationRoutes");
const postSessionSurveyRoutes = require("./routes/postSessionSurveyRoutes");
const monthlySurveyRoutes = require("./routes/monthlySurveyRoutes");
const Chat = require("./models/Chat");


const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

connectDB();

app.use('/api/users', userRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/financials', paymentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chats', chatRouter);
app.use('/api/verify', verificationRoutes);
app.use('/api/postSessionSurvey', postSessionSurveyRoutes);
app.use('/api/monthlySurvey', monthlySurveyRoutes);

app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/removeBG', imageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

const chatListNamespace = io.of('/chat-list');

// Authentication middleware for chat list namespace
chatListNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    const jwt = require('jsonwebtoken');
    jwt.verify(token, '123456', (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.userId = decoded.userId || decoded.id;
        next();
    });
});

// Chat list namespace connection handler
chatListNamespace.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User ${userId} connected to chat list updates`);

    // Join a room specific to this user's chat list updates
    socket.join(`user-${userId}`);

    socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected from chat list updates`);
    });
});

// Attach io instance to app so routes can access it
app.set('io', io);

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    const jwt = require('jsonwebtoken');
    jwt.verify(token, '123456', (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.userId = decoded.userId || decoded.id;
        next();
    });
});

io.on('connection', async (socket) => {
    const userId = socket.userId;
    const chatId = socket.handshake.query.chatId;
    if (!chatId) {
        console.log('chatId missing on socket connection, disconnecting');
        socket.disconnect();
        return;
    }

    console.log('User connected:', userId, 'to chat:', chatId);

    socket.join(chatId);

    // Add user to activeParticipants
    try {
        await Chat.findByIdAndUpdate(chatId, {
            $addToSet: { activeParticipants: userId }
        });
        console.log(`User ${userId} marked active in chat ${chatId}`);
    } catch (err) {
        console.error('Error adding active participant:', err);
    }

    socket.on('disconnect', async () => {
        console.log('User disconnected:', userId, 'from chat:', chatId);

        // Remove user from activeParticipants
        try {
            await Chat.findByIdAndUpdate(chatId, {
                $pull: { activeParticipants: userId }
            });

            // Optional: Check if no active participants remain
            const chat = await Chat.findById(chatId);
            if (chat && chat.activeParticipants.length === 0) {
                console.log(`No active participants left in chat ${chatId}`);
                // Trigger notification logic here if needed
            }
        } catch (err) {
            console.error('Error removing active participant:', err);
        }
    });
});

// Helper function to notify chat list updates
function setupChatListUpdates(io) {
    return function notifyChatListUpdate(userId, updatedChat) {
        io.of('/chat-list').to(`user-${userId}`).emit('chatUpdate', updatedChat);
    };
}

const notifyChatListUpdate = setupChatListUpdates(io);
app.set('notifyChatListUpdate', notifyChatListUpdate);


const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
