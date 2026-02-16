import { Router } from 'express';
import * as roundController from '../controllers/round.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// /games/:gameId/rounds
router.post('/games/:gameId/rounds', authenticate, roundController.createRound);

// /rounds/:roundId/turns/start
router.post('/rounds/:roundId/turns/start', authenticate, roundController.startTurn);

// /turns/:turnId/end
router.post('/turns/:turnId/end', authenticate, roundController.endTurn);

export default router;
