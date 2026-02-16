import { Request, Response } from 'express';
import * as teamService from '../services/team.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createTeams = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user._id;
        const { name, names } = req.body;
        // Support both single name and array of names
        let teamNames: string[];
        if (name && typeof name === 'string') {
            // Single team creation
            teamNames = [name];
        } else if (names && Array.isArray(names)) {
            // Multiple teams creation
            teamNames = names;
        } else {
            res.status(400).json({ message: 'Either "name" (string) or "names" (array) is required' });
            return;
        }

        const result = await teamService.createTeams(req.params.gameId as string, adminId.toString(), teamNames);

        // If single team was created, return just that team instead of array
        if (name && typeof name === 'string') {
            res.status(201).json(result[0]);
        } else {
            res.status(201).json(result);
        }
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const assignPlayer = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user._id.toString();
        const { userId } = req.body;
        const result = await teamService.assignPlayer(req.params.teamId as string, adminId, userId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const removePlayer = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user._id.toString();
        const { userId } = req.body;
        await teamService.removePlayer(req.params.teamId as string, adminId, userId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};
