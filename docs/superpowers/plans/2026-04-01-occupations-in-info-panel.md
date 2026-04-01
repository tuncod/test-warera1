# Occupation Data in Info Panel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add territorial occupation data display to the country info panel, showing both regions a country is occupying and regions occupied from them.

**Architecture:** On-demand data fetching from Regions API with 5-minute caching, expandable UI section with nested subsections for offensive/defensive occupations.

**Tech Stack:** TypeScript 5.3, Three.js 0.160, Vite 5.0, War Era tRPC API

---

## File Structure

**Files to modify:**
- `src/types.ts` - Add OccupationData interface
- `src/api.ts` - Add fetchOccupations() function with caching
- `src/ui/panels.ts` - Add occupation display logic to InfoPanel class
- `index.html` - Add new Occupations row to info panel

**No new files created** - feature integrates into existing structure.

---

## Chunk 1: TypeScript Types and API Integration

### Task 1: Add TypeScript Types for Occupation Data

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Add OccupationData interface**

Add to `src/types.ts` after the Country interface:

```typescript
export interface OccupationData {
  occupying: string[];   // Region names this country occupies from others
  occupiedBy: string[];  // Region names occupied from this country
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npm run type-check` or `npx tsc --noEmit`
Expected: No errors (new interface unused but valid)

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add OccupationData type interface"
```

---

### Task 2: Add fetchOccupations API Function

**Files:**
- Modify: `src/api.ts`

- [ ] **Step 1: Add occupation cache constants**

Add after existing constants (line 2):

```typescript
const OCCUPATION_CACHE_KEY = 'warera_occupations';
const OCCUPATION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

- [ ] **Step 2: Add occupation cache type definitions**

Add before the `parseApiResponse` function:

```typescript
interface OccupationCacheEntry {
  data: Record<string, OccupationData>;
  timestamp: number;
}

function getOccupationCache(): Record<string, OccupationData> | null {
  try {
    const raw = localStorage.getItem(OCCUPATION_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as OccupationCacheEntry;
    if (Date.now() - cached.timestamp > OCCUPATION_CACHE_TTL) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function setOccupationCache(data: Record<string, OccupationData>): void {
  try {
    localStorage.setItem(OCCUPATION_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch {
    // Storage full or unavailable
  }
}
```

- [ ] **Step 3: Add Region type for API response**

Add after `parseApiResponse` function:

```typescript
interface RegionApiResponse {
  id: string;
  country: string;
  initialCountry: string;
  name: string;
  lastOwnershipChangeAt: string;
}

interface RegionsResponse {
  result: {
    data: Record<string, RegionApiResponse>;
  };
}
```

- [ ] **Step 4: Implement fetchOccupations function**

Add at end of file before existing exports:

```typescript
export async function fetchOccupations(countryId: string): Promise<OccupationData | null> {
  // Check cache first
  const cache = getOccupationCache();
  if (cache && cache[countryId]) {
    return cache[countryId];
  }

  try {
    const url = `${API_URL.replace('country.getAllCountries', 'region.getRegionsObject')}?input=%7B%7D`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer wae_ae8dc4516462513ce1ea18db612e1fa2b458409fa214985db9dc84dd407c3bc2'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json() as RegionsResponse;
    const regions = Object.values(json.result?.data ?? {});

    const occupying: string[] = [];
    const occupiedBy: string[] = [];

    for (const region of regions) {
      // Country is occupying this region from someone else
      if (region.country === countryId && region.initialCountry !== countryId) {
        occupying.push(region.name);
      }
      // This country's region is occupied by someone else
      if (region.initialCountry === countryId && region.country !== countryId) {
        occupiedBy.push(region.name);
      }
    }

    const result: OccupationData = { occupying, occupiedBy };

    // Update cache
    const existingCache = cache ?? {};
    existingCache[countryId] = result;
    setOccupationCache(existingCache);

    return result;
  } catch (error) {
    console.error('Failed to fetch occupations:', error);
    return null;
  }
}
```

- [ ] **Step 5: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/api.ts
git commit -m "feat: add fetchOccupations API function with caching"
```

---

## Chunk 2: UI Updates - HTML Structure

### Task 3: Add Occupations Row to Info Panel HTML

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Occupations row after Wars row**

Locate the Wars info row (around line 89-92). Add this after it:

```html
        <div class="info-row">
          <span class="label">Occupations</span>
          <div id="info-occupations-container"></div>
        </div>
```

The full context should look like:

```html
        <div class="info-row">
          <span class="label">Wars</span>
          <div id="info-wars-container"></div>
        </div>
        <div class="info-row">
          <span class="label">Occupations</span>
          <div id="info-occupations-container"></div>
        </div>
      </div>
```

- [ ] **Step 2: Verify HTML structure**

Run: `cat index.html | grep -A 3 "Occupations"`
Expected: Should see the new row

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Occupations row to info panel HTML"
```

---

## Chunk 3: UI Logic - InfoPanel Class

### Task 4: Extend InfoPanel Class for Occupations

**Files:**
- Modify: `src/ui/panels.ts`

- [ ] **Step 1: Add import for OccupationData and fetchOccupations**

Add to imports at top of file:

```typescript
import type { Country, OccupationData } from '@/types';
import { fetchOccupations } from '@/api';
```

- [ ] **Step 2: Add new private properties to InfoPanel class**

Add in class property declarations (after line 33):

```typescript
  private occupationsContainer: HTMLElement;
  private occupationCache: Map<string, OccupationData> = new Map();
  private loadingCountryId: string | null = null;
```

- [ ] **Step 3: Initialize occupationsContainer in constructor**

Add in constructor (after line 42):

```typescript
    this.occupationsContainer = document.getElementById('info-occupations-container')!;
```

- [ ] **Step 4: Call showOccupations in show() method**

Modify the `show()` method to call occupation loading. Add after the wars container logic (after line 88):

```typescript
    // Load occupation data
    this.showOccupations(country);
```

- [ ] **Step 5: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: Error - `showOccupations` method doesn't exist yet

- [ ] **Step 6: Commit**

```bash
git add src/ui/panels.ts
git commit -m "feat: add occupation properties and call to InfoPanel"
```

---

### Task 5: Implement showOccupations Method

**Files:**
- Modify: `src/ui/panels.ts`

- [ ] **Step 1: Add showOccupations method skeleton**

Add before the `hide()` method:

```typescript
  private async showOccupations(country: Country): Promise<void> {
    // Check in-memory cache first
    if (this.occupationCache.has(country.id)) {
      const data = this.occupationCache.get(country.id)!;
      this.renderOccupationsData(data.occupying, data.occupiedBy);
      return;
    }

    // Prevent duplicate requests
    if (this.loadingCountryId === country.id) {
      return;
    }

    // Show loading state
    this.renderOccupationsLoading();

    // Fetch data
    this.loadingCountryId = country.id;
    const data = await fetchOccupations(country.id);
    this.loadingCountryId = null;

    if (!data) {
      this.renderOccupationsError();
      return;
    }

    // Cache and render
    this.occupationCache.set(country.id, data);
    this.renderOccupationsData(data.occupying, data.occupiedBy);
  }
```

- [ ] **Step 2: Add renderOccupationsLoading method**

```typescript
  private renderOccupationsLoading(): void {
    this.occupationsContainer.innerHTML = '<span style="color: #888; font-style: italic;">Loading occupations...</span>';
  }
```

- [ ] **Step 3: Add renderOccupationsError method**

```typescript
  private renderOccupationsError(): void {
    this.occupationsContainer.innerHTML = '<span style="color: #888; font-style: italic;">No occupation data available</span>';
  }
```

- [ ] **Step 4: Add renderOccupationsEmpty method**

```typescript
  private renderOccupationsEmpty(): void {
    const container = document.createElement('div');
    container.className = 'info-list-expandable';

    const header = document.createElement('div');
    header.className = 'info-list-header';
    header.innerHTML = `
      <span class="info-list-count">No occupations</span>
      <span class="info-list-expand">▼</span>
    `;

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'info-list-items';
    itemsContainer.innerHTML = '<span style="color: #666; font-size: 13px; padding: 8px;">No active occupations</span>';

    header.addEventListener('click', () => {
      const isExpanded = itemsContainer.classList.toggle('expanded');
      header.querySelector('.info-list-expand')!.classList.toggle('expanded', isExpanded);
    });

    container.appendChild(header);
    container.appendChild(itemsContainer);

    this.occupationsContainer.innerHTML = '';
    this.occupationsContainer.appendChild(container);
  }
```

- [ ] **Step 5: Add createOccupationList helper method**

```typescript
  private createOccupationList(label: string, items: string[]): HTMLElement {
    const container = document.createElement('div');
    container.className = 'info-list-expandable';
    container.style.marginTop = '8px';

    const header = document.createElement('div');
    header.className = 'info-list-header';
    header.innerHTML = `
      <span class="info-list-count">${items.length} ${label}</span>
      <span class="info-list-expand">▼</span>
    `;

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'info-list-items';

    items.forEach(item => {
      const itemEl = document.createElement('span');
      itemEl.className = 'info-list-item';
      itemEl.textContent = item;
      itemEl.title = item;
      itemsContainer.appendChild(itemEl);
    });

    header.addEventListener('click', () => {
      const isExpanded = itemsContainer.classList.toggle('expanded');
      header.querySelector('.info-list-expand')!.classList.toggle('expanded', isExpanded);
    });

    container.appendChild(header);
    container.appendChild(itemsContainer);

    return container;
  }
```

- [ ] **Step 6: Add renderOccupationsData method**

```typescript
  private renderOccupationsData(occupying: string[], occupiedBy: string[]): void {
    const total = occupying.length + occupiedBy.length;

    // Handle empty case
    if (total === 0) {
      this.renderOccupationsEmpty();
      return;
    }

    const container = document.createElement('div');
    container.className = 'info-list-expandable';

    const header = document.createElement('div');
    header.className = 'info-list-header';
    header.innerHTML = `
      <span class="info-list-count">${total} Occupations</span>
      <span class="info-list-expand">▼</span>
    `;

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'info-list-items';

    // Add subsections
    if (occupying.length > 0) {
      itemsContainer.appendChild(this.createOccupationList('Occupying', occupying));
    }

    if (occupiedBy.length > 0) {
      itemsContainer.appendChild(this.createOccupationList('Occupied by', occupiedBy));
    }

    header.addEventListener('click', () => {
      const isExpanded = itemsContainer.classList.toggle('expanded');
      header.querySelector('.info-list-expand')!.classList.toggle('expanded', isExpanded);
    });

    container.appendChild(header);
    container.appendChild(itemsContainer);

    this.occupationsContainer.innerHTML = '';
    this.occupationsContainer.appendChild(container);
  }
```

- [ ] **Step 7: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add src/ui/panels.ts
git commit -m "feat: implement occupation display methods in InfoPanel"
```

---

## Chunk 4: Testing and Verification

### Task 6: Manual Testing

**Files:**
- None (manual verification)

- [ ] **Step 1: Start dev server**

Run: `cd /home/warera && ./start.sh` or `python3 -m http.server 8000 --bind 0.0.0.0`

- [ ] **Step 2: Test with country that has occupations**

1. Open browser to `http://localhost:8000` or `http://152.53.186.207:8000`
2. Wait for data to load
3. Search for "India" (Ctrl+K)
4. Click on India
5. Open the Occupations section
6. Verify: Shows "27 Occupying" with expandable list
7. Expand "Occupying" subsection
8. Verify: Shows regions like "Sumatra", "Java", etc.

- [ ] **Step 3: Test loading state**

1. Open browser DevTools Network tab
2. Throttle network to "Slow 3G"
3. Click on a country
4. Verify: "Loading occupations..." appears
5. Wait for load
6. Verify: Data displays correctly

- [ ] **Step 4: Test empty state**

1. Search for a smaller country likely without occupations
2. Click on it
3. Verify: Shows "No occupations" or shows empty subsections

- [ ] **Step 5: Test cache behavior**

1. Click on India
2. Wait for occupations to load
3. Close info panel (ESC or click X)
4. Click on India again
5. Verify: Occupations appear instantly (no loading state)
6. Open DevTools Console
7. Run: `localStorage.getItem('warera_occupations')`
8. Verify: Cache data exists

- [ ] **Step 6: Test error handling**

1. Open DevTools Console
2. Break the API by changing the URL temporarily (optional)
3. Or disconnect network
4. Click on a country
5. Verify: Shows "No occupation data available" (graceful degradation)

- [ ] **Step 7: Test UI interactions**

1. Click on "Occupations" header
2. Verify: Expands/collapses main section
3. Click on "Occupying" subsection header
4. Verify: Expands/collapses independently
5. Click on individual region
6. Verify: No action (future enhancement)

- [ ] **Step 8: Check console for errors**

Run: Open browser DevTools Console
Expected: No errors or warnings

---

### Task 7: TypeScript Type Validation

**Files:**
- All modified files

- [ ] **Step 1: Run TypeScript compiler**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Check for any unused imports**

Run: `npx tsc --noUnusedLocals --noUnusedParameters --noEmit`
Expected: Should show OccupationData as used (by InfoPanel), may show some unused but that's okay for now

---

### Task 8: Code Review Checklist

- [ ] All files modified follow existing code style
- [ ] No hardcoded values that should be in config
- [ ] Error handling is present for async operations
- [ ] Cache has proper TTL (5 minutes)
- [ ] UI states (loading, empty, error, data) all handled
- [ ] No memory leaks (event listeners properly attached)
- [ ] Nested expandable sections work independently
- [ ] API authentication token matches existing one
- [ ] Region name extraction is correct from API response

---

### Task 9: Final Commit and Verification

- [ ] **Step 1: Review all changes**

Run: `git diff`

- [ ] **Step 2: Stage all changes**

```bash
git add .
```

- [ ] **Step 3: Final commit**

```bash
git commit -m "feat: add occupation data display to info panel

- Add OccupationData type interface
- Implement fetchOccupations API function with 5-min cache
- Add Occupations row to info panel UI
- Display offensive and defensive occupations in nested lists
- Handle loading, error, and empty states
- Support expandable UI sections

Implements: docs/superpowers/specs/2026-04-01-occupations-in-info-panel-design.md"
```

- [ ] **Step 4: Verify build still works**

Run: `npm run build` (if build script exists) or refresh browser
Expected: No build errors, app loads correctly

- [ ] **Step 5: Deploy verification**

If deploying to production:
1. Build: `npm run build`
2. Deploy to `/home/warera` or nginx path
3. Test on production URL: `https://warera.on-development.my.id`

---

## Success Criteria

✅ User can see occupation data for any country
✅ Data loads within 1 second on typical connection
✅ UI clearly distinguishes offensive vs defensive occupations
✅ No performance degradation on initial load (data loads on-demand)
✅ Graceful handling of API failures
✅ Cache prevents redundant API calls (5-minute TTL)
✅ Expandable UI works smoothly with nested sections

---

## Notes for Implementation

- **API Rate Limiting:** The War Era API has a 100 req/60s limit. Our 5-minute cache helps stay within this.
- **Memory Usage:** Occupation cache is ~100KB for 100 countries - acceptable.
- **Future Enhancement:** Could add visual indicator on 3D nodes for countries with occupations.
- **Region Names:** Come directly from API, no mapping needed.
- **Authentication:** Uses same Bearer token as country API.

---

## Dependencies

This implementation depends on:
- Existing `fetchCountries()` function and API patterns
- Existing info panel DOM structure and styling
- Existing `.info-list-*` CSS classes
- Existing state management in `@/state`

No new npm packages required.
