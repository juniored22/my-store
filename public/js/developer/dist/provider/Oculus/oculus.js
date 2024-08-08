import {
    PoseLandmarker,
    FaceDetector,
    FilesetResolver,
    ObjectDetector,
    ImageSegmenter,
    GestureRecognizer,
    HandLandmarker,
    DrawingUtils,
    FaceLandmarker
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2";

class Oculus{
    
    constructor(oculusOptions, options = {}){

        console.log('%c[Oculus]', 'background: blue; color: #fff',{oculusOptions, options});
        
        this.handPose = null;
        this.stackedTensor = null;
        this.model = null;
        this.debug = false;
        this.iteration = 0;
        this.classIndex = 0;
        this.labels = [];
        this.tensors = [];
        this.handsAnalyse = [];
        this.inforBuffer = {};
        this.classMap = {};
        this.ObserverOculus = {}
        this.wrists = {
            left: [],
            right: []
        }

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
        this.cropTensors = [];
        this.nameModules = {save:{}};
        this.performance = {
            start:{},
            end:{}
        };
        this.eyeLeft = oculusOptions.eyeLeft.element;
        this.eyeRight = oculusOptions.eyeRight.element;
        this.options = options;
        this.optionsVideo = options;
        this.frame = oculusOptions.frameCanvasRight.element
        this.contextPreProcess =  this.options.canvas.preProcess.getContext('2d');
        this.context =  this.options.canvas.element.getContext('2d');
        this.context2 = this.options.canvas.element2.getContext('2d');
        this.context3 = this.options.canvas.element3.getContext('2d');
        this.context4 = this.options.canvas.canvasmin.getContext('2d');
        this.oculusOptions = oculusOptions;
        if(this.oculusOptions.model == "NORMAL"){
        } 
    }

    async init(parans, callback){
        this.createServerWorker();
        if(this.oculusOptions.model == "GAME"){
            this.setupDetectHand();
            // if(typeof callback == 'function') callback(this);
        }
    }

    createServerWorker() {
        this.worker = new Worker('handposeWorker.js');
        console.log('%c[Oculus][Worker]', 'background: #2196f3; color: #fff', {worker: this.worker});
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

    /**
     * Asynchronously loops through a series of tasks to detect hand pose, segment objects, recognize gestures, and landmark faces and hands.
     *
     * @return {Promise<object>} Returns a promise that resolves to the current instance of the object.
     */
    async loopHandPoseDetector(){

        this.performance.start['loopHandPoseDetector'] = performance.now();
        this.debug && console.groupCollapsed('%c[Oculus][loopHandPoseDetector]', 'background: green; color: #bada55');
        this.debug && console.log('%c[memory][loopHandPoseDetector]', 'background: yellow; color: #bada55', {memory: tf.memory()});

        if(!this.debugEndLoop){
            console.log('%c[Oculus][loopHandPoseDetector]', 'background: blue; color: #fff', {handPose: this.handPose, detectHand: this.oculusOptions.detectHand, handPoseDetector: this.handPoseDetector});
            this.debugEndLoop = true
        }

        if(false){
            // Hand Detector 
            if(this.handPoseDetector && 
            (!this.oculusOptions || !this.oculusOptions.detectHandWorker) && 
            (this.oculusOptions && this.oculusOptions.detectHand) ){
                // requestAnimationFrame( ()=> this.loopHandPoseDetector() );
                this.handsAnalyse = await this.handPoseDetector.estimateHands(this.options.video.element);
                // console.log(this.handsAnalyse);
            }
     
            // Worker hand detector
            if(this.oculusOptions && this.oculusOptions.detectHandWorker && this.oculusOptions.detectHand ){
                const imageData = await this.context.getImageData(0, 0, this.frame.width, this.frame.height);
                // console.log('%c[Oculus][flow][tensor]', 'background: yellow; color: #000', {imageData});
                this.worker.postMessage({
                    imageData: imageData,
                });
            }
    
            // Segmentation this.options.canvas.element2
            if(this.segmenter){
                const segmentation = await this.segmenter.segmentPeople(this.optionsVideo.video.element, {multiSegmentation: false, segmentBodyParts: true});
                const coloredPartImage = await bodySegmentation.toColoredMask(segmentation, bodySegmentation.bodyPixMaskValueToRainbowColor, {r: 255, g: 255, b: 255, a: 255});
                const coloredPartImageBitmap = await bodySegmentation.toBinaryMask(segmentation);
                const opacity = 0.7;
                const flipHorizontal = false;
                const maskBlurAmount = 0;
                const pixelCellWidth = 10.0;
                const foregroundThreshold = 0.5;
                const backgroundBlurAmount = 20;
                const edgeBlurAmount = 3;
                const faceBodyPartIdsToBlur = [0, 1];
                const canvas = this.options.canvas.element2;
    
                // Convert the segmentation into a mask to darken the background.
                const foregroundColor = {r: 0, g: 0, b: 0, a: 0};
                const backgroundColor = {r: 0, g: 0, b: 0, a: 255};
                const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(segmentation, foregroundColor, backgroundColor);
    
                await bodySegmentation.blurBodyPart(canvas, this.optionsVideo.video.element, segmentation, faceBodyPartIdsToBlur, foregroundThreshold,backgroundBlurAmount, edgeBlurAmount, flipHorizontal);
                // await bodySegmentation.drawBokehEffect(canvas, this.optionsVideo.video.element, segmentation, foregroundThreshold, backgroundBlurAmount,edgeBlurAmount, flipHorizontal);
                // await bodySegmentation.drawMask(canvas, this.optionsVideo.video.element, coloredPartImageBitmap, opacity, maskBlurAmount,flipHorizontal);
                // await bodySegmentation.drawMask(canvas, this.optionsVideo.video.element, coloredPartImage, opacity, maskBlurAmount,flipHorizontal);
                // await bodySegmentation.drawMask(canvas, this.optionsVideo.video.element, backgroundDarkeningMask, opacity, 3,flipHorizontal);
                // await bodySegmentation.drawPixelatedMask(canvas, this.optionsVideo.video.element, coloredPartImage, opacity, maskBlurAmount,flipHorizontal, pixelCellWidth);
                // console.log({segmentation});
            }
    
            // Face Detector
            if(this.faceDetector && this.contextPreProcess && true){
                this.faceDetectorDetections =  this.faceDetector.detectForVideo( this.options.video.element, performance.now() ).detections; //this.eyeLef or this.options.video.element
                // this.faceDetectorDetections =  this.faceDetector.detect( this.options.canvas.element ).detections;
                if(!this.debugEndLoopFaceDetector){
                    console.log('%c[Oculus][loopHandPoseDetector][faceDetectorDetections]', 'background: orange; color: #fff',{faceDetectorDetections: this.faceDetectorDetections});
                    this.debugEndLoopFaceDetector = true
                }
            }
    
            // Object Detector
            if(this.objectDetector){
                this.objectDetectorDetections = this.objectDetector.detect(this.eyeLeft);
                if(!this.debugEndLoopObjectDetector){
                    console.log('%c[Oculus][loopHandPoseDetector][objectDetectorDetections]', 'background: orange; color: #fff',{objectDetectorDetections: this.objectDetectorDetections});
                    this.debugEndLoopObjectDetector = true
                }
            }
    
            // Image Segmenter
            if(this.imageSegmenter && false){
    
                    const legendColors = [
                        [255, 197, 0, 255], // Vivid Yellow
                        [128, 62, 117, 255], // Strong Purple
                        [255, 104, 0, 255], // Vivid Orange
                        [166, 189, 215, 255], // Very Light Blue
                        [193, 0, 32, 255], // Vivid Red
                        [206, 162, 98, 255], // Grayish Yellow
                        [129, 112, 102, 255], // Medium Gray
                        [0, 125, 52, 255], // Vivid Green
                        [246, 118, 142, 255], // Strong Purplish Pink
                        [0, 83, 138, 255], // Strong Blue
                        [255, 112, 92, 255], // Strong Yellowish Pink
                        [83, 55, 112, 255], // Strong Violet
                        [255, 142, 0, 255], // Vivid Orange Yellow
                        [179, 40, 81, 255], // Strong Purplish Red
                        [244, 200, 0, 255], // Vivid Greenish Yellow
                        [127, 24, 13, 255], // Strong Reddish Brown
                        [147, 170, 0, 255], // Vivid Yellowish Green
                        [89, 51, 21, 255], // Deep Yellowish Brown
                        [241, 58, 19, 255], // Vivid Reddish Orange
                        [35, 44, 22, 255], // Dark Olive Green
                        [0, 161, 194, 255] // Vivid Blue
                    ];
                    const imageData = await this.context3.getImageData(0, 0, this.width, this.width);
    
                    /*
                    this.imageSegmenter.segmentForVideo(this.options.video.element, performance.now() ,(result)=>{
                    
                            const { width, height } = result.categoryMask;
                            
    
    
                            const mask = result.categoryMask.getAsFloat32Array();
    
                        
    
                            let j = 0;
                            for (let i = 0; i < mask.length; ++i) {
                            const maskVal = Math.round(mask[i] * 255.0);
                            const legendColor = legendColors[maskVal % legendColors.length];
                            imageData[j] = (legendColor[0] + imageData[j]) / 2;
                            imageData[j + 1] = (legendColor[1] + imageData[j + 1]) / 2;
                            imageData[j + 2] = (legendColor[2] + imageData[j + 2]) / 2;
                            imageData[j + 3] = (legendColor[3] + imageData[j + 3]) / 2;
                            j += 4;
                            }
    
                            const uint8Array = new Uint8ClampedArray(imageData.buffer);
                            const dataNew = new ImageData(
                            uint8Array,
                            this.width,
                            this.height
                            );
    
                            console.log('%c[Oculus][imageSegmenter]', 'background: blue; color: #fff', {imageSegmenter: result, width, height, mask, uint8Array});
                    });
                    */
                    
                    this.imageSegmenter.segment(this.eyeLeft, (result)=>{
    
                
    
                        const { width, height } = result.categoryMask;
                        let category = "";
                        const mask = result.categoryMask.getAsUint8Array();
    
                        for (let i in mask) {
                            if (mask[i] > 0) {
                            category = this.imageSegmenter.labels[mask[i]];
                            }
                            const legendColor = legendColors[mask[i] % legendColors.length];
                            imageData[i * 4] = (legendColor[0] + imageData[i * 4]) / 2;
                            imageData[i * 4 + 1] = (legendColor[1] + imageData[i * 4 + 1]) / 2;
                            imageData[i * 4 + 2] = (legendColor[2] + imageData[i * 4 + 2]) / 2;
                            imageData[i * 4 + 3] = (legendColor[3] + imageData[i * 4 + 3]) / 2;
                        }
    
                        const uint8Array = new Uint8ClampedArray(imageData.buffer);
                        console.log('%c[Oculus][imageSegmenter]', 'background: blue; color: #fff', {imageSegmenter: result, width, height, uint8Array});
                    });
            }
    
            // Gesture Recognizer
            if(this.gestureRecognizer){
    
                this.gestureRecognizerResult = this.gestureRecognizer.recognizeForVideo(this.options.video.element, performance.now());
    
                //  console.log('%c[Oculus][gestureRecognizer]', 'background: blue; color: #fff', {gestureRecognizer: this.gestureRecognizer, results});
            }
    
            // Face Landmarker
            if(this.faceLandmarker){
                this.faceLandmarkerResults = this.faceLandmarker.detectForVideo(this.options.video.element, performance.now());
                // console.log('%c[Oculus][faceLandmarker]', 'background: blue; color: #fff', {faceLandmarker: this.faceLandmarkerResults});
            }
    
            if(this.poseLandmarker){
                    this.poseLandmarker.detectForVideo(this.options.video.element, performance.now(), (result) => {
                        // console.log('%c[Oculus][poseLandmarker]', 'background: blue; color: #fff', {poseLandmarker: result});
                        this.poseLandmarkerResults = result;
                });
            }
    
            // Hand Landmarker
            if(this.handLandmarker){
                this.handLandmarkerResults = this.handLandmarker.detectForVideo(this.options.video.element, performance.now());
            }
    
            if(this.modelDeeplabSegmenter){
                this.segmenterResultDeeplab = await this.modelDeeplabSegmenter.segment(this.optionsVideo.video.element);
                //.then(({legend}) =>console.log(`The predicted classes are ${JSON.stringify(legend)}`));
            }
        }

        // this.drawTensor();

        this.debug && console.log('%c[memory][loopHandPoseDetector]', 'background: yellow; color: #bada55', {memory: tf.memory()});
        this.performance.end['loopHandPoseDetector'] = performance.now(); // Fim da medição
        this.debug && console.log(`Execution time: ${this.performance.end['loopHandPoseDetector'] - this.performance.start['loopHandPoseDetector']} milliseconds`);
        console.groupEnd();

        setTimeout(()=> this.loopHandPoseDetector(), 10);

        return this;
    }

    async setupDetectHand() {

        if(typeof ml5 !== 'undefined'){
            console.log('%c[Oculus][setupDetectHand]', 'background: blue; color: #fff', "model handPose loaded", this.handPose);
            console.log('%c[Oculus][setupDetectHand]', 'background: blue; color: #fff', ml5.tf.engine().registryFactory);
            ml5.tf.setBackend("webgpu");
            await ml5.tf.ready().then(() => {
                console.log('%c[Oculus][setupDetectHand]', 'background: blue; color: #fff',{ getBackend:  ml5.tf.getBackend() });
            });
        }

        if(typeof tf !== 'undefined'){
            console.log('%c[Oculus][setupDetectHand][engine]', 'background: blue; color: #fff', {tf, version: tf.version, handPoseDetection});
            console.log('%c[Oculus][setupDetectHand][engine]', 'background: blue; color: #fff', tf.engine().registryFactory);
            tf.setBackend("webgpu");
            await tf.ready().then(() => {
                console.log('%c[Oculus][setupDetectHand][getBackend]', 'background: blue; color: #fff',{ getBackend:  tf.getBackend() });
                console.log('%c[Oculus][setupDetectHand][memory]', 'background: blue; color: #fff', tf.memory());
            });
        }

        if(FilesetResolver && true){
            const vision_tasks = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );

            if(FaceDetector && false){
                // const vision_face = await FilesetResolver.forVisionTasks(
                //     "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                // );

                this.faceDetector = await FaceDetector.createFromOptions( vision_tasks, {
                    baseOptions: {
                      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
                      delegate: "GPU"
                    },
                    runningMode: "VIDEO", // IMAGE or VIDEO
                    minDetectionConfidence: 0.5, // Float [0,1]. Minimum confidence value for detected faces. 0.5 is the default value.
                    minSuppressionThreshold: 0.3, // Float [0,1]. Minimum score threshold value for considering image a face. 0.3 is the default value.
                });
    
                console.log('%c[Oculus][setupDetectHand][FilesetResolver]', 'background: orange; color: #fff', {faceDetector: this.faceDetector});
            }
            
            if(ObjectDetector && false){
                const vision_object = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                this.objectDetector = await ObjectDetector.createFromOptions( vision_object, {
                    baseOptions: {
                      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
                      delegate: "GPU"
                    },
                    scoreThreshold: 0.5, 
                    runningMode: "IMAGE", // IMAGE or VIDEO
                 
                });
            }

            if(ImageSegmenter && false){
                const vision_segment = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
                );

                this.imageSegmenter = await ImageSegmenter.createFromOptions(vision_segment, {
                baseOptions: {
                    modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite",
                    delegate: "GPU"
                },
                runningMode: "IMAGE",
                outputCategoryMask: true,
                outputConfidenceMasks: false
                });
                console.log('%c[Oculus][setupDetectHand][FilesetResolver]', 'background: orange; color: #fff', {imageSegmenter: this.imageSegmenter, labels: this.imageSegmenter.labels});
                ;
            }


            if(GestureRecognizer && false){
                const vision_hand = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );
                this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision_hand, {
                    baseOptions: {
                      modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                      delegate: "GPU"
                    },
                    numHands: 2,
                    runningMode: "VIDEO",
                    minHandDetectionConfidence: 0.2, //0.0 - 1.0
                    minHandPresenceConfidence: 0.1,//0.0 - 1.0
                    minTrackingConfidence: 0.1//0.0 - 1.0
                });
            }

            if(FaceLandmarker && false){
                    // const vision_faceLand = await FilesetResolver.forVisionTasks(
                    //     "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                    // );

                    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision_tasks, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1,
                    minHandDetectionConfidence: 0.5,  // Float [0,1]. Minimum confidence value for hand detection_confidence
                    minHandPresenceConfidence: 0.5,  // Float [0,1]. Minimum confidence value for hand presence
                    minTrackingConfidence: 0.5,  // Float [0,1]. Minimum confidence value for face tracking
                    outputFaceBlendshapes: true,  // Bool. If true, outputs face blendshapes,
                    outputFacialTransformationMatrixes: true  // Bool. If true, outputs facial transformation matrix

                });
            }

            if(PoseLandmarker && false){
                // const vision_pose = await FilesetResolver.forVisionTasks(
                //     "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                // );

                this.poseLandmarker = await PoseLandmarker.createFromOptions(vision_tasks, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",	
                    numPoses: 1,
                    minPoseDetectionConfidence: 0.5,  // Float [0,1]. Minimum confidence value for detected poses. 0.5 is the default value.
                    minPosePresenceConfidence: 0.5,  // Float [0,1]. Minimum confidence value for pose presence. 0.5 is the default value.
                    minTrackingConfidence: 0.5,  // Float [0,1]. Minimum confidence value for pose tracking. 0.5 is the default value.
                    outputSegmentationMasks: true, // Boolean. Whether to output segmentation masks. False is the default value.
                });
            }

            if(HandLandmarker && false){
                // const vision_handLand = await FilesetResolver.forVisionTasks(
                //     "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                // );

                this.handLandmarker = await HandLandmarker.createFromOptions(vision_tasks, {
                    baseOptions: {
                      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                      delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 2,
                    minHandDetectionConfidence: 0.5,  // Float [0,1]. Minimum confidence value for hand detection_confidence
                    minHandPresenceConfidence: 0.5,  // Float [0,1]. Minimum confidence value for hand_presence_confidence
                    minTrackingConfidence: 0.5,  // Float [0,1]. Minimum confidence value for hand tracking min_tracking_confidence,
                    resultCallback: (result) => {
                        console.log('%c[Oculus][handLandmarker]', 'background: green; color: #fff', result);
                    }
                  });
            }
        }

        // this.options.canvas.element2
        if(bodySegmentation && false){
            const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
            const segmenterConfig = {
            runtime: 'mediapipe', // or 'tfjs'
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
            modelType: 'general'
            }
            this.segmenter = await bodySegmentation.createSegmenter(bodySegmentation.SupportedModels.BodyPix);
            this.debug && console.log('%c[memory][setupDetectHand]', 'background: green; color: #bada55', {memory: tf.memory()});
        }

        if(handPoseDetection && false){
            this.handPoseModel = handPoseDetection.SupportedModels.MediaPipeHands;
            const detectorConfig = {
                runtime: 'mediapipe', //'mediapipe', // or 'tfjs'
                solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands', //'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
                // maxFaces: 10, // Número máximo de rostos a serem detectados
                // refineLandmarks: true, // Se true, melhora a precisão de alguns pontos-chave específicos (por exemplo, olhos)
                // modelType: 'full', // 'lite' ou 'full', onde 'lite' é mais rápido e 'full' é mais preciso
                numHands: 2,
                runningMode: "VIDEO",
                minHandDetectionConfidence: 0.2, //0.0 - 1.0
                minHandPresenceConfidence: 0.2,//0.0 - 1.0
                minTrackingConfidence: 0.2//0.0 - 1.0
            }
            this.handPoseDetector = await handPoseDetection.createDetector(this.handPoseModel, detectorConfig);
        }

        const optionsModel = {
            maxHands: 8,
            flipped: false,
            runtime: "mediapipe", //mediapipe, tfjs
            modelType: "lite", //lite, full
            detectorModelUrl: undefined, //default to use the tf.hub model
            landmarkModelUrl: undefined, //default to use the tf.hub model
        }

        console.log('%c[Oculus][setupDetectHand]', 'background: blue; color: #fff', {optionsModel});
       
        const settings = async () => {
            console.log('%c[Oculus][settings]', 'background: blue; color: #fff', {settings: this.settings});
            this.flow()   
        }
        this.handPose = typeof ml5 !== 'undefined' && ml5 ? await ml5.handPose( optionsModel , settings) : this.flow() ;

        // deeplab 
        if(deeplab && false){
            const loadModel = async () => {
                const modelName = 'pascal';   // set to your preferred model, either `pascal`, `cityscapes` or `ade20k`
                const quantizationBytes = 2;  // either 1, 2 or 4
                return await deeplab.load({base: modelName, quantizationBytes});
            };
            this.modelDeeplabSegmenter = await loadModel();
        }

        return this;
    }

    detectEdges(imageTensor) {
        return tf.tidy(() => {   // Convertendo a imagem para float32
             // Convertendo a imagem para float32 e normalizando para a faixa [0, 1]
            const floatImageTensor = imageTensor.toFloat().div(tf.scalar(255));

            // Definindo o kernel de Sobel para detecção de bordas
            const sobelKernelX = tf.tensor4d([
                [[[-1]], [[0]], [[1]]],
                [[[-2]], [[0]], [[2]]],
                [[[-1]], [[0]], [[1]]]
            ], [3, 3, 1, 1], 'float32');
            
            const sobelKernelY = tf.tensor4d([
                [[[-1]], [[-2]], [[-1]]],
                [[[0]], [[0]], [[0]]],
                [[[1]], [[2]], [[1]]]
            ], [3, 3, 1, 1], 'float32');

            // Aplicando a convolução com o kernel de Sobel para cada canal separadamente
            const channels = floatImageTensor.split(3, 2);
            const edgesX = channels.map(channel => channel.conv2d(sobelKernelX, 1, 'same'));
            const edgesY = channels.map(channel => channel.conv2d(sobelKernelY, 1, 'same'));

            // Calculando a magnitude do gradiente para cada canal
            const magnitudes = edgesX.map((edgeX, i) => edgeX.square().add(edgesY[i].square()).sqrt());

            // Juntando os canais novamente
            const magnitude = tf.concat(magnitudes, 2);

            
            // console.log({magnitude});

            // Normalizando a imagem resultante para a faixa [0, 1]
            const min = magnitude.min();
            const max = magnitude.max();
            const normalized = magnitude.sub(min).div(max.sub(min));

            // Clamping para garantir que os valores estejam na faixa [0, 1]
            const clamped = normalized.clipByValue(0, 1);


            // Aplicar coloração
            const colorized = clamped.mul(255).toInt();
            return colorized;
        });
    }

    createKernel(type='dilation'){ 

            const kernel = {}
            // Definindo o kernel de Sobel para detecção de bordas
            kernel.sobelKernelX = tf.tensor4d([
                [[[-1]], [[0]], [[1]]],
                [[[-2]], [[0]], [[2]]],
                [[[-1]], [[0]], [[1]]]
            ], [3, 3, 1, 1]);
            
            kernel.sobelKernelY = tf.tensor4d([
                [[[-1]], [[-2]], [[-1]]],
                [[[0]], [[0]], [[0]]],
                [[[1]], [[2]], [[1]]]
            ], [3, 3, 1, 1]);

            // Exemplo de um kernel para detecção de bordas
            kernel.laplacian  = tf.tensor4d([
                [[[0]], [[-1]], [[0]]],
                [[[-1]], [[ 4]], [[-1]]],
                [[[0]], [[-1]], [[0]]]
            ], [3, 3, 1, 1]);

            kernel.blur  = tf.tensor4d([
                [[[1/9]], [[1/9]], [[1/9]]],
                [[[1/9]], [[1/9]], [[1/9]]],
                [[[1/9]], [[1/9]], [[1/9]]]
            ], [3, 3, 1, 1]);

            kernel.sharpen  = tf.tensor4d([
                [[[0]], [[-1]], [[0]]],
                [[[-1]], [[5]], [[-1]]],
                [[[0]], [[-1]], [[0]]]
            ], [3, 3, 1, 1]);

            kernel.dilation  = tf.tensor4d([
                [[[1]], [[1]], [[1]]],
                [[[1]], [[1]], [[1]]],
                [[[1]], [[1]], [[1]]]
            ], [3, 3, 1, 1]);


            return kernel[type] ;
       
    }

    codeCuston(imageTensor) {
        return tf.tidy(() => {

            const grayTensor = imageTensor.mean(2).toFloat().expandDims(2);// Convert the image to grayscale
          
            const flattened = grayTensor.flatten(); // Flatten the grayscale tensor
            // Compute histogram manually
            const histogram = Array(256).fill(0);
            flattened.arraySync().forEach(value => {
                histogram[Math.round(value)]++;
            });
            const total = flattened.size;
            const probabilities = histogram.map(value => value / total); // Calculate the probability of each intensity level

            // Compute the cumulative sums and means
            let sumB = 0;
            let wB = 0;
            let maximum = 0.0;
            let sum1 = probabilities.reduce((sum, value, idx) => sum + idx * value, 0);
            let wF, mF, between, threshold = 0;
    
            // Iterate over all possible thresholds
            for (let t = 0; t < 256; t++) {
                wB += probabilities[t];
                if (wB === 0) continue;
    
                wF = 1 - wB;
                if (wF === 0) break;
    
                sumB += t * probabilities[t];
                const mB = sumB / wB;
                mF = (sum1 - sumB) / wF;
    
                // Compute between class variance
                between = wB * wF * Math.pow(mB - mF, 2);
                if (between > maximum) {
                    maximum = between;
                    threshold = t;
                }
            }

            const thresholdTensor = grayTensor.greater(tf.scalar(threshold)).toFloat(); // Apply the optimal threshold
            const outputTensor = tf.stack([thresholdTensor, thresholdTensor, thresholdTensor], 2).squeeze();  // Convert back to 3 channels
            // this.drawTensor(outputTensor);
            /*
            // Render the result to a canvas
            tf.browser.toPixels(outputTensor, this.options.canvas.element3).then(() => {
                // Draw the histogram
                const maxVal = Math.max(...histogram);
        
                this.context4.clearRect(0, 0, this.options.canvas.element3.width, this.options.canvas.element3.height);
                this.context4.fillStyle = 'black';
                for (let i = 0; i < histogram.length; i++) {
                    const barHeight = (histogram[i] / maxVal) * this.options.canvas.element3.height;
                    this.context4.fillRect(i * (this.options.canvas.element3.width / histogram.length), this.options.canvas.element3.height - barHeight, this.options.canvas.element3.width / histogram.length, barHeight);
                }
            });
            */
    
            // Dispose tensors to free memory
            grayTensor.dispose();
            thresholdTensor.dispose();
            flattened.dispose();

            return outputTensor;

            /*
            const grayTensor = imageTensor.mean(2).toFloat().expandDims(2);// Convert the image to grayscale
            const thresholdValue = 127;  // Define a threshold value
            const thresholdTensor = grayTensor.greater(tf.scalar(thresholdValue)).toFloat(); // Apply thresholding
            const outputTensor = tf.stack([thresholdTensor, thresholdTensor, thresholdTensor], 2).squeeze(); // Convert back to 3 channels
        
            const flattened = grayTensor.flatten();// Flatten the grayscale tensor
            const histogram = Array(256).fill(0);
            flattened.arraySync().forEach(value => {
                histogram[value]++;
            });
              // Clear the canvas
              this.context4.clearRect(0, 0, this.options.canvas.element3.width, this.options.canvas.element3.height);
            const maxVal = Math.max(...histogram);
             // Draw the histogram
            this.context4.fillStyle = 'black';
            for (let i = 0; i < histogram.length; i++) {
                const barHeight = (histogram[i] / maxVal) * this.options.canvas.element3.height;
                this.context4.fillRect(i * (this.options.canvas.element3.width / histogram.length), this.options.canvas.element3.height - barHeight, this.options.canvas.element3.width / histogram.length, barHeight);
            }

            grayTensor.dispose();// Dispose tensors to free memory
            thresholdTensor.dispose();
            flattened.dispose();
            // histogram.dispose();
            // outputTensor.dispose();
            
            return outputTensor;
            */

            /*
            // Adicionar dimensão extra para o batch e converter para float32
            const imageTensorExpanded = imageTensor.expandDims(0).toFloat();

            const kernel = this.createKernel();
            const kernelExpanded = kernel.tile([1, 1, 3, 1]); // Ajusta o kernel para 3 canais (RGB)

            const conv2d = tf.conv2d(imageTensorExpanded, kernelExpanded, 1, 'same');

            // Remover dimensão extra
            const conv2dSqueezed = conv2d.squeeze();

            // Normalizar para valores de 0 a 255
            const conv2dNormalized = conv2dSqueezed.sub(conv2dSqueezed.min())
            .div(conv2dSqueezed.max().sub(conv2dSqueezed.min())).mul(255).toInt();

            return conv2dNormalized;
            */
        
        });
    }

    dilation(imageTensor){
        const imageTensorExpanded = imageTensor.expandDims(0).toFloat();

        const kernel = this.createKernel();
        const kernelExpanded = kernel.tile([1, 1, 3, 1]); // Ajusta o kernel para 3 canais (RGB)

        const conv2d = tf.conv2d(imageTensorExpanded, kernelExpanded, 1, 'same');

        // Remover dimensão extra
        const conv2dSqueezed = conv2d.squeeze();

        // Normalizar para valores de 0 a 255
        const conv2dNormalized = conv2dSqueezed.sub(conv2dSqueezed.min())
        .div(conv2dSqueezed.max().sub(conv2dSqueezed.min())).mul(255).toInt();

        return conv2dNormalized;
    }

    pushHandsAnalyse(handsAnalyse){
        this.handsAnalyse = handsAnalyse;
    }

    adjustBrightnessContrast(imageTensor, brightness = 0.1, contrast = 1.5) {
        return tf.tidy(() => {
            return imageTensor.mul(tf.scalar(contrast)).add(tf.scalar(brightness));
        });
    }

    convertToGrayscale(imageTensor) {
        return tf.tidy(() => {
            return imageTensor.mean(2).expandDims(2).tile([1, 1, 3]);
        });
    }

    normalize(imageTensor) {
        return tf.tidy(() => {
            return imageTensor.div(tf.scalar(255)).clipByValue(0, 1);
        });
    }

    /**
     * Applies a Gaussian blur to the given image tensor.
     *
     * @param {tf.Tensor4D} imageTensor - The input image tensor.
     * @return {tf.Tensor4D} The blurred image tensor.
     */
    applyGaussianBlur(imageTensor) {
        return tf.tidy(() => {
            const kernel = tf.tensor2d([1, 4, 6, 4, 1, 4, 16, 24, 16, 4, 6, 24, 36, 24, 6, 4, 16, 24, 16, 4, 1, 4, 6, 4, 1], [5, 5], 'float32');
            const normalizedKernel = kernel.div(kernel.sum());
            const batchedImage = imageTensor.expandDims(0).toFloat();
            const blurredImage = tf.conv2d(batchedImage, normalizedKernel.expandDims(2).expandDims(3), [1, 1, 1, 1], 'same');
            return blurredImage.squeeze();
        });
    }

    /**
     * Processes the image on the canvas and displays the processed image on the canvas.
     *
     * @return {Promise<void>} A promise that resolves when the processed image is displayed on the canvas.
     */
    async processImgCanvas(){

        this.performance.start['processImgCanvas'] = performance.now();
        this.debug && console.groupCollapsed('%c[Oculus][processImgCanvas]', 'background: pink; color: #000');
        this.debug && console.log('%c[memory][processImgCanvas]', 'background: yellow; color: #bada55', {memory: tf.memory()});

        // tf.engine().startScope();
       
        // const imageData = await this.contextPreProcess.getImageData(0, 0, this.options.canvas.preProcess.width, this.options.canvas.preProcess.width);
        const tfImage = tf.browser.fromPixels(this.options.canvas.element);
        const processedImg = this.preprocessTensorImage(tfImage);
        const data = await processedImg.data(); //await processedImg.mul(255).data(); // Convert the tensor back to image data
        const [height, width, channels] = processedImg.shape; // Create a new Uint8ClampedArray to store RGBA values
        const imageData = new Uint8ClampedArray(width * height * 4);


        // this.drawTensor(tfImage);
        // Adicvionando imagem processada no canvas 60 milissegundos será processada amais 
        if (this.options.canvas.preProcess instanceof HTMLCanvasElement) {
            // tf.browser.toPixels(tfImage, this.options.canvas.preProcess);// Visualizar a imagem processada no canvas
            // imageData = tf.browser.toPixels(processedImg);
        } else {
            console.error("processedCanvas não é um elemento canvas.");
        }

        // Fill the new array with RGB values and set Alpha to 255
        for (let i = 0; i < data.length / channels; i++) {
            imageData[i * 4] = data[i * channels];        // R
            imageData[i * 4 + 1] = data[i * channels + 1]; // G
            imageData[i * 4 + 2] = data[i * channels + 2]; // B
            imageData[i * 4 + 3] = 255;                    // A
        }
        
        const imageDataObject = new ImageData(imageData, width, height);
        this.contextPreProcess.putImageData(imageDataObject, 0, 0);
        // this.contextPreProcess.drawImage(imageData, 0, 0, this.options.canvas.preProcess.width, this.options.canvas.preProcess.height);


        await tfImage.dispose();
        await processedImg.dispose();

        // tf.engine().endScope();

        this.debug && console.log('%c[memory][draw]', 'background: yellow; color: #bada55', {memory: tf.memory()});
        this.performance.end['processImgCanvas'] = performance.now(); // Fim da medição
        this.debug && console.log(`Execution time: ${this.performance.end['processImgCanvas'] - this.performance.start['processImgCanvas']} milliseconds`);
        console.groupEnd();
       
        setTimeout(() => {
            this.processImgCanvas();
        }, 10);
            
        

    }

    async drawTensor(tensor_=null){

        // const tensor = tensor_ || tf.randomUniform([480, 640, 3], 0, 255, 'int32');
        let tensorTmp = null;
        if(tensor_){
            tensorTmp = tensor_;
        }else{
            tensorTmp = this.tensors && this.tensors.length > 0 ? this.tensors[0] : tf.randomUniform([480, 640, 3], 0, 255, 'int32');
        }
        
        const tensor = tensorTmp;
        // const tensor = this.stackedTensor ? this.stackedTensor : tf.randomUniform([480, 640, 3], 0, 255, 'int32');

        if(!document.querySelector('#canvasDrawTensor')){
            const canvasDrawTensor = document.createElement('canvas');
            canvasDrawTensor.id = 'canvasDrawTensor';
            canvasDrawTensor.classList.add('canvas');
            canvasDrawTensor.width = this.optionsVideo.video.element.videoWidth;
            canvasDrawTensor.height = this.optionsVideo.video.element.videoHeight;
            document.querySelector(this.oculusOptions.videoInstance.containerSelector).appendChild(canvasDrawTensor);                 
        }
        const contextDrawTensor = canvasDrawTensor.getContext('2d');
        // contextDrawTensor.drawImage(this.optionsVideo.video.element, 0, 0, canvasDrawTensor.width, canvasDrawTensor.height);
        
        const [height, width, channels] = tensor.shape;
        const channelsTmp = channels ? channels : 1;
        // Cria uma imagem vazia com o tamanho do tensor
        const imageData = contextDrawTensor.createImageData(width, height);

        console.log({tensor});
        const data = tensor.dataSync();

        
     
        for (let i = 0; i < data.length; i += channelsTmp) {
            const j = i / channelsTmp * 4;
            imageData.data[j] = data[i]; // Red
            imageData.data[j + 1] = data[i + 1]; // Green
            imageData.data[j + 2] = data[i + 2]; // Blue
            imageData.data[j + 3] = 255; // Alpha
        }
    
        contextDrawTensor.putImageData(imageData, 0, 0);
       
    
        // if(this.stackedTensor){
        //     this.stackedTensor.dispose();
        //     this.stackedTensor = null;
        // }


      
    }


    rgbToHsvTensor(tensor) {
        return tf.tidy(() => {
            const [r, g, b] = tf.split(tensor, 3, 2);
            const rFlat = r.flatten();
            const gFlat = g.flatten();
            const bFlat = b.flatten();

            const max = tf.maximum(rFlat, tf.maximum(gFlat, bFlat));
            const min = tf.minimum(rFlat, tf.minimum(gFlat, bFlat));
            const delta = max.sub(min);

            const v = max;
            const s = tf.where(max.equal(tf.scalar(0)), tf.zerosLike(max), delta.div(max));

            const rc = max.sub(rFlat).div(delta.add(tf.scalar(1e-10)));
            const gc = max.sub(gFlat).div(delta.add(tf.scalar(1e-10)));
            const bc = max.sub(bFlat).div(delta.add(tf.scalar(1e-10)));


            let h = tf.where(rFlat.equal(max), bc.sub(gc), tf.where(gFlat.equal(max), rc.add(tf.scalar(2)), gc.add(tf.scalar(4))));
            h = h.div(tf.scalar(6)).mod(tf.scalar(1)).mul(tf.scalar(360));


            const hReshaped = h.reshape([tensor.shape[0], tensor.shape[1], 1]);
            const sReshaped = s.reshape([tensor.shape[0], tensor.shape[1], 1]);
            const vReshaped = v.reshape([tensor.shape[0], tensor.shape[1], 1]);

            
            
            const hsvTensor =  tf.concat([hReshaped, sReshaped, vReshaped], 2);
 
            return hsvTensor;
        });
    }

    filterAndReplaceColors(tensor, lowerBound, upperBound) {
        return tf.tidy(() => {
            const hsvTensor = this.rgbToHsvTensor(tensor);

            const [h, s, v] = tf.split(hsvTensor, 3, 2);
            const lowerBoundTensor = tf.tensor(lowerBound).reshape([1, 1, 3]);
            const upperBoundTensor = tf.tensor(upperBound).reshape([1, 1, 3]);
    
            const maskH = tf.logicalAnd(
                tf.greaterEqual(h, lowerBoundTensor.slice([0, 0, 0], [1, 1, 1])),
                tf.lessEqual(h, upperBoundTensor.slice([0, 0, 0], [1, 1, 1]))
            );
    
            const maskS = tf.logicalAnd(
                tf.greaterEqual(s, lowerBoundTensor.slice([0, 0, 1], [1, 1, 1])),
                tf.lessEqual(s, upperBoundTensor.slice([0, 0, 1], [1, 1, 1]))
            );
    
            const maskV = tf.logicalAnd(
                tf.greaterEqual(v, lowerBoundTensor.slice([0, 0, 2], [1, 1, 1])),
                tf.lessEqual(v, upperBoundTensor.slice([0, 0, 2], [1, 1, 1]))
            );
    
            const mask = tf.logicalAnd(tf.logicalAnd(maskH, maskS), maskV);
    
            // const mask3d = mask.expandDims(2).tile([1, 1, 3]);
    
            // const white = tf.onesLike(tensor).mul(255);
            // const black = tf.zerosLike(tensor);
    
            // const result = tf.where(mask3d, white, black);
    
            return hsvTensor;
        });
    
    }

    testeProcessamentoImagem(tensor) {
        // Redimensionar a imagem para um tamanho fixo
        const tensorImgResized = tensor.resizeNearestNeighbor([224, 224])
        const tensorImgResizedNormalized = tensorImgResized.toFloat().div(tf.scalar(255));
        const tensorImgNormalized = tensor.toFloat().div(tf.scalar(255));

        // Adicionar brilho manualmente
        const brightnessAdjusted = tensorImgNormalized.add(tf.scalar(0.1)).clipByValue(0, 1);
        // Ajustar contraste manualmente
        const mean = brightnessAdjusted.mean();
        const contrastAdjusted = brightnessAdjusted.sub(mean).mul(tf.scalar(0.9)).add(mean);
        

        return contrastAdjusted;
    }   

    /**
     * Preprocesses an image tensor by applying various image processing techniques.
     *
     * @param {Tensor} imageTensor - The image tensor to be preprocessed.
     * @return {Tensor} The preprocessed image tensor.
     */
    preprocessTensorImage(imageTensor) {
        return tf.tidy(() => {
            let processedTensorImg = imageTensor;

            // console.log({'antes': processedTensorImg});

        
            // Ajuste de brilho e contraste
            // processedTensorImg = this.adjustBrightnessContrast(processedTensorImg, -50, 1);


            // processedTensorImg = this.testeProcessamentoImagem(processedTensorImg);

            // Conversão para escala de cinza
            // processedTensorImg = this.convertToGrayscale(processedTensorImg);


            // Aplicar desfoque gaussiano TODO:codigo quebrado
            // processedTensorImg = this.applyGaussianBlur(processedTensorImg);

            // processedTensorImg = this.codeCuston(processedTensorImg);

            // processedTensorImg = this.detectEdges(processedTensorImg);

            
           
            // processedTensorImg = this.dilation(processedTensorImg);

            // processedTensorImg = this.rgbToHsvTensor(processedTensorImg);

            // processedTensorImg = this.filterAndReplaceColors(processedTensorImg, [35, 50, 50], [85, 100, 100]);

            // Normalização
            // processedTensorImg = this.normalize(processedTensorImg);
            processedTensorImg  = processedTensorImg.div(tf.scalar(255.0));

            // Redimensionar para a entrada do modelo
            // processedTensorImg = tf.image.resizeBilinear(processedTensorImg, [128, 128]);

            this.inforBuffer['preProcess'] = {
                origin: {
                    shape: imageTensor.shape
                },
                processed: {
                    shape: processedTensorImg.shape
                }
                
            };
            
            return processedTensorImg;
        });
    }

    /**
     * Asynchronously performs the flow of the function.
     *
     * @return {Promise<Object>} Returns a promise that resolves to this object.
     */
    async flow(){

   
        // let {canvasPreProcess, imageData} = this.oculusOptions.videoInstance.captureFrame({ video: this.options.video.elementRTC });
        const canvasfromPixels = null//tf.browser.fromPixels(imageData);

        console.log('%c[Oculus][flow][imgPreProcessed]', 'background: blue; color: #bada55', {canvasPreProcess: null, canvasfromPixels: canvasfromPixels});

        if(this.handPose){
            if(this.oculusOptions.detectHand){
                this.handPose.detectStart(this.eyeLeft, (r) =>  this.pushHandsAnalyse(r))
            }
        }
     
    
        this.loopHandPoseDetector();  
        this.draw();
        this.processImgCanvas();
        this.buildMenu()
        // this.loadImg();
        this.debug && console.log('%c[memory][flow]', 'background: green; color: #bada55', {memory: tf.memory()});

        return this;
    }

    /**
     * Draws the hands and other visual elements on the canvas.
     *
     * @return {void} This function does not return anything.
     */
    async draw(){
        // requestAnimationFrame( this.draw.bind(this) );
        this.performance.start['draw'] = performance.now();
        this.debug && console.groupCollapsed('%c[Oculus][draw]', 'background: blue; color: #bada55');
        this.debug && console.log('%c[memory][draw]', 'background: yellow; color: #bada55', {memory: tf.memory()});
      
        if(this && typeof this.handsAnalyse !== 'undefined' && true) {

            if(!this.loopDebugEnd) {
                this.debug && console.log('%c[Oculus][draw]', 'background: blue; color: #fff', {handsAnalyse: this.handsAnalyse});
                this.loopDebugEnd = true;
            }
            // requestAnimationFrame( ()=> this.draw() );
            // Limpar o canvas
            // this.context.clearRect(0, 0, this.frame.width, this.frame.height);
            // this.context.drawImage(this.frame, 0, 0, this.frame.width, this.frame.height);

            this.width = this.options.canvas.element.width;
            this.height = this.options.canvas.element.height;

              //pre-process
            // this.contextPreProcess.drawImage(this.options.video.element, 0, 0, this.options.canvas.preProcess.width, this.options.canvas.preProcess.height);
            
            //overlay-min
            this.context.drawImage(this.options.video.element, 0, 0, this.width, this.height);
            
            //overlay2
            // this.context2.drawImage(this.options.video.element, 0, 0, this.width, this.height);


            // this.filter();

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

            // this.context3
            if(this.faceDetectorDetections){
                this.context3.clearRect(0, 0, this.context3.canvas.width, this.context3.canvas.height);
                this.context3.drawImage(this.options.video.element, 0, 0, this.width, this.height);
                for(let detection of this.faceDetectorDetections){
                    this.context3.strokeStyle = 'red';
                    this.context3.lineWidth = 2;
                    this.context3.strokeRect(detection.boundingBox.originX, detection.boundingBox.originY, detection.boundingBox.width, detection.boundingBox.height);
                }
            }

            if( this.objectDetectorDetection && this.objectDetectorDetections.detections && false){
                for(let detection of this.objectDetectorDetections.detections){
                    if(detection.categories){
                        console.log( {detection });
                    }
                }
            }

            if(this.gestureRecognizerResult){
                this.context4.drawImage(this.options.video.element, 0, 0, this.width, this.height);
                let drawingUtils = new DrawingUtils(this.context4);

                if (this.gestureRecognizerResult.landmarks) {

                    const emogi = {
                        'Closed_Fist': '✊',
                        'Open_Palm': '✋',
                        'Thumb_Up': '👍',
                        'Thumb_Down': '👎',
                        'Victory': '✌',
                        'ILoveYou': '🤟 😍',
                        'Pointing_Up': '☝️',
                    }
                   for (const landmarks of this.gestureRecognizerResult.landmarks) {
       
                        drawingUtils.drawConnectors(
                           landmarks,
                           GestureRecognizer.HAND_CONNECTIONS,
                           {
                             color: "#00FF00",
                             lineWidth: 5
                           }
                        );
                        drawingUtils.drawLandmarks(landmarks, {
                           color: "#FF0000",
                           lineWidth: 2
                        });

                        var handDetect = {}
                        if(this.gestureRecognizerResult.handednesses.length == 1 ){
                            // console.log('>>>>',this.determinarPosicaoDaMao(this.gestureRecognizerResult.worldLandmarks[0]));

                            if(this.gestureRecognizerResult.handednesses[0][0].categoryName == 'Right'){
                                handDetect['Right'] = false;
                                handDetect['Left'] = this.gestureRecognizerResult.gestures[0][0].categoryName;
                            }
                            if(this.gestureRecognizerResult.handednesses[0][0].categoryName == 'Left'){
                                handDetect['Right'] = this.gestureRecognizerResult.gestures[0][0].categoryName;
                                handDetect['Left'] = false;
                            }
                        }else if(this.gestureRecognizerResult.handednesses.length > 1){
                            handDetect['Left'] = this.gestureRecognizerResult.handednesses[0][0].categoryName == 'Right' ? this.gestureRecognizerResult.gestures[0][0].categoryName : this.gestureRecognizerResult.gestures[1][0].categoryName;
                            handDetect['Right'] = this.gestureRecognizerResult.handednesses[0][0].categoryName == 'Left' ? this.gestureRecognizerResult.gestures[0][0].categoryName : this.gestureRecognizerResult.gestures[1][0].categoryName;
                        }
                        

                        this.ObserverOculus = {
                            ...this.ObserverOculus,
                            gestures: this.gestureRecognizerResult,
                            handRight: emogi[this.gestureRecognizerResult.gestures[0][0].categoryName],
                            handLeft: emogi[this.gestureRecognizerResult.gestures[1] ? this.gestureRecognizerResult.gestures[1][0].categoryName : 'none'],
                            hand: this.gestureRecognizerResult.handednesses,
                            lengthHand: this.gestureRecognizerResult.handednesses.length,
                            handDetect: handDetect
                        };

                        // console.log(handDetect)
       
                    //  console.log('%c[Oculus][gestureRecognizer]', 'background: blue; color: #fff', {gestureRecognizerResult: this.gestureRecognizerResult, results: this.gestureRecognizerResult.gestures[0][0].categoryName});
                   }
                }else{
                    console.log('%c[Oculus][gestureRecognizer]', 'background: blue; color: #fff', {gestureRecognizerResult: this.gestureRecognizerResult, results: 'none'});
                }
            }

            if(this.faceLandmarkerResults){

                if(!document.querySelector('#canvasFaceLandmarker')){
                    const canvasFaceLandmarker = document.createElement('canvas');
                    canvasFaceLandmarker.id = 'canvasFaceLandmarker';
                    canvasFaceLandmarker.classList.add('canvas');
                    canvasFaceLandmarker.width = this.optionsVideo.video.element.videoWidth;
                    canvasFaceLandmarker.height = this.optionsVideo.video.element.videoHeight;
                    document.querySelector(this.oculusOptions.videoInstance.containerSelector).appendChild(canvasFaceLandmarker);                 
                }

                if (this.faceLandmarkerResults.faceLandmarks) {
                    // console.log('%c[Oculus][faceLandmarker]', 'background: blue; color: #fff', {faceLandmarkerResults: this.faceLandmarkerResults});
                    const contextFaceLandmarker = canvasFaceLandmarker.getContext('2d');

                    // contextFaceLandmarker.clearRect(0, 0, canvasFaceLandmarker.width, canvasFaceLandmarker.height);
                    contextFaceLandmarker.drawImage(this.optionsVideo.video.element, 0, 0, canvasFaceLandmarker.width, canvasFaceLandmarker.height);
                    
                    let drawingUtils = new DrawingUtils(contextFaceLandmarker);
                    for (const landmarks of this.faceLandmarkerResults.faceLandmarks) {
                        await drawingUtils.drawConnectors(
                        landmarks,
                        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                        { color: "#C0C0C070", lineWidth: 1 }
                      );
                      drawingUtils.drawConnectors(
                        landmarks,
                        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                        { color: "#FF3030" }
                      );
                      drawingUtils.drawConnectors(
                        landmarks,
                        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
                        { color: "#FF3030" }
                      );
                      drawingUtils.drawConnectors(
                        landmarks,
                        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                        { color: "#30FF30" }
                      );
                      drawingUtils.drawConnectors(
                        landmarks,
                        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
                        { color: "#30FF30" }
                      );
                      drawingUtils.drawConnectors(
                        landmarks,
                        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
                        { color: "#E0E0E0" }
                      );
                      drawingUtils.drawConnectors(
                        landmarks,
                        FaceLandmarker.FACE_LANDMARKS_LIPS,
                        { color: "#E0E0E0" }
                      );
                      drawingUtils.drawConnectors(
                        landmarks,
                        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
                        { color: "#FF3030" }
                      );
                      drawingUtils.drawConnectors(
                        landmarks,
                        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
                        { color: "#30FF30" }
                      );
                    }
                }
            }

            if(this.poseLandmarkerResults){

                if(!document.querySelector('#canvasPose')){
                    const canvasPose = document.createElement('canvas');
                    canvasPose.id = 'canvasPose';
                    canvasPose.classList.add('canvas');
                    canvasPose.width = this.optionsVideo.video.element.videoWidth;
                    canvasPose.height = this.optionsVideo.video.element.videoHeight;
                    document.querySelector(this.oculusOptions.videoInstance.containerSelector).appendChild(canvasPose);                 
                }
                 const contextPose = canvasPose.getContext('2d');
                 contextPose.drawImage(this.optionsVideo.video.element, 0, 0, canvasPose.width, canvasPose.height);

                 if(this.poseLandmarkerResults.landmarks){
                    let drawingUtils = new DrawingUtils(contextPose);
                    contextPose.save()

                    const radiusMin = 1;  // Raio mínimo
                    const radiusMax = 100; // Raio máximo

                    for (const landmark of this.poseLandmarkerResults.landmarks) {
                        drawingUtils.drawLandmarks(landmark, {
                            radius: (data) => {
                                if(data.from){
                                    return DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
                                }
                            },
                        });

                        const zRed = landmark[15].z;
                        const zBlue = landmark[16].z;

                        if(false){
                             // Desenha um ponto azul no landmark de índice 16 com tamanho baseado no eixo z
                       

                            const wristLandmarkRed = landmark[15];
                            const wristLandmarkBlue = landmark[16];
                            const leftShoulderLandmark = landmark[11];
                            const rightShoulderLandmark = landmark[12];
                            // Calcule a distância do pulso ao ombro
                            const leftShoulderDistanceRed = Math.sqrt(
                                Math.pow(wristLandmarkRed.x - leftShoulderLandmark.x, 2) +
                                Math.pow(wristLandmarkRed.y - leftShoulderLandmark.y, 2) +
                                Math.pow(wristLandmarkRed.z - leftShoulderLandmark.z, 2)
                            );
                            const rightShoulderDistanceRed = Math.sqrt(
                                Math.pow(wristLandmarkRed.x - rightShoulderLandmark.x, 2) +
                                Math.pow(wristLandmarkRed.y - rightShoulderLandmark.y, 2) +
                                Math.pow(wristLandmarkRed.z - rightShoulderLandmark.z, 2)
                            );

                            const leftShoulderDistanceBlue = Math.sqrt(
                                Math.pow(wristLandmarkBlue.x - leftShoulderLandmark.x, 2) +
                                Math.pow(wristLandmarkBlue.y - leftShoulderLandmark.y, 2) +
                                Math.pow(wristLandmarkBlue.z - leftShoulderLandmark.z, 2)
                            );
                            const rightShoulderDistanceBlue = Math.sqrt(
                                Math.pow(wristLandmarkBlue.x - rightShoulderLandmark.x, 2) +
                                Math.pow(wristLandmarkBlue.y - rightShoulderLandmark.y, 2) +
                                Math.pow(wristLandmarkBlue.z - rightShoulderLandmark.z, 2)
                            );
                            // Calcule a posição média dos ombros para determinar a posição do tronco
                            const torsoZ = (leftShoulderLandmark.z + rightShoulderLandmark.z) / 2;
                            // Verifique se o pulso está à frente do corpo (em relação ao eixo z)
                            const isPunchingRed = wristLandmarkRed.z < torsoZ && (leftShoulderDistanceRed < 0.3 || rightShoulderDistanceRed < 0.3);
                            const isPunchingBlue = wristLandmarkBlue.z < torsoZ && (leftShoulderDistanceBlue < 0.3 || rightShoulderDistanceBlue < 0.3);
                            if (isPunchingRed) {
                                console.log("A pose indica um soco (punch).");
                                this.ObserverOculus['punch-wrist-red'] = landmark;
                            } else {
                                // console.log("A pose não indica um soco (punch).");
                                this.ObserverOculus['punch-wrist-red'] = false;
                            }
                            if (isPunchingBlue) {
                                console.log("A pose indica um soco (punch).");
                                this.ObserverOculus['punch-wrist-blue'] = landmark;
                            } else {
                                // console.log("A pose não indica um soco (punch).");
                                this.ObserverOculus['punch-wrist-blue'] = false;
                            }

                            if(isPunchingBlue || isPunchingRed){
                                this.ObserverOculus['punch'] = isPunchingRed ? 'wrist-red' : 'wrist-blue';
                            }else{
                                this.ObserverOculus['punch'] = false;
                            }
                        }
                        
                        const radiusRed = DrawingUtils.lerp(zRed, -0.15, 0.1, 10, 5)// Ajuste os valores conforme você precisa
                        const radiusBlue = DrawingUtils.lerp(zBlue, -0.15, 0.1, 10, 5); // Ajuste os valores conforme necessário

                        // Desenha um ponto azul no landmark de índice 16
                        drawingUtils.drawLandmarks([landmark[15]], {
                            color: '#FF0000',  // Cor red
                            radius: radiusRed,         // Raio do ponto (ajuste conforme necessário)
                        });

                         // Desenha um ponto azul no landmark de índice 16
                        drawingUtils.drawLandmarks([landmark[16]], {
                            color: '#0000FF',  // Cor azul
                            radius: radiusBlue,         // Raio do ponto (ajuste conforme necessário)
                        });
                    

                       
                        this.ObserverOculus['pose'] = landmark;
                        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});



                        // console.log('wrists', {wrists: this.wrists.left, max: this.wrists.leftMax, min: this.wrists.leftMin, avg: this.wrists.leftAvg});


                        // drawingUtils.drawLandmarks(landmark,{color: '#FF0000', lineWidth: 2});
                    }

                    contextPose.restore();

                 }
                 
            }

            if(this.handLandmarkerResults){
                if (this.handLandmarkerResults.landmarks) {
                    this.context4.drawImage(this.options.video.element, 0, 0, this.width, this.height);
                    let drawingUtils = new DrawingUtils(this.context4);
                    this.context4.save()
                    for (const landmarks of this.handLandmarkerResults.landmarks) {
                        // console.log('handLandmarkerResults', landmarks);
                        drawingUtils.drawLandmarks(landmarks, { 
                            color: "#FF0000", 
                            lineWidth: 2 
                        });

                        drawingUtils.drawConnectors(landmarks, this.handLandmarker.HAND_CONNECTIONS, {
                            color: "#00FF00",
                            lineWidth: 5
                        });
                    }
                    this.context4.restore();
                }
            }
      
            this.handsAnalyse.length = 0;


            if(this.segmenterResultDeeplab && !this.test){
                this.test = false;
 
                const imageData = this.context4.getImageData(0, 0, this.options.canvas.element.width, this.options.canvas.element.height);
                
                console.log('imageData', {imageData, segmentationMap: this.segmenterResultDeeplab.segmentationMap});


                const drawSegmentation = (ctx, imageData, segmentationMap) => {
                    const data = imageData.data;
                    
                    for (let i = 0; i < data.length; i += 4) {
                      const classId = segmentationMap[i / 4];
                      if (classId === 0) {
                        // Make background transparent
                        data[i + 3] = 0;
                      } else {
                        // Color other segments
                        data[i] = 255; // Red
                        data[i + 1] = 0; // Green
                        data[i + 2] = 0; // Blue
                        data[i + 3] = 255; // Alpha
                      }
                    }
                    
                    ctx.putImageData(imageData, 0, 0);
                  }
  
                drawSegmentation(this.context4, imageData, this.segmenterResultDeeplab.segmentationMap);
                // for (let i = 0; i < data.length; i += 4) {
                //     const classId = this.segmenterResultDeeplab.segmentationMap[i / 4];

                //     console.log('classId', classId);
                //     if (classId === 0) {
                //       // Make background transparent
                //       data[i + 3] = 0;
                //     } else {
                //       // Color other segments
                //       data[i] = 255; // Red
                //       data[i + 1] = 0; // Green
                //       data[i + 2] = 0; // Blue
                //       data[i + 3] = 255; // Alpha
                //     }
                // }
            }
        };

        this.debug && console.log('%c[memory][draw]', 'background: yellow; color: #bada55', {memory: tf.memory()});
        this.performance.end['draw'] = performance.now(); // Fim da medição
        this.debug && console.log(`Execution time: ${this.performance.end['draw'] - this.performance.start['draw']} milliseconds`);
        console.groupEnd();

        setTimeout(() => {
            this.draw();
        }, 15);

    }

    determinarPosicaoDaMao(worldLandmarks) {
        // Função para calcular a média dos valores z
        function calcularMediaZ(landmarks) {
            let somaZ = 0;
            for (let i = 0; i < landmarks.length; i++) {
                somaZ += landmarks[i].z;
            }
            return somaZ / landmarks.length;
        }
    
        // Obter a média dos valores z
        let mediaZ = calcularMediaZ(worldLandmarks);
    
        // Determinar se a mão está mais para frente ou para trás
        if (mediaZ < 0) {
            return "A mão está mais para frente." + mediaZ;
        } else {
            return "A mão está mais para trás." + mediaZ;
        }
    }

    applyFilter(imageData, kernel, context) {
        const width = imageData.width;
        const height = imageData.height;
        const output = context.createImageData(width, height);
        const data = imageData.data;
        const outputData = output.data;
        const half = Math.floor(Math.sqrt(kernel.length) / 2);


        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              let r = 0, g = 0, b = 0;
              for (let ky = -half; ky <= half; ky++) {
                for (let kx = -half; kx <= half; kx++) {
                  const xk = x + kx;
                  const yk = y + ky;
                  if (xk >= 0 && xk < width && yk >= 0 && yk < height) {
                    const i = (yk * width + xk) * 4;
                    const w = kernel[(ky + half) * (half * 2 + 1) + (kx + half)];
                    r += data[i] * w;
                    g += data[i + 1] * w;
                    b += data[i + 2] * w;
                  }
                }
              }
              const index = (y * width + x) * 4;
              outputData[index] = Math.min(Math.max(r, 0), 255);
              outputData[index + 1] = Math.min(Math.max(g, 0), 255);
              outputData[index + 2] = Math.min(Math.max(b, 0), 255);
              outputData[index + 3] = data[index + 3]; // Preserve alpha channel
            }
          }

        return output;
    }

    applyDilation(imageData, context) {
        const width = imageData.width;
        const height = imageData.height;
        const output = context.createImageData(width, height);
        const data = imageData.data;
        const outputData = output.data;
        
        const kernel = [
          [0, 1, 0],
          [1, 1, 1],
          [0, 1, 0]
        ];
      
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            let maxR = 0, maxG = 0, maxB = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const xk = x + kx;
                const yk = y + ky;
                const i = (yk * width + xk) * 4;
                if (kernel[ky + 1][kx + 1] === 1) {
                  maxR = Math.max(maxR, data[i]);
                  maxG = Math.max(maxG, data[i + 1]);
                  maxB = Math.max(maxB, data[i + 2]);
                }
              }
            }
            const index = (y * width + x) * 4;
            outputData[index] = maxR;
            outputData[index + 1] = maxG;
            outputData[index + 2] = maxB;
            outputData[index + 3] = data[index + 3]; // Preserve alpha channel
          }
        }
      
        return output;
    }

    loadImg() {
        const img = new Image();
        img.src = '../../img/test.webp';
        img.onload = () => {
            this.options.canvas.canvasmin.width = img.width;
            this.options.canvas.canvasmin.height = img.height;
            
            this.options.canvas.element3.width = img.width;
            this.options.canvas.element3.height = img.height;

            this.context3.drawImage(img, 0, 0);
            this.context4.drawImage(img, 0, 0);

            const imageData = this.context4.getImageData(0, 0, img.width, img.height);

            const filteredData = this.applyDilation(imageData,this.context4);

        

            this.context4.putImageData(filteredData, 0, 0);
        };
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

        // for (let i = 0; i < data.length; i += 4) {
        //     // const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

        //     if( ( data[i + 1] + data[i + 2] > 50)  ) {
        //         data[i] = 100;     // Inverte o vermelho
        //         data[i + 1] = 100; // Inverte o verde
        //         data[i + 2] = 100; // Inverte o azul
        //     }

        // }

        // filter grayscale
        function applyGrayscale(imageData) {
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg;
              data[i + 1] = avg;
              data[i + 2] = avg;
            }
            return imageData;
        }

        function applyThreshold(imageData, threshold) {
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const value = data[i] > threshold ? 255 : 0;
              data[i] = value;
              data[i + 1] = value;
              data[i + 2] = value;
            }
            return imageData;
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

        const grayscaleData = applyGrayscale(imageData);
        const binaryData = applyThreshold(grayscaleData, 128);

        this.context3.putImageData(binaryData, 0, 0);
        // this.context2.putImageData(imageData, 0, 0);
    }


    async captureFrameToDownloadImage({canvas}) {
        const dataURL = canvas.toDataURL('image/png');
        const canvasBlob = await (await fetch(dataURL)).blob();
        const canvasFile = new File([canvasBlob], 'image.png', {type: 'image/png'});
        const classIdTmp = document.querySelector('[name="class_id"]').value;
        const url = URL.createObjectURL(canvasBlob);
        const dataURLToSave = (() => { const c = document.createElement('canvas'); c.width = this.optionsVideo.video.element.videoWidth; c.height = this.optionsVideo.video.element.videoHeight; c.getContext('2d').drawImage(this.optionsVideo.video.element, 0, 0, c.width, c.height); return c.toDataURL('image/png'); })();
        if(this.nameModules && this.nameModules.save ) {
            if(this.nameModules.save.imagesDataURLs && this.nameModules.save.imagesDataURLs.length > 0) {
                this.nameModules.save.imagesDataURLs.push({dataURL:dataURLToSave, name: this.nameModules.save.name, label: classIdTmp, blob: canvasBlob, url});
            }else {
                this.nameModules.save.imagesDataURLs = [{dataURL:dataURLToSave, name: this.nameModules.save.name, label: classIdTmp, blob: canvasBlob, url}];
            }
            console.log({imagesDataURLs :this.nameModules.save.imagesDataURLs});
        }
    }

    async previewModel({tensor}) {

        let div = null; 
        if(!document.querySelector('.preview-module')) {
            div = document.createElement('div');
            div.classList.add('preview-module');
            document.body.appendChild(div);
        }else {
            div = document.querySelector('.preview-module');
        }
   
        const [height, width, channels] = tensor.shape;
        const data = tensor.dataSync();
        const channelsTmp = channels ? channels : 1;
        const canvasTmp = document.createElement('canvas');
        canvasTmp.width = width;
        canvasTmp.height = height;
        const contextTmp = canvasTmp.getContext('2d');
        const imageData = contextTmp.createImageData(canvasTmp.width, canvasTmp.height);
        
    
        for (let i = 0; i < data.length; i += channelsTmp) {
            const j = i / channelsTmp * 4;
            imageData.data[j] = data[i]; // Red
            imageData.data[j + 1] = data[i + 1]; // Green
            imageData.data[j + 2] = data[i + 2]; // Blue
            imageData.data[j + 3] = 255; // Alpha
        }
        
        contextTmp.putImageData(imageData, 0, 0);
        
        this.captureFrameToDownloadImage({canvas:canvasTmp});
        
        div.appendChild(canvasTmp);
    }

    async listModels(inputListModel) {

        console.groupCollapsed("%c[Oculus][listModels]", 'background: brown; color: #000');
        console.log('%c[memory][listModels]', 'background: yellow; color: #bada55', {memory: tf.memory()});
        try {
        const models = await tf.io.listModels();
        console.log('Modelos armazenados no IndexedDB:', models);
    
        for (const [key, value] of Object.entries(models)) {
            console.log('%c[memory][listModels]', 'background: yellow; color: #bada55', { URL: key, Data: JSON.stringify(value) });

            inputListModel.innerHTML += `<option value="${key}">${key}</option>`;
        }
        } catch (error) {
        console.error('Erro ao listar os modelos:', error);
        }
    
        console.groupEnd();
       
    }

    async createModuleCustom() {
        console.log('createModuleCustom');
        if (this.tensors.length === 0) {
            alert('Please capture some images first!');
            return;
        }

        if(this.nameModules.save.length === 0) {
            alert('Please create some modules first!');
            return;
        }

        console.log({nameModules: this.nameModules, classMap: this.classMap});

        
        const numClasses = Object.keys(this.classMap).length;
    
        const model = tf.sequential();

        /**  
         * Primeira camada de convolução
         * Esta camada processa imagens de entrada com 3 canais de cor (RGB) e aplica 32 filtros de convolução com tamanho 3x3, 
         * usando a função de ativação ReLU. 
         */
        model.add(tf.layers.conv2d({ 
            inputShape: [224, 224, 3], 
            filters: 32, 
            kernelSize: 3, 
            activation: 'relu' 
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
        // model.add(tf.layers.dropout({ rate: 0.25 }));

        /*
        // Camada de Convolução 2
        model.add(tf.layers.conv2d({ 
            filters: 64, 
            kernelSize: 3, 
            activation: 'relu' 
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
        */

        /*
        // Camada de Convolução 3
        model.add(tf.layers.conv2d({ 
            filters: 128, 
            kernelSize: 3, 
            activation: 'relu' 
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
        */

        /**
         * Esta camada achata as saídas da camada conv2d, convertendo os tensores 4D 
         * (por exemplo, [batchSize, height, width, channels]) 
         * em tensores 2D (por exemplo, [batchSize, flattenedFeatures]).
         */
        model.add(tf.layers.flatten()); // Camada de achatamento



        // Primeira camada densa
        model.add(tf.layers.dense({ 
            units: 256, 
            activation: 'relu' 
        }));
        model.add(tf.layers.dropout({ rate: 0.5 }));



        // Segunda camada densa
        model.add(tf.layers.dense({ 
            units: 128, 
            activation: 'relu' 
        }));
        model.add(tf.layers.dropout({ rate: 0.5 }));


        /**
         * Camada densa final para classificação
         * As camadas densas são então adicionadas após a camada de achatamento. A primeira camada densa tem 128 unidades com a função de ativação ReLU.
         * A camada densa final tem um número de unidades igual ao número de classes (numClasses), com a função de ativação softmax para classificação.
         */
        model.add(tf.layers.dense({ 
            units: numClasses, 
            activation: 'softmax' 
        }));
    
        
        /**
         * Compilação do modelo
         * O modelo é compilado com o otimizador Adam, 
         * a função de perda sparseCategoricalCrossentropy, 
         * e a métrica de precisão (accuracy).
         */
        model.compile({ 
            optimizer: tf.train.adam(0.0001), 
            loss: 'sparseCategoricalCrossentropy', 
            metrics: ['accuracy'] 
        });
    
        model.summary();





     
      

        //[*,224,224,1] => [*,224,224,3]
        // const tensorsWithThreeChannels = await Promise.all(
        //     this.tensors.map(tensor => tf.image.grayscaleToRGB(tensor))
        // );

        let epoch = parseInt(document.querySelector('[name="qt_epochs"]').value);
        epoch = epoch < 50 ? 50 : epoch;

        const xs = tf.concat(this.tensors); //.toFloat()//.reshape([this.tensors.length, 224, 224, 3]).toFloat();
        const ys = tf.tensor1d(this.labels, 'int32').toFloat();


        this.inforBuffer['createModuleCustom'] = {xs:{shape:xs.shape}, ys:{shape:ys.shape}, epochs:epoch};


        console.log('%c[memory][createModuleCustom]', 'background: yellow; color: #bada55',{inforBuffer: this.inforBuffer});
    
        await model.fit(xs, ys, {
            epochs: epoch, // Increase epochs for better training
            batchSize: 4, // Use smaller batches to improve learning stability
            validationSplit: 0.2, // Use validation split to monitor performance
            // validationData: [xs, ys],
            callbacks: [
                tfvis.show.fitCallbacks(
                    { name: 'Training Performance' },
                    ['loss', 'val_loss', 'acc', 'val_acc'],
                    { callbacks: ['onEpochEnd'] }
                ),
                // Adiciona o histograma de pesos da primeira camada densa após cada epoch
                {
                    onEpochEnd: async (epoch, logs) => {
                        console.log('%c[memory][createModuleCustom]', 'background: yellow; color: #bada55',{epoch, logs});
                    }
                }
            
            ]
        });

        let confirmationSaveModel = confirm(`Do you want to save the model ${this.nameModules.save.name} ?`);
        if (confirmationSaveModel) {
            // await model.save('localstorage://meu-modelo');
            // await model.save(`indexeddb://${this.nameModules.save.name}`);
            await model.save(`downloads://my-model-${this.nameModules.save.name}`);
            console.log('Modelo salvo:', model);
            localStorage.setItem(`${this.nameModules.save.name}_classMap`, JSON.stringify(this.classMap));
        
            alert('Model trained successfully!');

        }

        this.model = model;

        const prediction = await model.predict(xs);
        prediction.print();
        console.log({ prediction });
  

        // const prediction2 = await model.predict(tensorsWithThreeChannels[0]);
        // prediction2.print();
        // console.log({ prediction2 });
        // prediction2.dispose();
        prediction.dispose();

        return model;
 
    }

    async saveImage(imgTosaveInfo, index, blob=null) {
        
        return new Promise(resolve => {
            const url = blob ? URL.createObjectURL(blob) : null;
            const link = document.createElement('a');
            link.href = blob ? url : imgTosaveInfo.dataURL;
            link.download = `tensor-image-${imgTosaveInfo.name}-${imgTosaveInfo.label}-${index + 1}.png`;
            document.body.appendChild(link);
    
            link.addEventListener('click', () => {
                document.body.removeChild(link);
                resolve();
            }, { once: true });
    
            link.click();
            blob && URL.revokeObjectURL(url); // Libera a memória
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    saveTensorsAsImages() {

        const dataStr = JSON.stringify({
            labels: this.labels,
            model: this.nameModules.save.name,
            classMap: this.classMap,
            images: this.nameModules.save.imagesDataURLs.map((imgTosaveInfo, i) => {
                return {
                    classId: imgTosaveInfo.label,
                    label: imgTosaveInfo.label,
                    name: imgTosaveInfo.name,
                    cropBox: this.cropBox,
                    box: [this.cropBox.y, this.cropBox.x, this.cropBox.y + this.cropBox.height, this.cropBox.x + this.cropBox.width],
                    img: `tensor-image-${imgTosaveInfo.name}-${imgTosaveInfo.label}-${i}.png`
                }
            })
        });

        const dataURI = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const imgTosaveInfo = this.nameModules.save.imagesDataURLs[0];
        const link_ = document.createElement('a');
        link_.href = dataURI;
        link_.download = `schema-tensor-image-${imgTosaveInfo.name}-${imgTosaveInfo.label}.json`;
        document.body.appendChild(link_);
        link_.click();
        document.body.removeChild(link_);

        (async () => {

            const imagesDataURLs = this.nameModules.save.imagesDataURLs;
            
            while (imagesDataURLs.length >= 0) {
                const imgTosaveInfo = imagesDataURLs.shift(); // Remove o primeiro elemento do array
                await this.saveImage(imgTosaveInfo, imagesDataURLs.length);
                await this.delay(500);
            }
        
        })().catch(error => {
            console.error('Erro ao salvar as imagens:', error);
        });
    }

    async predictModel() {

        console.log('%c[Oculus][predictModel]', 'background: #36447b;color:#fff', {nameModules: this.nameModules});
        console.log('%c[memory][getCropBoxToData]', 'background: blue; color: #bada55', {memory: tf.memory()});

        const predictModelRecursive = async () => {


            if(this.stopPredicting){
                setTimeout(() => {
                    predictModelRecursive();
                }, 10);
                return;
            };

            if (!this.model) {
                console.log('Model not ready, retrying...', {numTensors: tf.memory().numTensors});
                setTimeout(() => {
                    predictModelRecursive();
                }, 500);
                return;
            }

            // Ensure the video element is ready
            if (!this.optionsVideo.video.element || this.optionsVideo.video.element.readyState < 2) {
                console.log('Video element not ready, retrying...');
                setTimeout(() => {
                    predictModelRecursive();
                }, 500);
                return;
            }
    
            // setTimeout(() => {
            //     predictModelRecursive();
            // }, 500);
      
            const tensors = [];
            try {
                tf.engine().startScope();

                const tensor = tf.browser.fromPixels(this.optionsVideo.video.element);
            
                const box = [this.cropBox.y, this.cropBox.x, this.cropBox.y + this.cropBox.height, this.cropBox.x + this.cropBox.width];
                const cropTensor = tf.image.cropAndResize(tensor.expandDims(0), [box], [0], [224, 224]).toFloat();
                tensors.push(this.preprocessTensorImage(cropTensor));
        
                // const tensorsWithThreeChannels = [tensors[0]].map(tensor => tf.image.grayscaleToRGB(tensor));
                // const xs = tf.concat(tensorsWithThreeChannels).reshape([1, 224, 224, 3]).toFloat();
                const xs = this.preprocessTensorImage(cropTensor).reshape([1, 224, 224, 3]).toFloat();
        
                // await this.model.predict(xs).print();
                const binaryResult = await this.model.predict(xs).argMax(1).arraySync();
                console.log({
                    result: binaryResult[0],
                    class: Object.keys(this.classMap).filter(key => this.classMap[key] === binaryResult[0])[0],
                    classMap: this.classMap,
                    memory: tf.memory().numTensors
                });
                
                // await this.model.predict(xs).argMax(1).arraySync();

                tensor.dispose();
                tensors.forEach(tensor => tensor.dispose());
                // tensorsWithThreeChannels.forEach(tensor => tensor.dispose());
                xs.dispose();
                cropTensor.dispose();

                tf.engine().endScope();
                

            } catch (error) {
                console.error('Prediction error:', error);
            } finally {
                setTimeout(() => {
                    if(typeof tensor !== 'undefined') tensor.dispose();
                    tensors.forEach(tensor => tensor.dispose());
                    if(typeof tensorsWithThreeChannels !== 'undefined') tensorsWithThreeChannels.forEach(tensor => tensor.dispose());
                    if(typeof xs !== 'undefined') xs.dispose();
                    if(typeof cropTensor !== 'undefined') cropTensor.dispose();
                    predictModelRecursive();
                }, 10);

                return;
            }
           

        };

        setTimeout(() => {
            predictModelRecursive();
        }, 10);

        /*
        if (!this.model) {
            console.log({ this____: this });
            alert('Please train the model first!');
            return;
        }

        if (this.tensors.length === 0) {    
            alert('Please capture some images first!');
            return;
        }

        console.log({
            tensors: this.tensors,
            labels: this.labels,
            cropBox: this.cropBox,
            cropTensor: this.cropTensor,
            cropTensors: this.cropTensors
        });

        
        this.predictionsStart = true;
        const prediction = await this.model.predict(this.cropTensor);
        const predictedClass = prediction.argMax(-1).dataSync()[0];

        console.log({ prediction: prediction, predictedClass });
        prediction.dispose();
        */

    }
    
    updateCropBox(color='blue') {
        this.contextTrainModel.clearRect(0, 0, this.canvasTrainModel.width, this.canvasTrainModel.height);
        this.contextTrainModel.drawImage(this.optionsVideo.video.element, 0, 0, this.canvasTrainModel.width, this.canvasTrainModel.height);
        // Draw crop box
        this.contextTrainModel.strokeStyle = color;
        this.contextTrainModel.lineWidth = 4;
        this.contextTrainModel.strokeRect(
            this.cropBox.x * this.canvasTrainModel.width,
            this.cropBox.y * this.canvasTrainModel.height,
            this.cropBox.width * this.canvasTrainModel.width,
            this.cropBox.height * this.canvasTrainModel.height
        );

        setTimeout(() => {
            this.updateCropBox(color);
        }, 30);
    }

    async inputClassIdFn() {
        const inputClassId = document.createElement('input');
        inputClassId.type = 'text';
        inputClassId.name = 'class_id';
        inputClassId.placeholder = 'class id';
        inputClassId.value = 'A';

        return inputClassId;
    }

    async canvasTrainModelFn() {
        this.canvasTrainModel = document.createElement('canvas');
     
        this.canvasTrainModel.id = 'canvas-train';
        this.canvasTrainModel.width = this.optionsVideo.video.element.videoWidth;
        this.canvasTrainModel.height = this.optionsVideo.video.element.videoHeight;

        this.contextTrainModel = this.canvasTrainModel.getContext('2d');

        this.canvasTrainModel.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.cropBox.x = e.offsetX / this.canvasTrainModel.width;
            this.cropBox.y = e.offsetY / this.canvasTrainModel.height;
        });
    
        this.canvasTrainModel.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.cropBox.width = (e.offsetX / this.canvasTrainModel.width) - this.cropBox.x;
                this.cropBox.height = (e.offsetY / this.canvasTrainModel.height) - this.cropBox.y;
               
                this.updateCropBox();
            }
        });
    
        this.canvasTrainModel.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    async captureFrameToPredict() {

        console.log('%c[Oculus][captureFrameToPredict]', 'background: #2196f3; color: #fff', { captureFrameToPredict: 'aqui' });
    
        if (!this.model) return;
        
        console.log('aqui 0');
        const tensor = await tf.browser.fromPixels(this.optionsVideo.video.element, 1);
        console.log('aqui 1');
        const box = [this.cropBox.y, this.cropBox.x, this.cropBox.y + this.cropBox.height, this.cropBox.x + this.cropBox.width];
        const cropTensor = await tf.image.cropAndResize(tensor.expandDims(0), [box], [0], [224, 224]).toFloat().div(tf.scalar(255.0));
        console.log('aqui 2');

        const xs = tf.image.grayscaleToRGB(cropTensor.div(tf.scalar(255.0))).reshape([1, 224, 224, 3]).toFloat();

        

        this.cropTensor = xs;


        if(this.predictionsStart){
            await this.predictModel();
            tensor.dispose();
            cropTensor.dispose();
        }

    }

    async getCropBoxToData({classid}) {

        this.performance.start['getCropBoxToData'] = performance.now();
        console.groupCollapsed('%c[Oculus][getCropBoxToData]', 'background: #8bc34a; color: #fff');
        console.log('%c[memory][getCropBoxToData]', 'background: yellow; color: #bada55', {memory: tf.memory()});
      
        const box = [this.cropBox.y, this.cropBox.x, this.cropBox.y + this.cropBox.height, this.cropBox.x + this.cropBox.width];

        // const tensor = await tf.browser.fromPixels(this.optionsVideo.video.element, 1);
        const imageTensor = await tf.browser.fromPixels(this.optionsVideo.video.element);
        const tensorGrayscale = tf.tidy(() => {
            const [red, green, blue] = tf.split(imageTensor, 3, 2);
            // A média ponderada dos canais de cor para obter escala de cinza
            return red.mul(0.2989).add(green.mul(0.5870)).add(blue.mul(0.1140)).mean(2).expandDims(2);
        });
        const cropTensorGrayscale = tf.image.cropAndResize(tensorGrayscale.expandDims(0), [box], [0], [224, 224]).toFloat()//.div(tf.scalar(255.0))
        const cropTensor = tf.image.cropAndResize(imageTensor.expandDims(0), [box], [0], [224, 224]).toFloat()//.div(tf.scalar(255.0))

        // this.tensors.push(cropTensor.div(tf.scalar(255.0)));
        this.tensors.push(this.preprocessTensorImage(cropTensor));
        
        this.labels.push(this.classMap[classid]);
        this.cropTensors.push(cropTensorGrayscale);
        this.nameModules.save['lastTensor'] = tensorGrayscale;
        this.nameModules.save['lastCropTensor'] = cropTensorGrayscale;

        try {
            this.inforBuffer[classid] = {
                crop:{id: this.classMap[classid], boxCrop: box,shape: cropTensorGrayscale.shape, squeeze: cropTensorGrayscale.squeeze().shape},
                tensorImage: {shape: imageTensor.shape, squeeze: imageTensor.squeeze().shape},
                tensorGrayscale: {shape: tensorGrayscale.shape, squeeze: tensorGrayscale.squeeze().shape},
                tensorCropGrayscale: {shape: cropTensorGrayscale.shape, squeeze: cropTensorGrayscale.squeeze().shape,  rgb:  tf.image.grayscaleToRGB(cropTensorGrayscale).shape},
                tensorCrop: {shape: cropTensor.shape, squeeze: cropTensor.squeeze().shape},
                tensors: {shape: this.tensors[0].shape, squeeze: this.tensors[0].squeeze().shape },
            };
        } catch (error) {
            console.warn('error', error);
        }

        this.previewModel({tensor:cropTensor.squeeze()});

        console.log('%c[Oculus][getCropBoxToData]', 'background: blue; color: #fff', { nameModules: this.nameModules });
        console.log('%c[memory][getCropBoxToData]', 'background: yellow; color: #bada55', {memory: tf.memory()});
        this.performance.end['getCropBoxToData'] = performance.now(); // Fim da medição
        console.log(`Execution time: ${this.performance.end['getCropBoxToData'] - this.performance.start['getCropBoxToData']} milliseconds`);
        console.groupEnd();
    }

    async uploadImages(){
        console.log('%c[Oculus][uploadImages]', 'background: #8bc34a; color: #fff', { nameModules: this.nameModules });
        console.log('%c[memory][uploadImages]', 'background: yellow; color: #bada55', {memory: tf.memory()});

        const imagesUpload = document.querySelector('.images-upload');
        imagesUpload.click();
    }

    // Função para converter arquivo em tensor
    async fileToTensor(file, cropBox) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    let ImageTensor = tf.browser.fromPixels(img);
                
                    // Check if the tensor is already in RGB format
                    if (ImageTensor.shape[2] === 3) {
                        // Convert to grayscale first
                        // tensor = tf.image.rgbToGrayscale(tensor);
                    }
                    
                    console.log({ImageTensor});
                    let cropBoxImageTensor = tf.image.cropAndResize(ImageTensor.expandDims(0), [cropBox], [0], [224, 224]).toFloat()
                    // Resize the image tensor to the desired dimensions
                    // tensor = tf.image.resizeBilinear(tensor, [224, 224]);
                    // tensor = tensor.reshape([1, 224, 224, 1]);

                    // Normalize the tensor values to be between 0 and 1
                    // tensor = tensor.div(tf.scalar(255.0));

                    // tensor.div(tf.scalar(255.0))
                    // tensor.squeeze();
                    console.log('%c[Oculus][fileToTensor]', 'background: red; color: #bada55', {cropBoxImageTensor});
                  
                    resolve(cropBoxImageTensor);
                };
                img.onerror = (err) => {
                    console.warn(err, e.target.result);
                    reject(err)
                };
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    setVariablesToModel(obj) {
        this.labels = obj.labels;
        this.classMap = obj.classMap;
        document.querySelector('[name="name_model"]').value = obj.model;
        this.nameModules.save['classMap'] = obj.classMap;
        this.nameModules.save['name'] = obj.model;

        this.inforBuffer['uploadImages'] = {
            config: obj
        };
    }

    async loadModel(url) {

        console.log('%c[Oculus][loadModel][start]', 'background: #8bc34a; color: #fff', { memory: tf.memory() });
        try {
          this.model = await tf.loadLayersModel(url);
          this.classMap = JSON.parse(localStorage.getItem(`${url.replace('indexeddb://', '')}_classMap`));
          this.nameModules.save['classMap'] = this.classMap;
          console.log('%c[Oculus][loadModel]', 'background: green; color: #fff', this.model, this.classMap, url);

          console.log('%c[Oculus][loadModel][end]', 'background: #8bc34a; color: #fff', { memory: tf.memory() });
          // Você pode agora usar o modelo para inferência ou treinamento
          return this.model;
        } catch (error) {
          console.error('Erro ao carregar o modelo:', error);
        }
    }

    async buildMenu() {

        this.performance.start['buildMenu'] = performance.now();
        this.debug && console.groupCollapsed('%c[Oculus][buildMenu]', 'background: brown; color: #000');
        this.debug && console.log('%c[memory][buildMenu]', 'background: yellow; color: #bada55', {memory: tf.memory()});
        console.log('%c[Oculus][buildMenu]', 'background: blue; color: #fff');

        if(document.querySelector('#canvas-train')){
            console.log('canvas-train exists');
            this.contextTrainModel.drawImage(this.optionsVideo.video.element, 0, 0, this.optionsVideo.video.element.videoWidth, this.optionsVideo.video.element.videoHeight); 
            this.captureFrameToPredict(); 
            this.updateCropBox();
        };
        
        return new Promise( async (resolve) => {
            if (document.querySelector('#start_capture_tensor') || this.endProcess_buildMenu) {
                resolve();
                return;
            };

            this.endProcess_buildMenu = true;

            console.log('add button', document.querySelector('#start_capture_tensor'));
            // Add event listeners to handle cropping and resizing on the canvas
            this.isDragging = false;
            this.cropBox = { x: 0.005, y: 0.005, width: 0.99, height: 0.99 }; // Initial crop box parameters
        
            const inputNameModel = document.createElement('input');
            inputNameModel.type = 'text';
            inputNameModel.name = 'name_model';
            inputNameModel.placeholder = 'name model';
            inputNameModel.value = 'teste';
            
            const inputClassId = await this.inputClassIdFn();
     
            const div = document.createElement('div');
            div.classList.add('menubar');
            div.classList.add('draggable');
            div.id = 'start_capture_tensor';
    
            this.canvasTrainModelFn();
            this.updateCropBox();
    
            div.appendChild(this.canvasTrainModel);
    
            const buttonTrain = document.createElement('button');
            buttonTrain.classList.add('center-itens');
            buttonTrain.textContent = 'train';
            buttonTrain.onclick = async() => {
                console.log('tensors', this.tensors, { labels: this.labels, classMap: this.classMap, memory: tf.memory() });
                await this.createModuleCustom();
            };
    
            const buttonPredict = document.createElement('button');
            buttonPredict.classList.add('center-itens');
            buttonPredict.textContent = 'predict';
            buttonPredict.onclick = () => {
                this.stopPredicting = false;
                console.log({ labels: this.labels, classMap: this.classMap, tensors:this.tensors, cropTensors: this.cropTensors, memory: tf.memory() });
                this.predictModel();
            };

            
            const buttonStopPredict = document.createElement('button');
            buttonStopPredict.classList.add('center-itens');
            buttonStopPredict.textContent = 'Stop predict';
            buttonStopPredict.onclick = () => {
                this.stopPredicting = true;
                console.log({ labels: this.labels, classMap: this.classMap, tensors:this.tensors, cropTensors: this.cropTensors, memory: tf.memory() });
                this.inforBuffer['memory'] = tf.memory();
                console.log('%c[Oculus][buttonStopPredict]', 'background: #8bc34a; color: #fff', {inforBuffer: this.inforBuffer});
            };


            const inputQtImages = document.createElement('input');
            inputQtImages.type = 'number';
            inputQtImages.name = 'qt_images';
            inputQtImages.placeholder = 'qt images';
            inputQtImages.value = 10;

            const inputQtEpochs = document.createElement('input');
            inputQtEpochs.type = 'number';
            inputQtEpochs.name = 'qt_epochs';
            inputQtEpochs.placeholder = 'qt epochs';
            inputQtEpochs.value = 100;

            const button = document.createElement('button');
            button.classList.add('center-itens');
            button.textContent = '▶ capture';
            button.onclick = () => {
                if (document.querySelector('.display-info')) return;
    
                if (inputClassId.value == '') {
                    alert('Please enter a class id');
                    return;
                }
        
                // class id
                const classid = inputClassId.value;
                if (!classid) {
                    alert('Please enter a class ID.');
                    return;
                }
                if (!(classid in this.classMap)) {
                    this.classMap[classid] = this.classIndex++;
                }

                this.nameModules.save['name'] = inputNameModel.value;
                this.nameModules.save['classMap'] = this.classMap;
              

                let div = document.createElement('div');
                let timeout = 3;
                
                div.classList.add('display-info');
                div.innerHTML = `
                    <div class="info">
                        <div class="container"> 
                            <h1>TensorFlow.js</h1>
                            <p>Real-time object detection using your webcam.</p>
        
                            <div style="display: flex;justify-content: center;position: absolute;left: 0;right: 0;top: 9%;margin: auto;align-items: center;">
                                <h1 id='_' style="font-size: 13vw;color: #fff">${timeout}</h1>
                            </div>
        
                        </div>
                    </div>
                `;

                document.body.appendChild(div);

                const countdownInterval = setInterval(() => {
                    timeout--;
                    div.querySelector('#_').textContent = timeout;

                    if (timeout === 0) {
                        clearInterval(countdownInterval);
                        document.body.removeChild(div);
                        let captureTimeout = 0;
                        const captureInterval = setInterval( async () => {
                            await this.getCropBoxToData({classid});
                            console.log('captureTimeout', captureTimeout, inputQtImages.value);
                            captureTimeout++;
                            if (captureTimeout === parseInt(inputQtImages.value)) {
                                clearInterval(captureInterval);
                                inputClassId.value = '';
                            }
                        }, 1000);
                    }
                }, 1000);

            };

            const buttonSaveImages = document.createElement('button');
            buttonSaveImages.classList.add('center-itens');
            buttonSaveImages.textContent = 'save images';
            buttonSaveImages.onclick = () => {
                this.saveTensorsAsImages();
            };

            const butttonUpload = document.createElement('button');
            butttonUpload.classList.add('center-itens');
            butttonUpload.textContent = 'upload';
            butttonUpload.onclick = () => {
                this.uploadImages();
            };

            // Cria o input de arquivo oculto
            const imageUpload = document.createElement('input');
            imageUpload.classList.add('images-upload');
            imageUpload.name = 'imageUpload';
            imageUpload.accept = 'image/*,.json';
            imageUpload.multiple = true;
            imageUpload.type = 'file';
            imageUpload.id = 'imageUpload';
            imageUpload.multiple = true;
            imageUpload.style.display = 'none';
            // Adiciona evento de mudança ao input de arquivo para processar as imagens
            imageUpload.addEventListener('change', async (event) => {
                const files = Array.from(event.target.files);
                const tensors = [];
                const config = {};
            
                const configPromiss = new Promise((resolve, reject) => {
                    for (let i = files.length - 1; i >= 0; i--) {
                        const file = files[i];
                        if(file.type == 'application/json'){
                            const reader = new FileReader();
                            files.splice(i, 1);
                            reader.onload = e => {
                                this.setVariablesToModel(JSON.parse(e.target.result));     
                                resolve({config: JSON.parse(e.target.result), files: files});
                            };
                            reader.readAsText(file);
                        }
                
                    }
                })

                configPromiss.then(({config, files}) => {
                    files.reverse();
                    files.forEach(file => {
                        console.log('File:', file, config);
                        const reader = new FileReader();
                        reader.onerror = e => console.warn(e);
                        reader.onload = async e => {
                            let box = config.images[0].box;
                            this.cropBox = config.images[0].cropBox;
                            const imageTensor = await this.fileToTensor(file, box);
                            this.tensors.push(this.preprocessTensorImage(imageTensor));
                            this.previewModel({tensor:imageTensor.squeeze()});
                        }
                        reader.readAsDataURL(file);
                    })
                    console.log('Config:', config, files);
                });
                this.updateCropBox('red');
                console.log('Tensors:', this.tensors);
            });


            const inputListModel = document.createElement('select');
            inputListModel.classList.add('center-itens');
            inputListModel.textContent = 'load model';
            inputListModel.name = 'inputListModel';
            inputListModel.id = 'inputListModel';
            inputListModel.innerHTML += `<option value="">SELECIONE UM MODELO</option>`;
            this.listModels(inputListModel);
            inputListModel.onchange = () => {
                this.loadModel(inputListModel.value);
            }
            
            div.appendChild(Object.assign(document.createElement('label'), { innerHTML: 'load model' }));
            div.appendChild(inputListModel);
            div.appendChild(imageUpload);
            div.appendChild(inputNameModel);
            div.appendChild(inputClassId);
            div.appendChild(Object.assign(document.createElement('label'), { innerHTML: 'qt images' }));
            div.appendChild(inputQtImages);
            div.appendChild(button);
            div.appendChild(Object.assign(document.createElement('label'), { innerHTML: 'qt epochs' }));
            div.appendChild(inputQtEpochs);
            div.appendChild(buttonTrain);
            div.appendChild(buttonSaveImages);
            div.appendChild(butttonUpload);
            div.appendChild(buttonPredict);
            div.appendChild(buttonStopPredict);
            document.body.appendChild(div);
    
            div.addEventListener('mousedown', (e) => {
                if(e.target.id == 'canvas-train') return;

                let offsetX = e.clientX - div.getBoundingClientRect().left;
                let offsetY = e.clientY - div.getBoundingClientRect().top;

                const mouseMoveHandler = (e) => {
                    div.style.left = `${e.clientX - offsetX}px`;
                    div.style.top = `${e.clientY - offsetY}px`;
                }
        
                const mouseUpHandler = () => {
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    document.removeEventListener('mouseup', mouseUpHandler);
                }
        
                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            });
            
            this.debug && console.log('%c[memory][buildMenu]', 'background: yellow; color: #bada55', {memory: tf.memory()});
            this.performance.end['buildMenu'] = performance.now(); // Fim da medição
            this.debug && console.log(`Execution time: ${this.performance.end['buildMenu'] - this.performance.start['buildMenu']} milliseconds`);
            console.groupEnd();

            resolve();
        });
    }
}

export { Oculus };
