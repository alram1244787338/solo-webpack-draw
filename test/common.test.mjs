import { debounce, throttle } from '../src/utils/common.js';
import {
  useFakeTimers,
  useRealTimers,
  advanceTimersByTime,
  runAllTimers,
} from './fake-timers.mjs';

describe('debounce()', () => {
  beforeEach(() => {
    useFakeTimers();
  });

  afterEach(() => {
    useRealTimers();
  });

  it('延迟内多次调用只执行最后一次', () => {
    const calls = [];
    const fn = (x) => calls.push(x);
    const dFn = debounce(fn, 100);

    dFn(1);
    dFn(2);
    dFn(3);
    expect(calls).toHaveLength(0);

    advanceTimersByTime(99);
    expect(calls).toHaveLength(0);

    advanceTimersByTime(1);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBe(3);
  });

  it('延迟 0 也会在下一 tick 才执行（不是同步）', () => {
    const calls = [];
    const fn = () => calls.push('a');
    const dFn = debounce(fn, 0);

    dFn();
    expect(calls).toHaveLength(0);
    advanceTimersByTime(0);
    expect(calls).toHaveLength(1);
  });

  it('默认延迟为 300ms', () => {
    const calls = [];
    const fn = () => calls.push('x');
    const dFn = debounce(fn);

    dFn();
    advanceTimersByTime(299);
    expect(calls).toHaveLength(0);
    advanceTimersByTime(1);
    expect(calls).toHaveLength(1);
  });

  it('参数正确传递给原函数', () => {
    const args = [];
    const fn = (...a) => args.push(a);
    const dFn = debounce(fn, 50);

    dFn('hello', 42);
    advanceTimersByTime(60);
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual(['hello', 42]);
  });

  it('this 上下文正确绑定', () => {
    let ctx = null;
    const fn = function () {
      ctx = this;
    };
    const obj = { dFn: debounce(fn, 10) };

    obj.dFn();
    advanceTimersByTime(20);
    expect(ctx).toBe(obj);
  });

  it('连续调用会重置计时（debounce 的核心语义）', () => {
    const calls = [];
    const fn = () => calls.push('fire');
    const dFn = debounce(fn, 100);

    dFn();
    advanceTimersByTime(80);
    dFn();
    advanceTimersByTime(80);
    dFn();
    advanceTimersByTime(80);
    expect(calls).toHaveLength(0);

    advanceTimersByTime(20);
    expect(calls).toHaveLength(1);
  });
});

describe('throttle()', () => {
  beforeEach(() => {
    useFakeTimers();
  });

  afterEach(() => {
    useRealTimers();
  });

  it('首帧不立即执行，首次经过 delay 窗口后调用才触发', () => {
    const calls = [];
    const fn = () => calls.push('x');
    const tFn = throttle(fn, 100);

    tFn();
    expect(calls).toHaveLength(0);

    advanceTimersByTime(99);
    tFn();
    expect(calls).toHaveLength(0);

    advanceTimersByTime(1);
    tFn();
    expect(calls).toHaveLength(1);
  });

  it('在 delay 窗口内连续调用不重复触发', () => {
    const calls = [];
    const fn = () => calls.push('x');
    const tFn = throttle(fn, 100);

    advanceTimersByTime(100);
    tFn();
    expect(calls).toHaveLength(1);

    tFn();
    tFn();
    tFn();
    expect(calls).toHaveLength(1);
  });

  it('跨过 delay 后再次调用会触发', () => {
    const calls = [];
    const fn = () => calls.push('x');
    const tFn = throttle(fn, 100);

    advanceTimersByTime(100);
    tFn();
    expect(calls).toHaveLength(1);

    advanceTimersByTime(99);
    tFn();
    expect(calls).toHaveLength(1);

    advanceTimersByTime(1);
    tFn();
    expect(calls).toHaveLength(2);
  });

  it('默认延迟为 300ms', () => {
    const calls = [];
    const fn = () => calls.push('y');
    const tFn = throttle(fn);

    advanceTimersByTime(300);
    tFn();
    expect(calls).toHaveLength(1);

    advanceTimersByTime(299);
    tFn();
    expect(calls).toHaveLength(1);

    advanceTimersByTime(1);
    tFn();
    expect(calls).toHaveLength(2);
  });

  it('参数正确传递', () => {
    const args = [];
    const fn = (...a) => args.push(a);
    const tFn = throttle(fn, 50);

    advanceTimersByTime(50);
    tFn('a', 1);
    advanceTimersByTime(100);
    tFn('b', 2);

    expect(args).toHaveLength(2);
    expect(args[0]).toEqual(['a', 1]);
    expect(args[1]).toEqual(['b', 2]);
  });

  it('this 上下文正确绑定', () => {
    const ctxs = [];
    const fn = function () {
      ctxs.push(this);
    };
    const obj = { tFn: throttle(fn, 10) };

    advanceTimersByTime(10);
    obj.tFn();
    advanceTimersByTime(20);
    obj.tFn();

    expect(ctxs).toHaveLength(2);
    expect(ctxs[0]).toBe(obj);
    expect(ctxs[1]).toBe(obj);
  });

  it('长时间均匀调用只按间隔触发', () => {
    const calls = [];
    const fn = () => calls.push(Date.now());
    const tFn = throttle(fn, 100);

    // 共 550ms，每 10ms 调用一次
    for (let i = 0; i <= 550; i += 10) {
      if (i > 0) advanceTimersByTime(10);
      tFn();
    }

    // 首个可触发点在 100ms 附近，之后每隔约 100ms 一次
    // 550ms 内能触发的次数应该为 5 次左右 (100, 200, 300, 400, 500)
    expect(calls.length).toBeGreaterThanOrEqual(4);
    expect(calls.length).toBeLessThanOrEqual(6);

    for (let i = 1; i < calls.length; i++) {
      const gap = calls[i] - calls[i - 1];
      expect(gap).toBeGreaterThanOrEqual(90);
    }
  });
});
