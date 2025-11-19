import * as THREE from "three";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// textures
const textureLoader = new THREE.TextureLoader();


const woodTexture = textureLoader.load("textures/Stylized_Wood_Floor_001_basecolor.png");

const stoneTexture = textureLoader.load("textures/Stylized_Stone_Floor_010_basecolor.png");



const cubeMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  cubeMaterial
);
cube.position.x = -1.3; 
scene.add(cube);



const sphereMaterial = new THREE.MeshBasicMaterial({ map: stoneTexture });
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.7, 32, 32),
  sphereMaterial
);
sphere.position.x = 1.3; 
scene.add(sphere);



function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  sphere.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();