import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { LoginDto, RegisterDto } from '../dtos/authDto';
import { AppError } from '../middleware/errorHandler';

export const generateToken = (user: IUser): string => {
    return jwt.sign(
        { user: { id: user.id, username: user.username, role: user.role, permissions: user.permissions } },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
    );
};

export const register = async (registerDto: RegisterDto): Promise<{ user: IUser; token: string }> => {
    const existingUser = await User.findOne({ username: registerDto.username });
    if (existingUser) {
        throw new AppError(400, 'Username already exists');
    }

    const user = new User(registerDto);
    await user.save();

    const token = generateToken(user);
    return { user, token };
};

export const login = async (loginDto: LoginDto): Promise<{ user: IUser; token: string }> => {
    const user = await User.findOne({ username: loginDto.username });
    if (!user || !user.isActive) {
        throw new AppError(401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(loginDto.password);
    if (!isMatch) {
        throw new AppError(401, 'Invalid credentials');
    }

    const token = generateToken(user);
    return { user, token };
};