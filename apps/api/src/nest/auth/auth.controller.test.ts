import assert from 'node:assert/strict';
import test from 'node:test';

import type { ApiRequestContext } from '@trustshield/validation';

import { NestUsersController } from './auth.controller.js';

function createContext(userId = 'user-1'): ApiRequestContext {
  return {
    requestId: '11111111-1111-1111-1111-111111111111',
    apiVersion: 'v1',
    actor: {
      subject: userId,
      role: 'user',
      scopes: [],
      tenantId: undefined,
    },
  };
}

test('NestUsersController delegiert alle /users/me-Endpunkte an NestAuthService', async () => {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const authService = {
    getCurrentUser: (...args: unknown[]) => {
      calls.push({ method: 'getCurrentUser', args });
      return { id: 'user-1' };
    },
    updateCurrentUser: (...args: unknown[]) => {
      calls.push({ method: 'updateCurrentUser', args });
      return { id: 'user-1', fullName: 'Updated User' };
    },
    changeCurrentUserPassword: (...args: unknown[]) => {
      calls.push({ method: 'changeCurrentUserPassword', args });
      return { status: 'ok' };
    },
    deleteCurrentUser: (...args: unknown[]) => {
      calls.push({ method: 'deleteCurrentUser', args });
      return { status: 'deleted' };
    },
    exportCurrentUserData: (...args: unknown[]) => {
      calls.push({ method: 'exportCurrentUserData', args });
      return { apiVersion: 'v1' };
    },
    createCurrentUserAvatarUploadIntent: (...args: unknown[]) => {
      calls.push({ method: 'createCurrentUserAvatarUploadIntent', args });
      return { imageId: 'img-1' };
    },
    getCurrentUserAvatar: (...args: unknown[]) => {
      calls.push({ method: 'getCurrentUserAvatar', args });
      return { imageId: 'img-1' };
    },
    deleteCurrentUserAvatar: (...args: unknown[]) => {
      calls.push({ method: 'deleteCurrentUserAvatar', args });
      return { status: 'deleted' };
    },
  };

  const controller = new NestUsersController(authService as never);
  const request = {
    trustshieldContext: createContext(),
    headers: {
      authorization: 'Bearer token',
    },
  };

  await controller.me(request);
  await controller.update(request, { fullName: 'Updated User', locale: 'de' });
  await controller.changePassword(request, { currentPassword: 'oldpassword1', newPassword: 'newpassword1' });
  await controller.delete(request);
  await controller.export(request);
  await controller.avatarUploadIntent(request, { contentType: 'image/png', filename: 'avatar.png' });
  await controller.avatar(request);
  await controller.deleteAvatar(request);

  assert.deepEqual(
    calls.map((call) => call.method),
    [
      'getCurrentUser',
      'updateCurrentUser',
      'changeCurrentUserPassword',
      'deleteCurrentUser',
      'exportCurrentUserData',
      'createCurrentUserAvatarUploadIntent',
      'getCurrentUserAvatar',
      'deleteCurrentUserAvatar',
    ],
  );
  assert.equal(calls.every((call) => call.args.length >= 2), true);
});
