// src/services/invoiceService.ts
import Invoice, { IInvoice } from '../models/Invoice';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceSearchFilters } from '../dtos/invoiceDto';
import { AppError } from '../middleware/errorHandler';

export const createInvoice = async (createInvoiceDto: CreateInvoiceDto): Promise<IInvoice> => {
  try {
    console.log('Creating invoice with DTO:', createInvoiceDto);
    
    // Calculate totals first
    let subTotalHT = 0;
    let totalTVA = 0;
    
    const items = createInvoiceDto.items.map(item => {
      const itemTotalHT = item.quantity * item.unitPrice * (1 - (item.discount || 0)/100);
      const itemTVA = itemTotalHT * (item.tva/100);
      
      subTotalHT += itemTotalHT;
      totalTVA += itemTVA;
      
      return {
        article: item.articleId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tva: item.tva,
        totalHT: Number(itemTotalHT.toFixed(2)),
        totalTTC: Number((itemTotalHT + itemTVA).toFixed(2))
      };
    });

    const totalTTC = Number((subTotalHT + totalTVA).toFixed(2));

    const invoiceNumber = await Invoice.generateInvoiceNumber();
    const invoice = new Invoice({
      invoiceNumber,
      client: createInvoiceDto.clientId,
      driver: createInvoiceDto.driverId,
      user: createInvoiceDto.userId,
      items: items,
      subTotalHT: Number(subTotalHT.toFixed(2)),
      totalTVA: Number(totalTVA.toFixed(2)),
      totalTTC: totalTTC,
      dueDate: createInvoiceDto.dueDate,
      notes: createInvoiceDto.notes,
      termsAndConditions: createInvoiceDto.termsAndConditions,
      metadata: {
        createdBy: createInvoiceDto.userId,
        lastModifiedBy: createInvoiceDto.userId,
        lastModifiedDate: new Date()
      }
    });

    console.log('Saving invoice:', invoice);
    return await invoice.save();
  } catch (error) {
    console.error('Invoice creation error:', error);
    throw error;
  }
};

export const getInvoices = async (
  page: number = 1,
  limit: number = 50,
  filters: InvoiceSearchFilters = {}
) => {
  const query: any = {};
  
  if (filters.status) query.status = filters.status;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.clientId) query.client = filters.clientId;
  if (filters.userId) query.user = filters.userId;
  
  if (filters.startDate || filters.endDate) {
    query.issueDate = {};
    if (filters.startDate) query.issueDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.issueDate.$lte = new Date(filters.endDate);
  }
  
  if (filters.minAmount || filters.maxAmount) {
    query.totalTTC = {};
    if (filters.minAmount) query.totalTTC.$gte = filters.minAmount;
    if (filters.maxAmount) query.totalTTC.$lte = filters.maxAmount;
  }

  return await Invoice.paginateInvoices(page, limit, query);
};

export const getInvoiceById = async (id: string): Promise<IInvoice | null> => {
  return await Invoice.findById(id)
    .populate('client', 'CodeClient Intitule Tel1 Adresse')
    .populate('driver', 'name phoneNumber licenses')
    .populate('user', 'username')
    .populate('items.article', 'Code Designation PrixAchatHT TVA');
};

export const updateInvoice = async (
  id: string, 
  updateInvoiceDto: UpdateInvoiceDto, 
  userId: string
): Promise<IInvoice | null> => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new AppError(404, 'Invoice not found');

  // Validate status transitions
  if (updateInvoiceDto.status) {
    validateStatusTransition(invoice.status, updateInvoiceDto.status);
  }

  invoice.metadata.lastModifiedBy = userId;
  invoice.metadata.lastModifiedDate = new Date();

  return await Invoice.findByIdAndUpdate(
    id, 
    { 
      ...updateInvoiceDto,
      'metadata.lastModifiedBy': userId,
      'metadata.lastModifiedDate': new Date()
    }, 
    { new: true }
  );
};

export const deleteInvoice = async (id: string): Promise<IInvoice | null> => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new AppError(404, 'Invoice not found');
  
  if (invoice.status !== 'DRAFT') {
    throw new AppError(400, 'Only draft invoices can be deleted');
  }
  
  return await Invoice.findByIdAndDelete(id);
};

const validateStatusTransition = (currentStatus: string, newStatus: string) => {
  const allowedTransitions: Record<string, string[]> = {
    'DRAFT': ['PENDING', 'CANCELLED'],
    'PENDING': ['PAID', 'CANCELLED', 'OVERDUE'],
    'OVERDUE': ['PAID', 'CANCELLED'],
    'PAID': ['CANCELLED'],
    'CANCELLED': []
  };

  if (!allowedTransitions[currentStatus].includes(newStatus)) {
    throw new AppError(400, `Invalid status transition from ${currentStatus} to ${newStatus}`);
  }
};