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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const zod_1 = __importDefault(require("zod"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const saltRounds = 10;
const signupSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    username: zod_1.default.string().min(3),
    password: zod_1.default.string().min(6)
});
// Signup route
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Incorrect inputs: " + parsed.error.errors.map(e => e.message).join(", ")
        });
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(body.password, saltRounds);
        yield prisma.user.create({
            data: {
                email: body.email,
                username: body.username,
                password: hashedPassword
            }
        });
        return res.json({
            "msg": "Account Created"
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            Error: "Error in signing up"
        });
    }
}));
// Signin route
const signinSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6)
});
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    console.log(body);
    const parsed = signinSchema.safeParse(body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Incorrect inputs: " + parsed.error.errors.map(e => e.message).join(", ")
        });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: {
                email: body.email
            }
        });
        if (!user) {
            return res.status(401).json({
                "msg": "No user found"
            });
        }
        const isPasswordCorrect = yield bcrypt_1.default.compare(body.password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                "msg": "Wrong password"
            });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not set');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, secret, { expiresIn: '1h' });
        return res.json({
            token: token
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error in logging in' });
    }
}));
exports.default = router;
