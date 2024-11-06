// src/routes/invoiceRoutes.ts
import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
    createInvoiceHandler,
    getInvoicesHandler,
    getInvoiceByIdHandler,
    updateInvoiceHandler,
    deleteInvoiceHandler
} from '../controllers/invoiceController';

const router: Router = Router();

router.post('/', auth(['manage:invoices']), createInvoiceHandler);
router.get('/', auth(['view:invoices']), getInvoicesHandler);
router.get('/:id', auth(['view:invoices']), getInvoiceByIdHandler);
router.put('/:id', auth(['manage:invoices']), updateInvoiceHandler);
router.delete('/:id', auth(['manage:invoices']), deleteInvoiceHandler);

export default router;