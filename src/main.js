import * as THREE from "three";

// 🎤 Get Microphone Audio
async function getAudioStream() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256; // Higher = more detailed deformation

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    return { analyser, dataArray, bufferLength };
}

// 🌌 Setup Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x111111); // Dark background for contrast
document.body.appendChild(renderer.domElement);

// 💡 Bright Lighting
const light = new THREE.PointLight(0xffffff, 3); // Strong light intensity
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 2); // Soft global lighting
scene.add(ambientLight);

// 🔥 Create a Colorful, Glowing Sphere
const geometry = new THREE.SphereGeometry(2, 128, 128); // Higher segments for smooth morphing
const material = new THREE.MeshStandardMaterial({ 
    color: 0xff44ff, // Bright pinkish-purple
    emissive: 0x4400ff, // Glow effect
    emissiveIntensity: 0.5,
    metalness: 0.5,
    roughness: 0.3,
    wireframe: false // Set to true for a cool wireframe effect
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

camera.position.z = 6;

// 🎵 Animate the Sphere Morphing
async function animate() {
    const { analyser, dataArray, bufferLength } = await getAudioStream();
    const positions = sphere.geometry.attributes.position.array;

    function render() {
        requestAnimationFrame(render);
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < bufferLength; i++) {
            const index = i * 3; // Access each vertex
            const offset = dataArray[i] / 64.0; // More pronounced deformation
            positions[index] += offset * 0.1 * (Math.random() - 0.5);
            positions[index + 1] += offset * 0.1 * (Math.random() - 0.5);
            positions[index + 2] += offset * 0.1 * (Math.random() - 0.5);
        }

        sphere.geometry.attributes.position.needsUpdate = true;
        sphere.rotation.y += 0.005;
        sphere.rotation.x += 0.003;

        // 🌈 Dynamic Color Shift
        const hue = (performance.now() / 1000) % 1; // Smooth hue cycle
        sphere.material.color.setHSL(hue, 1, 0.5);
        sphere.material.emissive.setHSL(hue, 1, 0.8); // Brighter glow

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
