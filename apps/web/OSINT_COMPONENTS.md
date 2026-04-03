# OSINT Frontend Components

**Status:** 🎨 Design Ready (Ready for Implementation)  
**Version:** 1.0  

## 📋 Component Inventory

### 1. **OSINTSearchPanel** (Main Container)
```tsx
// Location: components/osint/OSINTSearchPanel.tsx
<OSINTSearchPanel 
  onSearch={(query, type) => {}}
  loading={false}
  results={[]}
/>
```

**Props:**
- `onSearch(query: string, type: 'username'|'email'|'phone'|'image'|'domain'|'ip'|'name')` 
- `loading: boolean`
- `results: OSINTResult[]`
- `error?: string`

**Features:**
- Tabbed interface for different search types
- Real-time search suggestions
- Search history
- Saved searches/bookmarks

---

### 2. **SearchTypeSelector** (Tab Navigation)
```tsx
<SearchTypeSelector 
  activeType="username"
  onChange={(type) => {}}
  types={['username', 'email', 'phone', 'image', 'domain', 'ip']}
/>
```

**Search Types:**
1. **Username Search** - 600+ websites
2. **Email Search** - Breach detection
3. **Phone Search** - Carrier info
4. **Image Search** - Reverse image + Qdrant
5. **Domain Search** - WHOIS, DNS, Subdomains
6. **IP Search** - Geolocation, Reverse DNS

---

### 3. **UsernameSearchForm**
```tsx
<UsernameSearchForm 
  onSubmit={(username, comprehensive) => {}}
  loading={false}
/>
```

**Fields:**
- Username input
- Comprehensive toggle (quick vs thorough)
- Search button
- Advanced options (timeout, sources)

---

### 4. **EmailSearchForm**
```tsx
<EmailSearchForm 
  onSubmit={(email, checkBreaches) => {}}
  loading={false}
/>
```

**Fields:**
- Email input (validated)
- Breach check toggle
- Additional options

---

### 5. **ReverseImageSearch**
```tsx
<ReverseImageSearch 
  onSubmit={(imageUrl, includeWeb) => {}}
  onImageUpload={(file) => {}}
  loading={false}
/>
```

**Features:**
- Image URL input
- Image file upload
- Preview thumbnail
- Web search toggle

---

### 6. **OSINTResultsView** (Results Container)
```tsx
<OSINTResultsView 
  results={[]}
  loading={false}
  error={null}
  onExport={() => {}}
/>
```

**Features:**
- Results grouped by source
- Severity indicators (critical, warning, info)
- Expandable details
- Copy-to-clipboard
- Export options (JSON, PDF, CSV)

---

### 7. **ResultCard** (Individual Result)
```tsx
<ResultCard 
  source="Blackbird"
  type="username_presence"
  data={result}
  severity="info"
  accuracy={0.9}
  verified={true}
/>
```

**Display:**
- Source icon
- Result type badge
- Main data
- Accuracy/verification indicator
- Timestamp
- Action buttons (copy, open, more)

---

### 8. **BreachIndicator** (Email Breaches)
```tsx
<BreachIndicator 
  breaches={[
    { name: "LinkedIn", date: "2021-06-22", ... }
  ]}
  hasBreaches={true}
/>
```

**Display:**
- Breach icon
- Breach count
- Breach list with dates
- Data classes affected
- Affected records count

---

### 9. **ImageMatchesGrid** (Reverse Image Results)
```tsx
<ImageMatchesGrid 
  matches={[]}
  loading={false}
  totalMatches={42}
/>
```

**Features:**
- Grid/list toggle
- Image thumbnails
- Similarity scores
- Source indicators
- Click to open original

---

### 10. **OSINTDashboard** (Full Dashboard)
```tsx
<OSINTDashboard 
  currentUser={user}
  searchHistory={[]}
  onSearch={() => {}}
/>
```

**Features:**
- Quick search bar
- Recent searches
- Saved searches
- Analytics/stats
- Bulk search capability

---

## 🎨 Design Specifications

### Color Scheme

```css
/* Severity Levels */
--osint-critical: #ef4444;   /* Red */
--osint-warning: #f59e0b;    /* Amber */
--osint-info: #3b82f6;       /* Blue */
--osint-success: #10b981;    /* Green */

/* Status */
--osint-verified: #10b981;   /* Green */
--osint-unverified: #gray-400;

/* Accuracy Score */
--score-high: #10b981;       /* > 0.85 */
--score-medium: #f59e0b;     /* 0.6 - 0.85 */
--score-low: #ef4444;        /* < 0.6 */
```

### Typography

```css
/* Heading */
font-family: Inter;
font-size: 28px;
font-weight: 700;

/* Body */
font-family: Inter;
font-size: 14px;
font-weight: 400;

/* Monospace (results) */
font-family: JetBrains Mono;
font-size: 12px;
```

### Spacing

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

---

## 📱 Layout Specifications

### Mobile Layout
- Full-width search bar
- Stacked results
- Collapsible sections
- Bottom action menu

### Desktop Layout
- Sidebar for search types
- Two-column layout (search + results)
- Floating action menu
- Resizable panels

### Responsive Breakpoints
```
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
```

---

## 🔌 Integration with API

```typescript
// Example: UsernameSearch Integration

import { useOSINT } from '@/hooks/useOSINT';

export function UsernameSearchPage() {
  const { searchUsername, loading, results, error } = useOSINT();
  
  const handleSearch = async (username: string, comprehensive: boolean) => {
    const result = await searchUsername(username, {
      comprehensive,
      timeout: 30000
    });
    
    // Results automatically populate component state
  };
  
  return (
    <OSINTSearchPanel>
      <UsernameSearchForm onSubmit={handleSearch} loading={loading} />
      <OSINTResultsView results={results} error={error} />
    </OSINTSearchPanel>
  );
}
```

---

## 🧪 Component Testing Strategy

### Unit Tests
```typescript
// tests/components/UsernameSearchForm.test.tsx
describe('UsernameSearchForm', () => {
  it('should validate username input', () => {
    // Test validation
  });
  
  it('should call onSubmit with correct data', () => {
    // Test submission
  });
  
  it('should toggle comprehensive mode', () => {
    // Test toggle
  });
});
```

### Integration Tests
```typescript
// tests/integration/osint-search.test.tsx
describe('OSINT Search Flow', () => {
  it('should search and display results', async () => {
    // Test full flow
  });
  
  it('should handle errors gracefully', async () => {
    // Test error handling
  });
});
```

---

## 📚 Usage Examples

### Example 1: Simple Username Search

```tsx
import { OSINTSearchPanel } from '@/components/osint/OSINTSearchPanel';

export default function Page() {
  return <OSINTSearchPanel />;
}
```

### Example 2: Embedded Search Widget

```tsx
import { SearchTypeSelector } from '@/components/osint/SearchTypeSelector';
import { UsernameSearchForm } from '@/components/osint/forms/UsernameSearchForm';

export function EmbeddedOSINT() {
  const [searchType, setSearchType] = useState('username');
  
  return (
    <div className="osint-widget">
      <SearchTypeSelector activeType={searchType} onChange={setSearchType} />
      {searchType === 'username' && <UsernameSearchForm />}
    </div>
  );
}
```

### Example 3: Dashboard Integration

```tsx
import { OSINTDashboard } from '@/components/osint/OSINTDashboard';
import { useUser } from '@/hooks/useUser';

export default function Dashboard() {
  const user = useUser();
  
  return (
    <div className="dashboard">
      <OSINTDashboard currentUser={user} />
    </div>
  );
}
```

---

## 🎯 Phase-Based Implementation

### Phase 1 (Week 1-2): Core Components
- [ ] OSINTSearchPanel
- [ ] SearchTypeSelector
- [ ] UsernameSearchForm
- [ ] ResultCard
- [ ] OSINTResultsView

### Phase 2 (Week 3-4): Extended Search
- [ ] EmailSearchForm
- [ ] BreachIndicator
- [ ] PhoneSearchForm
- [ ] DomainSearchForm
- [ ] IPSearchForm

### Phase 3 (Week 5-6): Image Search
- [ ] ReverseImageSearch
- [ ] ImageUploader
- [ ] ImageMatchesGrid
- [ ] Image preview/lightbox

### Phase 4 (Week 7-8): Dashboard & Analytics
- [ ] OSINTDashboard
- [ ] SearchHistory
- [ ] SavedSearches
- [ ] Analytics/Stats
- [ ] Bulk operations

### Phase 5 (Week 9-10): Polish & Testing
- [ ] Component refinement
- [ ] Unit tests (100% coverage)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization

---

## 🚀 Next Steps

1. **Create component folder structure:**
   ```bash
   mkdir -p apps/web/src/components/osint/{forms,results,layouts}
   ```

2. **Create hook for API integration:**
   ```bash
   touch apps/web/src/hooks/useOSINT.ts
   ```

3. **Start with core components**
   - Build search panel
   - Create form components
   - Implement results display

4. **Connect to backend API**
   - Update useOSINT hook
   - Test API endpoints
   - Validate data flow

5. **Add styling & theming**
   - Tailwind CSS integration
   - Dark mode support
   - Mobile responsiveness

---

**Status:** 🎨 Ready for Development  
**Estimated Time:** 8-10 weeks  
**Team Size:** 2-3 engineers  
**Complexity:** Medium  
