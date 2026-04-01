# Occupation Data in Info Panel - Design Spec

**Date:** 2026-04-01
**Status:** Approved
**Author:** Claude

## Overview

Add a new "Occupations" row to the country info panel that displays territorial occupation data from the War Era Regions API. Shows both regions the selected country is occupying (offensive) and regions occupied from them (defensive).

## Problem Statement

Users want to understand territorial occupation relationships between countries. The current info panel shows treasury, allies, and wars, but does not display occupation data available through the Regions API.

## Goals

- Display occupation data when a country is selected
- Show both offensive and defensive occupations separately
- Load data on-demand (not at startup)
- Provide loading and empty states
- Cache results to avoid redundant API calls

## Non-Goals

- Visualizing occupations on the 3D globe (future consideration)
- Showing occupation history/timestamps
- Real-time updates (manual refresh is acceptable)

## Architecture

### Components

#### New API Function (`src/api.ts`)

```typescript
export async function fetchOccupations(countryId: string): Promise<{
  occupying: string[];    // Region names this country occupies from others
  occupiedBy: string[];   // Region names occupied from this country
} | null>
```

**Responsibilities:**
- Call `region.getRegionsObject` endpoint
- Filter regions where `country === countryId` OR `initialCountry === countryId`
- Extract and return region names as string arrays
- Handle errors gracefully (return null)
- Implement caching (5-minute TTL)

#### Updated InfoPanel Class (`src/ui/panels.ts`)

**New properties:**
```typescript
private occupationsContainer: HTMLElement;
private occupationCache: Map<string, { occupying: string[]; occupiedBy: string[]; timestamp: number }>;
private loadingCountryId: string | null = null;
```

**New methods:**
```typescript
private async showOccupations(country: Country): Promise<void>
private renderOccupationsLoading(): void
private renderOccupationsEmpty(): void
private renderOccupationsData(occupying: string[], occupiedBy: string[]): void
private createOccupationList(label: string, items: string[]): HTMLElement
```

**Modified methods:**
- `constructor()` - Initialize occupation cache and DOM element
- `show(country)` - Call `showOccupations(country)`

### Data Flow

```
User clicks country node
    ↓
InfoPanel.show(country) called
    ↓
showOccupations(country.id) triggered
    ↓
Check occupationCache
    ↓
    ├─ Cached & fresh? → Render cached data immediately
    └─ Not cached or stale → fetchOccupations(country.id)
            ↓
            Show loading state
            ↓
            API call to region.getRegionsObject
            ↓
            Filter regions by countryId
            ↓
            Extract region names
            ↓
            Store in cache with timestamp
            ↓
            Render occupation data
```

## API Integration

### Endpoint

```
GET https://api2.warera.io/trpc/region.getRegionsObject?input={}
```

### Response Structure

```typescript
{
  result: {
    data: {
      [regionId: string]: {
        id: string;
        country: string;          // Current occupier country ID
        initialCountry: string;   // Original owner country ID
        name: string;             // Region name
        lastOwnershipChangeAt: string;
      }
    }
  }
}
```

### Filtering Logic

```typescript
for (const region of Object.values(regions)) {
  if (region.country === countryId && region.initialCountry !== countryId) {
    // This country is occupying the region
    occupying.push(region.name);
  }
  if (region.initialCountry === countryId && region.country !== countryId) {
    // This country's region is occupied
    occupiedBy.push(region.name);
  }
}
```

### Authentication

Uses same Bearer token as country API:
```
Authorization: Bearer wae_ae8dc4516462513ce1ea18db612e1fa2b458409fa214985db9dc84dd407c3bc2
```

## UI Design

### HTML Structure

Add new row in `index.html` after Wars row:

```html
<div class="info-row">
  <span class="label">Occupations</span>
  <div id="info-occupations-container"></div>
</div>
```

### Visual States

#### 1. Loading State
```
Occupations    Loading occupations...
```
- Gray italic text
- No expandable section yet

#### 2. Empty State
```
▼ Occupations    No occupations
```
- Expandable header (collapsed by default)
- Click to expand shows empty container
- Both subsections hidden when no data

#### 3. Populated State (Example: India)
```
▼ Occupations (29)
```
When expanded:
```
▼ Occupying (27)              ▼ Occupied by (2)
  [regions listed]              [regions listed]
```

Subsection items display as pill badges similar to allies/wars:
```
Sumatra • Java • Eastern Sri Lanka • Punjab • Sindh • ...
```

### Styling

Reuse existing CSS classes:
- `.info-list-expandable` - Main container
- `.info-list-header` - Expandable header
- `.info-list-items` - Container for region badges
- `.info-list-item` - Individual region badges

No new CSS needed - nested expandable sections within existing structure.

### Interaction

- Click "Occupations" header → Expand/collapse main section
- Click "Occupying" header → Expand/collapse occupying regions
- Click "Occupied by" header → Expand/collapse occupied regions
- Click individual region → No action (future: could focus region on globe)

## State Management

### Cache Structure

```typescript
occupationCache: Map<string, {
  occupying: string[];
  occupiedBy: string[];
  timestamp: number;
}>
```

### Cache TTL

**5 minutes** (300,000ms) - Regions change less frequently than country treasury/alliances.

### Cache Invalidation

- Time-based: 5 minutes from fetch
- Manual: Optional refresh method for future enhancement

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Network failure | Show "No occupation data available" |
| API rate limit (429) | Exponential backoff, retry after delay |
| Invalid country ID | Treat as empty response |
| Malformed API response | Log error, show empty state |
| Empty occupations | Show "No occupations" |

## Performance Considerations

### Request Optimization

- **Deduplication:** Track `loadingCountryId` to prevent duplicate requests for same country
- **Caching:** Store results for 5 minutes
- **Background refresh (optional):** If user stays on same country >5min, refresh in background

### Memory

- Cache size: ~100 countries × ~1KB each = ~100KB (acceptable)
- Region data is text-only (names only), very lightweight

## Testing Checklist

### Functional Tests
- [ ] Country with occupations shows both lists correctly
- [ ] Country with no occupations shows empty state
- [ ] Loading state displays during API call
- [ ] Cache prevents redundant API calls
- [ ] Cache expires after 5 minutes
- [ ] Re-clicking same country uses cached data
- [ ] Error states display gracefully

### UI/UX Tests
- [ ] Expand/collapse animations work smoothly
- [ ] Nested subsections expand independently
- [ ] No layout shift when loading completes
- [ ] Long region names wrap or truncate appropriately
- [ ] Section displays "Occupations (X)" with count

### Integration Tests
- [ ] API endpoint returns expected data format
- [ ] Authentication header is sent correctly
- [ ] Filtering logic correctly identifies occupations
- [ ] Country ID matching is exact (not substring)

## Implementation Notes

### Dependencies

No new dependencies required. Uses:
- Existing `fetch` API
- Existing `localStorage` for caching
- Existing DOM manipulation patterns

### Migration

No breaking changes. Feature is additive:
- Existing info panel functionality unchanged
- New DOM element is optional
- If Regions API is unavailable, rest of app works normally

## Success Criteria

1. User can see occupation data for any country
2. Data loads within 1 second on typical connection
3. UI clearly distinguishes offensive vs defensive occupations
4. No performance degradation on initial load (data loads on-demand)
5. Graceful handling of API failures

## Future Enhancements

- Visualize occupied regions on 3D globe (different color for occupied territories)
- Show occupation timestamp ("Occupied 3 months ago")
- Allow clicking region to fly to it on globe
- Show "total regions" count for each country
- Occupation history timeline
- Auto-refresh occupation data periodically

---

## Appendix: Example Data

### India Occupation Data

**Occupying (27 regions):**
- Sumatra (Indonesia)
- Java (Indonesia)
- Eastern Sri Lanka (Sri Lanka)
- Djibouti (Djibouti)
- Kabul, Kandahar, Herat, Mazar-i-Sharif, Jalalabad, Kunduz, Farah, Ghazni (Afghanistan)
- Karachi, Lahore, Islamabad, Rawalpindi, Peshawar (Pakistan)
- Dhaka, Chittagong, Khulna, Sylhet (Bangladesh)
- Mogadishu, Hargeisa (Somalia)
- Kampala (Uganda)
- Manama (Bahrain)
- Basra (Iraq)

**Occupied by (0 regions)**

This confirms the feature will display meaningful data for countries with active territorial occupations.
