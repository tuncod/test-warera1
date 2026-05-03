export const API_URL = 'https://api2.warera.io/trpc/country.getAllCountries';
export const API_AUTH_TOKEN = 'Bearer wae_ae8dc4516462513ce1ea18db612e1fa2b458409fa214985db9dc84dd407c3bc2';
export const API_CACHE_KEY = 'warera_api_cache';
export const API_CACHE_TTL = 5 * 60 * 1000;
export const OCCUPATION_CACHE_KEY = 'warera_occupations';
export const OCCUPATION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const SPHERE_RADIUS = 200;
export const NODE_JITTER = 5;
export const NODE_MIN_SCALE = 2;
export const NODE_MAX_SCALE = 12;

export const CAMERA_FOV = 60;
export const CAMERA_NEAR = 1;
export const CAMERA_FAR = 2000;
export const FLY_TO_DURATION = 1200;

export const LABEL_SHOW_DISTANCE = 600;

export const PARTICLE_COUNT = 500;
export const PARTICLE_SPREAD = 600;

export const REGION_COLORS: Record<number, number> = {
  0: 0xe74c3c,
  1: 0x3498db,
  2: 0x2ecc71,
  3: 0xf39c12,
  4: 0x9b59b6,
  5: 0x1abc9c,
  6: 0xe67e22,
  7: 0x34495e,
  8: 0x16a085,
  9: 0xc0392b
};

export const ALLIANCE_COLOR = 0x00ffff;
export const WAR_COLOR = 0xff3333;

export const THEME = {
  bg: '#0a0a1a',
  panelBg: 'rgba(10, 10, 30, 0.85)',
  panelBorder: 'rgba(100, 200, 255, 0.15)',
  text: '#e0e0e0',
  textMuted: '#888',
  accent: '#00d4ff',
  accentHover: '#00a8cc'
};

export const GREEK_NAMES = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
  'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
  'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'
];
