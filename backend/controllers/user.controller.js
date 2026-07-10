import * as userService from '../services/user.service.js';
import catchAsync from '../utils/catchAsync.js';

export const getUsersList = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const users = await userService.getUsers(filter);

  res.status(200).json({
    success: true,
    message: 'Users list retrieved successfully',
    data: users
  });
});

export const getUserDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  res.status(200).json({
    success: true,
    message: 'User details retrieved successfully',
    data: user
  });
});

export const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedUser = await userService.updateUser(id, req.body, req.user);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  });
});

export const toggleUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const updatedUser = await userService.toggleUserStatus(id, isActive, req.user);

  res.status(200).json({
    success: true,
    message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: updatedUser
  });
});

export const resetUserPassword = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const result = await userService.resetUserPassword(id, password, req.user);

  res.status(200).json({
    success: true,
    message: 'User password reset successfully',
    data: result
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await userService.deleteUser(id, req.user);

  res.status(200).json({
    success: true,
    message: 'User account and associated profiles deleted successfully',
    data: result
  });
});
