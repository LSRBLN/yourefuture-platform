# Syncfusion React Integration - Quick Start

✅ **Installation Status: COMPLETE**

## 🎯 What's Been Done

- ✅ Syncfusion packages installed via pnpm
  - @syncfusion/ej2-react-grids 33.1.46
  - @syncfusion/ej2-react-charts 33.1.44
  - @syncfusion/ej2-react-navigations 33.1.45
  - @syncfusion/ej2-react-inputs 33.1.44
  - @syncfusion/ej2-react-buttons 33.1.44
  - @syncfusion/ej2-react-dropdowns 33.1.46
  - @syncfusion/ej2-react-popups 33.1.44

- ✅ React Query + Axios installed for API integration
- ✅ Syncfusion CSS themes imported in layout
- ✅ Configuration files created
- ✅ License registration module ready

## 📋 3-Step Setup

### Step 1: Add License Key (2 minutes)

Create `apps/web/.env.local`:

```bash
cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_SYNCFUSION_LICENSE=Ngo9BigBOggjGyl/VkV+XU9AclRDX3xKf0x/TGpQb19xflBPallYVBYiSV9jS3hTckVhWXxdcnBSQGNUVU91XA==
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_THEME=light
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=20
EOF
```

**Important:** Never commit `.env.local` to Git!

### Step 2: Start Development Server (1 minute)

```bash
cd apps/web
npm run dev
```

Server runs on: **http://localhost:3000**

### Step 3: Verify Installation (2 minutes)

1. Open browser → http://localhost:3000
2. Check console (F12) - should show **no license warnings**
3. Syncfusion components are ready to use! ✅

## 🚀 Next: Use Components

### Import Dashboard

In your page component:

```typescript
'use client';

import { SyncfusionOSINTDashboard } from '@/components/osint/SyncfusionOSINTDashboard';

export default function OSINTPage() {
  return <SyncfusionOSINTDashboard />;
}
```

### Use React Query Hooks

```typescript
import { useUsernameSearch } from '@/lib/osint-api';

export function SearchForm() {
  const { data, isLoading } = useUsernameSearch('johndoe');
  
  return (
    <div>
      {isLoading ? 'Searching...' : JSON.stringify(data)}
    </div>
  );
}
```

## 📦 File Structure

```
apps/web/
├── .env.local ← Add your license key here
├── .env.local.example ← Template reference
├── src/
│   ├── app/
│   │   └── layout.tsx ← Syncfusion CSS imported + license registered
│   ├── config/
│   │   └── syncfusion-config.ts ← Configuration defaults
│   ├── lib/
│   │   ├── osint-api.ts ← React Query hooks
│   │   └── syncfusion-license.ts ← License registration
│   └── components/osint/
│       └── SyncfusionOSINTDashboard.tsx ← Main dashboard
```

## ✅ Verification Checklist

- [ ] `.env.local` created with license key
- [ ] `npm run dev` starts without errors
- [ ] No license warnings in console
- [ ] Dashboard renders at http://localhost:3000/osint
- [ ] DataGrid is interactive (sort, filter, export)
- [ ] Charts display correctly

## 🔧 Troubleshooting

### License Warning in Console

**Error:** `"Syncfusion is not licensed"`

**Solution:**
1. Check `.env.local` has the license key
2. Restart dev server: `npm run dev`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Verify key is copied exactly (no extra spaces)

### Syncfusion Styles Not Loading

**Error:** Components look unstyled

**Solution:**
- CSS imports are in [layout.tsx](apps/web/src/app/layout.tsx#L1-L15)
- If still broken, rebuild: `npm run build`

### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
npm run dev -- --port 3001
```

## 📚 Resources

- **Official Docs:** https://www.syncfusion.com/react-components/
- **License Portal:** https://www.syncfusion.com/account/licenses
- **API Reference:** [osint-api.ts](apps/web/src/lib/osint-api.ts)
- **Dashboard Component:** [SyncfusionOSINTDashboard.tsx](apps/web/src/components/osint/SyncfusionOSINTDashboard.tsx)

## 🎉 You're Ready!

All setup is complete. Your OSINT dashboard is ready to roll! 🚀

**Next step:** Run `npm run dev` in `apps/web/`

---

**Installation Date:** April 2, 2026  
**Syncfusion Version:** 33.1.x (Latest 2024)  
**Node.js:** 18+  
**Package Manager:** pnpm 9+
