
import { OrbitControls } from '../OrbitControls.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm';
import {FirstPersonCamera} from '../FirstPersonCamera.js';

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

  perspectiveCamera({fov=75, aspect=window.innerWidth / window.innerHeight, near=0.1, far=1000}){
    let camera = new THREE.PerspectiveCamera(fov, aspect, near, far) ;
    console.log('%c[Game]', 'background: #7b1fa2; color: #fff', {camera, fov, aspect, near, far});

    // camera.position.set( 0, 1, 5 );
    // camera.lookAt(new THREE.Vector3(0,0,0));
    return camera;
  }


  settings(){
        // Configurar a cena
        const scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x88ccee );
        // scene.fog = new THREE.Fog( 0x88ccee, 0, 50 );

       
        const camera = this.perspectiveCamera( {
            fov:20,
            aspect:2, // the canvas default
            near:1,
            far:250,
        });

    
        // Configurar o renderizador
        const rendererL = new THREE.WebGLRenderer({antialias: false, alpha: false});
        const rendererR = new THREE.WebGLRenderer({antialias: false, alpha: false});
        rendererL.setPixelRatio(window.devicePixelRatio);
        rendererR.setPixelRatio(window.devicePixelRatio);
        rendererL.setSize(this.videoOptions.video.element.videoWidth, this.videoOptions.video.element.videoHeight);
        rendererR.setSize(this.videoOptions.video.element.videoWidth, this.videoOptions.video.element.videoHeight);

        rendererL.domElement.classList.add('renderer');
        rendererL.domElement.classList.add('full');

        rendererR.domElement.classList.add('renderer');
        rendererR.domElement.classList.add('none');

        document.querySelector('.vr-container').appendChild(rendererL.domElement);
        document.querySelector('.vr-container').appendChild(rendererR.domElement);

        // const controls = new OrbitControls( camera, rendererL.domElement );
        // controls.lookSpeed = 0.1;
        // controls.movementSpeed = 5;
        // controls.update();



        // const characterGeometry = new THREE.BoxGeometry(1, 2, 1);
        // const characterMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
        // const character = new THREE.Mesh(characterGeometry, characterMaterial);
        // scene.add(character);

        // Posicionar a câmera na posição inicial do personagem
        // camera.position.set(character.position.x, character.position.y + 1.6, character.position.z);


        // const fpCamera = null; 
        // const fpCamera = new FirstPersonCamera(camera, rendererL.domElement, character, scene);
       

  

        // console.log('%c[Game]', 'background: #7b1fa2; color: #fff',{rendererL, innerWidth : window.innerWidth, innerHeight : window.innerHeight});
        // renderer.setSize(window.innerWidth, window.innerHeight);

      
  

        // rendererL.domElement.style.position = 'absolute';
        // console.log(this.videoOptions.video.element.videoWidth);
        // rendererL.domElement.style.left = '38%';
        // rendererL.domElement.style.top = this.canvasL.style.top;
       

        // rendererR.domElement.style.position = 'absolute';
        // rendererR.domElement.style.right = this.oculusOptions.eyeRight.offsetX;
        // rendererR.domElement.style.top = this.canvasL.style.top;
  
    //   rendererR.domElement.classList.add('full');

        // const contextCanvasR = document.querySelector('#overlay2').getContext('2d',  { willReadFrequently: true });
        // contextCanvasR.drawImage(rendererL.domElement, 0, 0, this.canvasR.width, this.canvasR.height);

      

        return {scene, camera, rendererL, rendererR, controls: null, fpCamera: null, character: null};
  
  }

  init(){

    const {scene, camera, rendererL, rendererR} = this.settings()
    // const {scene, camera, rendererL, rendererR, controls, fpCamera, character} = this.settings();
   
   
    // Adicionar um cubo
    // const geometry = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64); // (1, 1, 1, 32, 32, 32) or (1, 1, 1, 8, 8, 8)
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 64, 64, 64); 
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });

    /*
    const cube = new THREE.Mesh(geometry, material);
    const gui = new GUI();
    let model = null;
    // scene.add(cube);


    // Configurações para a câmera
    // const cameraFolder = gui.addFolder('Camera');
    // cameraFolder.add(camera.position, 'x', -10, 10);
    // cameraFolder.add(camera.position, 'y', -10, 10);
    // cameraFolder.add(camera.position, 'z', -10, 10);
    // cameraFolder.add(camera.rotation, 'x', 0, Math.PI * 4);
    // cameraFolder.add(camera.rotation, 'y', 0, Math.PI * 4);
    // cameraFolder.add(camera.rotation, 'z', 0, Math.PI * 4);
    // // cameraFolder.add(camera, 'fov', 1, 100).onChange(() => camera.updateProjectionMatrix());
    // cameraFolder.open();


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
    // loaderGL.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb', function (gltf) {
    // loaderGL.load('../../obj/person.glb', function (gltf) {
        // return
        var model = gltf.scene;
        var clips = gltf.animations;

        scene.add(model);


        // Configuração do dat.gui para o modelo person.glb
        const personFolder = gui.addFolder('Person Model');
        personFolder.add(model.position, 'x', -10, 10);
        personFolder.add(model.position, 'y', -10, 10);
        personFolder.add(model.position, 'z', -10, 10);
        personFolder.add(model.rotation, 'x', 0, Math.PI * 2);
        personFolder.add(model.rotation, 'y', 0, Math.PI * 2);
        personFolder.add(model.rotation, 'z', 0, Math.PI * 2);
        personFolder.add(model.scale, 'x', 0.1, 10);
        personFolder.add(model.scale, 'y', 0.1, 10);
        personFolder.add(model.scale, 'z', 0.1, 10);
        personFolder.open();


        // Opcional: animação do modelo
        var mixer = new THREE.AnimationMixer(model);
        
        //   const clip = THREE.AnimationClip.findByName( clips, 'idle' );
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });
        console.log('%c[Game]', 'background: #7b1fa2; color: #fff', {mixer, gltf, clips});

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


    loaderGL.load('../../obj/first_person.glb', function (gltf) {
        model = gltf.scene;
        var clips = gltf.animations;
        scene.add( model );
    }, undefined, function (error) {
        console.error('Erro ao carregar o modelo:', error);
    });


    // Criar a geometria do plano
    const planeDefinition = 100;
    const planeSize = 1245000;
    const meshColor = "#005e97"; 
    const geometry_plane = new THREE.PlaneGeometry(planeSize, planeSize, planeDefinition, planeDefinition);
    const material_plane = new THREE.MeshBasicMaterial({ 
        color:meshColor,
        side: THREE.DoubleSide, 
        wireframe: false 
    });
    
    const plane = new THREE.Mesh(geometry_plane, material_plane); // Criar o mesh do plano
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    

    loaderGL.load( '../../obj/collision-world.glb', ( gltf ) => {

        // scene.add( gltf.scene );
        /*
        worldOctree.fromGraphNode( gltf.scene );

        gltf.scene.traverse( child => {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

                if ( child.material.map ) {

                    child.material.map.anisotropy = 4;

                }

            }

        } );

        const helper = new OctreeHelper( worldOctree );
        helper.visible = false;
        scene.add( helper );

        const gui = new GUI( { width: 200 } );
        gui.add( { debug: false }, 'debug' )
        .onChange( function ( value ) {

            helper.visible = value;

        } );

        *\/
    
    } );




    // Adicionar uma luz direcional (sol)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);


    // Adicionar uma luz ambiente para preencher sombras
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    */

    // Configurar Stats.js
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    document.body.appendChild(stats.dom);

    // Função de animação
    function animate() {

        stats.begin();

        requestAnimationFrame(animate);

        if(typeof cube !== 'undefined' && cube !== null) {
            // Girar o cubo
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        }
    

        if(typeof line !== 'undefined' && line !== null) {
            // Atualizações para a animação
            line.rotation.x += 0.01;
            line.rotation.y += 0.01;
 
        }
 
        // Atualizações para a animação (se necessário)
        if(typeof textMesh !== 'undefined' && textMesh !== null) {
            textMesh.rotation.x += 0.01;
            textMesh.rotation.y += 0.01;
        }

        /*

        controls && controls.update();
        fpCamera.update();

        if (typeof model !== 'undefined' && model !== null) {
            var characterPosition = character.position.clone();
            var distanceInFrontOfCamera = 2; // Distância na frente da câmera
    
            // Calcula a posição do modelo na frente da câmera
            var direction = new THREE.Vector3();
            character.getWorldDirection(direction);
            direction.multiplyScalar(distanceInFrontOfCamera);
            console.log({characterPosition});
            // Adiciona um deslocamento para ajustar a posição do modelo
            var offsetX = -0.5; // Ajuste para a direita/esquerda
            var offsetY = 0.8; // Ajuste para cima/baixo
            var offsetZ = 0; // Ajuste para frente/trás

            var offset = new THREE.Vector3(offsetX, offsetY, offsetZ);
            model.position.copy(characterPosition).add(direction).add(offset);

         
    
            // Opcional: Ajuste a rotação do modelo para que ele sempre fique de frente para a direção da câmera
            model.lookAt(characterPosition);
        }

        */

        rendererL.render(scene, camera);
        // rendererR.render(scene, camera);

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
