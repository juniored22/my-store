
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/oculus-service-worker.js').then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      }, function(error) {
        console.log('Service Worker registration failed:', error);
      });
    });
  }


  class Oculus{
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

    constructor(oculus, {options} =  this.options){

        this.worker = new Worker('handposeWorker.js');
        this.worker.onmessage = (e) => {
            this.handsAnalyse = e.data;
            console.log('Hand analysis result:', this.handsAnalyse);
          };

        this.eyeLeft = oculus.eyeLeft.element;
        this.eyeRight = oculus.eyeRight.element;

        this.eyeLeft.style.position = 'relative';
        this.eyeRight.style.position = 'relative';
        this.eyeLeft.style.left = `${oculus.eyeLeft.offsetX}px`;
        this.eyeLeft.style.top = `${oculus.eyeLeft.offsetY}px`;
        this.eyeRight.style.left = `${oculus.eyeRight.offsetX}px`;
        this.eyeRight.style.top = `${oculus.eyeRight.offsetY}px`;

        oculus.frameCanvas.element.style.position = 'absolute';
        oculus.frameCanvas.element.style.left = `${oculus.eyeRight.offsetX}px`;
        oculus.frameCanvas.element.style.top = `${oculus.eyeRight.offsetY}px`;
        oculus.frameCanvas.element.style.zIndex = '2';

        this.options = options;
        this.frame = this.context = oculus.frameCanvas.element
        this.context = oculus.frameCanvas.element.getContext('2d');
        this.handPose = null;
        this.handsAnalyse = [];

        

      this.setDetectHand();
    }

    async setDetectHand() {

    
    
    this.handPose = await ml5.handPose({
        maxHands: 4,
        flipped: false,
        runtime: "mediapipe", //mediapipe, tfjs
        modelType: "full", //lite, full
        detectorModelUrl: undefined, //default to use the tf.hub model
        landmarkModelUrl: undefined, //default to use the tf.hub model
        }, () => {
        console.log("model handPose loaded", this.handPose);
        console.log(ml5.tf.engine().registryFactory);
        ml5.tf.setBackend("webgl");
        ml5.tf.ready().then(() => {
            console.log({ getBackend:  ml5.tf.getBackend() });
        })


        this.detectHand()   
    });

    // setTimeout(() => this.detectHand(), 5000);
    }


    async detectHand(){
        console.log('!!!! detectHand');
        if(this.handPose){
            console.log({handPose: this.handPose});
            // this.handPose.detectStart(this.eyeLeft, (r) =>  this.handsAnalyse = r)
        
            // this.worker.postMessage({
            //     imageData: this.imageData
            // });

            this.worker.postMessage({
                eyeLeft: this.eyeLeft,
                handPose: this.handPose
            });
        }
            
        this.draw()

        // setTimeout(() => this.detectHand(), 2);

    
    }

    draw( ){

      
        if(this && typeof this.handsAnalyse !== 'undefined') {
            // console.log(this.handsAnalyse);
            // Limpar o canvas
            this.context.clearRect(0, 0, this.frame.width, this.frame.height);
            this.context.drawImage(this.frame, 0, 0, this.frame.width, this.frame.height);

            // Draw all the tracked hand points
            for (let i = 0; i < this.handsAnalyse.length; i++) {
                let hand = this.handsAnalyse[i];
                for (let j = 0; j < hand.keypoints.length; j++) {
                    let keypoint = hand.keypoints[j];
                    this.context.fillStyle = 'rgb(0, 255, 0)';
                    this.context.beginPath();
                    this.context.arc(keypoint.x, keypoint.y, 10, 0, 2 * Math.PI);
                    this.context.fill();
                }
            }
        };

    
        requestAnimationFrame(()=> this.draw() );
    
    }

  }

  const videoConstructor = new Video();
  videoConstructor.createVideoAndCanvas('.vr-container', videoConstructor.video, videoConstructor.canvas)
  .then(async () => {
      await videoConstructor.setupCamera({}, async () => {
          const { canvas, context } = await videoConstructor.canvasBackground({})
          console.log({canvas, context, videoConstructor});

          function drawVideoToCanvas() {

            context.drawImage(videoConstructor.video.element, 0, 0, videoConstructor.canvas.element.width, videoConstructor.canvas.element.height);
            // this.imageData = context.getImageData(0, 0, videoConstructor.canvas.element.width, videoConstructor.canvas.element.height);

            requestAnimationFrame(drawVideoToCanvas);
          }

          requestAnimationFrame(drawVideoToCanvas);
      });
  })
  .catch(error => {
      console.error('Erro 501',error);
      alert(error);
  });

  const eyeLeft = videoConstructor.video.element;
  const eyeRight = videoConstructor.canvas.element;
  eyeLeft.classList.add('eye_left');
  eyeRight.classList.add('eye_right');

  const oculusOptions = {
      eyeLeft: {
          element:eyeLeft,
          offsetX: 80,
          offsetY: -100,
      }, 
      eyeRight:{
          element:eyeRight,
          offsetX:-50,
          offsetY: -100,
      },
      frameCanvas:{
        element: videoConstructor.canvas.canvasmin,
      }
    
  };

  const oculus = new Oculus(oculusOptions,{});
