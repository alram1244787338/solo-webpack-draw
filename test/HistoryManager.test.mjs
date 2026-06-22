import HistoryManager from '../src/utils/HistoryManager.js';

describe('HistoryManager', () => {
  let hm;

  beforeEach(() => {
    hm = new HistoryManager(10);
  });

  describe('初始化', () => {
    it('初始状态下 undoStack 和 redoStack 都为空', () => {
      expect(hm.undoStack).toHaveLength(0);
      expect(hm.redoStack).toHaveLength(0);
    });

    it('初始时 canUndo 和 canRedo 都为 false', () => {
      expect(hm.canUndo()).toBe(false);
      expect(hm.canRedo()).toBe(false);
    });

    it('默认 maxSize 为传入值', () => {
      const hm1 = new HistoryManager(10);
      expect(hm1.maxSize).toBe(10);
      const hm2 = new HistoryManager();
      expect(hm2.maxSize).toBe(30);
    });
  });

  describe('push()', () => {
    it('push 后 undoStack 增加 1', () => {
      hm.push('s1');
      expect(hm.undoStack).toHaveLength(1);
      expect(hm.undoStack[0]).toBe('s1');
    });

    it('push 后清空 redoStack', () => {
      hm.push('s1');
      hm.push('s2');
      hm.undo();
      expect(hm.redoStack).toHaveLength(1);

      hm.push('s3');
      expect(hm.redoStack).toHaveLength(0);
    });

    it('超过 maxSize 时淘汰最旧的快照', () => {
      const small = new HistoryManager(3);
      small.push('a');
      small.push('b');
      small.push('c');
      expect(small.undoStack).toEqual(['a', 'b', 'c']);

      small.push('d');
      expect(small.undoStack).toEqual(['b', 'c', 'd']);
      expect(small.undoStack[0]).toBe('b');
    });

    it('超过 maxSize 后 redoStack 也会被清空', () => {
      const small = new HistoryManager(3);
      small.push('a');
      small.push('b');
      small.push('c');
      small.undo();
      expect(small.redoStack).toHaveLength(1);

      small.push('d');
      expect(small.undoStack).toHaveLength(3);
      expect(small.redoStack).toHaveLength(0);
    });
  });

  describe('undo()', () => {
    it('undoStack 为空时 undo 返回 null，不抛错', () => {
      const result = hm.undo();
      expect(result).toBeNull();
    });

    it('undoStack 只有 1 个快照时 undo 返回 null', () => {
      hm.push('s1');
      const result = hm.undo();
      expect(result).toBeNull();
      expect(hm.undoStack).toHaveLength(1);
      expect(hm.redoStack).toHaveLength(0);
    });

    it('undo 把当前快照推入 redoStack，返回上一个快照', () => {
      hm.push('s1');
      hm.push('s2');
      hm.push('s3');

      const result = hm.undo();
      expect(result).toBe('s2');
      expect(hm.undoStack).toEqual(['s1', 's2']);
      expect(hm.redoStack).toEqual(['s3']);
    });

    it('多次 undo 直到栈底后返回 null', () => {
      hm.push('a');
      hm.push('b');

      expect(hm.undo()).toBe('a');
      expect(hm.undo()).toBeNull();
      expect(hm.undoStack).toEqual(['a']);
      expect(hm.redoStack).toEqual(['b']);
    });
  });

  describe('redo()', () => {
    it('redoStack 为空时 redo 返回 null', () => {
      const result = hm.redo();
      expect(result).toBeNull();
    });

    it('redo 从 redoStack 弹出并推入 undoStack，返回该快照', () => {
      hm.push('s1');
      hm.push('s2');
      hm.push('s3');
      hm.undo();

      const result = hm.redo();
      expect(result).toBe('s3');
      expect(hm.undoStack).toEqual(['s1', 's2', 's3']);
      expect(hm.redoStack).toHaveLength(0);
    });

    it('多次 undo 后再多次 redo 全部恢复', () => {
      hm.push('a');
      hm.push('b');
      hm.push('c');
      hm.push('d');

      hm.undo();
      hm.undo();
      expect(hm.undoStack).toEqual(['a', 'b']);
      expect(hm.redoStack).toEqual(['d', 'c']);

      expect(hm.redo()).toBe('c');
      expect(hm.redo()).toBe('d');
      expect(hm.redo()).toBeNull();
      expect(hm.undoStack).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('canUndo() / canRedo()', () => {
    it('canUndo 在 undoStack <= 1 时为 false', () => {
      expect(hm.canUndo()).toBe(false);
      hm.push('s1');
      expect(hm.canUndo()).toBe(false);
      hm.push('s2');
      expect(hm.canUndo()).toBe(true);
    });

    it('canRedo 在 redoStack 为空时 false，否则 true', () => {
      expect(hm.canRedo()).toBe(false);
      hm.push('s1');
      hm.push('s2');
      expect(hm.canRedo()).toBe(false);

      hm.undo();
      expect(hm.canRedo()).toBe(true);
      hm.redo();
      expect(hm.canRedo()).toBe(false);
    });

    it('push 新快照后 canRedo 变回 false', () => {
      hm.push('a');
      hm.push('b');
      hm.undo();
      expect(hm.canRedo()).toBe(true);

      hm.push('c');
      expect(hm.canRedo()).toBe(false);
    });
  });

  describe('undoSize / redoSize / clear()', () => {
    it('undoSize 和 redoSize getter 返回正确长度', () => {
      hm.push('a');
      hm.push('b');
      hm.push('c');
      expect(hm.undoSize).toBe(3);
      expect(hm.redoSize).toBe(0);

      hm.undo();
      expect(hm.undoSize).toBe(2);
      expect(hm.redoSize).toBe(1);
    });

    it('clear() 清空两个栈', () => {
      hm.push('a');
      hm.push('b');
      hm.undo();
      expect(hm.undoSize).toBeGreaterThan(0);
      expect(hm.redoSize).toBeGreaterThan(0);

      hm.clear();
      expect(hm.undoStack).toHaveLength(0);
      expect(hm.redoStack).toHaveLength(0);
      expect(hm.canUndo()).toBe(false);
      expect(hm.canRedo()).toBe(false);
    });
  });

  describe('完整状态流', () => {
    it('push x N → undo x N → redo x N → push 新的 → redoStack 被清', () => {
      hm.push('1');
      hm.push('2');
      hm.push('3');
      hm.push('4');

      hm.undo(); // undoSize=3, redo=[4]
      hm.undo(); // undoSize=2, redo=[4,3]
      expect(hm.undoStack).toEqual(['1', '2']);
      expect(hm.redoStack).toEqual(['4', '3']);

      hm.redo(); // undo=[1,2,3], redo=[4]
      expect(hm.canRedo()).toBe(true);

      hm.push('X'); // 新快照
      expect(hm.undoStack).toEqual(['1', '2', '3', 'X']);
      expect(hm.redoStack).toHaveLength(0);
      expect(hm.canRedo()).toBe(false);
    });
  });
});
