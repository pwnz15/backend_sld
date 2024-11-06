import { UserRole, IUser, ROLE_PERMISSIONS } from '../models/User';
import { AppError } from '../middleware/AppError';
import User from '../models/User';
import { generateToken } from '../services/authService';

export interface LoginDto {
    username: string;
    password: string;
}

export interface RegisterDto extends LoginDto {
    role: UserRole;
    customPermissions?: string[];
}

export const createUser = async (adminUser: IUser, registerDto: RegisterDto): Promise<{ user: IUser; token: string }> => {
    if (!adminUser.permissions.includes('manage:users')) {
        throw new AppError(403, 'Insufficient permissions');
    }

    const existingUser = await User.findOne({ username: registerDto.username });
    if (existingUser) {
        throw new AppError(400, 'Username already exists');
    }

    const user = new User({
        ...registerDto,
        permissions: registerDto.customPermissions || ROLE_PERMISSIONS[registerDto.role]
    });
    await user.save();

    const token = generateToken(user);
    return { user, token };
};

export const updateUserPermissions = async (
    adminUser: IUser,
    userId: string,
    permissions: string[]
): Promise<IUser> => {
    if (!adminUser.permissions.includes('manage:users')) {
        throw new AppError(403, 'Insufficient permissions');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(404, 'User not found');
    }

    user.permissions = permissions;
    await user.save();
    return user;
};