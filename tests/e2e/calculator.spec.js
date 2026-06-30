/**
 * tests/e2e/calculator.spec.js
 * ─────────────────────────────────────────────────────────────
 * E2E test suite — Simple Calculator Web App v2.0.0
 *
 * Test trên real browser (Chromium / Firefox / Safari).
 * Bao phủ: BUSINESS_REQUIREMENTS_v2.0.0.md Features F-001–F-018, BRD Business Rules §6,
 *           keyboard support, CSS error-lock, visual highlight,
 *           Scientific Mode, DEG/RAD, Sidebar History, Authentication.
 *
 * Ref: BUSINESS_REQUIREMENTS_v2.0.0.md Section 4.1, 5, 6 | FUNCTION_SPECIFICATION_v2.0.0.md Section 1–5
 */

import { test, expect } from '@playwright/test'

// ─────────────────────────────────────────────────────────────
// Helpers — selectors & actions
// ─────────────────────────────────────────────────────────────

/** Selector cho nút số */
const digitBtn  = (d)  => `[data-action="digit"][data-value="${d}"]`
/** Selector cho nút toán tử */
const opBtn     = (op) => `[data-action="operator"][data-value="${op}"]`

const EQUALS    = '#btn-equals'
const AC        = '#btn-ac'
const BACKSPACE = '#btn-backspace'
const DECIMAL   = '#btn-decimal'
const DISPLAY   = '#display-result'
const EXPR      = '#display-expression'

/** Nhấn một chuỗi nút theo token. Token format giống press() trong unit tests. */
async function press(page, ...tokens) {
  const OPS = new Set(['+', '−', '×', '÷'])
  for (const t of tokens) {
    if (t === '=')        await page.click(EQUALS)
    else if (t === 'AC')  await page.click(AC)
    else if (t === '⌫')  await page.click(BACKSPACE)
    else if (t === '.')   await page.click(DECIMAL)
    else if (OPS.has(t))  await page.click(opBtn(t))
    else                  await page.click(digitBtn(t))
  }
}

/** Đọc nội dung dòng kết quả */
const result     = async (page) => {
  await page.waitForTimeout(50);
  return page.locator(DISPLAY).textContent();
}
/** Đọc nội dung dòng biểu thức */
const expression = async (page) => {
  await page.waitForTimeout(50);
  return page.locator(EXPR).textContent();
}
/** Kiểm tra #calculator có class is-error không */
const isError    = async (page) => {
  await page.waitForTimeout(50);
  return page.locator('#calculator').evaluate(el => el.classList.contains('is-error'));
}

// ─────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  // Load trang mới cho mỗi test — đảm bảo state sạch
  await page.goto('/')
  // Đợi calculator render xong
  await expect(page.locator(DISPLAY)).toHaveText('0')
})

// ══════════════════════════════════════════════════════════════
// TC-E01 — Tải trang
// ══════════════════════════════════════════════════════════════

test('TC-E01 | Tải trang: hiển thị "0", expression rỗng', async ({ page }) => {
  expect(await result(page)).toBe('0')
  expect(await expression(page)).toBe('')
  expect(await isError(page)).toBe(false)
})

// ══════════════════════════════════════════════════════════════
// TC-E02–E05 — F-001 đến F-004: 4 phép tính cơ bản
// ══════════════════════════════════════════════════════════════

test('TC-E02 | F-001: Phép cộng — 5 + 3 = 8', async ({ page }) => {
  await press(page, '5', '+', '3', '=')
  expect(await result(page)).toBe('8')
  expect(await expression(page)).toBe('5 + 3')
})

test('TC-E03 | F-002: Phép trừ — 10 − 4 = 6', async ({ page }) => {
  await press(page, '1', '0', '−', '4', '=')
  expect(await result(page)).toBe('6')
})

test('TC-E04 | F-003: Phép nhân — 7 × 6 = 42', async ({ page }) => {
  await press(page, '7', '×', '6', '=')
  expect(await result(page)).toBe('42')
})

test('TC-E05 | F-004: Phép chia — 10 ÷ 4 = 2.5', async ({ page }) => {
  await press(page, '1', '0', '÷', '4', '=')
  expect(await result(page)).toBe('2.5')
})

// ══════════════════════════════════════════════════════════════
// TC-E06–E07 — F-005: Số thập phân
// ══════════════════════════════════════════════════════════════

test('TC-E06 | F-005: Nhập thập phân — 1.5 + 2.5 = 4', async ({ page }) => {
  await press(page, '1', '.', '5', '+', '2', '.', '5', '=')
  expect(await result(page)).toBe('4')
})

test('TC-E07 | F-005: 0.1 + 0.2 = 0.3 (floating-point rounding — BRD §6)', async ({ page }) => {
  await press(page, '0', '.', '1', '+', '0', '.', '2', '=')
  expect(await result(page)).toBe('0.3')
})

// ══════════════════════════════════════════════════════════════
// TC-E08 — F-006: Kết quả âm
// ══════════════════════════════════════════════════════════════

test('TC-E08 | F-006: Kết quả âm — 2 − 9 = -7', async ({ page }) => {
  await press(page, '2', '−', '9', '=')
  expect(await result(page)).toBe('-7')
})

// ══════════════════════════════════════════════════════════════
// TC-E09–E11 — F-007: AC (Xóa toàn bộ)
// ══════════════════════════════════════════════════════════════

test('TC-E09 | F-007: AC xóa state đang nhập', async ({ page }) => {
  await press(page, '5', '2', '+', '3', 'AC')
  expect(await result(page)).toBe('0')
  expect(await expression(page)).toBe('')
})

test('TC-E10 | F-007: AC thoát Error State (cách duy nhất)', async ({ page }) => {
  await press(page, '5', '÷', '0', '=')
  expect(await isError(page)).toBe(true)

  await press(page, 'AC')
  expect(await isError(page)).toBe(false)
  expect(await result(page)).toBe('0')
})

test('TC-E11 | F-007: Sau AC từ lỗi, tính bình thường trở lại', async ({ page }) => {
  await press(page, '5', '÷', '0', '=')
  await press(page, 'AC')
  await press(page, '7', '+', '2', '=')
  expect(await result(page)).toBe('9')
})

// ══════════════════════════════════════════════════════════════
// TC-E12–E14 — F-008: ⌫ (Xóa ký tự cuối)
// ══════════════════════════════════════════════════════════════

test('TC-E12 | F-008: ⌫ xóa ký tự cuối — "123" → "12"', async ({ page }) => {
  await press(page, '1', '2', '3', '⌫')
  expect(await result(page)).toBe('12')
})

test('TC-E13 | F-008: ⌫ sau "=" bị bỏ qua (kết quả không thể sửa bằng ⌫)', async ({ page }) => {
  await press(page, '5', '+', '3', '=')
  expect(await result(page)).toBe('8')

  await press(page, '⌫')
  expect(await result(page)).toBe('8')
})

test('TC-E14 | F-008: ⌫ khi operator đã nhấn (waitingForSecond) bị bỏ qua', async ({ page }) => {
  await press(page, '5', '+')                   // waitingForSecond=true
  await press(page, '⌫')
  expect(await result(page)).toBe('0')          // Giữ nguyên '0'
  expect(await expression(page)).toBe('5 + 0')   // Expression không đổi
})

// ══════════════════════════════════════════════════════════════
// TC-E15 — F-009: Giới hạn 15 chữ số
// ══════════════════════════════════════════════════════════════

test('TC-E15 | F-009: Giới hạn 15 chữ số — chữ số thứ 16 bị bỏ qua', async ({ page }) => {
  for (let i = 0; i < 16; i++) await page.click(digitBtn('1'))
  const text = await result(page)
  expect(text.replace(/\D/g, '').length).toBe(15)
})

// ══════════════════════════════════════════════════════════════
// TC-E16–E17 — F-010: Xử lý lỗi chia cho 0
// ══════════════════════════════════════════════════════════════

test('TC-E16 | F-010: ÷ 0 → Error State, hiển thị thông báo lỗi', async ({ page }) => {
  await press(page, '1', '0', '÷', '0', '=')
  expect(await isError(page)).toBe(true)
  expect(await result(page)).toBe('Không thể chia cho 0')
  expect(await expression(page)).toBe('10 ÷ 0')
})

test('TC-E17 | F-010: Sau lỗi, nút số bị vô hiệu (CSS pointer-events)', async ({ page }) => {
  await press(page, '5', '÷', '0', '=')
  const errMsg = await result(page)

  // Thử click nút số — phải bị bỏ qua
  await page.click(digitBtn('9'), { force: true })  // force vì pointer-events:none
  // Kết quả không thay đổi (JS guard bảo vệ ngay cả khi CSS bị bypass)
  expect(await result(page)).toBe(errMsg)
})

// ══════════════════════════════════════════════════════════════
// TC-E18 — F-011: Ký hiệu khoa học
// ══════════════════════════════════════════════════════════════

test('TC-E18 | F-011: 9 × 999999999999999 → hiển thị ký hiệu khoa học', async ({ page }) => {
  await press(page, '9', '×')
  for (const d of '999999999999999') await page.click(digitBtn(d))
  await press(page, '=')
  expect(await result(page)).toMatch(/e\+/)
})

// ══════════════════════════════════════════════════════════════
// TC-E19–E23 — F-012: Nhập liệu bằng bàn phím
// FS Module 5 Keyboard Mapping
// ══════════════════════════════════════════════════════════════

test('TC-E19 | F-012: Bàn phím — phím số 0-9 hoạt động', async ({ page }) => {
  await page.keyboard.press('5')
  await page.keyboard.press('2')
  await page.keyboard.press('3')
  expect(await result(page)).toBe('523')
})

test('TC-E19b | F-012: Bàn phím — toán tử và Enter', async ({ page }) => {
  await page.keyboard.press('5')
  await page.keyboard.press('+')
  await page.keyboard.press('3')
  await page.keyboard.press('Enter')
  expect(await result(page)).toBe('8')
  expect(await expression(page)).toBe('5 + 3')
})

test('TC-E20 | F-012: Bàn phím — phím "=" hoạt động như Enter', async ({ page }) => {
  await page.keyboard.press('7')
  await page.keyboard.press('*')                   // * → ×
  await page.keyboard.press('6')
  await page.keyboard.press('=')
  expect(await result(page)).toBe('42')
})

test('TC-E21 | F-012: Bàn phím — Escape hoạt động như AC', async ({ page }) => {
  await page.keyboard.press('5')
  await page.keyboard.press('+')
  await page.keyboard.press('3')
  await page.keyboard.press('Escape')
  expect(await result(page)).toBe('0')
  expect(await expression(page)).toBe('')
})

test('TC-E22 | F-012: Bàn phím — Backspace xóa ký tự cuối', async ({ page }) => {
  await page.keyboard.press('1')
  await page.keyboard.press('2')
  await page.keyboard.press('3')
  await page.keyboard.press('Backspace')
  expect(await result(page)).toBe('12')
})

test('TC-E23 | F-012: Bàn phím — "/" kích hoạt ÷ (và ngăn Quick Find)', async ({ page }) => {
  await page.keyboard.press('1')
  await page.keyboard.press('0')
  await page.keyboard.press('/')                   // / → ÷
  await page.keyboard.press('2')
  await page.keyboard.press('Enter')
  expect(await result(page)).toBe('5')
})

test('TC-E24 | F-012: Bàn phím — dấu "-" → toán tử trừ', async ({ page }) => {
  await page.keyboard.press('9')
  await page.keyboard.press('-')                   // - → −
  await page.keyboard.press('4')
  await page.keyboard.press('Enter')
  expect(await result(page)).toBe('5')
})

// ══════════════════════════════════════════════════════════════
// TC-E25–E29 — BRD Business Rules §6
// ══════════════════════════════════════════════════════════════

test('TC-E25 | BRD §6: Sau kết quả + operator → kết quả là firstOperand tiếp theo', async ({ page }) => {
  await press(page, '8', '+', '2', '=')           // = 10
  await press(page, '×', '3', '=')               // 10 × 3 = 30
  expect(await result(page)).toBe('30')
})

test('TC-E26 | BRD §6: Sau kết quả + digit → phép tính hoàn toàn mới', async ({ page }) => {
  await press(page, '5', '+', '3', '=')           // = 8
  await press(page, '4', '+', '6', '=')           // Phép mới: 4 + 6 = 10
  expect(await result(page)).toBe('10')
})

test('TC-E27 | BRD §6: Toán tử liên tiếp → ghi đè', async ({ page }) => {
  await press(page, '5', '+', '−', '3', '=')     // 5 − 3 = 2
  expect(await result(page)).toBe('2')
})

test('TC-E28 | BRD §6: "=" liên tiếp → không lặp lại phép tính', async ({ page }) => {
  await press(page, '5', '+', '3', '=')
  expect(await result(page)).toBe('8')

  await press(page, '=', '=', '=')               // Vẫn là 8
  expect(await result(page)).toBe('8')
})

test('TC-E29 | BRD §6: Operator highlight bật khi chọn toán tử, tắt khi nhập số', async ({ page }) => {
  await press(page, '5', '+')
  // Nút + phải có class is-active
  await expect(page.locator('#btn-add')).toHaveClass(/is-active/)

  await press(page, '3')
  // Sau khi nhập số, highlight tắt
  await expect(page.locator('#btn-add')).not.toHaveClass(/is-active/)
})

// ══════════════════════════════════════════════════════════════
// TC-E30 — Display layout (BRD §5: hai dòng)
// ══════════════════════════════════════════════════════════════

test('TC-E30 | BRD §5: Dòng trên hiển thị "a op" khi đang nhập số thứ hai', async ({ page }) => {
  await press(page, '5', '+', '3')
  expect(await expression(page)).toBe('5 + 3')     // Dòng trên: "523 +"
  expect(await result(page)).toBe('3')           // Dòng dưới: số đang nhập
})

// ══════════════════════════════════════════════════════════════
// TC-E31 — Theme Toggle (Sáng/Tối)
// ══════════════════════════════════════════════════════════════

test('TC-E31 | Theme Toggle: Kiểm tra chuyển đổi theme Sáng/Tối hoạt động đúng và cập nhật màu sắc giao diện', async ({ page }) => {
  // Lấy theme ban đầu
  const isInitialLight = await page.evaluate(() => document.documentElement.classList.contains('light'));
  
  // Toggle theme
  await page.click('#btn-theme');
  await page.waitForTimeout(500); // Chờ transition 0.4s hoàn tất

  const isLightAfter1 = await page.evaluate(() => document.documentElement.classList.contains('light'));
  expect(isLightAfter1).toBe(!isInitialLight);

  // Kiểm tra màu nền của .calculator
  const calcBgColor = await page.evaluate(() => {
    const el = document.getElementById('calculator');
    return window.getComputedStyle(el).backgroundColor;
  });
  
  if (isLightAfter1) {
    // Light mode background
    expect(calcBgColor).toContain('255, 255, 255');
  } else {
    // Dark mode background
    expect(calcBgColor).toContain('30, 32, 42');
  }

  // Toggle lần nữa để trở lại trạng thái ban đầu
  await page.click('#btn-theme');
  await page.waitForTimeout(500);

  const isLightAfter2 = await page.evaluate(() => document.documentElement.classList.contains('light'));
  expect(isLightAfter2).toBe(isInitialLight);
});

// ══════════════════════════════════════════════════════════════
// TC-E32 — Scientific Mode & DEG/RAD
// ══════════════════════════════════════════════════════════════

test('TC-E32 | Scientific Mode: Lượng giác, căn thức, hằng số & DEG/RAD', async ({ page }) => {
  // 1. Kiểm tra DEG Mode mặc định: sin(90) = 1
  await page.click('.btn--sci[data-value="sin"]');
  await page.click(digitBtn('9'));
  await page.click(digitBtn('0'));
  await page.click('#btn-equals');
  expect(await result(page)).toBe('1');
  expect((await expression(page)).replace(/\u200B/g, '').trim()).toBe('sin(90)');

  await page.click(AC);

  // 2. Chuyển sang RAD Mode
  await page.click('#btn-angle');
  await expect(page.locator('#angle-badge')).toHaveText('RAD');

  // 3. Sử dụng hằng số pi: pi -> cos -> -1
  await page.click('.btn--sci[data-value="pi"]');
  expect(await result(page)).toBe('3.1415926536');

  await page.click('.btn--sci[data-value="cos"]');
  await page.click('#btn-equals');
  expect(await result(page)).toBe('-1');
  expect((await expression(page)).replace(/\u200B/g, '').trim()).toBe('cos(3.1415926536)');

  // 4. Sử dụng hằng số e: e -> ln -> 1 (F-016, FS §1.3 + FS §2.2)
  await page.click(AC);
  await page.click('.btn--sci[data-value="e"]');
  expect(await result(page)).toBe('2.7182818285');

  await page.click('.btn--sci[data-value="ln"]');
  await page.click('#btn-equals');
  expect(await result(page)).toMatch(/^[0-9]/);
  // ln(e) = 1 (số gần bằng 1)
  const lnResult = parseFloat(await result(page));
  expect(lnResult).toBeCloseTo(1, 8);

  // Reset về DEG cho các test khác
  await page.click('#btn-angle');
  await expect(page.locator('#angle-badge')).toHaveText('DEG');
});

// ══════════════════════════════════════════════════════════════
// TC-E33 — Lịch sử tính toán (Sidebar History)
// ══════════════════════════════════════════════════════════════

test('TC-E33 | Lịch sử: Lưu phép tính, hiển thị trên Sidebar, click khôi phục & xóa', async ({ page }) => {
  // Đăng ký tự động accept dialog xác nhận xóa lịch sử
  page.once('dialog', async dialog => {
    await dialog.accept();
  });

  // 1. Tính toán: 5 + 3 = 8
  await press(page, '5', '+', '3', '=');
  expect(await result(page)).toBe('8');

  // 2. Mở Sidebar lịch sử
  await page.click('#btn-history');
  await expect(page.locator('#sidebar')).toHaveClass(/active/);

  // 3. Kiểm tra card lịch sử
  const historyCardExpr = page.locator('.history-card__expr');
  const historyCardResult = page.locator('.history-card__result');
  await expect(historyCardExpr).toHaveText('5 + 3');
  await expect(historyCardResult).toHaveText('8');

  // Đóng sidebar để click nút AC trên bàn phím máy tính
  await page.click('#sidebar-close-btn');
  await expect(page.locator('#sidebar')).not.toHaveClass(/active/);

  // Xóa màn hình
  await page.click(AC);
  expect(await result(page)).toBe('0');

  // 4. Mở lại sidebar để click vào card khôi phục
  await page.click('#btn-history');
  await page.click('.history-card'); // Bấm vào card sẽ khôi phục và tự đóng sidebar
  
  expect(await result(page)).toBe('8');
  expect((await expression(page)).replace(/\u200B/g, '').trim()).toBe('5 + 3');

  // 5. Mở lại sidebar để xóa lịch sử
  await page.click('#btn-history');
  await page.click('#clear-history-btn');
  await expect(page.locator('.sidebar__empty')).toHaveText('Chưa có lịch sử phép tính');

  // Đóng sidebar
  await page.click('#sidebar-close-btn');
  await expect(page.locator('#sidebar')).not.toHaveClass(/active/);
});

// ══════════════════════════════════════════════════════════════
// TC-E34 — Xác thực & Đăng nhập (Mock Auth Fallback)
// ══════════════════════════════════════════════════════════════

test('TC-E34 | Auth: Đăng nhập/Đăng ký tài khoản (chế độ Mock Fallback) và Đăng xuất', async ({ page }) => {
  // 1. Mở modal đăng nhập
  await page.click('#btn-auth');
  await expect(page.locator('#auth-modal')).toHaveClass(/active/);

  // 2. Chuyển sang form Đăng ký
  await page.click('#modal-toggle-link');
  await expect(page.locator('#modal-title')).toHaveText('Đăng ký');

  // 3. Nhập thông tin đăng ký
  const email = `test_${Math.random().toString(36).substr(2, 5)}@example.com`;
  await page.fill('#auth-email', email);
  await page.fill('#auth-password', 'password123');
  await page.click('#auth-submit-btn');

  // 4. Chờ đăng ký xong, modal đóng và hiển thị email của người dùng
  await expect(page.locator('#auth-modal')).not.toHaveClass(/active/);
  await expect(page.locator('#user-email-display')).toHaveText(email);
  await expect(page.locator('#user-info')).not.toHaveClass(/hidden/);

  // 5. Đăng xuất
  await page.click('#btn-logout');
  await expect(page.locator('#user-info')).toHaveClass(/hidden/);
  await expect(page.locator('#btn-auth')).not.toHaveClass(/hidden/);
});

// ══════════════════════════════════════════════════════════════
// TC-E35 — Lỗi Toán Học Khoa Học (BR-11)
// FS v2.0.0 §2.2 performUnaryCalculation — error boundaries
// ══════════════════════════════════════════════════════════════

test('TC-E35 | BR-11: Lỗi toán học khoa học — căn bậc 2 số âm, giai thừa thoát miền, ln(0)', async ({ page }) => {
  // ——— Trường hợp 1: ln(0) → Lỗi toán học ———
  await page.click(digitBtn('0'));
  await page.click('.btn--sci[data-value="ln"]');
  await page.click('#btn-equals');

  // Kiểm tra Error State
  expect(await isError(page)).toBe(true);
  // Hiển thị thông báo lỗi
  const errorMsg1 = await result(page);
  expect(errorMsg1.toLowerCase()).toMatch(/lỗi/);

  // Phím số bị khóa sau lỗi (BR-11 = tương tự BR-05)
  await page.click(digitBtn('5'), { force: true });
  expect(await result(page)).toBe(errorMsg1);

  // Chỉ AC thoát được
  await page.click(AC);
  expect(await isError(page)).toBe(false);
  expect(await result(page)).toBe('0');

  // ——— Trường hợp 2: asin(2) → Vượt miền [-1, 1] ———
  await page.click('.btn--sci[data-value="asin"]');
  await press(page, '2');
  await page.click('#btn-equals');

  expect(await isError(page)).toBe(true);
  const errorMsg2 = await result(page);
  expect(errorMsg2.toLowerCase()).toMatch(/lỗi/);

  await page.click(AC);
  expect(await isError(page)).toBe(false);

  // ——— Trường hợp 3: tan(90) → Cực trị không xác định (DEG mode) ———
  await page.click('.btn--sci[data-value="tan"]');
  await page.click(digitBtn('9'));
  await page.click(digitBtn('0'));
  await page.click('#btn-equals');

  expect(await isError(page)).toBe(true);
  await page.click(AC);
  expect(await isError(page)).toBe(false);

  // ——— Trường hợp 4: 171! → Tràn số (> 170) ———
  await page.click(digitBtn('1'));
  await page.click(digitBtn('7'));
  await page.click(digitBtn('1'));
  await page.click('.btn--sci[data-value="factorial"]');
  await page.click('#btn-equals');

  expect(await isError(page)).toBe(true);
  await page.click(AC);
  expect(await isError(page)).toBe(false);
  expect(await result(page)).toBe('0');
});

// ══════════════════════════════════════════════════════════════
// TC-E36 — Ký Hiệu Khoa Học Kết Quả Nhỏ (BR-09, FS v2.0.0 §2.3)
// ══════════════════════════════════════════════════════════════

test('TC-E36 | BR-09: Kết quả rất nhỏ (< 1e-9) → hiển thị ký hiệu khoa học', async ({ page }) => {
  // 1 ÷ 10000000000 = 1e-10 < 1e-9 → hiển thị dạng 1e-10
  await press(page, '1', '÷');
  for (const d of '10000000000') await page.click(digitBtn(d));
  await press(page, '=');

  const res = await result(page);
  // Kết quả phải ở dạng scientific notation (có 'e')
  expect(res).toMatch(/e[-+]/);
});

// ══════════════════════════════════════════════════════════════
// v2.1.2 Features E2E Integration Tests (F-019, F-020, F-021)
// ══════════════════════════════════════════════════════════════

test('TC-E37 | F-019, F-020: Phím ẩn biến x ảo & Lõi giải phương trình Tìm x (Newton-Raphson Solver)', async ({ page }) => {
  // 1. Mở scientific keypad nếu hiển thị (trên mobile cần click tab, trên desktop mặc định hiển thị)
  if (await page.locator('#tab-scientific').isVisible()) {
    await page.click('#tab-scientific');
  }

  // 2. Nhập x -> x² -> - -> 9 -> =
  await page.click('#btn-var-x');
  await page.click('.btn--sci[data-value="sq"]');
  await page.click('#btn-subtract');
  await page.click(digitBtn('9'));
  await page.click('#btn-equals');

  // 3. Nghiệm thực phải hội tụ về x = 3 hoặc x = -3
  const res = await result(page);
  expect(res === 'x = 3' || res === 'x = -3').toBe(true);
});

test('TC-E38 | F-019: Nhập biến số x bằng bàn phím vật lý', async ({ page }) => {
  // 1. Gõ x bằng bàn phím
  await page.keyboard.press('x');
  
  // 2. Gõ - -> 4 -> Enter
  await page.keyboard.press('-');
  await page.keyboard.press('4');
  await page.keyboard.press('Enter');

  // 3. Kết quả giải phương trình x - 4 = 0 phải là x = 4
  const res = await result(page);
  expect(res).toBe('x = 4');
});

test('TC-E39 | F-021: Phím nhập phân số đứng trực quan (Visual Fraction Input)', async ({ page }) => {
  // 1. Mở scientific keypad nếu hiển thị
  if (await page.locator('#tab-scientific').isVisible()) {
    await page.click('#tab-scientific');
  }

  // 2. Bấm nút nhập phân số ■/□
  await page.click('#btn-fraction');
  let exprHtml = await page.locator('#display-expression').innerHTML();
  expect(exprHtml).toContain('math-placeholder');
  
  // 3. Gõ tử số: 5
  await page.keyboard.press('5');
  
  // 4. Click vào mẫu số placeholder
  await page.click('.math-placeholder');
  
  // 5. Gõ mẫu số: 2
  await page.keyboard.press('2');

  // 6. Bấm bằng (=) -> kết quả 5/2 = 2.5
  await page.click('#btn-equals');
  expect(await result(page)).toBe('2.5');

  // 7. Test Backspace xóa tử số trong phân số
  await page.click(AC);
  await page.click('#btn-fraction');
  await page.keyboard.press('5');
  await page.click('#btn-backspace');
  
  // Trở lại trạng thái placeholder trống
  exprHtml = await page.locator('#display-expression').innerHTML();
  expect(exprHtml).toContain('⬚');

  // 8. Test thoát con trỏ khi bấm toán tử
  await page.click(AC);
  await page.click('#btn-fraction');
  await page.keyboard.press('5');
  await page.click('.math-placeholder');
  await page.keyboard.press('2');
  await page.click('#btn-add'); // Bấm +
  
  // Con trỏ phải tự thoát ra ngoài và nối toán tử
  const exprText = await page.locator('#display-expression').textContent();
  expect(exprText).toContain('+ 0');
});

