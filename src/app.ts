import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './config/db';
import dotenv from 'dotenv';
import logger from './middleware/logger';
import { configureSecurityMiddleware } from './middleware/security';
import compression from 'compression';
import { errorHandler } from './middleware/errorHandler';



dotenv.config();

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        const app = express();

        // Security middleware
        configureSecurityMiddleware(app);

        // Middleware
        app.use(cors());
        app.use(compression()); // Add compression
        app.use(bodyParser.json({ limit: '10mb' })); // Limit payload size
        app.use(logger);
        app.use(errorHandler);

        // Error handling middleware
        app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Something went wrong!' });
        });

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