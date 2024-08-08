

class Utils {
    constructor(errorOutputId) {
        this.errorOutput = document.getElementById(errorOutputId);
    }

    createFileFromUrl(path, url, callback) {
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = () => {
            if (request.status === 200) {
                let data = new Uint8Array(request.response);
                cv.FS_createDataFile('/', path, data, true, false, false);
                callback();
            } else {
                this.printError(`Failed to load ${url} status: ${request.status}`);
            }
        };

        request.send();
    }

    printError(message) {
        if (this.errorOutput) {
            this.errorOutput.innerHTML = message;
        } else {
            console.error(message);
        }
    }
}

class  FaceRecognationFaceApi {

    options = {
        api: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/dist/face-api.js',
        urlRedirection: null,//'http://localhost:3000/aplication',
        instanceof: faceapi,
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
        this.createVideoAndCanvas('.div-video', this.video, this.canvas)
        .then(async () => {
            await this.setupCamera({});
            await this.canvasBackground({})
           
        }).catch(error => {
            console.error('Erro 501',error);
            alert(error);
        });

        this.canvasDatasetTest = await this.loadImages({video});
        this.createImgDataset();
        this.analyseImage();

        return this
        
    }

    async compare({uploadedImageElement, faceTestDetections, canvas = this.canvas.element}) {

        let name = 'unknown';
        // console.log('compare');
        // const options = new this.faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
        const options = this.getFaceDetectionOptions({settings: this.settings});

        this.faceapi.matchDimensions(canvas, this.displaySize({element: 'canvas'}));


        // const detectionsFallbackVideo =  await this.faceapi.detectAllFaces(this.video.element, options).withFaceLandmarks().withFaceDescriptors();
        const detectionsFallbackVideo = await this.faceDetectType({
            methods: this.settings.methods, 
            type: this.settings.typeDetection, 
            video: this.video.element, faceDetectionOptions: options});
        
        const uploadedImageDetections = await this.faceapi.detectAllFaces(uploadedImageElement, options).withFaceLandmarks().withFaceDescriptors();

        // console.log({detectionsFallbackVideo});
        if (uploadedImageDetections.length === 0 || faceTestDetections == '' || !faceTestDetections ) {
            console.log('No faces detected');
            return null;
        }

        this.euclideanDistance = await this.faceapi.euclideanDistance(uploadedImageDetections[0].descriptor, faceTestDetections.descriptor)

    
        const faceMatcher = new this.faceapi.FaceMatcher(faceTestDetections);
        const results = uploadedImageDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
        
   
        if( detectionsFallbackVideo && detectionsFallbackVideo.detections && detectionsFallbackVideo.detections != null ){
            const resizedResults = faceapi.resizeResults(detectionsFallbackVideo, this.video.element);

            if(results){
                results[0].euclideanDistance = this.euclideanDistance.toFixed(2);
                name = this.filterAnaliseImage({distance:results[0].distance, label:results[0].label, euclideanDistance: results[0].euclideanDistance});
            }
            
            // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.drawCustomBox({canvas,  resizedResults: resizedResults.detections, action: 'compare', euclideanDistance: results[0].euclideanDistance, name ,boxShow:false});
            // await faceapi.draw.drawDetections(canvas, resizedDetections)
        }

        if(!results) return null;

        results.forEach((bestMatch, i) => {
            bestMatch.euclideanDistance = this.euclideanDistance 
            // console.log(bestMatch);
            // console.log(`Image ${i} best match: ${bestMatch.toString()}`);
            // console.log(bestMatch);
            this.arrAverage.push(bestMatch);
        });

        return results;
    }

    async deprecated_analyseImage() {

        console.log('analyseImage');
 
        if(this.elementsIMG == ''){
            console.log('%cNo elementsIMG detected','background: red; color: #fff', this.elementsIMG);
            this.userDetectName = 'Face analyse';
            this.boxBorderColor = 'blue';
            this.confimationSimilarity = 0;
            setTimeout(() => {
                this.analyseImage()
            }, this.settings.timeOutLoopAnalyse);
            
            return null;
        }

        if (this.detectionsWebCam == '' || this.detectionsWebCam.detections == null || this.detectionsWebCam.detections == '') {
            console.log('%cNo faces detected','background: red; color: #fff');
            this.userDetectName = 'Face analyse';
            this.boxBorderColor = 'blue';
            this.confimationSimilarity = 0;
            setTimeout(() => {
                this.analyseImage()
            }, this.settings.timeOutLoopAnalyse);
            return null;
        }

        const imagePromises = this.elementsIMG.map(  ({img, path}, index) => {
            return new Promise(async (resolve, reject) => {
                let result = await this.compare({uploadedImageElement: img, faceTestDetections: this.detectionsWebCam.detections[0]});
                resolve();
            })
        });

        // Handle all promises
        Promise.all(imagePromises)
        .then(() => {
            console.log('All images elements ready successfully.');
            this.detectionsWebCam = [];
            // You can proceed with further processing here
        })
        .catch((error) => {
            console.warn('One or more images failed to load:', error);
            // console.error('One or more images failed to load:', error);
        });

        setTimeout(() => {
            this.analyseImage()
        }, this.settings.timeOutLoopAnalyse);
      
    }

    async analyseImage() {

        console.log('analyseImage');
        if(this.confimationSimilarity > this.quantityConfimationSimilarity) {
            if(!this.loopDetection){
                this.uploadFacesImageFaceCanvasTest([this.faceCanvasExtracted], '/upload-test');
                return null;
            }
        };
        
        
        if(this.elementsIMG == ''){
            console.log('%cNo elementsIMG detected','background: red; color: #fff', this.elementsIMG);
            this.userDetectName = 'Face analyse';
            this.boxBorderColor = 'blue';
            this.confimationSimilarity = 0;
            setTimeout(() => {
                this.analyseImage()
            }, this.settings.timeOutLoopAnalyse);
            
            return null;
        }

        if (!this.detectionsWebCam || this.detectionsWebCam == '' || this.detectionsWebCam.detections == null || this.detectionsWebCam.detections == '') {
            console.log('%cNo faces detected','background: red; color: #fff');
            this.userDetectName = 'Face analyse';
            this.boxBorderColor = 'blue';
            this.confimationSimilarity = 0;
            setTimeout(() => {
                this.analyseImage()
            }, this.settings.timeOutLoopAnalyse);
            return null;
        }

        const processImages = async () => {
            const imagePromises = this.elementsIMG.map(({img, path}, index) => {
                return new Promise(async (resolve, reject) => {
                    try {
                        await this.compare({uploadedImageElement: img, faceTestDetections: this.detectionsWebCam.detections[0]});
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            });
    
            await Promise.all(imagePromises)
                .then(() => {
                    console.log('All images loaded successfully.');
                    this.detectionsWebCam = [];
                    // You can proceed with further processing here
                })
                .catch((error) => {
                    console.warn('One or more images failed to load:', error);
                    // console.error('One or more images failed to load:', error);
                });
    
            setTimeout(() => {
                this.analyseImage();
            }, this.settings.timeOutLoopAnalyse);
        };
    
        // Execute the processImages function asynchronously to ensure non-blocking behavior
        setTimeout(() => {
            processImages();
        }, 0);

      
    }

    filterAnaliseImage({distance, label, euclideanDistance}) {

        const averageDistance = this.arrAverage.reduce((sum, d) => {
            if(d.label != 'unknown') return sum + d.distance
            else return sum
        } , 0) / this.arrAverage.length;

        this.averageDistance = averageDistance.toFixed(2);

        // console.log({averageDistance});

        if(averageDistance >= this.minAverageDistance)  {
            this.confimationSimilarity = this.confimationSimilarity + 1 * this.ratioConfimationSimilarity;
        };
        
        if(label != 'unknown' && distance > this.minSimilarityThreshold ){
            // console.log({distance, minSimilarityThreshold: this.minSimilarityThreshold, label, name:this.userInfo.name,  euclideanDistance});
            const capitalizeFirstLetter = str => str ? str[0].toUpperCase() + str.slice(1).toLowerCase() : str;
            this.userDetectName = capitalizeFirstLetter(this.userInfo.name);
            this.boxBorderColor = '#10ff10';
            // console.log(this.userDetectName);
        }
        else if(label == 'unknown'){
            this.userDetectName = 'unknown';
            this.boxBorderColor = 'red';
            // console.log(this.userDetectName);
        }else{
            this.userDetectName = 'Face analyse';
            this.boxBorderColor = 'blue';
        }

        return this.userDetectName;
    }

    createImgDataset() {
     
        // if(this.detectionsWebCam == '' || this.detectionsWebCam.detections == null || this.detectionsWebCam.detections[0] == '') {
        //     setTimeout(() => {
        //         this.createImgDataset()
        //     }, 3000);
        //     return null;
        // }

        if (this.canvasDatasetTest.length > 0) {
            const imagePromises = this.canvasDatasetTest.map((path, index) => {
                return new Promise((resolve, reject) => {
                    const img = document.createElement('img');
                    img.src = path;
                    img.onload = async () => {
                        
                        try {
                            this.elementsIMG.push({img});
                            // console.log(`Image at index ${index} loaded successfully.`);
                            resolve();
                        } catch (error) {
                            console.error(`Error during image processing at index ${index}:`, error);
                            // reject(error);
                        }
                    };
                    img.onerror = (event) => {
                        // console.error(`Error loading image at index ${index}:`, event);
                        // reject(new Error(`Error loading image at index ${index}: ${event.type}`));
                    };
                });
            });
        
            // Handle all promises
            Promise.all(imagePromises)
                .then(() => {
                    console.log('All images loaded successfully.');
                    // You can proceed with further processing here
                })
                .catch((error) => {
                    console.warn('One or more images failed to load:', error);
                    // console.error('One or more images failed to load:', error);
                })
        }
    }

    async similarityFaces() {
       
        let arraySimilarity = [];
      
        
        if (this.detectionsWebCam && this.detectionsWebCam.detections && this.detectionsWebCam.detections.length > 0) {
            
            // console.log(this.detectionsWebCam.detections);

            const webCamDescriptor = this.detectionsWebCam.detections[0].descriptor;
            
            // Verifique se todos os descritores têm o mesmo comprimento
            arraySimilarity = await Promise.all(
                this.detectionJsonToTest.map(async (face) => {
                    if (face.descriptor.length !== webCamDescriptor.length) {
                        // throw new Error('Descritores têm comprimentos diferentes');
                        return 0
                    }
                    return this.faceapi.euclideanDistance(face.descriptor, webCamDescriptor);
                })
            );
        }
    
        return arraySimilarity;
        
    }

    createVideoAndCanvas(containerSelector, videoRef, canvasRef) {
        return new Promise((resolve, reject) => {
            // Seleciona o contêiner onde os elementos serão adicionados
            const container = document.querySelector(containerSelector);
            this.container = container;
            container.style.width = canvasRef.config.width[this.sizeVideo] + 'px';
            container.style.height = canvasRef.config.height[this.sizeVideo] + 'px';
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

    async setupCamera({ video = this.video }) {
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

                    this.detectionsWebCam = await this.detectFace({video, recursive:true, timeOut: video.config.frameRate.ideal});
                    // FaceRecognationFaceApiOpenCV.loadCascadeAndStart({video: video.element, canvas: this.canvas.element});
                    resolve(video.element)
                    
                };
            } catch (error) {
                console.error('Error 502 accessing camera:', error);
                reject(error);
            }
        });
    }

    stopCamera({ video }) {
        // Verifica se o elemento de vídeo tem um stream de mídia associado
        if (video.element.srcObject) {
            // Obtém todas as faixas (tracks) do stream de mídia
            const stream = video.element.srcObject;
            const tracks = stream.getTracks();
    
            // Para cada faixa, chama o método stop
            tracks.forEach(track => track.stop());
    
            // Remove a referência ao stream de mídia do elemento de vídeo
            video.element.srcObject = null;
            
            console.log('Camera stopped');
        }
    }

    async loadModels() {
        const MODEL_URL = '/models';
        await this.faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
        await this.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await this.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await this.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await this.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        await this.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL); // Adiciona o carregamento do modelo SsdMobilenetv1
        console.log("Modelos carregados");
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
        return canvas
    }

    displaySize({ video = this.video, size = this.sizeVideo, element = 'video', canvas = this.canvas } = {}) {
        if(element == 'video')
            return { width: video.config.width[size], height: video.config.height[size] };
        else 
            return { width: canvas.config.width[size], height: canvas.config.height[size] };
    }

    getFaceDetectionOptions({settings = this.settings}) {
    
        if (settings.choosefacedetecto === 'SsdMobilenetv1Options') {
            return new this.faceapi.SsdMobilenetv1Options({ 
                minConfidence: settings.minConfidence 
            });
        }

        return new faceapi.TinyFaceDetectorOptions({ 
            inputSize: settings.inputSize, 
            scoreThreshold: settings.scoreThreshold 
        });
    }

    async faceDetectType({methods, type = 'detectAllFaces', video, faceDetectionOptions}) {
        let detections;
        let promiseChain;

        if (type === 'detectAllFaces') {
            promiseChain = this.faceapi.detectAllFaces(video, faceDetectionOptions);
        } else if (type === 'detectSingleFace') {
            promiseChain = this.faceapi.detectSingleFace(video, faceDetectionOptions);
        }

        // Itera sobre cada método e adiciona à cadeia de promessas
        methods.forEach(item => {
            if(item.type === type || item.type === 'all') {
                if (typeof promiseChain[item.method] === 'function') {
                    promiseChain = promiseChain[item.method]();
                } else {
                    throw new Error(`Método ${item.method} não encontrado`);
                }
            }
        
        });

        detections = await promiseChain;

        if(type == 'detectSingleFace') {
            return { detections: detections ? [detections] : null };
        }else {
            return { detections };
        }
    }

    drawCustomBox({canvas = this.canvas.element, resizedResults, action='drawCustomBox', euclideanDistance = 0, name = this.userDetectName, boxShow = true } = {}) {
        resizedResults.forEach(detection => {

            if(action  != 'detectFace'){
                true || console.log('drawCustomBox', 
                {name}, 
                {score: detection.detection.score.toFixed(2)}, 
                {similarityFaces: this.minSimilarityThreshold},
                {euclideanDistance}, {resizedResults},
                {confimationSimilarity: this.confimationSimilarity},
                {average: this.averageDistance},
                {minAverageDistance: this.minAverageDistance},
                {detectionToUploadJson: this.detectionToUploadJson},
                {faceCanvasExtracted: this.faceCanvasExtracted},
                action);
            }
     

            const box = detection.detection.box;
            const label = name || 'Face';
            const additionalText = `Score: ${detection.detection.score.toFixed(2)}`;

            // Find the expression with the highest probability
            const expressions = detection.expressions;
            const maxExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

            const ctx = canvas.getContext('2d');

            if(boxShow){
                ctx.strokeStyle = this.boxBorderColor;
                ctx.lineWidth = 3;
                ctx.strokeRect(box.x, box.y, box.width, box.height);
            }


            const textWidth = ctx.measureText(label).width;
            const textHeight = parseInt(ctx.font, 10); // base 10
            const labelX = box.x + box.width + 10; // Position label 10px to the right of the box
            const labelY = box.y + textHeight; // Position label at the top of the box

            // Draw the first label
            ctx.fillStyle = 'white';
            ctx.fillRect(labelX, labelY - textHeight, textWidth + 4, textHeight + 4);
            ctx.fillStyle = 'blue';
            ctx.fillText(label, labelX, labelY);

            // Draw the second label
            const additionalTextWidth = ctx.measureText(additionalText).width;
            const additionalTextY = labelY + textHeight + 4; // Position the second label below the first
            ctx.fillStyle = 'white';
            ctx.fillRect(labelX, additionalTextY - textHeight, additionalTextWidth + 4, textHeight + 4);
            ctx.fillStyle = 'blue';
            ctx.fillText(additionalText, labelX, additionalTextY);

            // Draw expression
            const additionalTextExpressionWidth = ctx.measureText(maxExpression).width;
            const additionalExpressionTextY = labelY + textHeight + 20; // Position the second label below the first
            ctx.fillStyle = 'white';
            ctx.fillRect(labelX, additionalExpressionTextY - textHeight, additionalTextExpressionWidth + 4, textHeight + 4);
            ctx.fillStyle = 'blue';
            ctx.fillText(maxExpression, labelX, additionalExpressionTextY);

            // Draw gernder
            const additionalTextGenderWidth = ctx.measureText(detection.gender).width;
            const additionalGenderTextY = labelY + textHeight + 35; // Position the second label below the first
            ctx.fillStyle = 'white';
            ctx.fillRect(labelX, additionalGenderTextY - textHeight, additionalTextGenderWidth + 4, textHeight + 4);
            ctx.fillStyle = 'blue';
            ctx.fillText(detection.gender, labelX, additionalGenderTextY);


            // Draw choosefacedetecto
            const additionalTextTipeDetectionWidth = ctx.measureText(this.settings.choosefacedetecto).width;
            const additionalTypeDetectionChooseTextY = labelY + textHeight + 50; // Position the second label below the first
            ctx.fillStyle = 'white';
            ctx.fillRect(labelX, additionalTypeDetectionChooseTextY - textHeight, additionalTextTipeDetectionWidth + 4, textHeight + 4);
            ctx.fillStyle = 'blue';
            ctx.fillText(this.settings.choosefacedetecto, labelX, additionalTypeDetectionChooseTextY);


             // Draw choosefacedetecto
             const additionalTypeDetectionWidth = ctx.measureText(this.settings.typeDetection).width;
             const additionalTypeDetectionTextY = labelY + textHeight + 65; // Position the second label below the first
             ctx.fillStyle = 'white';
             ctx.fillRect(labelX, additionalTypeDetectionTextY - textHeight, additionalTypeDetectionWidth + 4, textHeight + 4);
             ctx.fillStyle = 'blue';
             ctx.fillText(this.settings.typeDetection, labelX, additionalTypeDetectionTextY);


            // Draw progress bar
            const progressBarX = box.x;
            const progressBarY = box.y + box.height + 10; // Position the progress bar below the box
            const progressBarWidth = box.width;
            const progressBarHeight = 10;
            const progress = detection.detection.score; // Use detection score as the progress (0 to 1)
            this.drawProgressBar(ctx, progressBarX, progressBarY, progressBarWidth, progressBarHeight, progress);

        });
    }

    drawProgressBar(ctx, x, y, width, height, progress) {
        // Draw the background of the progress bar
        ctx.fillStyle = '#cfcacab3';
        ctx.fillRect(x, y, width, height);
    
        // Draw the progress
        ctx.fillStyle = 'green';
        ctx.fillRect(x, y, width * progress, height);
    
        // Draw the border of the progress bar
        ctx.strokeStyle = '#00000004';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, width, height);
    }

    async detectFace({ video = this.video, canvas = this.canvas, settings = this.settings, recursive = false, timeOut= 1000 }) {

        if(this.debug && this.debugEnd == 0) {
            console.log('%c[detectFace]', 'background: blue; color: #fff',{video, canvas, settings, recursive, timeOut});
            this.debugEnd = 1;
        }

        const displaySizeVideo = this.displaySize({element: 'video'});
        const displaySizeCanvas = this.displaySize({element: 'canvas'})
        this.faceapi.matchDimensions(canvas.element, displaySizeCanvas);

        const faceDetectionOptions = this.getFaceDetectionOptions({});
        let result = await this.faceDetectType({methods: settings.methods, type: settings.typeDetection, video: video.element, faceDetectionOptions});
        
        if (result && result.detections && result.detections.length > 0) {
            const resizedResults = this.faceapi.resizeResults( result.detections, displaySizeCanvas);
       
            this.debug && console.log('detectFace',{resizedResults});

            this.drawCustomBox({canvas: canvas.element, resizedResults, action: 'detectFace'});

            // Desenha as detecções, expressões e marcos faciais
            settings.methods.forEach(item => {
                if(item.type === settings.typeDetection || item.type === 'all') {
                    if ( item.draw && typeof this.faceapi.draw[item.draw] === 'function') {
                        this.faceapi.draw[item.draw](canvas.element, resizedResults, 0.5);
                    }
                }
            });

            this.extractFaces({
                video: video.element, 
                detections: result.detections, 
                canvas: this.canvas.canvasmin,
                context: this.canvas.canvasmin.getContext('2d')
            });

            if(result.detections &&  result.detections[0] && this.detectionToUploadJson.length < this.maxFacesToSave+1 &&  result.detections[0].detection.score >this.minDetectionFaceScore) {
                const regionsToExtract = [
                    new this.faceapi.Rect(0, 0, video.element.width, video.element.height)
                ];
                const faceImages = await this.faceapi.extractFaces(video.element, regionsToExtract);
                const faceImage = faceImages[0] || null;
                this.detectionToUploadJson.push(faceImage);
            }

        }

        if (recursive) {
            setTimeout( async () => {
                this.detectionsWebCam = await this.detectFace({video, canvas, settings, recursive, timeOut});
            },timeOut)  
        }
    
        if(  this.detectionToUploadJson.length == this.maxFacesToSave && result.detections && result.detections[0] && result.detections[0].detection.score > this.minDetectionFaceScore) {
            // console.log({detections:this.detectionToUploadJson});
            // await this.saveJsonDetections({detections:this.detectionToUploadJson});
            await this.uploadFacesImage(this.detectionToUploadJson);
        }

        return result
    }

    async loadImages({video}) {
      
        const response = await fetch('/list-uploads'); // Novo endpoint para listar arquivos
        const imagePaths = await response.json();
        this.imagePaths = imagePaths;
        console.log('Carregando imagens...',imagePaths);

        if(this.imagePaths.length < 1) {
            localStorage.removeItem('LastUploadImages');
        }
        return imagePaths
    }

    async extractFaces({video, detections, canvas, context}){
        if(!detections) return null;

        // Limpe o canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        const regionsToExtract = [
            new this.faceapi.Rect(
                detections[0].detection.box.x ,
                detections[0].detection.box.y,
                detections[0].detection.box.width,
                detections[0].detection.box.height
            ),
            // new this.faceapi.Rect(0, 0, video.width, video.height)
        ];

        for (let objDetection of detections) {
            const faceImages = await this.faceapi.extractFaces(video, regionsToExtract);

            if (faceImages.length > 0) {
                const faceImage = faceImages[0]; // Pega a primeira imagem de rosto (se houver mais de uma)
                
                // Verifique se faceImage é um HTMLCanvasElement e se suas dimensões são válidas
                if (faceImage instanceof HTMLCanvasElement && faceImage.width > 0 && faceImage.height > 0) {
       
                    // Defina o tamanho maior para a face extraída
                    const enlargedWidth = faceImage.width * 1.5 ; // Ajuste o fator de aumento conforme necessário
                    const enlargedHeight = faceImage.height * 1.5;

                    // context.drawImage(faceImage, 0, 0, enlargedWidth, enlargedHeight, 0, 0, canvas.width, canvas.height);
                    context.drawImage(faceImage, 0, 0, faceImage.width, faceImage.height, 0, 0, canvas.width, canvas.height);

                    const progressBarX = 4;
                    const progressBarY = 74; // Position the progress bar below the box
                    const progressBarWidth = canvas.width - 6;
                    const progressBarHeight = 4;
                    const progress = this.confimationSimilarity > 100 ? 1 : this.confimationSimilarity * 0.01;//detection.detection.score; // Use detection score as the progress (0 to 1)
                    this.drawProgressBar(context, progressBarX, progressBarY, progressBarWidth, progressBarHeight, progress);

                    // const resizedResults = this.faceapi.resizeResults(objDetection, { width: canvas.width, height: canvas.height } );
                    // faceapi.draw.drawFaceLandmarks(canvas, resizedResults)

                    this.faceCanvasExtracted = faceImage

                } else {
                    console.error('A face extraída não é válida:', faceImage);
                }

                
            }
        }
    }

    async uploadFacesImageFaceCanvasTest(faceDataset, url = '/upload-test') {


        console.log('uploadFacesImageFaceCanvasTest', { faceDataset });
        if (!Array.isArray(faceDataset) || faceDataset.length === 0) {
            console.error('faceDataset must be a non-empty array of canvases');
            return null;
        }
    
        let user = this.userInfo.name ;
        const formData = new FormData();
    
        for (const [index, canvas] of faceDataset.entries()) {
            await new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        formData.append('faces', blob, `${user}.${index}.png`);
                        resolve();
                    } else {
                        reject(new Error('Canvas toBlob failed'));
                    }
                });
            });
        }
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.text();
            this.stopCamera({ video: this.video });
            this.redirection({});

            console.log('UPLOAD RESULT:', result);
        } catch (error) {
            console.error('Error uploading faces:', error);
        }
    }

    redirection({url= this.urlRedirection}) {
        if(url) window.location.href = url;
    }

    async uploadFacesImage(faceDataset, url = '/upload') {


        console.log('uploadFacesImage',{faceDataset});
        if(!faceDataset) return null;
        // verifica se a imagem foi enviada ha menos de 72 horas
        if(localStorage.getItem('LastUploadImages') && new Date().getTime() - localStorage.getItem('LastUploadImages') < 1000 * 60 * 60 * 72) return null;

        let user = this.userInfo.name;
        const formData = new FormData();

        console.log({faceDataset});
        for (const [index, canvas] of faceDataset.entries()) {
            await new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    formData.append('faces', blob, `${user}.${index}.png`);
                    resolve();
                });
            });
        }
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const result = await response.text();
            localStorage.setItem('LastUploadImages', new Date().getTime());
            this.canvasDatasetTest = await this.loadImages({video});
            this.createImgDataset();
        } catch (error) {
            console.error('Error uploading faces:', error);
        }
    }

    saveJsonDetections({detections}){
        
        try {
            const jsonData = detections;

            const payload = {
                userName: this.userInfo.name,
                data: jsonData
            };

            fetch('/save-json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => response.text())
            .then(result => {
                console.log('Result:', result);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } catch (e) {
            console.error('Dados no formato JSON inválido:', e);
        }
    }

    loadDetectJson() {
        const userName = this.userInfo.name;

        const payload = {
            userName: userName
        };

        fetch('/load-json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            
            this.detectionJsonToTest = data;
            console.log(this.detectionJsonToTest);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Erro ao carregar os dados');
        });
    }
}



