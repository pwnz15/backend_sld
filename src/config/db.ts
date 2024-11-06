// src/config/db.ts
import mongoose from 'mongoose';

export const verifyDatabase = async (): Promise<boolean> => {
  try {
    return mongoose.connection.readyState === 1;
  } catch (error) {
    console.error('Database verification failed:', error);
    return false;
  }
};

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sld');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;