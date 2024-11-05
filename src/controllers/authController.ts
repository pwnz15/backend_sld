import { Request, Response } from 'express';
import { register, login } from '../services/authService';
import { LoginDto, RegisterDto } from '../dtos/authDto';

export const registerHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const registerDto: RegisterDto = req.body;
        const result = await register(registerDto);
        res.status(201).json(result);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'Registration failed' });
        }
    }
};

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const loginDto: LoginDto = req.body;
        const result = await login(loginDto);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof Error) {
            res.status(401).json({ error: err.message });
        } else {
            res.status(401).json({ error: 'Login failed' });
        }
    }
};