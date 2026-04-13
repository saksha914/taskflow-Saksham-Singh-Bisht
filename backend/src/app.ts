import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/routes';
import projectRoutes from './modules/project/routes';
import taskRoutes from './modules/task/routes';
import { errorHandler } from './middleware/error';
import { requestLogger } from './middleware/requestLogger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

import userRoutes from './modules/user/routes';

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/', taskRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
