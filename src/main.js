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

// 🔥 Create Glowing Torus (Ring)
const geometry = new THREE.TorusGeometry(3, 0.5, 32, 100);
const material = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

camera.position.z = 10;

// 💡 Lighting
const light = new THREE.PointLight(0xff00ff, 2, 50);
light.position.set(0, 5, 5);
scene.add(light);

// 🎵 Animate the Neon Ring with Audio
async function animate() {
    const { analyser, dataArray, bufferLength } = await getAudioStream();

    function render() {
        requestAnimationFrame(render);
        analyser.getByteFrequencyData(dataArray);

        const scale = (dataArray[10] / 128.0) * 1.5; // Scale based on bass frequency
        torus.scale.set(scale, scale, scale);
        torus.rotation.y += 0.01;
        torus.material.color.setHSL(scale * 2, 1, 0.5); // Change color dynamically

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
