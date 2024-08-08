
class Video{
    options = {
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
                aspectRatio: { ideal: 1.7777777778 },
                facingMode: 'environment'
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

    constructor({api, instanceofApi, settings, video, canvas, userInfo, urlRedirection, ratioConfimationSimilarity} = this.options) {
        this.userInfo = userInfo;
        this.loopDetection = true;
        this.quantityConfimationSimilarity = 100;
        this.maxFacesToSave = 10;
        this.minDetectionFaceScore = 0.80
        this.minSimilarityThreshold = 0.20;
        this.minAverageDistance = 0.20;
        this.ratioConfimationSimilarity = ratioConfimationSimilarity;
        this.urlRedirection = urlRedirection;
        this.api = api;
        this.faceapi = instanceofApi;
        this.settings = settings;
        this.methods = settings.methods;
        this.video = video;
        this.sizeVideo = video.size;
        this.canvas = canvas;
        this.faceMatcher = null;
        this.mediaRecorder = null
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
        this.debugEnd = 0
        this.container = null;
    }


    async checkCameraPermission() {
        // Verifica se a câmera está disponível
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            alert("Seu navegador não suporta a detecção de dispositivos de mídia. Por favor, use um navegador mais moderno.");
            return;
        }

        // Verifica as permissões da câmera
        navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            let cameraExists = devices.some(device => device.kind === 'videoinput');

            if (!cameraExists) {
                alert("Nenhuma câmera foi encontrada. Por favor, conecte uma câmera.");
                return;
            }

            navigator.permissions.query({ name: 'camera' })
                .then(function(permissionStatus) {
                    if (permissionStatus.state === 'granted') {
                        console.log("Permissão para usar a câmera concedida.");
                    } else if (permissionStatus.state === 'prompt' || permissionStatus.state === 'denied') {
                        alert("Permissão para usar a câmera necessária. Por favor, permita o uso da câmera nas configurações do seu navegador.\n\nInstruções:\n1. Clique no ícone de cadeado na barra de endereço do navegador.\n2. Vá até 'Permissões' ou 'Configurações do site'.\n3. Encontre 'Câmera' e selecione 'Permitir'.");
                    }
                })
                .catch(function(error) {
                    console.error("Erro ao verificar permissões da câmera:", error);
                });
        })
        .catch(function(error) {
            console.error("Erro ao enumerar dispositivos:", error);
            alert("Erro ao acessar dispositivos de mídia. Por favor, verifique as configurações do seu navegador e tente novamente.");
        });
    }

    async init() {
        this.createVideoAndCanvas('#app', this.video, this.canvas)
        .then(async () => {
            await this.setupCamera({});
            await this.canvasBackground({})
           
        }).catch(error => {
            console.error('Erro 501',error);
            alert(error);
        });
       
        return this
        
    }

    createVideoAndCanvas(containerSelector, videoRef, canvasRef) {
        return new Promise((resolve, reject) => {
            // Seleciona o contêiner onde os elementos serão adicionados
            const container = document.querySelector(containerSelector);
            this.container = container;
            // container.style.width = canvasRef.config.width[this.sizeVideo] + 'px';
            // container.style.height = canvasRef.config.height[this.sizeVideo] + 'px';
            console.log({container});
            
            if (!container) {
                console.error(`Container with selector "${containerSelector}" not found.`);
                reject(`Container with selector "${containerSelector}" not found.`);
                return;
            }
            
            // Cria o elemento de vídeo
            const video = document.createElement('video');
            video.id = videoRef.elementId ||  'video';
            video.autoplay = true;
            video.muted = true;
            video.width = videoRef.config.width[this.sizeVideo];
            video.height = videoRef.config.height[this.sizeVideo];

            console.log({video});

            // Cria o elemento canvas
            const canvas = document.createElement('canvas');
            canvas.id = canvasRef.elementId ||  'overlay';
            canvas.width = canvasRef.config.width[this.sizeVideo];
            canvas.height = canvasRef.config.height[this.sizeVideo];

            console.log({canvas});

            // Cria o elemento canvas miniatura
            const canvasMin = document.createElement('canvas');
            canvasMin.id = canvas.id+'-min'
            canvasMin.width = 80;
            canvasMin.height = 80;

            console.log({canvasMin});
         
            
            // Adiciona os elementos ao contêiner
            container.appendChild(video);
            container.appendChild(canvas);
            container.appendChild(canvasMin);
      

            this.video.element = video
            this.canvas.element = canvas
            this.canvas.canvasmin = canvasMin

            this.checkCameraPermission();

            resolve({ video, canvas });
        });
    }

    async setupCamera({ video = this.video }, callback) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: video.config, audio: video.audio });
        console.log({stream});
        video.element.srcObject = stream;
        console.log({srcObject:video.element.srcObject});

        
        return new Promise((resolve, reject) => {
            try {
                video.element.onloadedmetadata = async () => {

                    this.canvas.element.classList.add('remove-css-init'); 
                    
                    console.log('%c[Camera on]', 'background: green; color: #fff', {
                        video, 
                        videoHeight: video.element.videoHeight, 
                        videoWidth: video.element.videoWidth, 
                        width : video.element.width, 
                        height : video.element.height,
                        size: this.sizeVideo,
                    });

                    if(typeof callback == 'function') callback({video, canvas: this.canvas});
                    resolve(video.element)

                    
                    
                };
            } catch (error) {
                console.error('Error 502 accessing camera:', error);
                reject(error);
            }
        });
    }

    displaySize({ video = this.video, size = this.sizeVideo, element = 'video', canvas = this.canvas } = {}) {
        if(element == 'video')
            return { width: video.config.width[size], height: video.config.height[size] };
        else 
            return { width: canvas.config.width[size], height: canvas.config.height[size] };
    }

    async canvasBackground({ canvas = this.canvas } = {}) {
        canvas.element.width =  this.displaySize({}).width;
        canvas.element.height = this.displaySize({}).height;
        

        // Obtém o contexto 2D do canvas e preenche o fundo com a cor vermelha
        const context = canvas.element.getContext('2d');
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.element.width, canvas.element.height);

        // Define as propriedades do texto e adiciona o texto ao canvas
        context.fillStyle = canvas.textFild.color;
        context.font = `${canvas.textFild.fontSize} ${canvas.textFild.fontFamily}`;
        context.fillText(canvas.textFild.text, canvas.textFild.x, canvas.textFild.y);

        this.contextCanvasVideo = context;
        return {canvas, context};
    }
}