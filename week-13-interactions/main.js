import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Cubes
const cubes = [];
const cubeCount = 20;

for (let i = 0; i < cubeCount; i++) {
  const width = THREE.MathUtils.randFloat(0.5, 2);
  const height = THREE.MathUtils.randFloat(0.5, 2);
  const depth = THREE.MathUtils.randFloat(0.5, 2);

  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color: Math.random() * 0xffffff,
  });

  const cube = new THREE.Mesh(geometry, material);

  cube.position.set(
    THREE.MathUtils.randFloatSpread(20),
    THREE.MathUtils.randFloatSpread(20),
    THREE.MathUtils.randFloatSpread(20)
  );

  cube.userData = {
    size: { width, height, depth },
    originalColor: cube.material.color.clone(),
  };

  cubes.push(cube);
  scene.add(cube);
}

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedCube = null;

const infoPanel = document.getElementById('info-panel');

// Mouse Click Event
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);

  // Reset previous cube
  if (selectedCube) {
    selectedCube.material.color.copy(selectedCube.userData.originalColor);
    selectedCube.scale.set(1, 1, 1);
  }

  if (intersects.length > 0) {
    selectedCube = intersects[0].object;

    // Highlight cube
    selectedCube.material.color.set(0xffff00);
    selectedCube.scale.set(1.2, 1.2, 1.2);

    const pos = selectedCube.position;
    const size = selectedCube.userData.size;

    infoPanel.innerHTML = `
      <strong>Cube Information</strong><br>
      <strong>Position:</strong><br>
      x: ${pos.x.toFixed(2)}<br>
      y: ${pos.y.toFixed(2)}<br>
      z: ${pos.z.toFixed(2)}<br><br>

      <strong>Size:</strong><br>
      width: ${size.width.toFixed(2)}<br>
      height: ${size.height.toFixed(2)}<br>
      depth: ${size.depth.toFixed(2)}
    `;
  } else {
    selectedCube = null;
    infoPanel.innerHTML = 'No object selected.';
  }
});

// Resize Handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  cubes.forEach(cube => {
    cube.rotation.x += 0.003;
    cube.rotation.y += 0.003;
  });

  renderer.render(scene, camera);
}

animate();
