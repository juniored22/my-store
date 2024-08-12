
class CustomMapStyle {

    
    constructor() {
        this.mapTypeIds = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    }


    styleDark() {
        return [
            {
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#212121"
                }
              ]
            },
            {
              "elementType": "labels.icon",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "#212121"
                }
              ]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "featureType": "administrative.country",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#9e9e9e"
                }
              ]
            },
            {
              "featureType": "administrative.land_parcel",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "featureType": "administrative.locality",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#bdbdbd"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#181818"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#616161"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "#1b1b1b"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry.fill",
              "stylers": [
                {
                  "color": "#2c2c2c"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#8a8a8a",
                }
              ]
            },
            {
              "featureType": "road.arterial",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#373737"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#3c3c3c"
                }
              ]
            },
            {
              "featureType": "road.highway.controlled_access",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#4e4e4e"
                }
              ]
            },
            {
              "featureType": "road.local",
              "elementType": "labels",
              "stylers": [
                {
                    "visibility": "off"
                }
              ]
            },
            {
              "featureType": "transit",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#0000FF"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#2196f3"//"#3d3d3d"
                }
              ]
            }
        ];
    }
}



class ScrallingCameras {


    urls = [
        {
            id: 1,
            src: 'https://www.ecovias.com.br/boletim/camera/',
            name: 'ecovias',
            ref: 'https://www.transitoaovivo.com/2024/04/mais-cameras-ao-vivo.html',
            args: [],
            webcams:[
                {
                    arg: 1,
                    type: 'image',
                    description: 'Km 55 - Trevo Cubatão',
                },
                {
                    arg: 4,
                    type: 'image',
                    description: 'Km 32 - Pedágio',
                },
                {
                    arg: 2,
                    type: 'image',
                    description: 'Km 28 - Planalto',
                },
                {
                    arg: 6,
                    type: 'image',
                    description: 'km 48 - Trecho de Serra',
                },
                {
                    arg: 9,
                    type: 'image',
                    description: 'Km 250 - Pedágio Guarujá',
                },
                {
                    arg: 10,
                    type: 'image',
                    description: 'Pedágio São Vicente',
                },
                {
                    arg: 13,
                    type: 'image',
                    description: 'Km 23 - Trevo Volkswagen',
                },
                {
                    arg: 14,
                    type: 'image',
                    description: 'Km 31 - Pedágio',
                }

                
            ]
        },
        {
            id: 2,
            src: 'https://www.der.sp.gov.br/Upload/Cameras/',
            name: 'der.sp',
            args: [],
            webcams:[
                {
                    arg: 'CamSP055km110S1.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 110 - Ubatuba ➜ Caraguatatuba',
                },
                {
                    arg: 'CamSP055km246S1.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 246 - Bertioga ➜ Bertioga',
                },
                {
                    arg: 'CamSP055km292S2.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 246 - Bertioga ➜ Bertioga',
                },
                {
                    arg: 'CamSP055km311S1.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 311 - Mongaguá ➜ Praia Grande',
                },
                {
                    arg: 'CamSP055km337S1.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 337 - Itanhaém ➜ São Paulo',
                },
                {
                    arg: 'CamSP270km010S1.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 10 - São Paulo ➜ São Paulo',
                },
                {
                    arg: 'CamSP270km020S1.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 20 - Cotia ➜ São Paulo',
                },
                {
                    arg: 'CamSP098km063S1.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 63 - Mogi das Cruzes ➜ Litoral',
                },
                {
                    arg: 'CamSP098KM098S1.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 98 - Bertioga ➜ Mogi das Cruzes',
                },
                {
                    arg: 'CamSP088km045S1.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 45,5 - Mogi das Cruzes ➜ Mogi das Cruzes',
                },
                {
                    arg: 'CamSP123km046S1.jpg?',
                    type: 'image',
                    format: 'jpg',
                    description: 'Km 46 - Campos do Jordão ➜ Campos do Jordão',
                },
            ]
        },
        {
            id: 3,
            src: 'https://egov.santos.sp.gov.br/santosmapeada/css/img/cameras/',
            name: 'egov.santos',
            ref: 'https://egov.santos.sp.gov.br/santosmapeada/Gestao/Cameras/MapaCamera/',
            args: [
                timestamp => new Date().getTime(),
            ],
            webcams:[
                {
                    arg: 'cam1529/snap_c1.jpg?1723254170620',
                    type: 'image',
                    description: 'Av. Pres. Wilson',
                },
                {
                    arg: 'cam1659/snap_c1.jpg?1723254563178',
                    type: 'image',
                    description: 'Av. Pres. Wilson',
                },
                {
                    arg: 'cam1553/snap_c1.jpg?1723254787210',
                    type: 'image',
                    description: 'Av. Pres. Wilson',
                },
                {
                    arg: 'cam1565/snap_c1.jpg?1723254919711',
                    type: 'image',
                    description: 'Av. Pres. Wilson',
                }
            ]
        }

        
    ];
    constructor() {
        
    }

    buildUrl({key, value}) {
        var url = this.urls.find(url => url[key] === value);

        return url.src + url.args;
    }

    getImageUrl() {
        fetch(this.buildUrl({key:'name', value: 'ecovias'}))
        .then(res => res.blob())
        .then(blob => {
            console.log(blob);
        })
    }

}


class CustomMap  {
    markers = [];
    constructor() {
        this.zoom               = 8;
        // this.mapId              = '';
        this.center             = { lat: -34.397, lng: 150.644 };
        this.mapTypeId          = 'roadmap'; //roadmap, hybrid, terrain or satellite
        this.streetViewControl  = true;
        this.mapTypeControl     = true;
        this.disableDefaultUI   = false;
        this.heading            = 320;
        this.tilt               = 47.5;
        this.customMapStyle     = new CustomMapStyle();
        this.scrallingCameras   = new ScrallingCameras();
        this.animationInterval = null;
        this.markerAlvo = [];

    }

    async init() {
        console.log('Map Initialized');
   
        const div = document.createElement('div');
        div.id = 'map';
        div.style = 'height: 100vh; width: 100vw;';
        document.body.appendChild(div);

        await this.createMap({zoom: 20});
  
        return this;
    }

    async createMap({ 
        mapId = this.mapId, 
        center = this.center, 
        zoom = this.zoom, 
        mapTypeId = this.mapTypeId,
        streetViewControl  = this.streetViewControl,
        mapTypeControl     = this.mapTypeControl,
        disableDefaultUI   = this.disableDefaultUI,
        heading            = this.heading,
        tilt               = this.tilt,
    } = {}) {
        
        console.log('Map Created');
        var map = null;
       
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          draggable: true,
          suppressMarkers: true,
          preserveViewport: true,
          polylineOptions: {
              strokeColor: '#FF0000', // Cor da linha (vermelho)
              strokeOpacity: 0.1,     // Opacidade da linha
              strokeWeight: 5         // Espessura da linha
          }
        });

        this.directionsService = directionsService;
        this.directionsRenderer = directionsRenderer;

        // mapId or cmap normal style custom
        if(this.mapId){
            map = new Map(document.getElementById("map"), {
                center,
                zoom,
                mapId,
                mapTypeId,
                streetViewControl,
                mapTypeControl,
                disableDefaultUI,
                heading,
                tilt,
            });
        }else{
            map = new google.maps.Map(document.getElementById('map'), {
                center,
                zoom
            });

            if(this.customMapStyle) {
                let arrayStyles = this.customMapStyle.styleDark();
                map.setOptions({ styles: arrayStyles })
            };
        }

        await this.permission({ map, AdvancedMarkerElement, callback:({map, position, marker}) => {
              console.log({Map:this})
              this.events({map: this.map, marker: this.marker});
          } 
        });

        this.map = map;
        return { map, AdvancedMarkerElement };
    
    }
  
    async permission({ map, AdvancedMarkerElement, callback }) {
      console.log('permission');
      var marker = null;
      var currentPosition = null;

      // Solicita a localização do usuário
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition( async (position) => {
            
              currentPosition = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
              };
              

              // Centraliza o mapa
              map.setCenter(currentPosition);

              let nearestRoad = await this.mapNearestRoad(currentPosition, map);
              marker = await this.createMarker({map, position: nearestRoad, AdvancedMarkerElement});
              let {divMarker, overlay} = await this.createCustomMarker({map, position: nearestRoad, urlImg: marker.iconUrlCutom});
              marker['__descurption'] = 'Meu marcador';
              marker['__divMarker'] = divMarker;
              marker['__currentPosition'] = nearestRoad;
              marker['__overlay'] = overlay;
              this.marker = marker;
     
              if(typeof callback === 'function') callback({map, position: nearestRoad, marker: marker});
      

          }, function () {
              handleLocationError(true, map.getCenter());
          });
      } else {
          // O navegador não suporta geolocalização
          handleLocationError(false, map.getCenter());
      }

      return {position: currentPosition, marker: marker};
    }

    async createMarker({map = this.map, position, AdvancedMarkerElement, size = {x: 32, y: 32}, urlIcon = 'https://maps.gstatic.com/mapfiles/transparent.png', iconUrlCutom = './img/resorce-map/sold.png', icon=null} = {}, callback) {
      var marker = null;

      let newIcon =  {
          url: urlIcon,
          scaledSize: new google.maps.Size(size.x, size.y),
          // origin: new google.maps.Point(0, 0),
          // anchor: new google.maps.Point(0, 0)
      }

      // Define o ícone do marcador mapId or cmap normal style custom
      if(this.mapId) {
          marker = new AdvancedMarkerElement({
              position,
              map: map,
              title: 'Você está aqui!'
          });      
      }else{
          marker = new google.maps.Marker({
              position,
              map: map,
              title: 'Você está aqui!',
              iconUrlCutom,
              icon: icon || newIcon
          });
      }

      this.markers.push(marker);
      if(typeof callback === 'function') callback({map, marker});
      return marker;
    }

    createCustomMarker({position, map, urlImg}) {
      var div = document.createElement('div');
      div.className = 'marker-icon';
      div.style.position = "absolute"; // Isso é crucial para fixar o marcador
      div.style.backgroundImage = 'url(' + urlImg + ')';

      var overlay = new google.maps.OverlayView();

      overlay.position = position;
      overlay.onAdd = function () {
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
      };
      overlay.draw = function () {
        var overlayProjection = this.getProjection();
        var pos = overlayProjection.fromLatLngToDivPixel(overlay.position);
        div.style.left = pos.x - 29 + 'px';
        div.style.top = pos.y - 15 + 'px';

      };
      overlay.onRemove = function () {
        div.parentNode.removeChild(div);
      };
      overlay.setMap(map);

      return {divMarker: div, overlay: overlay};
    }

    updateDivMarkerPosition({marker = this.marker, position, overlay}) {

      const overlayProjection = overlay.getProjection();
      const pixelPosition = overlayProjection.fromLatLngToDivPixel(position);
    
      // Verifique se o __divMarker existe antes de atualizá-lo
      if (marker['__divMarker']) { 
          marker['__overlay'].position = position;
      }
    }

    directionRoute({ map = this.map, marker = this.marker, directionsService = this.directionsService, directionsRenderer = this.directionsRenderer, start, end }) {
        console.log('directionRoute');

        // Parar a animação atual
        if (this.animationInterval) {
          clearTimeout(this.animationInterval);
        }

        directionsRenderer.setMap(map);

        directionsService.route(
          {
              origin: start,
              destination: end,
              travelMode: google.maps.TravelMode.WALKING // Pode ser DRIVING, WALKING, BICYCLING, TRANSIT
          },
          (response, status) => {
              if (status === google.maps.DirectionsStatus.OK) {
                  directionsRenderer.setDirections(response);

                  const route = response.routes[0].overview_path;
                  const totalDuration = response.routes[0].legs[0].duration.value; // em segundos
                  const angle = this.calculateAngle(end, start);

                  this.marker['__divMarker'].style.transform = 'rotate(' + angle + 'deg)';
                  this.animateMarker({route,  marker: this.marker, totalDuration});
              
              } else {
                  window.alert('Directions request failed due to ' + status);
              }
          }
        );

    }

    async animateMarker({route, marker = this.marker, map = this.map, totalDuration}) {
      let i = 0;
      let progress = 0;
      const numSteps = 100; // Número de passos para interpolar entre os pontos
      const timePerStep = (totalDuration * 1000) / numSteps; // Tempo de cada passo
      const overlay = new google.maps.OverlayView();// Criar um OverlayView para acessar a projeção

      overlay.onAdd = function() {};
      overlay.draw = function() {};
      overlay.setMap(map); // Associar ao mapa

      const moveMarker = async () => {
          if (i < route.length - 1) {
              const nextPosition = route[i + 1];

              // Calcular a posição interpolada
              const lat = google.maps.geometry.spherical.interpolate(route[i], nextPosition, progress / numSteps).lat();
              const lng = google.maps.geometry.spherical.interpolate(route[i], nextPosition, progress / numSteps).lng();

              // Calcular o ângulo de rotação para o próximo ponto
              const heading = google.maps.geometry.spherical.computeHeading(route[i], nextPosition);
              const angle = this.calculateAngle({ lat, lng }, { lat: marker['__currentPosition'].lat, lng: marker['__currentPosition'].lng });
              const newPosition = new google.maps.LatLng(lat, lng);// Criar um objeto LatLng para a nova posição
              marker.setPosition(newPosition);// Atualizar a posição e rotação do marcador
              await this.updateDivMarkerPosition({marker, position: newPosition, overlay});
   
              console.log({length: this.markerAlvo.length});
              
              if(this.markerAlvo.length <= 0){ 
                marker['__divMarker'].style.transform = 'rotate(' + angle + 'deg)';
                debugger
              }else{
                

              }
           
              marker.setIcon({
                  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, // Seta indicando direção
                  scale: 2,
                  fillColor: '#0000FF',
                  fillOpacity: 0.5,
                  strokeWeight: 1,
                  rotation: heading, // Aplica a rotação calculada
              });

              // Avançar na interpolação
              progress++;

              if (progress >= numSteps) {
                  progress = 0; // Reiniciar para o próximo segmento
                  i++;
              }

              marker['__currentPosition']  = { lat: lat, lng: lng }; // Atualizar a posição atual


              this.animationInterval = setTimeout( await moveMarker, timePerStep); // Próximo passo
          } else {
              const finalPosition = route[route.length - 1];
              marker.setPosition(finalPosition); // Posição final
              marker['__currentPosition']  = finalPosition; // Atualizar a posição atual para a posição final
              this.updateDivMarkerPosition({marker, position: finalPosition, overlay}); // Atualizar a posição do divMarker na posição final
              map.panTo(finalPosition); // Pan para a posição final
              // map.panTo(new google.maps.LatLng(marker['__currentPosition'].lat, marker['__currentPosition'].lng)); // // Pan to the final position
          }
      }
      await moveMarker();
  }

    async mapNearestRoad(location, map) {
      const roadService = new google.maps.places.PlacesService(map);
      let nearestRoad = null;
      
      return new Promise((resolve, reject) => {
          roadService.nearbySearch({
              location: location,
              radius: 50, // Raio para buscar estradas próximas
              types: ['route'] // Tipo de lugar: estradas/rotas
          }, (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                  nearestRoad = results[0].geometry.location;
                  resolve({
                      lat: nearestRoad.lat(),
                      lng: nearestRoad.lng()
                  });
              } else {
                  alert('Não foi possível encontrar uma rua próxima.');
                  nearestRoad = null;
              }
          });
      })
    }

    async zoomDinamic({map = this.map, zoom= this.map.getZoom(), marker = this.marker} = {}) {
        console.log('zoomDinamic', zoom);
        
        // Define os ícones para diferentes níveis de zoom
        const iconZoom = {
            url: "./img/resorce-map/sold.png", // Ícone para zoom baixo
            scaledSize: new google.maps.Size(32, 32), // Tamanho do ícone
        };

        if(zoom < 20) {
          marker['__divMarker'].classList.add('hidden');
          iconZoom.url = "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3.png";	
          iconZoom.scaledSize = new google.maps.Size(40, 48);
        }else{
          marker['__divMarker'].classList.remove('hidden');
          iconZoom.url = "https://maps.gstatic.com/mapfiles/transparent.png";
          iconZoom.scaledSize = new google.maps.Size(32, 32);
        }
    
        return iconZoom;
    }

    async rotationMarker({map = this.map, marker = this.marker} = {}) {
        console.log('rotationMarker');
        marker['__divMarker'].style.transform = 'rotate(45deg)';
    }

    calculateAngle(start, end) {
      const dy = end.lat - start.lat;
      const dx = end.lng - start.lng;
      const theta = Math.atan2(dy, dx); // Radianos
      let angle = theta * (180 / Math.PI); // Convertendo para graus
      // Inverter o sentido de frente e costas
      // Inverter o ângulo para corrigir frente e costas
      angle = (angle + 360) % 360; // Normalizar o ângulo para estar entre 0 e 360 graus
    
      // Inverter o ângulo horizontal (direita/esquerda) ao subtrair o ângulo de 360
      angle = (360 - angle) % 360;
      return angle ;
    }

    async checkIfClickOnRoad({latLng, map = this.map} = {}, callback) {
        const roadService = new google.maps.places.PlacesService(map);
    
        // Pesquisar por estradas próximas do ponto clicado
        roadService.nearbySearch({
            location: latLng,
            radius: 5, // Raio pequeno para garantir que é muito próximo de uma estrada
            types: ['route'] // Tipo de lugar: estradas/rotas
        }, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Se o clique estiver numa estrada
                // alert('Você clicou em uma rua!');
                if(typeof callback === 'function') callback({status, results, valid: true});
            } else {
                if(typeof callback === 'function') callback({status, results, valid: false});
                // Se o clique não estiver numa estrada
                // alert('Por favor, clique apenas em ruas.');
            }
        });
    }

     // Função para criar um ícone rotacionado
    createRotatedIcon({degrees, map = this.map, marker = this.marker}) {
        const canvas = document.createElement("canvas");
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        // Carrega a imagem do ícone
        const img = new Image();
        const icon = marker.getIcon();
        img.src = icon.url; // Substitua pelo caminho do seu ícone


        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.rotate((degrees * Math.PI) / 180);
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            ctx.restore();

            // Define o ícone do marcador
            marker.setIcon(canvas.toDataURL());
        };
    }

    updateAngleMarker({map = this.map, marker = this.marker, angle} = {}) {
        console.log('updateAngleMarker');
        marker['__divMarker'].style.transform = 'rotate(' + angle + 'deg)';
        marker['__angleMarker'] = angle;
    }

    async events({map = this.map, marker = this.marker} = {}) {
        console.log('Events');

        if(map){

            map.addListener('click', async (event) => {
                console.log(event);

                let positionMarker  = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
                let destinationMarker = { lat: event.latLng.lat(),lng: event.latLng.lng() };

                let angleMarker = this.calculateAngle(destinationMarker, positionMarker);
                this.updateAngleMarker({map, marker, angle: angleMarker});

                const markerDescription  = await this.createMarker({
                
                    position: event.latLng,
                    size: {x: 32, y: 32},
                    iconUrlCutom: './img/resorce-map/sold.png',
                    urlIcon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    icon: {
                      // path: google.maps.SymbolPath.CIRCLE,
                      url: './img/resorce-map/Mira/1.png',
                      scaledSize: new google.maps.Size(15, 15), // Tamanho do círculo
                      // scale: 3, // Tamanho do círculo
                      // fillColor: '#005bb2', // Cor azul
                      // fillOpacity: 1, // Opacidade do preenchimento
                      // strokeWeight: 0, // Sem borda
                      // rotation: angleMarker, // Rotação aplicada
                    }
                });

                this.checkIfClickOnRoad({latLng: event.latLng, map}, ({status, results, valid})=>{
                  if(!valid){
                    markerDescription.setMap(null);
                    return false;
                  }

                  markerDescription.refIndex = this.markerAlvo.length,
                  this.markerAlvo.push(markerDescription);

                  setTimeout(() => {
                    markerDescription.setMap(null);
                    let pop = this.markerAlvo.filter((item)=>item.refIndex == this.markerAlvo.length - 1)
                    this.markerAlvo.splice(this.markerAlvo.indexOf(pop[0]), 1);
                    
            
                  }, 3000);

                });
        
            });

            map.addListener('rightclick', (event) => {
                console.log(event);

                let start = {lat: marker.getPosition().lat(),lng: marker.getPosition().lng()};
                let end = {lat: event.latLng.lat(),lng: event.latLng.lng(),};

                this.directionRoute({ marker,  start, end })
                  
            });

            map.addListener('dblclick', (event) => {
                // console.log(event);
            });

            map.addListener('mousemove', (event) => {
                // console.log(event);
            });

            map.addListener('mouseout', (event) => {
                // console.log(event);
            });

            map.addListener('mouseover', (event) => {
                // console.log(event);
            });

            map.addListener('mouseup', (event) => {
                // console.log(event);
            });

            map.addListener('mousedown', (event) => {
                // console.log(event);
            });

            // Adiciona um listener para o evento de mudança de zoom
            map.addListener("zoom_changed",  async ()  => {
              console.log('zoom_changed');
              // Atualiza o ícone do marcador com base no nível de zoom
              let icon = await this.zoomDinamic({});
              marker.setIcon(icon);
              // this.rotationMarker({map, marker});
            });
        }

        return;
    }
}

const map = new CustomMap ()
map.init()




