import rateLimit from 'express-rate-limit';
import { AppError } from '../lib/errors.js';

const rateLimitHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    const err = new AppError(429, 'RATE_LIMITED', 'Too many requests — please wait before retrying.');
    res.status(429).json({ status: 'error', error: { code: err.code, message: err.message } });
  },
});

export const analyzeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    const err = new AppError(429, 'RATE_LIMITED', 'Analysis rate limit exceeded — max 10 per minute.');
    res.status(429).json({ status: 'error', error: { code: err.code, message: err.message } });
  },
});

export default rateLimitHandler;
