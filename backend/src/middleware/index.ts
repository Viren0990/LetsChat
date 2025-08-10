import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            userId?: string; 
        }
    }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("authorization") || "";

    console.log('Cookie:', req.cookies); // Log all cookies to verify the presence of 'token'
    console.log('Extracted Token:', token);

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        
        req.userId = (decoded as any).id; 
        console.log('Decoded User ID:', req.userId);
        
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;
