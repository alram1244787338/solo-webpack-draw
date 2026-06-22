class App {
  constructor(container) {
    this.container = container;
  }

  init() {
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="app-header__title">Canvas Draw</div>
          <div class="app-header__actions">
            <div class="toolbar-placeholder" style="width: 80px; height: 32px;">操作</div>
            <div class="toolbar-placeholder" style="width: 80px; height: 32px;">导出</div>
          </div>
        </header>
        <main class="app-main">
          <aside class="app-toolbar">
            <div class="toolbar-section">
              <div class="toolbar-section__title">工具</div>
              <div class="toolbar-placeholder">画笔 / 橡皮</div>
            </div>
            <div class="toolbar-section">
              <div class="toolbar-section__title">颜色</div>
              <div class="toolbar-placeholder">颜色选择器</div>
            </div>
            <div class="toolbar-section">
              <div class="toolbar-section__title">笔刷</div>
              <div class="toolbar-placeholder">粗细调节</div>
            </div>
            <div class="toolbar-section">
              <div class="toolbar-section__title">操作</div>
              <div class="toolbar-placeholder">撤销 / 重做</div>
            </div>
          </aside>
          <section class="app-canvas-wrap">
            <div class="canvas-placeholder">
              <div class="canvas-placeholder__icon">🎨</div>
              <div class="canvas-placeholder__text">Canvas 画板 - 占位区域</div>
            </div>
          </section>
        </main>
        <footer class="app-footer">
          <span>就绪</span>
          <span>Canvas Draw v0.1.0</span>
        </footer>
      </div>
    `;
  }
}

export default App;
