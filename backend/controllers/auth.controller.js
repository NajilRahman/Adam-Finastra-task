import * as authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    data: result
  });
});

export const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Tokens refreshed successfully',
    data: result
  });
});

export const logout = catchAsync(async (req, res) => {
  // Attached by protect middleware
  const userId = req.user._id;
  await authService.logout(userId);

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
    data: null
  });
});
