import express from 'express';
import * as slotController from '../controllers/slot.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, slotController.getSlots);

export default router;
