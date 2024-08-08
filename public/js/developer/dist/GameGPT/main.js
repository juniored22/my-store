import * as THREE from '../provider/three.module.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { ThirdPersonCamera } from './camera.js';
import { setupControls, keys } from './controls.js';

const stats = new Stats(), enemies = [];
let camera, world, player, cameraController, isGameRunning = false, isPaused = false;
let selectedCharacter = 'sphere'; // Default character

document.body.appendChild(stats.dom);

const characters = [
    { type: 'sphere', geometry: new THREE.SphereGeometry(1, 32, 32), material: new THREE.MeshStandardMaterial({ color: 0x0077ff }) },
    { type: 'cube', geometry: new THREE.BoxGeometry(1, 1, 1), material: new THREE.MeshStandardMaterial({ color: 0x0077ff }) },
    { type: 'cylinder', geometry: new THREE.CylinderGeometry(0.5, 0.5, 2, 32), material: new THREE.MeshStandardMaterial({ color: 0x0077ff }) }
];

const characterSelection = document.getElementById('characterSelection');

characters.forEach(character => {
    const card = document.createElement('div');
    card.className = 'characterCard';
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(100, 100);
    card.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    const mesh = new THREE.Mesh(character.geometry, character.material);
    scene.add(mesh);

    renderer.render(scene, camera);

    const label = document.createElement('span');
    label.textContent = character.type.charAt(0).toUpperCase() + character.type.slice(1);
    card.appendChild(label);

    card.addEventListener('click', () => {
        selectedCharacter = character.type;
        document.getElementById('characterSelection').style.display = 'none';
        document.getElementById('startButton').style.display = 'block';
    });

    characterSelection.appendChild(card);
});

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('continueButton').addEventListener('click', continueGame);
document.getElementById('restartButton').addEventListener('click', restartGame);
document.getElementById('exitButton').addEventListener('click', exitGame);

function togglePause() {
    if (isGameRunning) {
        isPaused = !isPaused;
        document.getElementById('pauseMenu').style.display = isPaused ? 'flex' : 'none';
        if (isPaused) {
            document.exitPointerLock();
        } else {
            document.body.requestPointerLock();
            animate();
        }
    }
}

function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.body.requestPointerLock();
    init(); // Inicializar o jogo após a seleção do personagem
    isGameRunning = true;
    animate();
}

function continueGame() {
    togglePause();
}

function restartGame() {
    isPaused = false;
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('menu').style.display = 'flex';
    isGameRunning = false;
    enemies.length = 0;
    startGame();
}

function exitGame() {
    isPaused = false;
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('menu').style.display = 'flex';
    isGameRunning = false;
    enemies.length = 0;
}

function init() {
    world = new World();
    player = new Player(world, selectedCharacter); // Usar o personagem selecionado
    cameraController = new ThirdPersonCamera(player);
    for (let i = 0; i < 5; i++) enemies.push(new Enemy(world, player, enemies));
    setupControls(togglePause);
}

function animate() {
    if (!isGameRunning || isPaused) return;
    stats.begin();
    player.move(keys, cameraController.yaw);
    cameraController.update();
    enemies.forEach(enemy => enemy.update(enemies));
    world.updatePhysics(1 / 60);
    world.render(cameraController.camera);
    stats.end();
    requestAnimationFrame(animate);
}
