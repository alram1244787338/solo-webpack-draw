let _realSetTimeout = null;
let _realClearTimeout = null;
let _realSetInterval = null;
let _realClearInterval = null;
let _realDateNow = null;

let _timers = [];
let _now = 0;
let _timerIdCounter = 1;
let _isFake = false;

function _sortedInsert(timer) {
  let i = _timers.length;
  while (i > 0 && _timers[i - 1].fireAt > timer.fireAt) {
    i--;
  }
  _timers.splice(i, 0, timer);
}

function useFakeTimers() {
  if (_isFake) return;
  _realSetTimeout = globalThis.setTimeout;
  _realClearTimeout = globalThis.clearTimeout;
  _realSetInterval = globalThis.setInterval;
  _realClearInterval = globalThis.clearInterval;
  _realDateNow = Date.now;

  _timers = [];
  _now = 0;
  _timerIdCounter = 1;
  _isFake = true;

  globalThis.setTimeout = function fakeSetTimeout(cb, delay = 0, ...args) {
    const id = _timerIdCounter++;
    _sortedInsert({
      id,
      type: 'timeout',
      fireAt: _now + delay,
      cb,
      args,
      interval: null,
    });
    return id;
  };

  globalThis.clearTimeout = function fakeClearTimeout(id) {
    _timers = _timers.filter((t) => t.id !== id);
  };

  globalThis.setInterval = function fakeSetInterval(cb, delay = 0, ...args) {
    const id = _timerIdCounter++;
    _sortedInsert({
      id,
      type: 'interval',
      fireAt: _now + delay,
      cb,
      args,
      interval: delay,
    });
    return id;
  };

  globalThis.clearInterval = function fakeClearInterval(id) {
    _timers = _timers.filter((t) => t.id !== id);
  };

  Date.now = function fakeDateNow() {
    return _now;
  };
}

function useRealTimers() {
  if (!_isFake) return;
  _isFake = false;
  globalThis.setTimeout = _realSetTimeout;
  globalThis.clearTimeout = _realClearTimeout;
  globalThis.setInterval = _realSetInterval;
  globalThis.clearInterval = _realClearInterval;
  Date.now = _realDateNow;
  _timers = [];
}

function advanceTimersByTime(ms) {
  if (!_isFake) throw new Error('先调用 useFakeTimers()');
  const target = _now + ms;
  while (_timers.length > 0 && _timers[0].fireAt <= target) {
    const timer = _timers.shift();
    _now = timer.fireAt;
    try {
      timer.cb(...timer.args);
    } catch (e) {
      console.error('定时器回调出错:', e);
    }
    if (timer.type === 'interval' && timer.interval != null) {
      timer.fireAt = _now + timer.interval;
      _sortedInsert(timer);
    }
  }
  _now = target;
}

function runAllTimers(maxIterations = 10000) {
  if (!_isFake) throw new Error('先调用 useFakeTimers()');
  let iter = 0;
  while (_timers.length > 0 && iter < maxIterations) {
    const timer = _timers.shift();
    _now = timer.fireAt;
    try {
      timer.cb(...timer.args);
    } catch (e) {
      console.error('定时器回调出错:', e);
    }
    if (timer.type === 'interval' && timer.interval != null) {
      timer.fireAt = _now + timer.interval;
      _sortedInsert(timer);
    }
    iter++;
  }
}

export { useFakeTimers, useRealTimers, advanceTimersByTime, runAllTimers };
