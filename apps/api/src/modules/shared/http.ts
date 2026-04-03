import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function buildErrorBody(error: HttpError, requestId: string) {
  return {
    error: {
      code: 'HTTP_ERROR',
      message: error.message,
      details: error.details,
      requestId,
    },
  };
}

export function writeErrorJson(response: ServerResponse, error: HttpError, requestId?: string) {
  writeJson(response, error.statusCode, buildErrorBody(error, requestId ?? randomUUID()));
}

export function getRouteParam(request: IncomingMessage, segmentIndex: number) {
  const pathname = (request.url ?? '/').split('?')[0] ?? '/';
  const segments = pathname.split('/').filter(Boolean);
  const versionPrefixOffset = segments[0] === 'api' && segments[1] === 'v1' ? 2 : 0;
  return segments[versionPrefixOffset + segmentIndex] ?? '';
}

export function writeJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

export async function handleController(response: ServerResponse, action: () => Promise<{ statusCode?: number; body: unknown }>) {
  try {
    const result = await action();
    writeJson(response, result.statusCode ?? 200, result.body);
  } catch (error) {
    const requestId = randomUUID();

    if (error instanceof HttpError) {
      writeErrorJson(response, error, requestId);
      return;
    }

    const message = error instanceof Error ? error.message : 'Unexpected controller error';
    writeJson(
      response,
      500,
      buildErrorBody(new HttpError(500, message), requestId),
    );
  }
}
