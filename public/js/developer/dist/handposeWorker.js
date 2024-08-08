// handposeWorker.js
self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection');
self.importScripts('https://cdn.jsdelivr.net/npm/@mediapipe/hands');
self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgpu@4.20.0/dist/tf-backend-webgpu.min.js');



let handPoseModel = null;
let handPoseDetector = null;
console.log('%c[Worker][onmessage]', 'background: #2196f3; color: #fff', {tf, handPoseDetection, self});

self.onmessage = async function(e) {

  const { imageData } = e.data;

    if(!handPoseModel){

      tf.setBackend("webgpu");
      await tf.ready();

      // const cam = await tf.data.webcam(document.getElementById('webcam'));
      
      handPoseModel = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: 'tfjs', //'mediapipe', // or 'tfjs'
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands', //'https://cdn.jsdelivr.net/npm/@mediapipe/hands', //'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        maxFaces: 10, // Número máximo de rostos a serem detectados
        refineLandmarks: true, // Se true, melhora a precisão de alguns pontos-chave específicos (por exemplo, olhos)
        modelType: 'full', // 'lite' ou 'full', onde 'lite' é mais rápido e 'full' é mais preciso
      }
    
      handPoseDetector = await handPoseDetection.createDetector(handPoseModel, detectorConfig);
      console.log('%c[Worker][onmessage][model]', 'background: red; color: #fff', {model: handPoseModel, detectorConfig, detector: handPoseDetector});

  }

  
  const result = await handPoseDetector.estimateHands(imageData);
  // console.log('%c[Worker][onmessage]', 'background: red; color: #fff',{imageData, tf, handPoseDetection, result});

   // Send the result back to the main thread
   self.postMessage(result);

  /*

  // Carregar o modelo, se ainda não foi carregado
  if (!handPoseModel) {
    handPoseModel = await handpose.load();
  }

  // Convert ImageData to a tensor
  const inputTensor = tf.browser.fromPixels(imageData);

  // Perform the hand detection
  const result = await handPoseModel.estimateHands(inputTensor);

  console.log({result});

  // Send the result back to the main thread
  self.postMessage(result);

  // Clean up tensor to free memory
  inputTensor.dispose();

  */
};

self.addEventListener('install', function(event) {
  console.log('%c[Worker][install]', 'background: red; color: #fff');
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
  
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('%c[Worker][fetch]', 'background: red; color: #fff');
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

