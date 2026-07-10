import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validator.middleware.js';
import {
  updateUserSchema,
  toggleStatusSchema,
  resetPasswordSchema
} from '../validators/user.validator.js';

const router = express.Router();

// All user management routes require login and Super Admin role
router.use(protect);
router.use(restrictTo('super_admin'));

router.get('/', userController.getUsersList);
router.get('/:id', userController.getUserDetails);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.patch('/:id/status', validate(toggleStatusSchema), userController.toggleUserStatus);
router.patch('/:id/reset-password', validate(resetPasswordSchema), userController.resetUserPassword);
router.delete('/:id', userController.deleteUser);

export default router;
