import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import zod from 'zod';
import bcrypt from 'bcrypt';

const router = express();
const prisma = new PrismaClient();
const saltRounds = 10;

const signupSchema = zod.object({
    email: zod.string().email(),
    username: zod.string().min(3),
    password: zod.string().min(6)
});

// Signup route
router.post('/signup', async (req, res) => {
    const body = req.body;

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Incorrect inputs: " + parsed.error.errors.map(e => e.message).join(", ")
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(body.password, saltRounds);
        await prisma.user.create({
            data: {
                email: body.email,
                username: body.username,
                password: hashedPassword
            }
        });

        return res.json({
            "msg": "Account Created"
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            Error: "Error in signing up"
        });
    }
});

// Signin route
const signinSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6)
});

router.post("/signin", async (req, res) => {
    const body = req.body;
    console.log(body);

    const parsed = signinSchema.safeParse(body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Incorrect inputs: " + parsed.error.errors.map(e => e.message).join(", ")
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        });

        if (!user) {
            return res.status(401).json({
                "msg": "No user found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(body.password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                "msg": "Wrong password"
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not set');
        }

        const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });

        return res.json({
            token: token
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error in logging in' });
    }
});

export default router;