import assert from 'node:assert/strict';
import test from 'node:test';

import {
  safeParseAuthClaims,
  safeParseBullmqJobEnvelope,
  safeParseCreateCheckRequest,
  safeParseCreateSourceRequest,
  safeParseCreateSupportRequest,
  safeParseIntakeOrchestrator,
  safeParseTransitionSupportRequestStatus,
  safeParseUpdateSupportRequestAssignment,
} from './index.js';

test('safeParseCreateCheckRequest meldet fehlendes assetId für bildbasierte Checks', () => {
  const result = safeParseCreateCheckRequest({
    type: 'image',
    input: {
      submittedSourceIds: ['source-1'],
    },
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'input.assetId',
      message: 'Für bild- oder videobasierte Checks ist ein Asset erforderlich.',
    },
  ]);
});

test('safeParseCreateSourceRequest meldet fehlenden Anker für Quellen-Drafts', () => {
  const result = safeParseCreateSourceRequest({
    sourceType: 'other_url',
    sourceUrl: 'https://example.org/fund',
    platformName: 'Archivmirror',
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'assetId',
      message: 'Quelle benötigt assetId oder checkId.',
    },
  ]);
});

test('safeParseCreateSupportRequest meldet fehlende Routing-Referenz', () => {
  const result = safeParseCreateSupportRequest({
    requestType: 'support',
    priority: 'medium',
    message: 'Bitte Leak prüfen',
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'checkId',
      message: 'Support-Anfrage benötigt checkId, assetId oder removalCaseId.',
    },
  ]);
});

test('safeParseCreateCheckRequest akzeptiert Asset-gebundenen Bild-Check', () => {
  const result = safeParseCreateCheckRequest({
    type: 'image',
    input: {
      assetId: 'asset-1',
      submittedSourceIds: ['source-1'],
    },
  });

  assert.equal(result.success, true);
});

test('safeParseCreateSourceRequest meldet fehlenden Check-Anker trotz URL', () => {
  const result = safeParseCreateSourceRequest({
    sourceType: 'image_url',
    sourceUrl: 'https://example.org/fund.png',
    platformName: 'Mirrorboard',
    assetId: '',
    checkId: '',
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'assetId',
      message: 'Quelle benötigt assetId oder checkId.',
    },
  ]);
});

test('safeParseCreateSourceRequest konsolidiert leere Anchor-Felder auf eine semantische Fehlerursache', () => {
  const result = safeParseCreateSourceRequest({
    sourceType: 'other_url',
    sourceUrl: 'https://example.org/report',
    assetId: '   ',
    checkId: '   ',
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'assetId',
      message: 'Quelle benötigt assetId oder checkId.',
    },
  ]);
});

test('safeParseCreateSupportRequest konsolidiert leere Routing-Felder auf eine semantische Fehlerursache', () => {
  const result = safeParseCreateSupportRequest({
    requestType: 'support',
    priority: 'medium',
    checkId: '   ',
    assetId: '   ',
    removalCaseId: '   ',
    message: 'Bitte Routing prüfen',
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'checkId',
      message: 'Support-Anfrage benötigt checkId, assetId oder removalCaseId.',
    },
  ]);
});

test('safeParseCreateSupportRequest behält feldspezifische Fehler zusätzlich zur Routing-Semantik', () => {
  const result = safeParseCreateSupportRequest({
    requestType: 'support',
    priority: 'medium',
    checkId: 'check-1',
    message: '   ',
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'message',
      message: 'String must contain at least 1 character(s)',
    },
  ]);
});

test('safeParseCreateSupportRequest akzeptiert Routing über removalCaseId', () => {
  const result = safeParseCreateSupportRequest({
    requestType: 'removal',
    priority: 'urgent',
    message: 'Bitte Entfernung vorbereiten',
    removalCaseId: 'removal-1',
  });

  assert.equal(result.success, true);
});

test('safeParseCreateSupportRequest akzeptiert persistierbaren End-to-End Support-Pfad über checkId', () => {
  const result = safeParseCreateSupportRequest({
    requestType: 'support',
    priority: 'high',
    checkId: 'check-42',
    assetId: 'asset-7',
    message: 'Bitte Intake übernehmen und Rückfrage vorbereiten',
    preferredContact: 'secure_portal',
  });

  assert.equal(result.success, true);
});

test('safeParseCreateSupportRequest meldet Failure-Pfad für fehlende Nachricht trotz gültigem Routing', () => {
  const result = safeParseCreateSupportRequest({
    requestType: 'upload_review',
    priority: 'urgent',
    checkId: 'check-42',
    message: '   ',
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'message',
      message: 'String must contain at least 1 character(s)',
    },
  ]);
});

test('safeParseCreateCheckRequest meldet fehlende Domain für leak_domain als Fehlerpfad', () => {
  const result = safeParseCreateCheckRequest({
    type: 'leak_domain',
    input: {
      submittedSourceIds: ['source-1'],
    },
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'input.domain',
      message: 'Für leak_domain ist eine Domain erforderlich.',
    },
  ]);
});

test('safeParseCreateSourceRequest behält Fehlerpfad für ungültige URL neben Anchor-Fehler', () => {
  const result = safeParseCreateSourceRequest({
    sourceType: 'document_url',
    sourceUrl: 'invalid-url',
    checkId: '',
    assetId: '',
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'sourceUrl',
      message: 'Invalid url',
    },
    {
      path: 'assetId',
      message: 'Quelle benötigt assetId oder checkId.',
    },
  ]);
});

test('safeParseAuthClaims akzeptiert service claims mit wildcard scope', () => {
  const result = safeParseAuthClaims({
    subject: 'svc-api',
    role: 'service',
    scopes: ['*'],
    tenantId: 'tenant-1',
  });

  assert.equal(result.success, true);
});

test('safeParseAuthClaims meldet ungueltige scopes', () => {
  const result = safeParseAuthClaims({
    subject: 'svc-api',
    role: 'service',
    scopes: ['support_requests:destroy'],
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'scopes[0]',
      message: 'Invalid input',
    },
  ]);
});

test('safeParseBullmqJobEnvelope akzeptiert versionierte removal submission jobs', () => {
  const result = safeParseBullmqJobEnvelope({
    jobId: 'job-1',
    traceId: 'trace-1',
    dedupeKey: 'removal:submit:RM-1',
    attempts: 3,
    enqueuedAt: '2026-03-31T10:15:00.000Z',
    queue: 'removals',
    name: 'removal.submit',
    requestedBy: {
      subject: 'svc-api',
      role: 'service',
      scopes: ['*'],
    },
    payload: {
      removalCaseId: 'RM-1',
      platform: 'ClipShare',
      targetUrl: 'https://clips.example.org/watch/fake',
      requestedBy: 'svc-api',
    },
  });

  assert.equal(result.success, true);
});

test('safeParseBullmqJobEnvelope meldet queue name mismatch', () => {
  const result = safeParseBullmqJobEnvelope({
    jobId: 'job-1',
    traceId: 'trace-1',
    enqueuedAt: '2026-03-31T10:15:00.000Z',
    queue: 'support',
    name: 'removal.submit',
    requestedBy: {
      subject: 'svc-api',
      role: 'service',
      scopes: ['*'],
    },
    payload: {
      removalCaseId: 'RM-1',
      platform: 'ClipShare',
      targetUrl: 'https://clips.example.org/watch/fake',
      requestedBy: 'svc-api',
    },
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'queue',
      message: 'Invalid literal value, expected "removals"',
    },
  ]);
});

test('safeParseCreateSupportRequest behält Fehlerpfad für leere message neben Routing-Fehler', () => {
  const result = safeParseCreateSupportRequest({
    requestType: 'support',
    priority: 'medium',
    checkId: '   ',
    assetId: '   ',
    removalCaseId: '   ',
    message: '   ',
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.issues, [
    {
      path: 'message',
      message: 'String must contain at least 1 character(s)',
    },
    {
      path: 'checkId',
      message: 'Support-Anfrage benötigt checkId, assetId oder removalCaseId.',
    },
  ]);
});

test('safeParseUpdateSupportRequestAssignment akzeptiert Assignment-Audit-Payload', () => {
  const result = safeParseUpdateSupportRequestAssignment({
    assignedTo: 'Murat S.',
    assignedBy: 'admin-console',
    reason: 'Backoffice-Priorisierung',
  });

  assert.equal(result.success, true);
});

test('safeParseTransitionSupportRequestStatus akzeptiert Status-Transition-Payload', () => {
  const result = safeParseTransitionSupportRequestStatus({
    status: 'in_progress',
    changedBy: 'admin-console',
    reason: 'Aktive Bearbeitung gestartet',
  });

  assert.equal(result.success, true);
});

test('safeParseIntakeOrchestrator validiert den serverseitigen Intake-Orchestrator-Pfad', () => {
  const result = safeParseIntakeOrchestrator({
    concern: 'request-help',
    payload: {
      check: {
        type: 'source_only',
        input: {
          submittedSourceIds: ['source-seed-1'],
        },
      },
      source: {
        sourceType: 'other_url',
        sourceUrl: 'https://example.org/evidence',
        checkId: 'check-seed-1',
      },
      support: {
        requestType: 'removal',
        priority: 'urgent',
        checkId: 'check-seed-1',
        message: 'Bitte Intake übernehmen',
      },
    },
  });

  assert.equal(result.success, true);
});
