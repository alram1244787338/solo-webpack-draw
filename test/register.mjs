import { deepEqual } from 'assert';

const _state = {
  suites: [],
  currentSuite: null,
  beforeEaches: [],
  afterEaches: [],
};

function _color(text, code) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

globalThis.describe = function describe(name, fn) {
  const inheritFrom = _state.currentSuite;
  const suite = {
    name,
    cases: [],
    beforeEaches: inheritFrom ? [...inheritFrom.beforeEaches] : [..._state.beforeEaches],
    afterEaches: inheritFrom ? [...inheritFrom.afterEaches] : [..._state.afterEaches],
    parent: inheritFrom,
  };
  if (inheritFrom) {
    inheritFrom.children = inheritFrom.children || [];
    inheritFrom.children.push(suite);
  } else {
    _state.suites.push(suite);
  }
  const prev = _state.currentSuite;
  _state.currentSuite = suite;
  try {
    fn();
  } finally {
    _state.currentSuite = prev;
  }
};

globalThis.it = function it(name, fn) {
  if (!_state.currentSuite) {
    throw new Error(`it("${name}") 必须放在 describe 里`);
  }
  _state.currentSuite.cases.push({ name, fn });
};

globalThis.beforeEach = function beforeEach(fn) {
  if (!_state.currentSuite) {
    _state.beforeEaches.push(fn);
  } else {
    _state.currentSuite.beforeEaches.push(fn);
  }
};

globalThis.afterEach = function afterEach(fn) {
  if (!_state.currentSuite) {
    _state.afterEaches.push(fn);
  } else {
    _state.currentSuite.afterEaches.push(fn);
  }
};

globalThis.expect = function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(
          `期望 ${JSON.stringify(actual)} 严格等于 ${JSON.stringify(expected)}`
        );
      }
    },
    toEqual(expected) {
      try {
        deepEqual(actual, expected);
      } catch (err) {
        throw new Error(
          `期望 ${JSON.stringify(actual)} 深度等于 ${JSON.stringify(expected)}`
        );
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`期望 ${JSON.stringify(actual)} 是 null`);
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`期望 ${JSON.stringify(actual)} 是 undefined`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`期望 ${JSON.stringify(actual)} 是真值`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`期望 ${JSON.stringify(actual)} 是假值`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new Error(`期望 ${actual} 大于 ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (!(actual >= expected)) {
        throw new Error(`期望 ${actual} 大于等于 ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (!(actual < expected)) {
        throw new Error(`期望 ${actual} 小于 ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (!(actual <= expected)) {
        throw new Error(`期望 ${actual} 小于等于 ${expected}`);
      }
    },
    toHaveLength(expected) {
      if (!actual || actual.length !== expected) {
        throw new Error(
          `期望长度 ${expected}，实际 ${actual && actual.length}`
        );
      }
    },
    toContain(expected) {
      if (!actual || !actual.includes(expected)) {
        throw new Error(
          `期望 ${JSON.stringify(actual)} 包含 ${JSON.stringify(expected)}`
        );
      }
    },
    toBeInstanceOf(cls) {
      if (!(actual instanceof cls)) {
        throw new Error(`期望是 ${cls.name} 的实例`);
      }
    },
    not: {
      toBe(expected) {
        if (actual === expected) {
          throw new Error(
            `期望 ${JSON.stringify(actual)} 不等于 ${JSON.stringify(expected)}`
          );
        }
      },
      toBeNull() {
        if (actual === null) {
          throw new Error(`期望 ${JSON.stringify(actual)} 不是 null`);
        }
      },
    },
  };
};

export { _state, _color };
