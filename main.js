<<<<<<< HEAD
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* ======================
   Scene, Camera, Renderer
====================== */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(15, 15, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

/* ======================
   OrbitControls
====================== */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* ======================
   Ground
====================== */
// Grass
const grass = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshLambertMaterial({ color: 0x4caf50 })
);
grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
scene.add(grass);

// Roads
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const road1 = new THREE.Mesh(new THREE.PlaneGeometry(30, 4), roadMaterial);
road1.rotation.x = -Math.PI / 2;
road1.position.y = 0.01;
scene.add(road1);

const road2 = new THREE.Mesh(new THREE.PlaneGeometry(4, 30), roadMaterial);
road2.rotation.x = -Math.PI / 2;
road2.position.y = 0.01;
scene.add(road2);

/* ======================
   Buildings
====================== */
const buildings = [];

// Building 1
const building1 = new THREE.Mesh(
  new THREE.BoxGeometry(4, 3, 4),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
building1.position.set(-6, 1.5, 6);
building1.castShadow = true;
building1.receiveShadow = true;
scene.add(building1);
buildings.push(building1);

// Building 2
const building2 = new THREE.Mesh(
  new THREE.BoxGeometry(4, 3, 4),
  new THREE.MeshPhongMaterial({ color: 0x2196f3, shininess: 100 })
);
building2.position.set(6, 1.5, 6);
building2.castShadow = true;
building2.receiveShadow = true;
scene.add(building2);
buildings.push(building2);

// Building 3
const building3 = new THREE.Mesh(
  new THREE.BoxGeometry(6, 2.5, 3),
  new THREE.MeshLambertMaterial({ color: 0xff5722 })
);
building3.position.set(0, 1.25, -6);
building3.castShadow = true;
building3.receiveShadow = true;
scene.add(building3);
buildings.push(building3);

/* ======================
   Lights
====================== */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

/* ======================
   Load Bee.glb
====================== */
let beeModel;
const gltfLoader = new GLTFLoader();

gltfLoader.load(
  'models/Bee.glb',
  (gltf) => {
    beeModel = gltf.scene;

    // Small size and initial position
    beeModel.scale.set(0.3, 0.3, 0.3);
    beeModel.position.set(0, 0.5, 0); // height above grass

    // Enable shadows
    beeModel.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    scene.add(beeModel);
    console.log('Bee.glb loaded successfully!');
  },
  undefined,
  (err) => console.error('Error loading GLB:', err)
);

/* ======================
   Interaction: Click Buildings
====================== */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const clickable = [...buildings];
  if (beeModel) beeModel.traverse(c => c.isMesh && clickable.push(c));

  const hits = raycaster.intersectObjects(clickable);
  if (hits.length) hits[0].object.material.color.set(Math.random() * 0xffffff);
});

/* ======================
   Move Bee with keys X, Y, Z
====================== */
let beeTarget = null;

window.addEventListener('keydown', (event) => {
  if (!beeModel) return;

  const key = event.key.toLowerCase();

  if (key === 'x') {
    beeTarget = new THREE.Vector3(5, beeModel.position.y, beeModel.position.z);
  } else if (key === 'y') {
    beeTarget = new THREE.Vector3(beeModel.position.x, 2, beeModel.position.z); // move up
  } else if (key === 'z') {
    beeTarget = new THREE.Vector3(beeModel.position.x, beeModel.position.y, -5); // move forward/back
  }
});

/* ======================
   Animation Loop
====================== */
let angle = 0;
function animate() {
  requestAnimationFrame(animate);

  // Rotate light for dynamic shadows
  angle += 0.005;
  directionalLight.position.x = Math.sin(angle) * 20;
  directionalLight.position.z = Math.cos(angle) * 20;

  // Rotate Bee continuously
  if (beeModel) beeModel.rotation.y += 0.01;

  // Smooth move Bee to target
  if (beeModel && beeTarget) {
    beeModel.position.lerp(beeTarget, 0.05);
    if (beeModel.position.distanceTo(beeTarget) < 0.01) {
      beeModel.position.copy(beeTarget);
      beeTarget = null; // stop moving
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

/* ======================
   Handle Window Resize
====================== */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
=======
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

const gui = new GUI()
const scene = new THREE.Scene()

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3)
directionalLight.castShadow = true
directionalLight.position.set(2, 2, -1)
gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001)
scene.add(directionalLight)

const spotLight = new THREE.SpotLight(0xffffff, 2, 10, Math.PI * 0.3)
spotLight.castShadow = true
spotLight.position.set(0, 2, 2)
scene.add(spotLight)
scene.add(spotLight.target)

const pointLight = new THREE.PointLight(0xffffff, 2)
pointLight.castShadow = true
pointLight.position.set(-1, 1, 0)
scene.add(pointLight)

// Material
const material = new THREE.MeshStandardMaterial({ roughness: 0.7 })
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material)
sphere.castShadow = true

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material)
plane.receiveShadow = true
plane.rotation.x = -Math.PI * 0.5
plane.position.y = -0.5

scene.add(sphere, plane)

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 5)
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.shadowMap.enabled = true
renderer.setSize(sizes.width, sizes.height)
document.body.appendChild(renderer.domElement)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// Resize
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
})

// Animation
const clock = new THREE.Clock()

function animate() {
  const elapsedTime = clock.getElapsedTime()
  sphere.position.x = Math.cos(elapsedTime) * 1.5
  sphere.position.z = Math.sin(elapsedTime) * 1.5
  sphere.position.y = Math.abs(Math.sin(elapsedTime * 3))

  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()
>>>>>>> f5f1c0941585b2a74e09a97a7709c50c3a364a48
