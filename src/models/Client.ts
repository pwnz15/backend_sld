// src/models/Client.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Define interface for static methods
interface IClientModel extends Model<IClient> {
  paginateClients(page?: number, limit?: number, search?: string): Promise<{
    clients: IClient[];
    total: number;
    pages: number;
    currentPage: number;
  }>;
  bulkUpsertClients(clients: any[]): Promise<{
    success: number;
    failed: number;
  }>;
}

export interface IClient extends Document {
  CodeClient: string;
  Intitule: string;
  Tel1: string;
  Tel2: string;
  Profession: string;
  Societe: string;
  Mail: string;
  Adresse: string;
}

const ClientSchema = new Schema({
  CodeClient: { type: String, required: true, unique: true },
  Intitule: String,
  Tel1: String,
  Tel2: String,
  Profession: String,
  Societe: String,
  Mail: { 
    type: String,
    sparse: true // This allows multiple null values
  },
  Adresse: String
}, {
  timestamps: true
});

// Update indexes
ClientSchema.index({ CodeClient: 1 });
ClientSchema.index({ Societe: 1 });
ClientSchema.index({ Mail: 1 }, { sparse: true }); // Add sparse index if you need to query by email


// Define static methods with proper typing
ClientSchema.statics.paginateClients = async function(
  page = 1, 
  limit = 50,
  search?: string
) {
  const skip = (page - 1) * limit;
  let query = {};
  
  if (search) {
    query = {
      $or: [
        { CodeClient: new RegExp(search, 'i') },
        { Intitule: new RegExp(search, 'i') },
        { Societe: new RegExp(search, 'i') }
      ]
    };
  }

  const [clients, total] = await Promise.all([
    this.find(query)
      .sort({ CodeClient: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    clients,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

// Bulk operations method
ClientSchema.statics.bulkUpsertClients = async function (clients: any[]) {
  const batchSize = 1000;
  const results = {
    success: 0,
    failed: 0
  };

  for (let i = 0; i < clients.length; i += batchSize) {
    try {
      const batch = clients.slice(i, i + batchSize);
      const operations = batch.map(client => ({
        updateOne: {
          filter: { CodeClient: client.CodeClient },
          update: { $set: client },
          upsert: true
        }
      }));

      const result = await this.bulkWrite(operations);
      results.success += result.modifiedCount + result.upsertedCount;
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}`);
    } catch (error) {
      results.failed += batchSize;
      console.error(`Batch ${i / batchSize} failed:`, error);
    }
  }

  return results;
};

// Data validation
ClientSchema.pre('save', function (next) {
  if (this.Mail && !this.Mail.includes('@')) {
    next(new Error('Invalid email format'));
  }
  if (this.Tel1 && !/^\d[\d\s-]*\d$/.test(this.Tel1)) {
    next(new Error('Invalid phone format'));
  }
  next();
});

export default mongoose.model<IClient, IClientModel>('Client', ClientSchema);