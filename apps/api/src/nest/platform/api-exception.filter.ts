import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { buildErrorBody, HttpError } from '../../modules/shared/http.js';
import { resolveRequestId } from './observability/request-id.js';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(private readonly captureException?: (exception: unknown, context?: { requestId: string }) => void) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<{ status: (code: number) => { json: (body: unknown) => void } }>();
    const request = context.getRequest<{ headers?: Record<string, string | string[] | undefined>; requestId?: string }>();
    const requestId = request.requestId ?? resolveRequestId(request.headers);

    if (exception instanceof HttpError) {
      response.status(exception.statusCode).json(buildErrorBody(exception, requestId));
      return;
    }

    if (exception instanceof HttpException) {
      response
        .status(exception.getStatus())
        .json(buildErrorBody(new HttpError(exception.getStatus(), exception.message), requestId));
      return;
    }

    const message = exception instanceof Error ? exception.message : 'Unexpected API error';
    this.logger.error(`Unhandled API exception: ${message}`);
    this.captureException?.(exception, { requestId });
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(buildErrorBody(new HttpError(HttpStatus.INTERNAL_SERVER_ERROR, message), requestId));
  }
}
