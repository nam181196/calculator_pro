/**
 * tests/unit/setup.js
 * ─────────────────────────────────────────────────────────────
 * Tạo môi trường JSDOM độc lập cho mỗi test.
 *
 * Chiến lược v2.0.0:
 *  • Đọc index.html làm template DOM (đảm bảo đầy đủ các elements của v2).
 *  • Tiền xử lý các file JS: loại bỏ import/export để chạy dạng classic script.
 *  • Định nghĩa stubs giả lập cho Firebase Auth và Sync.
 *  • Khởi chạy tất cả trong window context của JSDOM.
 *
 * Ref: BUSINESS_REQUIREMENTS_v2.0.0.md, FUNCTION_SPECIFICATION_v2.0.0.md, SYSTEM_ARCHITECTURE_v2.0.0.md
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JSDOM } from 'jsdom'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Đọc index.html và tiền xử lý
const HTML_RAW = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8')
const HTML = HTML_RAW
  .replace(/<script type="module" src="calculator.js"><\/script>/, '')
  .replace(/window\.matchMedia\('[^']+'\)\.matches/g, 'false') // Thay thế matchMedia trong head để chống lỗi parser JSDOM

const ENGINE_SRC = readFileSync(resolve(__dirname, '../../js/engine.js'), 'utf-8')
const UI_SRC = readFileSync(resolve(__dirname, '../../js/ui.js'), 'utf-8')
const API_MOCK_SRC = readFileSync(resolve(__dirname, '../../js/api-mock.js'), 'utf-8')
const CALCULATOR_SRC = readFileSync(resolve(__dirname, '../../calculator.js'), 'utf-8')

// Hàm helper xóa các import/export của ES6 Modules để chạy trong JSDOM classic script
function preprocess(code) {
  // Loại bỏ import statements
  let clean = code.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '')
  // Thay thế "export function" -> "function", "export const" -> "const"
  clean = clean.replace(/\bexport\s+function\b/g, 'function')
  clean = clean.replace(/\bexport\s+const\b/g, 'const')
  clean = clean.replace(/\bexport\s+default\s+/g, '')

  // Xóa bỏ từ khóa async và await để các luồng chạy đồng bộ trong môi trường test
  clean = clean.replace(/\bawait\s+/g, '')
  clean = clean.replace(/\basync\s+/g, '')
  return clean
}

const cleanEngine = preprocess(ENGINE_SRC)
const cleanUi = preprocess(UI_SRC)
const cleanApiMock = preprocess(API_MOCK_SRC)
const cleanCalculator = preprocess(CALCULATOR_SRC)

// Định nghĩa stubs giả lập cho các hàm của Auth & Sync Service
// và polyfill các Web API thiếu trong JSDOM (Response, fetch)
const stubs = `
// Polyfill Response cho JSDOM (api-mock.js cần new Response())
if (typeof window.Response === 'undefined') {
  window.Response = class Response {
    constructor(body, init = {}) {
      this._body = body;
      this.status = init.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
      this.headers = init.headers || {};
    }
    json() { return JSON.parse(this._body); }
    text() { return this._body; }
  };
}

// Mock fetch ban đầu để api-mock.js có thể cache originalFetch
window.fetch = function() { return new Response('{}', { status: 404 }); };

// Service stubs — Auth
window.register = (email, password) => ({ uid: 'mock_uid_123', email });
window.login = (email, password) => ({ uid: 'mock_uid_123', email });
window.logout = () => ({});
window.onAuthChanged = (callback) => { callback(null); return () => {}; };

// Service stubs — Sync
window.getLocalHistory = () => [];
window.saveHistoryEntry = (expr, res, status, user) => ({ 
  id: 'mock_doc_id', 
  userId: user ? user.uid : null, 
  expression: expr, 
  result: res, 
  status, 
  timestamp: Date.now() 
});
window.streamCloudHistory = (uid, callback) => { callback([]); return () => {}; };
window.checkAndSyncLocalHistory = () => {};
window.syncOfflineQueue = () => {};
window.clearCloudHistory = () => ({});

// Giữ reference cho api-mock.js (originalFetch = window.fetch)
window.originalFetch = window.fetch;
`

// Ghép nối mã nguồn theo thứ tự phụ thuộc
const FULL_JS = [stubs, cleanEngine, cleanUi, cleanApiMock, cleanCalculator].join('\n;\n')

console.log("Vitest setup.js - JSDOM HTML length:", HTML.length);
console.log("Vitest setup.js - FULL_JS length:", FULL_JS.length);

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Tạo một môi trường Calculator độc lập.
 * Mỗi lần gọi trả về instance mới — KHÔNG chia sẻ state giữa các test.
 *
 * @returns {CalcEnv}
 */
export function createCalcEnv() {
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/', // Thiết lập URL để kích hoạt localStorage hợp lệ
    runScripts: 'dangerously',       // Cho phép <script> inline thực thi
    pretendToBeVisual: true,               // Kích hoạt một số Web API cần thiết
  })

  dom.window.addEventListener('error', (event) => {
    console.error("JSDOM Execution Error in test window:", event.error);
  });

  // Inject mã nguồn hợp nhất vào JSDOM
  const script = dom.window.document.createElement('script')
  script.textContent = FULL_JS
  dom.window.document.head.appendChild(script)

  const w = dom.window
  const d = dom.window.document

  console.log("In createCalcEnv: handleDigit is", typeof w.handleDigit);

  /** @type {CalcEnv} */
  return {
    // ── Handler functions ──────────────────────────────────────
    digit: (ch) => w.handleDigit(ch),
    decimal: () => w.handleDecimalPoint(),
    operator: (op) => w.handleOperator(op),
    equals: () => w.handleEquals(),
    clear: () => w.handleAllClear(),
    backspace: () => w.handleBackspace(),
    constant: (name) => w.handleConstant(name),        // v2.0.0: hằng số pi/e
    unary: (fn) => w.handleUnaryCalculation(fn),  // v2.0.0: phép toán 1 toán hạng

    // ── DOM State Readers ──────────────────────────────────────
    result: () => d.getElementById('display-result').textContent,
    expression: () => d.getElementById('display-expression').textContent,
    isError: () => d.getElementById('calculator').classList.contains('is-error'),
    activeOp: () => {
      const btn = d.querySelector('.btn--op.is-active')
      return btn ? btn.getAttribute('data-value') : null
    },
    angleUnit: () => d.getElementById('angle-badge').textContent, // v2.0.0: DEG/RAD badge
    toggleAngle: () => d.getElementById('btn-angle').click(),
  }
}

/**
 * Shorthand: nhập một chuỗi ký tự vào calculator.
 *
 * @param {CalcEnv} c
 * @param {...string} tokens
 */
export function press(c, ...tokens) {
  const OPS = new Set(['+', '−', '×', '÷'])
  for (const t of tokens) {
    if (t === '=') c.equals()
    else if (t === 'AC') c.clear()
    else if (t === '⌫') c.backspace()
    else if (t === '.') c.decimal()
    else if (OPS.has(t)) c.operator(t)
    else c.digit(t)
  }
}
