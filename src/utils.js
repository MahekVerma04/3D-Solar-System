// utils.js
import * as THREE from 'three';

let paused = false;
export function playPause() {

    const toggleBtn = document.getElementById('toggleBtn');
    toggleBtn.textContent = 'Pause'; // Sync initial text with default state

    toggleBtn.addEventListener('click', () => {
        paused = !paused;
        toggleBtn.textContent = paused ? 'Play' : 'Pause';
    });

}

export function isPaused() {
    return paused;
}


export function createLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(10, 2.5, 1);
    return sprite;
}

export function createOrbit(radius) {
    const segments = 256;
    const points = [];

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, 0, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6
    });

    return new THREE.LineLoop(geometry, material);
}
