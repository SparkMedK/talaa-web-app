import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        // For endpoints that don't require auth (like creating a game), we might skip this.
        // However, the docs say "All POST requests with game/round/turn modification require x-user-id header."
        // We will apply this middleware to specific routes.
        res.status(401).json({ message: 'Authentication required' });
        return;
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error during authentication' });
    }
};
