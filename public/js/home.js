

import { headerLeftComponent } from './components/HeaderLeft/index.js';
import { headerRightComponent } from './components/HeaderRight/index.js';
import { messagesButtonComponent } from './components/MessagesButton/index.js';
import { renderSidebar, handleSidebarClick } from './module/appSidebarModule.js';
import { renderGrid } from './module/appGridModule.js';

function renderComponents() {
  const appHeader = document.querySelector('.app-header');
  const appSidebar = document.querySelector('.app-sidebar');

  if (appHeader) {
      appHeader.innerHTML = `
        ${headerLeftComponent}
        ${headerRightComponent}
        ${messagesButtonComponent}
      `;
  }

  renderSidebar();
  // renderGrid();
}

document.addEventListener('DOMContentLoaded', () => {
  renderComponents();
  handleSidebarClick();

    // Chame a função renderComponents quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', renderComponents);

    var modeSwitch = document.querySelector('.mode-switch');
    modeSwitch.addEventListener('click', function () { document.documentElement.classList.toggle('dark');
      modeSwitch.classList.toggle('active');
    });
    
    var listView = document.querySelector('.list-view');
    var gridView = document.querySelector('.grid-view');
    var projectsList = document.querySelector('.project-boxes');
    
    listView.addEventListener('click', function () {
      gridView.classList.remove('active');
      listView.classList.add('active');
      projectsList.classList.remove('jsGridView');
      projectsList.classList.add('jsListView');
    });
    
    gridView.addEventListener('click', function () {
      gridView.classList.add('active');
      listView.classList.remove('active');
      projectsList.classList.remove('jsListView');
      projectsList.classList.add('jsGridView');
    });
    
    document.querySelector('.messages-btn').addEventListener('click', function () {
      document.querySelector('.messages-section').classList.add('show');
    });
    
    /*
    document.querySelector('.messages-close').addEventListener('click', function() {
      document.querySelector('.messages-section').classList.remove('show');
    });
    */
});

