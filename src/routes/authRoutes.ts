import { Router } from 'express';
import { registerHandler, loginHandler, createUserHandler, updateUserPermissionsHandler, getAllUsersHandler, updateUserHandler, deleteUserHandler } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/users', auth(['manage:users']), createUserHandler);
router.get('/users', auth(['manage:users']), getAllUsersHandler);
router.put('/users/:userId', auth(['manage:users']), updateUserHandler);
router.delete('/users/:userId', auth(['manage:users']), deleteUserHandler);
router.put('/users/:userId/permissions', auth(['manage:users']), updateUserPermissionsHandler);

export default router;