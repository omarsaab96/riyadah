const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");  
const Chat = require("../models/Chat");
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

// Add msg to chat
router.post("/:chatId/message", authenticateToken, async (req, res) => {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        chat.lastMessage = {
            text,
            senderId: userId,
            timestamp: new Date(),
        };
        await chat.save();

        // Emit new message event
        const io = req.app.get('io');
        chat.participants.forEach((participantId) => {
            if (participantId.toString() !== userId.toString()) {
                io.to(participantId.toString()).emit("newMessage", { chatId });
            }
        });

        res.json({ message: "Message sent", chat });
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

module.exports = router;

