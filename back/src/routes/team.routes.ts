import { Router } from 'express';
import * as teamController from '../controllers/team.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// /games/:gameId/teams
router.post('/games/:gameId/teams', authenticate, teamController.createTeams);

// /teams/:teamId/assign
router.post('/teams/:teamId/assign', authenticate, teamController.assignPlayer);

// /teams/:teamId/remove
router.post('/teams/:teamId/remove', authenticate, teamController.removePlayer);

export default router;
