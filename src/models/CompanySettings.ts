// models/CompanySettings.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanySettings extends Document {
    name: string;
    address: string;
    tel: string;
    fax: string;
    commercialRegister: string;  // R.C
    taxId: string;              // C.D
    agency: string;             // Agence
    vatNumber: string;          // TVA
    bankAccount: string;        // C.C.B
    logo?: string;
}

const CompanySettingsSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    tel: { type: String, required: true },
    fax: { type: String },
    commercialRegister: { type: String, required: true },
    taxId: { type: String, required: true },
    agency: { type: String },
    vatNumber: { type: String, required: true },
    bankAccount: { type: String },
    logo: { type: String }
});

export default mongoose.model<ICompanySettings>('CompanySettings', CompanySettingsSchema);