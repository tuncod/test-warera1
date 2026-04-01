import * as THREE from 'three';
import { PARTICLE_COUNT, PARTICLE_SPREAD } from '@/config';

export class ParticleManager {
  private points: THREE.Points | null = null;
  private velocities: Float32Array;

  constructor() {
    this.velocities = new Float32Array(PARTICLE_COUNT * 3);
  }

  build(scene: THREE.Scene): void {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * PARTICLE_SPREAD * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * PARTICLE_SPREAD * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * PARTICLE_SPREAD * 2;

      sizes[i] = Math.random() * 2 + 0.5;

      this.velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0x4488ff,
      size: 1.5,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geometry, material);
    scene.add(this.points);
  }

  animate(): void {
    if (!this.points) return;

    const positions = this.points.geometry.attributes.position.array as Float32Array;
    const halfSpread = PARTICLE_SPREAD;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] += this.velocities[i * 3];
      positions[i * 3 + 1] += this.velocities[i * 3 + 1];
      positions[i * 3 + 2] += this.velocities[i * 3 + 2];

      for (let j = 0; j < 3; j++) {
        const idx = i * 3 + j;
        if (positions[idx] > halfSpread) positions[idx] = -halfSpread;
        if (positions[idx] < -halfSpread) positions[idx] = halfSpread;
      }
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  dispose(scene: THREE.Scene): void {
    if (this.points) {
      scene.remove(this.points);
      this.points.geometry.dispose();
      (this.points.material as THREE.Material).dispose();
      this.points = null;
    }
  }
}
