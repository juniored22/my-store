

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
    //   navigator.serviceWorker.register('/oculus-service-worker.js').then(function(registration) {
    //     console.log('Service Worker registered with scope:', registration.scope);
    //   }, function(error) {
    //     console.log('Service Worker registration failed:', error);
    //   });
    });
  }



  class Oculus{
    
    constructor(oculusOptions, options = {}){

        console.log('%c[Oculus]', 'background: blue; color: #fff',{oculusOptions, options});

        this.iteration = 0;

        this.defaultOptions  = {
            api: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/dist/face-api.js',
            urlRedirection: null,//'http://localhost:3000/aplication',
            instanceof: null,
            userInfo: { name: 'EDGARD', email: 'wqyZi@example.com' },
            ratioConfimationSimilarity: 0.5,
            settings: {
                typeDetection: 'detectAllFaces',
                choosefacedetecto:'SsdMobilenetv1Options', 
                inputSize:160, 
                scoreThreshold:0.5, 
                minConfidence:0.2,
                methods : [
                    { type: 'all', method: 'withFaceLandmarks',   draw: 'drawFaceLandmarks' }, // draw: 'drawFaceLandmarks'
                    { type: 'all', method: 'withFaceExpressions', draw:  null }, // draw: 'drawFaceExpressions'
                    { type: 'all', method: 'withAgeAndGender',    draw:  null },
                    { type: 'detectSingleFace', method: 'withFaceDescriptor',  draw: null}, //draw: drawDetections
                    { type: 'detectAllFaces',   method: 'withFaceDescriptors', draw: null,  } // draw: 'drawDetections'
                ],
                timeOutLoopAnalyse: 5000,
            },
            video: {
                elementId: 'video' ,
                size: 'ideal',
                config: {
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 60 },
                    aspectRatio: { ideal: 1.7777777778 }
                },
                // audio: {
                //     echoCancellation: true,
                //     noiseSuppression: true,
                //     sampleRate: 44100
                // },
            },
            canvas:{
                elementId: 'overlay',
                textFild: {
                    text: "Seu texto aqui", 
                    x:50, y:50, 
                    fontSize:'30px', 
                    fontFamily:'Arial', 
                    color:'white'
                },
                config: {
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 361, ideal: 720, max: 1080 }
                },
            }
         
        }

        // Merge custom options with default options
        this.options = this.mergeOptions(this.defaultOptions, options);

        this.eyeLeft = oculusOptions.eyeLeft.element;
        this.eyeRight = oculusOptions.eyeRight.element;

      
        /*
        this.eyeLeft.style.position = 'relative';
        this.eyeRight.style.position = 'relative';
        this.eyeLeft.style.left = `${oculusOptions.eyeLeft.offsetX}px`;
        this.eyeLeft.style.top = `${oculusOptions.eyeLeft.offsetY}px`;
        this.eyeRight.style.left = `${oculusOptions.eyeRight.offsetX}px`;
        this.eyeRight.style.top = `${oculusOptions.eyeRight.offsetY}px`;

        this.contextEyeRight = oculusOptions.eyeRight.element.getContext('2d',  { willReadFrequently: true });


        oculusOptions.frameCanvasRight.element.style.position = 'absolute';
        oculusOptions.frameCanvasRight.element.style.left = `${oculusOptions.eyeLeft.offsetX}px`;
        oculusOptions.frameCanvasRight.element.style.top = `${oculusOptions.eyeLeft.offsetY}px`;
        // oculusOptions.frameCanvasRight.element.style.zIndex = '2';

        oculusOptions.frameCanvasLeft.element.style.position = 'absolute';
        oculusOptions.frameCanvasLeft.element.style.right = `${oculusOptions.eyeRight.offsetX}px`;
        oculusOptions.frameCanvasLeft.element.style.top = `${oculusOptions.eyeRight.offsetY}px`;
        // oculusOptions.frameCanvasLeft.element.style.zIndex = '2';


        this.options.video.elementRTC.style.position = 'absolute';
        this.options.video.elementRTC.style.right = `${oculusOptions.eyeRight.offsetX}px`;
        this.options.video.elementRTC.style.top = `${oculusOptions.eyeRight.offsetY}px`;

        */

        this.options = options;
        this.frame = oculusOptions.frameCanvasRight.element
        // this.context = oculusOptions.frameCanvasRight.element.getContext('2d',  { willReadFrequently: true });
        // this.context2 = oculusOptions.frameCanvasLeft.element.getContext('2d' ,  { willReadFrequently: true });

        this.context =  this.options.canvas.element.getContext('2d');
        this.context2 = this.options.canvas.element2.getContext('2d');
        this.context3 = this.options.canvas.element3.getContext('2d');
        
        this.handPose = null;
        this.handsAnalyse = [];
        this.oculusOptions = oculusOptions;

        if(this.oculusOptions.model == "NORMAL"){

        } 


  
        
    }

    init(parans, callback){

        this.createServerWorker();
        this.setDetectHand();

        if(typeof callback == 'function') callback(this);
    }


    createServerWorker() {
     
        this.worker = new Worker('handposeWorker.js');
        console.log('%c[Oculus][Worker]', 'background: blue; color: #fff', {worker: this.worker});

        this.worker.onmessage = (e) => {
            this.handsAnalyse = e.data;
            console.log('%c[Oculus][Worker]', 'background: purple; color: #fff', {handsAnalyse: this.handsAnalyse});
            this.loopHandPoseDetector();
        };
    }

    mergeOptions(defaultOptions, customOptions) {
        // Recursive merge to handle nested objects
        const mergedOptions = { ...defaultOptions };
        for (const key in customOptions) {
            if (customOptions[key] instanceof Object && key in defaultOptions) {
                mergedOptions[key] = this.mergeOptions(defaultOptions[key], customOptions[key]);
            } else {
                mergedOptions[key] = customOptions[key];
            }
        }
        return mergedOptions;
    }

    async createHandesDetector() {

       
        this.handPoseModel = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig = {
            runtime: 'mediapipe', //'mediapipe', // or 'tfjs'
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands', //'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
            maxFaces: 10, // Número máximo de rostos a serem detectados
            refineLandmarks: true, // Se true, melhora a precisão de alguns pontos-chave específicos (por exemplo, olhos)
            modelType: 'full', // 'lite' ou 'full', onde 'lite' é mais rápido e 'full' é mais preciso
        }
   
        return new Promise( async (resolve, reject) => {
            this.handPoseDetector = await handPoseDetection.createDetector(this.handPoseModel, detectorConfig);
            console.log('%c[Oculus][createHandesDetector][model]', 'background: blue; color: #fff', {model: this.handPoseModel, detectorConfig, detector: this.handPoseDetector});
            resolve(this.handPoseDetector);
        })
        
    }

    async setDetectHand() {


        const optionsModel = {
            maxHands: 8,
            flipped: false,
            runtime: "mediapipe", //mediapipe, tfjs
            modelType: "lite", //lite, full
            detectorModelUrl: undefined, //default to use the tf.hub model
            landmarkModelUrl: undefined, //default to use the tf.hub model
        }

        console.log('%c[Oculus][setDetectHand]', 'background: blue; color: #fff', {optionsModel});


        if(typeof ml5 !== 'undefined'){
            console.log('%c[Oculus][setDetectHand]', 'background: blue; color: #fff', "model handPose loaded", this.handPose);
            console.log('%c[Oculus][setDetectHand]', 'background: blue; color: #fff', ml5.tf.engine().registryFactory);
            ml5.tf.setBackend("webgpu");
            await ml5.tf.ready().then(() => {
                console.log('%c[Oculus][setDetectHand]', 'background: blue; color: #fff',{ getBackend:  ml5.tf.getBackend() });
            });
        }

        if(typeof tf !== 'undefined'){
            console.log('%c[Oculus][setDetectHand][engine]', 'background: blue; color: #fff', {tf, version: tf.version, handPoseDetection});
            console.log('%c[Oculus][setDetectHand][engine]', 'background: blue; color: #fff', tf.engine().registryFactory);
            tf.setBackend("webgpu");
            await tf.ready().then(() => {
                console.log('%c[Oculus][setDetectHand][getBackend]', 'background: blue; color: #fff',{ getBackend:  tf.getBackend() });
            });
        }

        
        
        await this.createHandesDetector();
       
        const settings = async () => {
            console.log('%c[Oculus][settings]', 'background: blue; color: #fff', {settings: this.settings});
            this.flow()   
        }

        this.handPose = typeof ml5 !== 'undefined' && ml5 ? await ml5.handPose( optionsModel , settings) : this.flow() ;
        
        return this;
    }

    pushHandsAnalyse(handsAnalyse){
        this.handsAnalyse = handsAnalyse;
    }

    async loopHandPoseDetector(){

        if(!this.debugEndLoop){
            console.log('%c[Oculus][loopHandPoseDetector]', 'background: blue; color: #fff', {handPose: this.handPose, detectHand: this.oculusOptions.detectHand, handPoseDetector: this.handPoseDetector});
            this.debugEndLoop = true
        }

        if(this.handPoseDetector && 
        (!this.oculusOptions || !this.oculusOptions.detectHandWorker) && 
        (this.oculusOptions && this.oculusOptions.detectHand) ){
            requestAnimationFrame( ()=> this.loopHandPoseDetector() );
            this.handsAnalyse = await this.handPoseDetector.estimateHands(this.options.video.element);
            // console.log(this.handsAnalyse);
        }

        if(this.oculusOptions && this.oculusOptions.detectHandWorker && this.oculusOptions.detectHand ){
            const imageData = await this.context.getImageData(0, 0, this.frame.width, this.frame.height);
            // console.log('%c[Oculus][flow][tensor]', 'background: yellow; color: #000', {imageData});
            this.worker.postMessage({
                imageData: imageData,
            });
        }

        return this;
    }

    async flow(){

      

        if(this.handPose){
            if(this.oculusOptions.detectHand){
                this.handPose.detectStart(this.eyeLeft, (r) =>  this.pushHandsAnalyse(r))
            }
        }
        
    
        this.loopHandPoseDetector();  
        this.draw();
    }

    draw(){

        if(this && typeof this.handsAnalyse !== 'undefined') {

            if(!this.loopDebugEnd) {
                console.log('%c[Oculus][draw]', 'background: blue; color: #fff', {handsAnalyse: this.handsAnalyse});
                this.loopDebugEnd = true;
            }

            
       
            // Limpar o canvas
            // this.context.clearRect(0, 0, this.frame.width, this.frame.height);
            // this.context.drawImage(this.frame, 0, 0, this.frame.width, this.frame.height);

            this.width = this.options.canvas.element.width;
            this.height = this.options.canvas.element.height;
            
            //overlay-min
            this.context.drawImage(this.options.video.element, 0, 0, this.width, this.height);
            //overlay2
            this.context2.drawImage(this.options.video.element, 0, 0, this.width, this.height);

            // this.context3.drawImage(this.options.video.element, 0, 0, this.width, this.height);
      

            this.filter();



            // Draw all the tracked hand points
            for (let i = 0; i < this.handsAnalyse.length; i++) {
                let hand = this.handsAnalyse[i];
                for (let j = 0; j < hand.keypoints.length; j++) {
                    let keypoint = hand.keypoints[j];

                    this.context.fillStyle = 'rgb(0, 255, 0)';
                    this.context.beginPath();
                    this.context.arc(keypoint.x, keypoint.y, 10, 0, 2 * Math.PI);
                    this.context.fill();

                    this.context2.fillStyle = 'rgb(0, 255, 0)';
                    this.context2.beginPath();
                    this.context2.arc(keypoint.x, keypoint.y, 10, 0, 2 * Math.PI);
                    this.context2.fill();
                }
            }

            this.handsAnalyse.length = 0;

        };

        requestAnimationFrame( ()=> this.draw() );
    
    }

    async filter(){
        // Manipular os pixels para inverter as cores
        const imageData = await this.context.getImageData(0, 0, this.width, this.height);

    
    
        const data = imageData.data;

        // filter invert
        // for (let i = 0; i < data.length; i += 4) {
        //     data[i] = 255 - data[i];     // Inverte o vermelho
        //     data[i + 1] = 255 - data[i + 1]; // Inverte o verde
        //     data[i + 2] = 255 - data[i + 2]; // Inverte o azul
        // }

        // filter grayscale
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }

        // normalize
        // for (let i = 0; i < data.length; i += 4) {
        //     data[i] = data[i] / 255.0;
        //     data[i + 1] = data[i + 1] / 255.0;
        //     data[i + 2] = data[i + 2] / 255.0;
        // }

        function binarize(imageData, threshold) {
            const data = imageData.data;
        
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const value = avg >= threshold ? 255 : 0;
                data[i] = value;
                data[i + 1] = value;
                data[i + 2] = value;
            }
        
            return imageData;
        }

        // binarize(imageData, 128);


        function adjustLighting(imageData, brightness, contrast) {
            const data = imageData.data;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        
            for (let i = 0; i < data.length; i += 4) {
                data[i] = factor * (data[i] - 128) + 128 + brightness;
                data[i + 1] = factor * (data[i + 1] - 128) + 128 + brightness;
                data[i + 2] = factor * (data[i + 2] - 128) + 128 + brightness;
            }
        
            return imageData;
        }

        // adjustLighting(imageData, 0, 128);


        function blurFilter(imageData) {
            const width = imageData.width;
            const height = imageData.height;
            const data = imageData.data;
            const outputData = new Uint8ClampedArray(data.length);
            const kernel = [
                [1 / 16, 1 / 8, 1 / 16],
                [1 / 8, 1 / 4, 1 / 8],
                [1 / 16, 1 / 8, 1 / 16]
            ];
        
            function applyKernel(x, y) {
                let r = 0, g = 0, b = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const px = x + kx;
                        const py = y + ky;
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            const offset = ((py * width) + px) * 4;
                            r += data[offset] * kernel[ky + 1][kx + 1];
                            g += data[offset + 1] * kernel[ky + 1][kx + 1];
                            b += data[offset + 2] * kernel[ky + 1][kx + 1];
                        }
                    }
                }
                return [r, g, b];
            }
        
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const [r, g, b] = applyKernel(x, y);
                    const offset = ((y * width) + x) * 4;
                    outputData[offset] = r;
                    outputData[offset + 1] = g;
                    outputData[offset + 2] = b;
                    outputData[offset + 3] = data[offset + 3]; // Alpha channel remains unchanged
                }
            }
        
            return outputData;
        }

        // let outputData  = blurFilter(imageData);
        // console.log({outputData});



        function sobelFilter(imageData) {
            const width = imageData.width;
            const height = imageData.height;
            const sobelData = [];
            const grayscaleData = [];
        
            // Convert to grayscale
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                grayscaleData.push(avg, avg, avg, 255);
            }
        
            // Sobel convolution
            const sobelX = [
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]
            ];
        
            const sobelY = [
                [-1, -2, -1],
                [0, 0, 0],
                [1, 2, 1]
            ];
        
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelX = (
                        (sobelX[0][0] * getPixel(grayscaleData, x - 1, y - 1, width)) +
                        (sobelX[0][1] * getPixel(grayscaleData, x, y - 1, width)) +
                        (sobelX[0][2] * getPixel(grayscaleData, x + 1, y - 1, width)) +
                        (sobelX[1][0] * getPixel(grayscaleData, x - 1, y, width)) +
                        (sobelX[1][1] * getPixel(grayscaleData, x, y, width)) +
                        (sobelX[1][2] * getPixel(grayscaleData, x + 1, y, width)) +
                        (sobelX[2][0] * getPixel(grayscaleData, x - 1, y + 1, width)) +
                        (sobelX[2][1] * getPixel(grayscaleData, x, y + 1, width)) +
                        (sobelX[2][2] * getPixel(grayscaleData, x + 1, y + 1, width))
                    );
        
                    const pixelY = (
                        (sobelY[0][0] * getPixel(grayscaleData, x - 1, y - 1, width)) +
                        (sobelY[0][1] * getPixel(grayscaleData, x, y - 1, width)) +
                        (sobelY[0][2] * getPixel(grayscaleData, x + 1, y - 1, width)) +
                        (sobelY[1][0] * getPixel(grayscaleData, x - 1, y, width)) +
                        (sobelY[1][1] * getPixel(grayscaleData, x, y, width)) +
                        (sobelY[1][2] * getPixel(grayscaleData, x + 1, y, width)) +
                        (sobelY[2][0] * getPixel(grayscaleData, x - 1, y + 1, width)) +
                        (sobelY[2][1] * getPixel(grayscaleData, x, y + 1, width)) +
                        (sobelY[2][2] * getPixel(grayscaleData, x + 1, y + 1, width))
                    );
        
                    const magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY)) >>> 0;
        
                    sobelData.push(magnitude, magnitude, magnitude, 255);
                }
            }
        
            return sobelData;
        }
        
        function getPixel(data, x, y, width) {
            if (x < 0 || x >= width || y < 0 || y >= width) {
                return 0;
            }
            return data[(y * width + x) * 4];
        }

        // sobelFilter(imageData);



        function isolateColor(imageData, targetColor, tolerance) {
            const width = imageData.width;
            const height = imageData.height;
            const data = imageData.data;
            const outputData = new Uint8ClampedArray(data.length);
        
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
        
                // Calcular a distância da cor alvo
                const distance = Math.sqrt(
                    (r - targetColor.r) * (r - targetColor.r) +
                    (g - targetColor.g) * (g - targetColor.g) +
                    (b - targetColor.b) * (b - targetColor.b)
                );
        
                if (distance < tolerance) {
                    // Manter a cor original
                    outputData[i] = r;
                    outputData[i + 1] = g;
                    outputData[i + 2] = b;
                    outputData[i + 3] = data[i + 3]; // Alpha channel remains unchanged
                } else {
                    // Definir como preto (ou qualquer outra cor de fundo)
                    outputData[i] = 0;
                    outputData[i + 1] = 0;
                    outputData[i + 2] = 0;
                    outputData[i + 3] = data[i + 3]; // Alpha channel remains unchanged
                }
            }
        
            return new ImageData(outputData, width, height);
        }

        // let imageDataColor = isolateColor(imageData, { r: 255, g: 0, b: 0 }, 200);

        this.context3.putImageData(imageData, 0, 0);
        // this.context2.putImageData(imageData, 0, 0);
   
    }

}

 
export { Oculus };
