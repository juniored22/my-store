import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm';

class FirstPersonCamera {
  constructor(camera, domElement, character, scene) {
    this.camera = camera;
    this.domElement = domElement;
    this.character = character;
    this.scene = scene;

    this.moveSpeed = 0.1;
    this.turnSpeed = 0.005;

    this.pitch = 0;
    this.yaw = 0;

    this.keys = {};
    this.isActive = false;

    // Hands offset parameters
    this.handsOffset = { x: 0, y: 3, z: 5 };

    // Bind methods to ensure correct 'this' context
    this.onMouseMove = this.onMouseMove.bind(this);
    this.update = this.update.bind(this);

    // Event listeners for key presses and mouse movement
    this.initEventListeners();

    // Create the hands (a simple cube for this example)
    this.createHands();

    // Initialize GUI for adjusting hands offset
    this.initGUI();
  }

  initEventListeners() {
    this.domElement.addEventListener('click', () => this.onClick());
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    window.addEventListener('keyup', (event) => this.onKeyUp(event));
  }

  onClick() {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.domElement.requestPointerLock(); // obten o mouse
      this.domElement.addEventListener('mousemove', this.onMouseMove);
    } else {
      document.exitPointerLock();
      this.domElement.removeEventListener('mousemove', this.onMouseMove);
    }
  }

  onMouseMove(event) {
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    this.yaw -= movementX * this.turnSpeed;
    this.pitch -= movementY * this.turnSpeed;

    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

    // Update character rotation for yaw
    this.character.rotation.y = this.yaw;

    // Apply pitch rotation to the camera around the character's local X axis
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    this.camera.quaternion.copy(this.character.quaternion).multiply(quaternion);
  }

  onKeyDown(event) {
    if (this.isActive) {
      this.keys[event.code] = true;
    }
  }

  onKeyUp(event) {
    if (this.isActive) {
      this.keys[event.code] = false;
    }
  }

  createHands() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.hands = new THREE.Mesh(geometry, material);
    this.scene.add(this.hands);
  }

  initGUI() {
    const gui = new GUI();
    const handsFolder = gui.addFolder('Hands Offset');
    handsFolder.add(this.handsOffset, 'x', -2, 2).name('Offset X');
    handsFolder.add(this.handsOffset, 'y', -2, 2).name('Offset Y');
    handsFolder.add(this.handsOffset, 'z', -2, 2).name('Offset Z');
    handsFolder.open();
  }

  update() {
    if (this.isActive) {
      // Calculate forward and right directions based on the character's rotation
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.character.quaternion);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.character.quaternion);

      if (this.keys['KeyW']) {
        this.character.position.add(forward.multiplyScalar(this.moveSpeed));
      }
      if (this.keys['KeyS']) {
        this.character.position.add(forward.multiplyScalar(-this.moveSpeed));
      }
      if (this.keys['KeyA']) {
        this.character.position.add(right.multiplyScalar(-this.moveSpeed));
      }
      if (this.keys['KeyD']) {
        this.character.position.add(right.multiplyScalar(this.moveSpeed));
      }

      // Update the camera position to follow the character
      this.camera.position.set(
        this.character.position.x - 5,
        this.character.position.y + 1.6, // Adjust the height as needed
        this.character.position.z
      );

      const handsOffsetVector = new THREE.Vector3(this.handsOffset.x, this.handsOffset.y, this.handsOffset.z);
      handsOffsetVector.applyQuaternion(this.camera.quaternion);
      this.hands.position.copy(this.camera.position).add(handsOffsetVector);
      this.hands.quaternion.copy(this.camera.quaternion);
    }
  }
  
}

export { FirstPersonCamera };
