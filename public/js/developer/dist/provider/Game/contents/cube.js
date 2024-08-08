   
import { CreateLabel } from './utils.js';

function Cube({
        visible=true, 
        color=0x0000ff, 
        wireframe=false, 
        frustumCulled = false, 
        castShadow = true, 
        receiveShadow = true, 
        centerSphere = false, 
        gui=null,
        position = {x: 0, y: 2.66, z: 0},
    } = {}) {

    if(THREE === undefined) {
        throw new Error('THREE is not defined');
    }

    const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 4, 4, 4);
    // const material = new THREE.MeshBasicMaterial({ color, wireframe });
    // const material = new THREE.MeshStandardMaterial({ color, wireframe });
    // const material = new THREE.MeshLambertMaterial({ color, wireframe });
    const material = new THREE.MeshPhongMaterial({ color, wireframe });
    const cube = new THREE.Mesh(geometry, material);
    cube.visible = visible;
    cube.frustumCulled = frustumCulled;
    cube.castShadow = castShadow;
    cube.receiveShadow = receiveShadow;
    cube.position.set(position.x, position.y, position.z);
    cube.rotation.set(0, 0, 0);
    cube.scale.set(0.5, 0.5, 0.5);

    // Adicionar rótulos (labels)
    const cubeLabel = CreateLabel('Cube', cube.position);

    if(gui){

        const cubeFolder=  gui.addFolder('Cube');
        cubeFolder.add(cube, 'visible').onChange(()=> cubeLabel ? cubeLabel.visible = cube.visible : null);
        cubeFolder.add(cube, 'castShadow');
        const cubeFolder_position =  cubeFolder.addFolder('Cube position');
        cubeFolder_position.add(cube.position, 'x', -5, 5).onChange(()=> update(cube, cubeLabel));
        cubeFolder_position.add(cube.position, 'y', -5, 5).onChange(()=> update(cube, cubeLabel));
        cubeFolder_position.add(cube.position, 'z', -5, 5).onChange(()=> update(cube, cubeLabel));
        cubeFolder_position.close();

        const cubeFolder_rotation =  cubeFolder.addFolder('Cube rotation');
        cubeFolder_rotation.add(cube.rotation, 'x', -5, 5).onChange(()=> update(cube, cubeLabel));
        cubeFolder_rotation.add(cube.rotation, 'y', -5, 5).onChange(()=> update(cube, cubeLabel));
        cubeFolder_rotation.add(cube.rotation, 'z', -5, 5).onChange(()=> update(cube, cubeLabel));
        cubeFolder_rotation.close();

        const cubeFolder_scale=  cubeFolder.addFolder('Cube scale');
        cubeFolder_scale.add(cube.scale, 'x', -5, 5).onChange(()=> update(cube, cubeLabel));
        cubeFolder_scale.add(cube.scale, 'y', -5, 5).onChange(()=> update(cube, cubeLabel));
        cubeFolder_scale.add(cube.scale, 'z', -5, 5).onChange(()=> update(cube, cubeLabel));
        cubeFolder_scale.close();

        const cubeFolder_material=  cubeFolder.addFolder('Cube material');
        cubeFolder_material.addColor(material, 'color').onChange(()=> update(cube, cubeLabel));
        cubeFolder_material.add(material, 'wireframe').onChange(()=> update(cube, cubeLabel));
        cubeFolder_material.add(material, 'visible').onChange(()=> update(cube, cubeLabel));
        cubeFolder_material.close();

        cubeFolder.close();
        
   
    }
    
    if(centerSphere){
        // Adicionar uma esfera pequena no centro do cubo
        const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const centerSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        centerSphere.position.set(0, 0, 0);
        cube.add(centerSphere);

        // Criar eixos para visualizar os eixos x, y e z em relação ao mundo
        const axesHelper = new THREE.AxesHelper(2); // O parâmetro define o comprimento dos eixos
        cube.add(axesHelper);
    }

    
    return {cube, cubeLabel}
}


  function update(cube, cubeLabel){
        cubeLabel.position.set(cube.position.x, cube.position.y + 0.5, cube.position.z);
  }

  export { Cube };