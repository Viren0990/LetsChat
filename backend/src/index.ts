import express from 'express';
import cors from 'cors';
import mainRouter from './routes/index'; // Adjust the path if necessary

const app = express();
const PORT = 3000;

// List of allowed origins
const allowedOrigins = ['http://localhost:3001'];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true, // Allow credentials
}));

app.use(express.json());
app.use('/api/v1', mainRouter);

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
