const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

class CanvasBoard {
  constructor(container, historyManager) {
    this.container = container;
    this.historyManager = historyManager;
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.tool = 'brush';
    this.color = '#000000';
    this.lineWidth = 3;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
  }

  init() {
    this._render();
    this._bindEvents();
    this.saveSnapshot();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'canvas-board-wrap';
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.canvas.className = 'canvas-board';
    wrap.appendChild(this.canvas);
    this.container.appendChild(wrap);
    this.ctx = this.canvas.getContext('2d');
  }

  _bindEvents() {
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mouseup', this._onMouseUp);
    this.canvas.addEventListener('mouseleave', this._onMouseLeave);
  }

  _getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height),
    };
  }

  _onMouseDown(e) {
    this.isDrawing = true;
    const pos = this._getPos(e);
    this.lastX = pos.x;
    this.lastY = pos.y;

    this.ctx.save();
    if (this.tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
    }
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.tool === 'eraser' ? this.lineWidth * 3 : this.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
  }

  _onMouseMove(e) {
    if (!this.isDrawing) return;
    const pos = this._getPos(e);

    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  _onMouseUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
    this.ctx.restore();
    this.saveSnapshot();
  }

  _onMouseLeave() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
    this.ctx.restore();
    this.saveSnapshot();
  }

  setTool(tool) {
    this.tool = tool;
    this.canvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
  }

  setColor(color) {
    this.color = color;
  }

  setLineWidth(width) {
    this.lineWidth = width;
  }

  saveSnapshot() {
    this.historyManager.push(this.canvas.toDataURL());
  }

  restoreSnapshot(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.src = dataUrl;
    });
  }

  async undo() {
    const snapshot = this.historyManager.undo();
    if (snapshot) {
      await this.restoreSnapshot(snapshot);
      return true;
    }
    return false;
  }

  async redo() {
    const snapshot = this.historyManager.redo();
    if (snapshot) {
      await this.restoreSnapshot(snapshot);
      return true;
    }
    return false;
  }

  exportPNG() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = CANVAS_WIDTH;
    tempCanvas.height = CANVAS_HEIGHT;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    tempCtx.drawImage(this.canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `canvas-draw-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  }

  getSize() {
    return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
  }

  destroy() {
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mouseup', this._onMouseUp);
    this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
  }
}

export default CanvasBoard;
