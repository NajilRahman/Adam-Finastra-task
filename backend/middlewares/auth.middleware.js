import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { UnauthorizedError } from '../utils/appError.js';
import logger from '../utils/logger.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('You are not logged in. Please log in to get access.'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Your session has expired. Please refresh your token.'));
      }
      return next(new UnauthorizedError('Invalid session token. Please log in again.'));
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new UnauthorizedError('The user belonging to this token no longer exists.'));
    }

    if (!currentUser.isActive) {
      return next(new UnauthorizedError('This account has been deactivated.'));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    next(error);
  }
};
