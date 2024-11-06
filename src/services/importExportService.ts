// src/services/importExportService.ts
import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parse';
import { stringify } from 'csv-stringify/sync';
import { ArticleDto } from '../dtos/articleDto';
import { ClientDto } from '../dtos/clientDto';
import Article from '../models/Article';
import Client from '../models/Client';


const parseFloatSafe = (value: string): number => {
    if (!value) return 0;
    // Handle French number format (replace , with .)
    return parseFloat(value.replace(',', '.')) || 0;
};

const convertToCSV = async <T>(data: T[], headers: string[]): Promise<string> => {
    try {
        const rows = data.map(item => {
            return headers.map(header => (item as any)[header] ?? '');
        });

        return stringify([headers, ...rows], {
            header: false,
            delimiter: ',',
        });
    } catch (error) {
        console.error('Error converting to CSV:', error);
        throw error;
    }
};

const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    // Handle French date format (DD/MM/YYYY)
    const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
};

export const importArticles = async (filePath: string): Promise<{ success: number; failed: number }> => {
    try {
        const articles: ArticleDto[] = await new Promise((resolve, reject) => {
            const results: ArticleDto[] = [];
            
            fs.createReadStream(filePath, { encoding: 'utf-8' })
                .pipe(csv.parse({
                    columns: true,
                    delimiter: ',',
                    skip_empty_lines: true,
                    trim: true,
                    bom: true // Handle BOM in UTF-8 files
                }))
                .on('data', (data) => {
                    try {
                        // Map CSV fields to ArticleDto
                        const article: ArticleDto = {
                            Code: data['Code']?.toString() || '',
                            CodeBar: data['Code à Bar']?.toString() || '',
                            Designation: data['Désignation']?.toString() || '',
                            Stock: parseFloatSafe(data['Stock']),
                            Famille: data['Famille']?.toString() || '',
                            Marque: data['Marque']?.toString() || '',
                            PrixAchatHT: parseFloatSafe(data['Prix Achat HT']),
                            MB: parseFloatSafe(data['MB%']),
                            TVA: parseFloatSafe(data['TVA']),
                            PventeTTC: parseFloatSafe(data['PventeTTC']),
                            PventePubHT: parseFloatSafe(data['Pvente Pub HT']),
                            CodeFrs: data['Code Frs']?.toString() || '',
                            IntituleFrs: data['Intitulé Frs']?.toString() || '',
                            DateCreation: parseDate(data['Date Creation']),
                            DateModification: data['Date Modification'] ? parseDate(data['Date Modification']) : new Date(),
                            Ecrivain: data['Ecrivain']?.toString() || '',
                            Collection: data['Collection']?.toString() || '',
                            RemiseFidelite: parseFloatSafe(data['Remise_Fidelite']),
                            DernierePUHT: parseFloatSafe(data['Dernière PUHT']),
                            DerniereRemise: parseFloatSafe(data['Dernière remise'])
                        };

                        // Only add valid articles
                        if (article.Code) {
                            results.push(article);
                        }
                    } catch (error) {
                        console.error('Error processing row:', error);
                    }
                })
                .on('end', () => {
                    console.log(`Parsed ${results.length} valid articles`);
                    resolve(results);
                })
                .on('error', (error) => {
                    console.error('CSV parsing error:', error);
                    reject(error);
                });
        });

        let successCount = 0;
        let failedCount = 0;

        // Use bulkWrite for better performance
        const operations = articles.map(article => ({
            updateOne: {
                filter: { Code: article.Code },
                update: { $set: article },
                upsert: true
            }
        }));

        const batchSize = 100;
        for (let i = 0; i < operations.length; i += batchSize) {
            const batch = operations.slice(i, i + batchSize);
            try {
                const result = await Article.bulkWrite(batch);
                successCount += result.upsertedCount + result.modifiedCount;
                console.log(`Processed batch ${Math.floor(i/batchSize) + 1}, success: ${result.upsertedCount + result.modifiedCount}`);
            } catch (error) {
                failedCount += batch.length;
                console.error('Batch insert error:', error);
            }
        }

        console.log(`Import completed. Success: ${successCount}, Failed: ${failedCount}`);
        
        // Verify final count
        const dbCount = await Article.countDocuments();
        console.log(`Total documents in database: ${dbCount}`);
        
        return { success: successCount, failed: failedCount };

    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    }
};

export const importClients = async (filePath: string): Promise<{ success: number; failed: number }> => {
    try {
        const clients: ClientDto[] = await new Promise((resolve, reject) => {
            const results: ClientDto[] = [];

            fs.createReadStream(filePath, { encoding: 'utf-8' })
                .pipe(csv.parse({
                    columns: true,
                    delimiter: ',',
                    skip_empty_lines: true,
                    trim: true,
                    bom: true
                }))
                .on('data', (data) => {
                    try {
                        // Clean and validate data
                        const client: ClientDto = {
                            CodeClient: data['Code Client']?.toString().trim() || '',
                            Intitule: data['Intitulé']?.toString().trim() || '',
                            Tel1: data['Tél 1']?.toString().trim() || '',
                            Tel2: data['Tél 2']?.toString().trim() || '',
                            Profession: data['Profession']?.toString().trim() || '',
                            Societe: data['Société']?.toString().trim() || '',
                            Mail: data['Mail']?.toString().trim() || undefined, // Use undefined instead of null
                            Adresse: data['Adresse']?.toString().trim() || ''
                        };

                        if (client.CodeClient) {
                            results.push(client);
                        }
                    } catch (error) {
                        console.error('Error processing client row:', error);
                    }
                })
                .on('end', () => resolve(results))
                .on('error', reject);
        });

        // Drop existing indexes to avoid conflicts
        await Client.collection.dropIndexes();

        // Recreate necessary indexes
        await Client.collection.createIndex({ CodeClient: 1 }, { unique: true });
        await Client.collection.createIndex({ Societe: 1 });
        await Client.collection.createIndex({ Mail: 1 }, { sparse: true });

        let successCount = 0;
        let failedCount = 0;

        // Process in batches
        const batchSize = 100;
        for (let i = 0; i < clients.length; i += batchSize) {
            const batch = clients.slice(i, i + batchSize);
            try {
                const operations = batch.map(client => ({
                    updateOne: {
                        filter: { CodeClient: client.CodeClient },
                        update: { $set: client },
                        upsert: true
                    }
                }));

                const result = await Client.bulkWrite(operations, { ordered: false });
                successCount += result.upsertedCount + result.modifiedCount;

                if (successCount % 500 === 0) {
                    console.log(`Processed ${successCount} clients`);
                }
            } catch (error) {
                console.error(`Batch processing error:`, error);
                failedCount += batch.length;
            }
        }

        return { success: successCount, failed: failedCount };

    } catch (error) {
        console.error('Client import failed:', error);
        throw error;
    }
};

// Define types for field mappings
type CSVHeaders = 'Code Client' | 'Intitulé' | 'Tél 1' | 'Tél 2' | 'Profession' | 'Société' | 'Mail' | 'Adresse';
type DBFields = 'CodeClient' | 'Intitule' | 'Tel1' | 'Tel2' | 'Profession' | 'Societe' | 'Mail' | 'Adresse';

const clientFieldMapping: Record<CSVHeaders, DBFields> = {
    'Code Client': 'CodeClient',
    'Intitulé': 'Intitule',
    'Tél 1': 'Tel1',
    'Tél 2': 'Tel2',
    'Profession': 'Profession',
    'Société': 'Societe',
    'Mail': 'Mail',
    'Adresse': 'Adresse'
};

export const exportArticles = async (): Promise<string> => {
    try {
        const articles = await Article.find({}, {
            _id: 0,
            __v: 0,
            createdAt: 0,
            updatedAt: 0
        }).lean();

        const headers = [
            'Code',
            'CodeBar',
            'Designation',
            'Stock',
            'Famille',
            'Marque',
            'PrixAchatHT',
            'MB',
            'TVA',
            'PventeTTC',
            'PventePubHT',
            'CodeFrs',
            'IntituleFrs',
            'DateCreation',
            'DateModification',
            'Ecrivain',
            'Collection',
            'RemiseFidelite',
            'DernierePUHT',
            'DerniereRemise'
        ];

        return await convertToCSV(articles, headers);
    } catch (error) {
        console.error('Export articles error:', error);
        throw error;
    }
};

export const exportClients = async (): Promise<string> => {
    try {
        const clients = await Client.find({}, {
            _id: 0,
            __v: 0,
            createdAt: 0,
            updatedAt: 0
        }).lean();

        const headers: CSVHeaders[] = [
            'Code Client',
            'Intitulé',
            'Tél 1',
            'Tél 2',
            'Profession',
            'Société',
            'Mail',
            'Adresse'
        ];

        // Transform data to match CSV headers
        const transformedData = clients.map(client => {
            const transformed: Record<CSVHeaders, string> = {} as Record<CSVHeaders, string>;
            headers.forEach(header => {
                const dbField = clientFieldMapping[header];
                transformed[header] = (client as Record<DBFields, string>)[dbField] || '';
            });
            return transformed;
        });

        return await convertToCSV(transformedData, headers);
    } catch (error) {
        console.error('Export clients error:', error);
        throw error;
    }
};
