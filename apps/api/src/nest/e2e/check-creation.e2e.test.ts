/**
 * E2E Test Suite: Check Creation Flow
 *
 * Tests the complete flow from user registration to check creation and result viewing.
 * Requires: Real database, Redis, and API running
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
const TEST_TIMEOUT = 30000;

interface TestUser {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

interface CheckResponse {
  id: string;
  type: string;
  status: string;
  input: Record<string, unknown>;
  createdAt: string;
}

describe('Check Creation E2E Tests', () => {
  let testUser: TestUser | null = null;

  before(async () => {
    // Setup: Create test user
    console.log('Setting up test user...');
    const registerRes = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'Test@1234!secure',
      }),
    });

    if (!registerRes.ok) {
      console.error('Failed to register test user:', registerRes.statusText);
      throw new Error('User registration failed');
    }

    const userData = (await registerRes.json()) as TestUser;
    testUser = userData;
    console.log(`Test user created: ${testUser.email}`);
  });

  after(async () => {
    // Cleanup: Delete test user
    if (testUser) {
      console.log(`Cleaning up test user: ${testUser.email}`);
      // In production, add DELETE /api/v1/users/:id endpoint
    }
  });

  it('should create a leak email check and poll for results', async () => {

    assert(testUser, 'Test user not created');

    // Step 1: Create a leak email check
    const createRes = await fetch(`${API_BASE_URL}/api/v1/checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUser.accessToken}`,
      },
      body: JSON.stringify({
        type: 'leak_email',
        input: {
          email: testUser.email,
        },
      }),
    });

    assert(createRes.ok, `Failed to create check: ${createRes.statusText}`);
    const checkData = (await createRes.json()) as CheckResponse;
    assert(checkData.id, 'Check ID not returned');
    assert.strictEqual(checkData.type, 'leak_email', 'Check type mismatch');

    const checkId = checkData.id;
    console.log(`Created check: ${checkId}`);

    // Step 2: Poll for check completion (max 10 attempts, 2s interval)
    let completed = false;
    let finalStatus = 'pending';
    let results: any = null;

    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s

      const getRes = await fetch(`${API_BASE_URL}/api/v1/checks/${checkId}`, {
        headers: {
          Authorization: `Bearer ${testUser.accessToken}`,
        },
      });

      assert(getRes.ok, `Failed to fetch check: ${getRes.statusText}`);
      const check = (await getRes.json()) as CheckResponse;
      finalStatus = check.status;

      console.log(`[Attempt ${i + 1}/10] Check status: ${finalStatus}`);

      if (finalStatus === 'completed' || finalStatus === 'failed') {
        completed = true;
        results = check;
        break;
      }
    }

    assert(completed, `Check did not complete in time. Final status: ${finalStatus}`);
    assert(results, 'Results not available');
    assert.strictEqual(results.status, 'completed', 'Check status not completed');

    console.log(`Check completed with status: ${results.status}`);
    console.log(`Risk level: ${results.risk?.riskLevel}`);
    console.log(`Breach count: ${results.risk?.breaches?.length ?? 0}`);
  });

  it('should create an image check with asset upload', async () => {

    assert(testUser, 'Test user not created');

    // Step 1: Request upload intent (presigned URL)
    const intentRes = await fetch(`${API_BASE_URL}/api/v1/assets/upload-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUser.accessToken}`,
      },
      body: JSON.stringify({
        mimeType: 'image/jpeg',
        fileSize: 1024,
        filename: 'test-image.jpg',
      }),
    });

    assert(intentRes.ok, `Failed to get upload intent: ${intentRes.statusText}`);
    const intent = (await intentRes.json()) as { assetId: string; presignedUrl: string };
    assert(intent.assetId, 'Asset ID not returned');
    assert(intent.presignedUrl, 'Presigned URL not returned');

    const assetId = intent.assetId;
    console.log(`Asset created: ${assetId}`);

    // Step 2: Create check linked to asset
    const createRes = await fetch(`${API_BASE_URL}/api/v1/checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUser.accessToken}`,
      },
      body: JSON.stringify({
        type: 'image',
        input: {
          assetId,
        },
      }),
    });

    assert(createRes.ok, `Failed to create check: ${createRes.statusText}`);
    const check = (await createRes.json()) as CheckResponse;
    assert.strictEqual(check.type, 'image', 'Check type mismatch');

    console.log(`Image check created: ${check.id}`);
  });

  it('should create and retrieve support request', async () => {

    assert(testUser, 'Test user not created');

    // First, create a check to reference
    const checkRes = await fetch(`${API_BASE_URL}/api/v1/checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUser.accessToken}`,
      },
      body: JSON.stringify({
        type: 'leak_email',
        input: { email: testUser.email },
      }),
    });

    assert(checkRes.ok, 'Failed to create check');
    const check = (await checkRes.json()) as CheckResponse;

    // Create support request
    const supportRes = await fetch(`${API_BASE_URL}/api/v1/support-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUser.accessToken}`,
      },
      body: JSON.stringify({
        requestType: 'support',
        priority: 'medium',
        message: 'I need help with my leaked data',
        checkId: check.id,
      }),
    });

    assert(supportRes.ok, `Failed to create support request: ${supportRes.statusText}`);
    const supportReq = (await supportRes.json()) as any;
    assert(supportReq.id, 'Support request ID not returned');

    console.log(`Support request created: ${supportReq.id}`);

    // Retrieve support request
    const getRes = await fetch(`${API_BASE_URL}/api/v1/support-requests/${supportReq.id}`, {
      headers: {
        Authorization: `Bearer ${testUser.accessToken}`,
      },
    });

    assert(getRes.ok, `Failed to retrieve support request: ${getRes.statusText}`);
    const retrieved = (await getRes.json()) as any;
    assert.strictEqual(retrieved.id, supportReq.id, 'Support request ID mismatch');
    assert.strictEqual(retrieved.status, 'open', 'Support request should be open');

    console.log(`Support request retrieved successfully`);
  });

  it('should list checks for authenticated user', async () => {

    assert(testUser, 'Test user not created');

    // Create a few checks
    for (let i = 0; i < 2; i++) {
      await fetch(`${API_BASE_URL}/api/v1/checks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser.accessToken}`,
        },
        body: JSON.stringify({
          type: 'leak_email',
          input: { email: `test-${Date.now()}-${i}@example.com` },
        }),
      });
    }

    // List checks
    const listRes = await fetch(`${API_BASE_URL}/api/v1/checks`, {
      headers: {
        Authorization: `Bearer ${testUser.accessToken}`,
      },
    });

    assert(listRes.ok, `Failed to list checks: ${listRes.statusText}`);
    const checks = (await listRes.json()) as CheckResponse[];
    assert(Array.isArray(checks), 'Response is not an array');
    assert(checks.length >= 2, 'Should have at least 2 checks');

    console.log(`Retrieved ${checks.length} checks`);
  });
});
