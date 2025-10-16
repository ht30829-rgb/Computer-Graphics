import * as THREE from 'three';

export function createCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x0077ff,
    roughness: 0.4,
    metalness: 0.3
  });
  return new THREE.Mesh(geometry, material);
}
