
class Tensorflow {
    constructor() {
        this.trainingData = [];
        this.trainingDataSync = [];
        this.labels = [];
        this.labelCounter = 0;
        this.idCam = 0;
        this.model = null;
    }

    async init(idCam = 0) {
        this.idCam = idCam;
        await this.startWebcam();
    }

    async preload() {
        try {
            console.log(tf.engine().registryFactory);

            if (tf.engine().registryFactory['webgpu']) {
                await tf.setBackend('webgpu');
            } else {
                // Fallback to 'webgl' if 'webgpu' is not available
                await tf.setBackend('webgl');
            }

            console.log({ getBackend: await tf.getBackend() });
            await tf.ready();
        } catch (error) {
            console.error("Error during preload:", error);
        }
    }

    async test() {


        // await tf.setBackend('cpu');
        // await tf.ready();
        // console.log({ation: 'test', getBackend: await tf.getBackend() });
        try {
            /*
            const x = tf.tensor2d(
                [
                [0, 0, 0, 1],
                [0, 1, 0, 0],
                [0, 0, 0, 1],
                [1, 0, 0, 0],
                [0, 0, 1, 0]
                ]
            );

            const y = tf.tensor2d(
                [
                [0, 0, 1, 0],
                [0, 1, 0, 0],
                [0, 0, 0, 1],
                [0, 1, 0, 0],
                [0, 1, 0, 0]
                ]
            );

            const precision = tf.metrics.precision(x, y);
            precision.print();

            */
            
            /*
            const xs = tf.tensor1d([0, 1, 2, 3]);
            const ys = tf.tensor1d([1.1, 5.9, 16.8, 33.9]);

            const a = tf.scalar(Math.random()).variable();
            const b = tf.scalar(Math.random()).variable();
            const c = tf.scalar(Math.random()).variable();

            // y = a * x^2 + b * x + c.
            const f = x => a.mul(x.square()).add(b.mul(x)).add(c);
            const loss = (pred, label) => pred.sub(label).square().mean();

            const learningRate = 0.01;
            const optimizer = tf.train.sgd(learningRate);

            // Train the model.
            for (let i = 0; i < 10; i++) {
                optimizer.minimize(() => loss(f(xs), ys));
            }


            // Make predictions.
            console.log(
                `a: ${a.dataSync()}, b: ${b.dataSync()}, c: ${c.dataSync()}`);
            const preds = f(xs).dataSync();
            preds.forEach((pred, i) => {
            console.log(`x: ${i}, pred: ${pred}`);
            });
            */


            /*
            // const a = tf.tensor([1, 2, 3, 4]);
            // a.print();

            // Create a simple model.
            const model = await tf.sequential();

            console.log({ model , a, b, c , f, loss, learningRate, optimizer});

            model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

            // Prepare the model for training: Specify the loss and the optimizer.
            model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
            */



        } catch (error) {
            console.error("Error during test:", error);
        }
    }

    async trainModel(tensorflow1, tensorflow2) {
        console.log({ getBackend: await tf.getBackend() });

        console.log({ tensorflow1, tensorflow2, trainingDataSync: tensorflow1.trainingDataSync });

        // const precision = tf.metrics.precision(tensorflow1, tensorflow2);
        // precision.print();

        
        const trainingDataTensor = tf.stack(tensorflow1.trainingData);
        const labelsTensor = tf.tensor1d(this.labels, 'int32').toFloat(); // Convert labels to float32

        const xsA = tf.stack(tensorflow1.trainingData);
        const xsB = tf.stack(tensorflow2.trainingData);
        const xs = tf.concat([xsA, xsB]);
        const labelsA = tensorflow1.trainingData.map(() => 0);
        const labelsB = tensorflow2.trainingData.map(() => 1);
        const ys = tf.oneHot(tf.tensor1d([...labelsA, ...labelsB], 'int32'), 2);

 

        console.log({xs, ys,  labelsTensor, trainingDataTensor });

        this.model = tf.sequential();
        this.model.add(tf.layers.conv2d({
            inputShape: [320, 240, 3],
            kernelSize: 3,
            filters: 16,
            activation: 'relu'
        }));
        this.model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
        this.model.add(tf.layers.conv2d({
            kernelSize: 3,
            filters: 32,
            activation: 'relu'
        }));
        this.model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

        this.model.add(tf.layers.flatten());
        this.model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));

   

        console.log({ model: this.model });

        this.model.weights.forEach(w => {
            console.log({ name:w.name, shape:w.shape });
        });
        console.log(await this.model.summary());


    

        this.model.compile({
            optimizer: tf.train.sgd(),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });


        function onBatchEnd(batch, logs) {
            console.log('Accuracy', logs.acc);
        }

        await this.model.fit(xs, ys, {
            epochs: 50,
            batchSize: 32,
            callbacks: {onBatchEnd}
        }).then(info => {
            console.log('Final accuracy', info.history.acc);
        });

        console.log('Training complete');

        this.saveModel()

        xsA.dispose();
        xsB.dispose();
        xs.dispose();
        ys.dispose();
 
        /*
        try {
            // Combine training data from both instances
            const combinedTrainingData = tensorflow1.trainingData.concat(tensorflow2.trainingData);
            const combinedLabels = tensorflow1.labels.concat(tensorflow2.labels);

            console.log({ combinedTrainingData, combinedLabels });
           

            if (combinedTrainingData.length == 0) {
                console.log("No training data found.");
                return;
            }
            
            const trainingDataTensor = tf.stack(combinedTrainingData);
            // const labelsTensor = tf.tensor1d(combinedLabels, 'int32');
            const labelsTensor = tf.tensor1d(combinedLabels, 'int32').toFloat(); // Convert labels to float32
          
            this.model = tf.sequential();
         
            this.model.add(tf.layers.conv2d({
                inputShape: [224, 224, 3],
                kernelSize: 3,
                filters: 16,
                activation: 'relu'
            }));
            this.model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
            this.model.add(tf.layers.flatten());
            this.model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
            this.model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
           
            this.model.compile({
                optimizer: 'adam',
                loss: 'sparseCategoricalCrossentropy',
                metrics: ['accuracy']
            });
            
            const history = await this.model.fit(trainingDataTensor, labelsTensor, {
                epochs: 10,
                batchSize: 32,
                validationSplit: 0.2
            });

            console.log('Training complete', history);
        } catch (error) {
            console.error('Error during model training:', error);
        }
        */
    }

    async saveModel() {
        console.log('Salvando modelo...');
        const saveResult = await this.model.save('downloads://my-model');
        // const saveResult = await this.model.save('localstorage://my-model');
        console.log('Modelo salvo:', saveResult);
    }

    async loadModel(event) {

        const modelUpload = document.getElementById('modelUpload');
        const files = modelUpload.files;
        if (files.length > 0) {
            const jsonFile = Array.from(files).find(file => file.name.endsWith('.json'));
            const weightsFiles = Array.from(files).filter(file => file.name.endsWith('.bin'));
            if (jsonFile && weightsFiles.length > 0) {
                const jsonFileReader = new FileReader();
                jsonFileReader.onload = async (event) => {
                    const modelJson = JSON.parse(event.target.result);
                    this.model = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, ...weightsFiles]));
                    console.log('Modelo carregado');
                };
                jsonFileReader.readAsText(jsonFile);
            } else {
                console.error('Por favor, selecione um arquivo .json e um ou mais arquivos .bin');
            }
        }

        // this.model = await tf.loadLayersModel('localstorage://my-model');
        console.log('Modelo carregado');
    }

    async captureWebCam({cam, loop = false}) {
        try {
            console.log({ getBackend: await tf.getBackend() });
            await tf.setBackend('cpu');
            await tf.ready();
            console.log({ getBackend: await tf.getBackend() });

            const img = await cam.capture();
       
            console.log({ img, shape: img.shape });
            console.log({arraySync: await img.arraySync()});
            console.log({dataSync: img.dataSync()});

            this.trainingDataSync.push(img.dataSync());

            img.print();

            this.displayImage(img);

            // Store the resized and normalized image for training
            const resizedImg = tf.image.resizeBilinear(img, [320, 240]);
            console.log({resizedImg});
            const normalizedImg = resizedImg.div(255);
            console.log({normalizedImg});
            this.trainingData.push(normalizedImg);
            this.labels.push(this.labelCounter);
    
            img.dispose();
            console.log({memory: await tf.memory()});
            this.labelCounter++;
        } catch (error) {
            console.error("Error during captureWebCam:", error);
        }
    }

    async createClassifyButton() {
        
        let classifyButton = document.getElementById('classify-button');
        if (!classifyButton) {
            classifyButton = document.createElement('button');
            classifyButton.id = 'classify-button';
            classifyButton.innerText = 'Classify Image';
            classifyButton.style.width = '100%';
            classifyButton.style.height = '37px';
            document.body.appendChild(classifyButton);
        }

        classifyButton.onclick = async (event) => {
            this.loadModel(event)
            console.log('click classifyButton');
            await this.classifyImage2();
        }
    }

    displayImage(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.shape[1];
        canvas.height = img.shape[0];
        const ctx = canvas.getContext('2d');

        const imageDataArray = new Uint8ClampedArray(img.dataSync().length * 4 / 3);
        for (let i = 0, j = 0; i < img.dataSync().length; i += 3, j += 4) {
            imageDataArray[j] = img.dataSync()[i];
            imageDataArray[j + 1] = img.dataSync()[i + 1];
            imageDataArray[j + 2] = img.dataSync()[i + 2];
            imageDataArray[j + 3] = 255; // alpha channel
        }

        const imageData = new ImageData(imageDataArray, img.shape[1], img.shape[0]);
        ctx.putImageData(imageData, 0, 0);
        this.addPreview(canvas.toDataURL());
    }

    async createUI() {
        let root = document.getElementById('root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'root';
        }

        const container = this.createContainer();
        const videoElement = this.createVideoElement();
        const containerVideo = this.createContainerVideo(videoElement);
        const previewContainer = this.createPreviewContainer();

        container.appendChild(previewContainer);
        container.appendChild(containerVideo);
        root.appendChild(container);
        document.body.appendChild(root);

        console.log('createUI', container);
        return { container, videoElement, containerVideo };
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = `container-${this.idCam}`;
        container.style.display = 'flex';
        container.style.width = '600px';
        return container;
    }

    createVideoElement() {
        const videoElement = document.createElement('video');
        videoElement.id = `video-${this.idCam}`;
        videoElement.width = 320;
        videoElement.height = 240;
        videoElement.autoplay = true;
        return videoElement;
    }

    createContainerVideo(videoElement) {
        const containerVideo = document.createElement('div');
        containerVideo.id = `container-video-${this.idCam}`;
        containerVideo.style.display = 'flex';
        containerVideo.style.flexDirection = 'column-reverse';
        containerVideo.style.alignItems = 'center';
        containerVideo.style.width = `${videoElement.width}px`;
        containerVideo.style.padding = '18px';
        containerVideo.style.border = "solid 1px #000";
        containerVideo.style.gap = "17px";
        containerVideo.style.position = 'relative';

        const recordButton = this.createRecordButton();
        containerVideo.appendChild(videoElement);
        containerVideo.appendChild(recordButton);

        return containerVideo;
    }

    createPreviewContainer() {
        const previewContainer = document.createElement('div');
        previewContainer.id = `preview-container-${this.idCam}`;
        previewContainer.className = 'preview-container';
        previewContainer.style.width = '120px';
        previewContainer.style.minHeight = '100%';
        previewContainer.style.maxHeight = '295px'; // Adjust based on video height
        previewContainer.style.overflowX = 'hidden';
        previewContainer.style.padding = '18px';
        previewContainer.style.border = 'solid 1px #000';
        previewContainer.style.overflowY = 'scroll';
        return previewContainer;
    }

    async addPreview(dataUrl) {
        const previewContainer = document.getElementById(`preview-container-${this.idCam}`);
        const imgElement = document.createElement('img');
        imgElement.style.borderRadius = '6px';
        imgElement.src = dataUrl;
        imgElement.className = 'preview';
        previewContainer.appendChild(imgElement);
    }

    createRecordButton() {
        const recordButton = document.createElement('button');
        recordButton.id = `record-button-${this.idCam}`;
        recordButton.innerText = 'Hold to Record';
        recordButton.style.width = '100%';
        recordButton.style.height = '37px';
        recordButton.addEventListener('mousedown', () => this.startRecording(recordButton));
        return recordButton;
    }

    startRecording(recordButton) {
        const intervalId = setInterval(async () => {
            await this.captureWebCam({ cam: this.cam });
        }, 200);

        const stopRecording = async () => {
            await tf.setBackend('webgl');
            await tf.ready();
            clearInterval(intervalId);
        };

        recordButton.addEventListener('mouseup', stopRecording, { once: true });
        recordButton.addEventListener('mouseleave', stopRecording, { once: true });
    }

    async createTrainButton(tensorflow1, tensorflow2) {
        let trainButton = document.getElementById('train-button');
        if (!trainButton) {
            trainButton = document.createElement('button');
            trainButton.id = 'train-button';
            trainButton.innerText = 'Train Model';
            trainButton.style.width = '100%';
            trainButton.style.height = '37px';
            document.body.appendChild(trainButton);
        }

        trainButton.onclick = async () => {
            // await tensorflow1.train();
            // await tensorflow2.train();
      
            console.log('click createTrainButton');
            
            await this.trainModel(tensorflow1, tensorflow2);
            // Add your training logic here
        
        };
    }

    async classifyImage() {
        try {
            await tf.setBackend('cpu');
            await tf.ready();
            const img = await this.cam.capture();
            const resizedImg = tf.image.resizeBilinear(img, [320, 240]);
            const normalizedImg = resizedImg.div(255).expandDims(0); // Add batch dimension
            const prediction = this.model.predict(normalizedImg);
            console.log({prediction});
            const predictedClass = prediction.argMax(-1).dataSync()[0];
            console.log({ predictedClass });

            console.log(`Predicted class: ${predictedClass}`);

            img.dispose();
            resizedImg.dispose();
            normalizedImg.dispose();
        } catch (error) {
            console.error('Error during image classification:', error);
        }
    }

    async classifyImage2() {
        console.log('click classifyImage2');
        await tf.setBackend('cpu');
        await tf.ready();
        const img = await this.cam.capture();
        const resizedImg = tf.image.resizeBilinear(img, [320, 240]);
        const normalizedImg = resizedImg.div(tf.scalar(255)).expandDims();
        const predictions = this.model.predict(normalizedImg);
        console.log({ predictions });
        predictions.print();  // Imprimir as previsões no console

        img.dispose();
    }
    async startWebcam() {
        const { videoElement, containerVideo } = await this.createUI();
        this.cam = await tf.data.webcam(videoElement);
        console.log({ cam: this.cam });

        // await this.createTrainButton();
        await this.test();
    }
}