import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

import { Injectable } from '@nestjs/common';
import type { ApiRequestContext, AuthResponse, AuthUser } from '@trustshield/validation';
import { safeParseLoginRequest, safeParseRefreshRequest, safeParseRegisterRequest, safeParseUpdateUserProfileRequest } from '@trustshield/validation';

import { HttpError } from '../shared/http.js';
import { readBearerToken, signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './auth-token.js';

type StoredUser = AuthUser & {
  passwordSalt: string;
  passwordHash: string;
  locale?: string;
  timezone?: string;
  preferredContact?: string;
  createdAt: string;
};

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString('hex');
}

function passwordMatches(password: string, salt: string, expectedHash: string) {
  return timingSafeEqual(Buffer.from(hashPassword(password, salt), 'hex'), Buffer.from(expectedHash, 'hex'));
}

@Injectable()
export class AuthService {
  private readonly usersById = new Map<string, StoredUser>();
  private readonly userIdsByEmail = new Map<string, string>();

  private toAuthResponse(user: AuthUser): AuthResponse {
    return {
      user,
      token: signAccessToken({
        subject: user.id,
        email: user.email,
        role: user.role,
        scopes: [],
      }),
      refreshToken: signRefreshToken({
        subject: user.id,
        email: user.email,
        role: user.role,
        scopes: [],
      }),
    };
  }

  register(body: unknown) {
    const validation = safeParseRegisterRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Registration validation failed', validation.issues);
    }

    const email = validation.data.email.toLowerCase();

    if (this.userIdsByEmail.has(email)) {
      throw new HttpError(409, 'User with this e-mail already exists');
    }

    const salt = randomBytes(16).toString('hex');
    const user: StoredUser = {
      id: randomUUID(),
      email,
      fullName: validation.data.fullName,
      role: 'user',
      passwordSalt: salt,
      passwordHash: hashPassword(validation.data.password, salt),
      createdAt: new Date().toISOString(),
    };

    this.usersById.set(user.id, user);
    this.userIdsByEmail.set(email, user.id);

    return this.toAuthResponse(user);
  }

  login(body: unknown) {
    const validation = safeParseLoginRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Login validation failed', validation.issues);
    }

    const userId = this.userIdsByEmail.get(validation.data.email.toLowerCase());
    const user = userId ? this.usersById.get(userId) : undefined;

    if (!user || !passwordMatches(validation.data.password, user.passwordSalt, user.passwordHash)) {
      throw new HttpError(401, 'Invalid credentials');
    }

    return this.toAuthResponse(user);
  }

  refresh(body: unknown) {
    const validation = safeParseRefreshRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Refresh validation failed', validation.issues);
    }

    const token = verifyRefreshToken(validation.data.refreshToken);
    const user = this.usersById.get(token.subject);

    if (!user) {
      throw new HttpError(401, 'Invalid refresh token');
    }

    return this.toAuthResponse(user);
  }

  logout() {
    return { status: 'ok' as const };
  }

  getCurrentUser(request: IncomingMessage, context: ApiRequestContext) {
    if (!context.actor.subject || context.actor.role === 'anonymous') {
      throw new HttpError(401, 'Authentication required');
    }

    const token = readBearerToken(request);

    if (token) {
      const verified = verifyAccessToken(token);
      const storedUser = this.usersById.get(verified.subject);

      if (storedUser) {
        return {
          id: storedUser.id,
          email: storedUser.email,
          role: storedUser.role,
          fullName: storedUser.fullName,
          locale: storedUser.locale,
          timezone: storedUser.timezone,
          preferredContact: storedUser.preferredContact,
        };
      }

      return {
        id: verified.subject,
        email: verified.email,
        role: verified.role,
        fullName: undefined,
        locale: undefined,
        timezone: undefined,
        preferredContact: undefined,
      };
    }

    const user = this.usersById.get(context.actor.subject);

    if (!user) {
      throw new HttpError(404, `User ${context.actor.subject} not found`);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      locale: user.locale,
      timezone: user.timezone,
      preferredContact: user.preferredContact,
    };
  }

  updateCurrentUser(request: IncomingMessage, context: ApiRequestContext, body: unknown) {
    const existingUser = this.getCurrentUser(request, context);
    const validation = safeParseUpdateUserProfileRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'User profile validation failed', validation.issues);
    }

    const user = this.usersById.get(existingUser.id);

    if (!user) {
      throw new HttpError(404, `User ${existingUser.id} not found`);
    }

    if (validation.data.fullName !== undefined) {
      user.fullName = validation.data.fullName;
    }

    if (validation.data.locale !== undefined) {
      user.locale = validation.data.locale;
    }

    if (validation.data.timezone !== undefined) {
      user.timezone = validation.data.timezone;
    }

    if (validation.data.preferredContact !== undefined) {
      user.preferredContact = validation.data.preferredContact;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      locale: user.locale,
      timezone: user.timezone,
      preferredContact: user.preferredContact,
    };
  }

  deleteCurrentUser(request: IncomingMessage, context: ApiRequestContext) {
    const existingUser = this.getCurrentUser(request, context);
    const user = this.usersById.get(existingUser.id);

    if (!user) {
      throw new HttpError(404, `User ${existingUser.id} not found`);
    }

    this.usersById.delete(user.id);
    this.userIdsByEmail.delete(user.email.toLowerCase());

    return {
      status: 'deleted' as const,
      userId: user.id,
    };
  }
}
