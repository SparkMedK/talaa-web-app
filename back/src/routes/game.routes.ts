import { Router } from 'express';
import * as gameController from '../controllers/game.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', gameController.createGame);
router.get('/:gameId', gameController.getGame);
router.post('/:gameId/start', authenticate, gameController.startGame);
router.post('/:gameId/restart', authenticate, gameController.restartGame);

// Player routes
router.post('/:gameId/join', gameController.joinGame);
router.post('/:gameId/leave', authenticate, gameController.leaveGame);
router.post('/:gameId/kick', authenticate, gameController.kickPlayer);

export default router;
