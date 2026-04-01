import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { buildErrorBody, HttpError } from '../../modules/shared/http.js';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<{ status: (code: number) => { json: (body: unknown) => void } }>();
    const request = context.getRequest<{ headers?: Record<string, string | string[] | undefined> }>();
    const requestIdHeader = request.headers?.['x-request-id'];
    const requestId = (Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader) ?? randomUUID();

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
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(buildErrorBody(new HttpError(HttpStatus.INTERNAL_SERVER_ERROR, message), requestId));
  }
}
