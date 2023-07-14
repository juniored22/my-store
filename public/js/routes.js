export class Router {
  constructor(rootDivId = 'root') {
    this.routes = {};
    this.rootDivId = rootDivId;
    window.addEventListener('hashchange', () => this.updateContent());
  }

  addRoute(route, templatePath) {
    this.routes[route] = templatePath;
  }

  async updateContent() {
    const path = location.hash.slice(1);
    const matchingRoute = this.findMatchingRoute(path);
    const contentDiv = document.getElementById(this.rootDivId);

    if (matchingRoute) {
      try {
        const route = this.routes[matchingRoute].replace(':id', path.split('/')[1]);
        contentDiv.innerHTML = await this.fetchTemplate(route);
      } catch (error) {
        console.log('Erro ao carregar a página:', error);
      }
    } else {
      contentDiv.innerHTML = '';
      console.log('Rota não encontrada');
    }
  }

  findMatchingRoute(path) {
    return Object.keys(this.routes).find(route =>
      this.matchRoute(route, path)
    );
  }

  matchRoute(routeKey, path) {
    const routeParts = routeKey.split('/').filter(e=>e);
    const pathParts = path.split('/').filter(e=>e);
    return routeParts.length === pathParts.length &&
      routeParts.every((part, index) =>
        part.startsWith(':') || part === pathParts[index]
      );
  }

  async fetchTemplate(templatePath) {
    const response = await fetch(templatePath);
    return response.text();
  }
};
