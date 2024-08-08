import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm';
import { OrbitControls } from '../OrbitControls.js';
import { FirstPersonCamera } from '../FirstPersonCamera.js';
import { Cube, Line, Plane, AmbientLight, Light, Camera } from './contents/geometria.js';

class Game {
  constructor(gameOptions, oculusOptions, videoOptions) {
    console.log('%c[Game]', 'background: #7b1fa2; color: #fff', { THREE, gameOptions, oculusOptions, videoOptions });

    // Verificar se o WebGPU está disponível
    if (!navigator.gpu) {
      console.error('WebGPU is not supported in this browser.');
      return;
    }

    this.videoOptions = videoOptions;
    this.oculusOptions = oculusOptions;
    this.gameOptions = gameOptions;
    this.canvasR = gameOptions.canvasR;
    this.canvasL = gameOptions.canvasL;
    this.activeCamera = 'thirdPersonCamera'; // can be 'camera', 'camera2'  or 'thirdPersonCamera'
    this.activeHelper = 'cameraHelper'; // can be 'cameraHelper' or 'camera2Helper'
    this.controls = 'controls'; // can be 'controls' or 'controls2'
    this.animationsMap = {};

  }

  orbitControls({render, camera, options = {
    enableDamping: true,
    dampingFactor: 0.25,
    screenSpacePanning: false,
    minDistance: 5,
    enablePan : true,
    maxDistance: 50,
    maxPolarAngle: Math.PI / 2,
    minPolarAngle: Math.PI / 2
  }}){
    const controls = new OrbitControls(camera, render.domElement);
    // Configurações para OrbitControls
    controls.enableDamping = options.enableDamping; // Habilitar amortecimento (inércia)
    controls.dampingFactor = options.dampingFactor; // Fator de amortecimento
    controls.enablePan = options.enablePan;
    controls.screenSpacePanning = options.screenSpacePanning; // Desabilitar movimento em tela
    controls.minDistance = options.minDistance; // Distância mínima de zoom
    controls.maxDistance = options.maxDistance; // Distância máxima de zoom
    controls.minPolarAngle = options.minPolarAngle; // Ángulo polar mínimo (limita a rotação vertical)
    controls.maxPolarAngle = options.maxPolarAngle; // Ângulo polar máximo (limita a rotação vertical)

    return controls;
  }

  async init({oculus=null}) {

    
    const { scene, camera, cameraHelper, rendererL, rendererR, gui } = this.settings();

    const { light, shadowCameraHelper, lightCubeDebug, lightLabel, lightFolder } = new Light({ gui, scene, folder: 'Light' }); 
    const { plane } = new Plane({ meshColor: 0x000000, planeDefinition: 100, planeSize: 1245000, gui });  // Adicionar um plano
    const { ambientLight } = new AmbientLight({gui}); // luz ambiente fraca
    const { cube, cubeLabel } = new Cube({ visible: true, color: 0x0000ff, wireframe: false, gui, position: { x: -1, y: 1, z: 0 } }); // Adicionar um cubo
    const keys = { w: false, a: false, s: false, d: false, space: false };
    const moveSpeed = 0.001;
    const turnSpeed = 0.02;
    let animationsMap = {};
    let activeAction = null;
    let idleAction = null;
    let previousAction = null;
    let fadeDuration = 0.2;
    let animationSpeed = 1;
    let yaw = 0;
    let pitch = 0;
    let isMouseDown = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };


    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.angle = 0.05;
    spotLight.distance = 0;
    // spotLight.penumbra = 0.5;
    spotLight.position.set(1,16, 10, -4,74);  
    // spotLight.castShadow = true;
    // spotLight.shadow.camera.near = 3;
    // spotLight.shadow.camera.far = 10;
    // spotLight.shadow.mapSize.width = 1024;
    // spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);

    const spotLightFolder = gui.addFolder('Spot Light');
    spotLightFolder.add(spotLight.position, 'x', -50, 50);
    spotLightFolder.add(spotLight.position, 'y', -50, 50);
    spotLightFolder.add(spotLight.position, 'z', -50, 50);
    spotLightFolder.add(spotLight, 'intensity', 0, 1000);
    spotLightFolder.add(spotLight, 'distance', 0, 1000);
    spotLightFolder.add(spotLight, 'decay', 0, 10);
    spotLightFolder.add(spotLight, 'angle', 0, Math.PI);
    spotLightFolder.add(spotLight, 'penumbra', 0, 1);
    spotLightFolder.add(spotLight, 'castShadow');

    spotLightFolder.close();

    // Criar a primeira pessoa
    const cameraInstance = new Camera({
      fov: 20,
      aspect: 2,
      near: 1,
      far: 200,
      gui,
      folder: 'Camera 2',
      position: { x: 0, y: 10, z: 0 },
      rotation: { x: 6, y: 0, z: 0 },
      lookAt: { x: 0, y: 0, z: 0 },
      up: {x: 0, y: 1, z: 0},
    });

    // Criar a câmera de terceira pessoa
    const thirdPersonCameraInstance = new Camera({
      fov:75,
      aspect: 16 / 9,
      near: 0.01,
      far: 1000,
      gui,
      folder: 'thirdPersonCamera',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      lookAt: { x: 0, y: 0, z: 0 },
      up: {x: 0, y: 0, z: 0},
    });

    // Configurações para OrbitControls
    const controls = this.orbitControls({camera, render: rendererL});
    const controls2 = this.orbitControls({camera:cameraInstance.camera, render: rendererL});
    const controls3 = this.orbitControls({camera:thirdPersonCameraInstance.camera, render: rendererR});

    // Criar cameras
    const cameras = {
      camera: camera,
      camera2: cameraInstance.camera,
      thirdPersonCamera: thirdPersonCameraInstance.camera,
      controls: {
        camera: controls,
        camera2: controls2,
        thirdPersonCamera: controls3
      },
      helpers:{
        cameraHelper: cameraHelper,
        camera2Helper: cameraInstance.cameraHelper,
        camera3Helper: thirdPersonCameraInstance.cameraHelper
      }
    };

    if(cameras.camera) cameras['cameraHelper'] = cameras.helpers.cameraHelper;
    if(cameras.camera2)  cameras['camera2Helper'] = cameras.helpers.camera2Helper;
    if(cameras.thirdPersonCamera) cameras['camera3Helper'] = cameras.helpers.camera3Helper;

    scene.add(cameras.helpers.cameraHelper);
    scene.add(cameras.helpers.camera2Helper);
    scene.add(cameras.helpers.camera3Helper);
    scene.add(light);
    scene.add(lightLabel);
    scene.add(lightCubeDebug);
    scene.add(ambientLight);
    scene.add(cube);
    scene.add(cubeLabel);
    scene.add(plane);

    shadowCameraHelper.visible = false;
    shadowCameraHelper && scene.add(shadowCameraHelper);
    if(shadowCameraHelper){
      const shadowCameraHelperFolder = lightFolder.addFolder('Shadow Camera Helper');
      shadowCameraHelperFolder.add(shadowCameraHelper, 'visible').name('Visible');
      shadowCameraHelperFolder.add(shadowCameraHelper, 'castShadow');
      shadowCameraHelperFolder.add(shadowCameraHelper, 'receiveShadow');
      shadowCameraHelperFolder.add(shadowCameraHelper, 'frustumCulled');
      shadowCameraHelperFolder.add(shadowCameraHelper, 'renderOrder', 0, 100);
      shadowCameraHelperFolder.add(shadowCameraHelper.material, 'opacity', 0, 1, 0.01);   
      shadowCameraHelperFolder.add(shadowCameraHelper.material, 'transparent');
      shadowCameraHelperFolder.add(shadowCameraHelper.material, 'depthWrite');
      shadowCameraHelperFolder.add(shadowCameraHelper.material, 'colorWrite');
      shadowCameraHelperFolder.add(shadowCameraHelper.material, 'depthTest');
      shadowCameraHelperFolder.add(shadowCameraHelper.material, 'alphaTest', 0, 1, 0.01);
      shadowCameraHelperFolder.add(shadowCameraHelper.material, 'visible');
      shadowCameraHelperFolder.close();
    }

    const gridHelper = new THREE.GridHelper( 50, 50 );
    gridHelper.position.y = 0.01;
    scene.add( gridHelper );

    const gridHelperFolder = gui.addFolder('Grid Helper');
    gridHelperFolder.add(gridHelper, 'visible').name('Visible');
    gridHelperFolder.add(gridHelper, 'renderOrder', 0, 100);
    gridHelperFolder.add(gridHelper.material, 'opacity', 0, 1, 0.01);   
    gridHelperFolder.add(gridHelper.material, 'transparent');
    gridHelperFolder.add(gridHelper.material, 'depthWrite');
    gridHelperFolder.add(gridHelper.material, 'colorWrite');
    gridHelperFolder.add(gridHelper.material, 'depthTest');
    gridHelperFolder.add(gridHelper.material, 'alphaTest', 0, 1, 0.01);
    gridHelperFolder.close();


  
    if(true){
      // Adicionar AxesHelper à cena para visualizar os eixos globais
      const globalAxesHelper = new THREE.AxesHelper(2);
      globalAxesHelper.material.vertexColors = true;
      globalAxesHelper.geometry.attributes.color.array = new Float32Array([
          1, 0, 0, // X axis color (red)
          0, 1, 0, // Y axis color (green)
          0, 0, 1  // Z axis color (blue)
      ]);
      globalAxesHelper.visible = false;
      scene.add(globalAxesHelper);

      const globalAxesHelperFolder = gui.addFolder('Global Axes Helper');
      globalAxesHelperFolder.add(globalAxesHelper, 'visible');
      globalAxesHelperFolder.add(globalAxesHelper.material, 'vertexColors');
      globalAxesHelperFolder.addColor(globalAxesHelper.material, 'color');
      globalAxesHelperFolder.add(globalAxesHelper, 'updateMatrixWorld');
      globalAxesHelperFolder.add(globalAxesHelper, 'updateWorldMatrix');
      globalAxesHelperFolder.add(globalAxesHelper, 'updateMatrix');

      const globalAxesHelperFolder_material = globalAxesHelperFolder.addFolder('Material');
      globalAxesHelperFolder_material.add(globalAxesHelper.material, 'opacity', 0, 1, 0.01);
      globalAxesHelperFolder_material.add(globalAxesHelper.material, 'transparent');
      globalAxesHelperFolder_material.add(globalAxesHelper.material, 'depthWrite');
      globalAxesHelperFolder_material.add(globalAxesHelper.material, 'colorWrite');
      globalAxesHelperFolder_material.add(globalAxesHelper.material, 'depthTest');
      globalAxesHelperFolder_material.add(globalAxesHelper.material, 'alphaTest', 0, 1, 0.01);
      globalAxesHelperFolder_material.add(globalAxesHelper.material, 'visible');
      globalAxesHelperFolder_material.close();
      globalAxesHelperFolder.close();

       // Adicionar setas para identificar os eixos
      const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 5, 0xff0000); // Eixo X (vermelho)
      const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 5, 0x00ff00); // Eixo Y (verde)
      const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 5, 0x0000ff); // Eixo Z (azul)
      arrowX.visible = false;
      arrowY.visible = false;
      arrowZ.visible = false;
      scene.add(arrowX);
      scene.add(arrowY);
      scene.add(arrowZ);
      const axesHelperFolder = globalAxesHelperFolder.addFolder('Axes Helper');
      axesHelperFolder.add(arrowX, 'visible').name('Arrow X Visible');
      axesHelperFolder.add(arrowY, 'visible').name('Arrow Y Visible');
      axesHelperFolder.add(arrowZ, 'visible').name('Arrow Z Visible');
    }

    var loaderGL = new THREE.GLTFLoader();

    loaderGL.load('../../es/source/Curious skeleton.glb', function (gltf) {
      var model = gltf.scene;
      var clips = gltf.animations;

      scene.add(model);

      // Configuração do dat.gui para o modelo person.glb
      const personFolder = gui.addFolder('Person Model [skeleton]');
      personFolder.add(model, 'visible');
      personFolder.add(model.position, 'x', -10, 10);
      personFolder.add(model.position, 'y', -10, 10);
      personFolder.add(model.position, 'z', -10, 10);
      personFolder.add(model.rotation, 'x', 0, Math.PI * 2);
      personFolder.add(model.rotation, 'y', 0, Math.PI * 2);
      personFolder.add(model.rotation, 'z', 0, Math.PI * 2);
      personFolder.add(model.scale, 'x', 0.1, 10);
      personFolder.add(model.scale, 'y', 0.1, 10);
      personFolder.add(model.scale, 'z', 0.1, 10);
      personFolder.close();

      // Opcional: animação do modelo
      var mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
      console.log('%c[Game]', 'background: #7b1fa2; color: #fff', { mixer, gltf, clips });

      // Atualizar a animação
      const animate_ = () => {
        requestAnimationFrame(animate_);
        var delta = clock.getDelta();
        mixer.update(delta);
      };

      var clock = new THREE.Clock();
      animate_();
    }, undefined, function (error) {
      console.error('Erro ao carregar o modelo:', error);
    });

    loaderGL.load('../../obj/Person/person.glb', function (gltf) {
      let model = gltf.scene;
      var clips = gltf.animations;
      model.position.set(2.5, 0, 4.1);
      scene.add(model);


      const bbox = new THREE.BoxHelper(model, 0xff0000);
      scene.add(bbox);

      // Opcional: animação do modelo
      const personFolder = gui.addFolder('Person Model [person]');
      personFolder.add(model, 'visible');
      personFolder.add(model.position, 'x', -10, 10);
      personFolder.add(model.position, 'y', -10, 10);
      personFolder.add(model.position, 'z', -10, 10);
      personFolder.add(model.rotation, 'x', 0, Math.PI * 2);
      personFolder.add(model.rotation, 'y', 0, Math.PI * 2);
      personFolder.add(model.rotation, 'z', 0, Math.PI * 2);
      personFolder.add(model.scale, 'x', 0.1, 10);
      personFolder.add(model.scale, 'y', 0.1, 10);
      personFolder.add(model.scale, 'z', 0.1, 10);
      personFolder.close(); 

      var mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        if(clip.name == 'idle'){
          mixer.clipAction(clip).play();
        }
        
      });

      // Atualizar a animação
      const animate_ = () => {
        requestAnimationFrame(animate_);
        var delta = clock.getDelta();
        mixer.update(delta);
      };

      var clock = new THREE.Clock();
      animate_();
    }, undefined, function (error) {
      console.error('Erro ao carregar o modelo:', error);
    });

    // Add a simple cube as the character
    const geometry_character = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    const material_character = new THREE.MeshBasicMaterial({ color: 0x00ff00 , wireframe: false, visible: false});
    const character = new THREE.Mesh(geometry_character, material_character);
    // Position the character
    character.position.set(2.5, 0.8, 5);
    // character.rotation.y = Math.PI;



    const switchAnimation = (name) => {
      if (activeAction && activeAction.isRunning()) {
        previousAction = activeAction;
        activeAction = animationsMap[name];
        activeAction.clampWhenFinished = true;

        console.log({previousAction, getMixer: activeAction.getMixer()}, THREE.LoopRepeat, THREE.LoopPingPong, THREE.LoopOnce);
    
        if (activeAction) {
          // activeAction.reset().play();
          activeAction.reset().play();
          previousAction.crossFadeTo(activeAction, fadeDuration, false);
        }
      } else {
        activeAction = animationsMap[name];
        if (activeAction) {
          activeAction.play();
        }
      }
    }

    const switchAnimation2 = (name) => {
      if (activeAction && activeAction.isRunning()) {
        previousAction = activeAction;
        activeAction = animationsMap[name];
        // activeAction.clampWhenFinished = true;

    
        if (activeAction) {
          activeAction.repetitions  = 1;

    
          activeAction.reset().play();
          // Verificando se os eventos estão configurados
          console.log('Callbacks configurados:', activeAction);
          previousAction.crossFadeTo(activeAction, fadeDuration, false);
          
        }
      } else {
        activeAction = animationsMap[name];
        if (activeAction) {
          activeAction.play();
        }
      }
    }

    const switchAnimation3 = (name) => {
      if (activeAction && activeAction.isRunning()) {
        previousAction = activeAction;
        activeAction = animationsMap[name];
        activeAction.clampWhenFinished = true;

        console.log({previousAction, getMixer: activeAction.getMixer()}, THREE.LoopRepeat, THREE.LoopPingPong, THREE.LoopOnce);
    
        if (activeAction) {

          activeAction.play();
          // previousAction.crossFadeTo(activeAction, fadeDuration, false);
        }
      } else {
        activeAction = animationsMap[name];
        if (activeAction) {
          activeAction.play();
        }
      }
    }


    loaderGL.load('../../obj/Person/person.glb', function (gltf) {
      let model = gltf.scene;
      var clips = gltf.animations;
      model.position.set(0, -0.8, 0);
      model.rotation.y = Math.PI;
      character.add(model);

      console.log({clips});


      // Opcional: animação do modelo
      const personFolder = gui.addFolder('Person Model [character]');
      personFolder.add(model, 'visible');
      personFolder.add(model.position, 'x', -10, 10);
      personFolder.add(model.position, 'y', -10, 10);
      personFolder.add(model.position, 'z', -10, 10);
      personFolder.add(model.rotation, 'x', 0, Math.PI * 2);
      personFolder.add(model.rotation, 'y', 0, Math.PI * 2);
      personFolder.add(model.rotation, 'z', 0, Math.PI * 2);
      personFolder.add(model.scale, 'x', 0.1, 10);
      personFolder.add(model.scale, 'y', 0.1, 10);
      personFolder.add(model.scale, 'z', 0.1, 10);
      personFolder.close(); 

      var mixer = new THREE.AnimationMixer(model);

 
      gltf.animations.forEach((clip) => {
        animationsMap[clip.name] = mixer.clipAction(clip);
      });

      idleAction = animationsMap['idle'];
      if (idleAction) {
        idleAction.play();
      }

   

      console.log({animationsMap, debug: this});

      // Atualizar a animação
      const animate_ = () => {
        requestAnimationFrame(animate_);
        console.log({oculusObserverOculus: oculus.ObserverOculus});

        if(oculus && oculus.ObserverOculus && oculus.ObserverOculus.handDetect && (oculus.ObserverOculus.handDetect['Right'] == 'Open_Palm' && !oculus.ObserverOculus.handDetect['Left']) ){
          // console.log('%c[Right]', 'color: green',{right:animationsMap['right'].isRunning(), left: animationsMap['left'].isRunning(), idle: animationsMap['idle'].isRunning()});
          if(animationsMap['idle'].isRunning())
          {
            animationsMap['idle'].stop();
            animationsMap['right'].play();
          } else animationsMap['right'].play();     
          character.position.x += 0.01;
   
        }else if(oculus && oculus.ObserverOculus && oculus.ObserverOculus.handDetect && oculus.ObserverOculus.handDetect['Left'] ==  'Open_Palm' && !oculus.ObserverOculus.handDetect['Right']){
            if(animationsMap['idle'].isRunning())
            {
              animationsMap['idle'].stop();
              animationsMap['left'].play();
            } else animationsMap['left'].play();
            character.position.x -= 0.01;

        }
        else if(oculus && oculus.ObserverOculus && oculus.ObserverOculus.handDetect && oculus.ObserverOculus.handDetect['Right'] == 'Open_Palm' && oculus.ObserverOculus.handDetect['Left'] !=  'Open_Palm'){ //Closed_Fist
          if(animationsMap['idle'].isRunning())
          {
            animationsMap['idle'].stop();
            animationsMap['right'].play();
          } else animationsMap['right'].play();     
          character.position.x += 0.01;
   
        }else if(oculus && oculus.ObserverOculus && oculus.ObserverOculus.handDetect && oculus.ObserverOculus.handDetect['Left'] ==  'Open_Palm' && oculus.ObserverOculus.handDetect['Right'] != 'Open_Palm'){
            if(animationsMap['idle'].isRunning())
            {
              animationsMap['idle'].stop();
              animationsMap['left'].play();
            } else animationsMap['left'].play();
            character.position.x -= 0.01;

        }else if(oculus && oculus.ObserverOculus && oculus.ObserverOculus.punch){
          // oculus.ObserverOculus.punchWristRed

          if(oculus.ObserverOculus['punch-wrist-red']){
            console.log('%c[Right]', 'background: red;color: #fff;',{right:animationsMap['right'].isRunning(), left: animationsMap['left'].isRunning(), idle: animationsMap['idle'].isRunning()});
          }else if(oculus.ObserverOculus['punch-wrist-blue']){
            console.log('%c[Right]', 'background: blue;color: #fff;',{right:animationsMap['right'].isRunning(), left: animationsMap['left'].isRunning(), idle: animationsMap['idle'].isRunning()});
          }else{
            console.log('%c[Right]', 'background: orange;color: #fff;',{right:animationsMap['right'].isRunning(), left: animationsMap['left'].isRunning(), idle: animationsMap['idle'].isRunning()});
          }

          
          
          if(animationsMap['idle'].isRunning())
          {
            animationsMap['idle'].stop();
            animationsMap['punsh-right'].loop = THREE.LoopOnce; 
            animationsMap['punsh-right'].clampWhenFinished = true;
            animationsMap['punsh-right'].play();
          } else animationsMap['punsh-right'].play();
        }
        else{

          if(animationsMap['right'].isRunning())
          {
            animationsMap['punsh-right'].stop();
            animationsMap['right'].stop();
            // animationsMap['idle'].play();
          } 
          
          if(animationsMap['left'].isRunning())
          {
            animationsMap['punsh-right'].stop();
            animationsMap['left'].stop();
            // animationsMap['idle'].play();
          } 

          if(!animationsMap['punsh-right'].isRunning())
          {
            let cor = oculus.ObserverOculus['punch-wrist-blue'] ? 'blue' : 'green';
            cor = oculus.ObserverOculus['punch-wrist-red'] ? 'red' : cor;
            console.log('%c[Right]', 'color: ' + cor + ';', 'A animação terminou',  console.log({'punch': oculus.ObserverOculus['punch']}));
            animationsMap['punsh-right'].stop();
            animationsMap['idle'].play();
            // animationsMap['punsh-right'].stop();
            // animationsMap['idle'].play();
          }
         
        }

        var delta = clock.getDelta();
        mixer.update(delta);
      };

      var clock = new THREE.Clock();
      animate_();
    }, undefined, function (error) {
      console.error('Erro ao carregar o modelo:', error);
    });

    // character.add(cameras[this.activeCamera]);
    scene.add(character);

    // Adicionar AxesHelper para visualizar os eixos do personagem
    const axesHelperCharacter = new THREE.AxesHelper(1);
    character.add(axesHelperCharacter);

    // Adicionar ArrowHelper para visualizar a direção do personagem
    const direction = new THREE.Vector3(0, 0, 1); // Direção padrão (frente)
    const length = 5; // Comprimento da seta
    const color = 0xff0000; // Cor da seta
    const arrowHelper = new THREE.ArrowHelper(direction, character.position, length, color);
    scene.add(arrowHelper);

    const updateArrowHelper = () => {
      const dir = new THREE.Vector3(0, 0, -1); // Direção padrão (frente)
      dir.applyQuaternion(character.quaternion); // Aplicar a rotação do personagem
      arrowHelper.setDirection(dir);
      arrowHelper.position.copy(character.position);
    }
    
    const characterFolder = gui.addFolder('Character');
    if(true){
      characterFolder.add(character, 'visible');
      const characterFolder_position = characterFolder.addFolder('Character position');
      characterFolder_position.add(character.position, 'x', -10, 10);
      characterFolder_position.add(character.position, 'y', -10, 10);
      characterFolder_position.add(character.position, 'z', -10, 10);
      characterFolder_position.close();
      
      const characterFolder_rotation = characterFolder.addFolder('Character rotation');
      characterFolder_rotation.add(character.rotation, 'x', 0, Math.PI * 2);
      characterFolder_rotation.add(character.rotation, 'y', 0, Math.PI * 2);
      characterFolder_rotation.add(character.rotation, 'z', 0, Math.PI * 2);
      characterFolder_rotation.close();
  
      const characterFolder_scale = characterFolder.addFolder('Character scale');
      characterFolder_scale.add(character.scale, 'x', 0.1, 10);
      characterFolder_scale.add(character.scale, 'y', 0.1, 10);
      characterFolder_scale.add(character.scale, 'z', 0.1, 10);
      characterFolder_scale.close();
  
      const characterFolder_material = characterFolder.addFolder('Character material');
      characterFolder_material.add(material_character, 'wireframe');
      // characterFolder_material.add(material_character, 'color', 0x000000, 0xffffff);
      characterFolder_material.close();
  
      characterFolder.close();
    }

  
    // cameras.thirdPersonCamera.position.set(0.06, 1.28, -1.8);
    // cameras.thirdPersonCamera.rotation.set(3.65053066347134, 0, 3.16044220951133);
    // cameras.thirdPersonCamera.lookAt(character.position);

    if(true){
      const thirdPersonCameraFolder = gui.addFolder('Third Person Camera');
      thirdPersonCameraFolder.add(cameras.thirdPersonCamera, 'visible');
      thirdPersonCameraFolder.add(cameras.thirdPersonCamera, 'fov', 0, 180);
      thirdPersonCameraFolder.add(cameras.thirdPersonCamera, 'near', 0, 1000);
      thirdPersonCameraFolder.add(cameras.thirdPersonCamera, 'far', 0, 1000);
  
      
      const thirdPersonCameraFolder_position = thirdPersonCameraFolder.addFolder('Third Person Camera position');
      thirdPersonCameraFolder_position.add(cameras.thirdPersonCamera.position, 'x', -10, 10);
      thirdPersonCameraFolder_position.add(cameras.thirdPersonCamera.position, 'y', -10, 10);
      thirdPersonCameraFolder_position.add(cameras.thirdPersonCamera.position, 'z', -10, 10);
      thirdPersonCameraFolder_position.close();
  
      const thirdPersonCameraFolder_rotation = thirdPersonCameraFolder.addFolder('Third Person Camera');
      thirdPersonCameraFolder_rotation.add(cameras.thirdPersonCamera.rotation, 'x', 0, Math.PI * 2);
      thirdPersonCameraFolder_rotation.add(cameras.thirdPersonCamera.rotation, 'y', 0, Math.PI * 2);
      thirdPersonCameraFolder_rotation.add(cameras.thirdPersonCamera.rotation, 'z', 0, Math.PI * 2);
      thirdPersonCameraFolder_rotation.close();
  
      thirdPersonCameraFolder.close();
    }


    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 4, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const directionalLightFolder = gui.addFolder('Directional Light');
    directionalLightFolder.add(directionalLight, 'visible');
    directionalLightFolder.add(directionalLight, 'intensity', 0, 1);
    directionalLightFolder.add(directionalLight, 'castShadow');
    const directionalLightFolder_position = directionalLightFolder.addFolder('Directional Light position');
    directionalLightFolder_position.add(directionalLight.position, 'x', -10, 10);
    directionalLightFolder_position.add(directionalLight.position, 'y', -10, 10);
    directionalLightFolder_position.add(directionalLight.position, 'z', -10, 10);

    const directionalLightFolder_rotation = directionalLightFolder.addFolder('Directional Light rotation');
    directionalLightFolder_rotation.add(directionalLight.rotation, 'x', 0, Math.PI * 2);
    directionalLightFolder_rotation.add(directionalLight.rotation, 'y', 0, Math.PI * 2);
    directionalLightFolder_rotation.add(directionalLight.rotation, 'z', 0, Math.PI * 2);

    directionalLightFolder_rotation.close();
    directionalLightFolder_position.close();
    directionalLightFolder.close();

    const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(dLightShadowHelper);

    const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
    scene.add(dLightHelper);

    cameras.controls[this.activeCamera] && cameras.controls[this.activeCamera].update();

    // Configurar Stats.js
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    document.body.appendChild(stats.dom);

    // Função de animação
    const animate = () => {
        stats.begin();

        // console.log('animate', oculus.ObserverOculus);

        requestAnimationFrame(animate);

        // Movimento do personagem
        // if (keys.w) character.position.z += moveSpeed;
        // if (keys.s) character.position.z -= moveSpeed;
        // if (keys.a) character.position.x += moveSpeed;
        // if (keys.d) character.position.x -= moveSpeed;
        // if (keys.space) character.position.y += moveSpeed;
        // Movimento do personagem
        if (keys.w) {
            character.position.z -= moveSpeed * Math.cos(character.rotation.y);
            character.position.x -= moveSpeed * Math.sin(character.rotation.y);
        }
        if (keys.s) {
            character.position.z += moveSpeed * Math.cos(character.rotation.y);
            character.position.x += moveSpeed * Math.sin(character.rotation.y);
        }
        if (keys.a) {
            character.position.x -= moveSpeed * Math.cos(character.rotation.y);
            character.position.z += moveSpeed * Math.sin(character.rotation.y);
        }
        if (keys.d) {
            character.position.x += moveSpeed * Math.cos(character.rotation.y);
            character.position.z -= moveSpeed * Math.sin(character.rotation.y);
        }
        if (keys.space) character.position.y += moveSpeed;

        /*
        // Atualizar a posição e rotação da câmera de terceira pessoa
        const cameraOffset = new THREE.Vector3(0.06, 0.8, 0);
        const cameraPosition = new THREE.Vector3(
            character.position.x + cameraOffset.x * Math.cos(yaw) + cameraOffset.z * Math.sin(yaw),
            character.position.y + cameraOffset.y,
            character.position.z + cameraOffset.x * Math.sin(yaw) + cameraOffset.z * Math.cos(yaw)
        );
        cameras.thirdPersonCamera.lookAt(character.position);
        cameras.thirdPersonCamera.position.copy(cameraPosition);
       
        character.rotation.y = yaw;

        cameras.thirdPersonCamera.up.set(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
        cameras.thirdPersonCamera.quaternion.copy(character.quaternion).multiply(quaternion);
        */

        updateArrowHelper();
    
        // character.rotation.y = yaw;


        cameras[this.activeCamera] && cameras[this.activeCamera].updateProjectionMatrix();
        cameras[this.activeCamera] && cameras[this.activeCamera].updateMatrixWorld();
       

        if (typeof cube !== 'undefined' && cube !== null) {
            // Girar o cubo
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        }

        if (typeof line !== 'undefined' && line !== null) {
            // Atualizações para a animação
            line.rotation.x += 0.01;
            line.rotation.y += 0.01;
        }

        if (typeof textMesh !== 'undefined' && textMesh !== null) {
            textMesh.rotation.x += 0.01;
            textMesh.rotation.y += 0.01;
        }

      
        cameras.thirdPersonCamera.lookAt(character.position);
        cameras.thirdPersonCamera.position.copy(new THREE.Vector3(character.position.x - 0.5, character.position.y + 0.8, character.position.z + 1.6));

        cameras[this.activeCamera] && rendererL.render(scene, cameras[this.activeCamera]);

        /*
        // First view
        cameras[this.activeCamera] && cameras[this.activeCamera].setViewOffset(window.innerWidth, window.innerHeight, 0, 0, window.innerWidth / 2, window.innerHeight);
        rendererL.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);

        cameras[this.activeCamera] && rendererL.render(scene, cameras[this.activeCamera]);

        // Second view
        cameras[this.activeCamera] && cameras[this.activeCamera].setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        rendererL.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        cameras[this.activeCamera] && rendererL.render(scene, cameras[this.activeCamera]);
        */

        stats.end();
    };

    animate();

    const update = () => {
      rendererL.setSize(window.innerWidth, window.innerHeight);
      rendererR.setSize(window.innerWidth, window.innerHeight);

      cameras[this.activeCamera] ?  cameras[this.activeCamera].aspect = window.innerWidth / window.innerHeight : null ;
      cameras[this.activeCamera] ?  cameras[this.activeCamera].updateProjectionMatrix() : null ;
      cameras[this.activeCamera] ?  cameras[this.activeCamera].updateMatrixWorld() : null ;
      
      cameras[this.activeHelper] ?  cameras[this.activeHelper].aspect = window.innerWidth / window.innerHeight : null ;
      cameras[this.activeHelper] && cameras[this.activeHelper].updateProjectionMatrix ?  cameras[this.activeHelper].updateProjectionMatrix() : null ;
      cameras[this.activeHelper] && cameras[this.activeHelper].updateMatrixWorld ?  cameras[this.activeHelper].updateMatrixWorld() : null ;
      cameras[this.activeHelper] && cameras[this.activeHelper].update ?  cameras[this.activeHelper].update() : null ;

      spotLightHelper.update();
      
    }

    const  onMouseMove = (event) => {
      const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  
      yaw -= movementX * turnSpeed;
      pitch -= movementY * turnSpeed;
  
      pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Limitar o pitch entre -90 e 90 graus
    }

    // Ajustar o tamanho da tela ao redimensionar a janela
    window.addEventListener('resize', update);


    // Listener para detectar cliques do mouse
    document.addEventListener('mousedown', (event) => {
      console.log({event, activeAction});
      if (event.button === 0) { // Clique esquerdo
        switchAnimation('punsh-left');
        // animationsMap['punsh-left'].reset().setLoop(THREE.LoopRepeat, 1).play();
      } else if (event.button === 2) { // Clique direito
        // switchAnimation('idle');
        switchAnimation('punsh-right');
      
      //  animationsMap['punsh-right'].reset().setLoop(THREE.LoopRepeat, 1).play();
      }
    });

    document.addEventListener('mouseup', (event) => {
      if (event.button === 0 && activeAction === animationsMap['punsh-left']) { // Clique esquerdo
        switchAnimation('idle');
      } else if (event.button === 2 && activeAction === animationsMap['punsh-right']) { // Clique direito
        switchAnimation('idle');
        
        console.log({activeAction});
        
      }
    });

    // Adicionar eventos para alternar a câmera e a rotação quando uma tecla é pressionada
    window.addEventListener('keydown', (event) => {

      const keyName = event.key.toLowerCase();
      console.log({keyName});
      if (keyName === 'a' && (!activeAction || activeAction !== animationsMap['left'])) switchAnimation('left');
      if (keyName === 'd' && (!activeAction || activeAction !== animationsMap['right'])) switchAnimation('right');

      if (event.key === 'c') {
          // switchCamera();
      } else if (event.key === 'r') {
          // toggleFollowRotation();
      } else if (event.key in keys) {
          keys[event.key] = true;
      }
    });

    window.addEventListener('keyup', (event) => {

        const keyName = event.key;
        console.log({keyName});
        if (keyName === 'a' && activeAction === animationsMap['left']) switchAnimation('idle');
        if (keyName === 'd' && activeAction === animationsMap['right']) switchAnimation('idle');


        if (event.key in keys) {
            keys[event.key] = false;
        }
    });

    // Event listeners para o mouse
    document.body.addEventListener('click', (e) => {

      console.log('click', e.ctrlKey);
      if(e.ctrlKey){
        document.body.requestPointerLock();
      }
  
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === document.body) {
            document.addEventListener('mousemove', onMouseMove, false);
        } else {
            document.removeEventListener('mousemove', onMouseMove, false);
        }
    });
    
  }

  renderSettings() {
    // Configurar o renderizador
    const rendererL = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    const rendererR = new THREE.WebGLRenderer({ antialias: false, alpha: false });

    rendererL.setPixelRatio(window.devicePixelRatio);
    rendererR.setPixelRatio(window.devicePixelRatio);

    rendererL.setSize(this.videoOptions.video.element.videoWidth, this.videoOptions.video.element.videoHeight);
    rendererR.setSize(this.videoOptions.video.element.videoWidth, this.videoOptions.video.element.videoHeight);

    rendererL.domElement.classList.add('renderer', 'full');
    rendererR.domElement.classList.add('renderer', 'none');

    document.querySelector('.vr-container').appendChild(rendererL.domElement);
    document.querySelector('.vr-container').appendChild(rendererR.domElement);

    return { rendererL, rendererR };
  }

  sceneSettings({ background = null, fog = null }) {
    const scene = new THREE.Scene();
    if (background) scene.background = new THREE.Color(background);
    if (fog) scene.fog = new THREE.Fog(fog[0], fog[1], fog[2]);

    return { scene };
  }

  settings() {
    // Configurar a cena
    const gui = new GUI();
    const { scene } = this.sceneSettings({ background: 0x88ccee });


    // Add GUI control to toggle camera
    gui.add(this, 'activeCamera', ['camera', 'camera2', 'thirdPersonCamera']).name('Active Camera');
    
    // Adicionando controle para a cor de fundo da cena
    function ColorGUIHelper(object, prop) {
      this.object = object;
      this.prop = prop;
    }

    // Adicionando controle para a cor de fundo da cena
    ColorGUIHelper.prototype = {
      get value() {
          return `#${this.object[this.prop].getHexString()}`;
      },
      set value(hexString) {
          this.object[this.prop].set(hexString);
      }
    };

    // Adicionando controle para a cor de fundo da cena
    const sceneFolder = gui.addFolder('Scene');
    sceneFolder.addColor(new ColorGUIHelper(scene, 'background'), 'value').name('Background Color');
    sceneFolder.close();

    const { camera, cameraHelper } = new Camera({
      fov: 20,
      aspect: 2, // the canvas default
      near: 1,
      far: 250,
      gui,
      position: { x: 0, y: 1, z: 10 },
      rotation: { x: 2, y: 0, z: 0 },
      lookAt: { x: 0, y: 0, z: 0 },
      up: {x: 0, y: 0, z: 0},
    });

    const { rendererL, rendererR } = this.renderSettings();

    rendererL.shadowMap.enabled = true;
    const shadrenderFolder = gui.addFolder('Shadow Render');
    shadrenderFolder.add(rendererL.shadowMap, 'enabled');
    shadrenderFolder.add(rendererL.shadowMap, 'autoUpdate');
    shadrenderFolder.close();

    return { scene, camera, cameraHelper, rendererL, rendererR, gui };
  }

  updateCameraRotation(camera, rotation) {
    camera.rotation.x = rotation.x;
    camera.rotation.y = rotation.y;
    camera.rotation.z = rotation.z;
  }
}

export { Game };
