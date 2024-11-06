import { Request, Response } from 'express';
import DatabaseManager from '../config/db';
import * as ArticleService from '../services/articleService';
import { AppError } from '../middleware/errorHandler';
import { ArticleDto } from '../dtos/articleDto';

// Create a new article
export const createArticleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        // Verify database connection
        const isDbReady = await DatabaseManager.verifyConnection();
        
        if (!isDbReady) {
            throw new AppError(503, 'Database connection not available');
        }

        const article = await ArticleService.createArticle(req.body);
        res.status(201).json(article);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

// Get all articles
export const getArticlesHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const isDbReady = await DatabaseManager.verifyConnection();
        if (!isDbReady) {
            throw new AppError(503, 'Database connection not available');
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = req.query.search as string;

        const result = await ArticleService.getArticles(page, limit, search);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'Failed to fetch articles' });
        }
    }
};

// Get a single article by ID
export const getArticleByIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const isDbReady = await DatabaseManager.verifyConnection();
        if (!isDbReady) {
            throw new AppError(503, 'Database connection not available');
        }

        const article = await ArticleService.getArticleById(req.params.id);
        if (!article) {
            res.status(404).json({ error: 'Article not found' });
            return;
        }
        res.status(200).json(article);
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Update an article
export const updateArticleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const isDbReady = await DatabaseManager.verifyConnection();
        if (!isDbReady) {
            throw new AppError(503, 'Database connection not available');
        }

        const articleDto: ArticleDto = req.body;
        const article = await ArticleService.updateArticle(req.params.id, articleDto);
        if (!article) {
            res.status(404).json({ error: 'Article not found' });
            return;
        }
        res.status(200).json(article);
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Delete an article
export const deleteArticleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const isDbReady = await DatabaseManager.verifyConnection();
        if (!isDbReady) {
            throw new AppError(503, 'Database connection not available');
        }

        const article = await ArticleService.deleteArticle(req.params.id);
        if (!article) {
            res.status(404).json({ error: 'Article not found' });
            return;
        }
        res.status(200).json({ message: 'Article deleted' });
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};