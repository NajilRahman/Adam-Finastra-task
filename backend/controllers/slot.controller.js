import * as slotService from '../services/slot.service.js';
import catchAsync from '../utils/catchAsync.js';
import { BadRequestError } from '../utils/appError.js';

export const getSlots = catchAsync(async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    throw new BadRequestError('Doctor ID and Date (YYYY-MM-DD) are required parameters');
  }

  const slots = await slotService.getAvailableSlots(doctorId, date);

  res.status(200).json({
    success: true,
    message: 'Available slots retrieved successfully',
    data: slots
  });
});
