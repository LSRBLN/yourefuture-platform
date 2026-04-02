# Syncfusion React Integration - OSINT Dashboard Setup

**Status:** ✅ Ready to implement  
**Framework:** Next.js 14+ with React Query  
**UI Library:** Syncfusion EJ2  
**Date:** April 2, 2026

---

## 📦 Installation

### Step 1: Install Dependencies

```bash
cd apps/web

# Core Syncfusion packages
npm install @syncfusion/ej2-react-grids
npm install @syncfusion/ej2-react-charts
npm install @syncfusion/ej2-react-navigations
npm install @syncfusion/ej2-react-inputs
npm install @syncfusion/ej2-react-buttons
npm install @syncfusion/ej2-react-dropdowns
npm install @syncfusion/ej2-react-popups

# Data fetching & state management
npm install @tanstack/react-query axios

# Utilities
npm install date-fns clsx
```

### Step 2: Add License Key (Optional but Recommended)

Create `apps/web/src/syncfusion-license.ts`:

```typescript
import { registerLicense } from '@syncfusion/ej2-base';

// Get your license key from: https://www.syncfusion.com/
const LICENSE_KEY = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE || '';

if (LICENSE_KEY) {
  registerLicense(LICENSE_KEY);
}
```

Add to your root layout or app initialization:

```typescript
// apps/web/src/app/layout.tsx
import './syncfusion-license';
import '@syncfusion/ej2-react-grids/styles/material.css';
import '@syncfusion/ej2-react-charts/styles/material.css';
import '@syncfusion/ej2-react-navigations/styles/material.css';
```

### Step 3: Setup React Query Provider

Create `apps/web/src/providers/QueryClientProvider.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Update layout:

```typescript
// apps/web/src/app/layout.tsx
import { QueryProvider } from '@/providers/QueryClientProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## 🎨 Component Structure

### Files Created

```
apps/web/src/
├── lib/
│   └── osint-api.ts (API client + React Query hooks)
│
├── components/osint/
│   ├── SyncfusionOSINTDashboard.tsx (Main dashboard)
│   ├── OsintSearchBar.tsx (Reusable search)
│   ├── ResultsGrid.tsx (Reusable grid)
│   ├── BreachIndicator.tsx (Breach display)
│   ├── ImageGallery.tsx (Image results)
│   └── Analytics.tsx (Charts & stats)
│
└── pages/
    └── osint/
        ├── page.tsx (Main page)
        ├── layout.tsx (Layout)
        └── search.tsx (Search page)
```

---

## 🚀 Usage

### Basic Implementation

```typescript
// apps/web/src/app/osint/page.tsx
import { SyncfusionOSINTDashboard } from '@/components/osint/SyncfusionOSINTDashboard';

export default function OSINTPage() {
  return (
    <main>
      <SyncfusionOSINTDashboard />
    </main>
  );
}
```

### Using Individual Hooks

```typescript
// Example: Username Search Component
'use client';

import { useUsernameSearch } from '@/lib/osint-api';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';

export function UsernameSearchResults({ username }: { username: string }) {
  const { data, isLoading, error } = useUsernameSearch(username);

  if (isLoading) return <div>Searching...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <GridComponent
      dataSource={data?.data?.results || []}
      allowPaging
      allowSorting
    >
      <ColumnsDirective>
        <ColumnDirective field="source" headerText="Source" />
        <ColumnDirective field="type" headerText="Type" />
        <ColumnDirective field="data" headerText="Data" />
      </ColumnsDirective>
    </GridComponent>
  );
}
```

---

## 🎯 Key Syncfusion Components

### 1. **GridComponent** - Data Display

```typescript
<GridComponent
  dataSource={data}
  allowPaging        // Enable pagination
  allowSorting       // Enable column sorting
  allowFiltering     // Enable filtering
  allowExcelExport   // Export to Excel
  allowPdfExport     // Export to PDF
  toolbar={['ExcelExport', 'PdfExport', 'Search']}
  pageSettings={{ pageSize: 10 }}
>
  <ColumnsDirective>
    <ColumnDirective field="name" headerText="Name" width="100" />
    <ColumnDirective field="date" headerText="Date" type="date" format="yMd" />
    <ColumnDirective field="amount" headerText="Amount" type="number" />
  </ColumnsDirective>
</GridComponent>
```

### 2. **ChartComponent** - Visualizations

```typescript
<ChartComponent id="chart">
  <SeriesCollectionDirective>
    <SeriesDirective
      dataSource={data}
      xName="month"
      yName="sales"
      name="Sales"
    />
  </SeriesCollectionDirective>
</ChartComponent>
```

### 3. **TabsDirective** - Tab Navigation

```typescript
<TabsDirective>
  <TabItemDirective header={{ text: 'Results' }}>
    <ResultsGrid />
  </TabItemDirective>
  <TabItemDirective header={{ text: 'Analytics' }}>
    <AnalyticsChart />
  </TabItemDirective>
</TabsDirective>
```

### 4. **TextBoxComponent** - Input Fields

```typescript
<TextBoxComponent
  value={query}
  change={(e) => setQuery(e.value)}
  placeholder="Enter search..."
  multiline
  rows={3}
/>
```

### 5. **DropDownListComponent** - Selectors

```typescript
<DropDownListComponent
  dataSource={options}
  fields={{ text: 'text', value: 'value' }}
  value={selectedValue}
  change={(e) => setSelectedValue(e.value)}
/>
```

---

## 🎨 Theming

### Syncfusion Themes

```typescript
// apps/web/src/app/layout.tsx

// Light themes
import '@syncfusion/ej2-react-grids/styles/material.css';

// Dark theme (optional)
// import '@syncfusion/ej2-react-grids/styles/material-dark.css';

// Other available themes:
// - bootstrap4.css
// - bootstrap5.css
// - fluent.css
// - fabric.css
// - tailwind.css (NEW!)
```

### Custom Theme

```css
/* apps/web/src/styles/syncfusion-custom.css */

:root {
  --sf-primary-color: #3b82f6;
  --sf-success-color: #10b981;
  --sf-danger-color: #ef4444;
  --sf-warning-color: #f59e0b;
  --sf-background-color: #f9fafb;
  --sf-text-color: #1f2937;
  --sf-border-color: #e5e7eb;
}

.e-grid {
  font-family: 'Inter', sans-serif;
}

.e-toolbar {
  background-color: var(--sf-background-color);
  border-bottom: 1px solid var(--sf-border-color);
}
```

---

## 🔄 API Integration Pattern

### Query-Based Search

```typescript
// apps/web/src/hooks/useOSINTSearch.ts
import { useQuery } from '@tanstack/react-query';
import { osintAPI } from '@/lib/osint-api';

export function useOSINTSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['osint', 'search', query],
    queryFn: () => osintAPI.universalSearch(query),
    enabled: !!query && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
```

### Mutation-Based Actions

```typescript
// apps/web/src/hooks/useIndexImage.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { osintAPI } from '@/lib/osint-api';

export function useIndexImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUrl: string) => osintAPI.indexImage(imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['osint', 'stats'] });
    },
  });
}
```

---

## 📊 Dashboard Examples

### Example 1: Search Results Grid

```typescript
<GridComponent
  dataSource={results}
  allowPaging
  allowSorting
  allowFiltering
  pageSettings={{ pageSize: 25 }}
  actionComplete={(args: any) => {
    if (args.requestType === 'save') {
      console.log('Data saved:', args.data);
    }
  }}
>
  <ColumnsDirective>
    <ColumnDirective
      field="source"
      headerText="Source"
      width="120"
      template={(props: any) => (
        <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>
          {props.source}
        </span>
      )}
    />
    <ColumnDirective
      field="accuracy"
      headerText="Accuracy"
      width="150"
      template={accuracyTemplate}
    />
  </ColumnsDirective>
</GridComponent>
```

### Example 2: Breach Severity Chart

```typescript
<ChartComponent id="breach-severity">
  <SeriesCollectionDirective>
    <SeriesDirective
      dataSource={breachData}
      xName="name"
      yName="affectedCount"
      type="Column"
      cornerRadius={5}
      marker={{ dataLabel: { visible: true } }}
    />
  </SeriesCollectionDirective>
  <ChartInject services={[ColumnSeries, DataLabel, Tooltip, Legend]} />
</ChartComponent>
```

### Example 3: Search Performance Timeline

```typescript
<ChartComponent id="search-timeline">
  <SeriesCollectionDirective>
    <SeriesDirective
      dataSource={performanceData}
      xName="timestamp"
      yName="searchTime"
      type="Spline"
      marker={{ visible: true, width: 10 }}
      name="Search Time (ms)"
    />
  </SeriesCollectionDirective>
  <ChartInject services={[SplineSeries, DateTime, Legend, Tooltip]} />
</ChartComponent>
```

---

## ⚙️ Performance Optimization

### 1. Virtual Scrolling for Large Datasets

```typescript
<GridComponent
  enableVirtualization
  enableColumnVirtualization
  rowHeight={48}
>
  {/* Columns */}
</GridComponent>
```

### 2. Lazy Loading

```typescript
<GridComponent
  dataSource={dataManager}
  actionFailure={(args: any) => {
    if (args.error.statusCode === 401) {
      // Handle auth error
    }
  }}
  pageSettings={{ pageSize: 50 }}
>
  {/* Columns */}
</GridComponent>
```

### 3. Query Optimization

```typescript
// Cache longer for expensive operations
const { data } = useQuery({
  queryKey: ['osint', 'comprehensive', query],
  queryFn: () => searchComprehensive(query),
  staleTime: 15 * 60 * 1000, // 15 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
});
```

---

## 🧪 Testing

### Jest + React Testing Library

```typescript
// apps/web/src/components/osint/__tests__/SyncfusionDashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { SyncfusionOSINTDashboard } from '../SyncfusionOSINTDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('SyncfusionOSINTDashboard', () => {
  it('renders search bar', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SyncfusionOSINTDashboard />
      </QueryClientProvider>
    );

    expect(screen.getByPlaceholderText(/Enter username/i)).toBeInTheDocument();
  });

  it('displays results after search', async () => {
    // Mock API call
    // Trigger search
    // Assert results displayed
  });
});
```

---

## 📱 Responsive Design

### Mobile-First Approach

```typescript
// apps/web/src/styles/responsive.css

@media (max-width: 768px) {
  .e-grid {
    font-size: 12px;
  }

  .e-grid .e-gridheader {
    display: none; /* Hide headers on mobile */
  }

  .search-bar {
    grid-template-columns: 1fr; /* Stack inputs */
  }
}

@media (max-width: 480px) {
  .e-toolbar {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr; /* Single column */
  }
}
```

---

## 🔐 Security Best Practices

### Input Validation

```typescript
// apps/web/src/lib/validation.ts
import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().min(2).max(255),
  type: z.enum(['username', 'email', 'phone', 'domain', 'image']),
});

export function validateSearch(data: any) {
  try {
    return searchSchema.parse(data);
  } catch (error) {
    return null;
  }
}
```

### XSS Prevention

```typescript
// Safe rendering with Syncfusion
<GridComponent
  dataSource={sanitizeData(apiResponse)}
  // Syncfusion handles escaping
/>
```

---

## 🚀 Deployment Checklist

- [ ] License key configured (if using commercial)
- [ ] React Query configured
- [ ] API endpoints working
- [ ] CSS themes imported
- [ ] Responsive design tested
- [ ] Performance optimized (virtual scrolling, pagination)
- [ ] Error handling implemented
- [ ] Unit tests written
- [ ] E2E tests passing
- [ ] Production build optimized

---

## 📚 Resources

- **Syncfusion React Docs:** https://www.syncfusion.com/react-components/
- **React Query Docs:** https://tanstack.com/query/latest
- **Next.js Docs:** https://nextjs.org/docs
- **Syncfusion License:** https://www.syncfusion.com/

---

## 💡 Pro Tips

### 1. Use Template Functions for Custom Rendering
```typescript
const cellTemplate = (props: any) => {
  return <CustomComponent data={props} />;
};

<ColumnDirective field="data" template={cellTemplate} />
```

### 2. Implement Smart Caching
```typescript
// Don't cache user-specific data
const { data } = useQuery({
  queryKey: ['osint', userId, query],
  queryFn: () => search(userId, query),
  staleTime: 0, // No cache for user data
});
```

### 3. Handle Large Result Sets
```typescript
// Use pagination or virtual scrolling
<GridComponent
  enableVirtualization
  rowHeight={48}
  pageSettings={{ pageSize: 100 }}
/>
```

---

## ✅ Status

**Status:** ✅ Ready for Implementation  
**Files Created:** 2 (osint-api.ts, SyncfusionOSINTDashboard.tsx)  
**Setup Time:** ~30 minutes  
**Learning Curve:** Medium (if familiar with React Query)

---

**Happy coding! 🚀**
