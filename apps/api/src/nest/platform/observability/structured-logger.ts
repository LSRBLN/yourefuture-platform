import { inspect } from 'node:util';

import type { LoggerService } from '@nestjs/common';

import { getRequestIdFromContext } from './request-context.store.js';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const levelWeight: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function toErrorPayload(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: inspect(error, { depth: 3 }),
  };
}

function toMessagePayload(message: unknown): string {
  if (typeof message === 'string') {
    return message;
  }

  return inspect(message, { depth: 3, breakLength: Infinity });
}

function shouldLog(configuredLevel: LogLevel, incomingLevel: LogLevel) {
  return levelWeight[incomingLevel] <= levelWeight[configuredLevel];
}

function emit(level: LogLevel, configuredLevel: LogLevel, message: unknown, context?: string, trace?: unknown) {
  if (!shouldLog(configuredLevel, level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message: toMessagePayload(message),
    context,
    requestId: getRequestIdFromContext(),
    trace: trace === undefined ? undefined : toErrorPayload(trace),
  };

  const serialized = JSON.stringify(payload);
  if (level === 'error') {
    process.stderr.write(`${serialized}\n`);
    return;
  }

  process.stdout.write(`${serialized}\n`);
}

export class StructuredLogger implements LoggerService {
  constructor(private readonly level: LogLevel) {}

  log(message: unknown, context?: string) {
    emit('info', this.level, message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    emit('error', this.level, message, context, trace);
  }

  warn(message: unknown, context?: string) {
    emit('warn', this.level, message, context);
  }

  debug(message: unknown, context?: string) {
    emit('debug', this.level, message, context);
  }

  verbose(message: unknown, context?: string) {
    emit('debug', this.level, message, context);
  }
}

export function createStructuredLogWriter(level: LogLevel, context: string) {
  return {
    error: (message: unknown, trace?: unknown) => emit('error', level, message, context, trace),
    warn: (message: unknown) => emit('warn', level, message, context),
    info: (message: unknown) => emit('info', level, message, context),
    debug: (message: unknown) => emit('debug', level, message, context),
  };
}

