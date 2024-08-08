import * as THREE from '../provider/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm';

const minimumDistance = 10; // Distância mínima configurável aumentada

export class Enemy {
    constructor(world, player, existingEnemies) {
        this.world = world;
        this.player = player;
        this.color = new THREE.Color(Math.random() * 0xffffff); // Cor aleatória para cada inimigo

        // Criar aparência de cubo
        const material = new THREE.MeshStandardMaterial({ color: this.color });
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(geometry, material);

        // Adicionar cilindro invisível para colisões
        const collisionGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
        const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
        this.collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
        this.collisionMesh.position.copy(this.mesh.position);
        this.world.scene.add(this.collisionMesh);

        this.positionEnemy(existingEnemies);
        this.mesh.castShadow = true; // Configurar para emitir sombras
        this.world.scene.add(this.mesh);

        // Adicionar seta de direção flutuando acima do inimigo
        const arrowGeometry = new THREE.ConeGeometry(0.2, 1, 32);
        const arrowMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        this.directionArrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        this.directionArrow.rotation.x = Math.PI / 2;
        this.world.scene.add(this.directionArrow);

        // Configurar cilindro para colisões
        const shape = new CANNON.Cylinder(0.5, 0.5, 2, 32);
        const quat = new CANNON.Quaternion();
        quat.setFromEuler(Math.PI / 2, 0, 0);
        shape.transformAllPoints(new CANNON.Vec3(), quat);
        this.body = new CANNON.Body({ mass: 1 });
        this.body.addShape(shape);

        this.body.angularDamping = 1; // Para evitar rotação
        this.world.physicsWorld.addBody(this.body);

        this.speed = 2;
        this.isAlerted = false; // Estado de alerta
        this.visionDistance = 10; // Campo de visão dos inimigos
        this.visionAngle = Math.PI / 4; // Ângulo de visão de 45 graus

        // Inicializar a posição do corpo
        this.body.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

        // Adicionar linha de visão para depuração
        const visionGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, this.visionDistance)
        ]);
        const visionMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.visionLine = new THREE.Line(visionGeometry, visionMaterial);
        this.mesh.add(this.visionLine);

        // Inicializar rotação aleatória
        this.initializeRandomRotation();
    }

    initializeRandomRotation() {
        const randomAngle = Math.random() * 2 * Math.PI;
        this.mesh.rotation.y = randomAngle;
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), randomAngle);
    }

    positionEnemy(existingEnemies) {
        let positionOk = false;
        while (!positionOk) {
            this.mesh.position.set(Math.random() * 80 - 40, 0.5, Math.random() * 80 - 40); // Aumentar a área de spawn
            positionOk = true;
            if (this.mesh.position.distanceTo(this.player.mesh.position) < minimumDistance) {
                positionOk = false;
                continue;
            }
            for (let enemy of existingEnemies) {
                if (this.mesh.position.distanceTo(enemy.mesh.position) < minimumDistance) {
                    positionOk = false;
                    break;
                }
            }
        }
        this.collisionMesh.position.copy(this.mesh.position); // Ajustar posição do collisionMesh
    }

    update(existingEnemies) {
        this.checkPlayerInVision();

        if (this.isAlerted) {
            // Calcular a direção para o personagem
            const directionToPlayer = new THREE.Vector3(
                this.player.mesh.position.x - this.body.position.x,
                this.player.mesh.position.y - this.body.position.y,
                this.player.mesh.position.z - this.body.position.z
            ).normalize();

            // Atualizar a orientação do inimigo para olhar para o personagem
            const lookAtPosition = new THREE.Vector3(
                this.player.mesh.position.x,
                this.mesh.position.y,
                this.player.mesh.position.z
            );
            this.mesh.lookAt(lookAtPosition);

            // Atualizar a direção do movimento
            const direction = new CANNON.Vec3(directionToPlayer.x, 0, directionToPlayer.z);
            direction.scale(this.speed, direction);
            this.body.velocity.copy(direction);

            // Atualizar a orientação da seta de direção e da linha de visão para apontar para o jogador
            this.directionArrow.lookAt(
                this.player.mesh.position.x,
                this.player.mesh.position.y,
                this.player.mesh.position.z
            );

            const lookAtQuaternion = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1), // direção padrão da visão
                directionToPlayer.clone().normalize()
            );
            this.visionLine.quaternion.copy(lookAtQuaternion);
        }

        this.avoidOtherEnemies(existingEnemies);

        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        this.collisionMesh.position.copy(this.body.position);

        const distance = this.mesh.position.distanceTo(this.player.mesh.position);
        if (this.isAlerted && distance < 1.5) {
            this.player.checkHit(this.color);
        }

        // Atualizar a posição da seta de direção para flutuar acima do inimigo
        this.directionArrow.position.set(this.mesh.position.x, this.mesh.position.y + 2, this.mesh.position.z);
    }

    checkPlayerInVision() {
        const distanceToPlayer = this.mesh.position.distanceTo(this.player.mesh.position);
        if (distanceToPlayer < this.visionDistance) {
            const directionToPlayer = new THREE.Vector3(
                this.player.mesh.position.x - this.mesh.position.x,
                this.player.mesh.position.y - this.mesh.position.y,
                this.player.mesh.position.z - this.mesh.position.z
            ).normalize();

            const enemyDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion).normalize();
            const angle = enemyDirection.angleTo(directionToPlayer);
            if (angle < this.visionAngle) {
                this.isAlerted = true; // Definir como alertado
            }
        }
    }

    avoidOtherEnemies(existingEnemies) {
        for (let otherEnemy of existingEnemies) {
            if (otherEnemy !== this) {
                const distance = this.mesh.position.distanceTo(otherEnemy.mesh.position);
                if (distance < minimumDistance) {
                    const direction = new CANNON.Vec3(
                        this.mesh.position.x - otherEnemy.mesh.position.x,
                        this.mesh.position.y - otherEnemy.mesh.position.y,
                        this.mesh.position.z - otherEnemy.mesh.position.z
                    );
                    direction.normalize();
                    direction.scale(this.speed, direction);
                    this.body.velocity.vadd(direction, this.body.velocity);
                }
            }
        }
    }

    isInFieldOfView() {
        const directionToPlayer = new THREE.Vector3(
            this.player.mesh.position.x - this.mesh.position.x,
            this.player.mesh.position.y - this.mesh.position.y,
            this.player.mesh.position.z - this.mesh.position.z
        ).normalize();
        const enemyDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion).normalize();
        const angle = enemyDirection.angleTo(directionToPlayer);
        return angle < this.visionAngle; // Verificar se o jogador está dentro do ângulo de visão frontal
    }

    takeHit(color) {
        this.mesh.material.color.set(color);
        // Adicionar lógica para o que acontece quando o inimigo é atingido
        console.log('Enemy hit!');
    }
}
