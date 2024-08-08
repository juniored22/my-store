"use strict";

if (!navigator.gpu) {
    console.error('WebGPU not supported on this browser.');
}

const api = {
    flippedWebCam: false,
    showFPS: true,
    desableWarn: true,
    detector: {
        faceSegmentation : null, // faceMesh or faceLandmarksDetection
        faceSegmentationSupportedModels: 'MediaPipeFaceMesh', // MediaPipeFaceMesh or  BlazeFace
        segmentationFaceDetection: true,
        boxFaceDetection: true,
        detectorObject: null, // coco-ssh or null
    },
    classify:{
        classifierModel: null, 
    },
    loadinglibrarys: {},
    training: 'ml5.featureExtractor', // ml5.neuralNetwork or ml5.featureExtractor
    detectoaudio: {
        audioModel: 'speechCommands'
    }
}

function desableWarn() {
       // Sobrescreva a função de logging de warnings
   const originalWarn = console.warn;
   console.warn = function(message, ...optionalParams) {
     // Ignore warnings específicos sobre kernels já registrados
     if (typeof message === 'string' && message.includes('The kernel')) {
       return;
     }
     originalWarn.apply(console, [message, ...optionalParams]);
   };
}

async function loadScript(url, callback) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve(url);
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);

        if (typeof callback === 'function') callback();
    });
}


(async function includeScript() {

    if(api && api.desableWarn) desableWarn();
    if (api && api.detector.faceSegmentation === 'faceLandmarksDetection') {
            await loadScript('https://cdn.jsdelivr.net/npm/p5@1.9.3/lib/p5.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.19.0/dist/tf.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection@latest');
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface');
            await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh')
            .then(() => {
                api.loadinglibrarys = {p5, blazeface, tf, faceLandmarksDetection, ...api.loadinglibrarys};
                window.scriptsLoaded = true;
                console.log('loadScript FaceLandmarksDetection loaded');
            })
            .catch(err => console.error(err));
    }
    
    if (api && api.detector.faceSegmentation === 'faceMesh') {
            await loadScript('https://cdn.jsdelivr.net/npm/p5@1.9.3/lib/p5.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.19.0/dist/tf.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/ml5@1.0.1/dist/ml5.min.js')
            .then(() => {
                api.loadinglibrarys = {p5, ml5, tf, ...api.loadinglibrarys};
                window.scriptsLoaded = true;
                console.log('loadScript FaceMesh loaded');
            })
            .catch(err => console.error(err));
    }else if (api && api.detectoaudio.audioModel === 'speechCommands') {
        await loadScript('https://cdn.jsdelivr.net/npm/p5@1.9.3/lib/p5.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.19.0/dist/tf.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/speech-commands@latest')
        api.loadinglibrarys = {p5, tf, speechCommands, ...api.loadinglibrarys};
    }else{
        await loadScript('https://cdn.jsdelivr.net/npm/p5@1.9.3/lib/p5.min.js');
        // await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.19.0/dist/tf.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/ml5@0.12.2/dist/ml5.min.js');
        api.loadinglibrarys = {p5, ml5, ...api.loadinglibrarys};
    }

    
    
    if(api && api.detector.detectorObject === 'coco-ssh' && !api.detectoaudio.audioModel ) {

        api.loadinglibrarys = { cocoSsh, ...api.loadinglibrarys};
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd')
        .then(() => {
            window.scriptsLoaded = true;
            console.log('loadScript coco-ssh loaded');
        })
        .catch(err => console.error(err));
    }
})()


let consoleColors =  (bg, text)=> {
    let colorCode =  {
        bg: {
            blue : 'background: rgba(0, 0, 255, 1);',
            green : 'background: rgba(0, 255, 0, 1);',
            yellow : 'background: rgba(255, 255, 0, 1);',
            red : 'background: rgba(255, 0, 0, 1); ',
            gray : 'background: rgba(128, 128, 128, 1); ',
            black : 'background: rgba(0, 0, 0, 1); ',
            white : 'background: rgba(255, 255, 255, 1); '
        },
        text:{
            blue : 'color: rgba(0, 0, 255, 1);',
            green : 'color: rgba(0, 255, 0, 1);',
            yellow : 'color: rgba(255, 255, 0, 1);',
            red : 'color: rgba(255, 0, 0, 1);',
            gray : 'color: rgba(128, 128, 128, 1);',
            black : 'color: rgba(0, 0, 0, 1);',
            white : 'color: rgba(255, 255, 255, 1);'
        }
    }

    return `${colorCode.bg[bg]} ${colorCode.text[text]}`
}


let minFps = Infinity;
let maxFps = -Infinity;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/0J7PGN-Zs/'; //'https://teachablemachine.withgoogle.com/models/lqn_AfuBW/' //'http://localhost:3000/tm-my-image-model/model.json';
let faceMesh;
let faceLandmarksDetectionDetector;
let capture;
let regressor;
let neuralNetwork;
let bodySegmentation;
let video;
let segmentation;
let soundClassifier;
let bodyPose;
let handPose;
let classifierFeature;
let classifierCustom;
let connections;
let objeDetector;
let flippedVideo;
let classifier;
let cocoSsdModel;
let deeplabModel;
let segmentationDeeplab;
let rSlider, gSlider, bSlider;
let recognizer;
let transferRecognizer;
let labelTraining = "training";
let captureSize = 10;
let r = 0;
let g = 0;
let b = 255;
let fpsHistory = [];
let faces = [];
let classifications = [];
let poses = [];
let classificationsCustom = [];
let classifierFeatureClassfications = [];
let detectbBodyPose = [];
let handPoseDetection = [];
let predictedWord = [];
let predictionsCocoSsd = [];
let deeplabModelSegmentationMap = [];

const classColors = {
    background: [0, 0, 255, 0],
    person: [192, 128, 128, 127],
    bottle: [128, 0, 128, 127],
    chair: [192, 0, 0, 127]
};

let dataSetColor = [
    { r: 255, g: 0, b: 0, color: "red-ish" },
    { r: 254, g: 0, b: 0, color: "red-ish" },
    { r: 253, g: 0, b: 0, color: "red-ish" },
    { r: 0, g: 255, b: 0, color: "green-ish" },
    { r: 0, g: 254, b: 0, color: "green-ish" },
    { r: 0, g: 253, b: 0, color: "green-ish" },
    { r: 0, g: 0, b: 255, color: "blue-ish" },
    { r: 0, g: 0, b: 254, color: "blue-ish" },
    { r: 0, g: 0, b: 253, color: "blue-ish" },
];

async function loadFaceMesh() {
    
    // Load the faceMesh model
    let optionsFaceMesh = { 
        maxFaces: 1, 
        refineLandmarks: true, 
        flipHorizontal: false 
    };
    faceMesh =  ml5.faceMesh ? await ml5.faceMesh(optionsFaceMesh, (e) => console.log(" 👦 model faceMesh loaded", e)) : null;
    
}

async function loadFaceLandmarksDetection(video, callback) {
    if(api && api.detector.faceSegmentationSupportedModels == 'BlazeFace'){
        const detectorConfigBlazeface = {
        maxFaces: 1, // Detectar até 10 rostos
        inputWidth: 128, // Largura de entrada
        inputHeight: 128, // Altura de entrada
        iouThreshold: 0.3, // Limiar de IoU
        scoreThreshold: 0.75 // Limiar de pontuação de confiança
        };

        // Carregar o modelo BlazeFace com configurações personalizadas
        const faceLandmarksDetectionDetector = await blazeface.load(detectorConfigBlazeface);

        console.log({ faceLandmarksDetectionDetector });
        if(typeof callback === 'function') callback({video,  faceLandmarksDetection: faceLandmarksDetection.SupportedModels.BlazeFace , faceLandmarksDetectionDetector, model: blazeface, detectorConfig: detectorConfigBlazeface});

    }else{
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh; 
        const detectorConfig = {
            runtime: 'tfjs', //'mediapipe', // or 'tfjs'
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
            maxFaces: 10, // Número máximo de rostos a serem detectados
            refineLandmarks: true, // Se true, melhora a precisão de alguns pontos-chave específicos (por exemplo, olhos)
            modelType: 'full', // 'lite' ou 'full', onde 'lite' é mais rápido e 'full' é mais preciso
        }
        faceLandmarksDetectionDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        console.log({ faceLandmarksDetection , faceLandmarksDetectionDetector});

        if(typeof callback === 'function') callback({video,  faceLandmarksDetection , faceLandmarksDetectionDetector, model, detectorConfig});
    } 
}

async function loadHandPose() {

    let optionsHands = {
        maxHands: 2,
        flipHorizontal: false,
        runtime: "tfjs",
        modelType: "full",
        detectorModelUrl: undefined, //default to use the tf.hub model
        landmarkModelUrl: undefined, //default to use the tf.hub model
    }
    handPose = await ml5.handPose(optionsHands, (e) => console.log("model handPose loaded", e));
}

async function loadBodyPose() {
    let optionsBodyPose = {
        modelType: "MULTIPOSE_LIGHTNING", // "MULTIPOSE_LIGHTNING", "SINGLEPOSE_LIGHTNING", or "SINGLEPOSE_THUNDE"
        enableSmoothing: true,
        minPoseScore: 0.25,
        multiPoseMaxDimension: 256,
        enableTracking: true,
        trackerType: "boundingBox", // "keypoint" or "boundingBox"
        trackerConfig: {},
        modelUrl: undefined,
    }
    bodyPose = await ml5.bodyPose('MoveNet',optionsBodyPose, (e,r)=> console.log("model bodyPose loaded", e, r));
}

async function loadBodySegmentation() {
    
    let modelSelected =  'BodyPix' //'SelfieSegmentation' //'BodyPix'
    let optionsBodySegmentation = {
        maskType: "parts", // "background", "body", or "parts" (used to change the type of segmentation mask output)
        runtime: "tfjs", // "tfjs" or "mediapipe"
        modelType: "general", // "general" or "landscape"
    };
    bodySegmentation = await ml5.bodySegmentation(modelSelected, optionsBodySegmentation, (e) => console.log("model bodySegmentation loaded", e));
}

async function loadSoundClassifier() {
    
    let optionsSoundClassifier = {
        overlapFactor: 0.5,
        includeSpectrogram: false,
        probabilityThreshold: 0,
        invokeCallbackOnNoiseAndUnknown: false,
        includeEmbedding: false
    };
    soundClassifier = ml5.soundClassifier("SpeechCommands18w", optionsSoundClassifier , (e) => console.log("model soundClassifier loaded", e));
}

async function loadNeuralNetwork() {
    
    let optionsNeuralNetwork = {
        inputs: [], // can also be a number
        outputs: [], // can also be a number
        dataUrl: null,
        modelUrl: null,
        layers: [], // custom layers
        task: 'classification', // 'classification', 'regression', 'imageClassification'
        debug: false, // determines whether or not to show the training visualization
        learningRate: 0.2,
        hiddenUnits: 16,
    };
    neuralNetwork = await ml5.neuralNetwork(optionsNeuralNetwork, (e) => console.log("model neuralNetwork loaded", e));
}

async function loadObjectDetectorCoco(video, callback) {

    const optionsObjectDetectorCoco = {
        base: 'mobilenet_v2', // lite_mobilenet_v2  or mobilenet_v1 or mobilenet_v2 default
        version: 1
    }
    cocoSsd.load().then(model => {
        console.log("🎥 model cocoSsd loaded",{cocoSsd, model});
        cocoSsdModel = model;

        if(typeof callback === 'function') callback({video,  cocoSsd, cocoSsdModel, model});
    });
}

async function loadClassifier() {
        
    
    /** 
    "MobileNet": Modelo leve para classificação de imagens.
    "Darknet": Utiliza a arquitetura Darknet.
    "Darknet-tiny": Versão menor e mais leve do Darknet.
    "DoodleNet": Modelo treinado para reconhecer desenhos do Quick, Draw!.
    "SketchRNN": Gerador de desenhos esboçados.
    "YOLO": YOLO (You Only Look Once) para detecção de objetos.
    "YOLO-tiny": Versão menor e mais leve do YOLO.
    "PoseNet": Modelo para detecção de poses humanas.
    "UNET": Modelo para segmentação de imagens.
    "StyleTransfer": Transferência de estilo para imagens.
    "KNNClassifier": Classificador K-Nearest Neighbors.
    */
    const modelName = "MobileNet"; 
    classifier = await ml5.imageClassifier(modelName, (e) => console.log(" 👀 model MobileNet loaded", e));

    // objeDetector = ml5.objectDetector && await ml5.objectDetector("cocossd", () => console.log("model cocossd loaded"));
}

async function loadClassifierCustom(){
    classifierCustom = await ml5.imageClassifier(imageModelURL, (e) => console.log(" 👀 model Classifier custom loaded", e));
}

async function loadModelDeeplab() {
    const modelName = 'pascal';   // set to your preferred model, either `pascal`, `cityscapes` or `ade20k`
    const quantizationBytes = 2;  // either 1, 2 or 4
    await deeplab.load({base: modelName, quantizationBytes})
    // await deeplab.load()
    .then(model => {
        console.log("model deeplab loaded", model)
        deeplabModel = model;
    });
    
};

async function loadFeatureExtractor(video, callback) {

    const optionsFeatureExtractor = {
        version: 1,
        alpha: 1.0,
        topk: 3,
        learningRate: 0.0001,
        hiddenUnits: 100,
        epochs: 20,
        numLabels: 2,
        batchSize: 0.4,
    };
    classifierFeature = await ml5.featureExtractor('MobileNet', (e) => {
        console.log(" 👀 model FeatureExtractor custom loaded", e);
        if(typeof callback === 'function') callback({video,  classifierFeature});
    });
}

// Função para carregar o modelo pré-treinado e os dados
async function loadModelSpeechCommands() {
    const recognizer = speechCommands.create(
        'BROWSER_FFT', // use 'BROWSER_FFT' para dados de áudio FFT processados no navegador
        '18w'
    );
    await recognizer.ensureModelLoaded();
    transferRecognizer = await recognizer.createTransfer('customCommands');
    console.log({transferRecognizer});


    ['up', 'down', 'left', 'right'].forEach(word => {
        // transferRecognizer.collectExample(word);
    });

    return recognizer;
}

async function loadAudioData(fileUrl) {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Processamento do áudio para extrair características (ex: MFCC)
    const audioTensor = tf.tensor(audioBuffer.getChannelData(0));
    return audioTensor;
  }

async function  preload() {
    console.log('%cPreload', consoleColors('yellow','black'), api.loadinglibrarys);
    if(typeof tf === 'undefined')  tf = ml5.tf;

    console.log(tf.engine().registryFactory, {api});
    tf.setBackend("webgl"); //for classifierCustom 
    console.log({ getBackend:  tf.getBackend() });

    if(api && api.detector.faceSegmentation == 'faceMesh') await loadFaceMesh();
    if(api && api.classify.classifierModel) await loadClassifier();
    if(api && api.classify.classifierModel) await loadClassifierCustom();
    if(api && api.training == 'ml5.neuralNetwork') await loadNeuralNetwork();

    loadModelSpeechCommands();
  


    // load the shader
   theShader = loadShader('shaders/webcam.vert', 'shaders/webcam.frag');
   
   
}

async function startFaceLandmarksDetection(video) {
    await loadFaceLandmarksDetection(video, async ({ video, faceLandmarksDetectionDetector, faceLandmarksDetection, timeout = 100})=>{
        console.log(' 👦 ⟳ model FaceLandmarksDetection loaded', {timeout, moddel: faceLandmarksDetection, detect: faceLandmarksDetectionDetector});
        setTimeout( async () => await detectFaceLandmarksDetection({video, detector: faceLandmarksDetectionDetector}) , timeout);
    });
}

async function startObjectDetectorCocoSsd(video) {
    await loadObjectDetectorCoco(video, async ({ video, cocoSsd, model, timeout = 100})=>{
        console.log(' 👦 ⟳ model CocoSSD loaded', {timeout, cocoSsd, model});
        setTimeout( async () => await ObjectDetectorCoco({video}) , timeout);
    });
}

async function startClassifier(capture, classifier) {
    classifier && classifier.classifyStart ? 
    classifier.classifyStart(capture, (r) => gotResult(r, 'classifier')) : 
    classifier && classifier.classify(capture, (r) => gotResult(r, 'classifier')) ;
}

async function startClassifierCustom(capture){
    classifierCustom && classifierCustom.classifyStart(capture, (r) => gotResult(r, 'classifierCustom'));
}

async function startFeatureExtractor(capture) {
    loadFeatureExtractor(capture, ({video, classifierFeature}) => {

        console.log({classifierFeature});
        setTimeout( async () => {
            let intervalId;
            const featureExtractor = classifierFeature && classifierFeature.classification(video);
            // regressor = classifierFeature.regression(video, () => console.log('regressor'));
            classAButton = createButton('Class A');
            classAButton.mousePressed(() => {
                console.log({featureExtractor});
                intervalId = setInterval(() => {
                    featureExtractor.addImage('Class A', ()=> console.log('addImage Class A'));
                    console.log('mousePressed Extractor A ');
                }, 1000);
            })
            .mouseReleased(() => {
                console.log('mouseReleased Extractor A END');
                clearInterval(intervalId);
            })

            classBButton = createButton('Class B');
            classBButton.mousePressed(() => {
                console.log({mouseIsPressed});
                intervalId = setInterval(() => {
                    featureExtractor.addImage('Class B', ()=> console.log('addImage Class B'));
                    console.log('mousePressed Extractor B');
                }, 1000);
            })
            .mouseReleased(() => {
                console.log('mouseReleased Extractor B END');
                clearInterval(intervalId);
            })

            trainClassButton = createButton('Train');
            trainClassButton.mousePressed(() => {
                console.log({featureExtractor});
                featureExtractorTraining(featureExtractor, classifierFeatureExtractor);
            })
            .mouseReleased(() => {
                console.log('mouseReleased Extractor B END'); 
            });


        } , 100);
    })
}

async function startSpeechCommandsListen() {
    // When calling `create()`, you must provide the type of the audio input.
    // The two available options are `BROWSER_FFT` and `SOFT_FFT`.
    // - BROWSER_FFT uses the browser's native Fourier transform.
    // - SOFT_FFT uses JavaScript implementations of Fourier transform
    //   (not implemented yet).
    //  '18w' (default): The 20 item vocaulbary, consisting of: 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'up', 'down', 'left', 'right', 'go', 'stop', 'yes', and 'no', in addition to 'background_noise' and 'unknown'.
    // 'directional4w': The four directional words: 'up', 'down', 'left', and 'right', in addition to 'background_noise' and 'unknown'.
    recognizer = speechCommands.create('BROWSER_FFT', '18w'); 
    

    // Make sure that the underlying model and metadata are loaded via HTTPS
    // requests.
    await recognizer.ensureModelLoaded();

    console.log({recognizer});
    // See the array of words that the recognizer is trained to recognize.
    console.log(recognizer.wordLabels());


    // `listen()` takes two arguments:
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields such a
    //    - includeSpectrogram
    //    - probabilityThreshold
    //    - includeEmbedding
    recognizer.listen(result => {
        console.log({result});

        // Get the index of the word with the highest probability score
        const scores = result.scores;
        const maxScoreIndex = scores.indexOf(Math.max(...scores));
        
        // Get the word corresponding to the highest probability score
        const detectedWord = recognizer.wordLabels()[maxScoreIndex];

        // Log the detected word
        console.log(`Palavra detectada: ${detectedWord}`);
        // - result.scores contains the probability scores that correspond to
        //   recognizer.wordLabels().
        // - result.spectrogram contains the spectrogram of the recognized word.
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75
    });

    // Stop the recognition in 10 seconds.
    setTimeout(() => recognizer.stopListening(), 10e3);
}

async function offlineRecognition() {

    // Helper function to load an audio file and decode it to a waveform
    const loadAudioData = async (url) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer.getChannelData(0); // Use the first channel
    }

    const createSpectrogram = async (waveform, fftSize, hopLength) => {
        const stft = tf.signal.stft(waveform, fftSize, hopLength);
        const magnitudeSpectrogram = tf.abs(stft);
        const logSpectrogram = tf.log(magnitudeSpectrogram.add(tf.scalar(1e-6))); // Adding a small value to avoid log(0)
        return logSpectrogram;
    }

    const adjustSpectrogramDimensions = async (spectrogram, numFrames, numFreqBins) => {
      // Resize the spectrogram to match the expected input dimensions
      const reshapedSpectrogram = spectrogram.expandDims(-1); // Add a channel dimension
      return tf.image.resizeBilinear(reshapedSpectrogram, [numFrames, numFreqBins]);
    }

    

    recognizer = speechCommands.create('BROWSER_FFT', '18w'); 

    // Ensure the model is loaded before proceeding
    await recognizer.ensureModelLoaded();


    const inputShape = recognizer.modelInputShape();

    // Inspect the input shape of the recognizer's underlying tf.Model.
    console.log({inputShape});
    // You will get something like [null, 43, 232, 1].
    // - The first dimension (null) is an undetermined batch dimension.
    // - The second dimension (e.g., 43) is the number of audio frames.
    // - The third dimension (e.g., 232) is the number of frequency data points in
    //   every frame (i.e., column) of the spectrogram
    // - The last dimension (e.g., 1) is fixed at 1. This follows the convention of
    //   convolutional neural networks in TensorFlow.js and Keras.

    // Inspect the sampling frequency and FFT size:
    console.log(recognizer.params().sampleRateHz);
    console.log(recognizer.params().fftSize);
    const sampleRate = recognizer.params().sampleRateHz;
    const fftSize = recognizer.params().fftSize;
    const hopLength = Math.floor(fftSize / 2);

    const audioUrl = 'audios/gettysburg.wav'; // Replace with the path to your audio file
    const waveform = await loadAudioData(audioUrl);

    console.log({waveform});

    // Generate the spectrogram
    const waveformTensor = tf.tensor1d(waveform);
    const spectrogramTensor = await createSpectrogram(waveformTensor, fftSize, hopLength);

    console.log({spectrogramTensor});

    // Adjust the spectrogram dimensions to match the expected input shape
    const [numFrames, numFreqBins] = inputShape.slice(1, 3);


    const adjustedSpectrogram = await adjustSpectrogramDimensions(spectrogramTensor, numFrames, numFreqBins);
   
    console.log({adjustedSpectrogram});

    // // Reshape spectrogram tensor to match the model input shape
    const inputTensor = adjustedSpectrogram.reshape([1, numFrames, numFreqBins, 1]);

    console.log({numFrames, numFreqBins, spectrogramTensor, adjustedSpectrogram, inputTensor});

    // // Recognize the speech from the spectrogram
    const output = await recognizer.recognize(inputTensor);

    console.log({output});
    const scores = output.scores;
    const maxScoreIndex = scores.indexOf(Math.max(...scores));
    
    // Get the word corresponding to the highest probability score
    const detectedWord = recognizer.wordLabels()[maxScoreIndex];

    // Log the detected word
    console.log(`Palavra detectada: ${detectedWord}`);

    tf.dispose([waveformTensor, spectrogramTensor, adjustedSpectrogram, inputTensor, output]);

}

async function setup() {
    console.log('%cSetup', consoleColors('green','black'));

    // createCanvas(710, 400, WEBGL);
    createCanvas(640, 480);
    noStroke();
    fill(0);

    capture = createCapture(VIDEO)
    capture.size(width, height);
    capture.hide();
    frameRate(60); // Opcional, para limitar a taxa de quadros

    console.log({capture, width, height});

    if(api && api.detector.faceSegmentation == 'faceLandmarksDetection')  startFaceLandmarksDetection(capture.elt);
    if(api && api.detector.detectorObject) startObjectDetectorCocoSsd(capture.elt);
    if(api && api.classify.classifierModel) startClassifier(capture, classifier);
    if(api && api.classify.classifierModel) startClassifierCustom(capture);
    if(api && api.training == 'ml5.featureExtractor'    && api.detectoaudio.audioModel == null) startFeatureExtractor(capture);
    if(api && api.training == 'ml5.neuralNetwork'       && api.detectoaudio.audioModel == null) training();

    // startSpeechCommandsListen();
    // offlineRecognition();
   
    faceMesh && faceMesh.detectStart(capture, (r) => gotResult(r, 'faceMesh'));


    // let tensor = ml5.tf.tensor([1, 2, 3, 4]);
    // // const data = tensor.dataSync();
    // const data = await readDataFromGPU(tensor);
   
    return

    ///*
    // if(capture) flippedVideo = flipImage(capture);
    // classifyVideo();  // Start classifying


    classifierCustom && classifierCustom.classifyStart(capture, (r) => gotResult(r, 'classifierCustom'));
  
    classifier && classifier.classifyStart ? 
    classifier.classifyStart(capture, (r) => gotResult(r, 'classifier')) : 
    classifier && classifier.classify(capture, (r) => gotResult(r, 'classifier')) ;

  
    bodyPose    && bodyPose.detectStart(capture, (r) => gotResult(r, 'bodyPose'));
    handPose    && handPose.detectStart(capture, (r) => gotResult(r, 'handPoseDetection') );

    bodySegmentation && bodySegmentation.detectStart(capture, (r) => gotResult(r, 'bodySegmentation') );
    soundClassifier && soundClassifier.classifyStart(capture, (r) => gotResult(r, 'soundClassifier'));
    
    // bodyPose    && bodyPose.detect(capture, (r) => gotResult(r, 'detectbBodyPose') );
    bodyPose ? connections = bodyPose.getSkeleton() : console.log({connections: 'no bodyPose'});


    // await ObjectDetector(capture.canvas);
 
  
    // training()

    segmentObjects();

    console.log({classifier, objeDetector: objeDetector, poses, connections, flippedVideo, soundClassifier});
    // classifier.predict(capture, (err, results) => {
    //     console.log({err, results});
    //     // let resultTxt = results[0].className;
    //     // result.innerText = resultTxt;
    //     // let prob = 100 * results[0].probability;
    //     // probability.innerText = Number.parseFloat(prob).toFixed(2) + '%';
    //   });
}

function draw() {
    console.log('%cDraw', consoleColors('blue','white'));

    background(0, 0, 255);
    image(capture, 0, 0, width, height);
    
    // filter(INVERT);

    if(api && api.flippedWebCam){
        // Inverte a imagem da webcam
        translate(width, 0);
        scale(-1, 1);
    }

    

    
    api.showFPS && showFPS();
    
    // modifyVideoCanvas()
    // addNoiseToPixels();
    drawPointsfaceMesh();
    drawPredictionCocoSsd();
    drawLabelClassifierCustom();
    drawLabelClassifierCustom();
    
   

    return
    loadPixels();


    ///*
    if(bodySegmentation && bodySegmentation.modelName == 'BodyPix' && true ){
        image(capture, 0, 0);
        if (segmentation) {
            image(segmentation.mask, 0, 0, width, height);
        }
    }else if(bodySegmentation && bodySegmentation.modelName == 'SelfieSegmentation' && true ){
         if (segmentation) {
            capture.mask(segmentation.mask);
            image(capture, 0, 0);
        }
    }else if(classifierCustom){
        image(capture, 0, 0,  width, height); //flippedVideo
        // filter(INVERT);
    }else{
        image(capture, 0, 0, width, height);
        // filter(INVERT);
    }


 
    drawPointsBodyPose()
    drawPointsHands()
    drawPredictionCocoSsd() 
    drawSegmentation()



    //*/

    if(predictedWord.length > 0){
        console.log({label: predictedWord[0].label, confidence: predictedWord[0].confidence});
    }

    updatePixels();

}

function showFPS() {
    let fps = frameRate();
    fpsHistory.push(fps);
    if (fps < minFps) minFps = fps;
    if (fps > maxFps)  maxFps = fps;
    fill(255);
    textSize(10);
    text("FPS: " + fps.toFixed(2), 6, 10);
    text("Min FPS: " + minFps.toFixed(2), 6, 20);
    text("Max FPS: " + maxFps.toFixed(2), 6, 30);
}

function drawLabelClassifierCustom() {

    // console.log({classificationsCustom});
    // Draw the label
    let label  = classificationsCustom && classificationsCustom.length > 0 ? `[${classificationsCustom[0].label}] confidence: ${classificationsCustom[0].confidence}` : 'no label';
    fill(255);
    textSize(16);
    textAlign(CENTER);
    text(label, width / 2, height - 4);
}

function drawLabelClassifierCustom() {

    // console.log({classificationsCustom});
    // Draw the label
    let label  = classifierFeatureClassfications && classifierFeatureClassfications.length > 0 ? `[${classifierFeatureClassfications[0].label}] confidence: ${classifierFeatureClassfications[0].confidence}` : 'no label';
    fill(255);
    textSize(16);
    textAlign(CENTER);
    text(label, width / 2, height - 4);
}

function featureExtractorTraining(featureExtractor, classifier) {
    featureExtractor.train((loss) =>{
        if (loss == null) {
            console.log('Finished Training');
            featureExtractor.save(()=> console.log('model saved'), 'featureExtractor_model');
            classifier(featureExtractor);
        } else {
            console.log('loss', loss);
        }
    });
}
function modifyVideoCanvas(){
    background(255);
    capture.loadPixels();
    const stepSize = round(constrain(mouseX / 8, 6, 32));
    for (let y = 0; y < height; y += stepSize) {
      for (let x = 0; x < width; x += stepSize) {
        const i = y * width + x;
        const darkness = (255 - capture.pixels[i * 4]) / 255;
        const radius = stepSize * darkness;
        ellipse(x, y, radius, radius);
      }
    }
}

function addNoiseToPixels() {
    capture.loadPixels();  // Certifique-se de carregar os pixels da imagem capturada
   loadPixels();
   let w = width / captureSize;
   for (let y = 0; y < height; y++) {
       for (let x = 0; x < width; x++) {
           let index = (x + y * width) * 4;
           let r = capture.pixels[index];
           let g = capture.pixels[index + 1] //random(0, capture.pixels[index + 1]);
           let b = capture.pixels[index + 2];
           let a = capture.pixels[index + 3];

           pixels[index]     = r;
           pixels[index + 1] = g;
           pixels[index + 2] = b;
           pixels[index + 3] = a;  // Mantém a opacidade original

           noStroke();
           fill(r, g, b);
           rect(x * w, y * w, w, w);


       }
   }
   updatePixels();


}

async function detectFaceLandmarksDetection({video, detector}){
    try {
        const returnTensors = false;
        const flipHorizontal = false;
        const annotateBoxes = true;
        faces = await detector.estimateFaces(video,   returnTensors,  flipHorizontal, annotateBoxes );

        console.log({faces});
        setTimeout(() => detectFaceLandmarksDetection({video, detector}), 10);
    } catch (error) {
        console.log({error});
    }
}

function Testdraw() {


    // background(250);

    // normalMaterial();
    // push();
    // translate(-240, -100, 0);
    // rotateZ(frameCount * 0.01);
    // rotateX(frameCount * 0.01);
    // rotateY(frameCount * 0.01);
    // plane(70);
    // pop();

    // push();
    // translate(0, -100, 0);
    // rotateZ(frameCount * 0.01);
    // rotateX(frameCount * 0.01);
    // rotateY(frameCount * 0.01);
    // box(70, 70, 70);
    // pop();

}

async function ObjectDetectorCoco({video}) {
    // detect objects in the image.

    if (cocoSsdModel && video ) {
        //   model.dispose();
        await cocoSsdModel.detect(video).then(predictions => {
            predictionsCocoSsd = predictions;
            predictions.forEach(prediction => {
                console.log('Predictions: ', { class: prediction.class, score: prediction.score }, predictions);
        })
            
        });

        // await preprocessedImage.dispose();
    };
    
    setTimeout(() => ObjectDetectorCoco({video}), 22);
}

async function segmentObjects() {
    if(deeplabModel){
  
        segmentationDeeplab = await deeplabModel.segment(capture.elt);
        deeplabModelSegmentationMap = segmentationDeeplab.segmentationMap;
        console.log({legend: segmentationDeeplab.legend, segmentationDeeplab});
        
    }
    setTimeout(segmentObjects, 100);  // Segmentação a cada 100ms
}

async function training() {
    console.log('training');

    // Add dataSetColor to the neural network
    for (let i = 0; i < dataSetColor.length; i++) {
        let item = dataSetColor[i];
        let inputs = [item.r, item.g, item.b];
        let outputs = [item.color];

        await neuralNetwork.addData(inputs, outputs);
    }

    neuralNetwork.normalizeData();
    const trainingOptions = {
        epochs: 32,
        batchSize: 12,
    };

    function whileTraining(epoch, loss) {
        console.log({epoch, loss});
    }

    console.log({trainingOptions, neuralNetwork});
    neuralNetwork.train(trainingOptions, whileTraining,  finishedTraining);
}

// Step 8: make a classification
function classify() {
    const input = [r, g, b];
    neuralNetwork.classify(input, (e,r) => console.log('done neuralNetwork classify', e, r));
}

function finishedTraining() {
    console.log('Finished Training', neuralNetwork.neuralNetworkData.data.raw);
    neuralNetwork.saveData('dataSetColor_', (r) => console.log('saveData dataSetColor', r));
    neuralNetwork.save('dataSetColor', (r) => console.log('saved dataSetColor', r));
    classify();
}

// Get a prediction for the current video frame
function classifyVideo() {
    flippedVideo = flipImage(capture)
    classifierCustom && classifierCustom.classify(flippedVideo,  (r) => gotResult(r, 'classifierCustom'));
}

function classifierFeatureExtractor(featureExtractor){
    featureExtractor.classify(capture, (e, r) => {
        gotResult(r, 'classifierFeatureExtractor');
    });
    setTimeout( () => classifierFeatureExtractor(featureExtractor), 100);
}

async function drawSegmentation() {
    if(!segmentationDeeplab) return

    const { segmentationMap } = segmentationDeeplab;
    const img = await createImage(segmentationDeeplab.width, segmentationDeeplab.height);
   
    await img.loadPixels();

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let index = (x + y * width) * 4;
          img.pixels[index] = segmentationMap[index];     // R
          img.pixels[index + 1] = segmentationMap[index + 1]; // G
          img.pixels[index + 2] = segmentationMap[index + 2]; // B
          img.pixels[index + 3] = segmentationMap[index + 3]; // A
        }
    }

    await img.updatePixels();
    await image(img, 0, 0, width, height);
}

function drawPointsHands() {
    // Draw all the tracked hand points
    for (let i = 0; i < handPoseDetection.length; i++) {
        let hand = handPoseDetection[i];
        for (let j = 0; j < hand.keypoints.length; j++) {
            let keypoint = hand.keypoints[j];
            fill(0, 255, 0);
            noStroke();
            circle(keypoint.x, keypoint.y, 10);
        }
    }
}

function drawPointsfaceMesh() {
    //Draw all the tracked face points
    for (let i = 0; i < faces.length; i++) {
        let face = faces[i];

        if(!face.keypoints){
            face.keypoints = face.landmarks.map(landmark => {
                return { x: landmark[0], y: landmark[1] }
            })
        }


        if(api && api.detector.segmentationFaceDetection && face.keypoints){
            for (let j = 0; j < face.keypoints.length; j++) {
                let keypoint = face.keypoints[j];
                fill(0, 255, 0);
                noStroke();
                circle(keypoint.x, keypoint.y, 5);
            }
        }
     
        if(api && api.detector.boxFaceDetection && faces && faces[i] && faces[i].box) {
            noFill();
            stroke(0, 255, 0);
            strokeWeight(2);
            rect(faces[i].box.xMin, faces[i].box.yMin, faces[i].box.width , faces[i].box.height);
            noStroke();
        }
    }
}

function drawPointsBodyPose() {
    //draw the skeleton connections
    for (let i = 0; i < poses.length; i++) {
        let pose = poses[i];
        for (let j = 0; j < connections.length; j++) {
            let pointAIndex = connections[j][0];
            let pointBIndex = connections[j][1];
            let pointA = pose.keypoints[pointAIndex];
            let pointB = pose.keypoints[pointBIndex];
            // Only draw a line if both points are confident enough
            if (pointA.score > 0.1 && pointB.score > 0.1) {
                stroke(255, 0, 0);
                strokeWeight(2);
                line(pointA.x, pointA.y, pointB.x, pointB.y);
            }
        }
    }

    // Draw all the tracked landmark points
    for (let i = 0; i < poses.length; i++) {
        let pose = poses[i];
        for (let j = 0; j < pose.keypoints.length; j++) {
            let keypoint = pose.keypoints[j];
            // Only draw a circle if the keypoint's confidence is bigger than 0.1
            if (keypoint.score > 0.1) {
                fill(0, 255, 0);
                noStroke();
                circle(keypoint.x, keypoint.y, 10);
            }
        }
    }
}

function drawPredictionCocoSsd() {
    if(predictionsCocoSsd.length > 0){
        for (let i = 0; i < predictionsCocoSsd.length; i++) {
            let bbox = predictionsCocoSsd[i].bbox;
            let x = bbox[0];
            let y = bbox[1];
            let w = bbox[2];
            let h = bbox[3];
        
            noFill();
            stroke(0, 255, 0);
            strokeWeight(2);
            rect(x, y, w, h);
        
            // Desenhar o rótulo e a confiança
            noStroke();
            fill(0, 255, 0);
            textSize(16);
            text(predictionsCocoSsd[i].class + ' ' + nf(predictionsCocoSsd[i].score * 100, 2, 1) + '%', x, y > 20 ? y - 5 : y + 15);
        }
    }
}

function gotResult(results, type ) {
    // console.log({results, type});

    switch (type) {
        case 'faceMesh':
            faces = results;
            break;
        case 'classifier':
            classifications = results;
            break;
        case 'classifierCustom':
            classificationsCustom = results;
            break;
        case 'bodyPose':
            poses = results;
            break;

        case 'detectbBodyPose':
            detectbBodyPose = results;
            break;
        case 'handPoseDetection':
            handPoseDetection = results;
            break;

        case 'bodySegmentation':
            segmentation = results;
            break;
        case 'soundClassifier':
            predictedWord = results
            break;
        case 'classifierFeatureExtractor':
            classifierFeatureClassfications = results;
            // console.log({classifierFeatureClassfications});
            break;
    }

    // console.log({ classifications, classificationsCustom, segmentation }, {faces, poses, handPoseDetection, detectbBodyPose, connections});
}

async function readDataFromGPU(tensor) {
    // Create a WebGPU device and context
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    // Create a buffer on the GPU
    const gpuBuffer = device.createBuffer({
        size: tensor.size * Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });

    // Copy data from the tensor to the GPU buffer
    const data = tensor.dataSync();
    const arrayBuffer = new Float32Array(data).buffer;
    device.queue.writeBuffer(gpuBuffer, 0, arrayBuffer);

    // Map the buffer to be read by the CPU
    await gpuBuffer.mapAsync(GPUMapMode.READ);
    const mappedArrayBuffer = gpuBuffer.getMappedRange();
    const floatArray = new Float32Array(mappedArrayBuffer);

    // Unmap the buffer
    gpuBuffer.unmap();

    return floatArray;
}

const flipImage = (img) => {
    // image image, bitmap, or canvas
    let imgWidth;
    let imgHeight;
    let inputImg;
  
    if (img instanceof HTMLImageElement ||
      img instanceof HTMLCanvasElement ||
      img instanceof HTMLVideoElement ||
      img instanceof ImageData) {
      inputImg = img;
    } else if (typeof img === 'object' &&
      (img.elt instanceof HTMLImageElement ||
        img.elt instanceof HTMLCanvasElement ||
        img.elt instanceof HTMLVideoElement ||
        img.elt instanceof ImageData)) {
  
      inputImg = img.elt; // Handle p5.js image
    } else if (typeof img === 'object' &&
      img.canvas instanceof HTMLCanvasElement) {
      inputImg = img.canvas; // Handle p5.js image
    } else {
      inputImg = img;
    }
  
    if (inputImg instanceof HTMLVideoElement) {
      // should be videoWidth, videoHeight?
      imgWidth = inputImg.width;
      imgHeight = inputImg.height;
    } else {
      imgWidth = inputImg.width;
      imgHeight = inputImg.height;
    }
  
  
    if (ml5.p5Utils.checkP5()) {
      const p5Canvas = ml5.p5Utils.p5Instance.createGraphics(imgWidth, imgHeight);
      p5Canvas.push()
      p5Canvas.translate(imgWidth, 0);
      p5Canvas.scale(-1, 1);
      p5Canvas.image(img, 0, 0, imgWidth, imgHeight);
      p5Canvas.pop()
  
      return p5Canvas;
    }
    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
  
    const ctx = canvas.getContext('2d');
    ctx.drawImage(inputImg, 0, 0, imgWidth, imgHeight);
    ctx.translate(imgWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, imgWidth * -1, 0, imgWidth, imgHeight);

    return canvas;
  
}
