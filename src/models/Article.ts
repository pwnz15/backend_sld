import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticle extends Document {
    Code: string;
    CodeBar: string;
    Designation: string;
    Stock: number;
    Famille: string;
    Marque: string;
    PrixAchatHT: number;
    MB: number;
    TVA: number;
    PventeTTC: number;
    PventePubHT: number;
    CodeFrs: string;
    IntituleFrs: string;
    DateCreation: Date;
    DateModification: Date;
    Ecrivain: string;
    Collection: string;
    RemiseFidelite: number;
    DernierePUHT: number;
    DerniereRemise: number;
}

interface IArticleModel extends Model<IArticle> {
    paginateArticles(page?: number, limit?: number, search?: string): Promise<{
        articles: IArticle[];
        total: number;
        pages: number;
        currentPage: number;
    }>;
}

const ArticleSchema = new Schema({
    Code: { type: String},
    CodeBar: { type: String, required : true ,unique: true },
    Designation: { type: String },
    Stock: { type: Number, default: 0 },
    Famille: { type: String },
    Marque: { type: String },
    PrixAchatHT: { type: Number, default: 0 },
    MB: { type: Number, default: 0 },
    TVA: { type: Number, default: 0 },
    PventeTTC: { type: Number, default: 0 },
    PventePubHT: { type: Number, default: 0 },
    CodeFrs: { type: String },
    IntituleFrs: { type: String },
    DateCreation: { type: Date },
    DateModification: { type: Date },
    Ecrivain: { type: String },
    Collection: { type: String },
    RemiseFidelite: { type: Number, default: 0 },
    DernierePUHT: { type: Number, default: 0 },
    DerniereRemise: { type: Number, default: 0 }
});

// Add text indexes for search
ArticleSchema.index({ CodeBar: 'text', Designation: 'text', Marque: 'text', Famille: 'text' });

// Add pagination and search method
ArticleSchema.statics.paginateArticles = async function(
    page = 1,
    limit = 50,
    search?: string
) {
    const skip = (page - 1) * limit;
    let query = {};

    if (search) {
        query = {
            $or: [
                { CodeBar: new RegExp(search, 'i') },
                { Code: new RegExp(search, 'i') },
                { Designation: new RegExp(search, 'i') },
                { Marque: new RegExp(search, 'i') },
                { Famille: new RegExp(search, 'i') }
            ]
        };
    }

    const [articles, total] = await Promise.all([
        this.find(query)
            .sort({ DateModification: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        articles,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
    };
};

export default mongoose.model<IArticle, IArticleModel>('Article', ArticleSchema);
