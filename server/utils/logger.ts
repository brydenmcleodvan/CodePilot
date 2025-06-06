import { createLogger, format, transports } from 'winston';
import { storage } from '../storage';

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [new transports.Console()]
});

export async function logError(message: string, userId?: number, stack?: string) {
  logger.error(message);
  await storage.addLog({ level: 'error', message, userId, stack: stack || null, timestamp: new Date() });
}
