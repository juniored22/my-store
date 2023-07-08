// appSidebarModule.js
import { appSidebarLinkComponent } from '../components/Menu/index.js';
import { pieChartLinkComponent } from '../components/Menu/index.js';
import { calendarLinkComponent } from '../components/Menu/index.js';
import { settingsLinkComponent } from '../components/Menu/index.js';
import { logoutComponent, userLinkComponent } from '../components/Menu/index.js';


export function renderSidebar() {
    const appSidebar = document.querySelector('.app-sidebar');
  
    if (appSidebar) {
      appSidebar.innerHTML = `
        ${appSidebarLinkComponent}
        ${pieChartLinkComponent}
        ${calendarLinkComponent}
        ${userLinkComponent}
        ${settingsLinkComponent}
        ${logoutComponent}
      `;
    }
  }
  
  export function handleSidebarClick() {
    const appSidebar = document.querySelector('.app-sidebar');
    const appSidebarTagClick = document.querySelectorAll('.app-sidebar a');


    Array.from(appSidebarTagClick).forEach(a => {
      a.addEventListener('click', (event) => {

        appSidebar.querySelectorAll('a').forEach(function(elemento) {
          elemento.classList.remove('active'); // Substitua 'suaClasse' pelo nome da classe que deseja remover
        });
   
        a.classList.add('active')
      });

    });
  }