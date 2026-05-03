# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

War Era 3D Alliance Network is a browser-based 3D visualization of country alliances from the War Era game. This is a **modular TypeScript application** built with Vite, using Three.js for 3D rendering.

## API Documentation

**Comprehensive API documentation for AI agents is available in `WARERA_API_DOCUMENTATION.md`**

Quick API reference:
- **Base URL:** `https://api2.warera.io`
- **Protocol:** tRPC over HTTP GET
- **Documentation:** https://api2.warera.io/docs/
- **Rate Limit:** 100 requests per 60 seconds
- **Main Endpoint:** `https://api2.warera.io/trpc/country.getAllCountries`

## Development Commands

### Start the development server:
```bash
cd /home/warera
npm run dev
```
Or manually:
```bash
npx vite
```

The site will be available at `http://152.53.186.207:8000` or `http://warera.on-development.my.id:8000`

### Build for production:
```bash
npm run build
```
Output is written to `dist/` directory.

### Preview production build:
```bash
npm run preview
```

## Production Deployment

The site is served via nginx at `https://warera.on-development.my.id`

### Deploy after building:
```bash
npm run build
sudo cp -r dist/* /var/www/warera-on-development.my.id/
```

### Reload nginx after config changes:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### View logs:
```bash
tail -f /var/log/nginx/warera-on-development-access.log
tail -f /var/log/nginx/warera-on-development-error.log
```

### Renew SSL certificate:
```bash
sudo certbot renew --nginx
```

## Architecture

This is a **modular TypeScript application** with the following structure:

### Technology Stack
- **Build Tool:** Vite 5.0
- **Language:** TypeScript 5.3 (ES2020 target)
- **3D Rendering:** Three.js 0.160
- **Module System:** ES Modules with path aliases (`@/` → `src/`)

### Directory Structure
```
src/
├── main.ts           # Application entry point & App class
├── api.ts            # API integration & data fetching
├── config.ts         # Configuration constants
├── state.ts          # Global state manager with events
├── types.ts          # TypeScript interfaces
├── styles.css        # Global styles
├── interaction/      # User interaction modules
│   ├── camera.ts     # Camera animation (fly-to effects)
│   ├── controls.ts   # Orbit controls wrapper
│   └── raycaster.ts  # Mouse interaction raycasting
├── renderer/         # 3D rendering modules
│   ├── scene.ts      # Three.js scene setup
│   ├── nodes.ts      # Country node meshes & positioning
│   ├── edges.ts      # Alliance/war connection lines
│   ├── labels.ts     # Country label sprites
│   └── particles.ts  # Background particle effects
└── ui/               # UI components
    ├── panels.ts     # Info panel display
    ├── search.ts     # Search functionality
    └── stats.ts      # Statistics display
```

### Key Architecture Patterns

**1. State Management (`src/state.ts`)**
- Centralized state manager with event system
- Events: `countrySelected`, `countryHovered`, `regionFilterChanged`, `searchChanged`, `dataLoaded`
- Use `state.on(event, callback)` to subscribe to events

**2. Manager Classes**
Each module exports a manager class responsible for its domain:
- `SceneManager` - Three.js scene, camera, renderer lifecycle
- `NodeManager` - Country node creation, visibility, highlighting
- `EdgeManager` - Alliance/war line rendering with animation
- `LabelManager` - Country code labels with LOD
- `StateManager` - Global app state with event pub/sub
- `InteractionControls` - Orbit controls wrapper
- `CameraAnimator` - Smooth camera transitions
- `InfoPanel` - Country detail panel
- `SearchUI` - Search interface with keyboard shortcuts

**3. Data Flow**
```
API (fetchCountries)
  → State Manager (setData)
    → App (positions computed, visualizations built)
      → Managers (scene updated)
```

### Data Model

**Country Interface** (`src/types.ts`):
```typescript
interface Country {
  id: string;           // MongoDB ObjectId
  name: string;         // Country name
  code: string;         // 2-letter country code
  money: number;        // Treasury amount
  allies: string[];     // Array of allied country IDs
  warsWith: string[];   // Array of enemy country IDs
  region: number;       // Region index (0-9) for coloring
}
```

**API Response Handling** (`src/api.ts`):
The app handles multiple response formats from the API:
- `result.data` (tRPC standard format)
- Direct array response
- `countries` fallback

### Visual Features

**Node Positioning** (`src/renderer/nodes.ts`):
- **Fibonacci Spiral Distribution**: Evenly distributes nodes on sphere surface
- **Scale by Alliances**: Node size varies based on alliance count
- **Country Flags**: Flag emoji + country name rendered on each node
- **Region Colors**: 10 color palette for country grouping

**Alliance Visualization** (`src/renderer/edges.ts`):
- **Alliance Lines**: Semi-transparent cyan lines (#00ffff)
- **War Lines**: Dashed red lines (#ff3333)
- **Animated**: Lines pulse with opacity changes

**Interactivity**:
- **Click**: Select country, show info panel, fly camera to node
- **Hover**: Highlight node, show tooltip
- **Search**: Ctrl+K to open, filters by name/code
- **Region Filter**: Dropdown to filter by region
- **Orbit Controls**: Drag to rotate, scroll to zoom

### Configuration (`src/config.ts`)

Key constants:
- `SPHERE_RADIUS`: 200 - Node distribution radius
- `NODE_MIN_SCALE`: 2 - Minimum node size
- `NODE_MAX_SCALE`: 12 - Maximum node size
- `CAMERA_FOV`: 60 - Field of view
- `API_CACHE_TTL`: 5 minutes - LocalStorage cache duration
- `REGION_COLORS`: 10 region color mappings
- `GREEK_NAMES`: Used for mock data generation

## Testing Changes

1. **Development**: Run `npm run dev` - hot reload enabled
2. **Changes**: Modify any `.ts` file, browser auto-refreshes
3. **Build**: Run `npm run build` to test production output

## Common Tasks

### Adding a New Visual Feature

1. Create/update manager class in appropriate `src/` subdirectory
2. Export manager class
3. Import in `src/main.ts`
4. Initialize in `App` constructor
5. Call methods in `init()` or `animate()`

### Modifying Node Appearance

Edit `src/renderer/nodes.ts`:
- `build()` method controls node rendering
- `computePositions()` calculates 3D positions
- Canvas texture generation for flags/names

### Changing Colors/Theme

Edit `src/config.ts`:
- `REGION_COLORS` object for region colors
- `THEME` object for UI colors
- `ALLIANCE_COLOR` and `WAR_COLOR` for edges

### Adding New Event Handlers

Use the state manager in `src/state.ts`:
```typescript
import { state } from '@/state';

state.on('countrySelected', (country) => {
  // Handle selection
});
```

### Debugging API Issues

Check `src/api.ts`:
- `fetchCountries()` handles data fetching
- `parseApiResponse()` handles multiple response formats
- `generateMockData()` provides fallback data
- LocalStorage cache with 5-minute TTL

## Project Files

- `index.html` - Main HTML entry point
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `src/` - All source code
- `dist/` - Production build output
- `WARERA_API_DOCUMENTATION.md` - Complete API reference
- `DEPLOYMENT.md` - Deployment guide
- `CLAUDE.md` - This file

## Import Aliases

Path alias `@/` maps to `src/` directory:
```typescript
import { state } from '@/state';
import { SceneManager } from '@/renderer/scene';
```

## Browser Compatibility

- Uses ES2020 features
- WebGL required for Three.js
- Modern browsers with ES module support
