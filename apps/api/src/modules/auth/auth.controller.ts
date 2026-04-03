import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiRequestContext } from '@trustshield/validation';

import { handleController } from '../shared/http.js';
import { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register(_request: IncomingMessage, response: ServerResponse, body: unknown) {
    return handleController(response, async () => ({
      statusCode: 201,
      body: this.authService.register(body),
    }));
  }

  login(_request: IncomingMessage, response: ServerResponse, body: unknown) {
    return handleController(response, async () => ({
      body: this.authService.login(body),
    }));
  }

  refresh(_request: IncomingMessage, response: ServerResponse, body: unknown) {
    return handleController(response, async () => ({
      body: this.authService.refresh(body),
    }));
  }

  logout(_request: IncomingMessage, response: ServerResponse) {
    return handleController(response, async () => ({
      body: this.authService.logout(),
    }));
  }

  me(request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({
      body: this.authService.getCurrentUser(request, context),
    }));
  }

  updateMe(request: IncomingMessage, response: ServerResponse, body: unknown, context: ApiRequestContext) {
    return handleController(response, async () => ({
      body: this.authService.updateCurrentUser(request, context, body),
    }));
  }

  deleteMe(request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({
      body: this.authService.deleteCurrentUser(request, context),
    }));
  }
}
