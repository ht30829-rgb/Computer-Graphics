<<<<<<< HEAD
import * as THREE from 'three';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';

const scene = new THREE.Scene(); // scene constructor
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth/window.innerHeight, 0.1, 1000
);

camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({color:0xFF0000});
const cubeMash = new THREE.Mesh(geometry, material);
scene.add(cubeMash);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(2,2,5);
scene.add(light);

// moving objects x, y and z


//console.log(cubeMash.position.distanceTo(camera.position))

//cubeMash.position.set(0.7, -0.6, 1);

//axes hepler

const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

//scaling objects
//cubeMash.scale.x = 2
//cubeMash.scale.y = 0.2
//cubeMash.scale.z = 0.5
//cubeMash.position.x = 0.7
//cubeMash.position.y = 0.2
//cubeMash.position.z = 0.5
//cubeMash.rotation.x = Math.PI * 0.25
//cubeMash.rotation.y = Math.PI * 0.25

// scene group
const group = new THREE.Group();
group.scale.y = 2
group.rotation.y = 0.2
scene.add(group);

const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({color:0xff0000})

);
cube1.position.x = -1.5
group.add(cube1)

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({color:0xff0000})

);
cube2.position.x = 2
group.add(cube2)

function animate(){
    requestAnimationFrame(animate);
    cubeMash.rotation.x +=0.01;
    renderer.render (scene, camera);
}

animate();
=======
import * as THREE from 'three'

const scene = new THREE.Scene(); //scene constr
scene.background = new THREE.Color(0x202020);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 3;
const renderer = new THREE.WebGL3DRender({antialias:true});
renderer.setSize(window.innerWidth/innerHeight);
document.body.appendChild(renderer.domElement);
const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshStandardMaterial({color:0x00ff88});
const cubeMesh = new THREE.Mesh(geometry, material);
scene.add(cubeMesh);
const light = new THREE.DirectionalLight(0xfffff,1);
light.position.set(2,2,5);
scene.add(light);
function animate() {
    requestAnimationFrame(animate);
    cubeMesh.rotation.x +=0.01;
    renderer.render(scene,camera);
}
animate();
>>>>>>> b64f82eb033d0bf5e16a7b29019911f60cb58ce1
