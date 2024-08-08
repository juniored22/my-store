 function Plane({
    meshColor = "#005e97",
    planeDefinition = 100,
    planeSize = 1245000,
    gui
 }) {
    // Criar a geometria do plano
    const geometry_plane = new THREE.PlaneGeometry(planeSize, planeSize, planeDefinition, planeDefinition);

    //MeshBasicMaterial
    const material_plane = new THREE.MeshPhongMaterial({  
    // const material_plane = new THREE.MeshStandardMaterial({ 
        color:meshColor,
        side: THREE.DoubleSide, 
        shininess: 50, // controla o brilho da superfície
        specular: 0x111111 // cor do brilho especular
    });
    
    const plane = new THREE.Mesh(geometry_plane, material_plane); // Criar o mesh do plano
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;

    // Adicionar wireframe
    const wireframe = new THREE.WireframeGeometry(geometry_plane);
    const line = new THREE.LineSegments(wireframe);
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    plane.add(line);

    const planeFolder = gui.addFolder('Plane');
    planeFolder.add(plane, 'visible');
    planeFolder.add(plane, 'receiveShadow');
    
    const planeFolder_position = planeFolder.addFolder('Plane Position');
    planeFolder_position.add(plane.position, 'x', -10, 10);
    planeFolder_position.add(plane.position, 'y', -10, 10);
    planeFolder_position.add(plane.position, 'z', -10, 10);
    planeFolder_position.close();

    const planeFolder_rotation = planeFolder.addFolder('Plane Rotation');
    planeFolder_rotation.add(plane.rotation, 'x', 0, Math.PI * 2);
    planeFolder_rotation.add(plane.rotation, 'y', 0, Math.PI * 2);
    planeFolder_rotation.add(plane.rotation, 'z', 0, Math.PI * 2);
    planeFolder_rotation.close();

    const planeFolder_scale = planeFolder.addFolder('Plane Scale');
    planeFolder_scale.add(plane.scale, 'x', 0, 10);
    planeFolder_scale.add(plane.scale, 'y', 0, 10);
    planeFolder_scale.add(plane.scale, 'z', 0, 10);
    planeFolder_scale.close();

    const planeFolder_color = planeFolder.addFolder('Plane Color');
    planeFolder_color.addColor(plane.material, 'color');
    planeFolder_color.close();
    
    planeFolder.close();

    return { plane, planeFolder }
}


export { Plane }