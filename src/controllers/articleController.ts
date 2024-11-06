import { Request, Response } from 'express';
<<<<<<< HEAD
import DatabaseManager from '../config/db';
import * as ArticleService from '../services/articleService';
import { AppError } from '../middleware/errorHandler';
import { ArticleDto } from '../dtos/articleDto';
=======
import { createArticle, getArticles, getArticleById, updateArticle, deleteArticle } from '../services/articleService';
import { ArticleDto } from '../dtos/articleDto';
import { verifyDatabase } from '../config/db';
import connectDB from '../config/db';
// Add this import
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624

// Create a new article
export const createArticleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
<<<<<<< HEAD
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
=======
        // Verify database connection first
        const isDbReady = await verifyDatabase();
        if (!isDbReady) {
            res.status(500).json({ error: 'Database connection issue' });
            return;
        }

        const articleDto: ArticleDto = req.body;
        const article = await createArticle(articleDto);
        res.status(201).json(article);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create article' });
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
    }
};

// Get all articles
export const getArticlesHandler = async (req: Request, res: Response): Promise<void> => {
    try {
<<<<<<< HEAD
        const isDbReady = await DatabaseManager.verifyConnection();
        if (!isDbReady) {
            throw new AppError(503, 'Database connection not available');
        }

=======
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = req.query.search as string;

<<<<<<< HEAD
        const result = await ArticleService.getArticles(page, limit, search);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
=======
        const result = await getArticles(page, limit, search);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
        } else {
            res.status(400).json({ error: 'Failed to fetch articles' });
        }
    }
};

// Get a single article by ID
export const getArticleByIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
<<<<<<< HEAD
        const isDbReady = await DatabaseManager.verifyConnection();
        if (!isDbReady) {
            throw new AppError(503, 'Database connection not available');
        }

        const article = await ArticleService.getArticleById(req.params.id);
=======
        const article = await getArticleById(req.params.id);
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
        if (!article) {
            res.status(404).json({ error: 'Article not found' });
            return;
        }
        res.status(200).json(article);
    } catch (err) {
<<<<<<< HEAD
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
=======
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Update an article
export const updateArticleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
<<<<<<< HEAD
        const isDbReady = await DatabaseManager.verifyConnection();
        if (!isDbReady) {
            throw new AppError(503, 'Database connection not available');
        }

        const articleDto: ArticleDto = req.body;
        const article = await ArticleService.updateArticle(req.params.id, articleDto);
=======
        const articleDto: ArticleDto = req.body;
        const article = await updateArticle(req.params.id, articleDto);
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
        if (!article) {
            res.status(404).json({ error: 'Article not found' });
            return;
        }
        res.status(200).json(article);
    } catch (err) {
<<<<<<< HEAD
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
=======
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Delete an article
export const deleteArticleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
<<<<<<< HEAD
        const isDbReady = await DatabaseManager.verifyConnection();
        if (!isDbReady) {
            throw new AppError(503, 'Database connection not available');
        }

        const article = await ArticleService.deleteArticle(req.params.id);
=======
        const article = await deleteArticle(req.params.id);
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
        if (!article) {
            res.status(404).json({ error: 'Article not found' });
            return;
        }
        res.status(200).json({ message: 'Article deleted' });
    } catch (err) {
<<<<<<< HEAD
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
=======
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};