
class Game{

  constructor(gameOptions, oculusOptions, videoOptions){
      console.log('%c[Game]', 'background: #7b1fa2; color: #fff', {THREE, gameOptions, oculusOptions, videoOptions});
      this.videoOptions = videoOptions;
      this.oculusOptions = oculusOptions;
      this.gameOptions = gameOptions;
      this.canvasR = gameOptions.canvasR;
      this.canvasL = gameOptions.canvasL;

      // Verificar se o WebGPU está disponível
      if (!navigator.gpu) {
          console.error('WebGPU is not supported in this browser.');
          return;
      }

  }


  settings(){
          // Configurar a cena
          const scene = new THREE.Scene();


          const fov = 10;
          const aspect = 2; // the canvas default
          const near = 0.1;
          const far = 100;
    
          // Configurar a câmera
          const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
          // const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
          camera.position.set( 0, 0, 20 );
          // camera.lookAt( 0, 0, 0 );
  
          // Configurar o renderizador
       
          const rendererL = new THREE.WebGLRenderer({antialias: false, alpha: true});
          const rendererR = new THREE.WebGLRenderer({antialias: false, alpha: false});

          // const controls = new OrbitControls( camera, rendererL.domElement );
          
  
  
          console.log('%c[Game]', 'background: #7b1fa2; color: #fff',{rendererL, innerWidth : window.innerWidth, innerHeight : window.innerHeight});
          // renderer.setSize(window.innerWidth, window.innerHeight);
  
          rendererL.setPixelRatio(window.devicePixelRatio);
          rendererR.setPixelRatio(window.devicePixelRatio);
          // rendererL.setSize(window.innerWidth / 2, window.innerHeight / 2);
          rendererL.setSize(this.videoOptions.video.element.videoWidth, this.videoOptions.video.element.videoHeight);
          rendererR.setSize(this.videoOptions.video.element.videoWidth, this.videoOptions.video.element.videoHeight);
  
          // rendererL.domElement.style.position = 'absolute';
          // console.log(this.videoOptions.video.element.videoWidth);
          // rendererL.domElement.style.left = '38%';
          // rendererL.domElement.style.top = this.canvasL.style.top;
          rendererL.domElement.classList.add('renderer');
  
          rendererR.domElement.style.position = 'absolute';
          // rendererR.domElement.style.right = this.oculusOptions.eyeRight.offsetX;
          // rendererR.domElement.style.top = this.canvasL.style.top;
          rendererR.domElement.classList.add('renderer');
          rendererR.domElement.classList.add('full');
  
          // const contextCanvasR = document.querySelector('#overlay2').getContext('2d',  { willReadFrequently: true });
          // contextCanvasR.drawImage(rendererL.domElement, 0, 0, this.canvasR.width, this.canvasR.height);
  
          console.log('%c[Game]', 'background: #7b1fa2; color: #fff', {width: this.canvasL.width});
      
          document.querySelector('.vr-container').appendChild(rendererL.domElement);
          document.querySelector('.vr-container').appendChild(rendererR.domElement);

          return {scene, camera, rendererL, rendererR};
  
  }

  init(){

    const {scene, camera, rendererL, rendererR} = this.settings();


    // Adicionar um cubo
    // const geometry = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64); // (1, 1, 1, 32, 32, 32) or (1, 1, 1, 8, 8, 8)
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 64, 64, 64); 
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
    const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);


    const materialLine = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    const points = [];
    points.push( new THREE.Vector3( -1, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 1, 0 ) );
    points.push( new THREE.Vector3( 1, 0, 0 ) );
    const geometryLine = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometryLine, materialLine );
    // scene.add( line );


    // Adicionar uma luz
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);


    // Carregar fonte e criar geometria de texto
    var textMesh = null;
    var loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        var textGeometry = new THREE.TextGeometry('Hello, Three.js!', {
            font: font,
            size: 1,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        });

        var textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        // scene.add(textMesh);
    });


    var loaderGL = new THREE.GLTFLoader();
    loaderGL.load('../../es/source/Curious skeleton.glb', function (gltf) {
        var model = gltf.scene;
        scene.add(model);

        // Opcional: animação do modelo
        var mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });

    
        // Atualizar a animação
        function animate_() {
            requestAnimationFrame(animate_);

            var delta = clock.getDelta();
            mixer.update(delta);

            rendererL.render(scene, camera);
        }

        var clock = new THREE.Clock();
        animate_();
    
    }, undefined, function (error) {
        console.error('Erro ao carregar o modelo:', error);
    });


   
    
    // Configurar Stats.js
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    document.body.appendChild(stats.dom);

    // Função de animação
    function animate() {

        stats.begin();

        requestAnimationFrame(animate);

        // Girar o cubo
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        // Atualizações para a animação
        line.rotation.x += 0.01;
        line.rotation.y += 0.01;

        // Atualizações para a animação (se necessário)
        if(textMesh){
            textMesh.rotation.x += 0.01;
            textMesh.rotation.y += 0.01;
        }


        rendererL.render(scene, camera);
        rendererR.render(scene, camera);

        stats.end();
    }

    animate();

    // Ajustar o tamanho da tela ao redimensionar a janela
    window.addEventListener('resize', () => {
        rendererL.setSize(window.innerWidth, window.innerHeight);
        rendererR.setSize(window.innerWidth, window.innerHeight);

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
  

  }
}


export  {Game};
