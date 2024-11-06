import { Request, Response } from 'express';
import { createDriver, getDrivers, getDriverById, updateDriver, deleteDriver } from '../services/driverService';
import { DriverDto } from '../dtos/driverDto';

export const createDriverHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const driverDto: DriverDto = req.body;
        const driver = await createDriver(driverDto);
        res.status(201).json(driver);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

export const getDriversHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = req.query.search as string;

        const result = await getDrivers(page, limit, search);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'Failed to fetch drivers' });
        }
    }
};

export const getDriverByIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const driver = await getDriverById(req.params.id);
        if (!driver) {
            res.status(404).json({ error: 'Driver not found' });
            return;
        }
        res.status(200).json(driver);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

export const updateDriverHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const driverDto: DriverDto = req.body;
        const driver = await updateDriver(req.params.id, driverDto);
        if (!driver) {
            res.status(404).json({ error: 'Driver not found' });
            return;
        }
        res.status(200).json(driver);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

export const deleteDriverHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const driver = await deleteDriver(req.params.id);
        if (!driver) {
            res.status(404).json({ error: 'Driver not found' });
            return;
        }
        res.status(200).json({ message: 'Driver deleted' });
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};