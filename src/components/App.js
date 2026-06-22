import CanvasBoard from './CanvasBoard.js';
import Toolbar from './Toolbar.js';
import HistoryManager from '../utils/HistoryManager.js';
import { debounce } from '../utils/common.js';

class App {
  constructor(container) {
    this.container = container;
    this.historyManager = new HistoryManager(30);
    this.canvasBoard = null;
    this.toolbar = null;
    this.statusBarTool = null;
    this.statusBarSize = null;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._handleResize = debounce(this._handleResize.bind(this), 200);
  }

  init() {
    this._render();
    this._initModules();
    this._bindGlobalEvents();
  }

  _render() {
    this.container.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="app-header__title">Canvas Draw</div>
          <div class="app-header__actions">
            <button class="header-btn header-btn--undo" type="button" id="btn-undo">
              ↶ 撤销
            </button>
            <button class="header-btn header-btn--redo" type="button" id="btn-redo">
              ↷ 重做
            </button>
            <button class="header-btn header-btn--export" type="button" id="btn-export">
              📤 导出
            </button>
          </div>
        </header>
        <main class="app-main">
          <aside class="app-toolbar" id="toolbar-container"></aside>
          <section class="app-canvas-wrap" id="canvas-container"></section>
        </main>
        <footer class="app-footer">
          <span id="status-tool">工具：画笔</span>
          <span id="status-size">画布：640 × 480</span>
        </footer>
      </div>
    `;
  }

  _initModules() {
    const toolbarContainer = this.container.querySelector('#toolbar-container');
    const canvasContainer = this.container.querySelector('#canvas-container');

    this.toolbar = new Toolbar(toolbarContainer);
    this.toolbar.init();

    this.canvasBoard = new CanvasBoard(canvasContainer, this.historyManager);
    this.canvasBoard.init();

    this.statusBarTool = this.container.querySelector('#status-tool');
    this.statusBarSize = this.container.querySelector('#status-size');

    const size = this.canvasBoard.getSize();
    this.statusBarSize.textContent = `画布：${size.width} × ${size.height}`;

    this.toolbar.onToolChange = (tool) => {
      this.canvasBoard.setTool(tool);
      this.statusBarTool.textContent = `工具：${this.toolbar.getToolLabel()}`;
    };
    this.toolbar.onColorChange = (color) => {
      this.canvasBoard.setColor(color);
    };
    this.toolbar.onLineWidthChange = (width) => {
      this.canvasBoard.setLineWidth(width);
    };
    this.toolbar.onUndo = () => {
      this._handleUndo();
    };
    this.toolbar.onRedo = () => {
      this._handleRedo();
    };

    const btnUndo = this.container.querySelector('#btn-undo');
    const btnRedo = this.container.querySelector('#btn-redo');
    const btnExport = this.container.querySelector('#btn-export');
    btnUndo.addEventListener('click', () => this._handleUndo());
    btnRedo.addEventListener('click', () => this._handleRedo());
    btnExport.addEventListener('click', () => this.canvasBoard.exportPNG());
  }

  _bindGlobalEvents() {
    document.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('resize', this._handleResize);
  }

  _onKeyDown(e) {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key.toLowerCase();

    if (isCtrl && key === 'z' && !isShift) {
      e.preventDefault();
      this._handleUndo();
    } else if ((isCtrl && key === 'y') || (isCtrl && isShift && key === 'z')) {
      e.preventDefault();
      this._handleRedo();
    }
  }

  _handleResize() {
    const size = this.canvasBoard.getSize();
    this.statusBarSize.textContent = `画布：${size.width} × ${size.height}`;
  }

  async _handleUndo() {
    const ok = await this.canvasBoard.undo();
    if (ok) {
      this.statusBarTool.textContent = `工具：${this.toolbar.getToolLabel()} · 已撤销`;
      setTimeout(() => {
        this.statusBarTool.textContent = `工具：${this.toolbar.getToolLabel()}`;
      }, 1200);
    }
  }

  async _handleRedo() {
    const ok = await this.canvasBoard.redo();
    if (ok) {
      this.statusBarTool.textContent = `工具：${this.toolbar.getToolLabel()} · 已重做`;
      setTimeout(() => {
        this.statusBarTool.textContent = `工具：${this.toolbar.getToolLabel()}`;
      }, 1200);
    }
  }

  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._handleResize);
    if (this.canvasBoard) this.canvasBoard.destroy();
    if (this.toolbar) this.toolbar.destroy();
  }
}

export default App;
