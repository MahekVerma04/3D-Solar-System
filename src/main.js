// Import necessary modules from Three.js and other custom utilities
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { playPause, isPaused, createLabel, createOrbit } from './utils.js';
import { planetsData } from './planets.js';

// Initialize speed multiplier and slider control
let speedMultiplier = 1;
const speedControl = document.getElementById('speedControl');
speedControl.addEventListener('input', () => {
    speedMultiplier = parseFloat(speedControl.value);
});

// Set up the Three.js scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 100, 200); // Positioned above and back for a good overview
scene.add(camera);

// Load and set a skybox background to simulate space
const cubeTextureLoader = new THREE.CubeTextureLoader();
const spaceTexture = cubeTextureLoader.setPath('/images/skybox/').load([
    'space_rt.png',
    'space_lf.png',
    'space_up.png',
    'space_dn.png',
    'space_ft.png',
    'space_bk.png'
]);
scene.background = spaceTexture;

// Load the sun texture and create the sun at the center
const loader = new THREE.TextureLoader();
const sunTexture = loader.load('images/sun.jpg');
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 64, 64),
    new THREE.MeshBasicMaterial({ map: sunTexture })
);
scene.add(sun);

// Set up WebGL renderer linked to the canvas
const canvas = document.querySelector('#area');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Add orbit controls to freely rotate around the scene
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Add ambient and point lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const pointLight = new THREE.PointLight(0xffffff, 2, 500);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Array to store created planet meshes
const planets = [];

// Loop through each planet's data to create its mesh and label
planetsData.forEach(data => {
    const texture = loader.load(data.texture);
    const geometry = new THREE.SphereGeometry(data.size, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const planet = new THREE.Mesh(geometry, material);

    // Store orbital parameters in userData
    planet.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: data.speed,
        distance: data.distance,
        size: data.size
    };

    // Add orbital ring for visual representation
    scene.add(createOrbit(data.distance));

    // Special case: Add rings to Saturn
    if (data.name === "Saturn") {
        const ringTexture = loader.load('images/saturn_ring.png');
        const ringGeometry = new THREE.RingGeometry(data.size + 1.2, data.size + 3.5, 64);
        
        // Adjust UV mapping for proper texture placement
        const pos = ringGeometry.attributes.position;
        const uv = ringGeometry.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            uv.setXY(i, (x / (data.size + 3.5)) / 2 + 0.5, (y / (data.size + 3.5)) / 2 + 0.5);
        }

        const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true
        }));
        ring.rotation.x = -Math.PI / 2; // Rotate flat
        ring.position.y = 0.01; // Slightly above planet to avoid z-fighting
        planet.add(ring);
    }

    // Create and attach a label that always faces the camera
    const label = createLabel(data.name);
    scene.add(label);
    planet.userData.label = label;

    // Add the planet to the scene and tracking array
    scene.add(planet);
    planets.push(planet);
});

// Clock for delta time-based animations
const clock = new THREE.Clock();

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (!isPaused()) {
        sun.rotation.y += 0.01; // Slowly rotate the Sun

        planets.forEach(planet => {
            const { angle, speed, distance, size, label } = planet.userData;

            // Update orbital position based on speed and multiplier
            planet.userData.angle += speed * delta * 60 * speedMultiplier;

            const x = Math.cos(planet.userData.angle) * distance;
            const z = Math.sin(planet.userData.angle) * distance;
            planet.position.set(x, 0, z);

            // Update label position and ensure it always faces the camera
            if (label) {
                label.position.set(x, size + 1.5, z);
                label.lookAt(camera.position);
            }
        });
    }

    controls.update(); // Update damping
    renderer.render(scene, camera); // Draw the frame
}

// Start simulation with play/pause logic
playPause();
animate();
