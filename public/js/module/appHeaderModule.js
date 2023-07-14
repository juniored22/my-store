import { headerLeftComponent }      from '../components/HeaderLeft/index.js';
import { headerRightComponent }     from '../components/HeaderRight/index.js';
import { messagesButtonComponent }  from '../components/MessagesButton/index.js';

export class AppHeaderModule {
  constructor(myObserver) {
    this.myObserver = myObserver;
    this.appHeader = document.querySelector('.app-header');
    this.addFunctionObserver()
  }

  test(data){
    console.log(`Observer header 1: ${data}`);
  }

  addFunctionObserver(){
    this.myObserver.subscribe(this.test);
  }

  handleHeaderClick() {
    const modeSwitch = document.querySelector('.mode-switch');
    if (modeSwitch) {
        modeSwitch.addEventListener('click', function () { 
            document.documentElement.classList.toggle('dark');
            modeSwitch.classList.toggle('active');
            this.myObserver.notify('Dark!');
        }.bind(this));
    }
  }

  renderHeader() {
    if (this.appHeader) {
      this.appHeader.innerHTML = `
        ${headerLeftComponent}
        ${headerRightComponent}
        ${messagesButtonComponent}
      `;
    }
  }
}