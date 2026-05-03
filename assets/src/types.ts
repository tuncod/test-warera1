export interface Country {
  id: string;
  name: string;
  code: string;
  money: number;
  allies: string[];
  warsWith: string[];
  region: number;
}

export interface OccupationData {
  occupying: string[];   // Region names this country occupies from others
  occupiedBy: string[];  // Region names occupied from this country
}

export interface AllianceEdge {
  from: string;
  to: string;
  type: 'alliance' | 'war';
}

export interface NodePosition {
  position: [number, number, number];
  scale: number;
}

export interface AppState {
  countries: Country[];
  edges: AllianceEdge[];
  positions: Map<string, NodePosition>;
  selectedCountry: Country | null;
  hoveredCountry: Country | null;
  activeRegionFilter: number | null;
  searchQuery: string;
  isLoaded: boolean;
}

export type EventName =
  | 'countrySelected'
  | 'countryHovered'
  | 'regionFilterChanged'
  | 'searchChanged'
  | 'dataLoaded';

export type EventCallback<T = unknown> = (data: T) => void;
