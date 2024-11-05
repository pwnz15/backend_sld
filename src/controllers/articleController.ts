import { Request, Response } from 'express';
import { createArticle, getArticles, getArticleById, updateArticle, deleteArticle } from '../services/articleService';
import { ArticleDto } from '../dtos/articleDto';
import { verifyDatabase } from '../config/db'; // Add this import

// Create a new article
export const createArticleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        // Verify database connection first
        const isDbReady = await verifyDatabase();
        if (!isDbReady) {
            res.status(500).json({ error: 'Database connection issue' });
            return;
        }

        const articleDto: ArticleDto = req.body;
        const article = await createArticle(articleDto);
        res.status(201).json(article);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Get all articles
export const getArticlesHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = req.query.search as string;

        const result = await getArticles(page, limit, search);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'Failed to fetch articles' });
        }
    }
};

// Get a single article by ID
export const getArticleByIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const article = await getArticleById(req.params.id);
        if (!article) {
            res.status(404).json({ error: 'Article not found' });
            return;
        }
        res.status(200).json(article);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Update an article
export const updateArticleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const articleDto: ArticleDto = req.body;
        const article = await updateArticle(req.params.id, articleDto);
        if (!article) {
            res.status(404).json({ error: 'Article not found' });
            return;
        }
        res.status(200).json(article);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Delete an article
export const deleteArticleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const article = await deleteArticle(req.params.id);
        if (!article) {
            res.status(404).json({ error: 'Article not found' });
            return;
        }
        res.status(200).json({ message: 'Article deleted' });
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};