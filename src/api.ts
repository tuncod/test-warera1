import type { Country, OccupationData } from '@/types';
import { API_URL, API_AUTH_TOKEN, API_CACHE_KEY, API_CACHE_TTL, OCCUPATION_CACHE_KEY, OCCUPATION_CACHE_TTL, GREEK_NAMES } from '@/config';

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

function parseApiResponse(data: unknown): Country[] {
  if (!data) return [];

  let raw: unknown[] = [];

  if (Array.isArray(data)) {
    raw = data;
  } else if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (obj.result && typeof obj.result === 'object' && Array.isArray((obj.result as Record<string, unknown>).data)) {
      raw = (obj.result as Record<string, unknown>).data as unknown[];
    } else if (obj.countries && Array.isArray(obj.countries)) {
      raw = obj.countries;
    } else if (obj.data && Array.isArray(obj.data)) {
      raw = obj.data;
    }
  }

  return raw.map((item: unknown) => {
    const obj = item as Record<string, unknown>;
    return {
      id: String(obj.id ?? obj._id ?? ''),
      name: String(obj.name ?? 'Unknown'),
      code: String(obj.code ?? '??'),
      money: Number(obj.money ?? 0),
      allies: Array.isArray(obj.allies) ? obj.allies.map(String) : [],
      warsWith: Array.isArray(obj.warsWith) ? obj.warsWith.map(String) : [],
      region: Number(obj.region ?? 0)
    };
  }).filter(c => c.id !== '');
}

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

function getCachedData(): Country[] | null {
  try {
    const raw = localStorage.getItem(API_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { timestamp: number; data: Country[] };
    if (Date.now() - cached.timestamp > API_CACHE_TTL) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function setCachedData(data: Country[]): void {
  try {
    localStorage.setItem(API_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch {
    // Storage full or unavailable
  }
}

function generateMockData(): Country[] {
  const count = 50;
  const countries: Country[] = [];

  for (let i = 0; i < count; i++) {
    const nameIndex = i % GREEK_NAMES.length;
    const suffix = Math.floor(i / GREEK_NAMES.length) + 1;
    const name = suffix > 1 ? `${GREEK_NAMES[nameIndex]} ${suffix}` : GREEK_NAMES[nameIndex];
    const code = String.fromCharCode(65 + (i % 26)) + (suffix > 1 ? String(suffix) : '');

    countries.push({
      id: `mock-${i}`,
      name,
      code: code.substring(0, 4),
      money: Math.floor(Math.random() * 900000) + 100000,
      allies: [],
      warsWith: [],
      region: Math.floor(Math.random() * 10)
    });
  }

  for (let i = 0; i < countries.length; i++) {
    const allyCount = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < allyCount; j++) {
      let target = Math.floor(Math.random() * countries.length);
      if (target === i) target = (target + 1) % countries.length;
      const targetId = countries[target].id;
      if (!countries[i].allies.includes(targetId)) {
        countries[i].allies.push(targetId);
        if (!countries[target].allies.includes(countries[i].id)) {
          countries[target].allies.push(countries[i].id);
        }
      }
    }

    const warCount = Math.floor(Math.random() * 3);
    for (let j = 0; j < warCount; j++) {
      let target = Math.floor(Math.random() * countries.length);
      if (target === i) target = (target + 1) % countries.length;
      const targetId = countries[target].id;
      if (!countries[i].warsWith.includes(targetId) && !countries[i].allies.includes(targetId)) {
        countries[i].warsWith.push(targetId);
      }
    }
  }

  return countries;
}

export async function fetchCountries(): Promise<Country[]> {
  const cached = getCachedData();
  if (cached && cached.length > 0) return cached;

  try {
    const url = `${API_URL}?input=%7B%7D`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': API_AUTH_TOKEN
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const countries = parseApiResponse(json);

    if (countries.length > 0) {
      setCachedData(countries);
      return countries;
    }
  } catch {
    // Fall through to mock data
  }

  return generateMockData();
}

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
        'Authorization': API_AUTH_TOKEN
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json() as RegionsResponse;
    const regions = Object.values(json.result?.data ?? {});

    // Process ALL countries and populate entire cache
    const allOccupations: Record<string, OccupationData> = {};

    for (const region of regions) {
      if (region.country !== region.initialCountry) {
        // Occupying
        if (!allOccupations[region.country]) {
          allOccupations[region.country] = { occupying: [], occupiedBy: [] };
        }
        allOccupations[region.country].occupying.push(region.name);

        // Occupied from
        if (!allOccupations[region.initialCountry]) {
          allOccupations[region.initialCountry] = { occupying: [], occupiedBy: [] };
        }
        allOccupations[region.initialCountry].occupiedBy.push(region.name);
      }
    }

    // Merge with existing cache
    const existingCache = cache ?? {};
    Object.assign(existingCache, allOccupations);
    setOccupationCache(existingCache);

    // Return the requested country
    return existingCache[countryId] ?? { occupying: [], occupiedBy: [] };
  } catch (error) {
    console.error('Failed to fetch occupations:', error);
    return null;
  }
}
