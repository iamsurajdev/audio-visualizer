import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Create scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 2, 10); // Add fog (black color, starts at 2, ends at 10)

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add ambient light (softens shadows)
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Add directional light (strong light source)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5); // Position it in 3D space
scene.add(directionalLight);

// Create a torus
const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);

// Use MeshPhongMaterial
const material = new THREE.MeshPhongMaterial({
  color: 0xffff00, // Yellow color
  shininess: 100, // Shininess level (0 = matte, 100+ = very shiny)
  specular: 0xffffff, // White reflection highlights
});

const object = new THREE.Mesh(geometry, material);
scene.add(object);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = false;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
//   object.rotation.x += 0.01;
//   object.rotation.y += 0.01;
  
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
