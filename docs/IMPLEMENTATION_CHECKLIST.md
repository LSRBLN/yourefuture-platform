# 🚀 TrustShield API Implementation Checklist

## Phase 1: Setup (Today – 30 minutes)

### Backend Setup
- [ ] Copy `.env.example` → `.env.local` in `/apps/api`
```bash
cd apps/api
cp .env.example .env.local
```

- [ ] Verify LeakCheck API Key is set
```bash
grep LEAKCHECK_API_KEY .env.local
# Should show: LEAKCHECK_API_KEY=76d81752e9656ea124a08953dd3f45f3b804539a
```

- [ ] Generate Hugging Face API Key (5 minutes)
  - Go: https://huggingface.co/join
  - Sign up (free account)
  - Go: https://huggingface.co/settings/tokens
  - Create token → Copy to `.env.local`

```bash
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
```

- [ ] (Optional) Generate Google Cloud API Key (5 minutes)
  - Go: https://console.cloud.google.com/
  - Create new project
  - Enable Vision API
  - Create Service Account
  - Download JSON key
  - Copy credentials to `.env.local`

### Test APIs
- [ ] Run test suite
```bash
cd apps/api
npm install
npm run test
```

Expected output:
```
✓ LeakCheck API (email check)
✓ Pwned Passwords API (password check)
✓ Hugging Face API (image analysis)
```

- [ ] Manual curl tests
```bash
# Test LeakCheck
curl -X GET "https://leakcheck.io/api/v2/search" \
  -H "X-API-KEY: 76d81752e9656ea124a08953dd3f45f3b804539a" \
  -G --data-urlencode "query=test@gmail.com" \
  --data-urlencode "type=email"

# Test Pwned Passwords
curl "https://api.pwnedpasswords.com/range/5BAA6"
```

---

## Phase 2: Backend Implementation (Today – 1 hour)

### API Endpoints Implementation
- [ ] Create `/src/routes/checks.controller.ts`
  - Endpoint: `POST /api/v1/checks/leak`
  - Endpoint: `POST /api/v1/checks/image`
  - Endpoint: `POST /api/v1/checks/password-strength`
  - Endpoint: `POST /api/v1/checks/comprehensive`

**Checklist:**
```
POST /api/v1/checks/leak
├── Input: { email?, password?, username?, domain? }
├── Output: { email: LeakCheckResult, password: PasswordCheckResult, summary }
├── Rate-limit: 10 req/min
└── Cache: Results for 24h

POST /api/v1/checks/password-strength
├── Input: { password: string }
├── Output: { strength, score, isPwned, suggestions }
├── Rate-limit: 20 req/min
└── Validation: Min 1 char

POST /api/v1/checks/image
├── Input: { imageUrl: string | imageBase64: string }
├── Output: { hasNSFW, faces, contains_deepfake, deepfake_confidence }
├── Rate-limit: 5 req/min
├── Max size: 50MB
└── Supported: JPG, PNG, WebP

POST /api/v1/checks/comprehensive
├── Input: { email?, imageUrl? }
├── Output: { leaks, image }
├── Rate-limit: Combined
└── Parallel execution
```

- [ ] Implement error handling & logging
- [ ] Implement rate limiting per IP/User
- [ ] Implement result caching (Redis)
- [ ] Add health check endpoint
```typescript
GET /api/v1/health
Response: { status: 'ok', leakcheck: 'ok', hibp: 'ok', huggingface: 'ok' }
```

### Database Schema (if needed)
- [ ] Create `checks` table (optional for audit trail)
```sql
CREATE TABLE checks (
  id UUID PRIMARY KEY,
  user_id UUID,
  check_type ENUM('leak', 'image', 'password'),
  input_hash VARCHAR(255),
  result JSONB,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

- [ ] Create `results_cache` table
```sql
CREATE TABLE results_cache (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB,
  expires_at TIMESTAMP
);
```

### Testing
- [ ] Unit tests for each endpoint
```typescript
describe('ChecksController', () => {
  it('should check email leaks', async () => {
    const result = await controller.checkLeak({ email: 'test@gmail.com' });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
  
  it('should check password strength', async () => {
    const result = await controller.checkPasswordStrength({ password: 'test123' });
    expect(result.success).toBe(true);
    expect(result.data?.strength).toBeDefined();
  });
});
```

- [ ] Integration tests (API calls)
```bash
npm run test:integration
```

---

## Phase 3: Frontend Implementation (Day 2 – 1 hour)

### Setup
- [ ] Create `/src/lib/api-client.ts`
  - Wrapper for API calls
  - Error handling
  - Typing

- [ ] Create `.env.local` in `/apps/web`
```bash
REACT_APP_API_URL=http://localhost:3000/api/v1
```

### Components
- [ ] Create `LeakCheckWidget` component
```typescript
<LeakCheckWidget onResultChange={handleResult} />
```

- [ ] Create `ImageAnalysisWidget` component
- [ ] Create `PasswordStrengthInput` component

### Integration
- [ ] Add widgets to registration form
```typescript
<RegistrationForm>
  <InputField name="email" />
  <LeakCheckWidget onResultChange={handleEmailLeakCheck} />
  
  <InputField name="password" type="password" />
  <PasswordStrengthInput onResultChange={handlePasswordCheck} />
  
  <FileUpload name="profileImage" />
  <ImageAnalysisWidget onResultChange={handleImageAnalysis} />
</RegistrationForm>
```

- [ ] Add real-time validation
- [ ] Add error messaging
- [ ] Add loading states

### Testing
- [ ] Unit tests for API client
```typescript
describe('apiClient', () => {
  it('should check email leaks', async () => {
    const result = await apiClient.checkEmailLeak('test@gmail.com');
    expect(result.summary).toBeDefined();
  });
});
```

- [ ] Component tests
```typescript
describe('LeakCheckWidget', () => {
  it('should display leak check result', async () => {
    const { getByText } = render(<LeakCheckWidget />);
    const input = getByText('Enter your email...');
    await userEvent.type(input, 'test@gmail.com');
    const button = getByText('Check');
    await userEvent.click(button);
    await waitFor(() => {
      expect(getByText(/breaches/i)).toBeInTheDocument();
    });
  });
});
```

---

## Phase 4: Security & Production (Day 3 – 2 hours)

### Security Audit
- [ ] Review API keys (never in Git)
```bash
# Check .gitignore
grep ".env.local" .gitignore
```

- [ ] Implement HTTPS/TLS
- [ ] Add CORS headers
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

- [ ] Add request validation (rate limiting, input sanitization)
- [ ] Add DSGVO compliance
  - [ ] Data retention policy
  - [ ] User consent for image uploads
  - [ ] Ability to delete data

### Performance
- [ ] Implement caching
  - Redis for API responses (24h TTL)
  - Browser cache for images (1h)

- [ ] Implement result compression
- [ ] Optimize image uploads (resize, compress)
- [ ] Monitor API latencies

### Monitoring & Logging
- [ ] Setup error tracking (Sentry)
```bash
SENTRY_DSN=https://your-sentry-dsn
```

- [ ] Setup API monitoring
  - Track latency
  - Track error rates
  - Track quota usage

- [ ] Setup alerting
  - Alert if API down
  - Alert if quota exceeded
  - Alert if error rate > 5%

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] User guide (how to use features)
- [ ] Admin guide (monitoring, troubleshooting)

---

## Phase 5: Deployment (Day 4)

### Docker Setup
- [ ] Update `Dockerfile` with API keys (via build args)
- [ ] Update `docker-compose.yml` with environment variables
- [ ] Test Docker build locally
```bash
docker build -t trustshield-api:latest .
docker run -e LEAKCHECK_API_KEY=xxx -p 3000:3000 trustshield-api:latest
```

### Environment Setup
- [ ] Development: `.env.local` (already done)
- [ ] Staging: `.env.staging`
- [ ] Production: `.env.production` (use secrets manager)

```bash
# Production: Use AWS Secrets Manager / Azure KeyVault
export LEAKCHECK_API_KEY=$(aws secretsmanager get-secret-value --secret-id trustshield/leakcheck-key --query 'SecretString' --output text)
```

### Deployment
- [ ] Deploy to staging
```bash
npm run deploy:staging
```

- [ ] Run E2E tests in staging
```bash
npm run test:e2e --env=staging
```

- [ ] Deploy to production
```bash
npm run deploy:production
```

- [ ] Monitor in production (Sentry, DataDog, etc.)

---

## Phase 6: Monitoring & Maintenance (Ongoing)

### Weekly Tasks
- [ ] Check API health
```bash
curl https://api.trustshield.com/api/v1/health
```

- [ ] Review error logs
- [ ] Monitor quota usage
- [ ] Check performance metrics

### Monthly Tasks
- [ ] Review leak check accuracy
- [ ] Update API dependencies
- [ ] Rotate API keys (if supported)
- [ ] Review user feedback

### Quarterly Tasks
- [ ] Evaluate new APIs (SightEngine, TinEye, etc.)
- [ ] Plan for scale (if needed)
- [ ] Security audit
- [ ] Cost analysis

---

## Testing Checklist

### Unit Tests
```bash
npm run test:unit
```
- [ ] LeakCheckService
- [ ] PwnedPasswordsService
- [ ] ImageAnalysisService
- [ ] ExternalAPIService

### Integration Tests
```bash
npm run test:integration
```
- [ ] All endpoints respond correctly
- [ ] Rate limiting works
- [ ] Error handling works
- [ ] Caching works

### E2E Tests
```bash
npm run test:e2e
```
- [ ] Registration form with leak checks
- [ ] Image upload with analysis
- [ ] Full workflow end-to-end

---

## Deployment Checklist

- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] API keys are in secrets manager
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Caching is working
- [ ] Monitoring/alerting is set up
- [ ] Documentation is updated
- [ ] Team is trained

---

## Rollback Plan

If something goes wrong:

1. **Immediate:** Disable affected API endpoint
```bash
FEATURE_LEAK_CHECK_ENABLED=false
```

2. **Revert:** Deploy previous version
```bash
git revert <commit-hash>
npm run deploy:production
```

3. **Investigate:** Check logs in Sentry
4. **Fix & Deploy:** After fix, deploy again

---

## Timeline

```
Day 1 (Today):
├── 09:00 - API Setup & Testing (30 min)
├── 09:30 - Backend Implementation (1 hour)
└── 10:30 - Done! ✅

Day 2:
├── 09:00 - Frontend Implementation (1 hour)
└── 10:00 - Integration Testing (30 min)

Day 3:
├── 09:00 - Security & Performance (2 hours)
└── 11:00 - Monitoring Setup (1 hour)

Day 4:
└── 09:00 - Deployment to Production (2 hours)

Total: ~7 hours of work spread over 4 days
Result: Production-ready MVP with all features! 🎉
```

---

## Cost Analysis (First 3 Months)

| Service | Cost | Usage |
|---------|------|-------|
| LeakCheck.io | €0 | 200 req/day (free tier) |
| HIBP | €0 | Unlimited (public API) |
| Hugging Face | €0 | Fair use (no hard limit) |
| Google Cloud Vision | €0 | 1K images/month free |
| AWS | €0 | 5K images/month (12 months) |
| **TOTAL** | **€0** | **100% Kostenlos!** |

---

**Status:** Ready to start! 🚀
**Next Step:** Begin Phase 1 today
**Questions:** Check docs/ folder for detailed guides

Good luck! 🎉
