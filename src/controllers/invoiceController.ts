// src/controllers/invoiceController.ts
import { Request, Response } from 'express';
import * as invoiceService from '../services/invoiceService';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceSearchFilters } from '../dtos/invoiceDto';
import { AppError } from '../middleware/errorHandler';
import { IInvoice } from '../models/Invoice';

export const createInvoiceHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user);
    
    const createInvoiceDto: CreateInvoiceDto = {
      ...req.body,
      userId: req.user!.id
    };
    
    console.log('CreateInvoiceDto:', createInvoiceDto);
    // Create invoice
    const invoice = await invoiceService.createInvoice(createInvoiceDto);
    
    // Fetch populated invoice using toString() to convert ObjectId to string
    const populatedInvoice = await invoiceService.getInvoiceById(invoice._id.toString());
    
    res.status(201).json(populatedInvoice);
  } catch (err) {
    console.error('Full error details:', err);
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  }
};

export const getInvoicesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: InvoiceSearchFilters = {
      status: req.query.status as string,
      paymentStatus: req.query.paymentStatus as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
      maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
      clientId: req.query.clientId as string,
      userId: req.query.userId as string
    };

    const result = await invoiceService.getInvoices(page, limit, filters);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoiceByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

export const updateInvoiceHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateInvoiceDto: UpdateInvoiceDto = req.body;
    const invoice = await invoiceService.updateInvoice(
      req.params.id, 
      updateInvoiceDto,
      req.user!.id
    );
    res.status(200).json(invoice);
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to update invoice' });
    }
  }
};

export const deleteInvoiceHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    await invoiceService.deleteInvoice(req.params.id);
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to delete invoice' });
    }
  }
};