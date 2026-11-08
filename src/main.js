import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

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
scene.add(light);

// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
scene.add(directionalLight);

let controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window); // optional

//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;

controls.screenSpacePanning = false;

controls.minDistance = 1;
controls.maxDistance = 10;

// const canvas = document.querySelector('canvas');
// const gl = canvas.getContext('webgl2');

// gl.clearColor(0.0, 0.5, 0.8, 1.0);
// gl.clear(gl.COLOR_BUFFER_BIT);

function animate(time) {
  //cube.rotation.x = time / 2000;
  //cube.rotation.y = time / 1000;
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
