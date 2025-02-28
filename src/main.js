import * as THREE from "three";

// 🎤 Get Microphone Audio
async function getAudioStream() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 512; // Increase for more details

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

// 🎨 Create Line Geometry for Waveform
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x44aa88 });
const points = new Float32Array(512 * 3);
const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
const waveformLine = new THREE.Line(lineGeometry, lineMaterial);
scene.add(waveformLine);

camera.position.z = 5;

// 🎵 Animate the Waveform
async function animate() {
    const { analyser, dataArray, bufferLength } = await getAudioStream();

    function render() {
        requestAnimationFrame(render);
        analyser.getByteTimeDomainData(dataArray);

        const positions = waveformLine.geometry.attributes.position.array;
        for (let i = 0; i < bufferLength; i++) {
            const x = (i / bufferLength) * 4 - 2; // Spread across X-axis
            const y = (dataArray[i] / 128.0 - 1) * 2; // Normalize Y-axis
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = 0;
        }

        waveformLine.geometry.attributes.position.needsUpdate = true;
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
