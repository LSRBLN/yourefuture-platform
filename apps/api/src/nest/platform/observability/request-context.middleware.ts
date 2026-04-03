import { runWithRequestContext } from './request-context.store.js';
import { resolveRequestId } from './request-id.js';

type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  requestId?: string;
  method?: string;
  originalUrl?: string;
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
};

export type RequestWithRequestId = RequestLike & {
  requestId?: string;
};

export function correlationIdMiddleware(request: RequestWithRequestId, response: ResponseLike, next: () => void) {
  const requestId = resolveRequestId(request.headers);
  request.requestId = requestId;
  response.setHeader('x-request-id', requestId);

  runWithRequestContext({ requestId }, () => {
    next();
  });
}
