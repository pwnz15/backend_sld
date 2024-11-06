// src/controllers/importExportController.ts
import { Request, Response } from 'express';
import { promises as fsPromises } from 'fs';
import { importArticles, importClients, exportArticles, exportClients } from '../services/importExportService';
import Client from '../models/Client';

// Helper function for file cleanup
const cleanupFile = async (filePath: string): Promise<void> => {
    try {
        await fsPromises.unlink(filePath);
    } catch (error) {
        console.error('Error cleaning up file:', error);
    }
};

const resetIndexes = async () => {
    try {
        await Client.collection.dropIndexes();
        console.log('Dropped existing indexes');

        await Client.collection.createIndex({ CodeClient: 1 }, { unique: true });
        await Client.collection.createIndex({ Societe: 1 });
        await Client.collection.createIndex({ Mail: 1 }, { sparse: true });
        console.log('Created new indexes');
    } catch (error) {
        console.error('Error resetting indexes:', error);
    }
};

export const importArticlesHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const result = await importArticles(req.file.path);
        await cleanupFile(req.file.path);

        res.status(200).json({
            message: 'Articles imported successfully',
            successCount: result.success,
            failedCount: result.failed
        });
    } catch (err) {
        if (req.file) {
            await cleanupFile(req.file.path);
        }
        res.status(500).json({ error: err instanceof Error ? err.message : 'Import failed' });
    }
};

export const importClientsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        await resetIndexes();
        const result = await importClients(req.file.path);
        await cleanupFile(req.file.path);

        res.status(200).json({
            message: 'Clients imported successfully',
            successCount: result.success,
            failedCount: result.failed
        });
    } catch (err) {
        if (req.file) {
            await cleanupFile(req.file.path);
        }
        res.status(500).json({ error: err instanceof Error ? err.message : 'Import failed' });
    }
};

export const exportArticlesHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const csv = await exportArticles();
        res.header('Content-Type', 'text/csv');
        res.attachment('articles.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Export failed' });
    }
};

export const exportClientsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const csv = await exportClients();
        res.header('Content-Type', 'text/csv');
        res.attachment('clients.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Export failed' });
    }
};