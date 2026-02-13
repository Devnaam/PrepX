import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFound } from './middleware/errorHandler';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'PrepX API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.get('/api/v1', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to PrepX API v1',
    version: '1.0.0',
    docs: '/api/v1/docs',
  });
});

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import questionRoutes from './routes/question.routes';
import statsRoutes from './routes/stats.routes';

// Use routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/stats', statsRoutes);

// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/questions', questionRoutes);
// app.use('/api/v1/stats', statsRoutes);
// app.use('/api/v1/posts', postRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
