  
import { CreateLabel } from './utils.js';

function Light({ scene, gui, folder='light' }) {
    // Criar uma PointLight com todas as opções configuráveis
    const color = 0xffffff; // cor da luz
    const intensity = 1; // intensidade da luz
    const distance = 100; // distância máxima da luz
    const decay = 2; // taxa de decaimento

    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.set(-0.864, 3, 0);
    light.castShadow = true; // Configurações adicionais permite a projeção de sombras pela luz
    light.shadow.mapSize.width = 512; // Configurações de sombra  largura do mapa de sombras
    light.shadow.mapSize.height = 512; // altura do mapa de sombras

    // Ajustar propriedades da câmera de sombra
    light.shadow.camera.near = 2; // distância mínima da câmera de sombra
    light.shadow.camera.far = 500; // distância máxima da câmera de sombra
    light.shadow.camera.fov = 50; // Se for uma câmera de perspectiva
    light.shadow.camera.left = -10; // Se for uma câmera ortográfica
    light.shadow.camera.right = 10;
    light.shadow.camera.top = 10;
    light.shadow.camera.bottom = -10;
    light.shadow.camera.updateProjectionMatrix(); // Atualizar a matriz de projeção após ajustes
  

    // Adicionar PointLightHelper para visualizar a posição da luz
    const lightHelper = new THREE.PointLightHelper(light);
    light.add(lightHelper);
    const lightLabel = CreateLabel('light', light.position);
  

    // Adicionar CameraHelper para visualizar a câmera de sombra
    const shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
    // Personalizar cores do CameraHelper
    shadowCameraHelper.material.linewidth = 2; // Ajustar a largura da linha
    shadowCameraHelper.color = {
        near: new THREE.Color(0xff0000), // cor para o plano near
        far: new THREE.Color(0x00ff00), // cor para o plano far
        top: new THREE.Color(0x0000ff), // cor para o plano top
        right: new THREE.Color(0xff00ff), // cor para o plano right
        bottom: new THREE.Color(0xffff00), // cor para o plano bottom
        left: new THREE.Color(0x00ffff), // cor para o plano left
    };


    // Criar um cubo para depurar a posição da luz
    const lightCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const lightCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const lightCubeDebug = new THREE.Mesh(lightCubeGeometry, lightCubeMaterial);
    lightCubeDebug.position.copy(light.position);

    


    // Configurações para a câmera
    const lightFolder = gui.addFolder(folder);

    lightFolder.add(light, 'visible');
    lightFolder.add(light.position, 'x', -6, 6).onChange( () => update(lightCubeDebug, light, lightLabel) );
    lightFolder.add(light.position, 'y', -6, 6).onChange( () => update(lightCubeDebug, light, lightLabel) );
    lightFolder.add(light.position, 'z', -6, 6).onChange( () => update(lightCubeDebug, light, lightLabel) );

    const lightFolder_rotation = lightFolder.addFolder('Light rotation');
    lightFolder_rotation.add(light.rotation, 'x', -6, 6).onChange( () => update(lightCubeDebug, light, lightLabel) );
    lightFolder_rotation.add(light.rotation, 'y', -6, 6).onChange( () => update(lightCubeDebug, light, lightLabel) );
    lightFolder_rotation.add(light.rotation, 'z', -6, 6).onChange( () => update(lightCubeDebug, light, lightLabel) );
    lightFolder_rotation.open();

    lightFolder.add(light, 'intensity', 0, 10).onChange( () => update(lightCubeDebug, light, lightLabel) );
    lightFolder.add(light, 'distance', 0, 100).onChange( () => update(lightCubeDebug, light, lightLabel) );
    lightFolder.add(light, 'decay', 0, 10).onChange( () => update(lightCubeDebug, light, lightLabel) );
    // lightFolder.add(shadowCameraHelper, 'visible').onChange( () => update(lightCubeDebug, light, lightLabel) );
    lightFolder.add(lightHelper, 'visible').onChange( () => update(lightCubeDebug, light, lightLabel) );
    lightFolder.add(lightLabel, 'visible').onChange( () => update(lightCubeDebug, light, lightLabel) );
    


    lightFolder.close();
    // cameraFolder.add(camera.rotation, 'x', 0, Math.PI * 2); // roll
    // cameraFolder.add(camera.rotation, 'y', 0, Math.PI * 2); // pitch
    // cameraFolder.add(camera.rotation, 'z', 0, Math.PI * 2); // yaw
    // // cameraFolder.add(camera, 'fov', 1, 100).onChange(() => camera.updateProjectionMatrix());
    // cameraFolder.open();


    


    return { light, shadowCameraHelper, lightCubeDebug, lightLabel, lightFolder }
}

function update(lightCubeDebug, light, lightLabel){
    lightCubeDebug.position.copy(light.position)
    lightCubeDebug.rotation.copy(light.rotation)
    lightLabel.position.copy(light.position)
    light.shadow.camera.updateProjectionMatrix();
}

export { Light };
