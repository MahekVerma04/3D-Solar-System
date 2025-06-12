import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { playPause, isPaused, createLabel, createOrbit } from './utils.js';
import { planetsData } from './planets.js';


let speedMultiplier = 1;
const speedControl = document.getElementById('speedControl');
speedControl.addEventListener('input', () => {
    speedMultiplier = parseFloat(speedControl.value);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 100, 200);
scene.add(camera);

const cubeTextureLoader = new THREE.CubeTextureLoader();
const spaceTexture = cubeTextureLoader.setPath('images/skybox/').load([
    'space_rt.png',
    'space_lf.png',
    'space_up.png',
    'space_dn.png',
    'space_ft.png',
    'space_bk.png'
]);
scene.background = spaceTexture;

const loader = new THREE.TextureLoader();
const sunTexture = loader.load('images/sun.jpg');
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 64, 64),
    new THREE.MeshBasicMaterial({ map: sunTexture })
);
scene.add(sun);

const canvas = document.querySelector('#area');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const pointLight = new THREE.PointLight(0xffffff, 2, 500);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

const planets = [];

planetsData.forEach(data => {
    const texture = loader.load(data.texture);
    const geometry = new THREE.SphereGeometry(data.size, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const planet = new THREE.Mesh(geometry, material);

    planet.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: data.speed,
        distance: data.distance,
        size: data.size
    };

    scene.add(createOrbit(data.distance));

    if (data.name === "Saturn") {
        const ringTexture = loader.load('images/saturn_ring.png');
        const ringGeometry = new THREE.RingGeometry(data.size + 1.2, data.size + 3.5, 64);
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
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;
        planet.add(ring);
    }

    const label = createLabel(data.name);
    scene.add(label);
    planet.userData.label = label;

    scene.add(planet);
    planets.push(planet);
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (!isPaused()) {
        sun.rotation.y += 0.01;

        planets.forEach(planet => {

            const { angle, speed, distance, size, label } = planet.userData;


            planet.userData.angle += speed * delta * 60 * speedMultiplier;


            const x = Math.cos(planet.userData.angle) * distance;
            const z = Math.sin(planet.userData.angle) * distance;
            planet.position.set(x, 0, z);

            if (label) {
                label.position.set(x, size + 1.5, z);
                label.lookAt(camera.position);
            }
        });
    }
    controls.update();
    renderer.render(scene, camera);
}




playPause();
animate();
