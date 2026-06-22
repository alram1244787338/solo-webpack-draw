const PRESET_COLORS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
];

class Toolbar {
  constructor(container) {
    this.container = container;
    this.currentTool = 'brush';
    this.currentColor = '#000000';
    this.currentLineWidth = 3;

    this.onToolChange = null;
    this.onColorChange = null;
    this.onLineWidthChange = null;
    this.onUndo = null;

    this._onToolClick = this._onToolClick.bind(this);
    this._onColorClick = this._onColorClick.bind(this);
    this._onWidthInput = this._onWidthInput.bind(this);
    this._onUndoClick = this._onUndoClick.bind(this);
  }

  init() {
    this._render();
    this._bindEvents();
  }

  _render() {
    this.container.innerHTML = `
      <div class="toolbar-section">
        <div class="toolbar-section__title">工具</div>
        <div class="tool-buttons">
          <button class="tool-btn tool-btn--active" data-tool="brush" type="button">
            <span class="tool-btn__icon">✏️</span>
            <span class="tool-btn__label">画笔</span>
          </button>
          <button class="tool-btn" data-tool="eraser" type="button">
            <span class="tool-btn__icon">🧽</span>
            <span class="tool-btn__label">橡皮擦</span>
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <div class="toolbar-section__title">颜色</div>
        <div class="color-palette">
          ${PRESET_COLORS
            .map(
              (color, idx) => `
            <button
              class="color-swatch ${idx === 0 ? 'color-swatch--active' : ''}"
              data-color="${color}"
              type="button"
              style="background-color: ${color};"
              title="${color}"
            ></button>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="toolbar-section">
        <div class="toolbar-section__title">笔刷粗细</div>
        <div class="width-control">
          <input
            class="width-slider"
            type="range"
            min="1"
            max="20"
            value="3"
          />
          <div class="width-preview">
            <span class="width-preview__dot"></span>
            <span class="width-preview__value">3px</span>
          </div>
        </div>
      </div>

      <div class="toolbar-section">
        <div class="toolbar-section__title">操作</div>
        <button class="action-btn action-btn--undo" type="button">
          <span>↶ 撤销 (Ctrl+Z)</span>
        </button>
      </div>
    `;
  }

  _bindEvents() {
    this.container.querySelectorAll('.tool-btn').forEach((btn) => {
      btn.addEventListener('click', this._onToolClick);
    });
    this.container.querySelectorAll('.color-swatch').forEach((swatch) => {
      swatch.addEventListener('click', this._onColorClick);
    });
    const slider = this.container.querySelector('.width-slider');
    slider.addEventListener('input', this._onWidthInput);
    const undoBtn = this.container.querySelector('.action-btn--undo');
    undoBtn.addEventListener('click', this._onUndoClick);
  }

  _onToolClick(e) {
    const btn = e.currentTarget;
    const tool = btn.dataset.tool;
    if (tool === this.currentTool) return;

    this.currentTool = tool;
    this.container.querySelectorAll('.tool-btn').forEach((b) => {
      b.classList.toggle('tool-btn--active', b.dataset.tool === tool);
    });
    if (this.onToolChange) this.onToolChange(tool);
  }

  _onColorClick(e) {
    const swatch = e.currentTarget;
    const color = swatch.dataset.color;
    if (color === this.currentColor) return;

    this.currentColor = color;
    this.container.querySelectorAll('.color-swatch').forEach((s) => {
      s.classList.toggle('color-swatch--active', s.dataset.color === color);
    });
    if (this.onColorChange) this.onColorChange(color);
  }

  _onWidthInput(e) {
    const value = parseInt(e.target.value, 10);
    this.currentLineWidth = value;
    const previewDot = this.container.querySelector('.width-preview__dot');
    const previewValue = this.container.querySelector('.width-preview__value');
    const size = Math.max(4, Math.min(28, value * 1.8));
    previewDot.style.width = size + 'px';
    previewDot.style.height = size + 'px';
    previewValue.textContent = value + 'px';
    if (this.onLineWidthChange) this.onLineWidthChange(value);
  }

  _onUndoClick() {
    if (this.onUndo) this.onUndo();
  }

  getToolLabel() {
    return this.currentTool === 'brush' ? '画笔' : '橡皮擦';
  }

  destroy() {
    this.container.querySelectorAll('.tool-btn').forEach((btn) => {
      btn.removeEventListener('click', this._onToolClick);
    });
    this.container.querySelectorAll('.color-swatch').forEach((swatch) => {
      swatch.removeEventListener('click', this._onColorClick);
    });
    const slider = this.container.querySelector('.width-slider');
    if (slider) slider.removeEventListener('input', this._onWidthInput);
    const undoBtn = this.container.querySelector('.action-btn--undo');
    if (undoBtn) undoBtn.removeEventListener('click', this._onUndoClick);
  }
}

export default Toolbar;
