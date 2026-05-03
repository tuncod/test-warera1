import * as THREE from 'three';
import type { Country, AllianceEdge } from '@/types';
import { ALLIANCE_COLOR, WAR_COLOR } from '@/config';

export class EdgeManager {
  private allianceLines: THREE.LineSegments | null = null;
  private warLines: THREE.LineSegments | null = null;

  build(countries: Country[], positions: Map<string, { position: [number, number, number]; scale: number }>, scene: THREE.Scene): AllianceEdge[] {
    this.dispose(scene);

    const edges: AllianceEdge[] = [];
    const alliancePairs = new Set<string>();
    const warPairs = new Set<string>();

    const countryMap = new Map<string, Country>();
    for (const c of countries) {
      countryMap.set(c.id, c);
    }

    for (const country of countries) {
      for (const allyId of country.allies) {
        if (!countryMap.has(allyId)) continue;
        const pair = [country.id, allyId].sort().join('-');
        if (!alliancePairs.has(pair)) {
          alliancePairs.add(pair);
          edges.push({ from: country.id, to: allyId, type: 'alliance' });
        }
      }

      for (const warId of country.warsWith) {
        if (!countryMap.has(warId)) continue;
        const pair = [country.id, warId].sort().join('-');
        if (!warPairs.has(pair) && !alliancePairs.has(pair)) {
          warPairs.add(pair);
          edges.push({ from: country.id, to: warId, type: 'war' });
        }
      }
    }

    const alliancePositions: number[] = [];
    const warPositions: number[] = [];

    for (const edge of edges) {
      const fromPos = positions.get(edge.from);
      const toPos = positions.get(edge.to);
      if (!fromPos || !toPos) continue;

      const coords = [
        fromPos.position[0], fromPos.position[1], fromPos.position[2],
        toPos.position[0], toPos.position[1], toPos.position[2]
      ];

      if (edge.type === 'alliance') {
        alliancePositions.push(...coords);
      } else {
        warPositions.push(...coords);
      }
    }

    if (alliancePositions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(alliancePositions, 3));

      const material = new THREE.LineBasicMaterial({
        color: ALLIANCE_COLOR,
        transparent: true,
        opacity: 0.4
      });

      this.allianceLines = new THREE.LineSegments(geometry, material);
      scene.add(this.allianceLines);
    }

    if (warPositions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(warPositions, 3));

      const material = new THREE.LineDashedMaterial({
        color: WAR_COLOR,
        transparent: true,
        opacity: 0.5,
        dashSize: 4,
        gapSize: 3
      });

      this.warLines = new THREE.LineSegments(geometry, material);
      this.warLines.computeLineDistances();
      scene.add(this.warLines);
    }

    return edges;
  }

  updateVisibility(edges: AllianceEdge[], positions: Map<string, { position: [number, number, number]; scale: number }>, visibleIds: Set<string>, scene: THREE.Scene): void {
    this.dispose(scene);

    const visibleEdges = edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));
    if (visibleEdges.length === 0) return;

    const alliancePositions: number[] = [];
    const warPositions: number[] = [];

    for (const edge of visibleEdges) {
      const fromPos = positions.get(edge.from);
      const toPos = positions.get(edge.to);
      if (!fromPos || !toPos) continue;

      const coords = [
        fromPos.position[0], fromPos.position[1], fromPos.position[2],
        toPos.position[0], toPos.position[1], toPos.position[2]
      ];

      if (edge.type === 'alliance') {
        alliancePositions.push(...coords);
      } else {
        warPositions.push(...coords);
      }
    }

    if (alliancePositions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(alliancePositions, 3));
      const material = new THREE.LineBasicMaterial({
        color: ALLIANCE_COLOR,
        transparent: true,
        opacity: 0.4
      });
      this.allianceLines = new THREE.LineSegments(geometry, material);
      scene.add(this.allianceLines);
    }

    if (warPositions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(warPositions, 3));
      const material = new THREE.LineDashedMaterial({
        color: WAR_COLOR,
        transparent: true,
        opacity: 0.5,
        dashSize: 4,
        gapSize: 3
      });
      this.warLines = new THREE.LineSegments(geometry, material);
      this.warLines.computeLineDistances();
      scene.add(this.warLines);
    }
  }

  animate(time: number): void {
    if (this.allianceLines && this.allianceLines.material) {
      const mat = this.allianceLines.material as THREE.LineBasicMaterial;
      mat.opacity = 0.3 + Math.sin(time * 0.002) * 0.15;
    }
  }

  updateFromPositions(countries: Country[], positions: Map<string, { position: [number, number, number]; scale: number }>, scene: THREE.Scene, visibleIds?: Set<string>): void {
    this.dispose(scene);

    const edges: AllianceEdge[] = [];
    const alliancePairs = new Set<string>();
    const warPairs = new Set<string>();

    const countryMap = new Map<string, Country>();
    for (const c of countries) {
      countryMap.set(c.id, c);
    }

    for (const country of countries) {
      for (const allyId of country.allies) {
        if (!countryMap.has(allyId)) continue;
        const pair = [country.id, allyId].sort().join('-');
        if (!alliancePairs.has(pair)) {
          alliancePairs.add(pair);
          edges.push({ from: country.id, to: allyId, type: 'alliance' });
        }
      }

      for (const warId of country.warsWith) {
        if (!countryMap.has(warId)) continue;
        const pair = [country.id, warId].sort().join('-');
        if (!warPairs.has(pair) && !alliancePairs.has(pair)) {
          warPairs.add(pair);
          edges.push({ from: country.id, to: warId, type: 'war' });
        }
      }
    }

    const filteredEdges = visibleIds
      ? edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to))
      : edges;

    const alliancePositions: number[] = [];
    const warPositions: number[] = [];

    for (const edge of filteredEdges) {
      const fromPos = positions.get(edge.from);
      const toPos = positions.get(edge.to);
      if (!fromPos || !toPos) continue;

      const coords = [
        fromPos.position[0], fromPos.position[1], fromPos.position[2],
        toPos.position[0], toPos.position[1], toPos.position[2]
      ];

      if (edge.type === 'alliance') {
        alliancePositions.push(...coords);
      } else {
        warPositions.push(...coords);
      }
    }

    if (alliancePositions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(alliancePositions, 3));
      const material = new THREE.LineBasicMaterial({
        color: ALLIANCE_COLOR,
        transparent: true,
        opacity: 0.4
      });
      this.allianceLines = new THREE.LineSegments(geometry, material);
      scene.add(this.allianceLines);
    }

    if (warPositions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(warPositions, 3));
      const material = new THREE.LineDashedMaterial({
        color: WAR_COLOR,
        transparent: true,
        opacity: 0.5,
        dashSize: 4,
        gapSize: 3
      });
      this.warLines = new THREE.LineSegments(geometry, material);
      this.warLines.computeLineDistances();
      scene.add(this.warLines);
    }
  }

  dispose(scene: THREE.Scene): void {
    if (this.allianceLines) {
      scene.remove(this.allianceLines);
      this.allianceLines.geometry.dispose();
      (this.allianceLines.material as THREE.Material).dispose();
      this.allianceLines = null;
    }
    if (this.warLines) {
      scene.remove(this.warLines);
      this.warLines.geometry.dispose();
      (this.warLines.material as THREE.Material).dispose();
      this.warLines = null;
    }
  }
}
