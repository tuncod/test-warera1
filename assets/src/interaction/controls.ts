import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SceneManager } from '@/renderer/scene';

export class InteractionControls {
  public controls: OrbitControls;
  private autoRotateSpeed = 0.5;

  constructor(sceneManager: SceneManager) {
    this.controls = new OrbitControls(
      sceneManager.camera,
      sceneManager.renderer.domElement
    );

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = this.autoRotateSpeed;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 800;
    this.controls.enablePan = false;
  }

  stopAutoRotation(): void {
    this.controls.autoRotate = false;
  }

  resumeAutoRotation(): void {
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = this.autoRotateSpeed;
  }

  update(): void {
    this.controls.update();
  }

  dispose(): void {
    this.controls.dispose();
  }
}
