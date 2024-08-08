import * as THREE from '../provider/three.module.js';

export class ThirdPersonCamera {
    constructor(player) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.player = player;
        this.yaw = 0;
        this.pitch = 0;
        this.mouseSensitivity = 0.002;
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }
    onMouseMove(event) {
        if (document.pointerLockElement) {
            this.yaw -= event.movementX * this.mouseSensitivity;
            this.pitch -= event.movementY * this.mouseSensitivity;
            this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        }
    }
    update() {
        const offset = new THREE.Vector3(0, 2, 5).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        this.camera.position.copy(this.player.mesh.position).add(offset);
        const target = new THREE.Vector3(this.player.mesh.position.x - Math.sin(this.yaw) * Math.cos(this.pitch) * 5, this.player.mesh.position.y + Math.sin(this.pitch) * 5, this.player.mesh.position.z - Math.cos(this.yaw) * Math.cos(this.pitch) * 5);
        this.camera.lookAt(target);
    }
}
