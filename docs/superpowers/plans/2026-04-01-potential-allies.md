# Potential Allies Analysis Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add potential allies analysis to country info panel, identifying countries that could form alliances based on shared enemies and absence of conflicts.

**Architecture:** Client-side calculation using existing country data (allies/warsWith arrays), displayed as two expandable lists in info panel (High Potential for shared enemies, Regular Potential for others).

**Tech Stack:** TypeScript 5.3, Three.js 0.160, Vite 5.0, existing state management

---

## File Structure

**Files to modify:**
- `index.html` - Add Potential Allies row to info panel
- `src/main.ts` - Add calculatePotentialAllies() method
- `src/ui/panels.ts` - Add potential allies container and rendering methods
- `src/styles.css` - Add badge styles for potential types

**No new files created** - feature integrates into existing structure.

---

## Chunk 1: HTML Structure

### Task 1: Add Potential Allies Row to Info Panel HTML

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Potential Allies row after Occupations row**

Locate the Occupations info row (around line 93-96). Add this after it:

```html
        <div class="info-row">
          <span class="label">Potential Allies</span>
          <div id="info-potential-allies-container"></div>
        </div>
```

The full context should look like:

```html
        <div class="info-row">
          <span class="label">Occupations</span>
          <div id="info-occupations-container"></div>
        </div>
        <div class="info-row">
          <span class="label">Potential Allies</span>
          <div id="info-potential-allies-container"></div>
        </div>
      </div>
```

- [ ] **Step 2: Verify HTML structure**

Run: `cat index.html | grep -A 3 "Potential Allies"`
Expected: Should see the new row

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Potential Allies row to info panel HTML"
```

---

## Chunk 2: Styles for Badges

### Task 2: Add Potential Allies Badge Styles

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Add badge styles after auto-rotate indicator styles**

Add after `#auto-rotate-indicator` styles (around line 556):

```css
/* Potential Allies Badges */
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

- [ ] **Step 2: Verify CSS is valid**

Run: `cat src/styles.css | grep -A5 "potential-badge"`
Expected: Should see the three badge style definitions

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: add badge styles for potential allies"
```

---

## Chunk 3: InfoPanel Infrastructure

### Task 3: Extend InfoPanel Class for Potential Allies

**Files:**
- Modify: `src/ui/panels.ts`

- [ ] **Step 1: Add potentialAlliesContainer property**

Add to class property declarations (after line 35):

```typescript
  private potentialAlliesContainer: HTMLElement;
```

- [ ] **Step 2: Initialize potentialAlliesContainer in constructor**

Add in constructor after occupationsContainer initialization (after line 47):

```typescript
    this.potentialAlliesContainer = document.getElementById('info-potential-allies-container')!;
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit` or `npm run build`
Expected: No errors (property unused but valid)

- [ ] **Step 4: Commit**

```bash
git add src/ui/panels.ts
git commit -m "feat: add potential allies container to InfoPanel"
```

---

### Task 4: Add Potential Allies Import and Method Call

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Add calculatePotentialAllies to App class**

This will be implemented in Task 5, but add a method stub first.

Add after the `restoreAllCountries()` method (around line 410):

```typescript
  private calculatePotentialAllies(country: Country): {
    highPotential: Array<{ country: Country; sharedEnemies: Country[]; sharedCount: number }>;
    regularPotential: Country[];
  } {
    // Implementation in next task
    return { highPotential: [], regularPotential: [] };
  }
```

- [ ] **Step 2: Call calculatePotentialAllies in selectCountry method**

In the `selectCountry()` method, add call after `this.infoPanel.show(country);` (around line 233):

```typescript
    // Calculate and show potential allies
    const potentialAllies = this.calculatePotentialAllies(country);
    this.infoPanel.showPotentialAllies(potentialAllies);
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: Error - `showPotentialAllies` method doesn't exist yet

- [ ] **Step 4: Commit**

```bash
git add src/main.ts
git commit -m "feat: add potential allies call to selectCountry"
```

---

## Chunk 4: Calculation Logic

### Task 5: Implement calculatePotentialAllies Method

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Replace stub with full implementation**

Replace the stub method with:

```typescript
  private calculatePotentialAllies(country: Country): {
    highPotential: Array<{ country: Country; sharedEnemies: Country[]; sharedCount: number }>;
    regularPotential: Country[];
  } {
    const countries = state.getCountries();
    const enemyIds = new Set(country.warsWith);
    const allyIds = new Set(country.allies);

    // Build a map of enemy names for shared enemy lookup
    const enemyMap = new Map<string, Country>();
    country.warsWith.forEach(enemyId => {
      const enemy = countries.find(c => c.id === enemyId);
      if (enemy) enemyMap.set(enemyId, enemy);
    });

    const highPotential: Array<{ country: Country; sharedEnemies: Country[]; sharedCount: number }> = [];
    const regularPotential: Country[] = [];

    for (const other of countries) {
      // Skip self
      if (other.id === country.id) continue;

      // Skip allies
      if (allyIds.has(other.id)) continue;

      // Skip enemies
      if (enemyIds.has(other.id)) continue;

      // Find shared enemies
      const sharedEnemies: Country[] = [];
      const otherEnemyIds = new Set(other.warsWith);

      for (const enemyId of country.warsWith) {
        if (otherEnemyIds.has(enemyId)) {
          const enemy = enemyMap.get(enemyId);
          if (enemy) sharedEnemies.push(enemy);
        }
      }

      // Categorize based on shared enemies
      if (sharedEnemies.length > 0) {
        highPotential.push({
          country: other,
          sharedEnemies,
          sharedCount: sharedEnemies.length
        });
      } else {
        regularPotential.push(other);
      }
    }

    // Sort high potential by shared enemy count (descending), then by name
    highPotential.sort((a, b) => {
      if (b.sharedCount !== a.sharedCount) {
        return b.sharedCount - a.sharedCount;
      }
      return a.country.name.localeCompare(b.country.name);
    });

    // Sort regular potential by name
    regularPotential.sort((a, b) => a.name.localeCompare(b.name));

    // Limit to 10 per category
    return {
      highPotential: highPotential.slice(0, 10),
      regularPotential: regularPotential.slice(0, 10)
    };
  }
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/main.ts
git commit -m "feat: implement calculatePotentialAllies method with sorting and limiting"
```

---

## Chunk 5: UI Rendering Methods

### Task 6: Implement Potential Allies Rendering Methods

**Files:**
- Modify: `src/ui/panels.ts`

- [ ] **Step 1: Add showPotentialAllies method**

Add after the `showOccupations()` method (around line 201):

```typescript
  showPotentialAllies(data: {
    highPotential: Array<{ country: Country; sharedEnemies: Country[]; sharedCount: number }>;
    regularPotential: Country[];
  }): void {
    // Handle empty case
    if (data.highPotential.length === 0 && data.regularPotential.length === 0) {
      this.renderPotentialAlliesEmpty();
      return;
    }

    this.renderPotentialAlliesData(data);
  }
```

- [ ] **Step 2: Add renderPotentialAlliesLoading method**

```typescript
  private renderPotentialAlliesLoading(): void {
    this.potentialAlliesContainer.innerHTML = '<span style="color: #888; font-style: italic;">Calculating potential allies...</span>';
  }
```

- [ ] **Step 3: Add renderPotentialAlliesEmpty method**

```typescript
  private renderPotentialAlliesEmpty(): void {
    const container = document.createElement('div');
    container.className = 'info-list-expandable';

    const header = document.createElement('div');
    header.className = 'info-list-header';
    header.innerHTML = `
      <span class="info-list-count">No potential allies</span>
      <span class="info-list-expand">▼</span>
    `;

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'info-list-items';
    itemsContainer.innerHTML = '<span style="color: #666; font-size: 13px; padding: 8px;">No potential allies found</span>';

    header.addEventListener('click', () => {
      const isExpanded = itemsContainer.classList.toggle('expanded');
      header.querySelector('.info-list-expand')!.classList.toggle('expanded', isExpanded);
    });

    container.appendChild(header);
    container.appendChild(itemsContainer);

    this.potentialAlliesContainer.innerHTML = '';
    this.potentialAlliesContainer.appendChild(container);
  }
```

- [ ] **Step 4: Add renderPotentialAlliesData method**

```typescript
  private renderPotentialAlliesData(data: {
    highPotential: Array<{ country: Country; sharedEnemies: Country[]; sharedCount: number }>;
    regularPotential: Country[];
  }): void {
    const totalCount = data.highPotential.length + data.regularPotential.length;

    const container = document.createElement('div');
    container.className = 'info-list-expandable';

    const header = document.createElement('div');
    header.className = 'info-list-header';
    header.innerHTML = `
      <span class="info-list-count">${totalCount} Potential Allies</span>
      <span class="info-list-expand">▼</span>
    `;

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'info-list-items';

    // Add High Potential subsection if present
    if (data.highPotential.length > 0) {
      itemsContainer.appendChild(this.createPotentialAlliesList('★ High Potential', data.highPotential.map(hp => ({
        name: hp.country.name,
        id: hp.country.id,
        badge: `Shared: ${hp.sharedEnemies.map(e => e.name).join(', ')}`
      }))));
    }

    // Add Regular Potential subsection if present
    if (data.regularPotential.length > 0) {
      itemsContainer.appendChild(this.createPotentialAlliesList('Potential', data.regularPotential.map(rp => ({
        name: rp.name,
        id: rp.id,
        badge: null
      }))));
    }

    header.addEventListener('click', () => {
      const isExpanded = itemsContainer.classList.toggle('expanded');
      header.querySelector('.info-list-expand')!.classList.toggle('expanded', isExpanded);
    });

    container.appendChild(header);
    container.appendChild(itemsContainer);

    this.potentialAlliesContainer.innerHTML = '';
    this.potentialAlliesContainer.appendChild(container);
  }
```

- [ ] **Step 5: Add createPotentialAlliesList helper method**

```typescript
  private createPotentialAlliesList(label: string, items: Array<{ name: string; id: string; badge: string | null }>): HTMLElement {
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
      itemEl.style.cursor = 'pointer';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = item.name;
      itemEl.appendChild(nameSpan);

      // Add badge if present
      if (item.badge) {
        const badge = document.createElement('span');
        badge.className = 'potential-badge high';
        badge.textContent = item.badge;
        itemEl.appendChild(badge);
      }

      // Add click handler to select country
      itemEl.addEventListener('click', () => {
        const country = state.getCountries().find(c => c.id === item.id);
        if (country) {
          state.selectCountry(country);
        }
      });

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

- [ ] **Step 6: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/ui/panels.ts
git commit -m "feat: implement potential allies rendering methods"
```

---

## Chunk 6: Testing and Verification

### Task 7: Manual Testing

**Files:**
- None (manual verification)

- [ ] **Step 1: Start dev server**

Run: `cd /home/warera && ./start.sh` or `python3 -m http.server 8000 --bind 0.0.0.0`

- [ ] **Step 2: Test with country that has shared enemies**

1. Open browser to `http://localhost:8000` or `http://152.53.186.207:8000`
2. Wait for data to load
3. Search for "India" (Ctrl+K)
4. Click on India
5. Look for "Potential Allies" row in info panel
6. Expand the section
7. Verify: Should see "High Potential" countries (shared enemies like Afghanistan, Iran if they share Pakistan/China as enemies)
8. Verify: Should see "Potential" countries (no shared enemies)

- [ ] **Step 3: Test with country that has no potential allies**

1. Search for a country with many alliances (e.g., USA, Russia)
2. Click on it
3. Look for "Potential Allies" row
4. Verify: Should show "No potential allies" or have 0 total count

- [ ] **Step 4: Test calculation performance**

1. Open browser DevTools Performance tab
2. Click on various countries
3. Verify: No lag when switching between countries
4. Verify: Potential allies appear almost instantly

- [ ] **Step 5: Test clicking on potential allies**

1. Click on a country with potential allies
2. Expand "Potential Allies" section
3. Click on one of the potential ally countries
4. Verify: That country becomes selected (info panel updates)

- [ ] **Step 6: Test sorting and limiting**

1. Click on India
2. Expand "High Potential" section
3. Verify: Countries are sorted by number of shared enemies (most shared enemies first)
4. Verify: Maximum 10 countries shown in each category

- [ ] **Step 7: Check console for errors**

Run: Open browser DevTools Console
Expected: No errors or warnings

---

### Task 8: TypeScript Type Validation

**Files:**
- All modified files

- [ ] **Step 1: Run TypeScript compiler**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Check build**

Run: `npm run build`
Expected: Build succeeds with no errors

---

### Task 9: Code Review Checklist

- [ ] All files modified follow existing code style
- [ ] Calculation logic correctly identifies shared enemies
- [ ] Allies and enemies are properly excluded from potential allies
- [ ] Sorting works correctly (High Potential by shared count, Regular by name)
- [ ] Results are limited to 10 per category
- [ ] UI follows existing pattern (expandable lists)
- [ ] Click handlers work for selecting potential allies
- [ ] Empty state displays correctly
- [ ] No performance degradation

---

### Task 10: Final Commit and Verification

- [ ] **Step 1: Review all changes**

Run: `git diff`

- [ ] **Step 2: Stage all changes**

```bash
git add .
```

- [ ] **Step 3: Final commit**

```bash
git commit -m "feat: add potential allies analysis to info panel

- Add Potential Allies row to info panel UI
- Implement calculatePotentialAllies() method in App class
  * Identifies countries with shared enemies (High Potential)
  * Identifies countries without conflicts (Regular Potential)
  * Sorts by relevance (shared enemies count, then name)
  * Limits to 10 results per category
- Add rendering methods to InfoPanel
  * Loading state with spinner
  * Empty state for no results
  * Two expandable lists (High Potential, Regular)
  * Badge indicators for shared enemies
- Add click handlers to select potential allies
- Add badge styles (gold for high, gray for regular)

Implements: docs/superpowers/specs/2026-04-01-potential-allies-design.md"
```

- [ ] **Step 4: Verify build still works**

Run: `npm run build`
Expected: No build errors, app loads correctly

- [ ] **Step 5: Deploy verification**

If deploying to production:
1. Build: `npm run build`
2. Deploy to `/home/warera` or nginx path
3. Test on production URL: `https://warera.on-development.my.id`

---

## Success Criteria

✅ User can see potential allies when selecting any country
✅ High potential allies (shared enemies) are visually distinguished with ★ badge
✅ Results are sorted by relevance (shared enemies first, by count)
✅ Feature performs well (< 10ms calculation)
✅ Graceful handling of edge cases (no results, already all allies)
✅ Clicking potential ally selects that country

---

## Notes for Implementation

- **Performance:** O(n²) algorithm with n≈200 countries is negligible (< 1ms)
- **No caching needed:** Calculation is fast enough to run on-demand
- **Client-side only:** No API calls required, uses existing country data
- **Future enhancement:** Could add 2-hop analysis (ally of ally) as additional feature

---

## Dependencies

This implementation depends on:
- Existing `Country` interface with `allies` and `warsWith` arrays
- Existing `state.getCountries()` method
- Existing info panel structure and styling
- Existing state management for country selection

No new npm packages required.
