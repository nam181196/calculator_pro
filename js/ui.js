/* ============================================================
   js/ui.js — UI Manager (View Layer)
   Quản lý toàn bộ DOM: hiển thị số, biểu thức, sidebar, modal, theme
   Không thuộc FS API scope — là hành động DOM local thuần túy
   Ref: SYSTEM_ARCHITECTURE_v2.0.0.md — Section 5.2 (View Layer)
   ============================================================ */

'use strict';

// Caching DOM Elements
const docHtml = document.documentElement;
const elCalculator = document.getElementById('calculator');
const elExpression = document.getElementById('display-expression');
const elResult = document.getElementById('display-result');
const elAngleBadge = document.getElementById('angle-badge');

// Display Indicators Elements
const elIndicatorS = document.querySelector('.display__indicator[data-indicator="S"]');
const elIndicatorA = document.querySelector('.display__indicator[data-indicator="A"]');
const elIndicatorMath = document.querySelector('.display__indicator[data-indicator="Math"]');
const elIndicatorD = document.querySelector('.display__indicator[data-indicator="D"]');
const elIndicatorR = document.querySelector('.display__indicator[data-indicator="R"]');
const elIndicatorUp = document.querySelector('.display__indicator[data-indicator="up"]');
const elIndicatorDown = document.querySelector('.display__indicator[data-indicator="down"]');

// Sidebar Elements
const elSidebar = document.getElementById('sidebar');
const elSidebarOverlay = document.getElementById('sidebar-overlay');
const elHistoryList = document.getElementById('history-list');

// Auth Modals & Elements
const elAuthBtn = document.getElementById('btn-auth');
const elUserInfo = document.getElementById('user-info');
const elUserEmailDisplay = document.getElementById('user-email-display');
const elLogoutBtn = document.getElementById('btn-logout');

const elAuthModal = document.getElementById('auth-modal');
const elAuthForm = document.getElementById('auth-form');
const elModalTitle = document.getElementById('modal-title');
const elAuthEmail = document.getElementById('auth-email');
const elAuthPassword = document.getElementById('auth-password');
const elEmailError = document.getElementById('email-error');
const elPasswordError = document.getElementById('password-error');
const elFormErrorAlert = document.getElementById('form-error-alert');
const elAuthSubmitBtn = document.getElementById('auth-submit-btn');
const elModalToggleLink = document.getElementById('modal-toggle-link');
const elModalToggleText = document.getElementById('modal-toggle-text');
const elModalOverlay = document.getElementById('modal-overlay');

// Sync Modal Elements
const elSyncModal = document.getElementById('sync-modal');

// Keypad Tabs
const elKeypadTabs = document.getElementById('keypad-tabs');
const elKeypadBasic = document.getElementById('keypad-basic');
const elKeypadScientific = document.getElementById('keypad-scientific');
const elKeypadTools = document.getElementById('keypad-tools');

/**
 * Tokenizer for Display Layout Rendering
 */
function tokenizeDisplay(str) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    const char = str[i];
    const startIndex = i;
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    if (char === '⬚') {
      tokens.push({ type: 'PLACEHOLDER', value: '⬚', index: startIndex });
      i++;
      continue;
    }
    if (/\d/.test(char)) {
      let num = '';
      while (i < str.length && /[\d\.]/.test(str[i])) {
        num += str[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: num, index: startIndex });
      continue;
    }
    if (str.slice(i).startsWith('d/dx')) {
      tokens.push({ type: 'FUNCTION', value: 'd/dx', index: startIndex });
      i += 4;
      continue;
    }
    if (char === 'π') {
      tokens.push({ type: 'CONSTANT', value: 'pi', index: startIndex });
      i++;
      continue;
    }
    if (char === '∫') {
      tokens.push({ type: 'FUNCTION', value: '∫', index: startIndex });
      i++;
      continue;
    }
    if (/[a-zA-Z]/.test(char)) {
      let word = '';
      while (i < str.length && /[a-zA-Z\d]/.test(str[i])) {
        word += str[i];
        i++;
      }
      const lower = word.toLowerCase();
      if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'abs', 'sqrt', 'cbrt'].includes(lower)) {
        tokens.push({ type: 'FUNCTION', value: lower, index: startIndex });
      } else if (lower === 'pi') {
        tokens.push({ type: 'CONSTANT', value: 'pi', index: startIndex });
      } else if (lower === 'e') {
        tokens.push({ type: 'CONSTANT', value: 'e', index: startIndex });
      } else {
        tokens.push({ type: 'VARIABLE', value: word, index: startIndex });
      }
      continue;
    }
    if (str.slice(i).startsWith('ʸ√x')) {
      tokens.push({ type: 'OPERATOR', value: 'ʸ√x', index: startIndex });
      i += 3;
      continue;
    }
    if (['(', ')', ',', '+', '−', '-', '×', '*', '÷', '/', '^', '²', '³', '!', '%'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char, index: startIndex });
      i++;
      continue;
    }
    tokens.push({ type: 'UNKNOWN', value: char, index: startIndex });
    i++;
  }
  return tokens;
}

/**
 * Parser for Display Layout Rendering
 */
class DisplayParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }
  
  peek() {
    return this.tokens[this.pos] || null;
  }
  
  consume() {
    return this.tokens[this.pos++];
  }
  
  isFactorStart(token) {
    if (!token) return false;
    return token.type === 'NUMBER' || 
           token.type === 'VARIABLE' || 
           token.type === 'CONSTANT' || 
           token.type === 'FUNCTION' || 
           token.value === '(';
  }
  
  parse() {
    return this.parseExpression();
  }
  
  parseExpression() {
    let node = this.parseTerm();
    while (this.peek() && (this.peek().value === '+' || this.peek().value === '−' || this.peek().value === '-')) {
      const opToken = this.consume();
      const op = opToken.value === '-' ? '−' : opToken.value;
      const right = this.parseTerm();
      node = { type: 'binary', op, left: node, right };
    }
    return node;
  }
  
  parseTerm() {
    let node = this.parseFactor();
    while (this.peek() && (
      this.peek().value === '×' || 
      this.peek().value === '÷' || 
      this.peek().value === '/' || 
      this.peek().value === '*' ||
      this.isFactorStart(this.peek())
    )) {
      const opToken = this.peek();
      let op = '×';
      let isImplicit = true;
      if (opToken.type === 'OPERATOR' && ['×', '÷', '/', '*'].includes(opToken.value)) {
        this.consume();
        op = opToken.value;
        if (op === '*') op = '×';
        if (op === '/') op = '÷';
        isImplicit = false;
      }
      const right = this.parseFactor();
      node = { type: 'binary', op, left: node, right, isImplicit };
    }
    return node;
  }
  
  parseFactor() {
    let node = this.parsePrimary();
    while (this.peek() && (this.peek().value === '^' || this.peek().value === 'ʸ√x' || this.peek().value === '²' || this.peek().value === '³' || this.peek().value === '!' || this.peek().value === '%')) {
      const opToken = this.consume();
      const op = opToken.value;
      if (op === '^' || op === 'ʸ√x') {
        const right = this.parsePrimary();
        node = { type: 'binary', op, left: node, right };
      } else {
        node = { type: 'unary_post', op, left: node };
      }
    }
    return node;
  }
  
  parsePrimary() {
    const token = this.peek();
    if (!token) {
      return { type: 'placeholder', index: -1 };
    }
    
    if (token.type === 'PLACEHOLDER') {
      this.consume();
      return { type: 'placeholder', index: token.index };
    }
    
    if (token.value === '-' || token.value === '−') {
      this.consume();
      const next = this.parsePrimary();
      return { type: 'unary_pre', op: '−', value: next };
    }
    
    if (token.type === 'NUMBER') {
      this.consume();
      return { type: 'number', value: token.value };
    }
    if (token.type === 'VARIABLE') {
      this.consume();
      return { type: 'variable', value: token.value };
    }
    if (token.type === 'CONSTANT') {
      this.consume();
      return { type: 'constant', value: token.value };
    }
    
    if (token.type === 'FUNCTION') {
      const name = this.consume().value;
      if (this.peek() && this.peek().value === '(') {
        this.consume(); // '('
        const args = [];
        if (this.peek() && this.peek().value !== ')') {
          args.push(this.parseExpression());
          while (this.peek() && this.peek().value === ',') {
            this.consume(); // ','
            args.push(this.parseExpression());
          }
        }
        if (this.peek() && this.peek().value === ')') {
          this.consume(); // ')'
        }
        return { type: 'function', name, args };
      } else {
        return { type: 'function', name, args: [] };
      }
    }
    
    if (token.value === '(') {
      this.consume(); // '('
      const inner = this.parseExpression();
      if (this.peek() && this.peek().value === ')') {
        this.consume(); // ')'
      }
      return { type: 'paren', value: inner };
    }
    
    this.consume();
    return { type: 'unknown', value: token.value };
  }
}

/**
 * Render AST to styled HTML
 */
function renderASTToHTML(node, cursorIndex) {
  if (!node) return '';
  switch (node.type) {
    case 'number':
      return node.value;
    case 'variable':
      return node.value;
    case 'constant':
      return node.value === 'pi' ? 'π' : node.value;
    case 'placeholder':
      const hasCursor = (node.index !== undefined && node.index !== -1 && node.index === cursorIndex);
      const cursorClass = hasCursor ? ' has-cursor' : '';
      const dataIndexAttr = (node.index !== undefined && node.index !== -1) ? ` data-index="${node.index}"` : '';
      return `<span class="math-placeholder${cursorClass}"${dataIndexAttr}>⬚</span>`;
    case 'paren':
      return `(${renderASTToHTML(node.value, cursorIndex)})`;
    case 'unary_pre':
      return `−${renderASTToHTML(node.value, cursorIndex)}`;
    case 'unary_post':
      return `${renderASTToHTML(node.left, cursorIndex)}${node.op}`;
    case 'unknown':
      return node.value;
    case 'binary':
      const leftHTML = renderASTToHTML(node.left, cursorIndex);
      const rightHTML = renderASTToHTML(node.right, cursorIndex);
      
      if (node.op === '÷') {
        let numHTML = leftHTML;
        let denHTML = rightHTML;
        if (node.left && node.left.type === 'paren') {
          numHTML = renderASTToHTML(node.left.value, cursorIndex);
        }
        if (node.right && node.right.type === 'paren') {
          denHTML = renderASTToHTML(node.right.value, cursorIndex);
        }
        return `<span class="fraction"><span class="numerator">${numHTML}</span><span class="fraction-op" style="display:none"> ÷ </span><span class="denominator">${denHTML}</span></span>`;
      }
      
      if (node.op === '^') {
        return `${leftHTML}<span class="pow-op" style="display:none">^</span><sup>${rightHTML}</sup>`;
      }
      
      if (node.op === 'ʸ√x') {
        return `<sup style="font-size: 0.6em; vertical-align: super; margin-right: -0.2em;">${leftHTML}</sup><span class="pow-op" style="display:none">ʸ√x</span>√${rightHTML}`;
      }
      
      if (node.isImplicit) {
        return `${leftHTML}${rightHTML}`;
      }
      
      return `${leftHTML} <span class="op">${node.op}</span> ${rightHTML}`;
      
    case 'function':
      if (node.name === 'd/dx') {
        const f = node.args[0] ? renderASTToHTML(node.args[0], cursorIndex) : '<span class="math-placeholder">⬚</span>';
        const x0 = node.args[1] ? renderASTToHTML(node.args[1], cursorIndex) : '<span class="math-placeholder">⬚</span>';
        return `<span class="deriv-expr"><span class="fraction"><span class="numerator">d</span><span class="fraction-op" style="display:none">/</span><span class="denominator">dx</span></span><span class="pow-op" style="display:none">d/dx</span>(${f}, ${x0})</span>`;
      }
      
      if (node.name === '∫') {
        const f = node.args[0] ? renderASTToHTML(node.args[0], cursorIndex) : '<span class="math-placeholder">⬚</span>';
        const a = node.args[1] ? renderASTToHTML(node.args[1], cursorIndex) : '<span class="math-placeholder">⬚</span>';
        const b = node.args[2] ? renderASTToHTML(node.args[2], cursorIndex) : '<span class="math-placeholder">⬚</span>';
        return `<span class="integral-expr"><span class="integral-sym">∫</span><span class="limits" data-upper="${b}" data-lower="${a}"></span><span class="pow-op" style="display:none">∫</span><span class="integrand">(${f})</span><span style="display:none">(</span><span style="display:none">, ${a}, ${b})</span></span>`;
      }
      
      const argsHTML = node.args.map(arg => renderASTToHTML(arg, cursorIndex)).join(', ');
      return `<span class="func-name">${node.name}</span>(${argsHTML})`;
      
    default:
      return '';
  }
}

export function formatExpressionToHTML(expr, cursorIndex = null) {
  if (!expr) return '';
  try {
    const tokens = tokenizeDisplay(expr);
    const parser = new DisplayParser(tokens);
    const ast = parser.parse();
    return renderASTToHTML(ast, cursorIndex);
  } catch (e) {
    return expr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

export function formatUnaryExpression(value, functionName) {
  switch (functionName) {
    case 'sin':
    case 'cos':
    case 'tan':
    case 'asin':
    case 'acos':
    case 'atan':
    case 'ln':
    case 'log':
      return `${functionName}(${value})`;
    case 'sqrt':
      return `√(${value})`;
    case 'cbrt':
      return `³√(${value})`;
    case 'sq':
      return `(${value})²`;
    case 'cube':
      return `(${value})³`;
    case 'factorial':
      return `(${value})!`;
    case 'abs':
      return `|${value}|`;
    case 'percent':
      return `${value}%`;
    default:
      return `${functionName}(${value})`;
  }
}

/**
 * Cập nhật toàn bộ màn hình kết quả và biểu thức dựa vào State hiện tại.
 */
export function updateDisplay(state) {
  // 1. Dòng hiển thị kết quả (Bottom display)
  if (state.isError) {
    elResult.textContent = state._errorMessage || 'Lỗi toán học';
    elResult.className = 'display__result is-error';
  } else {
    elResult.textContent = state.currentInput;
    
    // Cỡ chữ động dựa trên độ dài (Responsive font size)
    const len = state.currentInput.length;
    const hasNewline = state.currentInput.includes('\n');
    if (hasNewline || len > 15) elResult.className = 'display__result size-xxl';
    else if (len > 11) elResult.className = 'display__result size-xl';
    else if (len > 9) elResult.className = 'display__result size-lg';
    else elResult.className = 'display__result';
  }

  // 2. Dòng hiển thị biểu thức (Top display)
  let displayExpr = '';
  if (state.isError) {
    displayExpr = state.expression || '';
  } else if (state._showFullExpr) {
    // Sau khi bấm "="
    displayExpr = state.expression;
  } else {
    // Đang nhập biểu thức PEMDAS dài
    displayExpr = state.expression || '';
    if (state.pendingUnary && state.waitingForUnaryInput) {
      displayExpr += formatUnaryExpression(state.currentInput, state.pendingUnary);
    } else {
      if (state.waitingForSecond) {
        // Nếu biểu thức kết thúc bằng toán tử và người dùng chưa gõ toán hạng tiếp theo, hiển thị: state.expression + "0"
        if (/[\+\−\×\÷\^]\s*$/.test(displayExpr)) {
          displayExpr += '0';
        }
      } else {
        // FSD §4 Step 3: Ghép nối liền mạch biểu thức
        if (state.currentInput && state.currentInput !== '0') {
          displayExpr += state.currentInput;
        } else if (state.currentInput === '0' && /[\+\−\×\÷\^]\s*$/.test(displayExpr)) {
          displayExpr += '0';
        }
      }
    }
  }
  elExpression.innerHTML = formatExpressionToHTML(displayExpr, state.cursorIndex);

  // 2.1 Co giãn font chữ tự động cho dòng biểu thức (Auto-scaling)
  // FSD §4 Step 6: Từ 1.8rem giảm dần xuống tối thiểu 1.1rem
  if (elExpression) {
    elExpression.style.fontSize = ''; // Reset về mặc định (1.8rem từ CSS)
    const scrollW = elExpression.scrollWidth;
    const clientW = elExpression.clientWidth;
    if (scrollW > clientW && clientW > 0) {
      const ratio = clientW / scrollW;
      const newSize = Math.max(1.1, parseFloat((1.8 * ratio).toFixed(2)));
      elExpression.style.fontSize = `${newSize}rem`;
    }
  }

  // 3. Highlight toán tử đang chọn
  document.querySelectorAll('.btn--op').forEach(btn => {
    btn.classList.toggle('is-active', !!(state.operator && btn.getAttribute('data-value') === state.operator));
  });

  // 4. Khóa/mở khóa calculator shell khi lỗi (BR-05)
  elCalculator.classList.toggle('is-error', state.isError);

  // 5. Cập nhật Badge góc (DEG/RAD)
  elAngleBadge.textContent = state.angleUnit;

  // 6. Cập nhật chỉ báo trạng thái (Indicators Bar)
  if (elIndicatorS) {
    elIndicatorS.classList.toggle('is-active', !!state.waitingForUnaryInput);
  }
  if (elIndicatorA) {
    elIndicatorA.classList.toggle('is-active', false);
  }
  if (elIndicatorMath) {
    elIndicatorMath.classList.add('is-active');
  }
  if (elIndicatorD) {
    elIndicatorD.classList.toggle('is-active', state.angleUnit === 'DEG');
  }
  if (elIndicatorR) {
    elIndicatorR.classList.toggle('is-active', state.angleUnit === 'RAD');
  }

  let hasHistory = false;
  try {
    const localHist = JSON.parse(localStorage.getItem('calc_local_history') || '[]');
    hasHistory = localHist.length >= 1;
  } catch (e) {}
  if (state.cloudHistory && state.cloudHistory.length >= 1) {
    hasHistory = true;
  }

  if (elIndicatorUp) {
    elIndicatorUp.classList.toggle('is-active', hasHistory);
  }
  if (elIndicatorDown) {
    elIndicatorDown.classList.toggle('is-active', hasHistory);
  }
}

/**
 * Toggle Chế độ giao diện Sáng/Tối.
 */
export function toggleTheme() {
  const isLight = docHtml.classList.toggle('light');
  const newTheme = isLight ? 'light' : 'dark';
  localStorage.setItem('calc_theme', newTheme);
}

/**
 * Hiển thị/Ẩn Sidebar Lịch sử.
 */
export function toggleSidebar(show) {
  elSidebar.classList.toggle('active', show);
  elSidebarOverlay.classList.toggle('active', show);
}

/**
 * Nạp danh sách lịch sử tính toán vào Sidebar.
 */
export function renderSidebarHistory(historyList, onSelectCard) {
  elHistoryList.innerHTML = '';

  if (!historyList || historyList.length === 0) {
    elHistoryList.innerHTML = '<p class="sidebar__empty">Chưa có lịch sử phép tính</p>';
    return;
  }

  historyList.forEach(item => {
    const card = document.createElement('div');
    card.className = `history-card ${item.status === 'error' ? 'history-card--error' : ''}`;
    card.innerHTML = `
      <div class="history-card__expr">${item.expression}</div>
      <div class="history-card__result">${item.result}</div>
    `;
    
    // Khi bấm vào card lịch sử, gọi callback khôi phục
    card.addEventListener('click', () => {
      onSelectCard(item);
      toggleSidebar(false); // Đóng sidebar
    });
    
    elHistoryList.appendChild(card);
  });
}

/**
 * Hiển thị/Ẩn Modal Xác thực (Auth Modal).
 */
export function toggleAuthModal(show, mode = 'login') {
  if (show) {
    switchAuthMode(mode);
    elAuthModal.classList.add('active');
    elModalOverlay.classList.add('active');
  } else {
    elAuthModal.classList.remove('active');
    elModalOverlay.classList.remove('active');
    clearAuthValidation();
  }
}

/**
 * Chuyển chế độ Đăng nhập / Đăng ký trong modal.
 */
export function switchAuthMode(mode) {
  clearAuthValidation();
  if (mode === 'register') {
    elModalTitle.textContent = 'Đăng ký';
    elAuthSubmitBtn.textContent = 'Đăng ký tài khoản';
    elModalToggleText.innerHTML = 'Đã có tài khoản? <a href="#" id="modal-toggle-link">Đăng nhập</a>';
    elAuthForm.dataset.mode = 'register';
  } else {
    elModalTitle.textContent = 'Đăng nhập';
    elAuthSubmitBtn.textContent = 'Đăng nhập';
    elModalToggleText.innerHTML = 'Chưa có tài khoản? <a href="#" id="modal-toggle-link">Đăng ký ngay</a>';
    elAuthForm.dataset.mode = 'login';
  }
}

/**
 * Hiển thị lỗi validate của form đăng nhập/đăng ký dưới input.
 */
export function showInputError(inputElId, message) {
  if (inputElId === 'email') {
    elEmailError.textContent = message;
    elAuthEmail.style.borderColor = message ? 'var(--clr-error)' : '';
  } else if (inputElId === 'password') {
    elPasswordError.textContent = message;
    elAuthPassword.style.borderColor = message ? 'var(--clr-error)' : '';
  }
}

/**
 * Hiển thị thông báo lỗi chung của form (ví dụ sai mật khẩu).
 */
export function showFormErrorAlert(message) {
  if (message) {
    elFormErrorAlert.textContent = message;
    elFormErrorAlert.style.display = 'block';
  } else {
    elFormErrorAlert.textContent = '';
    elFormErrorAlert.style.display = 'none';
  }
}

function clearAuthValidation() {
  elEmailError.textContent = '';
  elPasswordError.textContent = '';
  elFormErrorAlert.textContent = '';
  elFormErrorAlert.style.display = 'none';
  elAuthEmail.style.borderColor = '';
  elAuthPassword.style.borderColor = '';
  elAuthEmail.value = '';
  elAuthPassword.value = '';
}

/**
 * Hiển thị/Ẩn Modal xác nhận Đồng bộ.
 */
export function toggleSyncModal(show) {
  if (show) {
    elSyncModal.classList.add('active');
    elModalOverlay.classList.add('active');
  } else {
    elSyncModal.classList.remove('active');
    elModalOverlay.classList.remove('active');
  }
}

/**
 * Thay đổi trạng thái UI sau đăng nhập/đăng xuất thành công.
 */
export function updateAuthUI(user) {
  if (user) {
    elAuthBtn.classList.add('hidden');
    elUserInfo.classList.remove('hidden');
    elUserEmailDisplay.textContent = user.email;
  } else {
    elAuthBtn.classList.remove('hidden');
    elUserInfo.classList.add('hidden');
    elUserEmailDisplay.textContent = '';
  }
}

/**
 * Khởi tạo hành vi Tab Keypads trên màn hình mobile.
 */
export function updateKeypadsVisibility() {
  const isDesktop = window.innerWidth >= 768;
  const activeTab = document.querySelector('.keypad-tab.active');
  if (!activeTab) return;
  
  const target = activeTab.dataset.target;
  
  elKeypadBasic.classList.remove('active');
  elKeypadScientific.classList.remove('active');
  elKeypadTools.classList.remove('active');
  
  if (isDesktop) {
    if (target === 'basic' || target === 'scientific') {
      elKeypadBasic.classList.add('active');
      elKeypadScientific.classList.add('active');
    } else if (target === 'tools') {
      elKeypadTools.classList.add('active');
    }
  } else {
    if (target === 'basic') {
      elKeypadBasic.classList.add('active');
    } else if (target === 'scientific') {
      elKeypadScientific.classList.add('active');
    } else if (target === 'tools') {
      elKeypadTools.classList.add('active');
    }
  }
}

export function initKeypadTabs() {
  const tabs = document.querySelectorAll('.keypad-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateKeypadsVisibility();
    });
  });
  
  window.addEventListener('resize', updateKeypadsVisibility);
  updateKeypadsVisibility();
}

export function toggleSolverInputs(type) {
  const fields = document.querySelectorAll('.coef-field');
  fields.forEach(field => {
    const coef = field.dataset.coef;
    if (type === 'linear') {
      if (coef === 'a' || coef === 'b') {
        field.classList.remove('hidden');
      } else {
        field.classList.add('hidden');
      }
    } else if (type === 'quadratic') {
      if (coef === 'a' || coef === 'b' || coef === 'c') {
        field.classList.remove('hidden');
      } else {
        field.classList.add('hidden');
      }
    } else if (type === 'system2') {
      if (coef.startsWith('a') || coef.startsWith('b') || coef.startsWith('c')) {
        if (coef === 'a' || coef === 'b' || coef === 'c') {
          field.classList.add('hidden');
        } else {
          field.classList.remove('hidden');
        }
      }
    }
  });
}

export function displaySolverResult(message, isError = false) {
  const elResult = document.getElementById('solver-result');
  if (!elResult) return;
  
  elResult.textContent = message;
  if (isError) {
    elResult.className = 'tool-result is-error';
  } else {
    elResult.className = 'tool-result is-success';
  }
}

export function displayIntegralResult(message, isError = false) {
  const elResult = document.getElementById('integral-result');
  if (!elResult) return;
  
  elResult.textContent = message;
  if (isError) {
    elResult.className = 'tool-result is-error';
  } else {
    elResult.className = 'tool-result is-success';
  }
}
