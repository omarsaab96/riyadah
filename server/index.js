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

app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/removeBG', imageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
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

io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    socket.join(socket.userId);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId);
    });
});


const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
