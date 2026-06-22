class HistoryManager {
  constructor(maxSize = 30) {
    this.undoStack = [];
    this.maxSize = maxSize;
  }

  push(snapshot) {
    if (this.undoStack.length >= this.maxSize) {
      this.undoStack.shift();
    }
    this.undoStack.push(snapshot);
  }

  undo() {
    if (this.undoStack.length <= 1) return null;
    this.undoStack.pop();
    return this.undoStack[this.undoStack.length - 1];
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  clear() {
    this.undoStack = [];
  }

  get size() {
    return this.undoStack.length;
  }
}

export default HistoryManager;
