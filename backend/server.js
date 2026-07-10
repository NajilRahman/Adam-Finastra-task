import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import * as socketConfig from './config/socket.js';
import logger from './utils/logger.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Configure env variables
dotenv.config();

// Verify required env variables in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnv = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
  const missing = requiredEnv.filter((env) => !process.env[env]);
  if (missing.length > 0) {
    logger.error(`CRITICAL CONFIG ERROR: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// Connect to Database and Auto-Seed
import { seedDB } from './scripts/seed.js';

connectDB().then(async () => {
  try {
    await seedDB(false);
  } catch (err) {
    logger.error(`Auto-seeding failed: ${err.message}`);
  }
});

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
socketConfig.init(server);

const PORT = process.env.PORT || 5000;
const nodeServer = server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down gracefully...');
  logger.error(err.name, err.message);
  nodeServer.close(() => {
    process.exit(1);
  });
});
