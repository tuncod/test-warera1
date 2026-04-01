import * as THREE from 'three';
import type { Country } from '@/types';
import { LABEL_SHOW_DISTANCE, REGION_COLORS } from '@/config';

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

export class LabelManager {
  private labels: Map<string, THREE.Sprite> = new Map();

  build(countries: Country[], positions: Map<string, { position: [number, number, number]; scale: number }>, scene: THREE.Scene): void {
    this.dispose(scene);

    for (const country of countries) {
      const pos = positions.get(country.id);
      if (!pos) continue;

      const canvas = document.createElement('canvas');
      const size = 256;
      canvas.width = size;
      canvas.height = size / 2;

      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const color = new THREE.Color(REGION_COLORS[country.region] ?? 0x888888);
      const hexColor = `#${color.getHexString()}`;

      const flagEmoji = codeToEmoji[country.code.toUpperCase()] ?? '';
      const label = flagEmoji ? `${flagEmoji} ${country.name}` : country.name;

      const fontSize = Math.min(36, Math.max(20, 200 / Math.max(label.length * 0.6, 1)));
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillText(label, size / 2 + 1, size / 4 + 1);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, size / 2, size / 4);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;

      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.set(
        pos.position[0],
        pos.position[1] + pos.scale * 2.5,
        pos.position[2]
      );
      sprite.scale.set(20, 10, 1);

      scene.add(sprite);
      this.labels.set(country.id, sprite);
    }
  }

  updateVisibility(visibleIds: Set<string>): void {
    for (const [id, sprite] of this.labels) {
      sprite.visible = visibleIds.has(id);
    }
  }

  getLabel(countryId: string): THREE.Sprite | undefined {
    return this.labels.get(countryId);
  }

  updateLOD(cameraPosition: THREE.Vector3): void {
    for (const sprite of this.labels.values()) {
      if (!sprite.visible) continue;

      const dist = sprite.position.distanceTo(cameraPosition);

      if (dist > LABEL_SHOW_DISTANCE) {
        sprite.material.opacity = 0;
      } else if (dist > LABEL_SHOW_DISTANCE * 0.7) {
        sprite.material.opacity = Math.max(0, 1 - (dist - LABEL_SHOW_DISTANCE * 0.7) / (LABEL_SHOW_DISTANCE * 0.3));
      } else {
        sprite.material.opacity = 1;
      }
    }
  }

  dispose(scene: THREE.Scene): void {
    for (const sprite of this.labels.values()) {
      scene.remove(sprite);
      if (sprite.material.map) sprite.material.map.dispose();
      sprite.material.dispose();
    }
    this.labels.clear();
  }
}
