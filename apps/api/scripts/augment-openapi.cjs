const fs = require('node:fs');
const path = require('node:path');

const outputPath = path.join(__dirname, '..', 'openapi.generated.json');

if (!fs.existsSync(outputPath)) {
  process.exit(0);
}

const document = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

function ensurePath(pathKey, operation, value) {
  document.paths ??= {};
  document.paths[pathKey] ??= {};
  document.paths[pathKey][operation] ??= value;
}

ensurePath('/api/v1/assets', 'post', {
  summary: 'Create a secure upload intent for an asset',
  tags: ['Assets'],
  security: [{ bearer: [] }],
  requestBody: { required: true },
  responses: { 201: { description: 'Asset upload intent created' } },
});
ensurePath('/api/v1/assets/{id}', 'get', {
  summary: 'Get asset metadata by id',
  tags: ['Assets'],
  security: [{ bearer: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: { 200: { description: 'Asset metadata' }, 404: { description: 'Asset not found' } },
});
ensurePath('/api/v1/assets/{id}/deepfake-results', 'get', {
  summary: 'Get deepfake analysis status and results for an asset',
  tags: ['Assets'],
  security: [{ bearer: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: { 200: { description: 'Deepfake analysis status' }, 404: { description: 'Asset not found' } },
});
ensurePath('/api/v1/intake/orchestrator', 'post', {
  summary: 'Create transactional intake across check, source and support request',
  tags: ['Intake'],
  responses: { 202: { description: 'Intake accepted' } },
});
ensurePath('/api/v1/removal-cases', 'post', {
  summary: 'Create removal case',
  tags: ['Removal'],
  security: [{ bearer: [] }],
  responses: { 201: { description: 'Removal case created' } },
});
ensurePath('/api/v1/removal-cases/{id}', 'get', {
  summary: 'Get removal case by id',
  tags: ['Removal'],
  security: [{ bearer: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: { 200: { description: 'Removal case detail' }, 404: { description: 'Removal case not found' } },
});
ensurePath('/api/v1/removal-cases/{id}/actions', 'post', {
  summary: 'Append removal action',
  tags: ['Removal'],
  security: [{ bearer: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: { 201: { description: 'Removal action created' }, 404: { description: 'Removal case not found' } },
});
ensurePath('/api/v1/support-requests/{id}/assign', 'post', {
  summary: 'Assign support request',
  tags: ['Support Requests'],
  security: [{ bearer: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: { 200: { description: 'Assignment updated' }, 404: { description: 'Support request not found' } },
});
ensurePath('/api/v1/support-requests/{id}/status', 'post', {
  summary: 'Transition support request status',
  tags: ['Support Requests'],
  security: [{ bearer: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: { 200: { description: 'Status updated' }, 404: { description: 'Support request not found' } },
});

fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
