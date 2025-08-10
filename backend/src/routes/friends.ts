import express from 'express';
import { PrismaClient } from '@prisma/client';
import zod from 'zod';
import http from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware';

interface CustomSocket extends Socket {
    userId?: string; // Optional because it may not be set yet
}

const router = express();
const prisma = new PrismaClient();
const server = http.createServer(router);
router.use(authMiddleware);

const io = new Server(server, {
    cors: {
        origin: "*", 
    }
});

const usersOnline: { [key: string]: string } = {};

io.use((socket: CustomSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error"));
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
        if (err) {
            return next(new Error("Authentication error"));
        }

        socket.userId = decoded.id; 
        next();
    });
});

io.on('connection', (socket: CustomSocket) => {
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

router.post('/friend-request', async (req, res) => {
    const { friendId } = req.body;
    const userId = parseInt(req.userId as string, 10);

    try {
        // Check if a friend request already exists
        const isSent = await prisma.friendship.findFirst({
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
        const friendship = await prisma.friendship.create({
            data: {
                userId,
                friendId,
                status: "pending"
            }
        });

        // Find the user who sent the friend request
        const sender = await prisma.user.findUnique({
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
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error sending friend request" });
    }
});


// Add this to your existing Express setup
router.get('/friend-requests', async (req, res) => {
    const userId = parseInt(req.userId as string, 10); // Extract user ID from JWT

    try {
        // Fetch pending friend requests where the recipient is the current user
        const friendRequests = await prisma.friendship.findMany({
            where: {
                friendId: userId,
                status: 'pending'
            },
            include: {
                user: true // Fetch user information
            }
        });

        res.json(friendRequests);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error fetching friend requests" });
    }
});

router.post('/friend-request/accept', async (req, res) => {
    const { requestId } = req.body; // Assuming requestId is the ID of the friendship request
    const userId = parseInt(req.userId as string, 10); // Extract user ID from JWT

    try {
        // Fetch the pending friendship request
        const friendship = await prisma.friendship.findUnique({
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
        await prisma.friendship.update({
            where: { id: requestId },
            data: { status: 'accepted' }
        });

        // Check if the friendship already exists
        const existingFriendship1 = await prisma.friendship.findUnique({
            where: {
                userId_friendId: {
                    userId: friendship.userId,
                    friendId: userId
                }
            }
        });

        const existingFriendship2 = await prisma.friendship.findUnique({
            where: {
                userId_friendId: {
                    userId: userId,
                    friendId: friendship.userId
                }
            }
        });

        // Create friendship record for the user accepting the request if it doesn't exist
        if (!existingFriendship1) {
            await prisma.friendship.create({
                data: {
                    userId: friendship.userId, // The user who sent the request
                    friendId: userId, // The user accepting the request
                    status: 'accepted'
                }
            });
        }

        // Create friendship record for the user who sent the request if it doesn't exist
        if (!existingFriendship2) {
            await prisma.friendship.create({
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
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error accepting friend request" });
    }
});

router.get('/friends', async (req, res) => {
    const userId = parseInt(req.userId as string, 10);

    try {
        const friendships = await prisma.friendship.findMany({
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

        const friends = friendships.map(friendship => 
            friendship.userId === userId ? friendship.friend : friendship.user
        );

        res.json(friends);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error fetching friends' });
    }
});


router.post('/send-message', async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = parseInt(req.userId as string, 10);
    try {
        // Create a new message in the database
        const message = await prisma.message.create({
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
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error sending message" });
    }
});

router.get('/messages/:userId2', async (req, res) => {
    const userId1 = parseInt(req.userId as string, 10);
    const userId2 = parseInt(req.params.userId2, 10);

    try {
        const messages = await prisma.message.findMany({
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
    } catch (e) {
        console.error('Error fetching messages:', e);
        res.status(500).json({ error: 'Error fetching messages between users' });
    }
});
router.get('/search/:input', async (req, res) => {
    const userId = parseInt(req.userId as string, 10); // Ensure `req.userId` exists and is parsed correctly
    const input = req.params.input;

    try {
        // Search for users based on the input
        const users = await prisma.user.findMany({
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
        const friends = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: userId, friendId: { in: users.map(u => u.id) } }, // User has sent a request
                    { friendId: userId, userId: { in: users.map(u => u.id) } }  // User has received a request
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
            const friendship = friends.find(
                f => (f.userId === userId && f.friendId === user.id) ||
                     (f.friendId === userId && f.userId === user.id)
            );
            
            return {
                ...user,
                friendshipStatus: friendship ? friendship.status : 'not friends'
            };
        });

        return res.status(200).json(usersWithFriendshipStatus);
    } catch (e) {
        console.error('Error during search:', e);
        return res.status(500).json({ msg: "Error during search" });
    }
});




server.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});

export default router;
