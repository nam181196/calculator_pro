/* ============================================================
   calculator.js — Simple Calculator Web App Controller
   Architecture: Engine Layer + Service Layers → Controller Layer → View Layer
   ============================================================ */

'use strict';

console.log("Scientific Calculator v2.1.2 loaded - Non-eager PEMDAS");

import './js/api-mock.js';
import { tokenize } from './js/engine.js';


import { 
  updateDisplay, 
  toggleTheme, 
  toggleSidebar, 
  renderSidebarHistory, 
  toggleAuthModal, 
  switchAuthMode, 
  showInputError, 
  showFormErrorAlert, 
  updateAuthUI, 
  initKeypadTabs,
  toggleSyncModal,
  formatUnaryExpression,
  toggleSolverInputs,
  displaySolverResult,
  displayIntegralResult
} from './js/ui.js';

import { 
  onAuthChanged 
} from './auth/firebase-auth.js';

import { 
  getLocalHistory, 
  streamCloudHistory, 
  checkAndSyncLocalHistory
} from './js/sync.js';

// ============================================================
// STATE MODEL
// ============================================================
const state = {
  currentInput: '0',
  expression: '',
  firstOperand: '',
  operator: null,
  waitingForSecond: false,
  shouldResetNext: false,
  isError: false,
  _errorMessage: '',
  _showFullExpr: false,
  _lastSecond: '',
  angleUnit: localStorage.getItem('calc_angle_unit') || 'DEG',
  user: null,
  cloudHistory: [],
  unsubscribeHistoryStream: null,
  pendingSyncAction: null,
  isConstant: false,
  pendingUnary: null,
  waitingForUnaryInput: false,
  unaryOperand: '',
  cursorIndex: null
};

// Reset state values while keeping angle unit and user intact
function resetState() {
  state.currentInput = '0';
  state.expression = '';
  state.firstOperand = '';
  state.operator = null;
  state.waitingForSecond = false;
  state.shouldResetNext = false;
  state.isError = false;
  state._errorMessage = '';
  state._showFullExpr = false;
  state._lastSecond = '';
  state.isConstant = false;
  state.pendingUnary = null;
  state.waitingForUnaryInput = false;
  state.unaryOperand = '';
  state.cursorIndex = null;
}

// ============================================================
// CONTROLLER LOGIC
// ============================================================

/**
 * BR-03: Kiểm tra giới hạn độ dài biểu thức (100 ký tự).
 * Trả về true nếu biểu thức đã đạt hoặc vượt giới hạn.
 */
function isExpressionLimitReached() {
  const totalLen = (state.expression + state.currentInput).replace(/\s/g, '').length;
  return totalLen >= 100;
}

function pushCurrentInputToExpression() {
  if (state.currentInput && state.currentInput !== '0') {
    state.expression += state.currentInput;
    state.currentInput = '0';
  }
}

function insertAtCursor(char) {
  if (state.cursorIndex === null) {
    state.expression += char;
  } else if (state.cursorIndex >= state.expression.length) {
    state.expression += char;
    state.cursorIndex = state.expression.length;
  } else {
    const idx = state.cursorIndex;
    const currentExpr = state.expression;
    if (currentExpr[idx] === '⬚') {
      state.expression = currentExpr.slice(0, idx) + char + currentExpr.slice(idx + 1);
      state.cursorIndex = idx + char.length;
    } else {
      state.expression = currentExpr.slice(0, idx) + char + currentExpr.slice(idx);
      state.cursorIndex = idx + char.length;
    }
  }
  if (state.expression === '') {
    state.cursorIndex = null;
  }
}

function handleDigit(digit) {
  if (state.isError) return;
  if (!state.shouldResetNext && isExpressionLimitReached()) return;

  state._showFullExpr = false;

  if (state.shouldResetNext) {
    resetState();
    state.currentInput = (digit === '0') ? '0' : digit;
    updateDisplay(state);
    return;
  }

  if (state.cursorIndex !== null) {
    insertAtCursor(digit);
    updateDisplay(state);
    return;
  }

  const digitCount = state.currentInput.replace(/[^0-9]/g, '').length;
  if (digitCount >= 15) return;

  if (state.waitingForSecond) {
    state.currentInput = digit;
    state.waitingForSecond = false;
    state.operator = null;
  } else if (state.isConstant) {
    pushCurrentInputToExpression();
    state.currentInput = digit;
    state.isConstant = false;
    state.operator = null;
  } else if (state.currentInput === '0') {
    state.currentInput = digit;
  } else {
    state.currentInput += digit;
  }

  updateDisplay(state);
}

function handleDecimalPoint() {
  if (state.isError) return;
  if (!state.shouldResetNext && isExpressionLimitReached()) return;

  state._showFullExpr = false;

  if (state.shouldResetNext) {
    resetState();
    state.currentInput = '0.';
    updateDisplay(state);
    return;
  }

  if (state.cursorIndex !== null) {
    insertAtCursor('.');
    updateDisplay(state);
    return;
  }

  if (state.waitingForSecond) {
    state.currentInput = '0.';
    state.waitingForSecond = false;
    state.operator = null;
    updateDisplay(state);
    return;
  }

  if (state.isConstant) {
    pushCurrentInputToExpression();
    state.currentInput = '0.';
    state.isConstant = false;
    state.operator = null;
    updateDisplay(state);
    return;
  }

  if (state.currentInput.includes('.')) return;

  state.currentInput += '.';
  updateDisplay(state);
}

function handleConstant(constantName) {
  if (state.isError) return;

  if (!state.shouldResetNext && isExpressionLimitReached()) return;

  if (state.shouldResetNext) {
    resetState();
  }

  if (state.cursorIndex !== null) {
    const val = constantName === 'pi' ? 'π' : 'e';
    insertAtCursor(val);
    updateDisplay(state);
    return;
  }

  if (state.waitingForSecond) {
    state.waitingForSecond = false;
    state.operator = null;
  }

  pushCurrentInputToExpression();
  state.currentInput = constantName === 'pi' ? '3.1415926536' : '2.7182818285';
  state.isConstant = true;
  state._showFullExpr = false;
  updateDisplay(state);
}

function handleParenthesis(paren) {
  if (state.isError) return;
  if (!state.shouldResetNext && isExpressionLimitReached()) return;
  state._showFullExpr = false;
  
  if (state.shouldResetNext) {
    resetState();
  }

  if (state.cursorIndex !== null) {
    insertAtCursor(paren);
    updateDisplay(state);
    return;
  }

  if (state.waitingForSecond) {
    state.waitingForSecond = false;
    state.operator = null;
  }
  
  pushCurrentInputToExpression();
  state.expression += paren;
  updateDisplay(state);
}

function handleVariable(varName) {
  if (state.isError) return;
  if (!state.shouldResetNext && isExpressionLimitReached()) return;

  if (state.shouldResetNext) {
    resetState();
  }

  if (state.cursorIndex !== null) {
    insertAtCursor(varName);
    updateDisplay(state);
    return;
  }

  if (state.waitingForSecond) {
    state.waitingForSecond = false;
    state.operator = null;
  }

  pushCurrentInputToExpression();
  state.currentInput = varName;
  state.isConstant = true;
  state._showFullExpr = false;
  updateDisplay(state);
}

function handleFraction() {
  if (state.isError) return;
  if (!state.shouldResetNext && isExpressionLimitReached()) return;
  
  state._showFullExpr = false;
  
  if (state.shouldResetNext) {
    resetState();
  }
  
  const fractionTemplate = '(⬚)/(⬚)';
  
  if (state.cursorIndex === null) {
    pushCurrentInputToExpression();
    const startIdx = state.expression.length;
    state.expression += fractionTemplate;
    state.cursorIndex = startIdx + 1;
  } else {
    const idx = state.cursorIndex;
    const currentExpr = state.expression;
    if (currentExpr[idx] === '⬚') {
      state.expression = currentExpr.slice(0, idx) + fractionTemplate + currentExpr.slice(idx + 1);
      state.cursorIndex = idx + 1;
    } else {
      state.expression = currentExpr.slice(0, idx) + fractionTemplate + currentExpr.slice(idx);
      state.cursorIndex = idx + 1;
    }
  }
  
  updateDisplay(state);
}

function tokensContainFreeX(tokens) {
  for (const token of tokens) {
    if (token.type === 'VARIABLE' && token.value === 'x') {
      return true;
    }
    if (token.type === 'CALCULUS_FUNC') {
      if (token.value === 'd/dx') {
        if (token.subRPNs && token.subRPNs[1] && tokensContainFreeX(token.subRPNs[1])) {
          return true;
        }
      } else if (token.value === '∫') {
        if (token.subRPNs && (
          (token.subRPNs[1] && tokensContainFreeX(token.subRPNs[1])) ||
          (token.subRPNs[2] && tokensContainFreeX(token.subRPNs[2]))
        )) {
          return true;
        }
      }
    }
  }
  return false;
}

function hasFreeVariableX(expr) {
  try {
    const tokens = tokenize(expr);
    return tokensContainFreeX(tokens);
  } catch (e) {
    return expr.toLowerCase().includes('x');
  }
}

function handleUnaryCalculation(functionName) {
  if (state.isError) return;

  if (!state.shouldResetNext && isExpressionLimitReached()) return;

  if (state.waitingForSecond) {
    state.waitingForSecond = false;
    state.operator = null;
  }

  const isPrefix = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'abs', 'sqrt', 'cbrt'].includes(functionName);

  if (isPrefix) {
    if (state.currentInput !== '0') {
      const wrapped = formatUnaryExpression(state.currentInput, functionName);
      if (state.shouldResetNext) {
        state.expression = wrapped;
        state.shouldResetNext = false;
      } else {
        state.expression += wrapped;
      }
      state.currentInput = '0';
      state.isConstant = false;
    } else {
      if (state.shouldResetNext) {
        state.shouldResetNext = false;
      }
      state.pendingUnary = functionName;
      state.waitingForUnaryInput = true;
      state.unaryOperand = '0';
      state.currentInput = '0';
    }
  } else {
    // Postfix functions
    const operand = state.currentInput;
    const wrapped = formatUnaryExpression(operand, functionName);
    
    if (state.shouldResetNext) {
      state.expression = wrapped;
      state.shouldResetNext = false;
    } else {
      state.expression += wrapped;
    }
    state.currentInput = '0';
    state.isConstant = false;
  }

  updateDisplay(state);
}

async function handleOperator(op) {
  if (state.isError) return;

  state._showFullExpr = false;

  const isChaining = /[\+\−\×\÷\^\ʸ√x]/.test(state.expression) && !state.waitingForSecond;
  if (!state.shouldResetNext && !isChaining && isExpressionLimitReached()) return;

  if (state.shouldResetNext) {
    state.expression = state.currentInput + ' ' + op + ' ';
    state.currentInput = '0';
    state.shouldResetNext = false;
    state.isConstant = false;
    state.waitingForSecond = true;
    state.operator = op;
    updateDisplay(state);
    return;
  }

  if (state.cursorIndex !== null) {
    const isAtEnd = state.cursorIndex >= state.expression.length || 
                    (state.cursorIndex === state.expression.length - 1 && state.expression[state.cursorIndex] === ')');
    if (isAtEnd) {
      state.cursorIndex = null;
      state.expression += ' ' + op + ' ';
      state.isConstant = false;
      state.waitingForSecond = true;
      state.operator = op;
      updateDisplay(state);
      return;
    } else {
      insertAtCursor(op);
      updateDisplay(state);
      return;
    }
  }

  if (state.pendingUnary) {
    state.expression += formatUnaryExpression(state.currentInput, state.pendingUnary) + ' ' + op + ' ';
    state.pendingUnary = null;
    state.waitingForUnaryInput = false;
    state.currentInput = '0';
    state.isConstant = false;
    state.waitingForSecond = true;
    state.operator = op;
    updateDisplay(state);
    return;
  }

  if (state.currentInput !== '0' || state.isConstant) {
    pushCurrentInputToExpression();
    state.expression += ' ' + op + ' ';
    state.isConstant = false;
    state.waitingForSecond = true;
    state.operator = op;
  } else {
    const match = state.expression.match(/[\+\−\×\÷\^\ʸ√x]\s*$/);
    if (match) {
      state.expression = state.expression.replace(/[\+\−\×\÷\^\ʸ√x]\s*$/, op + ' ');
      state.waitingForSecond = true;
      state.operator = op;
    } else {
      const endsWithOperand = /[\d\u03C0eXx\)\²\³\!\%]$/.test(state.expression.trim());
      if (endsWithOperand) {
        state.expression += ' ' + op + ' ';
      } else {
        state.expression += '0 ' + op + ' ';
      }
      state.waitingForSecond = true;
      state.operator = op;
    }
  }

  updateDisplay(state);
}

async function handleEquals() {
  state.cursorIndex = null;
  if (state.isError || state.shouldResetNext || state.waitingForSecond) return;

  let finalExpr = state.expression;
  if (state.pendingUnary) {
    finalExpr += formatUnaryExpression(state.currentInput, state.pendingUnary);
  } else if (!state.expression || state.expression.endsWith(' ')) {
    finalExpr += state.currentInput;
  }
  
  if (!finalExpr) return;

  try {
    const hasX = hasFreeVariableX(finalExpr);
    const endpoint = hasX ? '/engine/solve-x' : '/engine/calculate';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: finalExpr, angleUnit: state.angleUnit })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi toán học');
    }
    
    state.expression = finalExpr;
    state.currentInput = data.result;
    state.shouldResetNext = true;
    state._showFullExpr = true;
    state.pendingUnary = null;
    state.waitingForUnaryInput = false;
    state.isConstant = false;
    state.operator = null;
    updateDisplay(state);

    try {
      const historyResponse = await fetch('/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression: finalExpr,
          result: data.result,
          status: 'success',
          userId: state.user ? state.user.uid : null
        })
      });
      if (historyResponse.ok) {
        refreshHistoryUI();
      }
    } catch (historyErr) {
      console.error("Lỗi khi lưu lịch sử:", historyErr);
    }
  } catch (err) {
    state.isError = true;
    state._errorMessage = err.message;
    state.expression = finalExpr;
    state.pendingUnary = null;
    state.waitingForUnaryInput = false;
    state.isConstant = false;
    state.operator = null;
    updateDisplay(state);

    try {
      const historyResponse = await fetch('/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression: finalExpr,
          result: err.message,
          status: 'error',
          userId: state.user ? state.user.uid : null
        })
      });
      if (historyResponse.ok) {
        refreshHistoryUI();
      }
    } catch (historyErr) {
      console.error("Lỗi khi lưu lịch sử:", historyErr);
    }
  }
}

function handleAllClear() {
  resetState();
  updateDisplay(state);
}

function handleBackspace() {
  if (state.isError || state.shouldResetNext || state.waitingForSecond) return;
  
  state._showFullExpr = false;

  if (state.cursorIndex !== null) {
    if (state.cursorIndex > 0) {
      const idx = state.cursorIndex;
      const currentExpr = state.expression;
      let newExpr = currentExpr.slice(0, idx - 1) + currentExpr.slice(idx);
      let newCursor = idx - 1;
      
      if (newCursor > 0 && newExpr[newCursor - 1] === '(' && newExpr[newCursor] === ')') {
        newExpr = newExpr.slice(0, newCursor) + '⬚' + newExpr.slice(newCursor);
      }
      
      state.expression = newExpr;
      state.cursorIndex = newCursor;
      if (state.expression === '') {
        state.cursorIndex = null;
      }
    }
    updateDisplay(state);
    return;
  }

  if (state.waitingForUnaryInput) {
    if (state.currentInput !== '0' && state.currentInput !== '') {
      state.currentInput = state.currentInput.slice(0, -1);
      if (state.currentInput === '' || state.currentInput === '-') {
        state.currentInput = '0';
      }
    } else {
      state.pendingUnary = null;
      state.waitingForUnaryInput = false;
    }
    updateDisplay(state);
    return;
  }

  if (state.isConstant) {
    state.currentInput = '0';
    state.isConstant = false;
    updateDisplay(state);
    return;
  }

  if (state.currentInput !== '0' && state.currentInput !== '') {
    state.currentInput = state.currentInput.slice(0, -1);
    if (state.currentInput === '' || state.currentInput === '-') {
      state.currentInput = '0';
    }
  } else {
    let combined = state.expression;
    if (combined.length > 0) {
      if (combined.endsWith(' ')) {
        state.expression = combined.trim().slice(0, -1).trim();
      } else {
        state.expression = combined.slice(0, -1);
      }
    }
  }

  updateDisplay(state);
}

// ============================================================
// SYSTEM & SYNC INTEGRATION
// ============================================================

function refreshHistoryUI() {
  const historyList = state.user ? state.cloudHistory : getLocalHistory();
  renderSidebarHistory(historyList, handleSelectHistoryCard);
}

function handleSelectHistoryCard(item) {
  if (state.isError) {
    state.isError = false;
    state._errorMessage = '';
  }
  state.currentInput = item.result;
  state.expression = item.expression;
  state._showFullExpr = true;
  state.shouldResetNext = true;
  state.isConstant = true;
  updateDisplay(state);
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ============================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================

// Keypad Tabs initialization
initKeypadTabs();

// Theme trigger
document.getElementById('btn-theme').addEventListener('click', () => {
  toggleTheme();
});

// Angle Toggle (DEG/RAD)
document.getElementById('btn-angle').addEventListener('click', () => {
  state.angleUnit = state.angleUnit === 'DEG' ? 'RAD' : 'DEG';
  localStorage.setItem('calc_angle_unit', state.angleUnit);
  updateDisplay(state);
});

// Sidebar History trigger
document.getElementById('btn-history').addEventListener('click', () => {
  refreshHistoryUI();
  toggleSidebar(true);
});

document.getElementById('sidebar-close-btn').addEventListener('click', () => {
  toggleSidebar(false);
});

document.getElementById('sidebar-overlay').addEventListener('click', () => {
  toggleSidebar(false);
});

document.getElementById('clear-history-btn').addEventListener('click', async () => {
  const confirmClear = confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử không?');
  if (!confirmClear) return;

  if (state.user) {
    try {
      const response = await fetch(`/history?userId=${state.user.uid}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
    } catch (err) {
      alert('Không thể xóa lịch sử đám mây. Vui lòng thử lại.');
    }
  } else {
    localStorage.removeItem('calc_local_history');
    refreshHistoryUI();
  }
});

// Auth triggers
document.getElementById('btn-auth').addEventListener('click', () => {
  toggleAuthModal(true, 'login');
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  try {
    const response = await fetch('/auth/logout', {
      method: 'POST'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('modal-toggle-text').addEventListener('click', (e) => {
  if (e.target.id === 'modal-toggle-link') {
    e.preventDefault();
    const currentMode = document.getElementById('auth-form').dataset.mode;
    const newMode = currentMode === 'login' ? 'register' : 'login';
    switchAuthMode(newMode);
  }
});

document.getElementById('modal-close-btn').addEventListener('click', () => {
  toggleAuthModal(false);
});

document.getElementById('modal-overlay').addEventListener('click', () => {
  toggleAuthModal(false);
});

// Auth form submission handler
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  showInputError('email', '');
  showInputError('password', '');
  showFormErrorAlert('');

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const mode = document.getElementById('auth-form').dataset.mode || 'login';

  let hasError = false;
  if (!email) {
    showInputError('email', 'Email không được để trống.');
    hasError = true;
  } else if (!validateEmail(email)) {
    showInputError('email', 'Email không đúng định dạng.');
    hasError = true;
  }

  if (!password) {
    showInputError('password', 'Mật khẩu không được để trống.');
    hasError = true;
  } else if (password.length < 6) {
    showInputError('password', 'Mật khẩu phải chứa ít nhất 6 ký tự.');
    hasError = true;
  }

  if (hasError) return;

  const submitBtn = document.getElementById('auth-submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Đang xử lý...';
  submitBtn.disabled = true;

  try {
    if (mode === 'login') {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
    } else {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
    }
    toggleAuthModal(false);
  } catch (err) {
    showFormErrorAlert(err.message);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Sync modal event listeners
document.getElementById('sync-confirm-btn').addEventListener('click', async () => {
  if (state.pendingSyncAction) {
    const confirmBtn = document.getElementById('sync-confirm-btn');
    confirmBtn.disabled = true;
    try {
      await state.pendingSyncAction();
    } finally {
      confirmBtn.disabled = false;
    }
    state.pendingSyncAction = null;
  }
  toggleSyncModal(false);
  refreshHistoryUI();
});

document.getElementById('sync-cancel-btn').addEventListener('click', () => {
  state.pendingSyncAction = null;
  toggleSyncModal(false);
});

async function syncOfflineQueueViaFetch(uid) {
  const queueData = localStorage.getItem('calc_offline_queue');
  const queue = queueData ? JSON.parse(queueData) : [];
  if (queue.length === 0) return;

  try {
    const response = await fetch('/history/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid, entries: queue })
    });
    if (response.ok) {
      localStorage.removeItem('calc_offline_queue');
      console.log("Đồng bộ hàng đợi offline hoàn tất.");
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ hàng đợi offline:", error);
  }
}

// Listen for network reconnect to sync offline history entries
window.addEventListener('online', () => {
  if (state.user) {
    syncOfflineQueueViaFetch(state.user.uid);
  }
});

// Firebase Auth changes listener
onAuthChanged((user) => {
  state.user = user;
  updateAuthUI(user);

  if (user) {
    // Unsubscribe from previous stream if exists
    if (state.unsubscribeHistoryStream) {
      state.unsubscribeHistoryStream();
    }

    // Start streaming cloud history
    state.unsubscribeHistoryStream = streamCloudHistory(user.uid, (historyList) => {
      state.cloudHistory = historyList;
      refreshHistoryUI();
    });

    // Check for local calculations to sync
    checkAndSyncLocalHistory(user.uid, (confirmAction) => {
      state.pendingSyncAction = confirmAction;
      toggleSyncModal(true);
    });

    // Sync any offline entries stored in queue
    syncOfflineQueueViaFetch(user.uid);
  } else {
    // Clean up cloud context
    if (state.unsubscribeHistoryStream) {
      state.unsubscribeHistoryStream();
      state.unsubscribeHistoryStream = null;
    }
    state.cloudHistory = [];
    refreshHistoryUI();
  }
});

// ============================================================
// KEYBOARD & CLICK EVENT DELEGATION
// ============================================================

document.addEventListener('keydown', function handleKeydown(event) {
  if (document.activeElement && (
      document.activeElement.tagName === 'INPUT' || 
      document.activeElement.tagName === 'TEXTAREA'
  )) return;

  const key = event.key;

  if (key === '/') {
    event.preventDefault();
  }
  if (key === 'Enter') {
    event.preventDefault();
  }

  if (key >= '0' && key <= '9') {
    handleDigit(key);
    animateButton(`[data-value="${key}"]`);
  } else if (key === '.') {
    handleDecimalPoint();
    animateButton('#btn-decimal');
  } else if (key === '+') {
    handleOperator('+');
    animateButton('#btn-add');
  } else if (key === '-') {
    handleOperator('−');
    animateButton('#btn-subtract');
  } else if (key === '*') {
    handleOperator('×');
    animateButton('#btn-multiply');
  } else if (key === '/') {
    handleOperator('÷');
    animateButton('#btn-divide');
  } else if (key === 'Enter' || key === '=') {
    handleEquals();
    animateButton('#btn-equals');
  } else if (key === 'Backspace') {
    handleBackspace();
    animateButton('#btn-backspace');
  } else if (key === 'Escape') {
    handleAllClear();
    animateButton('#btn-ac');
  } else if (key === 'p' || key === 'P') {
    handleConstant('pi');
    animateButton('.btn--sci[data-value="pi"]');
  } else if (key === 'e' || key === 'E') {
    handleConstant('e');
    animateButton('.btn--sci[data-value="e"]');
  } else if (key === '!') {
    handleUnaryCalculation('factorial');
    animateButton('.btn--sci[data-value="factorial"]');
  } else if (key === '%') {
    handleUnaryCalculation('percent');
    animateButton('.btn--sci[data-value="percent"]');
  } else if (key === '^') {
    handleOperator('^');
    animateButton('.btn--sci[data-value="^"]');
  } else if (key === 'x' || key === 'X') {
    handleVariable('x');
    animateButton('#btn-var-x');
  } else if (key === '(' || key === ')') {
    handleParenthesis(key);
  }
});

function animateButton(selector) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.classList.add('key-pressed');
  setTimeout(() => btn.classList.remove('key-pressed'), 120);
}

// Click on placeholders in the expression
document.getElementById('display-expression').addEventListener('click', function(event) {
  const placeholder = event.target.closest('.math-placeholder');
  if (!placeholder) return;
  
  const dataIndex = placeholder.getAttribute('data-index');
  if (dataIndex !== null) {
    state.cursorIndex = parseInt(dataIndex, 10);
    updateDisplay(state);
  }
});

// Click Delegation
document.querySelector('.keypads').addEventListener('click', function(event) {
  const btn = event.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  switch (action) {
    case 'digit':
      handleDigit(value);
      break;
    case 'operator':
      handleOperator(value);
      break;
    case 'decimal':
      handleDecimalPoint();
      break;
    case 'constant':
      handleConstant(value);
      break;
    case 'variable':
      handleVariable(value);
      break;
    case 'fraction':
      handleFraction();
      break;
    case 'sci-1op':
      handleUnaryCalculation(value);
      break;
    case 'equals':
      handleEquals();
      break;
    case 'ac':
      handleAllClear();
      break;
    case 'backspace':
      handleBackspace();
      break;
  }
});

// ============================================================
// TOOLS EVENT HANDLERS (Solver & Integral)
// ============================================================

const elSolverType = document.getElementById('solver-type');
if (elSolverType) {
  elSolverType.addEventListener('change', (e) => {
    toggleSolverInputs(e.target.value);
  });
  // Initial setup
  toggleSolverInputs(elSolverType.value);
}

const elBtnSolve = document.getElementById('btn-solve');
if (elBtnSolve) {
  elBtnSolve.addEventListener('click', async () => {
    const type = document.getElementById('solver-type').value;
    let coefs = [];
    
    if (type === 'linear') {
      const a = document.getElementById('coef-a').value.trim();
      const b = document.getElementById('coef-b').value.trim();
      if (a === '' || b === '') {
        displaySolverResult("Vui lòng nhập đầy đủ hệ số", true);
        return;
      }
      coefs = [parseFloat(a), parseFloat(b)];
    } else if (type === 'quadratic') {
      const a = document.getElementById('coef-a').value.trim();
      const b = document.getElementById('coef-b').value.trim();
      const c = document.getElementById('coef-c').value.trim();
      if (a === '' || b === '' || c === '') {
        displaySolverResult("Vui lòng nhập đầy đủ hệ số", true);
        return;
      }
      coefs = [parseFloat(a), parseFloat(b), parseFloat(c)];
    } else if (type === 'system2') {
      const a1 = document.getElementById('coef-a1').value.trim();
      const b1 = document.getElementById('coef-b1').value.trim();
      const c1 = document.getElementById('coef-c1').value.trim();
      const a2 = document.getElementById('coef-a2').value.trim();
      const b2 = document.getElementById('coef-b2').value.trim();
      const c2 = document.getElementById('coef-c2').value.trim();
      if (a1 === '' || b1 === '' || c1 === '' || a2 === '' || b2 === '' || c2 === '') {
        displaySolverResult("Vui lòng nhập đầy đủ hệ số", true);
        return;
      }
      coefs = [parseFloat(a1), parseFloat(b1), parseFloat(c1), parseFloat(a2), parseFloat(b2), parseFloat(c2)];
    }
    
    if (coefs.some(isNaN)) {
      displaySolverResult("Vui lòng nhập hệ số là số hợp lệ", true);
      return;
    }
    
    let histExpr = '';
    if (type === 'linear') {
      const [a, b] = coefs;
      histExpr = `Giải PT: ${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)} = 0`;
    } else if (type === 'quadratic') {
      const [a, b, c] = coefs;
      histExpr = `Giải PT: ${a}x² ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '− ' + Math.abs(c)} = 0`;
    } else if (type === 'system2') {
      const [a1, b1, c1, a2, b2, c2] = coefs;
      histExpr = `Giải hệ PT: {${a1}x+${b1}y=${c1}, ${a2}x+${b2}y=${c2}}`;
    }

    try {
      const response = await fetch('/engine/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coefficients: coefs, type })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi giải phương trình');
      }
      
      const roots = data.roots;
      let uiMsg = '';
      let histRes = '';
      
      if (type === 'linear') {
        if (roots[0] === 'Vô nghiệm' || roots[0] === 'Vô số nghiệm') {
          uiMsg = roots[0];
          histRes = roots[0];
        } else {
          uiMsg = `x = ${roots[0]}`;
          histRes = `x = ${roots[0]}`;
        }
      } else if (type === 'quadratic') {
        if (roots[0] === 'Vô nghiệm' || roots[0] === 'Vô số nghiệm') {
          uiMsg = roots[0];
          histRes = roots[0];
        } else if (roots.length === 1) {
          uiMsg = `x = ${roots[0]}`;
          histRes = `x = ${roots[0]}`;
        } else {
          if (roots[0].includes('i')) {
            uiMsg = `x₁ = ${roots[0]}\nx₂ = ${roots[1]}`;
            histRes = `x1=${roots[0].replace(/\s+/g, '')}, x2=${roots[1].replace(/\s+/g, '')}`;
          } else {
            uiMsg = `x₁ = ${roots[0]}\nx₂ = ${roots[1]}`;
            histRes = `x₁=${roots[0]}, x₂=${roots[1]}`;
          }
        }
      } else if (type === 'system2') {
        if (roots[0] === 'Vô nghiệm' || roots[0] === 'Vô số nghiệm') {
          uiMsg = roots[0];
          histRes = roots[0];
        } else {
          // Chuẩn hóa loại bỏ tiền tố x = / y = nếu có trước khi xây dựng giao diện hiển thị
          const xVal = roots[0].replace(/^x\s*=\s*/i, '');
          const yVal = roots[1].replace(/^y\s*=\s*/i, '');
          uiMsg = `x = ${xVal}\ny = ${yVal}`;
          histRes = `x = ${xVal}, y = ${yVal}`;
        }
      }
      
      displaySolverResult(uiMsg, false);

      // Tích hợp hiển thị lên màn hình máy tính chính
      state.expression = histExpr;
      state.currentInput = uiMsg;
      state.shouldResetNext = true;
      state._showFullExpr = true;
      state.isError = false;
      state._errorMessage = '';
      state.isConstant = true;
      updateDisplay(state);
      
      try {
        const historyResponse = await fetch('/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expression: histExpr,
            result: histRes,
            status: 'success',
            userId: state.user ? state.user.uid : null
          })
        });
        if (historyResponse.ok) {
          refreshHistoryUI();
        }
      } catch (historyErr) {
        console.error("Lỗi khi lưu lịch sử:", historyErr);
      }
    } catch (err) {
      displaySolverResult(err.message, true);
      
      // Hiển thị lỗi lên màn hình chính
      state.expression = histExpr;
      state.isError = true;
      state._errorMessage = err.message;
      updateDisplay(state);
    }
  });
}

const elBtnIntegrate = document.getElementById('btn-integrate');
if (elBtnIntegrate) {
  elBtnIntegrate.addEventListener('click', async () => {
    const expr = document.getElementById('integral-expr').value.trim();
    const a = document.getElementById('integral-a').value.trim();
    const b = document.getElementById('integral-b').value.trim();
    
    if (expr === '' || a === '' || b === '') {
      displayIntegralResult("Vui lòng nhập đầy đủ hàm số và cận", true);
      return;
    }
    
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    
    if (isNaN(numA) || isNaN(numB)) {
      displayIntegralResult("Vui lòng nhập cận là số thực hợp lệ", true);
      return;
    }
    
    const histExpr = `∫(${expr}, ${a}, ${b})`;

    try {
      const response = await fetch('/engine/calculate-unary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: expr,
          functionName: 'integral',
          angleUnit: state.angleUnit,
          lowerLimit: numA,
          upperLimit: numB
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi tính toán tích phân');
      }
      
      displayIntegralResult(data.result, false);

      // Tích hợp hiển thị lên màn hình máy tính chính
      state.expression = histExpr;
      state.currentInput = data.result;
      state.shouldResetNext = true;
      state._showFullExpr = true;
      state.isError = false;
      state._errorMessage = '';
      state.isConstant = true;
      updateDisplay(state);
      
      try {
        const historyResponse = await fetch('/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expression: histExpr,
            result: data.result,
            status: 'success',
            userId: state.user ? state.user.uid : null
          })
        });
        if (historyResponse.ok) {
          refreshHistoryUI();
        }
      } catch (historyErr) {
        console.error("Lỗi khi lưu lịch sử:", historyErr);
      }
    } catch (err) {
      displayIntegralResult(err.message, true);
      
      // Hiển thị lỗi lên màn hình chính
      state.expression = histExpr;
      state.isError = true;
      state._errorMessage = err.message;
      updateDisplay(state);

      try {
        await fetch('/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expression: histExpr,
            result: err.message,
            status: 'error',
            userId: state.user ? state.user.uid : null
          })
        });
        refreshHistoryUI();
      } catch (historyErr) {
        console.error("Lỗi khi lưu lịch sử lỗi:", historyErr);
      }
    }
  });
}

// Initial display rendering
updateDisplay(state);
