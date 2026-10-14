import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/token';
import { User, IUserDocument } from '../models/User';
import { ENV } from '../config/env';
import { HTTP_STATUS } from '../constants';
import { AppError } from './errorHandler';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      tokenPayload?: TokenPayload;
    }
  }
}

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check HTTP-only cookie first
    if (req.cookies && req.cookies[ENV.COOKIE_NAME]) {
      token = req.cookies[ENV.COOKIE_NAME];
    }
    // Check Authorization Bearer header as fallback
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError(
        'Authentication required. Please log in to continue.',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    req.tokenPayload = decoded;

    // Fetch user from DB to ensure account is still active and valid
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError(
        'The user belonging to this token no longer exists.',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (!user.isActive) {
      throw new AppError(
        'Your account has been deactivated. Please contact restaurant support.',
        HTTP_STATUS.FORBIDDEN
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Optional auth for cart or public endpoints where customer may or may not be logged in
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies[ENV.COOKIE_NAME]) {
      token = req.cookies[ENV.COOKIE_NAME];
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
          req.tokenPayload = decoded;
        }
      } catch {
        // Ignore invalid token on optional auth
      }
    }
    next();
  } catch {
    next();
  }
};
