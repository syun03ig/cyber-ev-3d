// ==========================================================================
// 1. THREE.JS 3D SCENE SETUP
// ==========================================================================
const canvas = document.getElementById('webgl-canvas');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050508);
scene.fog = new THREE.FogExp2(0x050508, 0.035);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.8, 6.5);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// OrbitControls (マウスドラッグで360度回転)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.minDistance = 3.5;
controls.maxDistance = 10;

// ==========================================================================
// 2. LIGHTING (スタジオライティング)
// ==========================================================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight1.position.set(5, 10, 7);
dirLight1.castShadow = true;
dirLight1.shadow.mapSize.width = 2048;
dirLight1.shadow.mapSize.height = 2048;
scene.add(dirLight1);

const pointLight1 = new THREE.PointLight(0x00ff66, 2, 10);
pointLight1.position.set(-4, 2, -2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00ccff, 2, 10);
pointLight2.position.set(4, 2, 2);
scene.add(pointLight2);

// ==========================================================================
// 3. FLOOR & GRID (床面とグリッド線)
// ==========================================================================
const floorGeo = new THREE.PlaneGeometry(50, 50);
const floorMat = new THREE.MeshStandardMaterial({ 
  color: 0x0a0c10, 
  roughness: 0.2, 
  metalness: 0.8 
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const gridHelper = new THREE.GridHelper(50, 40, 0x00ff66, 0x112233);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// ==========================================================================
// 4. PROCEDURAL CYBER-EV CAR MODEL (車体の3D構築)
// ==========================================================================
const carGroup = new THREE.Group();
scene.add(carGroup);

let carBodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x111115,
  metalness: 0.9,
  roughness: 0.15,
});

// 1. メインボディ
const bodyGeo = new THREE.BoxGeometry(1.8, 0.6, 3.8);
const bodyMesh = new THREE.Mesh(bodyGeo, carBodyMaterial);
bodyMesh.position.y = 0.55;
bodyMesh.castShadow = true;
carGroup.add(bodyMesh);

// 2. キャビン / ガラス
const cabinGeo = new THREE.BoxGeometry(1.4, 0.45, 1.8);
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x000000,
  metalness: 0.1,
  roughness: 0.1,
  transmission: 0.6,
  transparent: true
});
const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
cabinMesh.position.set(0, 0.95, -0.2);
cabinMesh.castShadow = true;
carGroup.add(cabinMesh);

// 3. ヘッドライト (LEDライン)
const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
const headLightGeo = new THREE.BoxGeometry(1.6, 0.06, 0.1);
const headLight = new THREE.Mesh(headLightGeo, lightMat);
headLight.position.set(0, 0.6, 1.86);
carGroup.add(headLight);

// 4. ホイール (タイヤ 4本)
const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 32);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
const rimMat = new THREE.MeshStandardMaterial({ color: 0x00ff66, metalness: 0.8 });

const wheelPositions = [
  [-0.95, 0.35, 1.1],
  [0.95, 0.35, 1.1],
  [-0.95, 0.35, -1.1],
  [0.95, 0.35, -1.1]
];

wheelPositions.forEach(pos => {
  const wheelGroup = new THREE.Group();
  
  const tire = new THREE.Mesh(wheelGeo, wheelMat);
  tire.rotation.z = Math.PI / 2;
  tire.castShadow = true;
  wheelGroup.add(tire);

  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 16), rimMat);
  rim.rotation.z = Math.PI / 2;
  wheelGroup.add(rim);

  wheelGroup.position.set(...pos);
  carGroup.add(wheelGroup);
});

// ==========================================================================
// 5. COLOR CUSTOMIZER INTERACTION (カラーチェンジ処理)
// ==========================================================================
const colorBtns = document.querySelectorAll('.color-btn');

colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const hexColor = btn.getAttribute('data-color');
    carBodyMaterial.color.set(hexColor);
  });
});

// ==========================================================================
// 6. ANIMATION LOOP & RESIZE
// ==========================================================================
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
