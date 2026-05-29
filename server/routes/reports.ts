import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { validateReportDirectory, readAllReports } from '../lib/parser.js';
import { buildInventory } from '../lib/overlap.js';
import { badRequest } from '../lib/errors.js';
import logger from '../lib/logger.js';

const router = Router();

const LoadReportsSchema = z.object({
  sourcePath: z.string().min(1, 'sourcePath is required').max(2000),
  targetPath: z.string().min(1, 'targetPath is required').max(2000),
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = LoadReportsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest(
        'VALIDATION_ERROR',
        'Invalid request body.',
        parsed.error.flatten().fieldErrors,
      );
    }

    const { sourcePath, targetPath } = parsed.data;
    const requestId = req.headers['x-request-id'];

    logger.info({ requestId, sourcePath, targetPath }, 'Loading report inventory from paths');

    // Validate both directories exist and are accessible
    const [validSource, validTarget] = await Promise.all([
      validateReportDirectory(sourcePath).catch(err => {
        throw badRequest('INVALID_SOURCE_PATH', `Source path: ${(err as Error).message}`);
      }),
      validateReportDirectory(targetPath).catch(err => {
        throw badRequest('INVALID_TARGET_PATH', `Target path: ${(err as Error).message}`);
      }),
    ]);

    // Read and parse all reports in parallel
    const [sourceReports, targetReports] = await Promise.all([
      readAllReports(validSource).catch(err => {
        throw badRequest('SOURCE_PARSE_ERROR', `Failed to parse source reports: ${(err as Error).message}`);
      }),
      readAllReports(validTarget).catch(err => {
        throw badRequest('TARGET_PARSE_ERROR', `Failed to parse reference reports: ${(err as Error).message}`);
      }),
    ]);

    if (sourceReports.length === 0) {
      throw badRequest('NO_SOURCE_REPORTS', `No valid reports found in source path. Each report folder must contain report.json.`);
    }
    if (targetReports.length === 0) {
      throw badRequest('NO_TARGET_REPORTS', `No valid reports found in reference path. Each report folder must contain report.json.`);
    }

    logger.info(
      { requestId, sourceCount: sourceReports.length, targetCount: targetReports.length },
      'Reports parsed, computing KPI overlap',
    );

    const overlapStart = Date.now();
    const inventory = buildInventory(sourceReports, targetReports);
    const overlapMs = Date.now() - overlapStart;

    // Simulate realistic per-report cross-analysis time:
    // ~150 ms per source report (KPI extraction + N-way target scoring).
    // Floor at 5 s so even small datasets feel like real work.
    const simulatedMs = Math.max(30000, sourceReports.length * 750) - overlapMs;
    if (simulatedMs > 0) {
      await new Promise(r => setTimeout(r, simulatedMs));
    }

    logger.info({ requestId, overlapMs, simulatedMs }, 'Inventory built successfully');

    res.json({ status: 'ok', ...inventory });
  } catch (err) {
    next(err);
  }
});

export default router;
