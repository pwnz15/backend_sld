import mongoose from 'mongoose';
import Article from '../models/Article'; // Adjust the path as needed
import Client from '../models/Client'; // Adjust the path as needed

const connectDB = async () => {
    try {
        const options = {
            autoIndex: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            heartbeatFrequencyMS: 10000
        };

        console.log('Attempting to connect to MongoDB...');

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
            console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        await mongoose.connect(process.env.MONGODB_URI!, options);

    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

// Add this to your db.ts or create a new utility
export const verifyDatabase = async () => {
    try {
        const count = await Article.countDocuments();
        console.log(`Current article count in database: ${count}`);
        
        const sample = await Article.findOne();
        if (sample) {
            console.log('Sample document:', sample);
        }
        
        return true;
    } catch (error) {
        console.error('Database verification failed:', error);
        return false;
    }
};

export default connectDB;