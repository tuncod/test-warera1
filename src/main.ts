import type { Country, AllianceEdge } from '@/types';
import { fetchCountries } from '@/api';
import { state } from '@/state';
import { SceneManager } from '@/renderer/scene';
import { NodeManager, computePositions } from '@/renderer/nodes';
import { EdgeManager } from '@/renderer/edges';
import { LabelManager } from '@/renderer/labels';
import { ParticleManager } from '@/renderer/particles';
import { InteractionControls } from '@/interaction/controls';
import { RaycasterManager } from '@/interaction/raycaster';
import { CameraAnimator } from '@/interaction/camera';
import { InfoPanel } from '@/ui/panels';
import { SearchUI } from '@/ui/search';
import { StatsDisplay } from '@/ui/stats';
import { REGION_COLORS, SPHERE_RADIUS } from '@/config';

class App {
  private sceneManager: SceneManager;
  private nodeManager: NodeManager;
  private edgeManager: EdgeManager;
  private labelManager: LabelManager;
  private particleManager: ParticleManager;
  private controls: InteractionControls;
  private raycasterManager: RaycasterManager;
  private cameraAnimator: CameraAnimator;
  private infoPanel: InfoPanel;
  private searchUI: SearchUI;
  private statsDisplay: StatsDisplay;

  private edges: AllianceEdge[] = [];
  private positions: Map<string, { position: [number, number, number]; scale: number }> = new Map();
  private originalPositions: Map<string, { position: [number, number, number]; scale: number }> = new Map();
  private lastHoveredCountry: string | null = null;
  private mousePosition = { x: 0, y: 0 };
  private isFirstVisit = true;
  private selectedCountryId: string | null = null;
  private isAnimatingPositions = false;

  constructor() {
    const container = document.getElementById('canvas-container')!;

    this.sceneManager = new SceneManager(container);
    this.nodeManager = new NodeManager();
    this.edgeManager = new EdgeManager();
    this.labelManager = new LabelManager();
    this.particleManager = new ParticleManager();
    this.controls = new InteractionControls(this.sceneManager);
    this.raycasterManager = new RaycasterManager(
      this.sceneManager,
      this.nodeManager
    );
    this.cameraAnimator = new CameraAnimator(this.sceneManager);
    this.infoPanel = new InfoPanel(() => this.resetView());
    this.statsDisplay = new StatsDisplay();

    this.searchUI = new SearchUI((country: Country) => this.selectCountry(country));

    this.setupEventListeners();
    this.setupStateListeners();
    this.setupHelpPanel();
    this.particleManager.build(this.sceneManager.scene);

    this.animate();
  }

  private setupEventListeners(): void {
    const canvas = this.sceneManager.renderer.domElement;

    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      this.mousePosition = { x: e.clientX, y: e.clientY };
      const mesh = this.raycasterManager.onMouseMove(e.clientX, e.clientY);
      this.handleHover(mesh);
      this.updateTooltipPosition(e.clientX, e.clientY);
    });

    canvas.addEventListener('click', (e: MouseEvent) => {
      const mesh = this.raycasterManager.onClick(e.clientX, e.clientY);
      if (mesh) {
        this.handleClick(mesh);
      }
    });

    canvas.addEventListener('mouseleave', () => {
      this.handleHover(null);
    });

    // Double-click to reset view
    canvas.addEventListener('dblclick', () => {
      this.resetView();
    });

    window.addEventListener('resize', () => {
      this.sceneManager.onResize();
    });

    // Reset view button
    const resetBtn = document.getElementById('reset-view')!;
    resetBtn.addEventListener('click', () => this.resetView());

    // ESC to close panels
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const searchPanel = document.getElementById('search-panel');
        const helpPanel = document.getElementById('help-panel');
        if (searchPanel && !searchPanel.classList.contains('hidden')) {
          // Search UI handles its own ESC
        } else if (helpPanel && !helpPanel.classList.contains('hidden')) {
          helpPanel.classList.add('hidden');
        }
      }
    });

    // Make info panel draggable
    this.setupDraggableInfoPanel();
  }

  private setupDraggableInfoPanel(): void {
    const infoPanel = document.getElementById('info-panel')!;
    const infoHeader = document.getElementById('info-header')!;

    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    infoHeader.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true;
      infoPanel.classList.add('dragging');

      const rect = infoPanel.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;

      e.preventDefault();
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDragging) return;

      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;

      // Constrain to window bounds
      const maxX = window.innerWidth - infoPanel.offsetWidth;
      const maxY = window.innerHeight - infoPanel.offsetHeight;

      const constrainedX = Math.max(0, Math.min(x, maxX));
      const constrainedY = Math.max(0, Math.min(y, maxY));

      infoPanel.style.left = constrainedX + 'px';
      infoPanel.style.top = constrainedY + 'px';
      infoPanel.style.bottom = 'auto';
      infoPanel.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        infoPanel.classList.remove('dragging');
      }
    });
  }

  private setupHelpPanel(): void {
    const helpToggle = document.getElementById('help-toggle')!;
    const helpPanel = document.getElementById('help-panel')!;
    const helpCloseBtn = document.getElementById('help-close-btn')!;

    helpToggle.addEventListener('click', () => {
      helpPanel.classList.remove('hidden');
    });

    helpCloseBtn.addEventListener('click', () => {
      helpPanel.classList.add('hidden');
    });
  }

  private setupStateListeners(): void {
    state.on('searchChanged', () => {
      this.applyFilters();
    });
  }

  private handleHover(mesh: THREE.Mesh | null): void {
    const countryId = mesh ? this.nodeManager.getCountryByMesh(mesh) ?? null : null;

    if (countryId !== this.lastHoveredCountry) {
      if (this.lastHoveredCountry) {
        this.nodeManager.highlightNode(this.lastHoveredCountry, false);
      }
      if (countryId) {
        this.nodeManager.highlightNode(countryId, true);
      }
      this.lastHoveredCountry = countryId;
    }

    const tooltip = document.getElementById('tooltip')!;
    if (countryId) {
      const country = state.getCountryById(countryId);
      if (country) {
        state.hoverCountry(country);
        tooltip.textContent = country.name;
        tooltip.classList.remove('hidden');
      }
    } else {
      state.hoverCountry(null);
      tooltip.classList.add('hidden');
    }
  }

  private handleClick(mesh: THREE.Mesh): void {
    const countryId = this.nodeManager.getCountryByMesh(mesh);
    if (countryId) {
      const country = state.getCountryById(countryId);
      if (country) {
        this.selectCountry(country);
      }
    }
  }

  private selectCountry(country: Country): void {
    this.selectedCountryId = country.id;
    state.selectCountry(country);

    // Focus on connected countries
    this.focusOnConnectedCountries(country);

    const pos = this.positions.get(country.id);
    if (pos) {
      this.controls.stopAutoRotation();
      this.updateAutoRotateIndicator();
      this.cameraAnimator.flyTo(pos.position);
    }

    this.infoPanel.show(country);

    // Calculate and show potential allies
    const potentialAllies = this.calculatePotentialAllies(country);
    this.infoPanel.showPotentialAllies(potentialAllies);
  }

  private deselectCountry(): void {
    this.selectedCountryId = null;
    state.selectCountry(null);

    // Remove highlight from all countries
    const countries = state.getCountries();
    for (const country of countries) {
      this.nodeManager.highlightNode(country.id, false);
    }

    // Restore all countries and positions
    this.restoreAllCountries();
  }

  private focusOnConnectedCountries(selectedCountry: Country): void {
    if (this.isAnimatingPositions) return;

    // Get connected country IDs (allies + wars + selected country)
    const connectedIds = new Set<string>();
    connectedIds.add(selectedCountry.id);

    selectedCountry.allies.forEach(id => connectedIds.add(id));
    selectedCountry.warsWith.forEach(id => connectedIds.add(id));

    // Highlight all connected countries visually
    const countries = state.getCountries();
    for (const country of countries) {
      if (connectedIds.has(country.id)) {
        this.nodeManager.highlightNode(country.id, true);
      } else {
        this.nodeManager.highlightNode(country.id, false);
      }
    }

    // Animate positions: bring connected countries closer
    this.animateConnectedCountries(connectedIds, selectedCountry.id);
  }

  private animateConnectedCountries(connectedIds: Set<string>, selectedId: string): void {
    this.isAnimatingPositions = true;

    const selectedPos = this.positions.get(selectedId);
    if (!selectedPos) {
      this.isAnimatingPositions = false;
      return;
    }

    const countries = state.getCountries();
    const newPositions = new Map(this.positions);

    // Calculate center of connected countries
    let centerX = 0, centerY = 0, centerZ = 0;
    let count = 0;

    connectedIds.forEach(id => {
      const pos = this.positions.get(id);
      if (pos) {
        centerX += pos.position[0];
        centerY += pos.position[1];
        centerZ += pos.position[2];
        count++;
      }
    });

    if (count > 0) {
      centerX /= count;
      centerY /= count;
      centerZ /= count;
    }

    // Animate positions with easing
    const startTime = performance.now();
    const duration = 800; // ms

    const animatePositions = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Easing function (easeInOutCubic)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      connectedIds.forEach(id => {
        const originalPos = this.positions.get(id);
        if (!originalPos) return;

        if (id === selectedId) {
          // Selected country stays in place
          return;
        }

        // Calculate target position: closer to center, spread on smaller sphere
        const originalPosArray = originalPos.position;
        const dirX = originalPosArray[0] - centerX;
        const dirY = originalPosArray[1] - centerY;
        const dirZ = originalPosArray[2] - centerZ;

        const dist = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        if (dist === 0) return;

        const normalizedDir = [dirX / dist, dirY / dist, dirZ / dist];

        // Target: on a smaller sphere (70% of original), centered around selected country
        const targetRadius = SPHERE_RADIUS * 0.7;
        const targetX = selectedPos.position[0] + normalizedDir[0] * targetRadius;
        const targetY = selectedPos.position[1] + normalizedDir[1] * targetRadius;
        const targetZ = selectedPos.position[2] + normalizedDir[2] * targetRadius;

        // Interpolate position
        const newX = originalPosArray[0] + (targetX - originalPosArray[0]) * eased;
        const newY = originalPosArray[1] + (targetY - originalPosArray[1]) * eased;
        const newZ = originalPosArray[2] + (targetZ - originalPosArray[2]) * eased;

        // Update node position
        const mesh = this.nodeManager.getMeshForCountry(id);
        if (mesh) {
          mesh.position.set(newX, newY, newZ);
        }

        // Update label position
        const label = this.labelManager.getLabel(id);
        if (label) {
          label.position.set(newX, newY + 2.5 * originalPos.scale, newZ);
        }

        // Store new position
        newPositions.set(id, { position: [newX, newY, newZ], scale: originalPos.scale });
      });

      // Update edge positions
      this.edgeManager.updateFromPositions(countries, newPositions, this.sceneManager.scene, connectedIds);

      if (t < 1) {
        requestAnimationFrame(animatePositions);
      } else {
        this.isAnimatingPositions = false;
      }
    };

    animatePositions();

    // Hide unconnected countries
    this.updateVisibility(connectedIds);
  }

  private restoreAllCountries(): void {
    if (this.isAnimatingPositions) return;

    // Restore original positions
    const countries = state.getCountries();

    countries.forEach(country => {
      const originalPos = this.positions.get(country.id);
      if (!originalPos) return;

      const mesh = this.nodeManager.getMeshForCountry(country.id);
      if (mesh) {
        mesh.position.set(
          originalPos.position[0],
          originalPos.position[1],
          originalPos.position[2]
        );
      }

      const label = this.labelManager.getLabel(country.id);
      if (label) {
        label.position.set(
          originalPos.position[0],
          originalPos.position[1] + 2.5 * originalPos.scale,
          originalPos.position[2]
        );
      }
    });

    // Rebuild edges with original positions
    this.edgeManager.updateFromPositions(countries, this.positions, this.sceneManager.scene);

    // Show all countries
    const allIds = new Set(countries.map(c => c.id));
    this.updateVisibility(allIds);
  }

  private calculatePotentialAllies(country: Country): {
    highPotential: Array<{ country: Country; sharedEnemies: Country[]; sharedCount: number }>;
    regularPotential: Country[];
  } {
    // Implementation in next task
    return { highPotential: [], regularPotential: [] };
  }

  private resetView(): void {
    this.deselectCountry();
    this.cameraAnimator.flyToOrigin();
    this.controls.resumeAutoRotation();
    this.updateAutoRotateIndicator();
  }

  private updateTooltipPosition(x: number, y: number): void {
    const tooltip = document.getElementById('tooltip')!;
    if (!tooltip.classList.contains('hidden')) {
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }
  }

  private applyFilters(): void {
    const searchQuery = state.getState().searchQuery.toLowerCase();

    // If a country is selected, only show connected countries
    if (this.selectedCountryId) {
      const selectedCountry = state.getCountryById(this.selectedCountryId);
      if (selectedCountry) {
        const connectedIds = new Set<string>();
        connectedIds.add(selectedCountry.id);
        selectedCountry.allies.forEach(id => connectedIds.add(id));
        selectedCountry.warsWith.forEach(id => connectedIds.add(id));

        // Apply search filter on top of connection filter
        const visibleIds = new Set<string>();
        for (const id of connectedIds) {
          const country = state.getCountryById(id);
          if (!country) continue;

          if (!searchQuery ||
              country.name.toLowerCase().includes(searchQuery) ||
              country.code.toLowerCase().includes(searchQuery)) {
            visibleIds.add(id);
          }
        }

        this.updateVisibility(visibleIds);
        return;
      }
    }

    // No country selected - show all (with search filter if active)
    const visibleIds = new Set<string>();
    for (const country of state.getCountries()) {
      if (!searchQuery ||
          country.name.toLowerCase().includes(searchQuery) ||
          country.code.toLowerCase().includes(searchQuery)) {
        visibleIds.add(country.id);
      }
    }

    this.updateVisibility(visibleIds);
  }

  private updateVisibility(visibleIds: Set<string>): void {
    this.nodeManager.updateVisibility(state.getCountries(), visibleIds);
    this.edgeManager.updateVisibility(this.edges, this.positions, visibleIds, this.sceneManager.scene);
    this.labelManager.updateVisibility(visibleIds);
  }

  private updateAutoRotateIndicator(): void {
    const indicator = document.getElementById('auto-rotate-indicator')!;
    if (this.controls.controls.autoRotate) {
      indicator.classList.remove('hidden', 'paused');
    } else {
      indicator.classList.add('hidden');
    }
  }

  async init(): Promise<void> {
    // Show loading state
    this.statsDisplay.setLoading();
    const loadingOverlay = document.getElementById('loading-overlay')!;

    // Check if first visit
    const hasVisitedBefore = localStorage.getItem('warera_visited');
    this.isFirstVisit = !hasVisitedBefore;

    const countries = await fetchCountries();
    state.setData(countries);

    this.positions = computePositions(countries);
    this.originalPositions = new Map(this.positions); // Store original positions
    state.setPositions(this.positions);

    this.nodeManager.build(countries, this.positions, this.sceneManager.scene);
    this.edges = this.edgeManager.build(countries, this.positions, this.sceneManager.scene);
    this.labelManager.build(countries, this.positions, this.sceneManager.scene);

    this.statsDisplay.update(countries.length, this.edges);

    // Hide loading overlay
    loadingOverlay.classList.add('fade-out');
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
    }, 500);

    // Show help panel on first visit
    if (this.isFirstVisit) {
      setTimeout(() => {
        const helpPanel = document.getElementById('help-panel')!;
        helpPanel.classList.remove('hidden');
        localStorage.setItem('warera_visited', 'true');
      }, 1000);
    }

    // Enable auto-rotation after load
    this.controls.controls.autoRotate = true;
    this.controls.controls.autoRotateSpeed = 0.5;
    this.updateAutoRotateIndicator();
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    this.controls.update();

    if (!this.cameraAnimator.isActive()) {
      // Auto-rotate indicator
      if (this.controls.controls.autoRotate) {
        const indicator = document.getElementById('auto-rotate-indicator')!;
        if (indicator.classList.contains('hidden')) {
          indicator.classList.remove('hidden', 'paused');
        }
      }
    } else {
      const indicator = document.getElementById('auto-rotate-indicator')!;
      indicator.classList.add('paused');
    }

    this.cameraAnimator.update();

    const time = performance.now();
    this.edgeManager.animate(time);
    this.particleManager.animate();

    this.labelManager.updateLOD(this.sceneManager.camera.position);

    this.sceneManager.render();
  };
}

const app = new App();
app.init();

// Initialize Lucide icons
lucide.createIcons();
