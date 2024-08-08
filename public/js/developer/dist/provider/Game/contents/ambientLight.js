function AmbientLight({color=0x404040, gui}){
    // Adicionar uma luz ambiente
    const ambientLight = new THREE.AmbientLight(color); // luz ambiente fraca
    const ambientLightFolder = gui.addFolder('ambient Light');
    ambientLightFolder.add(ambientLight, 'intensity', 0, 1, 0.01);
    ambientLightFolder.add(ambientLight, 'visible');
    ambientLightFolder.add(ambientLight, 'castShadow');
    ambientLightFolder.close();

    return { ambientLight };
}


export { AmbientLight }