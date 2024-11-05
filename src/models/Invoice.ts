// src/models/Invoice.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { IArticle } from './Article';
import { IClient } from './Client';
import { IDriver } from './Driver';
import { IUser } from './User';

interface IInvoiceModel extends Model<IInvoice> {
  generateInvoiceNumber(): Promise<string>;
  paginateInvoices(page?: number, limit?: number, filters?: any): Promise<{
    invoices: IInvoice[];
    total: number;
    pages: number;
    currentPage: number;
  }>;
}

export interface IInvoiceItem {
  article: IArticle['CodeBar'];
  quantity: number;
  unitPrice: number;
  discount: number;
  totalHT: number;
  totalTTC: number;
  tva: number;
}

export interface IInvoice extends Document {
  _id: Schema.Types.ObjectId
  invoiceNumber: string;
  client: IClient['_id'];
  driver?: IDriver['_id'];
  user: IUser['_id'];
  items: IInvoiceItem[];
  subTotalHT: number;
  totalDiscount: number;
  totalTVA: number;
  totalTTC: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  paymentMethod?: 'CASH' | 'CHECK' | 'BANK_TRANSFER';
  paymentReference?: string;
  paymentDate?: Date;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  termsAndConditions?: string;
  metadata: {
    createdBy: IUser['_id'];
    lastModifiedBy: IUser['_id'];
    lastModifiedDate: Date;
  };
}

const InvoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  driver: {
    type: Schema.Types.ObjectId,
    ref: 'Driver'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalHT: {
      type: Number,
      required: true
    },
    totalTTC: {
      type: Number,
      required: true
    },
    tva: {
      type: Number,
      required: true
    }
  }],
  subTotalHT: {
    type: Number,
    required: true
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  totalTVA: {
    type: Number,
    required: true
  },
  totalTTC: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'OVERDUE'],
    default: 'DRAFT',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PARTIAL', 'PAID'],
    default: 'UNPAID',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'CHECK', 'BANK_TRANSFER']
  },
  paymentReference: String,
  paymentDate: Date,
  issueDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  notes: String,
  termsAndConditions: String,
  metadata: {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastModifiedDate: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes
InvoiceSchema.index({ 'items.article': 1 });
InvoiceSchema.index({ createdAt: -1 });
InvoiceSchema.index({ totalTTC: 1 });

// Remove any old indexes that might cause conflicts
InvoiceSchema.pre('save', async function (next) {
  try {
    // Drop the problematic index if it exists
    await mongoose.connection.collection('invoices').dropIndex('number_1')
      .catch(() => { });
    next();
  } catch (error) {
    next();
  }
});

// Generate Invoice Number
InvoiceSchema.statics.generateInvoiceNumber = async function () {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const lastInvoice = await this.findOne({}, {}, { sort: { 'invoiceNumber': -1 } });
  let sequence = 1;

  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('-');
    if (parts.length === 3) {
      const lastNumber = parseInt(parts[2]);
      if (!isNaN(lastNumber)) {
        sequence = lastNumber + 1;
      }
    }
  }

  return `INV-${year}${month}-${sequence.toString().padStart(4, '0')}`;
};

// Pagination
InvoiceSchema.statics.paginateInvoices = async function (
  page = 1,
  limit = 50,
  filters = {}
) {
  const skip = (page - 1) * limit;

  const [invoices, total] = await Promise.all([
    this.find(filters)
      .populate('client', 'CodeClient Intitule')
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(filters)
  ]);

  return {
    invoices,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

// Pre-save middleware for calculations
InvoiceSchema.pre('save', function (next) {
  try {
    if (this.isModified('items')) {
      let subTotalHT = 0;
      let totalTVA = 0;

      this.items.forEach(item => {
        const itemTotalHT = item.quantity * item.unitPrice * (1 - item.discount / 100);
        const itemTVA = itemTotalHT * (item.tva / 100);

        item.totalHT = Number(itemTotalHT.toFixed(2));
        item.totalTTC = Number((itemTotalHT + itemTVA).toFixed(2));

        subTotalHT += itemTotalHT;
        totalTVA += itemTVA;
      });

      this.subTotalHT = Number(subTotalHT.toFixed(2));
      this.totalTVA = Number(totalTVA.toFixed(2));
      this.totalTTC = Number((subTotalHT + totalTVA).toFixed(2));
    }

    if (this.dueDate < new Date() && this.status === 'PENDING') {
      this.status = 'OVERDUE';
    }

    next();
  } catch (error) {
    // Properly type the error and handle it
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('Unknown error occurred during invoice calculation'));
    }
  }
});

export default mongoose.model<IInvoice, IInvoiceModel>('Invoice', InvoiceSchema);