class FacebookAuth {
    constructor(appId) {
      this.appId = appId;
      this.sdkLoaded = false;
      this.initPromise = null;

      console.log('Facebook Auth Initialized');
    }
  
    // Método para carregar o SDK do Facebook
    loadSDK() {
      if (this.sdkLoaded) {
        return Promise.resolve();
      }
  
      return new Promise((resolve, reject) => {
        // Cria o script para carregar o SDK do Facebook
        const script = document.createElement('script');
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
  
        // Define o callback quando o script for carregado
        script.onload = () => {
          window.fbAsyncInit = () => {
            FB.init({
              appId: this.appId,
              cookie: true,
              xfbml: true,
              version: 'v12.0'
            });
            FB.AppEvents.logPageView();
            this.sdkLoaded = true;
            resolve();
          };
        };
  
        script.onerror = (error) => {
          reject(new Error('Failed to load Facebook SDK'));
        };
  
        // Adiciona o script ao DOM
        document.body.appendChild(script);
      });
    }
  
    // Método para iniciar o SDK do Facebook
    init() {
      if (this.initPromise) {
        return this.initPromise;
      }
  
      this.initPromise = this.loadSDK().then(() => {
        console.log('Facebook SDK Loaded');
      }).catch((error) => {
        console.error('Error loading Facebook SDK', error);
      });
  
      return this.initPromise;
    }
  
    // Método para verificar o estado de login
    checkLoginState() {
      return new Promise((resolve, reject) => {
        FB.getLoginStatus((response) => {
          if (response.status === 'connected') {
            resolve(response);
          } else {
            reject(response);
          }
        });
      });
    }
  
    // Método para obter as informações do usuário
    getUserInfo() {
      return new Promise((resolve, reject) => {
        FB.api('/me?fields=name,email,picture', (response) => {
          if (response && !response.error) {
            resolve(response);
          } else {
            reject(response.error);
          }
        });
      });
    }
  
    // Método para iniciar o login
    login() {
      return new Promise((resolve, reject) => {
        FB.login((response) => {
          if (response.authResponse) {

            const { accessToken } = response.authResponse;
            this.getUserInfo().then(userInfo => {
              resolve({ accessToken, userInfo});
            }).catch(error => {
              reject(error);
            });
          } else {
            reject(response);
          }
        }, { scope: 'public_profile,email' });
      });
    }
  }
  
  export default FacebookAuth;
  