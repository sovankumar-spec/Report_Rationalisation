import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';

export function requestTimeout(ms: number) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        const err = new AppError(503, 'REQUEST_TIMEOUT', `Request timed out after ${ms / 1000}s.`);
        res.status(503).json({ status: 'error', error: { code: err.code, message: err.message } });
      }
    }, ms);
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    next();
  };
}
