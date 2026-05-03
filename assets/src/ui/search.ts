import type { Country } from '@/types';
import { state } from '@/state';

export class SearchUI {
  private toggleBtn: HTMLElement;
  private panel: HTMLElement;
  private input: HTMLInputElement;
  private resultsEl: HTMLElement;
  private isOpen = false;

  constructor(private onCountrySelect: (country: Country) => void) {
    this.toggleBtn = document.getElementById('search-toggle')!;
    this.panel = document.getElementById('search-panel')!;
    this.input = document.getElementById('search-input') as HTMLInputElement;
    this.resultsEl = document.getElementById('search-results')!;

    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.input.addEventListener('input', () => this.onInput());

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    this.resultsEl.addEventListener('click', (e: MouseEvent) => {
      const item = (e.target as HTMLElement).closest('[data-country-id]') as HTMLElement;
      if (item && item.dataset.countryId) {
        const country = state.getCountryById(item.dataset.countryId);
        if (country) {
          this.onCountrySelect(country);
          this.close();
        }
      }
    });
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.isOpen = true;
    this.panel.classList.remove('hidden');
    this.input.focus();
    this.input.value = '';
    this.onInput();
  }

  close(): void {
    this.isOpen = false;
    this.panel.classList.add('hidden');
    this.resultsEl.innerHTML = '';
    state.setSearchQuery('');
  }

  private onInput(): void {
    const query = this.input.value.trim().toLowerCase();
    state.setSearchQuery(query);

    this.resultsEl.innerHTML = '';

    if (!query) {
      return;
    }

    const allCountries = state.getCountries();
    const filteredCountries = allCountries.filter((c: Country) =>
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query)
    );

    const countries = filteredCountries.slice(0, 10);

    // Show result count if more than 10 results
    if (filteredCountries.length > 10) {
      const countEl = document.createElement('div');
      countEl.className = 'search-results-count';
      countEl.textContent = `Showing 10 of ${filteredCountries.length} results`;
      this.resultsEl.appendChild(countEl);
    }

    if (countries.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No countries found';
      this.resultsEl.appendChild(noResults);
      return;
    }

    countries.forEach((c: Country) => {
      const resultEl = document.createElement('div');
      resultEl.className = 'search-result';
      resultEl.setAttribute('data-country-id', c.id);
      resultEl.innerHTML = `${c.name} <span class="search-code">${c.code}</span>`;
      this.resultsEl.appendChild(resultEl);
    });
  }
}
