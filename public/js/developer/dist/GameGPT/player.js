import * as THREE from '../provider/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm';

export class Player {
    constructor(world, characterType) {
        this.world = world;
        this.characterType = characterType;
        this.createCharacter();
        this.speed = 5;
        this.runSpeed = 10;
        this.jumpSpeed = 25; // Aumentar a altura do pulo
        this.canJump = true;
        this.hitCooldown = 0;
        this.defaultColor = 0x0077ff;
        this.arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), this.mesh.position, 2, 0xff0000);
        world.scene.add(this.arrowHelper);
    }

    createCharacter() {
        const material = new THREE.MeshStandardMaterial({ color: this.defaultColor });

        if (this.characterType === 'sphere') {
            this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material);
        } else if (this.characterType === 'cube') {
            this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
        } else if (this.characterType === 'cylinder') {
            this.mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 32), material);
        }

        this.mesh.castShadow = true; // Configurar para emitir sombras
        this.world.scene.add(this.mesh);

        // Adicionar cilindro invisível para colisões
        const collisionGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
        const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
        this.collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
        this.world.scene.add(this.collisionMesh);

        const shape = new CANNON.Cylinder(0.5, 0.5, 0.5, 32);
        const quat = new CANNON.Quaternion();
        quat.setFromEuler(Math.PI / 2, 0, 0);
        shape.transformAllPoints(new CANNON.Vec3(), quat);
        this.body = new CANNON.Body({ mass: 5, position: new CANNON.Vec3(0, 1, 0) });
        this.body.addShape(shape);
        this.body.angularDamping = 1; // Para evitar rotação

        this.world.physicsWorld.addBody(this.body);
    }

    move(keys, yaw) {
        const velocity = new CANNON.Vec3();
        const currentSpeed = keys['Shift'] ? this.runSpeed : this.speed;
        if (keys['w']) { velocity.z -= currentSpeed * Math.cos(yaw); velocity.x -= currentSpeed * Math.sin(yaw); }
        if (keys['s']) { velocity.z += currentSpeed * Math.cos(yaw); velocity.x += currentSpeed * Math.sin(yaw); }
        if (keys['a']) { velocity.x -= currentSpeed * Math.cos(yaw); velocity.z += currentSpeed * Math.sin(yaw); }
        if (keys['d']) { velocity.x += currentSpeed * Math.cos(yaw); velocity.z -= currentSpeed * Math.sin(yaw); }
        if (keys[' '] && this.canJump) { velocity.y = this.jumpSpeed; this.canJump = false; }
        this.body.velocity.copy(velocity);
        this.mesh.position.copy(this.body.position);
        this.collisionMesh.position.copy(this.body.position);

        if (keys['w'] || keys['s'] || keys['a'] || keys['d']) {
            this.arrowHelper.setDirection(new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize());
            this.arrowHelper.position.copy(this.mesh.position);
        }
        if (this.hitCooldown > 0) this.hitCooldown--;
    }

    checkHit(hitColor) {
        if (this.hitCooldown > 0) return;
        this.mesh.material.color.set(hitColor);
        this.hitCooldown = 60; // 1 second cooldown at 60 FPS
        setTimeout(() => {
            this.mesh.material.color.set(this.defaultColor);
        }, 1000);
    }
}
