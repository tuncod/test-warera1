import * as THREE from 'three';
import type { NodeManager } from '@/renderer/nodes';
import type { SceneManager } from '@/renderer/scene';

export class RaycasterManager {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private hoveredMesh: THREE.Mesh | null = null;

  constructor(
    private sceneManager: SceneManager,
    private nodeManager: NodeManager
  ) {}

  onMouseMove(clientX: number, clientY: number): THREE.Mesh | null {
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    const meshes: THREE.Mesh[] = [];
    for (const mesh of this.nodeManager.meshesMap.values()) {
      if (mesh.visible) meshes.push(mesh);
    }

    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      this.hoveredMesh = hit;
      return hit;
    }

    this.hoveredMesh = null;
    return null;
  }

  onClick(clientX: number, clientY: number): THREE.Mesh | null {
    return this.onMouseMove(clientX, clientY);
  }

  reset(): void {
    this.hoveredMesh = null;
  }
}
