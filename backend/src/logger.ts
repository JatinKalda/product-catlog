/**
 * Structured logger using Winston.
 *
 * In development: colourised, human-readable output.
 * In production : JSON lines — machine-parseable by Render / Datadog / etc.
 */

import winston from 'winston';
import config from './config';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
  }),
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

const logger = winston.createLogger({
  level: config.log.level,
  format: config.server.isDev ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
  // Don't crash the process on unhandled exceptions — log and continue.
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

export default logger;
