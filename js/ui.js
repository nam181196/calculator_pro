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

/**
 * Định dạng biểu thức một toán hạng để hiển thị.
 */
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
    if (len > 15) elResult.className = 'display__result size-xxl';
    else if (len > 11) elResult.className = 'display__result size-xl';
    else if (len > 9) elResult.className = 'display__result size-lg';
    else elResult.className = 'display__result';
  }

  // 2. Dòng hiển thị biểu thức (Top display)
  if (state.isError) {
    if (state.operator && state.firstOperand) {
      if (state.operator === '\u200B') {
        elExpression.textContent = state.firstOperand;
      } else {
        elExpression.textContent = `${state.firstOperand} ${state.operator} ${state.currentInput}`;
      }
    } else {
      elExpression.textContent = '';
    }
  } else if (state._showFullExpr && state.operator) {
    // Sau khi bấm "=" hoặc hoàn thành hàm 1 toán hạng
    elExpression.textContent = `${state.firstOperand} ${state.operator} ${state._lastSecond}`;
  } else if (state.pendingUnary) {
    // Đang nhập liệu cho hàm một toán hạng
    if (state.operator && state.firstOperand && state.operator !== '\u200B') {
      elExpression.textContent = `${state.firstOperand} ${state.operator} ${formatUnaryExpression(state.currentInput, state.pendingUnary)}`;
    } else {
      elExpression.textContent = formatUnaryExpression(state.currentInput, state.pendingUnary);
    }
  } else if (state.operator && state.firstOperand) {
    // Đang chờ operand 2
    elExpression.textContent = `${state.firstOperand} ${state.operator}`;
  } else {
    // Chỉ có operand 1
    elExpression.textContent = '';
  }

  // 3. Highlight toán tử đang chọn
  document.querySelectorAll('.btn--op').forEach(btn => btn.classList.remove('is-active'));
  if (state.operator && state.waitingForSecond && !state.isError) {
    const activeBtn = document.querySelector(`.btn--op[data-value="${state.operator}"]`);
    if (activeBtn) activeBtn.classList.add('is-active');
  }

  // 4. Khóa/mở khóa calculator shell khi lỗi (BR-05)
  elCalculator.classList.toggle('is-error', state.isError);

  // 5. Cập nhật Badge góc (DEG/RAD)
  elAngleBadge.textContent = state.angleUnit;
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
export function initKeypadTabs() {
  const tabs = document.querySelectorAll('.keypad-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const target = tab.dataset.target;
      if (target === 'scientific') {
        elKeypadScientific.classList.add('active');
        elKeypadBasic.classList.remove('active');
      } else {
        elKeypadBasic.classList.add('active');
        elKeypadScientific.classList.remove('active');
      }
    });
  });
}
