"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index")); // Adjust the path if necessary
const app = (0, express_1.default)();
const PORT = 3000;
// List of allowed origins
const allowedOrigins = ['http://localhost:3001'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true, // Allow credentials
}));
app.use(express_1.default.json());
app.use('/api/v1', index_1.default);
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
