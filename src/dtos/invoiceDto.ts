// src/dtos/invoiceDto.ts
export interface InvoiceItemDto {
  articleId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tva: number;
}

export interface CreateInvoiceDto {
  clientId: string;
  driverId?: string;
  userId: string;
  items: InvoiceItemDto[];
  dueDate: Date;
  notes?: string;
  termsAndConditions?: string;
}

export interface UpdateInvoiceDto {
  status?: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
  paymentStatus?: 'UNPAID' | 'PARTIAL' | 'PAID';
  paymentMethod?: 'CASH' | 'CHECK' | 'BANK_TRANSFER';
  paymentReference?: string;
  paymentDate?: Date;
  notes?: string;
  termsAndConditions?: string;
}

export interface InvoiceSearchFilters {
  status?: string;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  clientId?: string;
  userId?: string;
}