import { Main }             from './main.js';
import { RenderComponents } from './app.js';
import { AppHeaderModule }  from './module/appHeaderModule.js';
import { AppSidebarModule } from './module/appSidebarModule.js';
import { renderGrid }       from './module/appGridModule.js';
import { Router }           from './routes.js';
import { Observer }         from './observers/Observer.js';

document.addEventListener('DOMContentLoaded', () => {
  const observerInstance  = new Observer(document.querySelector("#root"), "click");
  const appSidebarModule  = new AppSidebarModule(observerInstance);
  const appHeaderModule   = new AppHeaderModule(observerInstance);
  const router            = new Router('root');
  Main.init((config)=>{
    const renderComponents = new RenderComponents({
      router,
      observerInstance,
      renderSidebar: appSidebarModule.renderSidebar.bind(appSidebarModule),
      renderHeader: appHeaderModule.renderHeader.bind(appHeaderModule),
      handleHeaderClick: appHeaderModule.handleHeaderClick.bind(appHeaderModule),
      handleSidebarClick: appSidebarModule.handleSidebarClick.bind(appSidebarModule),
      reloadSidebar:  appSidebarModule.reloadSidebar.bind(appSidebarModule)
    });
    renderComponents.initialize();
  });
});

