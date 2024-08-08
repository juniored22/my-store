"use strict";

class Video {
    constructor(options = {}) {
        this.defaultOptions = {
            api: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/dist/face-api.js',
            urlRedirection: null,
            instanceof: null,
            userInfo: { name: 'EDGARD', email: 'wqyZi@example.com' },
            ratioConfimationSimilarity: 0.5,
            settings: {
                typeDetection: 'detectAllFaces',
                choosefacedetecto: 'SsdMobilenetv1Options',
                inputSize: 160,
                scoreThreshold: 0.5,
                minConfidence: 0.2,
                methods: [
                    { type: 'all', method: 'withFaceLandmarks', draw: 'drawFaceLandmarks' },
                    { type: 'all', method: 'withFaceExpressions', draw: null },
                    { type: 'all', method: 'withAgeAndGender', draw: null },
                    { type: 'detectSingleFace', method: 'withFaceDescriptor', draw: null },
                    { type: 'detectAllFaces', method: 'withFaceDescriptors', draw: null }
                ],
                timeOutLoopAnalyse: 5000,
            },
            video: {
                show: true,
                elementId: 'video',
                size: 'ideal',
                config: {
                    width: { 
                        min: 640, 
                        ideal: 640,//1280 
                        max: 640//1920 
                    },
                    height: { 
                        min: 480, 
                        ideal: 480,//720 
                        max: 480//1080 
                    },
                    frameRate: { 
                        min: 15, 
                        ideal: 30, 
                        max: 30//120 
                    },
                    aspectRatio: { ideal: 1.7777777778 },
                    facingMode: 'environment',
                },
            },
            rtc:{
                show: true,
                configuration : {
                    iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
                }
            },
            canvas: {
                show: true,
                elementId: 'overlay',
                textFild: {
                    text: "Canvas overlay",
                    x: 50, y: 50,
                    fontSize: '30px',
                    fontFamily: 'Arial',
                    color: 'white'
                },
                config: {
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 361, ideal: 720, max: 1080 }
                },
            },

            canvas2: {
                show: true,
            },

            canvasMin: {
                show: true,
            }
        };

        // Merge custom options with default options
        this.options = this.mergeOptions(this.defaultOptions, options);

        console.log('[Video]',{options: this.options});

        // Assign merged options to instance variables
        this.api = this.options.api;
        this.urlRedirection = this.options.urlRedirection;
        this.userInfo = this.options.userInfo;
        this.ratioConfimationSimilarity = this.options.ratioConfimationSimilarity;
        this.settings = this.options.settings;
        this.video = this.options.video;
        this.sizeVideo = this.video.size;
        this.canvas = this.options.canvas;
        this.faceapi = this.options.instanceof;

        // Initialize other instance variables
        this.faceMatcher = null;
        this.mediaRecorder = null;
        this.faceDataset = [];
        this.faceDatasetQualityHigh = [];
        this.faceDescriptors = [];
        this.imgDataset = [];
        this.recordedChunks = [];
        this.detectionToUploadJson = [];
        this.detectionJsonToTest = [];
        this.detectionsWebCam = [];
        this.canvasDatasetTest = [];
        this.elementsIMG = [];
        this.arrAverage = [];
        this.faceCanvasExtracted = [];
        this.userDetectName = 'Face analyse';
        this.boxBorderColor = 'blue';
        this.confimationSimilarity = 0;
        this.faceCount = 0;
        this.debug = false;
        this.debugEnd = 0;
        this.container = null;
        this.loopDetection = true;
        this.quantityConfimationSimilarity = 100;
        this.maxFacesToSave = 10;
        this.minDetectionFaceScore = 0.80;
        this.minSimilarityThreshold = 0.20;
        this.minAverageDistance = 0.20;

        this.endLoading = {
            fn: () => console.log('%c[endLoading][fn]', 'color: green; font-weight: bold;'),
            status: false,
        };

        this.checkCameraPermission();
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

    async checkCameraPermission() {
      
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            alert("Seu navegador não suporta a detecção de dispositivos de mídia. Por favor, use um navegador mais moderno.");
            return;
        }

        console.log('[Video]', 'Checking camera permission...');

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameraExists = devices.some(device => device.kind === 'videoinput');
            if (!cameraExists) {
                alert("Nenhuma câmera foi encontrada. Por favor, conecte uma câmera.");
                return;
            }

            const permissionStatus = await navigator.permissions.query({ name: 'camera' });
            if (permissionStatus.state === 'granted') {
                console.log("[Video][checkCameraPermission] Permissão para usar a câmera concedida.");
            } else if (permissionStatus.state === 'prompt' || permissionStatus.state === 'denied') {
                alert("Permissão para usar a câmera necessária. Por favor, permita o uso da câmera nas configurações do seu navegador.\n\nInstruções:\n1. Clique no ícone de cadeado na barra de endereço do navegador.\n2. Vá até 'Permissões' ou 'Configurações do site'.\n3. Encontre 'Câmera' e selecione 'Permitir'.");
            }
        } catch (error) {
            console.error("Erro ao verificar permissões da câmera:", error);
        }
    }

    async init() {
        try {
            await this.createVideoAndCanvas('#app', this.video, this.canvas);
            await this.setupCamera({});
            await this.canvasBackground({});
        } catch (error) {
            console.error('Erro 501', error);
            alert(error);
        }
        return this;
    }

    createVideoAndCanvas(containerSelector, videoRef, canvasRef) {
        this.containerSelector = containerSelector;
        console.log('[Video]', 'createVideoAndCanvas', {containerSelector, videoRef, canvasRef});

        return new Promise((resolve, reject) => {
            const container = this.selectContainer(containerSelector);

            if (!container) {
                reject(`Container with selector "${containerSelector}" not found.`);
                return;
            }

            this.container = container;
           
            const video = this.createVideoElement(videoRef);
            const videoRTC = this.createVideoElementRCT(videoRef, 'video-rtc');
            const canvasPreProcess = this.createCanvasElement(canvasRef, `pre-process`);
            const canvas = this.createCanvasElement(canvasRef, 'overlay');
            const canvas2 = this.createCanvasElement(canvasRef, 'overlay2');
            const canvas3 = this.createCanvasElement(canvasRef, 'overlay3');
            const canvasMin = this.createCanvasElement(canvasRef, `${canvasRef.elementId}-min`);
    

            this.addElementsToContainer(container, [ video, videoRTC, canvas, canvasPreProcess, canvas2, canvas3, canvasMin ]);

            this.video.element = video;
            this.video.elementRTC = videoRTC;
            this.canvas.element = canvas;
            this.canvas.element2 = canvas2;
            this.canvas.element3 = canvas3;
            this.canvas.canvasmin = canvasMin;
            this.canvas.preProcess = canvasPreProcess;

            this.hidenElemet();

            resolve(this);
        });
    }

    hidenElemet(){
        if(!this.options.video.show){
            this.video.element.style.visibility = 'hidden';
        }
        if(!this.options.canvas.show){
            this.canvas.element.style.visibility = 'hidden';
        }

        if(!this.options.canvas2.show){
            this.canvas.element2.style.visibility = 'hidden';
        }

        if(!this.options.canvasMin.show){
            this.canvas.canvasmin.style.visibility = 'hidden';
        }

        if(!this.options.rtc.show){
            this.video.elementRTC.style.visibility = 'hidden';
        }
    }

    selectContainer(containerSelector) {
        console.log('[Video]', 'selectContainer', {containerSelector});
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`Container with selector "${containerSelector}" not found.`);
        }
        return container;
    }

    createVideoElement(videoRef, elementId) {
        console.log('[Video]', 'createVideoElement', {videoRef, elementId});
        const video = document.createElement('video');
        video.classList.add('video');
        video.id = elementId ||videoRef.elementId || 'video';
        video.autoplay = true;
        video.muted = true;
        // video.width = videoRef.config.width[this.sizeVideo];
        // video.height = videoRef.config.height[this.sizeVideo];
        return video;
    }

    createVideoElementRCT(videoRef, elementId) {
        console.log('[Video]', 'createVideoElement', {videoRef, elementId});
        const video = document.createElement('video');
        video.classList.add('video-rtc');
        video.id = elementId ||videoRef.elementId || 'video';
        video.autoplay = true;
        video.muted = true;
        return video;
    }

    createCanvasElement(canvasRef, elementId) {
        console.log('[Video]', 'createCanvasElement', {canvasRef, elementId});
        const canvas = document.createElement('canvas');
        canvas.classList.add('canvas');
        canvas.id = elementId || canvasRef.elementId || 'overlay';
        // canvas.width = canvasRef.config.width[this.sizeVideo];
        // canvas.height = canvasRef.config.height[this.sizeVideo];
        return canvas;
    }

    captureFrame({ video = this.video,  canvas = this.canvas } = {}) {
        console.log('[Video][captureFrame]', {video, canvas});
        canvas.preProcess.width = video.videoWidth;
        canvas.preProcess.height = video.videoHeight;
        this.contextPreProcess.drawImage( video, 0, 0, video.videoWidth, video.videoHeight);
        let imageData = this.contextPreProcess.getImageData(0, 0, video.videoWidth, video.videoHeight);
        return { canvasPreProcess : canvas.preProcess, imageData};
    }

    addElementsToContainer(container, elements) {
        console.log('[Video]', 'addElementsToContainer', {container, elements});
        elements.forEach(element => container.appendChild(element));
    }

    async setupCamera({ video = this.video }, callback) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const stream = await navigator.mediaDevices.getUserMedia({ video: video.config, audio: video.audio });

        console.log('[Video][setupCamera]',{ video ,stream,  devices, videoDevices});

        video.element.srcObject = stream;
        video.localStream = stream;

        

        return new Promise((resolve, reject) => {

            video.element.onloadeddata  = (event) => console.log('%c[Camera loadeddata]','background: green; color: #fff', event);
            video.element.onloadstart  =(event) => console.log('%c[Camera loadstart]','background: green; color: #fff', event);
            video.element.onprogress = (event) => {
                console.log('%c[Camera onprogress]','background: green; color: #fff', event);

                this.callVideoRTC({ video  });
                    console.log('%c[Camera onprogress]', 'background: green; color: #fff', {
                    iceConnectionState:this.aplication1 ? this.aplication1.iceConnectionState : null,
                });

                if (typeof callback === 'function') callback({ video, canvas: this.canvas });

            }
            // video.element.ontimeupdate = (event) => console.log('%c[Camera ontimeupdate]','background: green; color: #fff', event);

            video.element.onloadedmetadata = () => {
                // this.canvas.element.classList.add('remove-css-init');
                console.log('%c[Camera on]', 'background: green; color: #fff', {
                    video,
                    videoHeight: video.element.videoHeight,
                    videoWidth: video.element.videoWidth,
                    width: video.element.width,
                    height: video.element.height,
                    size: this.sizeVideo,
                });

                resolve(video.element);               
            };
        });
    }

    hangup() {
        this.aplication1.close();
        this.aplication2.close();
        this.aplication1 = null;
        this.aplication2 = null;
    }

    async callVideoRTC({ video = this.video } = {}) {

        console.log('[Video][callVideoRTC]', { video });

        this.aplication1 = new RTCPeerConnection(this.options.rtc.configuration);
        this.aplication2 = new RTCPeerConnection(this.options.rtc.configuration);

        console.log('[Video][callVideoRTC]', { video, aplication1: this.aplication1, aplication2: this.aplication2 });


        this.aplication1.onicecandidate = (event) => {
            console.log('[Video] [RTC] onicecandidate:aplication1',{candidate : event.candidate});
            if (event.candidate) {
                this.aplication2.addIceCandidate(event.candidate);
            }
        };

        this.aplication2.onicecandidate = (event) => {
            console.log('[Video] [RTC] onicecandidate:aplication2',{candidate : event.candidate});
            if (event.candidate) {
                this.aplication1.addIceCandidate(event.candidate);
            }
        };

        this.aplication2.ontrack = (event) => {
            console.log('[Video] [RTC] ontrack:aplication2',{event});
            this.options.video.elementRTC.srcObject = event.streams[0];
        }

        this.aplication1.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                this.endLoading.aplication1 = true
            } 
        });

        this.aplication2.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                this.endLoading.aplication2 = true
            } 
        });


        video.localStream.getTracks().forEach(track => this.aplication1.addTrack(track, video.localStream));

        try {
            const offer = await this.aplication1.createOffer();
            await this.aplication1.setLocalDescription(offer);
            await this.aplication2.setRemoteDescription(this.aplication1.localDescription);

            const answer = await this.aplication2.createAnswer();
            await this.aplication2.setLocalDescription(answer);
            await this.aplication1.setRemoteDescription(this.aplication2.localDescription);

            console.log('[Video][RTC]', { offer, answer , localDescription: this.aplication1.localDescription, localDescription2: this.aplication2.localDescription});
        } catch (err) {
            console.error(err);
        }

    }

    displaySize({ video = this.video, size = this.sizeVideo, element = 'video', canvas = this.canvas } = {}) {
        if (element === 'video') {
            return { width: video.config.width[size], height: video.config.height[size] };
        } else {
            return { width: canvas.config.width[size], height: canvas.config.height[size] };
        }
    }

    async canvasBackground({ canvas = this.canvas } = {}) {
        console.log('[Video][canvas]', 'canvasBackground', { canvas });

        const displaySize = this.displaySize({});

        canvas.preProcess.width = displaySize.width;
        canvas.preProcess.height = displaySize.height;  

        canvas.element.width = displaySize.width;
        canvas.element.height = displaySize.height;

        canvas.element2.width = displaySize.width;
        canvas.element2.height = displaySize.height;

        canvas.element3.width = displaySize.width;
        canvas.element3.height = displaySize.height;

        canvas.canvasmin.width = displaySize.width;
        canvas.canvasmin.height = displaySize.height;


        const contextPreProcess = canvas.preProcess.getContext('2d', { willReadFrequently: false });
        this.contextPreProcess = contextPreProcess;
        contextPreProcess.fillStyle = '#00FF00';
        contextPreProcess.fillRect(0, 0, canvas.element.width, canvas.element.height);
        contextPreProcess.fillStyle = canvas.textFild.color;
        contextPreProcess.font = `${canvas.textFild.fontSize} ${canvas.textFild.fontFamily}`;
        contextPreProcess.fillText('Canvas ' + this.canvas.preProcess.id, canvas.textFild.x, canvas.textFild.y);
  
        const context = canvas.element.getContext('2d', { willReadFrequently: false });
        context.fillStyle = '#FF0000';
        context.fillRect(0, 0, canvas.element.width, canvas.element.height);

        context.fillStyle = canvas.textFild.color;
        context.font = `${canvas.textFild.fontSize} ${canvas.textFild.fontFamily}`;
        context.fillText(canvas.textFild.text, canvas.textFild.x, canvas.textFild.y);
    


        const context2 = this.canvas.element2.getContext('2d');
        context2.fillStyle = '#00FF00';
        context2.fillRect(0, 0, this.canvas.element2.width, this.canvas.element2.height);
        context2.fillStyle = canvas.textFild.color;
        context2.font = `${canvas.textFild.fontSize} ${canvas.textFild.fontFamily}`;
        context2.fillText('Canvas ' +this.canvas.element2.id, canvas.textFild.x, canvas.textFild.y);

        const context3 = this.canvas.element3.getContext('2d');
        context3.fillStyle = '#00FFFF';
        context3.fillRect(0, 0, this.canvas.element3.width, this.canvas.element3.height);
        context3.fillStyle = canvas.textFild.color;
        context3.font = `${canvas.textFild.fontSize} ${canvas.textFild.fontFamily}`;
        context3.fillText('Canvas ' +this.canvas.element3.id, canvas.textFild.x, canvas.textFild.y);

        const contextmin = this.canvas.canvasmin.getContext('2d');
        contextmin.fillStyle = '#0000FF';
        contextmin.fillRect(0, 0, this.canvas.canvasmin.width, this.canvas.canvasmin.height);
        contextmin.fillStyle = canvas.textFild.color;
        contextmin.font = `${canvas.textFild.fontSize} ${canvas.textFild.fontFamily}`;
        contextmin.fillText('Canvas ' +this.canvas.canvasmin.id, canvas.textFild.x, canvas.textFild.y);
        
        this.canvas.contextCanvasVideo = context;

   

        return { canvas, context };
    }

    observerVideo(action, callback = null) {

        if(action == 'endProcess') {
            let idListener = setInterval(() => {
                if (this.endLoading.aplication1 && this.endLoading.aplication2) {
                    clearInterval(idListener);
                    if (typeof callback === 'function')  callback();
                }
            }, 100);
        }
        
        
    }
}


export { Video };