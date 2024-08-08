import * as THREE from '../provider/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm';
// TWEEN is now loaded globally

export class World {
    constructor() {
        this.scene = new THREE.Scene();
        this.dayColor = new THREE.Color(0x87CEEB); // Cor do céu azul claro (dia)
        this.nightColor = new THREE.Color(0x000033); // Cor do céu azul escuro (noite)
        this.scene.background = this.dayColor.clone(); // Inicialmente, definir o fundo para a cor do dia
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true; // Ativar sombras
        document.body.appendChild(this.renderer.domElement);
        this.physicsWorld = new CANNON.World();
        this.physicsWorld.gravity.set(0, -19.62, 0); // Aumentar a gravidade para fazer o personagem cair mais rápido
        window.addEventListener('resize', () => this.onWindowResize());
        this.addLight();
        this.addGround();
        // this.addGridHelper();
        this.addSun();
        this.initDayNightTransition();
    }

    addLight() {
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(5, 10, 7.5);
        this.light.castShadow = true; // Ativar emissão de sombras pela luz
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.scene.add(this.light);
    }

    addGround() {
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22, // Verde escuro
            roughness: 0.5, // Ajustar a rugosidade para refletir a luz
            metalness: 0.3 // Ajustar o metalness para dar um brilho leve
        });
    
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true; // Configurar para receber sombras
        this.scene.add(plane);
    
        const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.physicsWorld.addBody(groundBody);
    }

    addGridHelper() {
        const gridHelper = new THREE.GridHelper(100, 100);
        this.scene.add(gridHelper);
    }

    addSun() {
        const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(10, 50, -30);
        this.scene.add(this.sun);
    }

    onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(camera) {
        this.renderer.render(this.scene, camera);
        TWEEN.update(); // Atualizar os tweens
    }

    updatePhysics(deltaTime) {
        this.physicsWorld.step(deltaTime);
    }

    initDayNightTransition() {
        const transitionDuration = 60000; // Duração da transição em milissegundos (10 segundos)

        // Transition for the sky color
        const dayToNightTween = new TWEEN.Tween(this.scene.background)
            .to(this.nightColor, transitionDuration)
            .easing(TWEEN.Easing.Quadratic.InOut);
        
        const nightToDayTween = new TWEEN.Tween(this.scene.background)
            .to(this.dayColor, transitionDuration)
            .easing(TWEEN.Easing.Quadratic.InOut);

        // Transition for the sun position
        const sunDayPosition = { x: 10, y: 50, z: -30 };
        const sunNightPosition = { x: -10, y: -50, z: 30 };
        const sunDayToNightTween = new TWEEN.Tween(this.sun.position)
            .to(sunNightPosition, transitionDuration)
            .easing(TWEEN.Easing.Quadratic.InOut);
        
        const sunNightToDayTween = new TWEEN.Tween(this.sun.position)
            .to(sunDayPosition, transitionDuration)
            .easing(TWEEN.Easing.Quadratic.InOut);
        
        dayToNightTween.chain(nightToDayTween);
        nightToDayTween.chain(dayToNightTween);
        
        sunDayToNightTween.chain(sunNightToDayTween);
        sunNightToDayTween.chain(sunDayToNightTween);
        
        dayToNightTween.start();
        sunDayToNightTween.start();
    }
}
