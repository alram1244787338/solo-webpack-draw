import { readdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import './register.mjs';
import { _state, _color } from './register.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = __dirname;

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

async function runCase(caseItem, suite) {
  stats.total++;
  for (const be of suite.beforeEaches) {
    try {
      await be();
    } catch (err) {
      stats.failed++;
      stats.errors.push({ name: caseItem.name, error: err, phase: 'beforeEach' });
      console.log(`  ${_color('✗', 31)} ${caseItem.name}  [beforeEach 出错]`);
      return;
    }
  }

  try {
    await caseItem.fn();
    stats.passed++;
    console.log(`  ${_color('✓', 32)} ${caseItem.name}`);
  } catch (err) {
    stats.failed++;
    stats.errors.push({ name: caseItem.name, error: err, phase: 'test' });
    console.log(`  ${_color('✗', 31)} ${caseItem.name}`);
    console.log(`      ${_color(err.message || String(err), 31)}`);
  }

  for (const ae of suite.afterEaches) {
    try {
      await ae();
    } catch (err) {
      console.log(`      ${_color('[afterEach 出错] ' + (err.message || String(err)), 33)}`);
    }
  }
}

async function runSuite(suite, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${_color(suite.name, 36)}`);

  for (const c of suite.cases) {
    await runCase(c, suite);
  }

  if (suite.children) {
    for (const child of suite.children) {
      await runSuite(child, depth + 1);
    }
  }
}

async function main() {
  const files = readdirSync(TEST_DIR)
    .filter((f) => f.endsWith('.test.mjs'))
    .sort();

  console.log(_color('\n===== 运行测试 =====\n', 1));

  for (const file of files) {
    console.log(_color(`\n📄 ${file}`, 35));
    const modulePath = resolve(TEST_DIR, file);
    const prevSuiteCount = _state.suites.length;
    await import(modulePath);
    const newSuites = _state.suites.slice(prevSuiteCount);
    for (const s of newSuites) {
      await runSuite(s, 0);
    }
  }

  console.log(_color('\n====================\n', 1));

  if (stats.errors.length > 0) {
    console.log(_color('\n失败详情：', 31));
    for (const e of stats.errors) {
      console.log(`\n  • ${e.name}`);
      console.log(`    [${e.phase}] ${e.error && e.error.message ? e.error.message : String(e.error)}`);
      if (e.error && e.error.stack) {
        const stackLines = e.error.stack.split('\n').slice(1, 4);
        for (const line of stackLines) {
          console.log(`    ${line}`);
        }
      }
    }
  }

  console.log(`\n总用例: ${stats.total}  ` +
    _color(`通过: ${stats.passed}`, 32) + '  ' +
    _color(`失败: ${stats.failed}`, stats.failed > 0 ? 31 : 32) +
    '\n');

  process.exit(stats.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(_color('Runner 内部错误：', 31), err);
  process.exit(2);
});
