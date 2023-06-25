import { Main } from './main.js'

Main.init((config)=>{

	const signUpButton = document.getElementById('signUp');
	const signInButton = document.getElementById('signIn');
	const container = document.getElementById('container');
	const signInForm = document.querySelector('.sign-in-container');
	const signUpForm = document.querySelector('.sign-up-container');
	const signUpBtn = document.querySelector('[data-sign-up]');
	const signInBtn = document.querySelector('[data-sign-in]')
	const server = config[config.build.environment].host;
	const requestLogin = (body, callback)=>{
		const options = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: body
		  };

		  fetch(`${server}/generate-token`, options)
		  .then(response => response.json())
		  .then(response => response.token && (window.location.href = `${server}/home`) )
		  .then( () => typeof callback === 'function' && callback())
		  .catch(err => console.error(err));
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

		const button = document.getElementById("signin-btn");
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
	
});

