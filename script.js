// ==========================================================================
// 1. THREE.JS INITIALIZATION (モーダル内の3D描画)
// ==========================================================================
const canvas = document.getElementById('webgl-canvas');
let scene, camera, renderer, controls, carGroup, carBodyMaterial;
let isThreeInitialized = false;

function initThree() {
  if (isThreeInitialized) return;

  const wrapper = canvas.parentElement;

  // Scene & Camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090b10);
  scene.fog = new THREE.FogExp2(0x090b10, 0.035);

  camera = new THREE.PerspectiveCamera(45, wrapper.clientWidth / wrapper.clientHeight, 0.1, 100);
  camera.position.set(0, 1.8, 6.5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const pointLight1 = new THREE.PointLight(0x00ff66, 2, 10);
  pointLight1.position.set(-4, 2, -2);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x00ccff, 2, 10);
  pointLight2.position.set(4, 2, 2);
  scene.add(pointLight2);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.2, metalness: 0.8 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(50, 40, 0x00ff66, 0x112233);
  grid.position.y = 0.01;
  scene.add(grid);

  // Car Group
  carGroup = new THREE.Group();
  scene.add(carGroup);

  carBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x111115,
    metalness: 0.9,
    roughness: 0.15,
  });

  // Body
  const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 3.8), carBodyMaterial);
  bodyMesh.position.y = 0.55;
  bodyMesh.castShadow = true;
  carGroup.add(bodyMesh);

  // Cabin
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0.1, roughness: 0.1, transmission: 0.6, transparent: true });
  const cabinMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.8), glassMat);
  cabinMesh.position.set(0, 0.95, -0.2);
  carGroup.add(cabinMesh);

  // Headlight
  const headLight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.1), new THREE.MeshBasicMaterial({ color: 0x00ff66 }));
  headLight.position.set(0, 0.6, 1.86);
  carGroup.add(headLight);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 32);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x00ff66, metalness: 0.8 });

  [[-0.95, 0.35, 1.1], [0.95, 0.35, 1.1], [-0.95, 0.35, -1.1], [0.95, 0.35, -1.1]].forEach(pos => {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(wheelGeo, wheelMat);
    tire.rotation.z = Math.PI / 2;
    wheelGroup.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 16), rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);
    wheelGroup.position.set(...pos);
    carGroup.add(wheelGroup);
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  isThreeInitialized = true;
}

// ==========================================================================
// 2. MODAL & INTERACTION
// ==========================================================================
const modal = document.getElementById('modal-3d');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalTitle = document.getElementById('modal-model-title');
const open3dBtns = document.querySelectorAll('.open-3d-btn');

open3dBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const modelName = btn.getAttribute('data-model');
    modalTitle.textContent = modelName;
    modal.classList.add('active');

    // Initialize & Resize Three.js
    setTimeout(() => {
      initThree();
      const wrapper = canvas.parentElement;
      camera.aspect = wrapper.clientWidth / wrapper.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    }, 50);
  });
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

// Color Selector
const colorBtns = document.querySelectorAll('.color-btn');
colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const hexColor = btn.getAttribute('data-color');
    if (carBodyMaterial) carBodyMaterial.color.set(hexColor);
  });
});
