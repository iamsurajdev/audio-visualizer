import * as THREE from "three";

// 🎤 Get Microphone Audio
async function getAudioStream() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    return { analyser, dataArray, bufferLength };
}

// 🌌 Setup Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 📊 Create 3D Grid Plane
const gridSize = 32;
const geometry = new THREE.PlaneGeometry(10, 10, gridSize, gridSize);
const material = new THREE.MeshStandardMaterial({
    color: 0x44aa88,
    wireframe: true,
});
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// 💡 Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// 🎵 Animate 3D Waves with Audio
async function animate() {
    const { analyser, dataArray, bufferLength } = await getAudioStream();

    function render() {
        requestAnimationFrame(render);
        analyser.getByteFrequencyData(dataArray);

        const positions = plane.geometry.attributes.position.array;
        for (let i = 0; i < bufferLength; i++) {
            const index = i * 3 + gridSize * 3; // Adjust grid alignment
            positions[index + 1] = (dataArray[i] / 256) * 2; // Update Y-position
        }

        plane.geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }

    render();
}

animate();

// 🌍 Handle Resize
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
