import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import vacancyRequestRoutes from './routes/vacancyRequest.routes';
import vacancyRoutes from './routes/vacancy.routes';
import publicRoutes from './routes/public.routes';
import jobRoutes from './routes/job.routes';
import candidateRoutes from './routes/candidate.routes';
import applicationRoutes from './routes/application.routes';
import evaluationRoutes from './routes/evaluation.routes';
import managerRoutes from './routes/manager.routes';
import userRoutes from './routes/user.routes';
import testRoutes from './routes/test.routes';
import interviewRoutes from './routes/interview.routes';
import notificationRoutes from './routes/notification.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vacancy-requests', vacancyRequestRoutes);
app.use('/api/vacancies', vacancyRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/applications', evaluationRoutes); // Evaluation routes (mounted on /applications)
app.use('/api/applications', applicationRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/users', userRoutes);
app.use('/api', testRoutes); // Test routes (includes /vacancies/:id/test and /applications/:id/test)
app.use('/api', interviewRoutes); // Interview routes (includes /applications/:id/interviews and /interviewer/interviews)
app.use('/api/notifications', notificationRoutes); // Notification routes

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;

