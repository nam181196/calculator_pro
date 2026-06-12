/* ============================================================
   calculator.js — Simple Calculator Web App Controller
   Architecture: Engine Layer + Service Layers → Controller Layer → View Layer
   ============================================================ */

'use strict';

import './js/api-mock.js';

import { 
  formatResult 
} from './js/engine.js';

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
  formatUnaryExpression
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
  unaryOperand: ''
};

// Reset state values while keeping angle unit and user intact
function resetState() {
  state.currentInput = '0';
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
}

// ============================================================
// CONTROLLER LOGIC
// ============================================================
function handleDigit(digit) {
  if (state.isError) return;

  state._showFullExpr = false;

  // If we just calculated a result or loaded a constant, start fresh
  if (state.shouldResetNext || state.isConstant) {
    resetState();
    state.currentInput = (digit === '0') ? '0' : digit;
    updateDisplay(state);
    return;
  }

  // If waiting for second operand, replace '0' with the new digit
  if (state.waitingForSecond) {
    state.currentInput = (digit === '0') ? '0' : digit;
    state.waitingForSecond = false;
    updateDisplay(state);
    return;
  }

  // If waiting for unary input, replace '0' with the new digit
  if (state.waitingForUnaryInput) {
    state.currentInput = (digit === '0') ? '0' : digit;
    state.waitingForUnaryInput = false;
    updateDisplay(state);
    return;
  }

  // Max 15 digits limit (excluding decimal points and minus signs)
  const digitCount = state.currentInput.replace(/[^0-9]/g, '').length;
  if (digitCount >= 15) return;

  if (state.currentInput === '0') {
    state.currentInput = digit;
  } else {
    state.currentInput += digit;
  }

  updateDisplay(state);
}

function handleDecimalPoint() {
  if (state.isError) return;

  state._showFullExpr = false;

  // If we just calculated a result or loaded a constant, start fresh with "0."
  if (state.shouldResetNext || state.isConstant) {
    resetState();
    state.currentInput = '0.';
    updateDisplay(state);
    return;
  }

  // If waiting for second operand, start fresh with "0."
  if (state.waitingForSecond) {
    state.currentInput = '0.';
    state.waitingForSecond = false;
    updateDisplay(state);
    return;
  }

  // If waiting for unary input, start fresh with "0."
  if (state.waitingForUnaryInput) {
    state.currentInput = '0.';
    state.waitingForUnaryInput = false;
    updateDisplay(state);
    return;
  }

  // Limit to one decimal point per operand
  if (state.currentInput.includes('.')) return;

  state.currentInput += '.';
  updateDisplay(state);
}

function handleConstant(constantName) {
  if (state.isError) return;

  const value = constantName === 'pi' ? Math.PI : Math.E;
  const formatted = formatResult(value);

  if (state.shouldResetNext) {
    resetState();
  }

  if (state.waitingForSecond) {
    state.waitingForSecond = false;
  }

  if (state.waitingForUnaryInput) {
    state.waitingForUnaryInput = false;
  }

  state.currentInput = formatted;
  state.isConstant = true; // Block appending digits
  state._showFullExpr = false;
  updateDisplay(state);
}

function handleUnaryCalculation(functionName) {
  if (state.isError) return;

  if (state.shouldResetNext) {
    state.operator = null;
    state.firstOperand = '';
    state.shouldResetNext = false;
  }

  const isPrefix = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'abs', 'sqrt', 'cbrt'].includes(functionName);

  if (isPrefix) {
    if (state.currentInput === '0' || state.waitingForSecond) {
      state.pendingUnary = functionName;
      state.waitingForUnaryInput = true;
      state.currentInput = '0';
    } else {
      state.pendingUnary = functionName;
      state.waitingForUnaryInput = false;
      state.isConstant = true;
    }
  } else {
    // Postfix functions
    state.pendingUnary = functionName;
    state.waitingForUnaryInput = false;
    state.isConstant = true;
  }

  updateDisplay(state);
}

async function handleOperator(op) {
  if (state.isError) return;

  state._showFullExpr = false;
  state.isConstant = false;

  // If there is a pending unary calculation, we must evaluate it first!
  if (state.pendingUnary) {
    const operand = state.currentInput;
    const func = state.pendingUnary;
    try {
      const response = await fetch('/engine/calculate-unary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: operand, functionName: func, angleUnit: state.angleUnit })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi toán học');
      }
      state.currentInput = data.result;
      state.pendingUnary = null;
    } catch (err) {
      state.isError = true;
      state._errorMessage = err.message;
      state.pendingUnary = null;

      const expr = state.operator && state.firstOperand && state.operator !== '\u200B'
        ? `${state.firstOperand} ${state.operator} ${formatUnaryExpression(operand, func)}`
        : formatUnaryExpression(operand, func);
      
      updateDisplay(state);

      try {
        const historyResponse = await fetch('/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expression: expr,
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
      return;
    }
  }

  // Chain calculations if we already have first operand and operator
  if (state.shouldResetNext) {
    state.firstOperand = state.currentInput;
    state.operator = op;
    state.waitingForSecond = true;
    state.shouldResetNext = false;
    state.currentInput = '0';
    updateDisplay(state);
    return;
  }

  if (state.waitingForSecond && state.operator) {
    state.operator = op;
    updateDisplay(state);
    return;
  }

  if (state.operator && state.firstOperand && !state.waitingForSecond) {
    try {
      const response = await fetch('/engine/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operand1: state.firstOperand,
          operator: state.operator,
          operand2: state.currentInput
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi toán học');
      
      state.firstOperand = data.result;
      state.currentInput = '0';
      state.operator = op;
      state.waitingForSecond = true;
      updateDisplay(state);
    } catch (err) {
      state.isError = true;
      state._errorMessage = err.message;

      const expr = `${state.firstOperand} ${state.operator} ${state.currentInput}`;
      updateDisplay(state);
      
      try {
        const historyResponse = await fetch('/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expression: expr,
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
  } else {
    if (!state.currentInput) return;
    state.firstOperand = state.currentInput;
    state.operator = op;
    state.waitingForSecond = true;
    state.currentInput = '0';
    updateDisplay(state);
  }
}

async function handleEquals() {
  if (state.isError) return;

  // Case 1: There is a pending unary calculation
  if (state.pendingUnary) {
    const operand = state.currentInput;
    const func = state.pendingUnary;
    let unarySuccess = false;
    let unaryFormatted = '';
    let unaryErrMsg = '';

    // First calculate the unary operation
    try {
      const response = await fetch('/engine/calculate-unary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: operand, functionName: func, angleUnit: state.angleUnit })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi toán học');
      }
      unaryFormatted = data.result;
      unarySuccess = true;
    } catch (err) {
      state.isError = true;
      state._errorMessage = err.message;
      unaryErrMsg = err.message;
    }

    state.pendingUnary = null;
    state.waitingForUnaryInput = false;

    // Build the expression string
    const formattedUnary = formatUnaryExpression(operand, func);

    if (unarySuccess) {
      // If there is also a binary operator
      if (state.operator && state.firstOperand && state.operator !== '\u200B') {
        const expr = `${state.firstOperand} ${state.operator} ${formattedUnary}`;
        let success = false;
        let formatted = '';
        let errMsg = '';

        try {
          const response = await fetch('/engine/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              operand1: state.firstOperand,
              operator: state.operator,
              operand2: unaryFormatted
            })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Lỗi toán học');
          
          formatted = data.result;
          state.currentInput = formatted;
          state.unaryOperand = operand;
          state._lastSecond = formattedUnary;
          state.shouldResetNext = true;
          state._showFullExpr = true;
          success = true;
        } catch (err) {
          state.isError = true;
          state._errorMessage = err.message;
          state.unaryOperand = operand;
          state._lastSecond = formattedUnary;
          state._showFullExpr = true;
          errMsg = err.message;
        }

        updateDisplay(state);

        try {
          const historyResponse = await fetch('/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              expression: expr,
              result: success ? formatted : errMsg,
              status: success ? 'success' : 'error',
              userId: state.user ? state.user.uid : null
            })
          });
          if (historyResponse.ok) {
            refreshHistoryUI();
          }
        } catch (historyErr) {
          console.error("Lỗi khi lưu lịch sử:", historyErr);
        }
      } else {
        // Standalone operation
        state.currentInput = unaryFormatted;
        state.firstOperand = formattedUnary;
        state.operator = '\u200B'; // Zero-width space
        state._lastSecond = '';
        state.unaryOperand = operand;
        state.shouldResetNext = true;
        state.isConstant = true;
        state._showFullExpr = true;

        updateDisplay(state);

        try {
          const historyResponse = await fetch('/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              expression: formattedUnary,
              result: unaryFormatted,
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
      }
    } else {
      // Unary calculation failed
      const expr = state.operator && state.firstOperand && state.operator !== '\u200B'
        ? `${state.firstOperand} ${state.operator} ${formattedUnary}`
        : formattedUnary;

      if (!state.operator || state.operator === '\u200B') {
        state.firstOperand = formattedUnary;
        state.operator = '\u200B';
        state._lastSecond = '';
      } else {
        state._lastSecond = formattedUnary;
      }
      state.unaryOperand = operand;
      state._showFullExpr = true;

      updateDisplay(state);

      try {
        const historyResponse = await fetch('/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expression: expr,
            result: unaryErrMsg,
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
    return;
  }

  // Case 2: Normal calculation without pending unary
  if (!state.operator || !state.firstOperand || state.waitingForSecond) return;
  if (state.shouldResetNext) return;

  const secondOperand = state.currentInput;
  state._lastSecond = secondOperand;
  state.isConstant = false;

  const expr = `${state.firstOperand} ${state.operator} ${secondOperand}`;
  let success = false;
  let formatted = '';
  let errMsg = '';

  try {
    const response = await fetch('/engine/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operand1: state.firstOperand,
        operator: state.operator,
        operand2: secondOperand
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Lỗi toán học');
    
    formatted = data.result;
    state.currentInput = formatted;
    state.shouldResetNext = true;
    state._showFullExpr = true;
    success = true;
  } catch (err) {
    state.isError = true;
    state._errorMessage = err.message;
    state._showFullExpr = true;
    errMsg = err.message;
  }

  // Update UI instantly
  updateDisplay(state);

  // Save history asynchronously in the background
  try {
    const historyResponse = await fetch('/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expression: expr,
        result: success ? formatted : errMsg,
        status: success ? 'success' : 'error',
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

function handleAllClear() {
  resetState();
  updateDisplay(state);
}

function handleBackspace() {
  if (state.shouldResetNext || state.isError || state.waitingForSecond) return;

  if (state.pendingUnary) {
    if (state.currentInput === '0' || state.waitingForUnaryInput) {
      state.pendingUnary = null;
      state.waitingForUnaryInput = false;
      state.isConstant = false;
    } else {
      if (state.currentInput.length <= 1) {
        state.currentInput = '0';
      } else {
        state.currentInput = state.currentInput.slice(0, -1);
        if (state.currentInput === '-') {
          state.currentInput = '0';
        }
      }
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

  if (state.currentInput.length <= 1) {
    state.currentInput = '0';
  } else {
    state.currentInput = state.currentInput.slice(0, -1);
    if (state.currentInput === '-') {
      state.currentInput = '0';
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
  state.firstOperand = item.expression;
  state.operator = '\u200B';
  state._lastSecond = '';
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
  }
});

function animateButton(selector) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.classList.add('key-pressed');
  setTimeout(() => btn.classList.remove('key-pressed'), 120);
}

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

// Initial display rendering
updateDisplay(state);
