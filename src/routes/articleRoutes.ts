import { Router } from 'express';
import { auth } from '../middleware/auth';
import multer from 'multer';
import {
    createArticleHandler,
    getArticlesHandler,
    getArticleByIdHandler,
    updateArticleHandler,
    deleteArticleHandler
} from '../controllers/articleController';
import {
    exportArticlesHandler,
    importArticlesHandler
} from '../controllers/importExportController';

const router: Router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', auth(['manage:inventory']), createArticleHandler);
router.get('/', auth(['view:inventory']), getArticlesHandler);
router.get('/:id', auth(['view:inventory']), getArticleByIdHandler);
router.put('/:id', auth(['manage:inventory']), updateArticleHandler);
router.delete('/:id', auth(['manage:inventory']), deleteArticleHandler);

router.get('/export', auth(['manage:inventory']), exportArticlesHandler);
router.post('/import', auth(['manage:inventory']), upload.single('file'), importArticlesHandler);

export default router;