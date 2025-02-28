import * as THREE from "three";

// Get Microphone Audio
async function getAudioStream() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  analyser.fftSize = 128; // Adjust FFT size (higher = more detail)

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  return { analyser, dataArray, bufferLength };
}

// Set up Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create Bars for Visualization
const numBars = 64;
const bars = [];
const barWidth = 0.5;
for (let i = 0; i < numBars; i++) {
  const geometry = new THREE.BoxGeometry(barWidth, 1, barWidth);
  const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
  const bar = new THREE.Mesh(geometry, material);
  bar.position.x = (i - numBars / 2) * (barWidth + 0.1);
  scene.add(bar);
  bars.push(bar);
}

camera.position.z = 15;

// Animate Audio & Three.js Scene
async function animate() {
  const { analyser, dataArray, bufferLength } = await getAudioStream();

  function render() {
    requestAnimationFrame(render);
    analyser.getByteFrequencyData(dataArray);

    bars.forEach((bar, i) => {
      const scale = dataArray[i] / 128.0;
      bar.scale.y = Math.max(scale, 0.1); // Avoid zero scale
      bar.material.color.setHSL(scale, 1, 0.5);
    });

    renderer.render(scene, camera);
  }

  render();
}

animate();

// Handle Resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
