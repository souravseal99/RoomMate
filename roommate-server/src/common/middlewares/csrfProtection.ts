import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'CSRF token missing' });
  }

  next();
};