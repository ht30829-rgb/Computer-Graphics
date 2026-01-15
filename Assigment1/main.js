import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// === Scene, Camera, Renderer ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === OrbitControls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Ground ===
// Grass area
const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
const grass = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), grassMaterial);
grass.rotation.x = -Math.PI / 2;
scene.add(grass);

// Road area (gray plane)
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const road1 = new THREE.Mesh(new THREE.PlaneGeometry(30, 4), roadMaterial);
road1.rotation.x = -Math.PI / 2;
road1.position.y = 0.01;
scene.add(road1);

const road2 = new THREE.Mesh(new THREE.PlaneGeometry(4, 30), roadMaterial);
road2.rotation.x = -Math.PI / 2;
road2.position.y = 0.01;
scene.add(road2);

// === Buildings ===
// Building 1: MeshStandardMaterial
const building1Material = new THREE.MeshStandardMaterial({ color: 0xffffff });
const building1 = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), building1Material);
building1.position.set(-6, 1.5, 6);
scene.add(building1);

// Building 2: MeshPhongMaterial
const building2Material = new THREE.MeshPhongMaterial({ color: 0x2196f3, shininess: 100 });
const building2 = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), building2Material);
building2.position.set(6, 1.5, 6);
scene.add(building2);

// Building 3: MeshLambertMaterial
const building3Material = new THREE.MeshLambertMaterial({ color: 0xff5722 });
const building3 = new THREE.Mesh(new THREE.BoxGeometry(6, 2.5, 3), building3Material);
building3.position.set(0, 1.25, -6);
scene.add(building3);

// === Lights ===
// AmbientLight
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// DirectionalLight
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 5);
scene.add(directionalLight);

// === Animation Loop ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// === Handle window resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
