import type { Country, OccupationData } from '@/types';
import { state } from '@/state';
import { fetchOccupations } from '@/api';

const codeToEmoji: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CN: '🇨🇳', RU: '🇷🇺', DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵',
  IN: '🇮🇳', BR: '🇧🇷', CA: '🇨🇦', AU: '🇦🇺', KR: '🇰🇷', IT: '🇮🇹', ES: '🇪🇸',
  MX: '🇲🇽', ID: '🇮🇩', NL: '🇳🇱', SA: '🇸🇦', TR: '🇹🇷', CH: '🇨🇭', PL: '🇵🇱',
  SE: '🇸🇪', BE: '🇧🇪', AR: '🇦🇷', NO: '🇳🇴', AT: '🇦🇹', AE: '🇦🇪', SG: '🇸🇬',
  MY: '🇲🇾', TH: '🇹🇭', PH: '🇵🇭', VN: '🇻🇳', EG: '🇪🇬', ZA: '🇿🇦', NG: '🇳🇬',
  KE: '🇰🇪', IL: '🇮🇱', PK: '🇵🇰', BD: '🇧🇩', IR: '🇮🇷', IQ: '🇮🇶', SY: '🇸🇾',
  UA: '🇺🇦', RO: '🇷🇴', HU: '🇭🇺', CZ: '🇨🇿', DK: '🇩🇰', FI: '🇫🇮', IE: '🇮🇪',
  PT: '🇵🇹', GR: '🇬🇷', NZ: '🇳🇿', CL: '🇨🇱', CO: '🇨🇴', PE: '🇵🇪', VE: '🇻🇪',
  CU: '🇨🇺', KZ: '🇰🇿', UZ: '🇺🇿', GE: '🇬🇪', AM: '🇦🇲', AZ: '🇦🇿', MN: '🇲🇳',
  NP: '🇳🇵', LK: '🇱🇰', MM: '🇲🇲', KH: '🇰🇭', LA: '🇱🇦', DZ: '🇩🇿', MA: '🇲🇦',
  TN: '🇹🇳', LY: '🇱🇾', SD: '🇸🇩', ET: '🇪🇹', GH: '🇬🇭', TZ: '🇹🇿', UG: '🇺🇬',
  SN: '🇸🇳', CI: '🇨🇮', CM: '🇨🇲', AO: '🇦🇴', MZ: '🇲🇿', ZW: '🇿🇼', BW: '🇧🇼',
  NA: '🇳🇦', MG: '🇲🇬', MU: '🇲🇺', RW: '🇷🇼', JM: '🇯🇲', TT: '🇹🇹', PA: '🇵🇦',
  CR: '🇨🇷', GT: '🇬🇹', HN: '🇭🇳', SV: '🇸🇻', NI: '🇳🇮', DO: '🇩🇴', HT: '🇭🇹',
  BO: '🇧🇴', PY: '🇵🇾', UY: '🇺🇾', EC: '🇪🇨', QA: '🇶🇦', KW: '🇰🇼', BH: '🇧🇭',
  OM: '🇴🇲', JO: '🇯🇴', LB: '🇱🇧', PS: '🇵🇸', YE: '🇾🇪', AF: '🇦🇫',
  BY: '🇧🇾', MD: '🇲🇩', RS: '🇷🇸', HR: '🇭🇷', BA: '🇧🇦', SI: '🇸🇮', SK: '🇸🇰',
  BG: '🇧🇬', AL: '🇦🇱', MK: '🇲🇰', ME: '🇲🇪', LT: '🇱🇹', LV: '🇱🇻', EE: '🇪🇪',
  IS: '🇮🇸', LU: '🇱🇺', MT: '🇲🇹', CY: '🇨🇾', AD: '🇦🇩', MC: '🇲🇨', SM: '🇸🇲',
  LI: '🇱🇮', VA: '🇻🇦'
};

export class InfoPanel {
  private panel: HTMLElement;
  private nameEl: HTMLElement;
  private flagEl: HTMLElement;
  private treasuryEl: HTMLElement;
  private alliesContainer: HTMLElement;
  private warsContainer: HTMLElement;
  private occupationsContainer: HTMLElement;
  private occupationCache: Map<string, OccupationData> = new Map();
  private loadingCountryId: string | null = null;
  private closeBtn: HTMLElement;

  constructor() {
    this.panel = document.getElementById('info-panel')!;
    this.nameEl = document.getElementById('info-name')!;
    this.flagEl = document.getElementById('info-flag')!;
    this.treasuryEl = document.getElementById('info-treasury')!;
    this.alliesContainer = document.getElementById('info-allies-container')!;
    this.warsContainer = document.getElementById('info-wars-container')!;
    this.occupationsContainer = document.getElementById('info-occupations-container')!;
    this.closeBtn = document.getElementById('info-close')!;

    this.closeBtn.addEventListener('click', () => this.hide());

    // Close on ESC key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !this.panel.classList.contains('hidden')) {
        this.hide();
      }
    });
  }

  show(country: Country): void {
    const allCountries = state.getCountries();

    // Set flag and name
    const flagEmoji = codeToEmoji[country.code.toUpperCase()] ?? '🏳️';
    this.flagEl.textContent = flagEmoji;
    this.nameEl.textContent = country.name;

    // Format treasury with currency symbol and commas
    this.treasuryEl.textContent = `¤${country.money.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Create expandable allies list
    this.alliesContainer.innerHTML = '';
    const allyNames = country.allies
      .map((id: string) => allCountries.find((c: Country) => c.id === id)?.name)
      .filter(Boolean) as string[];

    if (allyNames.length === 0) {
      this.alliesContainer.innerHTML = '<span style="color: #666; font-style: italic;">None</span>';
    } else {
      this.alliesContainer.appendChild(this.createExpandableList('Allies', allyNames));
    }

    // Create expandable wars list
    this.warsContainer.innerHTML = '';
    const warNames = country.warsWith
      .map((id: string) => allCountries.find((c: Country) => c.id === id)?.name)
      .filter(Boolean) as string[];

    if (warNames.length === 0) {
      this.warsContainer.innerHTML = '<span style="color: #666; font-style: italic;">None</span>';
    } else {
      this.warsContainer.appendChild(this.createExpandableList('Wars', warNames));
    }

    // Load occupation data
    this.showOccupations(country);

    this.panel.classList.remove('hidden');
  }

  private createExpandableList(type: string, items: string[]): HTMLElement {
    const container = document.createElement('div');
    container.className = 'info-list-expandable';

    const header = document.createElement('div');
    header.className = 'info-list-header';
    header.innerHTML = `
      <span class="info-list-count">${items.length} ${type}</span>
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

  private renderOccupationsLoading(): void {
    this.occupationsContainer.innerHTML = '<span style="color: #888; font-style: italic;">Loading occupations...</span>';
  }

  private renderOccupationsError(): void {
    this.occupationsContainer.innerHTML = '<span style="color: #888; font-style: italic;">No occupation data available</span>';
  }

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

  hide(): void {
    this.panel.classList.add('hidden');
    state.selectCountry(null);
  }

  isVisible(): boolean {
    return !this.panel.classList.contains('hidden');
  }
}
