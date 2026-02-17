// script.js (ES module)
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// ----------------------------------
// Сцена, камера и renderer
// ----------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b132b);
scene.fog = new THREE.Fog(0x0b132b, 20, 90);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(12, 8, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
renderer.outputColorSpace = THREE.SRGBColorSpace;
// Loaders за различни формати
const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();
const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();

// ----------------------------------
// Контроли на камерата
// ----------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;

// ----------------------------------
// Копчиња за камерата (zoom/rotate)
// ----------------------------------
function zoomCamera(amount) {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  camera.position.addScaledVector(dir, amount);
}

function rotateCamera(angle) {
  const offset = camera.position.clone().sub(controls.target);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
  camera.position.copy(controls.target.clone().add(offset));
}

// Button events
document.getElementById('zoomIn').onclick = () => zoomCamera(-1.5);
document.getElementById('zoomOut').onclick = () => zoomCamera(1.5);
document.getElementById('rotateLeft').onclick = () => rotateCamera(0.2);
document.getElementById('rotateRight').onclick = () => rotateCamera(-0.2);

// ----------------------------------
// Светла
// ----------------------------------
const hemi = new THREE.HemisphereLight(0xffffee, 0x444466, 0.25);
hemi.position.set(0, 20, 0);
scene.add(hemi);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
dirLight.position.set(12, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -30;
dirLight.shadow.camera.right = 30;
dirLight.shadow.camera.top = 30;
dirLight.shadow.camera.bottom = -30;
scene.add(dirLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// ----------------------------------
// Weather system
// ----------------------------------
let weather = "clear"; // може да биде "clear", "rain", "storm"
let rain;
let rainGeo, rainMat;
let lightning;

// ----------------------------------
// Трева (ground) со текстура
// ----------------------------------
const textureLoader = new THREE.TextureLoader();

const grassTex = textureLoader.load('textures/Grass008_1K-JPG/Grass008_1K-JPG_Color.jpg');
grassTex.wrapS = THREE.RepeatWrapping;
grassTex.wrapT = THREE.RepeatWrapping;
grassTex.repeat.set(25, 25);
const nightSkyTexture = textureLoader.load('textures/NightSkyHDRI001_1K/NightSkyHDRI001_1K_TONEMAPPED.jpg');
nightSkyTexture.colorSpace = THREE.SRGBColorSpace;
const moonTexture = textureLoader.load('textures/Moon_texture/Metal016_1K-JPG_Color.jpg');
moonTexture.colorSpace = THREE.SRGBColorSpace;
grassTex.colorSpace = THREE.SRGBColorSpace;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({
    map: grassTex,
    roughness: 1.0
  })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ----------------------------------
// Ночно небо (stars sphere)
// ----------------------------------
const skyGeo = new THREE.SphereGeometry(100, 32, 32);

const skyMat = new THREE.MeshBasicMaterial({
  map: nightSkyTexture,
  side: THREE.BackSide,
  transparent: true,
  opacity: 1
});

const nightSky = new THREE.Mesh(skyGeo, skyMat);
scene.add(nightSky);

// ----------------------------------
// Патека
// ----------------------------------
const pathShape = new THREE.Shape();
pathShape.absellipse(0, 0, 12, 8, 0, Math.PI * 2, false, 0);

const hole = new THREE.Path();
//hole.absellipse(0, 0, 6, 3.5, 0, Math.PI * 2, false);
hole.absellipse(0, 0, 4, 2.5, 0, Math.PI * 2, false, 0);
pathShape.holes.push(hole);

const pathGeo = new THREE.ShapeGeometry(pathShape);
// -----------------------
// Textured Path
// -----------------------

const pathColor = textureLoader.load(
  'public/path/Ground069_1K-JPG/Ground069_1K-JPG_Color.jpg'
);
const pathNormal = textureLoader.load(
  'public/path/Ground069_1K-JPG/Ground069_1K-JPG_Color.jpg'
);
const pathRoughness = textureLoader.load(
  'public/path/Ground069_1K-JPG/Ground069_1K-JPG_Color.jpg'
);

// Correct color space
pathColor.colorSpace = THREE.SRGBColorSpace;

// Repeat textures so they don’t stretch
[pathColor, pathNormal, pathRoughness].forEach(tex => {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 4);
});

const pathMaterial = new THREE.MeshStandardMaterial({
  map: pathColor,
  normalMap: pathNormal,
  roughnessMap: pathRoughness,
  roughness: 1.0
});

const path = new THREE.Mesh(pathGeo, pathMaterial);
path.rotation.x = -Math.PI / 2;
path.position.y = 0.01;
path.receiveShadow = true;
scene.add(path);

// ----------------------------------
// Waypoints и obstacles
// ----------------------------------
const pathPoints = [
    new THREE.Vector3(0, 0, -7),
    new THREE.Vector3(10, 0, -4),
    new THREE.Vector3(12, 0, 0),
    new THREE.Vector3(10, 0, 4),
    new THREE.Vector3(0, 0, 7),
    new THREE.Vector3(-10, 0, 4),
    new THREE.Vector3(-12, 0, 0),
    new THREE.Vector3(-10, 0, -4)
];

const obstacles = [

    // клупи
    new THREE.Vector3(7, 0, -5),
    new THREE.Vector3(-2, 0, -5.5),
    new THREE.Vector3(-8.5, 0, -2),
    new THREE.Vector3(10, 0, 3.5),
    new THREE.Vector3(-5, 0, 6.2),
    new THREE.Vector3(5, 0, 6.5),
    new THREE.Vector3(10, 0, -2.5),

    // лампи
    new THREE.Vector3(8, 0, 6),
    new THREE.Vector3(12, 0, 0),
    new THREE.Vector3(8, 0, -6),
    new THREE.Vector3(-8, 0, 6),
    new THREE.Vector3(-12, 0, 0),
    new THREE.Vector3(-8, 0, -6),
    new THREE.Vector3(0, 0, -10),
];

// ----------------------------------
// Лампи
// ----------------------------------
let lampPositions = [
  [8, 6], [12, 0], [8, -6],
  [-8, 6], [-12, 0], [-8, -6],
  [0, -10]
];
lampPositions.forEach(p => addLamp(p[0], p[1]));

// ----------------------------------
// Ден / ноќ функции
// ----------------------------------
window.setDay = () => {
  isDay = true;
  nightSky.visible = false;  // дневно не се гледа night sky
};

window.setNight = () => {
  isDay = false;
  nightSky.visible = true;   // веднаш се активира night sky
  nightSky.material.opacity = 1;  // целосно темно
};

// -----------------------
// Дрвја и јавори
// -----------------------
function createTree(x, z, height = 3) {
  const g = new THREE.Group();
  const trunkHeight = Math.max(0.8, height * 0.5);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.25, trunkHeight, 10),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
  );
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  g.add(trunk);

  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.7 });

  const leaf1 = new THREE.Mesh(
    new THREE.ConeGeometry(height * 0.6, height * 0.8, 8),
    leavesMat
  );
  leaf1.position.y = trunkHeight + height * 0.4;
  leaf1.castShadow = true;
  g.add(leaf1);

  const leaf2 = new THREE.Mesh(
    new THREE.ConeGeometry(height * 0.45, height * 0.6, 6),
    leavesMat
  );
  leaf2.position.y = trunkHeight + height * 0.6;
  leaf2.castShadow = true;
  g.add(leaf2);

  g.position.set(x, 0, z);
  return g;
}
// Поставување дрвја
const treePositions = [
  [-22, 20], [-16, 18], [-10, 22], [-6, 16], [6, 18],
  [10, 22], [16, 16], [20, 20], [-18, -12], [-12, -18],
  [-6, -14], [6, -14], [12, -18], [18, -12], [-20, 8],
  [-15, 10], [-10, 6], [10, 6], [15, 10], [20, 8]
];
const trees = [];

treePositions.forEach(pos => {
  const tree = createTree(pos[0], pos[1], 1.5 + Math.random() * 2.5);
  scene.add(tree);
  trees.push(tree);
});

// ----------------------------------
// Јапонски јавор
// ----------------------------------
function addJapaneseMaple(x, z, scale = 1) {
  gltfLoader.load('/Japanese Maple.glb', gltf => {
    const maple = gltf.scene;
    maple.position.set(x, 0, z);
    maple.scale.set(scale, scale, scale);
    maple.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) {
          o.material.roughness = 0.8;
          o.material.metalness = 0.1;
          o.material.color = new THREE.Color(0x8b0000);
        }
      }
    });
    scene.add(maple);
  });
}

addJapaneseMaple(-18, 18, 4.0);
addJapaneseMaple(18, 15, 4.2);
addJapaneseMaple(-12, -15, 4.0);
addJapaneseMaple(15, -15, 4.3);
addJapaneseMaple(8, 20, 4.1);

// -----------------------
// Клупи
// -----------------------
function addBench(x, z, rot = 0) {
  const bench = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3b2b20, roughness: 0.8 });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.45), woodMat);
  seat.position.y = 0.45;
  bench.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 0.12), woodMat);
  back.position.set(0, 0.7, -0.18);
  bench.add(back);

  const legPositions = [
    [-0.9, 0.225, -0.18], [-0.9, 0.225, 0.18],
    [0.9, 0.225, -0.18], [0.9, 0.225, 0.18]
  ];

  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), legMat);
    leg.position.set(...pos);
    bench.add(leg);
  });

  bench.position.set(x, 0, z);
  bench.rotation.y = rot;

  bench.traverse(m => { m.castShadow = true; m.receiveShadow = true; });
  scene.add(bench);
}

addBench(7, -5, 0);
addBench(-2, -5.5, 0);
addBench(-8.5, -2, Math.PI * 0.4);
addBench(10, 3.5, Math.PI * -0.7);
addBench(-5, 6.2, -Math.PI);
addBench(5, 6.5, Math.PI * -0.9);
addBench(10, -2.5, Math.PI * -0.3);

// -----------------------
// Цвеќиња
// -----------------------
function addFlowerPatch(position, scale) {
  gltfLoader.load('/Purple_flower_patch.glb', gltf => {
    const patch = gltf.scene;
    patch.scale.set(scale, scale, scale);
    patch.position.set(position.x, 0.01, position.z);

    patch.traverse(o => {
      if (o.isMesh) {
        o.material = new THREE.MeshStandardMaterial({
          color: 0x9b59b6,
          roughness: 0.6,
          metalness: 0.1
        });
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    scene.add(patch);
  });
}

const flowerPositions = [
  [-25, 20], [-18, 18], [-10, 25], [-5, 18], [5, 20],
  [10, 25], [18, 18], [22, 20], [-20, -10], [-12, -14],
  [-5, -12], [5, -12], [12, -14], [20, -10], [-15, 5],
  [-8, 7], [8, 7], [15, 5]
];
flowerPositions.forEach(pos => {
  addFlowerPatch(new THREE.Vector3(pos[0], 0, pos[1]), 4 + Math.random() * 3);
});

// -----------------------
// Седнати луѓе
// -----------------------
const allPeople = [];
function addSittingPerson(url, pos, rot) {
  gltfLoader.load(url, gltf => {
    const p = gltf.scene;
    const box = new THREE.Box3().setFromObject(p);
    p.position.set(pos.x, 0.45 - box.min.y, pos.z);
    p.rotation.y = rot;
    p.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

    scene.add(p);
    allPeople.push(p);   // store for weather control
  });
}

addSittingPerson('/public/Sitting Female 2.glb', { x: 7, z: -5 }, 0);
addSittingPerson('/public/Sitting Female 2.glb', { x: 5, z: 6.5 }, Math.PI * -0.9);
addSittingPerson('/public/Sitting Male 2.glb', { x: -2, z: -5.5 }, 0);
addSittingPerson('/public/Sitting Male 2.glb', { x: 10, z: 3.5 }, Math.PI * -0.7);
addSittingPerson('/public/Sitting Male 2.glb', { x: -8.5, z: -2 }, Math.PI * 0.4);

// -----------------------
// Луѓе што пешачат
// -----------------------
const mixers = [];
const animatedPeople = [];

function addWalkingFBX(path, radius = 6, speed = 0.2, startAngle = 0) {

    fbxLoader.load(path, (object) => {

        object.scale.set(0.01, 0.01, 0.01);

        object.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.frustumCulled = false;
            }
        });

        // create mixer
        const mixer = new THREE.AnimationMixer(object);

        // IMPORTANT FOR MIXAMO
        const clips = object.animations;

        if (clips && clips.length > 0) {

            const clip = THREE.AnimationClip.findByName(clips, clips[0].name);

            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat);
            action.clampWhenFinished = false;
            action.play();

        } else {
            console.log("NO ANIMATION FOUND IN:", path);
        }

        mixers.push(mixer);

       object.userData = {
    speed: 2 + Math.random(),
    currentPoint: Math.floor(Math.random() * pathPoints.length),
    velocity: new THREE.Vector3()
};
        scene.add(object);
        animatedPeople.push(object);
        allPeople.push(object);
    });
}
// two adults walk inside the path
addWalkingFBX('/walking_male.fbx', 4, 0.25, Math.PI);
addWalkingFBX('/walking_female.fbx', 4, 0.28, Math.PI / 2);

// -----------------------
// Function to add a talking woman person on a given position
// -----------------------
function addTalkingPerson(fbxPath, pos, targetPos) {
    fbxLoader.load(fbxPath, person => {
        person.scale.set(0.013, 0.013, 0.013); // иста големина за сите
        person.position.copy(pos);
        
        // Свртена кон targetPos ако е зададен
        if (targetPos) {
            const dir = new THREE.Vector3().subVectors(targetPos, pos);
            person.rotation.y = Math.atan2(dir.x, dir.z);
        }

        person.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });

        scene.add(person);
        allPeople.push(person);

        const mixer = new THREE.AnimationMixer(person);
        if (person.animations && person.animations.length > 0) {
            const clip = person.animations[0];
            const action = mixer.clipAction(clip);
            action.play();
        }
        mixers.push(mixer);
    });
}

// -----------------------
// Laying Dog
// -----------------------
const allDogs = [];
function addDog(x, z, scale = 1, rotation = 0) {
  gltfLoader.load('/Shiba Inu dog - laying.glb', gltf => {
    const dog = gltf.scene;

    dog.position.set(x, 0, z);
    dog.rotation.y = rotation;
    dog.scale.set(scale, scale, scale);

    dog.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    scene.add(dog);
    allDogs.push(dog);   // store for weather control
  });
}
addDog(2, 1, 1.2, Math.PI * 0.4);
addDog(-2, 1, 1.2, Math.PI * 0.9);

// -----------------------
// Fountain
// -----------------------
mtlLoader.load('/Blank.mtl', materials => {
  materials.preload();
  objLoader.setMaterials(materials).load('/14863_large_basin_water_fountain_v2.obj', fountain => {
    fountain.position.set(0, 0, 0);
    fountain.scale.set(0.012, 0.012, 0.012);
    fountain.rotation.x = -Math.PI / 2;
    fountain.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(fountain);
  });
});
// -------------------------------------------
// Talking couple further from the fountain
// -------------------------------------------
// Позиции на близина
const talkPosMan = new THREE.Vector3(-1.2, 0, 5);
const talkPosWoman = new THREE.Vector3(1.2, 0, 5);

addTalkingPerson('/public/Talking_Woman.fbx', talkPosWoman, talkPosMan);


fbxLoader.load('/public/Talking_Man.fbx', man => {

    // Големина на мажот
    man.scale.set(0.0058, 0.0058, 0.0058);


    man.position.copy(talkPosMan);

    // Ротација кон жената
    const dir = new THREE.Vector3().subVectors(talkPosWoman, talkPosMan);
    man.rotation.y = Math.atan2(dir.x, dir.z);

    man.traverse(o => {
        if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
        }
    });

    scene.add(man);
    allPeople.push(man);

    const mixer = new THREE.AnimationMixer(man);
    if (man.animations && man.animations.length > 0) {
        const action = mixer.clipAction(man.animations[0]);
        action.play();
    }
    mixers.push(mixer);
});

// -----------------------
// River
// -----------------------
const riverGeo = new THREE.PlaneGeometry(80, 4, 64, 8); // more segments for wave
const riverMat = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x1e90ff) },
    },
    vertexShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec3 pos = position;
            pos.z += sin(pos.x * 0.5 + time * 1.5) * 0.1;
            pos.z += cos(pos.y * 0.3 + time * 1.7) * 0.08;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        varying vec2 vUv;
        void main() {
            gl_FragColor = vec4(color, 1.0);
        }
    `,
    side: THREE.DoubleSide
});
const river = new THREE.Mesh(riverGeo, riverMat);
river.rotation.x = -Math.PI / 2;
river.position.set(0, 0.02, -25);
scene.add(river);

// -----------------------
// Children Swing Set
// -----------------------
mtlLoader.load('/10549_ChildrenSwingSet_v1-LoD2.mtl', materials => {
  materials.preload();
  objLoader.setMaterials(materials).load('/10549_ChildrenSwingSet_v1-LoD2.obj', swing => {
    swing.position.set(0, 0.05, 10);
    swing.scale.set(0.007, 0.007, 0.007);
    swing.rotation.x = -Math.PI / 2;
    swing.traverse(o => {
      if (o.isMesh) {
        o.material = new THREE.MeshStandardMaterial({ color: 0xf4a261, roughness: 0.5, metalness: 0.2 });
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    scene.add(swing);
  });
});
 
// SEESAW (клацкалка)
fbxLoader.load('/public/seesaw.fbx', (seesaw) => {

    seesaw.scale.set(0.015, 0.015, 0.015); // зголемена
    seesaw.position.set(-8, 0.05, 10); // повеќе лево
    seesaw.rotation.y = Math.PI * 0.2;

    seesaw.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    scene.add(seesaw);
    playgroundObstacles.push(seesaw); // за луѓе да ја заобиколуваат
});
let swingPivot; // додади горе кај другите променливи
// SWING (нишалка)
fbxLoader.load('/public/swing.fbx', (extraSwing) => {
    // големина
    extraSwing.scale.set(0.008, 0.008, 0.008);

    // Позиција: малку повисоко и малку поблиску до бандерата
    extraSwing.position.set(16.5, 2.5, 5); 
    extraSwing.rotation.y = 0;

    extraSwing.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    scene.add(extraSwing);
    playgroundObstacles.push(extraSwing); // за луѓе да ја заобиколуваат
});

  fbxLoader.load('/public/Kneeling_Down_Child.fbx', child => { 
    child.scale.set(0.01, 0.01, 0.01);

    child.position.set(16.2, 0, 5);
    child.rotation.y = -Math.PI / 2;

    child.traverse(o => {
        if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
        }
    });

    scene.add(child);
    allPeople.push(child);

    // ANIMATION MIXER
    const mixer = new THREE.AnimationMixer(child);
    if (child.animations && child.animations.length > 0) {
        const clip = THREE.AnimationClip.findByName(child.animations, child.animations[0].name);
        const action = mixer.clipAction(clip);
        action.play();
    }
    mixers.push(mixer); // за animate loop
});
// -----------------------
// Street Lamp
// -----------------------
function addLamp(x, z) {
  const lamp = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 4, 12),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );
  pole.position.y = 2;
  pole.castShadow = true;
  lamp.add(pole);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshStandardMaterial({ emissive: 0xffeeaa, emissiveIntensity: 1, color: 0xfff1c1 })
  );
  bulb.position.y = 4.1;
  lamp.add(bulb);

  const light = new THREE.PointLight(0xfff1c1, 1.2, 15, 2);
  light.position.y = 4.1;
  light.castShadow = true;
  lamp.add(light);

  lamp.position.set(x, 0, z);
  scene.add(lamp);
}

//Sun
let sun; 
function addSun() {
    gltfLoader.load('public/Sun.glb', gltf => {
        sun = gltf.scene;
        sun.position.set(-20, 10, -10);
        sun.scale.set(20, 20, 15);
        sun.traverse(o => {
            if (o.isMesh && o.material) {
                o.material.emissive = new THREE.Color(0xffdd88);
                o.material.emissiveIntensity = 1.5;
            }
        });
        sun.visible = true;
        scene.add(sun);
    });
}

addSun();

//Moon
let moon;
let isDay = true;
let dayTransition = 1;

function addMoon() {
    gltfLoader.load('public/Moon.glb', gltf => {
        moon = gltf.scene;
        moon.position.set(-10, 15, -35);
        moon.scale.set(5, 5, 5);
        moon.traverse(o => {
            if (o.isMesh) {
                o.material = new THREE.MeshStandardMaterial({
                    map: moonTexture,
                    emissive: new THREE.Color(0x8888aa),
                    emissiveIntensity: 0.4,
                    roughness: 1
                });
                o.castShadow = false;
                o.receiveShadow = false;
            }
        });
        scene.add(moon);
    });
}
addMoon();

function createRain() {
  rainGeo = new THREE.BufferGeometry();
  const rainCount = 4000;

  const positions = new Float32Array(rainCount * 3);

  for (let i = 0; i < rainCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = Math.random() * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
  }

  rainGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  rainMat = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.08,
    transparent: true,
    opacity: 0.7
  });

  rain = new THREE.Points(rainGeo, rainMat);
  rain.visible = false;
  scene.add(rain);
}

createRain();
lightning = new THREE.PointLight(0xffffff, 0, 200);
lightning.position.set(0, 30, 0);
scene.add(lightning);

window.setClear = () => {
  weather = "clear";
};

window.setRain = () => {
  weather = "rain";
};

window.setStorm = () => {
  weather = "storm";
};

// -----------------------
// Animate Loop
// -----------------------
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

   // -----------------------
    // DAY / NIGHT TRANSITION
    // -----------------------
    const target = isDay ? 1 : 0;
    dayTransition += (target - dayTransition) * 0.02;

    const nightColor = new THREE.Color(0x000814);
    const dayColor = new THREE.Color(0x87ceeb);
    const stormColor = new THREE.Color(0x2a2f38);

    let sky;
    if (weather === "storm") {
    scene.background.set(0x2a2f38);
    scene.fog.color.set(0x2a2f38);
} else if (isDay) {
    const dayColor = new THREE.Color(0x87ceeb);
    scene.background.copy(dayColor);
    scene.fog.color.copy(dayColor);
} else {
    // night
    scene.background.set(0x000814); // целосно темно небо
    scene.fog.color.set(0x000814);

    if (nightSky) {
        nightSky.visible = true;
        nightSky.material.opacity = 1;
    }
}

    hemi.intensity = (weather === "storm") 
    ? 0.1 
    : 0.6 * dayTransition;

dirLight.intensity = (weather === "storm") 
    ? 0.15 
    : 1.2 * dayTransition;

ambient.intensity = 0.4 * dayTransition;

    
if (sun) sun.visible = isDay && weather !== "storm";

if (moon) moon.visible = !isDay && weather !== "storm";

    // -----------------------
    // PEOPLE VISIBILITY
    // -----------------------
    const charactersVisible = (weather === "clear");
    allPeople.forEach(p => p.visible = charactersVisible);
    allDogs.forEach(d => d.visible = charactersVisible);

    // -----------------------
    // TREE WIND
    // -----------------------
    trees.forEach((tree, i) => {
        if (weather === "storm") {
            tree.rotation.z = Math.sin(time * 2 + i) * 0.05;
            tree.rotation.x = Math.cos(time * 1.5 + i) * 0.03;
        } else {
            tree.rotation.z *= 0.9;
            tree.rotation.x *= 0.9;
        }
    });

    // -----------------------
    // WALKING PEOPLE (PATH FOLLOWING + OBSTACLE AVOIDANCE)
    // -----------------------
    animatedPeople.forEach(p => {

    const target = pathPoints[p.userData.currentPoint];

    // Direction to waypoint
    const desired = new THREE.Vector3()
        .subVectors(target, p.position)
        .normalize();

    // ---- AVOIDANCE FORCE ----
    const avoidForce = new THREE.Vector3();

    const allObstacles = [...obstacles];

    // add trees
    trees.forEach(tree => {
        const treePos = new THREE.Vector3().setFromMatrixPosition(tree.matrixWorld);
        allObstacles.push(treePos);
    });

    // add fountain center
    allObstacles.push(new THREE.Vector3(0, 0, 0));

    allObstacles.forEach(obs => {
        const dist = p.position.distanceTo(obs);
        const safeRadius = 2.8;

        if (dist < safeRadius) {
            const pushDir = new THREE.Vector3()
                .subVectors(p.position, obs)
                .normalize();

            const strength = (safeRadius - dist) / safeRadius;
            avoidForce.add(pushDir.multiplyScalar(strength * 1.5));
        }
    });

    // Combine movement
    const moveDir = desired.add(avoidForce).normalize();

    // Smooth velocity
    p.userData.velocity.lerp(moveDir, 0.08);

    // Move
    p.position.addScaledVector(
        p.userData.velocity,
        p.userData.speed * delta
    );

    // Smooth rotation
    const angle = Math.atan2(
        p.userData.velocity.x,
        p.userData.velocity.z
    );

    p.rotation.y += (angle - p.rotation.y) * 0.15;

    // Change waypoint
    if (p.position.distanceTo(target) < 1.2) {
        p.userData.currentPoint =
            (p.userData.currentPoint + 1) % pathPoints.length;
    }
});
    // -----------------------
    // ANIMATION MIXERS
    // -----------------------
    mixers.forEach(mixer => mixer.update(delta));

    // -----------------------
    // WEATHER EFFECTS
    // -----------------------
    if (weather === "clear") {
        scene.fog.near = 20;
        scene.fog.far = 90;
        rain.visible = false;
    } else if (weather === "rain") {
        scene.fog.near = 10;
        scene.fog.far = 60;
        rain.visible = true;
    } else if (weather === "storm") {
        scene.fog.near = 5;
        scene.fog.far = 40;
        rain.visible = true;
        if (Math.random() < 0.02) {
            lightning.intensity = 15;
            lightning.position.set((Math.random() - 0.5) * 50, 25, (Math.random() - 0.5) * 50);
        } else {
            lightning.intensity *= 0.8;
        }
    }

    if (rain && rain.visible) {
        const positions = rain.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= 25 * delta;
            if (positions[i + 1] < 0) positions[i + 1] = 40;
        }
        rain.geometry.attributes.position.needsUpdate = true;
    }
    // -----------------------
    // RENDER
    // -----------------------
    controls.update();
    renderer.render(scene, camera);
}

animate();
