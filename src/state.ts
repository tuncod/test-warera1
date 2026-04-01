import type { AppState, Country, EventName, EventCallback } from '@/types';

class StateManager {
  private state: AppState = {
    countries: [],
    edges: [],
    positions: new Map(),
    selectedCountry: null,
    hoveredCountry: null,
    activeRegionFilter: null,
    searchQuery: '',
    isLoaded: false
  };

  private listeners = new Map<EventName, Set<EventCallback>>();

  getState(): AppState {
    return { ...this.state, positions: new Map(this.state.positions) };
  }

  getCountries(): Country[] {
    return this.state.countries;
  }

  getCountryById(id: string): Country | undefined {
    return this.state.countries.find((c: Country) => c.id === id);
  }

  setData(countries: Country[]): void {
    this.state.countries = countries;
    this.state.isLoaded = true;
    this.emit('dataLoaded', countries);
  }

  selectCountry(country: Country | null): void {
    this.state.selectedCountry = country;
    this.emit('countrySelected', country);
  }

  hoverCountry(country: Country | null): void {
    this.state.hoveredCountry = country;
    this.emit('countryHovered', country);
  }

  setRegionFilter(region: number | null): void {
    this.state.activeRegionFilter = region;
    this.emit('regionFilterChanged', region);
  }

  setSearchQuery(query: string): void {
    this.state.searchQuery = query;
    this.emit('searchChanged', query);
  }

  setPositions(positions: Map<string, { position: [number, number, number]; scale: number }>): void {
    this.state.positions = positions;
  }

  on<T>(event: EventName, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
  }

  off<T>(event: EventName, callback: EventCallback<T>): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  private emit<T>(event: EventName, data: T): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

export const state = new StateManager();
