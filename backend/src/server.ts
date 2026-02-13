import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/database';
import connectCloudinary from './config/cloudinary';
import logger from './config/logger';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
  process.exit(1);
}

// Connect to database
connectDB();

// Configure Cloudinary
connectCloudinary();

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log(`🚀 PrepX Server is running`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API: http://localhost:${PORT}/api/v1`);
  console.log('='.repeat(50));
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
