import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriver extends Document {
    name: string;
    phoneNumber: string;
    licenses: Array<{
        number: string;
        type: string;
        expiryDate: Date;
    }>;
    address?: string;
    email?: string;
    status: 'ACTIVE' | 'INACTIVE';
    notes?: string;
}

interface IDriverModel extends Model<IDriver> {
    paginateDrivers(page?: number, limit?: number, search?: string): Promise<{
        drivers: IDriver[];
        total: number;
        pages: number;
        currentPage: number;
    }>;
}

const DriverSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    licenses: [{
        number: { type: String, required: true },
        type: { type: String, required: true },
        expiryDate: { type: Date, required: true }
    }],
    address: {
        type: String
    },
    email: {
        type: String,
        sparse: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Add indexes
DriverSchema.index({ phoneNumber: 1 });
DriverSchema.index({ email: 1 }, { sparse: true });
DriverSchema.index({ 'licenses.number': 1 });

// Add text indexes for search
DriverSchema.index({ name: 'text', email: 'text', phoneNumber: 'text' });

// Add pagination and search method
DriverSchema.statics.paginateDrivers = async function(
    page = 1,
    limit = 50,
    search?: string
) {
    const skip = (page - 1) * limit;
    let query = {};

    if (search) {
        query = {
            $or: [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { phoneNumber: new RegExp(search, 'i') }
            ]
        };
    }

    const [drivers, total] = await Promise.all([
        this.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        drivers,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
    };
};

export default mongoose.model<IDriver, IDriverModel>('Driver', DriverSchema);