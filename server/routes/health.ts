import { Router } from 'express';

const router = Router();

const startedAt = Date.now();

router.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    version: process.env.npm_package_version ?? '0.1.0',
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    services: {
      enrichment: process.env.OPENAI_API_KEY
        ? 'connected'
        : 'not_configured',
    },
  });
});

export default router;
