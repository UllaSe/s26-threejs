import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {VRButton} from 'three/addons/webxr/VRButton.js';
import {XRControllerModelFactory} from 'three/addons/webxr/XRControllerModelFactory.js';

let camera, scene, renderer, cube, controls;
const base = import.meta.env.BASE_URL;

//////////////
//Initialize variables
//////////////
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let raycaster;
const intersected = [];
const tempMatrix = new THREE.Matrix4();
let group;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
  cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // camera.position.z = 5;
  // camera.position.x = 2;
  // camera.position.y = 1;
  camera.position.set(2, 3, 5);
  camera.lookAt(axesHelper.position);
  //camera.lookAt(0, 0, 0);

  // TUTKI KOTITEHTÄVÄÄ VARTEN
  //cube.position.set(1,1,1);
  //cube.rotation.x = Math.PI / 2; // 90 astetta
  // cube.scale.set(2,2,2,);

  // lights
  const light = new THREE.AmbientLight(0x404040); // soft white light
  //scene.add(light);

  // White directional light at half intensity shining from the top.
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  //scene.add(directionalLight);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.listenToKeyEvents(window); // optional

  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 1;
  controls.maxDistance = 10;

  initVR();

  window.addEventListener('resize', onWindowResize);
}

function initVR() {
  document.body.appendChild(VRButton.createButton(renderer));
  renderer.xr.enabled = true;

  // controllers

  controller1 = renderer.xr.getController(0);
  controller1.addEventListener('selectstart', onSelectStart);
  controller1.addEventListener('selectend', onSelectEnd);
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener('selectstart', onSelectStart);
  controller2.addEventListener('selectend', onSelectEnd);
  scene.add(controller2);

  const controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1),
  );
  scene.add(controllerGrip1);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  // controllerGrip2.add(
  //   controllerModelFactory.createControllerModel(controllerGrip2),
  // );
  // scene.add(controllerGrip2);

  const loader = new GLTFLoader();
  const gunUrl = `${base}models/gundy/scene.gltf`;
  console.log('Loading gun from:', gunUrl);
  loader.load(
    gunUrl,
    // Onnistunut lataus
    (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(0.0003);

      model.rotation.y = THREE.MathUtils.degToRad(180);
      model.rotation.x = THREE.MathUtils.degToRad(-30);
      model.position.set(0, 0.01, 0);
      controllerGrip2.add(model);
      console.log('Gun loaded successfully!', model);
    },
    // Latauksen edistyminen
    undefined,
    // Virhetilanne
    (error) => {
      console.error('Gun loading failed:', gunUrl, error);
    },
  );
  scene.add(controllerGrip2);

  //

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);

  const line = new THREE.Line(geometry);
  line.name = 'line';
  line.scale.z = 5;

  controller1.add(line.clone());
  controller2.add(line.clone());

  raycaster = new THREE.Raycaster();
}

function onSelectStart() {
  console.log('Puristettu');
}

function onSelectEnd() {
  console.log('Puristus pois');
}

async function loadHDR() {
  const loader = new HDRLoader();
  const url = `${base}hdr/kloofendal_48d_partly_cloudy_puresky_1k.hdr`;

  try {
    const envMap = await loader.loadAsync(url);

    envMap.mapping = THREE.EquirectangularReflectionMapping;

    // Ympäristön valaistus ja heijastukset
    scene.environment = envMap;

    // Näkyvä taustakuva
    scene.background = envMap;

    console.log('HDR loaded');
  } catch (error) {
    console.error('HDR loading failed:', error);
  }
}

async function loadModels(url) {
  const loader = new GLTFLoader();

  try {
    const gltf = await loader.loadAsync(url);
    const model = gltf.scene;
    // model.scale.set(10,10,10);
    // model.scale.setScalar(10);
    scene.add(model);
    console.log('Model loaded:', model);
  } catch (error) {
    console.error('Model loading failed:', error);
  }
}

function animate(time) {
  //cube.rotation.x = time / 2000;
  //cube.rotation.y = time / 1000;
  controls.update();
  render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  renderer.render(scene, camera);
}

init();
loadHDR();
loadModels(`${base}models/world/world.glb`);
console.log(scene);
