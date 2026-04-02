# Syncfusion Essential Studio® - License Setup Guide

**Edition:** Essential Studio® UI Edition  
**Date:** April 2, 2026  
**Components Included:** DataGrid, Charts, Inputs, Navigation, Popups

---

## 🔐 License Configuration

### Step 1: Get Your License Key

1. Visit: **https://www.syncfusion.com/**
2. Sign in to your account
3. Go to **License Portal** → **Active Licenses**
4. Copy your license key

### Step 2: Configure Environment Variable

#### Option A: Development (Recommended)

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SYNCFUSION_LICENSE=your_actual_license_key_here
```

**Do NOT commit this file to Git!**

Add to `.gitignore`:
```
apps/web/.env.local
```

#### Option B: Production Deployment

Set environment variable in your deployment platform:

```bash
# Docker
docker run -e NEXT_PUBLIC_SYNCFUSION_LICENSE="your_key" your-app

# Vercel
vercel env add NEXT_PUBLIC_SYNCFUSION_LICENSE

# AWS/Azure/GCP
Set in their respective environment configuration panels
```

### Step 3: Initialize License in Your App

Update `apps/web/src/app/layout.tsx`:

```typescript
import { initSyncfusionLicense } from '@/lib/syncfusion-license';

// Initialize at app startup
if (typeof window === 'undefined') {
  initSyncfusionLicense();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
```

Or in `apps/web/src/app/osint/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { initSyncfusionLicense } from '@/lib/syncfusion-license';
import { SyncfusionOSINTDashboard } from '@/components/osint/SyncfusionOSINTDashboard';

export default function OSINTPage() {
  useEffect(() => {
    initSyncfusionLicense();
  }, []);

  return <SyncfusionOSINTDashboard />;
}
```

---

## ✅ What's Included

### UI Components Included

✅ **DataGrid** (`@syncfusion/ej2-react-grids`)
- Sorting, filtering, pagination
- Excel & PDF export
- Virtual scrolling
- Column templates

✅ **Charts** (`@syncfusion/ej2-react-charts`)
- Line, Bar, Area, Pie charts
- Real-time data updates
- Data labels & legends
- Interactive tooltips

✅ **Inputs** (`@syncfusion/ej2-react-inputs`)
- TextBox
- Dropdown
- Date/Time pickers
- Upload control

✅ **Navigation** (`@syncfusion/ej2-react-navigations`)
- Tabs
- Accordion
- Breadcrumb
- Sidebar

✅ **Popups** (`@syncfusion/ej2-react-popups`)
- Dialog
- Tooltip
- Toast
- Spinner

✅ **Calendar & Schedule** (`@syncfusion/ej2-react-calendars`)
- Date picker
- Calendar
- Time picker

✅ **Buttons** (`@syncfusion/ej2-react-buttons`)
- Button
- Checkbox
- Radio
- Switch

---

## 🎨 Available Themes

### Predefined Themes

```typescript
// Import one theme per app

// Material (Default)
import '@syncfusion/ej2-react-grids/styles/material.css';

// Bootstrap 5
// import '@syncfusion/ej2-react-grids/styles/bootstrap5.css';

// Fluent UI
// import '@syncfusion/ej2-react-grids/styles/fluent.css';

// Tailwind CSS
// import '@syncfusion/ej2-react-grids/styles/tailwind.css';

// Fabric
// import '@syncfusion/ej2-react-grids/styles/fabric.css';

// High Contrast (Accessibility)
// import '@syncfusion/ej2-react-grids/styles/highcontrast.css';
```

### Theme Structure

```
Material Theme:
├── material.css          (Light)
├── material-dark.css     (Dark)
└── bootstrap*.css        (Other variants)
```

---

## 🔍 License Verification

Check if license is properly configured:

```typescript
// apps/web/src/lib/syncfusion-license.ts (already created)
import { isSyncfusionLicensed } from '@/lib/syncfusion-license';

if (isSyncfusionLicensed()) {
  console.log('✅ Syncfusion is licensed');
} else {
  console.warn('⚠️ Syncfusion running in trial mode');
}
```

---

## 📊 Trial vs Licensed Behavior

| Feature | Trial (30 days) | Licensed |
|---------|---|---|
| All Components | ✅ | ✅ |
| Full Functionality | ✅ | ✅ |
| Watermark | ❌ | ✅ (None) |
| Support | Limited | ✅ Premium |
| Updates | ✅ | ✅ |
| Commercial Use | ❌ | ✅ |

---

## 🚀 Deployment

### Vercel

```bash
# Set license key
vercel env add NEXT_PUBLIC_SYNCFUSION_LICENSE "your_key"

# Deploy
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine

ENV NEXT_PUBLIC_SYNCFUSION_LICENSE=your_key

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

CMD ["npm", "start"]
```

Run:
```bash
docker build -t osint-app .
docker run -e NEXT_PUBLIC_SYNCFUSION_LICENSE="your_key" osint-app
```

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_SYNCFUSION_LICENSE: ${{ secrets.SYNCFUSION_LICENSE }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run build
      - run: npm run deploy
```

---

## 🔗 Support & Resources

### Official Links
- **License Portal:** https://www.syncfusion.com/account/licenses
- **Documentation:** https://www.syncfusion.com/react-components/
- **Support:** https://www.syncfusion.com/support/directtrac/
- **Community:** https://www.syncfusion.com/forums/

### Your License Info
- **Edition:** Essential Studio® UI Edition
- **Components Included:** 80+ React components
- **Support Level:** Professional

---

## ✅ Checklist

- [ ] License key obtained from Syncfusion
- [ ] `.env.local` created with license key
- [ ] `.gitignore` includes `.env.local`
- [ ] `syncfusion-license.ts` imported in app
- [ ] Theme CSS imported in layout
- [ ] Verified no watermark appears
- [ ] Components rendering correctly
- [ ] Ready for production deployment

---

## 🆘 Troubleshooting

### License Not Found Warning

**Problem:** Console shows license warning

**Solution:**
```bash
# Check if .env.local exists
cat apps/web/.env.local

# Verify key format
echo $NEXT_PUBLIC_SYNCFUSION_LICENSE

# Restart development server
npm run dev
```

### Watermark Still Appears

**Problem:** Watermark visible even with license

**Solution:**
1. Verify license key is correct
2. Check license hasn't expired
3. Clear browser cache (`Ctrl+Shift+Delete`)
4. Rebuild: `npm run build`

### Invalid License Error

**Problem:** "Invalid license" error in console

**Solution:**
1. Get new license from: https://www.syncfusion.com/account/licenses
2. Ensure license matches your Syncfusion version
3. Check for special characters in key
4. Contact: support@syncfusion.com

---

## 📝 License Terms

- **Commercial Use:** ✅ Allowed with valid license
- **Redistribution:** ❌ Not allowed
- **Support Duration:** 12 months from purchase
- **Free Updates:** ✅ Included
- **Trial Period:** 30 days (full features)

---

## 💰 Licensing Options

### Available Plans

1. **Community License** (FREE)
   - For open-source projects
   - Limited components
   - Community support

2. **Developer License** ($999/year)
   - Single developer
   - All components
   - Email support

3. **Team License** ($1,999/year)
   - Up to 5 developers
   - All components
   - Priority support

4. **Enterprise License** (Custom pricing)
   - Unlimited developers
   - Custom components
   - Dedicated support

---

**Status:** ✅ Ready to use  
**Next Step:** Run `npm install @syncfusion/ej2-react-*` and set `.env.local`

Happy coding! 🚀
