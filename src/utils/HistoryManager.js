class HistoryManager {
  constructor(maxSize = 30) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxSize = maxSize;
  }

  push(snapshot) {
    if (this.undoStack.length >= this.maxSize) {
      this.undoStack.shift();
    }
    this.undoStack.push(snapshot);
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length <= 1) return null;
    const current = this.undoStack.pop();
    this.redoStack.push(current);
    return this.undoStack[this.undoStack.length - 1];
  }

  redo() {
    if (this.redoStack.length === 0) return null;
    const snapshot = this.redoStack.pop();
    this.undoStack.push(snapshot);
    return snapshot;
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  get undoSize() {
    return this.undoStack.length;
  }

  get redoSize() {
    return this.redoStack.length;
  }
}

export default HistoryManager;
