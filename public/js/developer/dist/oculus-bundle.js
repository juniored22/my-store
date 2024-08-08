/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/oculus.js":
/*!***********************!*\
  !*** ./src/oculus.js ***!
  \***********************/
/***/ (() => {

eval("\r\nif ('serviceWorker' in navigator) {\r\n    window.addEventListener('load', function() {\r\n      navigator.serviceWorker.register('/oculus-service-worker.js').then(function(registration) {\r\n        console.log('Service Worker registered with scope:', registration.scope);\r\n      }, function(error) {\r\n        console.log('Service Worker registration failed:', error);\r\n      });\r\n    });\r\n  }\r\n\r\n\r\n  class Oculus{\r\n      options = {\r\n          api: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/dist/face-api.js',\r\n          urlRedirection: null,//'http://localhost:3000/aplication',\r\n          instanceof: null,\r\n          userInfo: { name: 'EDGARD', email: 'wqyZi@example.com' },\r\n          ratioConfimationSimilarity: 0.5,\r\n          settings: {\r\n              typeDetection: 'detectAllFaces',\r\n              choosefacedetecto:'SsdMobilenetv1Options', \r\n              inputSize:160, \r\n              scoreThreshold:0.5, \r\n              minConfidence:0.2,\r\n              methods : [\r\n                  { type: 'all', method: 'withFaceLandmarks',   draw: 'drawFaceLandmarks' }, // draw: 'drawFaceLandmarks'\r\n                  { type: 'all', method: 'withFaceExpressions', draw:  null }, // draw: 'drawFaceExpressions'\r\n                  { type: 'all', method: 'withAgeAndGender',    draw:  null },\r\n                  { type: 'detectSingleFace', method: 'withFaceDescriptor',  draw: null}, //draw: drawDetections\r\n                  { type: 'detectAllFaces',   method: 'withFaceDescriptors', draw: null,  } // draw: 'drawDetections'\r\n              ],\r\n              timeOutLoopAnalyse: 5000,\r\n          },\r\n          video: {\r\n              elementId: 'video' ,\r\n              size: 'ideal',\r\n              config: {\r\n                  width: { min: 640, ideal: 1280, max: 1920 },\r\n                  height: { min: 480, ideal: 720, max: 1080 },\r\n                  frameRate: { ideal: 30, max: 60 },\r\n                  aspectRatio: { ideal: 1.7777777778 }\r\n              },\r\n              // audio: {\r\n              //     echoCancellation: true,\r\n              //     noiseSuppression: true,\r\n              //     sampleRate: 44100\r\n              // },\r\n          },\r\n          canvas:{\r\n              elementId: 'overlay',\r\n              textFild: {\r\n                  text: \"Seu texto aqui\", \r\n                  x:50, y:50, \r\n                  fontSize:'30px', \r\n                  fontFamily:'Arial', \r\n                  color:'white'\r\n              },\r\n              config: {\r\n                  width: { min: 640, ideal: 1280, max: 1920 },\r\n                  height: { min: 361, ideal: 720, max: 1080 }\r\n              },\r\n          }\r\n      }\r\n\r\n      constructor(oculus, {options} =  this.options){\r\n          this.eyeLeft = oculus.eyeLeft.element;\r\n          this.eyeRight = oculus.eyeRight.element;\r\n          this.eyeLeft.style.position = 'relative';\r\n          this.eyeRight.style.position = 'relative';\r\n          this.eyeLeft.style.left = `${oculus.eyeLeft.offsetX}px`;\r\n          this.eyeLeft.style.top = `${oculus.eyeLeft.offsetY}px`;\r\n          this.eyeRight.style.left = `${oculus.eyeRight.offsetX}px`;\r\n          this.eyeRight.style.top = `${oculus.eyeRight.offsetY}px`;\r\n          this.options = options;\r\n      }\r\n\r\n\r\n\r\n  }\r\n\r\n  const videoConstructor = new Video();\r\n  videoConstructor.createVideoAndCanvas('.vr-container', videoConstructor.video, videoConstructor.canvas)\r\n  .then(async () => {\r\n      await videoConstructor.setupCamera({}, async () => {\r\n          const { canvas, context } = await videoConstructor.canvasBackground({})\r\n          console.log({canvas, context, videoConstructor});\r\n\r\n          function drawVideoToCanvas() {\r\n              context.drawImage(videoConstructor.video.element, 0, 0, videoConstructor.canvas.element.width, videoConstructor.canvas.element.height);\r\n              requestAnimationFrame(drawVideoToCanvas);\r\n          }\r\n\r\n          drawVideoToCanvas();\r\n      });\r\n  })\r\n  .catch(error => {\r\n      console.error('Erro 501',error);\r\n      alert(error);\r\n  });\r\n\r\n  const eyeLeft = videoConstructor.video.element;\r\n  const eyeRight = videoConstructor.canvas.element;\r\n  eyeLeft.classList.add('eye_left');\r\n  eyeRight.classList.add('eye_right');\r\n\r\n  const oculusOptions = {\r\n      eyeLeft: {\r\n          element:eyeLeft,\r\n          offsetX: 10,\r\n          offsetY: -30,\r\n      }, \r\n      eyeRight:{\r\n          element:eyeRight,\r\n          offsetX: 0,\r\n          offsetY: -30,\r\n      },\r\n    \r\n  };\r\n\r\n  const oculus = new Oculus(oculusOptions,{});\r\n\n\n//# sourceURL=webpack:///./src/oculus.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/oculus.js"]();
/******/ 	
/******/ })()
;