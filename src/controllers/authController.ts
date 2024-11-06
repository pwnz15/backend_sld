import { Request, Response } from 'express';
import { register, login, getAllUsers, updateUser , deleteUser } from '../services/authService';
import { LoginDto, RegisterDto, createUser, updateUserPermissions } from '../dtos/authDto';
import { AppError } from '../middleware/AppError';

export const registerHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const registerDto: RegisterDto = req.body;
        const result = await register(registerDto);
        res.status(201).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
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

export const createUserHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Authentication required');
        }
        const registerDto: RegisterDto = req.body;
        const result = await createUser(req.user, registerDto);
        res.status(201).json(result);
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'User creation failed' });
        }
    }
};

export const updateUserPermissionsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Authentication required');
        }
        
        const userId = req.params.userId; // Get userId from route params
        const { permissions } = req.body;

        if (!userId || !permissions) {
            throw new AppError(400, 'Missing required fields');
        }

        const result = await updateUserPermissions(req.user, userId, permissions);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Permission update failed' });
        }
    }
};

// Add these new handlers
export const getAllUsersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const updateData = req.body;
    const user = await updateUser(userId, updateData);
    res.status(200).json(user);
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Update failed' });
    }
  }
};

export const deleteUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    await deleteUser(userId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Delete failed' });
    }
  }
};