import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
<<<<<<< HEAD
import { DatabaseManager } from './config/db';
import { CacheManager } from './config/cache';
=======
import connectDB from './config/db';
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
import dotenv from 'dotenv';
import logger from './middleware/logger';
import { configureSecurityMiddleware } from './middleware/security';
import compression from 'compression';
<<<<<<< HEAD
import { createRateLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';

=======
import { errorHandler } from './middleware/errorHandler';



>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
dotenv.config();

const startServer = async () => {
    try {
<<<<<<< HEAD
        const app = express();

        // Connect to database
        await DatabaseManager.getInstance().connect();

        // Initialize cache
        const cache = CacheManager.getInstance();

=======
        // Connect to MongoDB
        await connectDB();

        const app = express();

>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
        // Security middleware
        configureSecurityMiddleware(app);

        // Middleware
        app.use(cors());
        app.use(compression()); // Add compression
        app.use(bodyParser.json({ limit: '10mb' })); // Limit payload size
        app.use(logger);
<<<<<<< HEAD

        // Apply rate limiting
        app.use(createRateLimiter());

        // Error handling middleware
        app.use(errorHandler);
=======
        app.use(errorHandler);

        // Error handling middleware
        app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Something went wrong!' });
        });
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624

        // Routes
        app.use('/api/articles', require('./routes/articleRoutes').default);
        app.use('/api/clients', require('./routes/clientRoutes').default);
        app.use('/api/drivers', require('./routes/driverRoutes').default);
        app.use('/api/auth', require('./routes/authRoutes').default);
        app.use('/api/invoices', require('./routes/invoiceRoutes').default);

<<<<<<< HEAD
=======


>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
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