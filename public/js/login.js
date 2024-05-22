import { Main } from './main.js'
import FacebookAuth from './providers/FaceBook/FacebookAuth.js';


Main.init((config)=>{

	const signUpButton 	= document.getElementById('signUp');
	const signInButton 	= document.getElementById('signIn');
	const container 	= document.getElementById('container');
	const signInForm 	= document.querySelector('.sign-in-container');
	const signUpForm 	= document.querySelector('.sign-up-container');
	const signUpBtn 	= document.querySelector('[data-sign-up]');
	const signInBtn 	= document.querySelector('[data-sign-in]')
	const server 		= config[config.build.environment].host;

	const requestLogin = (body, callback)=>{
		const options = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: body
		};
		
		fetch(`${server}/generate-token`, options)
		.then(response =>  {
		if(response.status === 401)showCustomAlert("Error","Usuário ou senha incorreta!", "error");
		return response.json()
		})
		.then(response => response.token && (window.location.href = `${server}/aplication`) )
		.then( () => typeof callback === 'function' && callback())
		.catch(err => console.warn(err));
	}

	const toggleZIndex = (activeForm, inactiveForm) => {
		if (activeForm.classList.contains('activeForm')) {
			activeForm.classList.replace('activeForm', 'inactiveForm');
			inactiveForm.classList.replace('inactiveForm', 'activeForm');
		} else {
			activeForm.classList.replace('inactiveForm', 'activeForm');
			inactiveForm.classList.replace('activeForm', 'inactiveForm');
		}
	};
	
	signUpButton.addEventListener('click', () => {
		container.classList.add("right-panel-active");
	});
	
	signInButton.addEventListener('click', () => {
		container.classList.remove("right-panel-active");
	});
	
	signInForm.addEventListener('submit', function(event) {

		let button = document.getElementById("signin-btn");
		button.innerHTML = 'Sign In <div class="spinner"></div>';
		button.classList.add("loading");

		event.preventDefault();

		const formData = new FormData(event.target);
		const object = Array.from(formData).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
		const json = JSON.stringify(object);
		requestLogin(json, ()=> {
			button.innerHTML = 'Sign In';
			button.classList.remove("loading");
		});
	});

	signUpBtn.addEventListener('click', () => toggleZIndex(signUpForm, signInForm));
	signInBtn.addEventListener('click', () => toggleZIndex(signInForm, signUpForm));

	function showCustomAlert(title,message,classAlert) {
		document.querySelector('.alert_').innerHTML = `
			<div id="alert" class="alert-content">
				<div class="alert-card alert-${classAlert}">
					<i class="alert-icon-info fa fa-info"></i>
					<div class="alert-div-text">
						<span>${title}</span>
						<p>
						${message}
						</p>
					</div>
				</div>
			</div>`;
		document.getElementById('alert').style.display = 'block';
		setTimeout(()=>{
			document.getElementById('alert').style.display='none'
		},5000)
	}

	// if(FacebookAuth.isAvailable()){
	if(true){
		const appId = '301879677451407'; // Substitua pelo seu App ID
		const fbAuth = new FacebookAuth(appId);
		// Inicializar o SDK do Facebook
		fbAuth.init().then(() => {
			console.log('Facebook SDK Initialized');
		});
	
		fbAuth.checkLoginState().then(response => {
			fbAuth.getUserInfo().then(userInfo => {
				console.log('User Info:', userInfo);
				document.getElementById('userInfo').innerText = `Welcome, ${userInfo.name}`;
			});
		}).catch(() => {
			console.log('User not logged in');
		});
	
		const loginButton = document.getElementById('facebookAuth-btn');
		loginButton.addEventListener('click', () => {
		  fbAuth.login().then(userInfo => {
			console.log('User Info:', userInfo);
			document.getElementById('userInfo').innerText = `Welcome, ${userInfo.name}`;
		  }).catch(error => {
			console.error('Login failed:', error);
		  });
		});
	}
	
});

