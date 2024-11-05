import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'commercial' | 'caissier' | 'vendeuse' | 'manager_foire' | 'manager_grossiste' | 'admin';

export interface IUser extends Document {
    username: string;
    password: string;
    role: UserRole;
    permissions: string[];
    isActive: boolean;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['commercial', 'caissier', 'vendeuse', 'manager_foire', 'manager_grossiste', 'admin'],
        required: true
    },
    permissions: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Add role-based permissions
export const ROLE_PERMISSIONS = {
    admin: [
        'manage:users',
        'manage:invoices',
        'manage:inventory',
        'manage:sales',
        'manage:clients',
        'manage:drivers',
        'view:reports',
        'view:inventory',
        'view:clients',
        'view:drivers',
        'view:invoices'
    ],
    manager_foire: [
        'manage:inventory',
        'manage:sales',
        'manage:clients',
        'manage:drivers',
        'view:reports',
        'view:inventory',
        'view:clients',
        'view:drivers'
    ],
    manager_grossiste: [
        'manage:inventory',
        'manage:sales',
        'manage:clients',
        'manage:drivers',
        'view:reports',
        'view:inventory',
        'view:clients',
        'view:drivers'
    ],
    commercial: [
        'manage:sales',
        'manage:clients',
        'view:inventory',
        'view:clients',
        'view:reports'
    ],
    caissier: [
        'manage:sales',
        'view:inventory',
        'view:clients',
        'view:reports'
    ],
    vendeuse: [
        'manage:sales',
        'view:inventory',
        'view:clients'
    ]
};

// Pre-save middleware to set permissions based on role
UserSchema.pre('save', async function (next) {
    if (this.isModified('role') || this.isNew) {
        this.permissions = ROLE_PERMISSIONS[this.role] || [];
    }
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);