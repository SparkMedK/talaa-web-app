import { Router } from 'express';
import * as guessController from '../controllers/guess.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// /turns/:turnId/guess
router.post('/turns/:turnId/guess', authenticate, guessController.submitGuess);

export default router;
