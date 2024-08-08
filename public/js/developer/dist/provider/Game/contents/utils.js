function CreateLabel(text, position) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 12;

    // Definir o tamanho do canvas com base no texto
    const textWidth = context.measureText(text).width;
    console.log({text: context.measureText(text)});
    canvas.width = textWidth + 8; // Adicionar alguma margem
    canvas.height = textWidth ; // Adicionar alguma margem

    // Desenhar fundo do rótulo
    context.fillStyle = 'red';
    context.fillRect(0, 0, canvas.width, (fontSize + fontSize * 0.3));

    context.font = `${fontSize}px Arial`;
    context.fillStyle = 'white';
    context.fillText(text, 0, fontSize);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.1, 0.1, 0.1); // Ajuste conforme necessário
    sprite.position.copy(position);
    sprite.position.y += 0.3; // Ajustar a posição acima do objeto

    
    return sprite;
}



export { CreateLabel };