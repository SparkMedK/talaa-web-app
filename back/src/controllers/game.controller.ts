import { Request, Response } from 'express';
import * as gameService from '../services/game.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createGame = async (req: Request, res: Response) => {
    try {
        const { nickname } = req.body;
        const result = await gameService.createGame({ nickname });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getGame = async (req: Request, res: Response) => {
    try {
        const result = await gameService.getGameState(req.params.gameId as string);
        res.json(result);
    } catch (error) {
        res.status(404).json({ message: (error as Error).message });
    }
};

export const startGame = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id.toString();
        const result = await gameService.startGame(req.params.gameId as string, userId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const restartGame = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id.toString();
        const result = await gameService.restartGame(req.params.gameId as string, userId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const joinGame = async (req: Request, res: Response) => {
    try {
        const { nickname } = req.body;
        const result = await gameService.joinGame(req.params.gameId as string, nickname);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const leaveGame = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id.toString();
        await gameService.leaveGame(req.params.gameId as string, userId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const kickPlayer = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user._id.toString();
        const { playerId } = req.body;
        await gameService.kickPlayer(req.params.gameId as string, adminId, playerId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};
