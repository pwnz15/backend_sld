import { Router } from 'express';
import { auth } from '../middleware/auth';
import multer from 'multer';
import {
    createClientHandler,
    getClientsHandler,
    getClientByIdHandler,
    updateClientHandler,
    deleteClientHandler
} from '../controllers/clientController';
import {
    exportClientsHandler,
    importClientsHandler
} from '../controllers/importExportController';

const router: Router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', auth(['manage:clients']), createClientHandler);
router.get('/', auth(['view:clients', 'manage:clients']), getClientsHandler);
router.get('/:id', auth(['view:clients', 'manage:clients']), getClientByIdHandler);
router.put('/:id', auth(['manage:clients']), updateClientHandler);
router.delete('/:id', auth(['manage:clients']), deleteClientHandler);

router.get('/export', auth(['manage:clients']), exportClientsHandler);
router.post('/import', auth(['manage:clients']), upload.single('file'), importClientsHandler);

export default router;