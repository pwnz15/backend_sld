import Article, { IArticle } from '../models/Article';
import { ArticleDto } from '../dtos/articleDto';

export const createArticle = async (articleDto: ArticleDto): Promise<IArticle> => {
    const article = new Article(articleDto);
    return await article.save();
};

export const getArticles = async (
    page: number = 1,
    limit: number = 50,
    search?: string
): Promise<{
    articles: IArticle[];
    total: number;
    pages: number;
    currentPage: number;
}> => {
    try {
        return await Article.paginateArticles(page, limit, search);
    } catch (error) {
        console.error('Error fetching articles:', error);
        throw error;
    }
};

export const getArticleById = async (id: string): Promise<IArticle | null> => {
    return await Article.findById(id);
};

export const updateArticle = async (id: string, articleDto: ArticleDto): Promise<IArticle | null> => {
    return await Article.findByIdAndUpdate(id, articleDto, { new: true });
};

export const deleteArticle = async (id: string): Promise<IArticle | null> => {
    return await Article.findByIdAndDelete(id);
};

export const searchArticles = async (query: string): Promise<IArticle[]> => {
    return Article.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
};