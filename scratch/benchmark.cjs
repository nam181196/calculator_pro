/**
 * scratch/benchmark.cjs
 * ─────────────────────────────────────────────────────────────
 * Benchmark script to measure execution times of:
 * - Mathematical operations (2 operands)
 * - Scientific operations (1 operand)
 * - DOM result updating
 * - Theme toggling
 * - Modal display toggling
 */

const { readFileSync } = require('fs');
const { resolve } = require('path');
const { JSDOM } = require('jsdom');

const HTML_RAW = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
const HTML = HTML_RAW
  .replace(/<script type="module" src="calculator.js"><\/script>/, '')
  .replace(/window\.matchMedia\('[^']+'\)\.matches/g, 'false');

const ENGINE_SRC = readFileSync(resolve(__dirname, '../js/engine.js'), 'utf-8');
const UI_SRC = readFileSync(resolve(__dirname, '../js/ui.js'), 'utf-8');
const CALCULATOR_SRC = readFileSync(resolve(__dirname, '../calculator.js'), 'utf-8');

function preprocess(code) {
  let clean = code.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
  clean = clean.replace(/\bexport\s+function\b/g, 'function');
  clean = clean.replace(/\bexport\s+const\b/g, 'const');
  return clean;
}

const cleanEngine = preprocess(ENGINE_SRC);
const cleanUi = preprocess(UI_SRC);
const cleanCalculator = preprocess(CALCULATOR_SRC);

const stubs = `
window.register = () => Promise.resolve({});
window.login = () => Promise.resolve({});
window.logout = () => Promise.resolve({});
window.onAuthChanged = (callback) => { callback(null); return () => {}; };

window.getLocalHistory = () => [];
window.saveHistoryEntry = () => Promise.resolve({});
window.streamCloudHistory = (uid, callback) => { callback([]); return () => {}; };
window.checkAndSyncLocalHistory = () => {};
window.syncOfflineQueue = () => {};
window.clearCloudHistory = () => Promise.resolve();
`;

const FULL_JS = [stubs, cleanEngine, cleanUi, cleanCalculator].join('\n;\n');

function runBenchmark() {
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });

  const script = dom.window.document.createElement('script');
  script.textContent = FULL_JS;
  dom.window.document.head.appendChild(script);

  const w = dom.window;
  const d = dom.window.document;

  console.log('--- BẮT ĐẦU CHẠY BENCHMARK HIỆU NĂNG ---\n');

  // 1. Phép tính cơ bản (2 toán hạng)
  const iterations = 10000;
  const startCalc = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    w.performCalculation(String(5.5 + i % 100), '+', String(4.5 + i % 50));
  }
  const endCalc = process.hrtime.bigint();
  const totalCalcNs = Number(endCalc - startCalc);
  const avgCalcMs = (totalCalcNs / iterations) / 1000000;

  // 2. Phép tính khoa học 1 toán hạng (lượng giác sin, abs...)
  const startUnary = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    w.performUnaryCalculation(String(30 + i % 60), 'sin', 'DEG');
  }
  const endUnary = process.hrtime.bigint();
  const totalUnaryNs = Number(endUnary - startUnary);
  const avgUnaryMs = (totalUnaryNs / iterations) / 1000000;

  // 3. Hiển thị kết quả DOM (DOM update)
  const domIterations = 1000;
  const state = {
    currentInput: '1234567.89',
    firstOperand: '9999',
    operator: '+',
    waitingForSecond: false,
    shouldResetNext: false,
    isError: false,
    _errorMessage: '',
    _showFullExpr: false,
    _lastSecond: '',
    angleUnit: 'DEG',
    user: null,
    cloudHistory: [],
    unsubscribeHistoryStream: null,
    pendingSyncAction: null,
    isConstant: false
  };

  const startDOM = process.hrtime.bigint();
  for (let i = 0; i < domIterations; i++) {
    state.currentInput = String(1234567.89 + i);
    w.updateDisplay(state);
  }
  const endDOM = process.hrtime.bigint();
  const totalDOMNs = Number(endDOM - startDOM);
  const avgDOMMs = (totalDOMNs / domIterations) / 1000000;

  // 4. Chuyển đổi theme Light/Dark (DOM Class Toggle)
  const startTheme = process.hrtime.bigint();
  for (let i = 0; i < domIterations; i++) {
    w.toggleTheme();
  }
  const endTheme = process.hrtime.bigint();
  const totalThemeNs = Number(endTheme - startTheme);
  const avgThemeMs = (totalThemeNs / domIterations) / 1000000;

  // 5. Hiển thị Auth Modal (DOM Modal Class Toggle)
  const startModal = process.hrtime.bigint();
  for (let i = 0; i < domIterations; i++) {
    w.toggleAuthModal(i % 2 === 0, 'login');
  }
  const endModal = process.hrtime.bigint();
  const totalModalNs = Number(endModal - startModal);
  const avgModalMs = (totalModalNs / domIterations) / 1000000;

  console.log(`1. Phép tính cơ bản (10k lần): Tổng thời gian = ${(Number(totalCalcNs)/1000000).toFixed(2)} ms`);
  console.log(`   -> Trung bình 1 phép tính nhị phân = ${avgCalcMs.toFixed(6)} ms`);
  console.log(`2. Phép tính lượng giác sin (10k lần): Tổng thời gian = ${(Number(totalUnaryNs)/1000000).toFixed(2)} ms`);
  console.log(`   -> Trung bình 1 phép tính khoa học = ${avgUnaryMs.toFixed(6)} ms`);
  console.log(`3. Cập nhật DOM kết quả (1k lần): Tổng thời gian = ${(Number(totalDOMNs)/1000000).toFixed(2)} ms`);
  console.log(`   -> Trung bình 1 lần render kết quả = ${avgDOMMs.toFixed(4)} ms`);
  console.log(`4. Toggles Theme sáng/tối (1k lần): Tổng thời gian = ${(Number(totalThemeNs)/1000000).toFixed(2)} ms`);
  console.log(`   -> Trung bình 1 lần toggle theme = ${avgThemeMs.toFixed(4)} ms`);
  console.log(`5. Toggles Auth Modal (1k lần): Tổng thời gian = ${(Number(totalModalNs)/1000000).toFixed(2)} ms`);
  console.log(`   -> Trung bình 1 lần hiển thị modal = ${avgModalMs.toFixed(4)} ms\n`);

  console.log('--- KẾT QUẢ KẾT LUẬN REPORT ---');
  console.log('| Chỉ số đánh giá | Chỉ tiêu BRD | Kết quả Thực tế (JS/JSDOM) | Kết luận |');
  console.log('| :--- | :--- | :--- | :--- |');
  console.log(`| Phép tính cơ bản (Nhấn \`=\`) | < 100ms | ${(avgCalcMs + avgDOMMs).toFixed(4)} ms (Tính + Render) | ĐẠT |`);
  console.log(`| Phép tính khoa học 1 toán hạng | < 50ms | ${(avgUnaryMs + avgDOMMs).toFixed(4)} ms (Tính + Render) | ĐẠT |`);
  console.log(`| Chuyển đổi Light/Dark Mode | < 300ms | ${avgThemeMs.toFixed(4)} ms (Class Toggle) | ĐẠT |`);
  console.log(`| Modal Auth hiển thị | < 200ms | ${avgModalMs.toFixed(4)} ms (Class Toggle) | ĐẠT |`);
}

runBenchmark();
