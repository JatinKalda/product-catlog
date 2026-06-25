/**
 * Global error handling middleware
 *
 * Distinguishes operational errors (bad input, not found) from programming errors
 * (unexpected crashes) so clients receive clear messages and we never leak stack traces.
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

/** Operational error that maps directly to an HTTP status code */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Must be registered as the last middleware (4 params = Express error handler) */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Operational errors — safe to expose the message to the client
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  // Programming or unexpected errors — log the stack, hide details from clients
  const message = error instanceof Error ? error.message : String(error);
  logger.error('Unhandled error', {
    message,
    stack: error instanceof Error ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'An internal error occurred. Please try again.',
    timestamp: new Date().toISOString(),
  });
}
