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
const surveyRoutes = require("./routes/surveyRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const walletRoutes = require("./routes/walletRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");
const testRoutes = require("./routes/testRoutes");
const sportsRoutes = require("./routes/sportsRoutes");
const bulkAthletesRoutes = require("./routes/bulkAthletesRoutes");
const Chat = require("./models/Chat");
const Schedule = require("./models/Schedule");
const Survey = require("./models/survey");
const Attendance = require("./models/Attendance");
const User = require("./models/User");
const Team = require("./models/Team");
const SurveyResponse = require("./models/surveyResponse");
const { sendNotification } = require("./utils/notificationService");
const { buildNotificationContent } = require("./utils/notificationTemplates");


const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

connectDB();

app.get('/', (req, res) =>
    res.send(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`)
);
app.get("/api", (req, res) => {
    res.send("OK");
});
app.use('/api/users', userRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/financials', paymentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chats', chatRouter);
app.use('/api/verify', verificationRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timesheet', timesheetRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/test', testRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/bulk-athletes', bulkAthletesRoutes);

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

let processingPostTrainingNotifications = false;
const notifyPostTrainingSurveys = async () => {
    if (processingPostTrainingNotifications) return;
    processingPostTrainingNotifications = true;

    try {
        const surveys = await Survey.find({
            isActive: true,
            'repeating.enabled': true,
            'repeating.cadence': 'post-training'
        });

        if (surveys.length === 0) {
            processingPostTrainingNotifications = false;
            return;
        }

        const now = new Date();
        const sessions = await Schedule.find({
            endTime: { $lte: now },
            notifiedAfterEnd: { $ne: true },
            status: { $ne: 'cancelled' },
            eventType: { $in: ['Training', 'training'] }
        }).select('_id team club coaches endTime status');

        for (const session of sessions) {
            const attendance = await Attendance.findOne({ event: session._id });
            if (!attendance) {
                continue;
            }

            const attendeeIds = (attendance.present || []).map(id => id.toString());
            if (attendeeIds.length === 0) {
                session.notifiedAfterEnd = true;
                session.status = session.status === 'scheduled' ? 'completed' : session.status;
                await session.save();
                continue;
            }

            for (const survey of surveys) {
                const scope = survey.restrictedTo?.scope || 'none';
                const refId = survey.restrictedTo?.refId ? survey.restrictedTo.refId.toString() : null;
                if (scope === 'coach') {
                    continue;
                }
                if (scope === 'team' && refId && refId !== String(session.team)) {
                    continue;
                }
                if (scope === 'club' && refId && refId !== String(session.club)) {
                    continue;
                }

                for (const attendeeId of attendeeIds) {
                    const user = await User.findById(attendeeId).select('expoPushToken');
                    if (!user) continue;
                    try {
                        const content = buildNotificationContent({
                            type: 'survey',
                            title: 'Post-training survey',
                            body: 'Please complete your post-training survey.'
                        });
                        await sendNotification(
                            user,
                            content.title,
                            content.body,
                            { type: 'survey', surveyId: survey._id, sessionId: session._id },
                            true
                        );
                    } catch (err) {
                        console.error('Failed to send survey notification:', err.message || err);
                    }
                }
            }

            session.notifiedAfterEnd = true;
            session.status = session.status === 'scheduled' ? 'completed' : session.status;
            await session.save();
        }
    } catch (error) {
        console.error('Error sending post-training surveys:', error);
    } finally {
        processingPostTrainingNotifications = false;
    }
};

setInterval(notifyPostTrainingSurveys, 60 * 1000);

let processingMonthlySurveyNotifications = false;
const monthlySurveyNotified = new Set();

const getMonthlySurveyTargets = async (survey) => {
    const scope = survey.restrictedTo?.scope || 'none';
    const refId = survey.restrictedTo?.refId ? String(survey.restrictedTo.refId) : null;

    if (scope === 'none') {
        return User.find({ type: 'Athlete' }).select('_id expoPushToken');
    }

    if (scope === 'club' && refId) {
        const teams = await Team.find({ club: refId }).select('_id');
        const teamIds = teams.map(team => team._id);
        return User.find({
            type: 'Athlete',
            $or: [
                { clubs: refId },
                { memberOf: { $in: teamIds } }
            ]
        }).select('_id expoPushToken');
    }

    if (scope === 'team' && refId) {
        const team = await Team.findById(refId).select('members');
        if (!team) return [];
        return User.find({ _id: { $in: team.members }, type: 'Athlete' }).select('_id expoPushToken');
    }

    if (scope === 'coach' && refId) {
        const teams = await Team.find({ coaches: refId }).select('members');
        const memberIds = new Set();
        teams.forEach(team => {
            (team.members || []).forEach(memberId => memberIds.add(String(memberId)));
        });
        return User.find({ _id: { $in: Array.from(memberIds) }, type: 'Athlete' }).select('_id expoPushToken');
    }

    return [];
};

const notifyMonthlySurveys = async () => {
    if (processingMonthlySurveyNotifications) return;
    processingMonthlySurveyNotifications = true;

    try {
        const surveys = await Survey.find({
            isActive: true,
            'repeating.enabled': true,
            'repeating.cadence': 'monthly'
        });

        if (surveys.length === 0) {
            processingMonthlySurveyNotifications = false;
            return;
        }

        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        for (const survey of surveys) {
            const responses = await SurveyResponse.find({
                survey: survey._id,
                createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }
            }).select('user');
            const respondedIds = new Set(responses.map(res => String(res.user)));

            const targets = await getMonthlySurveyTargets(survey);

            for (const user of targets) {
                const userId = String(user._id);
                if (respondedIds.has(userId)) continue;

                const key = `${survey._id}:${userId}:${yearMonth}`;
                if (monthlySurveyNotified.has(key)) continue;

                try {
                    const content = buildNotificationContent({
                        type: 'survey',
                        title: 'Monthly survey',
                        body: 'Please complete your monthly wellness survey.'
                    });
                    await sendNotification(
                        user,
                        content.title,
                        content.body,
                        { type: 'survey', surveyId: survey._id },
                        true
                    );
                    monthlySurveyNotified.add(key);
                } catch (err) {
                    console.error('Failed to send monthly survey notification:', err.message || err);
                }
            }
        }
    } catch (error) {
        console.error('Error sending monthly surveys:', error);
    } finally {
        processingMonthlySurveyNotifications = false;
    }
};

setInterval(notifyMonthlySurveys, 24 * 60 * 60 * 1000);


const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
