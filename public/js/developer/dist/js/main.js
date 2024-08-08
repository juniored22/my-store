import { Video } from '../provider/Video/Video.js';
import { Oculus } from '../provider/Oculus/oculus.js';
import { Game } from '../provider/Game/game.js';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
    //   navigator.serviceWorker.register('/oculus-service-worker.js').then(function(registration) {
    //     console.log('Service Worker registered with scope:', registration.scope);
    //   }, function(error) {
    //     console.log('Service Worker registration failed:', error);
    //   });
    });
}

const videoConstructor = new Video();

videoConstructor.createVideoAndCanvas('.vr-container', videoConstructor.video, videoConstructor.canvas)
.then(async (videoInstance) => {
    console.log('%c[Video]', 'background: #222; color: #bada55', {videoInstance});

    await videoInstance.setupCamera({}, async () => {


        console.log('%c[Video][setupCamera] [callback]', 'background: #222; color: #bada55', {videoInstance});

        videoInstance.observerVideo('endProcess', async()=>{
            console.log('%c[Video][observerVideo][callback][endProcess]', 'background: #222; color: #bada55', {videoInstance});

            const { canvas, context } = await videoInstance.canvasBackground({})
            const eyeLeft = videoInstance.video.element;
            const eyeRight = videoInstance.canvas.element;
            eyeLeft.classList.add('eye_left');
            eyeRight.classList.add('eye_right');
            const oculusOptions = {
                videoInstance: videoInstance,
                eyeLeft: {
                    element:eyeLeft,
                    offsetX: -60,
                    offsetY: -100,
                }, 
                eyeRight:{
                    element:eyeRight,
                    offsetX: 0,
                    offsetY: -100,
                },
                frameCanvasRight:{
                  element: videoInstance.canvas.element,
                },
                frameCanvasLeft:{
                  element: videoInstance.canvas.element2
                },
                detectHand: true,
                detectHandWorker: false,
                model: "GAME", // NORMAL, GAME, VR
            };

            console.log('%c[Oculus]', 'background: blue; color: #fff', {oculusOptions});
            const oculus = new Oculus(oculusOptions, videoInstance.options);
            oculus.init(null, ()=>{
                // const gameOptions = {
                //     canvasR: videoInstance.canvas.element2,
                //     canvasL: videoInstance.canvas.canvasmin,
                // }
                
                // if(oculusOptions.model == "GAME"){
                //     const game = new Game(gameOptions, oculusOptions, videoInstance.options);
                //     game.init({oculus});
                // }
            });

                
            // function drawVideoToCanvas() {

            //     // if(oculusOptions.model == "NORMAL" || oculusOptions.model == "VR"){
            //     //     // canvas overlay
            //     //     context.drawImage(videoInstance.video.element, 0, 0, videoInstance.canvas.element.width, videoInstance.canvas.element.height);
            //     // }
                
            //     requestAnimationFrame(drawVideoToCanvas);
            // }

            // requestAnimationFrame(drawVideoToCanvas);
            
        });



    });

})
.catch(error => {
    console.error('Erro 501',error);
    alert(error);
});
