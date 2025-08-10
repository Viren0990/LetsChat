"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = __importDefault(require("../middleware"));
const router = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const server = http_1.default.createServer(router);
router.use(middleware_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    }
});
const usersOnline = {};
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error"));
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error("Authentication error"));
        }
        socket.userId = decoded.id;
        next();
    });
});
io.on('connection', (socket) => {
    const { userId } = socket; // Now userId is part of the custom socket type
    if (userId) {
        usersOnline[userId] = socket.id; // Store the user's socket ID
        console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);
        socket.on('disconnect', () => {
            delete usersOnline[userId];
            console.log(`User disconnected: ${userId}`);
        });
    }
});
router.post('/friend-request', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId } = req.body;
    const userId = parseInt(req.userId, 10);
    try {
        // Check if a friend request already exists
        const isSent = yield prisma.friendship.findFirst({
            where: {
                userId,
                friendId,
                status: 'pending'
            }
        });
        if (isSent) {
            return res.status(400).json({ error: "Friend request already sent" });
        }
        // Create a new friend request
        const friendship = yield prisma.friendship.create({
            data: {
                userId,
                friendId,
                status: "pending"
            }
        });
        // Find the user who sent the friend request
        const sender = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (!sender) {
            return res.status(404).json({ error: "User not found" });
        }
        // Notify the recipient if they are online
        if (usersOnline[friendId]) {
            io.to(usersOnline[friendId]).emit('friendRequestReceived', {
                fromUserId: userId,
                fromUsername: sender.username // Now safe to access username
            });
        }
        res.json({ msg: "Friend request sent", friendship });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error sending friend request" });
    }
}));
// Add this to your existing Express setup
router.get('/friend-requests', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.userId, 10); // Extract user ID from JWT
    try {
        // Fetch pending friend requests where the recipient is the current user
        const friendRequests = yield prisma.friendship.findMany({
            where: {
                friendId: userId,
                status: 'pending'
            },
            include: {
                user: true // Fetch user information
            }
        });
        res.json(friendRequests);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error fetching friend requests" });
    }
}));
router.post('/friend-request/accept', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.body; // Assuming requestId is the ID of the friendship request
    const userId = parseInt(req.userId, 10); // Extract user ID from JWT
    try {
        // Fetch the pending friendship request
        const friendship = yield prisma.friendship.findUnique({
            where: { id: requestId },
            include: { user: true } // Assuming you have a relation to get the user who sent the request
        });
        if (!friendship) {
            return res.status(404).json({ error: "Friend request not found" });
        }
        if (friendship.friendId !== userId) {
            return res.status(403).json({ error: "Not authorized to accept this request" });
        }
        // Update the status of the friendship request to 'accepted'
        yield prisma.friendship.update({
            where: { id: requestId },
            data: { status: 'accepted' }
        });
        // Check if the friendship already exists
        const existingFriendship1 = yield prisma.friendship.findUnique({
            where: {
                userId_friendId: {
                    userId: friendship.userId,
                    friendId: userId
                }
            }
        });
        const existingFriendship2 = yield prisma.friendship.findUnique({
            where: {
                userId_friendId: {
                    userId: userId,
                    friendId: friendship.userId
                }
            }
        });
        // Create friendship record for the user accepting the request if it doesn't exist
        if (!existingFriendship1) {
            yield prisma.friendship.create({
                data: {
                    userId: friendship.userId, // The user who sent the request
                    friendId: userId, // The user accepting the request
                    status: 'accepted'
                }
            });
        }
        // Create friendship record for the user who sent the request if it doesn't exist
        if (!existingFriendship2) {
            yield prisma.friendship.create({
                data: {
                    userId: userId, // The user accepting the request
                    friendId: friendship.userId, // The user who sent the request
                    status: 'accepted'
                }
            });
        }
        // Notify the sender if they are online
        if (usersOnline[friendship.userId]) {
            io.to(usersOnline[friendship.userId]).emit('friendRequestAccepted', {
                userId: userId,
                friendId: friendship.friendId
            });
        }
        res.json({ msg: "Friend request accepted" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error accepting friend request" });
    }
}));
router.get('/friends', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.userId, 10);
    try {
        const friendships = yield prisma.friendship.findMany({
            where: {
                OR: [
                    { userId },
                    { friendId: userId }
                ],
                status: 'accepted'
            },
            include: {
                user: true,
                friend: true
            }
        });
        const friends = friendships.map(friendship => friendship.userId === userId ? friendship.friend : friendship.user);
        res.json(friends);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error fetching friends' });
    }
}));
router.post('/send-message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId, content } = req.body;
    const senderId = parseInt(req.userId, 10);
    try {
        // Create a new message in the database
        const message = yield prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            }
        });
        // Check if the receiver is online
        if (usersOnline[receiverId]) {
            // Emit a real-time message to the receiver
            io.to(usersOnline[receiverId]).emit('messageReceived', {
                senderId,
                content,
                createdAt: message.createdAt
            });
        }
        res.json({ message, msg: "Message sent successfully" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error sending message" });
    }
}));
router.get('/messages/:userId2', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId1 = parseInt(req.userId, 10);
    const userId2 = parseInt(req.params.userId2, 10);
    try {
        const messages = yield prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        res.json(messages);
    }
    catch (e) {
        console.error('Error fetching messages:', e);
        res.status(500).json({ error: 'Error fetching messages between users' });
    }
}));
router.get('/search/:input', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.userId, 10); // Ensure `req.userId` exists and is parsed correctly
    const input = req.params.input;
    try {
        // Search for users based on the input
        const users = yield prisma.user.findMany({
            where: {
                username: {
                    contains: input,
                    mode: 'insensitive'
                },
                id: {
                    not: userId // Exclude the searching user from the results
                }
            },
            select: {
                id: true,
                username: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (users.length === 0) {
            return res.status(404).json({ msg: "No users found" });
        }
        // Fetch friendship statuses between the authenticated user and the found users
        const friends = yield prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: userId, friendId: { in: users.map(u => u.id) } }, // User has sent a request
                    { friendId: userId, userId: { in: users.map(u => u.id) } } // User has received a request
                ]
            },
            select: {
                userId: true,
                friendId: true,
                status: true
            }
        });
        // Map users with their friendship status
        const usersWithFriendshipStatus = users.map(user => {
            // Find if there is any friendship related to this user
            const friendship = friends.find(f => (f.userId === userId && f.friendId === user.id) ||
                (f.friendId === userId && f.userId === user.id));
            return Object.assign(Object.assign({}, user), { friendshipStatus: friendship ? friendship.status : 'not friends' });
        });
        return res.status(200).json(usersWithFriendshipStatus);
    }
    catch (e) {
        console.error('Error during search:', e);
        return res.status(500).json({ msg: "Error during search" });
    }
}));
server.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});
exports.default = router;
