import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
    createDriverHandler,
    getDriversHandler,
    getDriverByIdHandler,
    updateDriverHandler,
    deleteDriverHandler
} from '../controllers/driverController';

const router: Router = Router();

router.post('/', auth(['manage:drivers']), createDriverHandler);
router.get('/', auth(['view:drivers', 'manage:drivers']), getDriversHandler);
router.get('/:id', auth(['view:drivers', 'manage:drivers']), getDriverByIdHandler);
router.put('/:id', auth(['manage:drivers']), updateDriverHandler);
router.delete('/:id', auth(['manage:drivers']), deleteDriverHandler);

export default router;