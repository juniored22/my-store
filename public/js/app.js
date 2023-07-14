export class RenderComponents {
    constructor({router, observerInstance, renderHeader, renderSidebar, handleHeaderClick, handleSidebarClick, reloadSidebar}) {
      this.router               = router;
      this.observer             = observerInstance;
      this.renderHeader         = renderHeader;
      this.renderSidebar        = renderSidebar;
      this.handleHeaderClick    = handleHeaderClick
      this.handleSidebarClick   = handleSidebarClick;
      this.reloadSidebar        = reloadSidebar;
    }

    initialize() {
      this.renderHeader();
      this.renderSidebar();
      this.handleHeaderClick();
      this.handleSidebarClick();
      this.reloadSidebar();
      this.router.addRoute("/home", "test");
      this.router.updateContent();
    }
}
  