import type { ApiRequestContext } from '@trustshield/validation';

export function canReadAll(context: ApiRequestContext) {
  return context.actor.role !== 'user';
}

export function requireActorSubject(context: ApiRequestContext) {
  if (!context.actor.subject) {
    throw new Error('Authenticated actor subject required');
  }

  return context.actor.subject;
}
