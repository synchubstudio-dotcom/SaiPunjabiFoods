import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HTTP_STATUS } from '../constants';
import { ENV } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.BAD_REQUEST) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong on the server';
  let errors: Record<string, string[]> | undefined;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    errors = {};
    err.errors.forEach((issue) => {
      const field = issue.path.join('.') || 'root';
      if (!errors![field]) errors![field] = [];
      errors![field].push(issue.message);
    });
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid format for parameter: ${err.path}`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Database validation error';
    errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors![key] = [err.errors[key].message];
    });
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Authentication token expired. Please log in again.';
  }

  // Structured Logging
  if (statusCode >= 500) {
    console.error(`[Server Error 500]`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: ENV.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
