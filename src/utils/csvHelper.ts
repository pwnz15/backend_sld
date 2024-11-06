import { parse, Parser as CSVParser } from 'csv-parse';
import { stringify } from 'csv-stringify';
import fs from 'fs';
import { ArticleDto } from '../dtos/articleDto';
import { ClientDto } from '../dtos/clientDto';
import { Buffer } from 'buffer';

export const convertToCSV = async <T>(data: T[], headers: string[]): Promise<string> => {
    return new Promise((resolve, reject) => {
        stringify(data, {
            header: true,
            columns: headers
        }, (err: Error | undefined, output: string) => {
            if (err) reject(err);
            resolve(output);
        });
    });
};

export const parseCSV = async <T>(fileBuffer: Buffer): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        const parser = parse({ columns: true });

        parser.on('readable', function () {
            let record: T;
            while ((record = parser.read()) !== null) {
                results.push(record);
            }
        });

        parser.on('error', function (err: Error) {
            reject(err);
        });

        parser.on('end', function () {
            resolve(results);
        });

        parser.write(fileBuffer);
        parser.end();
    });
};