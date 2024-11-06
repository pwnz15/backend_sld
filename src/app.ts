import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { DatabaseManager } from './config/db';
import { CacheManager } from './config/cache';
import dotenv from 'dotenv';
import logger from './middleware/logger';
import { configureSecurityMiddleware } from './middleware/security';
import compression from 'compression';
import { createRateLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const startServer = async () => {
    try {
        const app = express();

        // Connect to database
        await DatabaseManager.getInstance().connect();

        // Initialize cache
        const cache = CacheManager.getInstance();

        // Security middleware
        configureSecurityMiddleware(app);

        // Middleware
        app.use(cors());
        app.use(compression()); // Add compression
        app.use(bodyParser.json({ limit: '10mb' })); // Limit payload size
        app.use(logger);

        // Apply rate limiting
        app.use(createRateLimiter());

        // Error handling middleware
        app.use(errorHandler);

        // Routes
        app.use('/api/articles', require('./routes/articleRoutes').default);
        app.use('/api/clients', require('./routes/clientRoutes').default);
        app.use('/api/drivers', require('./routes/driverRoutes').default);
        app.use('/api/auth', require('./routes/authRoutes').default);
        app.use('/api/invoices', require('./routes/invoiceRoutes').default);

        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.info('SIGTERM signal received.');
            server.close(() => {
                console.log('Server closed.');
                process.exit(0);
            });
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();