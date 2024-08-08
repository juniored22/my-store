

function Camera({
    fov, 
    aspect, 
    near, 
    far, 
    gui, 
    folder= 'Camera',
    position = {x: 0, y: 0, z: 20},
    rotation = {x: 0, y: 0, z: 0},
    lookAt = {x: 0, y: 0, z: 0},
    up = {x: 0, y: 0, z: 0},
}) {

    let camera = new THREE.PerspectiveCamera(fov, aspect, near, far) ;
    console.log('%c[Game]', 'background: #7b1fa2; color: #fff', {camera, fov, aspect, near, far});
    camera.position.set( position.x, position.y, position.z );
    camera.rotation.set( rotation.x, rotation.y, rotation.z );
    camera.lookAt(lookAt);
    camera.up.set( up.x, up.y, up.z );
    // camera.setFocalLength(fov);
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    const cameraHelper = new THREE.CameraHelper( camera );
    cameraHelper.visible = false;

    const folderDefault = gui.addFolder(folder);
    folderDefault.add(cameraHelper, 'visible').name(folder+' Helper');
    folderDefault.add(camera, 'updateProjectionMatrix');
    folderDefault.add(camera, 'updateMatrixWorld');
    folderDefault.add(camera, 'clearViewOffset');
    folderDefault.add(camera, 'zoom', 0, 100);
    folderDefault.add(camera, 'fov', 0, 180);
    folderDefault.add(camera, 'aspect', 0, 5);
    folderDefault.add(camera, 'near', 0, 1000);
    folderDefault.add(camera, 'far', 0, 1000);

    const folderDefault_up = folderDefault.addFolder(folder+' up');
    folderDefault_up.add(camera.up, 'x', -100, 100);
    folderDefault_up.add(camera.up, 'y', -100, 100);
    folderDefault_up.add(camera.up, 'z', -100, 100);
    folderDefault_up.close();


    const folderDefault_position = folderDefault.addFolder(folder+' Position');
    folderDefault_position.add(camera.position, 'x', -100, 100);
    folderDefault_position.add(camera.position, 'y', -100, 100);
    folderDefault_position.add(camera.position, 'z', -100, 100);
    // folderDefault_position.add(cameras.camera.rotation, 'order', ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'])

    const folderDefault_rotation = folderDefault.addFolder(folder+' Rotation');
    folderDefault_rotation.add(camera.rotation, 'x', -Math.PI, Math.PI)
    folderDefault_rotation.add(camera.rotation, 'y', -Math.PI, Math.PI)
    folderDefault_rotation.add(camera.rotation, 'z', -Math.PI, Math.PI)

    folderDefault_rotation.close();
    folderDefault_position.close();
    folderDefault.close();
    
    return {camera, cameraHelper};
}

export { Camera }