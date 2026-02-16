import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import gameRoutes from './routes/game.routes';
import teamRoutes from './routes/team.routes';
import roundRoutes from './routes/round.routes';
import guessRoutes from './routes/guess.routes';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/games', gameRoutes);
app.use('/', teamRoutes); // Note: Team routes are mounted at root because some are nested under /games and some are not, handled in router
app.use('/', roundRoutes);
app.use('/', guessRoutes);

export default app;
