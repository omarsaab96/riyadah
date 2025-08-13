const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const router = express.Router();


// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token missing' });

    jwt.verify(token, '123456', (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded; // decoded contains userId
        next();
    });
};

// Get paginated chats for logged-in user
router.get("/", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const chats = await Chat.find({
            participants: userId
        })
            .populate("participants", "name image gender type") // get only needed user fields
            .sort({ "lastMessage.timestamp": -1 })
            .skip(skip)
            .limit(limit);

        // For each chat, find the other participant (exclude current user)
        const chatsWithOther = chats.map(chat => {
            const otherParticipant = chat.participants.find(
                p => p._id.toString() !== userId.toString()
            );

            return {
                _id: chat._id,
                participants: chat.participants,
                otherParticipant: otherParticipant || null,
                lastMessage: chat.lastMessage,
            };
        });

        res.json(chatsWithOther);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Create a new chat between two participants
router.post("/create", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { participantId } = req.body; // the other participant's userId

    if (!participantId) {
        return res.status(400).json({ message: "participantId is required" });
    }

    try {
        let chat = await Chat.findOne({
            participants: { $all: [userId, participantId] }
        });

        if (chat) {
            // Chat already exists, return it
            return res.json(chat);
        }

        // Create a new chat
        chat = new Chat({
            participants: [userId, participantId],
            activeParticipants:[],
            lastMessage: {
                text: "",
                senderId: null,
                timestamp: null,
            }
        });

        await chat.save();

        res.status(201).json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Delete chat route
router.delete('/delete/:chatId', authenticateToken, async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user.userId;

    console.log(chatId)

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // Optional: Check if user is a participant of this chat
        if (!chat.participants.some(p => p.toString() === userId)) {
            return res.status(403).json({ message: "Not authorized to delete this chat" });
        }

        await Chat.findByIdAndDelete(chatId);
        res.json({ message: "Chat deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get("/participants", authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;

        const users = await User.find({ _id: { $ne: currentUserId } }).select("_id name image gender type");

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Add a new message to a chat
router.post("/:chatId/message", authenticateToken, async (req, res) => {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });
        if (!chat.participants.some(p => p.toString() === userId))
            return res.status(403).json({ message: "Not authorized" });

        // Save the message
        const message = new Message({
            chatId,
            senderId: userId,
            text,
        });
        await message.save();

        // Update lastMessage in chat
        chat.lastMessage = {
            text,
            senderId: userId,
            timestamp: message.timestamp,
        };
        await chat.save();

        // Emit to other participants
        const io = req.app.get("io");
        chat.participants.forEach((participantId) => {
            if (participantId.toString() !== userId.toString()) {
                io.to(participantId.toString()).emit("newMessage", { chatId, message });
            }
        });

        res.json({ message: "Message sent", message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Get chat details and all messages
router.get("/:chatId", authenticateToken, async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user.userId;

    try {
        const chat = await Chat.findById(chatId).populate('participants', '_id name type gender image');
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        if (!chat.participants.some(p => p._id.toString() === userId))
            return res.status(403).json({ message: "Not authorized" });

        const messages = await Message.find({ chatId }).sort({ timestamp: 1 });

        res.json({
            chat: chat,
            messages: messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;

