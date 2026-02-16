import { Request, Response } from 'express';
import * as roundService from '../services/round.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createRound = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user._id.toString();
        const result = await roundService.createRound(req.params.gameId as string, adminId);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const startTurn = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id.toString();
        const result = await roundService.startTurn(req.params.roundId as string, userId);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const endTurn = async (req: AuthRequest, res: Response) => {
    try {
        // Any user can trigger end turn? Or only the describer? Or admin?
        // Docs say "End a turn (auto after duration or manually)"
        // Assuming public for now or same user. Let's allow any auth user for simplicity/sync.
        const result = await roundService.endTurn(req.params.turnId as string);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};
