import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@sai-punjabi/shared';
import { HTTP_STATUS } from '../constants';
import { AppError } from './errorHandler';

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError(
          'Unauthorized: Authentication required',
          HTTP_STATUS.UNAUTHORIZED
        )
      );
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(
        new AppError(
          'Forbidden: You do not have permission to perform this action',
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
};
