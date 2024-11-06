// src/config/db.ts
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

export const dbEmitter = new EventEmitter();

export class DatabaseManager {
  private static instance: DatabaseManager;
  private retryAttempts = 5;
  private retryDelay = 5000;
  private isConnecting = false;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnecting) return;
    this.isConnecting = true;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sld', {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          maxPoolSize: 50
        });

        console.log('MongoDB connected successfully');
        this.setupListeners();
        this.isConnecting = false;
        dbEmitter.emit('connected');
        return;
      } catch (error) {
        console.error(`Connection attempt ${attempt} failed:`, error);
        if (attempt === this.retryAttempts) {
          this.isConnecting = false;
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  private setupListeners(): void {
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      dbEmitter.emit('disconnected');
      this.connect().catch(console.error);
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB error:', error);
      dbEmitter.emit('error', error);
    });

    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  private async gracefulShutdown(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  async verifyConnection(): Promise<boolean> {
    return mongoose.connection.readyState === 1;
  }
}

export default DatabaseManager.getInstance();
