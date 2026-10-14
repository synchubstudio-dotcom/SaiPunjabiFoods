import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
};

export const sendTokenCookie = (res: Response, token: string): void => {
  const isProd = ENV.NODE_ENV === 'production';
  // 7 days cookie maxAge
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie(ENV.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge,
    path: '/',
  });
};

export const clearTokenCookie = (res: Response): void => {
  const isProd = ENV.NODE_ENV === 'production';
  res.clearCookie(ENV.COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
};
