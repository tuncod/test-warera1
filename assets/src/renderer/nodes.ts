import * as THREE from 'three';
import type { Country } from '@/types';
import {
  SPHERE_RADIUS,
  NODE_JITTER,
  NODE_MIN_SCALE,
  NODE_MAX_SCALE,
  REGION_COLORS
} from '@/config';

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

export class NodeManager {
  private meshes: Map<string, THREE.Mesh> = new Map();
  private group: THREE.Group | null = null;

  build(countries: Country[], positions: Map<string, { position: [number, number, number]; scale: number }>, scene: THREE.Scene): void {
    this.dispose(scene);

    const allianceCounts = new Map<string, number>();
    for (const c of countries) {
      allianceCounts.set(c.id, 0);
    }
    for (const c of countries) {
      for (const allyId of c.allies) {
        if (allianceCounts.has(allyId)) {
          allianceCounts.set(allyId, allianceCounts.get(allyId)! + 1);
        }
      }
    }

    const maxAlliances = Math.max(...allianceCounts.values(), 1);

    this.group = new THREE.Group();
    scene.add(this.group);

    for (const country of countries) {
      const pos = positions.get(country.id);
      if (!pos) continue;

      const [x, y, z] = pos.position;

      const flagEmoji = codeToEmoji[country.code.toUpperCase()] ?? '🏳️';
      const label = `${flagEmoji}\n${country.name}`;

      const canvas = document.createElement('canvas');
      const size = 512;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bgColor = REGION_COLORS[country.region] ?? 0x888888;
      const color = new THREE.Color(bgColor);
      const hexBg = `#${color.getHexString()}`;

      ctx.fillStyle = hexBg;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();

      const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '80px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillText(flagEmoji, size / 2 + 2, size / 2 - 50 + 2);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(flagEmoji, size / 2, size / 2 - 50);

      const nameFontSize = Math.min(52, Math.max(28, 380 / Math.max(country.name.length * 0.65, 1)));
      ctx.font = `bold ${nameFontSize}px Arial, sans-serif`;

      // Measure text to ensure it fits within the sphere
      const textMetrics = ctx.measureText(country.name);
      const maxTextWidth = size * 0.85; // Use 85% of canvas width

      // If text is too wide, scale down the font
      if (textMetrics.width > maxTextWidth) {
        const scaledFontSize = nameFontSize * (maxTextWidth / textMetrics.width);
        ctx.font = `bold ${scaledFontSize}px Arial, sans-serif`;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillText(country.name, size / 2 + 2, size / 2 + 65 + 2);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(country.name, size / 2, size / 2 + 65);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const geometry = new THREE.SphereGeometry(1, 32, 24);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.3,
        emissive: 0x000000,
        emissiveIntensity: 0.2
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.scale.setScalar(pos.scale);
      mesh.userData.countryId = country.id;

      this.group.add(mesh);
      this.meshes.set(country.id, mesh);
    }
  }

  updateVisibility(countries: Country[], visibleIds: Set<string>): void {
    for (const [id, mesh] of this.meshes) {
      mesh.visible = visibleIds.has(id);
    }
  }

  highlightNode(countryId: string, highlight: boolean): void {
    const mesh = this.meshes.get(countryId);
    if (!mesh) return;

    if (highlight) {
      mesh.scale.multiplyScalar(1.15);
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
    } else {
      mesh.scale.multiplyScalar(1 / 1.15);
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
    }
  }

  getCountryByMesh(mesh: THREE.Object3D): string | undefined {
    if (mesh instanceof THREE.Mesh && mesh.userData.countryId) {
      return mesh.userData.countryId;
    }
    return undefined;
  }

  getMeshForCountry(countryId: string): THREE.Mesh | undefined {
    return this.meshes.get(countryId);
  }

  getVisibleIndices(): Set<number> {
    return new Set();
  }

  get meshesMap(): Map<string, THREE.Mesh> {
    return this.meshes;
  }

  dispose(scene: THREE.Scene): void {
    if (this.group) {
      scene.remove(this.group);
      for (const mesh of this.meshes.values()) {
        if (mesh.material instanceof THREE.Material) {
          if ((mesh.material as THREE.MeshStandardMaterial).map) {
            (mesh.material as THREE.MeshStandardMaterial).map!.dispose();
          }
          mesh.material.dispose();
        }
        mesh.geometry.dispose();
      }
      this.group.clear();
      this.group = null;
    }
    this.meshes.clear();
  }
}

export function computePositions(countries: Country[]): Map<string, { position: [number, number, number]; scale: number }> {
  const positions = new Map<string, { position: [number, number, number]; scale: number }>();
  const count = countries.length;

  const allianceCounts = new Map<string, number>();
  for (const c of countries) {
    allianceCounts.set(c.id, 0);
  }
  for (const c of countries) {
    for (const allyId of c.allies) {
      if (allianceCounts.has(allyId)) {
        allianceCounts.set(allyId, allianceCounts.get(allyId)! + 1);
      }
    }
  }

  const maxAlliances = Math.max(...allianceCounts.values(), 1);

  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * i / goldenRatio;
    const phi = Math.acos(1 - 2 * (i + 0.5) / count);

    const jitterX = (Math.random() - 0.5) * 2 * NODE_JITTER;
    const jitterY = (Math.random() - 0.5) * 2 * NODE_JITTER;
    const jitterZ = (Math.random() - 0.5) * 2 * NODE_JITTER;

    const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta) + jitterX;
    const y = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta) + jitterY;
    const z = SPHERE_RADIUS * Math.cos(phi) + jitterZ;

    const allianceCount = allianceCounts.get(countries[i].id) ?? 0;
    const t = allianceCount / maxAlliances;
    const scale = NODE_MIN_SCALE + t * (NODE_MAX_SCALE - NODE_MIN_SCALE);

    positions.set(countries[i].id, {
      position: [x, y, z],
      scale
    });
  }

  return positions;
}
