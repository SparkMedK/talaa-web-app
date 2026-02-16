import { Request, Response } from 'express';
import * as guessService from '../services/guess.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const submitGuess = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        const { input } = req.body;
        if (!input) {
            res.status(400).json({ message: 'Input is required' });
            return;
        }
        const result = await guessService.submitGuess(req.params.turnId as string, userId.toString(), input);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};
