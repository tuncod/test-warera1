import * as THREE from 'three';
import type { SceneManager } from '@/renderer/scene';
import { FLY_TO_DURATION, SPHERE_RADIUS } from '@/config';

export class CameraAnimator {
  private isAnimating = false;
  private startTime = 0;
  private startPos = new THREE.Vector3();
  private endPos = new THREE.Vector3();
  private startTarget = new THREE.Vector3();
  private endTarget = new THREE.Vector3();

  constructor(private sceneManager: SceneManager) {}

  flyTo(position: [number, number, number]): void {
    this.isAnimating = true;
    this.startTime = performance.now();

    this.startPos.copy(this.sceneManager.camera.position);

    const target = new THREE.Vector3(position[0], position[1], position[2]);
    const direction = target.clone().normalize();
    this.endPos = target.clone().add(direction.multiplyScalar(SPHERE_RADIUS * 0.6));
    this.endPos.y += 30;

    this.startTarget.set(0, 0, 0);
    this.endTarget.copy(target);
  }

  flyToOrigin(): void {
    this.isAnimating = true;
    this.startTime = performance.now();

    this.startPos.copy(this.sceneManager.camera.position);

    const currentDir = this.sceneManager.camera.position.clone().normalize();
    this.endPos = currentDir.multiplyScalar(SPHERE_RADIUS * 1.5);

    this.startTarget.set(0, 0, 0);
    this.endTarget.set(0, 0, 0);
  }

  update(): boolean {
    if (!this.isAnimating) return false;

    const elapsed = performance.now() - this.startTime;
    const t = Math.min(elapsed / FLY_TO_DURATION, 1);

    const eased = this.easeInOutCubic(t);

    this.sceneManager.camera.position.lerpVectors(this.startPos, this.endPos, eased);
    this.sceneManager.camera.lookAt(
      new THREE.Vector3().lerpVectors(this.startTarget, this.endTarget, eased)
    );

    if (t >= 1) {
      this.isAnimating = false;
      return false;
    }

    return true;
  }

  isActive(): boolean {
    return this.isAnimating;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
