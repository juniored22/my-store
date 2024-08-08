import { appSidebarLinkComponent, pieChartLinkComponent, calendarLinkComponent, settingsLinkComponent, logoutComponent, userLinkComponent, faceRecognitionLinkComponent } from '../components/Menu/index.js';

export class AppSidebarModule {
  constructor(myObserver) {
    this.myObserver = myObserver;
    this.appSidebar = document.querySelector('.app-sidebar');
  }

  renderSidebar() {
    if (this.appSidebar) {
      this.appSidebar.innerHTML = `
        ${appSidebarLinkComponent}
        ${pieChartLinkComponent}
        ${calendarLinkComponent}
        ${userLinkComponent}
        ${faceRecognitionLinkComponent}
        ${settingsLinkComponent}
        ${logoutComponent}
      `;
    }
  }

  addFunctionObserver(){
    this.myObserver.subscribe(this.logData1);
    this.myObserver.subscribe(this.logData2);
  }

  logData1 = data => console.log(`Observer 1: ${data}`);
  logData2 = data => console.log(`Observer 2: ${data}`);
  
  handleSidebarClick() {
    const appSidebarTagClick = document.querySelectorAll('.app-sidebar a');

    Array.from(appSidebarTagClick).forEach(a => {
      a.addEventListener('click', (event) => {
        this.appSidebar.querySelectorAll('a').forEach(function(elemento) {
          elemento.classList.remove('active');
        });
        
        a.classList.add('active');

        this.myObserver.notify('Hello!');
        this.myObserver.unsubscribe(this.logData2);
        this.myObserver.notify('Goodbye!');
      });
    });
  }

  reloadSidebar() {
    const url = window.location.hash;
    const links = document.querySelectorAll('.app-sidebar a');

    links.forEach(link => {
      if (link.getAttribute('href') === url) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
