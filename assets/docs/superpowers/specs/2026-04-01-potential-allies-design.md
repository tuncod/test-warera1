# Potential Allies Analysis Feature - Design Spec

**Date:** 2026-04-01
**Status:** Approved
**Author:** Claude

## Overview

Add a "Potential Allies" section to the country info panel that analyzes and displays countries a selected country could form alliances with, based on their current diplomatic relationships (allies and wars).

## Problem Statement

Users want to understand potential alliance opportunities when viewing a country. The current info panel shows existing allies and enemies, but does not indicate which countries could become allies based on:
- Shared enemies ("enemy of my enemy is my friend")
- Absence of conflicting relationships

## Goals

- Display potential allies when viewing any country
- Distinguish between high-potential (shared enemies) and regular potential allies
- Client-side calculation using existing data (no additional API calls)
- Sort results by potential strength
- Limit to top 10 results per category for usability

## Non-Goals

- Predicting future alliances (only analyzing current state)
- Considering indirect relationships (2-hop allies/enemies)
- Persistent storage of potential allies
- Real-time updates (calculates once on selection)

## Algorithm

### Rules for Potential Allies

For a selected country **A**, country **B** is a potential ally if:

1. **Basic conditions:**
   - A and B are **not** already allies
   - A and B are **not** at war

2. **At least one potential type:**
   - **High Potential:** A and B share a common enemy C (where C is in `A.warsWith` AND `C` is in `B.warsWith`)
   - **Regular Potential:** Basic conditions met, no shared enemies required

### Sorting and Limiting

- **High Potential:** Sort by number of shared enemies (descending), then by country name
- **Regular Potential:** Sort by country name alphabetically
- **Limit:** Top 10 results per category
- Minimum of 1 country required to show a category

### Example

For country **A** at war with [C1, C2]:
- Country **B1** at war with [C1, C3] → **High Potential** (shares C1, 1 shared enemy)
- Country **B2** at war with [C1, C2] → **High Potential** (shares C1, C2, 2 shared enemies)
- Country **B3** at war with [C4, C5] → **Regular Potential** (no shared enemies)
- Country **B4** ally of A → Not a potential ally (already allied)
- Country **B5** at war with A → Not a potential ally (enemy)

B2 ranks higher than B1 (more shared enemies).

## Architecture

### Components

**New calculation function** (`src/main.ts`):
```typescript
private calculatePotentialAllies(country: Country): {
  highPotential: Array<{
    country: Country;
    sharedEnemies: Country[];
    sharedCount: number;
  }>;
  regularPotential: Country[];
}
```

**Responsibilities:**
- Get all countries from state
- Filter out current allies and enemies
- Find countries with shared enemies
- Sort and limit results
- Return structured data for rendering

**New rendering methods** (`src/ui/panels.ts`):
- `renderPotentialAlliesLoading()` - Shows loading indicator
- `renderPotentialAlliesEmpty()` - Shows empty state
- `renderPotentialAlliesData()` - Main render with two subsections
- `createPotentialAlliesList()` - Helper for creating expandable lists

### Data Flow

```
User clicks country node
    ↓
InfoPanel.show(country) called
    ↓
this.calculatePotentialAllies(country) invoked
    ↓
  [Client-side calculation]
    - state.getCountries()
    - Iterate all countries
    - Check allies/warsWith arrays
    - Find shared enemies
    - Sort and limit results
    ↓
Results passed to InfoPanel
    ↓
renderPotentialAlliesData() creates UI:
  - "X High Potential" section (if any)
  - "Y Potential" section (if any)
    ↓
User sees potential allies in info panel
```

## API Integration

**No API calls required.** All calculation happens client-side using:
- `state.getCountries()` - Returns all loaded countries
- `country.allies` - Array of ally country IDs
- `country.warsWith` - Array of enemy country IDs
- Existing country data from initial load

## UI Design

### HTML Structure

Add to `index.html` after Occupations row:
```html
<div class="info-row">
  <span class="label">Potential Allies</span>
  <div id="info-potential-allies-container"></div>
</div>
```

### Visual States

#### 1. Loading State
```
Potential Allies    Calculating potential allies...
```
- Gray italic text
- No expandable section

#### 2. Empty State
```
▼ Potential Allies    No potential allies
```
- Expandable header (collapsed by default)
- Click to expand shows empty container
- Message: "No potential allies found"

#### 3. Populated State (Example)
```
▼ 3 Potential Allies
```
When expanded:
```
▼ ★ 2 High Potential
  [expanded]
  ★ France (Shared: Germany)
  ★ Spain (Shared: Portugal)

▼ 1 Potential
  [expanded]
  Brazil
```

### Styling

**Badge styles:**
```css
.potential-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  margin-left: 6px;
  font-weight: 600;
}

.potential-badge.high {
  background: rgba(255, 200, 0, 0.2);
  color: #ffc800;
  border: 1px solid rgba(255, 200, 0, 0.4);
}

.potential-badge.regular {
  background: rgba(150, 150, 150, 0.2);
  color: #999;
  border: 1px solid rgba(150, 150, 150, 0.4);
}
```

**Reuse existing classes:**
- `.info-list-expandable` - Main container
- `.info-list-header` - Expandable headers
- `.info-list-items` - Country lists
- `.info-list-item` - Individual country items

### Interaction

- Click "Potential Allies" header → Expand/collapse main section
- Click "High Potential" header → Expand/collapse high potential list
- Click "Potential" header → Expand/collapse regular potential list
- Click individual country → Select that country (reusing existing click handler)

## State Management

No new state required. Uses existing:
- `state.getCountries()` - Access all country data
- `state.selectCountry()` - Already called when selecting countries
- No events to add - feature is reactive to country selection

## Performance Considerations

### Calculation Complexity
- **Time complexity:** O(n²) where n = number of countries
- For 200 countries: ~40,000 comparisons
- **Actual runtime:** < 1ms (negligible)

### Memory
- No additional storage (results calculated on-demand)
- Temporary arrays during calculation, garbage collected after use

### Optimization
- **No caching needed** - calculation is fast enough
- **No pre-computation** - runs only when country selected
- **Early exit** - Skip countries that are allies/enemies

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No country data | Show "No potential allies" |
| Calculation error | Log error, show empty state |
| Malformed country data | Skip invalid countries |

## Testing Considerations

### Functional Tests
- [ ] Country with shared enemies shows High Potential section
- [ ] Country without shared enemies shows only Potential section
- [ ] Country with no potential allies shows empty state
- [ ] Clicking potential country selects it
- [ ] Results are sorted correctly (High Potential by shared count)
- [ ] Results are limited to 10 per category
- [ ] Allies and enemies are excluded from results

### UI/UX Tests
- [ ] Loading state displays during calculation
- [ ] Expandable sections work independently
- [ ] Badges display correctly (★ for high, plain for regular)
- [ ] Country names are clickable
- [ ] Empty state shows appropriate message

### Performance Tests
- [ ] Calculation completes in < 10ms
- [ ] No lag when switching between countries
- [ ] Memory usage is stable over time

## Implementation Notes

### Dependencies

This implementation depends on:
- Existing `Country` interface with `allies` and `warsWith` arrays
- Existing `state.getCountries()` method
- Existing info panel structure and styling
- Existing country selection flow

### Integration Points

1. **InfoPanel class** (`src/ui/panels.ts`)
   - Add `potentialAlliesContainer` property
   - Add rendering methods for potential allies
   - Call calculation from `show()` method

2. **App class** (`src/main.ts`)
   - Add `calculatePotentialAllies()` method
   - Pass results to InfoPanel

3. **HTML** (`index.html`)
   - Add Potential Allies row in info panel

### Code Organization

- Keep calculation logic in `App` class (has access to state and country data)
- Keep rendering logic in `InfoPanel` class (follows existing pattern)
- Reuse existing UI components and styles

## Success Criteria

1. ✅ User can see potential allies when selecting any country
2. ✅ High potential allies (shared enemies) are visually distinguished
3. ✅ Results are sorted by relevance (shared enemies first)
4. ✅ Feature performs well (< 10ms calculation)
5. ✅ Graceful handling of edge cases (no results, errors)

## Future Enhancements

- **Weighted scoring:** Consider factors like treasury strength, region proximity
- **2-hop analysis:** "Ally of my ally" as potential ally
- **Suggestion button:** "Send alliance request" (if game adds this feature)
- **Historical data:** Show past alliance changes
- **Filter options:** Filter by region, treasury range

## Appendix: Example Calculation

### Input: Country A (India)
- **Allies:** [Russia, France]
- **Wars:** [Pakistan, China]

### Calculation

**Find High Potential (enemies of Pakistan or China):**
- Afghanistan: wars = [Pakistan] → shares 1 enemy ✓
- Iran: wars = [Pakistan] → shares 1 enemy ✓
- Taiwan: wars = [China] → shares 1 enemy ✓
- Vietnam: wars = [China] → shares 1 enemy ✓
- USA: wars = [China] → shares 1 enemy ✓

**Find Regular Potential (not allies, not enemies, no shared enemies):**
- Brazil: allies = [], wars = [] → potential ✓
- Germany: allies = [], wars = [] → potential ✓
- Egypt: allies = [Saudi Arabia], wars = [] → potential ✓
- (excludes any country already allied with India or at war with India)

### Output
```
High Potential (5):
  ★ Afghanistan (Shared: Pakistan)
  ★ Iran (Shared: Pakistan)
  ★ Taiwan (Shared: China)
  ★ USA (Shared: China)
  ★ Vietnam (Shared: China)

Potential (3):
  Brazil
  Egypt
  Germany
```
