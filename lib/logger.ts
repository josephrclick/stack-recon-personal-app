import pino from 'pino';

/**
 * Global structured logger.
 */
export const logger = pino({
  name: 'app',
  level: process.env.LOG_LEVEL || 'info',
});