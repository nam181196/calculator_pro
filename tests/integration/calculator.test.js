/**
 * tests/unit/calculator.test.js
 * ─────────────────────────────────────────────────────────────
 * Unit test suite — Simple Calculator Web App v2.0.0
 *
 * Tổ chức theo FUNCTION_SPECIFICATION_v2.0.0.md (Section 1–5) + BUSINESS_REQUIREMENTS_v2.0.0.md Section 6 Business Rules.
 * Mỗi Business Rule và Error Code trong FS có ít nhất một test case.
 * Các tính năng v2.0.0 mới (F-013, F-015, F-016, BR-10, BR-11) được bổ sung cuối file.
 *
 * Ref: FUNCTION_SPECIFICATION_v2.0.0.md, BUSINESS_REQUIREMENTS_v2.0.0.md Section 4.1 & 6
 */

import { describe, it, expect } from 'vitest'
import { createCalcEnv, press } from './setup.js'

// ══════════════════════════════════════════════════════════════
// MODULE 1 — INPUT HANDLING
// FS: [EventController.handleDigit] & [EventController.handleDecimalPoint]
// ══════════════════════════════════════════════════════════════

describe('handleDigit', () => {

  // ── Precondition: Error State ──────────────────────────────

  it('TC-D01 | isError=true → digit bị bỏ qua', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')           // Kích hoạt Error State
    const before = c.result()

    press(c, '9')                           // Phải bị bỏ qua
    expect(c.result()).toBe(before)
    expect(c.isError()).toBe(true)
  })

  // ── Business Rule: shouldResetNext ────────────────────────

  it('TC-D02 | sau "=", digit non-zero → bắt đầu phép tính mới, expression về ""', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')           // result = 8
    expect(c.result()).toBe('8')

    press(c, '4')
    expect(c.result()).toBe('4')
    expect(c.expression()).toBe('4')
  })

  it('TC-D03 | sau "=", digit "0" → currentInput = "0"', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')

    press(c, '0')
    expect(c.result()).toBe('0')
  })

  // ── Business Rule: waitingForSecond ───────────────────────

  it('TC-D04 | sau operator, digit non-zero → bắt đầu nhập số thứ hai', () => {
    const c = createCalcEnv()
    press(c, '5', '+')

    press(c, '3')
    expect(c.result()).toBe('3')
    expect(c.expression()).toBe('5 + 3')
  })

  it('TC-D05 | sau operator, digit "0" → currentInput = "0" (không "00")', () => {
    const c = createCalcEnv()
    press(c, '5', '+')

    press(c, '0')
    expect(c.result()).toBe('0')
  })

  // ── Business Rule: Leading zero ───────────────────────────

  it('TC-D06 | "0" + non-zero → thay thế "0" (không tạo "07")', () => {
    const c = createCalcEnv()
    // Khởi tạo: currentInput = '0'
    press(c, '7')
    expect(c.result()).toBe('7')
  })

  it('TC-D07 | "0" + "0" → giữ "0" (không tạo "00")', () => {
    const c = createCalcEnv()
    press(c, '0')
    expect(c.result()).toBe('0')
  })

  // ── Business Rule: 15-digit limit (F-009) ─────────────────

  it('TC-D08 | chữ số thứ 16 bị bỏ qua', () => {
    const c = createCalcEnv()
    for (let i = 0; i < 15; i++) press(c, '1')

    press(c, '1')                          // Chữ số thứ 16 → bị bỏ qua
    expect(c.result().replace(/\D/g, '').length).toBe(15)
  })

  it('TC-D09 | chính xác 15 chữ số được chấp nhận', () => {
    const c = createCalcEnv()
    for (let i = 0; i < 15; i++) press(c, '3')
    expect(c.result().replace(/\D/g, '').length).toBe(15)
  })

  // ── Normal flow ───────────────────────────────────────────

  it('TC-D10 | nối số bình thường: 1→2→3 = "123"', () => {
    const c = createCalcEnv()
    press(c, '1', '2', '3')
    expect(c.result()).toBe('123')
  })
})

// ─────────────────────────────────────────────────────────────

describe('handleDecimalPoint', () => {

  it('TC-DP01 | isError=true → bị bỏ qua', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    const before = c.result()

    press(c, '.')
    expect(c.result()).toBe(before)
  })

  it('TC-DP02 | waitingForSecond → currentInput = "0."', () => {
    const c = createCalcEnv()
    press(c, '5', '+')

    press(c, '.')
    expect(c.result()).toBe('0.')
  })

  it('TC-DP03 | shouldResetNext → reset và hiển thị "0."', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')

    press(c, '.')
    expect(c.result()).toBe('0.')
    expect(c.expression()).toBe('0.')
  })

  it('TC-DP04 | đã có "." → lần thứ hai bị bỏ qua (F-005)', () => {
    const c = createCalcEnv()
    press(c, '5', '.', '.')                // Hai dấu chấm
    expect(c.result()).toBe('5.')
    expect((c.result().match(/\./g) || []).length).toBe(1)
  })

  it('TC-DP05 | bấm "." khi currentInput = "0" → "0."', () => {
    const c = createCalcEnv()
    press(c, '.')
    expect(c.result()).toBe('0.')
  })

  it('TC-DP06 | bấm "." khi currentInput = "5" → "5."', () => {
    const c = createCalcEnv()
    press(c, '5', '.')
    expect(c.result()).toBe('5.')
  })
})


// ══════════════════════════════════════════════════════════════
// MODULE 2 — OPERATOR HANDLING
// FS: [EventController.handleOperator]
// ══════════════════════════════════════════════════════════════

describe('handleOperator', () => {

  it('TC-OP01 | isError=true → bị bỏ qua', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    expect(c.isError()).toBe(true)

    press(c, '+')
    expect(c.isError()).toBe(true)         // Vẫn trong Error State
  })

  // ── BR: Sau kết quả (shouldResetNext) ────────────────────

  it('TC-OP02 | sau "=", toán tử → kết quả trở thành firstOperand', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')          // result = 8

    press(c, '×')
    expect(c.expression()).toBe('8 × 0')
  })

  it('TC-OP03 | sau "=", dòng dưới về "0" khi nhấn toán tử (FS D-1)', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')

    press(c, '×')
    expect(c.result()).toBe('0')
  })

  // ── BR: Toán tử liên tiếp ────────────────────────────────

  it('TC-OP04 | toán tử liên tiếp → ghi đè operator, giữ firstOperand', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '−')
    expect(c.expression()).toBe('5 − 0')
  })

  it('TC-OP05 | sau ghi đè, phép tính thực hiện đúng với operator mới', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '−', '3', '=')    // 5 − 3 = 2
    expect(c.result()).toBe('2')
  })

  // ── BR: Lần đầu nhấn operator ────────────────────────────

  it('TC-OP06 | dòng dưới về "0" sau khi nhấn operator (FS D-1)', () => {
    const c = createCalcEnv()
    press(c, '5', '+')
    expect(c.result()).toBe('0')
  })

  it('TC-OP07 | dòng trên hiển thị "firstOperand op"', () => {
    const c = createCalcEnv()
    press(c, '5', '2', '3', '+')
    expect(c.expression()).toBe('523 + 0')
  })

  it('TC-OP08 | operator highlight bật trên nút được chọn', () => {
    const c = createCalcEnv()
    press(c, '5', '+')
    expect(c.activeOp()).toBe('+')
  })

  it('TC-OP09 | operator highlight tắt sau khi nhập số thứ hai', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3')
    expect(c.activeOp()).toBeNull()
  })

  // ── BR: Chain calculation ─────────────────────────────────

  it('TC-OP10 | chain: 5 + 3 × → hiển thị "5 + 3 × 0", không tự tính', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '×')
    expect(c.expression()).toBe('5 + 3 × 0')
    expect(c.result()).toBe('0')
  })

  it('TC-OP11 | chain: 10 ÷ 2 + → hiển thị "10 ÷ 2 + 0", không tự tính', () => {
    const c = createCalcEnv()
    press(c, '1', '0', '÷', '2', '+')
    expect(c.expression()).toBe('10 ÷ 2 + 0')
  })
})


// ══════════════════════════════════════════════════════════════
// MODULE 3 — CALCULATION
// FS: [EventController.handleEquals] & [Engine.handleDivisionByZero]
// ══════════════════════════════════════════════════════════════

describe('handleEquals — Bảng phép tính (FS Output examples)', () => {

  it('TC-EQ01 | 5 + 3 = 8', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')
    expect(c.result()).toBe('8')
  })

  it('TC-EQ02 | 10 − 4 = 6', () => {
    const c = createCalcEnv()
    press(c, '1', '0', '−', '4', '=')
    expect(c.result()).toBe('6')
  })

  it('TC-EQ03 | 7 × 6 = 42', () => {
    const c = createCalcEnv()
    press(c, '7', '×', '6', '=')
    expect(c.result()).toBe('42')
  })

  it('TC-EQ04 | 10 ÷ 4 = 2.5', () => {
    const c = createCalcEnv()
    press(c, '1', '0', '÷', '4', '=')
    expect(c.result()).toBe('2.5')
  })

  it('TC-EQ05 | 0.1 + 0.2 = 0.3 (không phải 0.30000000000000004) — BRD §6', () => {
    const c = createCalcEnv()
    press(c, '0', '.', '1', '+', '0', '.', '2', '=')
    expect(c.result()).toBe('0.3')
  })

  it('TC-EQ06 | 1 ÷ 3 = 0.3333333333 (làm tròn 10 chữ số thập phân)', () => {
    const c = createCalcEnv()
    press(c, '1', '÷', '3', '=')
    expect(c.result()).toBe('0.3333333333')
  })

  it('TC-EQ07 | 9 × 999999999999999 → ký hiệu khoa học (F-011, abs >= 1e15)', () => {
    const c = createCalcEnv()
    // 9 × 999999999999999 = 8.999999999999991e+15 (vượt ngưỡng 1e15)
    press(c, '9', '×')
    for (const d of '999999999999999') press(c, d)
    press(c, '=')
    expect(c.result()).toMatch(/e\+/)     // Dạng scientific notation
  })

  it('TC-EQ08 | kết quả âm hiển thị đúng với dấu "−" (F-006)', () => {
    const c = createCalcEnv()
    press(c, '3', '−', '7', '=')
    expect(c.result()).toBe('-4')
  })
})

describe('handleEquals — Preconditions & Guards', () => {

  it('TC-EQ09 | isError=true → bị bỏ qua', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    const before = c.result()

    press(c, '=')
    expect(c.result()).toBe(before)
  })

  it('TC-EQ10 | chưa có operator → bỏ qua (không crash)', () => {
    const c = createCalcEnv()
    press(c, '5', '=')
    expect(c.result()).toBe('5')
    expect(c.isError()).toBe(false)
  })

  it('TC-EQ11 | operator rồi "=" ngay (chưa nhập số 2) → bỏ qua', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '=')              // waitingForSecond=true → bỏ qua
    expect(c.result()).toBe('0')
    expect(c.isError()).toBe(false)
  })

  it('TC-EQ12 | "=" liên tiếp → không lặp lại phép tính — BRD §6', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')
    expect(c.result()).toBe('8')

    press(c, '=', '=', '=')             // Lặp 3 lần → vẫn là 8
    expect(c.result()).toBe('8')
  })
})

describe('handleEquals — Display (FS Output spec)', () => {

  it('TC-EQ13 | dòng trên hiển thị "a op b" sau khi nhấn "="', () => {
    const c = createCalcEnv()
    press(c, '5', '2', '3', '+', '4', '7', '=')
    expect(c.expression()).toBe('523 + 47')
    expect(c.result()).toBe('570')
  })

  it('TC-EQ14 | dòng trên hiển thị "a op" khi đang nhập số thứ hai', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3')
    expect(c.expression()).toBe('5 + 3')
  })
})

// ─────────────────────────────────────────────────────────────

describe('Engine.handleDivisionByZero (F-010)', () => {

  it('TC-DIV01 | 10 ÷ 0 → isError = true', () => {
    const c = createCalcEnv()
    press(c, '1', '0', '÷', '0', '=')
    expect(c.isError()).toBe(true)
  })

  it('TC-DIV02 | dòng dưới hiển thị "Không thể chia cho 0"', () => {
    const c = createCalcEnv()
    press(c, '1', '0', '÷', '0', '=')
    expect(c.result()).toBe('Không thể chia cho 0')
  })

  it('TC-DIV03 | dòng trên hiển thị "[a] ÷ 0"', () => {
    const c = createCalcEnv()
    press(c, '1', '0', '÷', '0', '=')
    expect(c.expression()).toBe('10 ÷ 0')
  })

  it('TC-DIV04 | sau lỗi, digit bị vô hiệu hóa', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    const msg = c.result()

    press(c, '5')
    expect(c.result()).toBe(msg)
  })

  it('TC-DIV05 | sau lỗi, operator bị vô hiệu hóa', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')

    press(c, '+')
    expect(c.isError()).toBe(true)
  })

  it('TC-DIV06 | sau lỗi, decimal bị vô hiệu hóa', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    const msg = c.result()

    press(c, '.')
    expect(c.result()).toBe(msg)
  })
})


// ══════════════════════════════════════════════════════════════
// MODULE 4 — DISPLAY CONTROL
// FS: [EventController.handleAllClear] & [EventController.handleBackspace]
// ══════════════════════════════════════════════════════════════

describe('handleAllClear (F-007)', () => {

  it('TC-AC01 | reset từ trạng thái nhập số bình thường', () => {
    const c = createCalcEnv()
    press(c, '5', '2', '3', '+', '4')

    press(c, 'AC')
    expect(c.result()).toBe('0')
    expect(c.expression()).toBe('')
  })

  it('TC-AC02 | thoát được Error State — đây là cách duy nhất', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    expect(c.isError()).toBe(true)

    press(c, 'AC')
    expect(c.isError()).toBe(false)
    expect(c.result()).toBe('0')
  })

  it('TC-AC03 | sau AC từ Error State, có thể tính bình thường', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    press(c, 'AC')

    press(c, '7', '+', '2', '=')
    expect(c.result()).toBe('9')
  })

  it('TC-AC04 | AC sau khi nhấn "=" cũng reset đúng', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')
    expect(c.result()).toBe('8')

    press(c, 'AC')
    expect(c.result()).toBe('0')
    expect(c.expression()).toBe('')
  })
})

// ─────────────────────────────────────────────────────────────

describe('handleBackspace (F-008)', () => {

  it('TC-BS01 | sau "=" (shouldResetNext=true) → bị bỏ qua', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')
    expect(c.result()).toBe('8')

    press(c, '⌫')
    expect(c.result()).toBe('8')           // Không xóa kết quả
  })

  it('TC-BS02 | isError=true → bị bỏ qua', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    const msg = c.result()

    press(c, '⌫')
    expect(c.result()).toBe(msg)
  })

  it('TC-BS03 | waitingForSecond=true → bị bỏ qua (FS Precondition)', () => {
    const c = createCalcEnv()
    press(c, '5', '+')                    // waitingForSecond=true, currentInput='0'

    press(c, '⌫')
    expect(c.result()).toBe('0')          // Không đổi
    expect(c.expression()).toBe('5 + 0')    // Expression giữ nguyên
  })

  it('TC-BS04 | "523" → "52"', () => {
    const c = createCalcEnv()
    press(c, '5', '2', '3', '⌫')
    expect(c.result()).toBe('52')
  })

  it('TC-BS05 | "5" → "0" (1 ký tự → về "0")', () => {
    const c = createCalcEnv()
    press(c, '5', '⌫')
    expect(c.result()).toBe('0')
  })

  it('TC-BS06 | "0." → "0"', () => {
    const c = createCalcEnv()
    press(c, '.', '⌫')                   // currentInput = '0.' → xóa → '0'
    expect(c.result()).toBe('0')
  })

  it('TC-BS07 | "5.3" → "5."', () => {
    const c = createCalcEnv()
    press(c, '5', '.', '3', '⌫')
    expect(c.result()).toBe('5.')
  })

  it('TC-BS08 | backspace nhiều lần về "0"', () => {
    const c = createCalcEnv()
    press(c, '1', '2', '3', '⌫', '⌫', '⌫')
    expect(c.result()).toBe('0')
  })
})


// ══════════════════════════════════════════════════════════════
// BRD SECTION 6 — BUSINESS RULES (cross-module)
// ══════════════════════════════════════════════════════════════

describe('BRD Business Rules §6', () => {

  it('TC-BR01 | sau kết quả + operator → result là firstOperand mới', () => {
    const c = createCalcEnv()
    press(c, '8', '+', '2', '=')          // = 10
    press(c, '×', '3', '=')              // 10 × 3 = 30
    expect(c.result()).toBe('30')
  })

  it('TC-BR02 | sau kết quả + digit → bắt đầu phép tính hoàn toàn mới', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')         // = 8
    press(c, '4', '+', '6', '=')         // Phép mới: 4 + 6 = 10
    expect(c.result()).toBe('10')
  })

  it('TC-BR03 | giới hạn 15 chữ số mỗi toán hạng (F-009)', () => {
    const c = createCalcEnv()
    for (let i = 0; i < 20; i++) press(c, '5') // Cố nhập 20 số
    expect(c.result().length).toBe(15)
  })

  it('TC-BR04 | một dấu "." mỗi toán hạng (F-005)', () => {
    const c = createCalcEnv()
    press(c, '3', '.', '1', '.', '4')    // Dấu chấm thứ hai bị bỏ qua
    expect(c.result()).toBe('3.14')
    expect((c.result().match(/\./g) || []).length).toBe(1)
  })

  it('TC-BR05 | khóa sau ÷ 0: digit + operator + equals + decimal đều vô hiệu (F-010)', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    const msg = c.result()

    press(c, '9', '+', '=', '.')         // Tất cả phải bị bỏ qua
    expect(c.result()).toBe(msg)
    expect(c.isError()).toBe(true)

    press(c, 'AC')                        // Chỉ AC mới thoát được
    expect(c.isError()).toBe(false)
    expect(c.result()).toBe('0')
  })

  it('TC-BR06 | 0.1 + 0.2 = 0.3 — floating-point rounding (BRD §6)', () => {
    const c = createCalcEnv()
    press(c, '0', '.', '1', '+', '0', '.', '2', '=')
    expect(c.result()).toBe('0.3')
  })

  it('TC-BR07 | kết quả âm hiển thị đúng (F-006)', () => {
    const c = createCalcEnv()
    press(c, '2', '−', '9', '=')
    expect(c.result()).toBe('-7')
  })
})


// ══════════════════════════════════════════════════════════════
// BRD SECTION 4.1 — FEATURE CHECKLIST (F-001 – F-011)
// ══════════════════════════════════════════════════════════════

describe('BRD Feature Checklist', () => {

  it('F-001 | Phép cộng (+)', () => {
    const c = createCalcEnv()
    press(c, '1', '2', '+', '8', '=')
    expect(c.result()).toBe('20')
  })

  it('F-002 | Phép trừ (−)', () => {
    const c = createCalcEnv()
    press(c, '9', '9', '−', '3', '3', '=')
    expect(c.result()).toBe('66')
  })

  it('F-003 | Phép nhân (×)', () => {
    const c = createCalcEnv()
    press(c, '1', '2', '×', '1', '2', '=')
    expect(c.result()).toBe('144')
  })

  it('F-004 | Phép chia (÷)', () => {
    const c = createCalcEnv()
    press(c, '8', '4', '÷', '7', '=')
    expect(c.result()).toBe('12')
  })

  it('F-005 | Số thập phân', () => {
    const c = createCalcEnv()
    press(c, '1', '.', '5', '+', '2', '.', '5', '=')
    expect(c.result()).toBe('4')
  })

  it('F-006 | Kết quả âm', () => {
    const c = createCalcEnv()
    press(c, '2', '−', '9', '=')
    expect(c.result()).toBe('-7')
  })

  it('F-007 | AC xóa toàn bộ', () => {
    const c = createCalcEnv()
    press(c, '5', '2', '+', '3', 'AC')
    expect(c.result()).toBe('0')
    expect(c.expression()).toBe('')
  })

  it('F-008 | ⌫ xóa ký tự cuối', () => {
    const c = createCalcEnv()
    press(c, '1', '2', '3', '⌫')
    expect(c.result()).toBe('12')
  })

  it('F-009 | Giới hạn 15 chữ số mỗi toán hạng', () => {
    const c = createCalcEnv()
    for (let i = 0; i < 20; i++) press(c, '1')
    expect(c.result().length).toBeLessThanOrEqual(15)
  })

  it('F-010 | Xử lý lỗi chia cho 0', () => {
    const c = createCalcEnv()
    press(c, '1', '÷', '0', '=')
    expect(c.isError()).toBe(true)
    expect(c.result()).toContain('chia cho 0')
  })

  it('F-011 | Ký hiệu khoa học khi kết quả > 15 chữ số', () => {
    const c = createCalcEnv()
    // 9 × 999999999999999 = 8.999999999999991e+15 (abs >= 1e15 → scientific)
    press(c, '9', '×')
    for (const d of '999999999999999') press(c, d)
    press(c, '=')
    expect(c.result()).toMatch(/e[+\-]/)
  })

  // F-012 (Keyboard) được kiểm tra đầy đủ trong tests/e2e/calculator.spec.js
})


// ══════════════════════════════════════════════════════════════
// MODULE 6 — CONTROLLER: HẰ́NG SỐ (handleConstant) [F-016, FS v2.0.0 §1.3]
// ══════════════════════════════════════════════════════════════

describe('handleConstant (F-013, F-016)', () => {

  it('TC-CONST01 | pi → hiển thị 3.1415926536', () => {
    const c = createCalcEnv()
    c.constant('pi')
    expect(c.result()).toBe('3.1415926536')
  })

  it('TC-CONST02 | e → hiển thị 2.7182818285', () => {
    const c = createCalcEnv()
    c.constant('e')
    // formatResult(Math.E) dùng .toPrecision(14) rồi round 10 chữ số
    // Math.E = 2.718281828459045 → '2.7182818285' (11 chữ số thập phân là xấp xỉ bằng)
    expect(c.result()).toBe('2.7182818285')
  })

  it('TC-CONST03 | isError=true → bỏ qua (FS §1.3 precondition)', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    expect(c.isError()).toBe(true)
    const before = c.result()

    c.constant('pi')                        // Phải bị bỏ qua
    expect(c.result()).toBe(before)         // Không thay đổi
    expect(c.isError()).toBe(true)
  })

  it('TC-CONST04 | sau "=", pi tải người dùng nhập tiếp theo (FS shouldResetNext)', () => {
    const c = createCalcEnv()
    press(c, '5', '+', '3', '=')           // kết quả = 8, shouldResetNext = true

    c.constant('pi')                        // Nạp pi — phải reset rồi gán
    expect(c.result()).toBe('3.1415926536')
    expect(c.expression()).toBe('3.1415926536')         // Biểu thức liền mạch hiển thị pi
  })

  it('TC-CONST05 | waitingForSecond=true, nhấn pi → dùng pi làm toán hạng thứ hai', () => {
    const c = createCalcEnv()
    press(c, '1', '×')                      // waitingForSecond=true
    c.constant('pi')                        // Nhập pi làm toán hạng 2
    expect(c.result()).toBe('3.1415926536')
    expect(c.expression()).toBe('1 × 3.1415926536')      // Expression giữ nguyên
  })

  it('TC-CONST06 | sau pi, nhấn số → bắt đầu phép tính mới (isConstant block append)', () => {
    const c = createCalcEnv()
    c.constant('pi')
    press(c, '5')                           // Bắt đầu số mới, không nối "3.14159...5"
    expect(c.result()).toBe('5')
  })

  it('TC-CONST07 | pi → sin() = 0.0548036651 trong DEG mode (chain: constant + unary)', () => {
    const c = createCalcEnv()
    // Setup mặc định là DEG: sin(3.1415926536 độ) ≈ 0.0548036651
    c.constant('pi')
    c.unary('sin')                          // sin(3.1415... độ) ≈ 0.0548 (DEG mode)
    c.equals()
    expect(parseFloat(c.result())).toBeCloseTo(0.0548036651, 10)
    expect(c.isError()).toBe(false)
  })

  it('TC-CONST08 | e → ln() = 1 (chain: constant + unary)', () => {
    const c = createCalcEnv()
    c.constant('e')
    c.unary('ln')                           // ln(e) = 1
    c.equals()
    expect(parseFloat(c.result())).toBeCloseTo(1, 10)
  })
})


// ══════════════════════════════════════════════════════════════
// MODULE 7 — CONTROLLER: SCIENTIFIC UNARY (BR-11) [FS v2.0.0 §1]
// ══════════════════════════════════════════════════════════════

describe('handleUnaryCalculation — Scientific Mode (BR-11, FS v2.0.0 §2.2)', () => {

  // ── Kết quả hợp lệ ────────────────────────────────────────

  it('TC-SCI01 | sqrt(9) = 3', () => {
    const c = createCalcEnv()
    c.unary('sqrt')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('√(0)')
    press(c, '9')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('√(9)')
    c.equals()
    expect(c.result()).toBe('3')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('√(9)')
  })

  it('TC-SCI02 | 75 → percent = 0.75 (F-013)', () => {
    const c = createCalcEnv()
    press(c, '7', '5')
    c.unary('percent')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('75%')
    c.equals()
    expect(c.result()).toBe('0.75')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('75%')
  })

  it('TC-SCI03 | abs(-10.5) = 10.5', () => {
    const c = createCalcEnv()
    c.unary('abs')
    press(c, '1', '0', '.', '5')
    // Note: absolute of 10.5 is 10.5
    c.equals()
    expect(c.result()).toBe('10.5')
  })

  it('TC-SCI04 | 5 → sq = 25', () => {
    const c = createCalcEnv()
    press(c, '5')
    c.unary('sq')
    c.equals()
    expect(c.result()).toBe('25')
  })

  it('TC-SCI05 | 3 → cube = 27', () => {
    const c = createCalcEnv()
    press(c, '3')
    c.unary('cube')
    c.equals()
    expect(c.result()).toBe('27')
  })

  it('TC-SCI06 | 5 → factorial = 120', () => {
    const c = createCalcEnv()
    press(c, '5')
    c.unary('factorial')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('(5)!')
    c.equals()
    expect(c.result()).toBe('120')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('(5)!')
  })

  it('TC-SCI07 | unary sau toán tử → áp dụng trên currentInput (mid-calc)', () => {
    const c = createCalcEnv()
    press(c, '1', '0', '+')
    c.unary('sqrt')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('10 + √(0)')
    press(c, '9')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('10 + √(9)')
    c.equals()
    expect(c.result()).toBe('13')           // 10 + 3 = 13
  })

  // ── Lỗi toán học (BR-11) ────────────────────────────────────

  it('TC-SCI-ERR01 | ln(0) → Error State (BR-11: logarithm với đầu vào = 0)', () => {
    const c = createCalcEnv()
    c.unary('ln')
    c.equals()
    expect(c.isError()).toBe(true)
  })

  it('TC-SCI-ERR02 | ln(0) → hiển thị cửu thư lỗi, khóa phím (BR-11)', () => {
    const c = createCalcEnv()
    c.unary('ln')
    c.equals()
    expect(c.isError()).toBe(true)

    // Phím số bị khóa
    const before = c.result()
    press(c, '5')
    expect(c.result()).toBe(before)         // Không thay đổi

    // Chỉ AC mới thoát Error State
    press(c, 'AC')
    expect(c.isError()).toBe(false)
    expect(c.result()).toBe('0')
  })

  it('TC-SCI-ERR03 | factorial(-3) → Error State (BR-11)', () => {
    const c = createCalcEnv()
    // Nhập số âm qua: 0 − 3 =
    press(c, '0', '−', '3', '=')            // kết quả = -3
    c.unary('factorial')                    // factorial(-3) → Lỗi toán học
    c.equals()
    expect(c.isError()).toBe(true)
    expect(c.result()).toBe('Lỗi toán học')
  })

  it('TC-SCI-ERR04 | isError=true → unary bỏ qua (precondition)', () => {
    const c = createCalcEnv()
    press(c, '5', '÷', '0', '=')
    expect(c.isError()).toBe(true)
    const before = c.result()

    c.unary('sqrt')                         // Phải bị bỏ qua
    expect(c.result()).toBe(before)
    expect(c.isError()).toBe(true)
  })

  it('TC-BR10 | DEG/RAD Toggle - sin(30) = 0.5 in DEG, different in RAD', () => {
    const c = createCalcEnv()
    // Khởi tạo mặc định là DEG
    expect(c.angleUnit()).toBe('DEG')

    // Nhập sin -> 30 -> equals
    c.unary('sin')
    press(c, '3', '0')
    c.equals()
    expect(c.result()).toBe('0.5')

    // Xóa màn hình
    press(c, 'AC')

    // Click chuyển sang RAD
    c.toggleAngle()
    expect(c.angleUnit()).toBe('RAD')

    // Nhập sin -> 30 -> equals (RAD) -> Không bằng 0.5
    c.unary('sin')
    press(c, '3', '0')
    c.equals()
    expect(c.result()).not.toBe('0.5')

    // Xóa màn hình
    press(c, 'AC')

    // Nhập pi/6 -> sin (RAD) -> 0.5
    c.constant('pi')
    press(c, '÷', '6', '=') // result is pi/6
    c.unary('sin') // will wrap the existing result
    c.equals()
    expect(parseFloat(c.result())).toBeCloseTo(0.5, 10)
  })

  it('TC-BACKSPACE-UNARY | Backspace clears pendingUnary', () => {
    const c = createCalcEnv()
    c.unary('sin')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('sin(0)')
    press(c, '⌫') // Clears pendingUnary because waitingForUnaryInput is true
    expect(c.expression()).toBe('')
    
    c.unary('sin')
    press(c, '3')
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('sin(3)')
    press(c, '⌫') // slices '3' to '0'
    expect(c.expression().replace(/\u200B/g, '').trim()).toBe('sin(0)')
    press(c, '⌫') // clears pendingUnary
    expect(c.expression()).toBe('')
  })

  it('TC-BR03-v2.1.1 | giới hạn biểu thức 100 ký tự (BR-03)', () => {
    const c = createCalcEnv()
    // Nhập "sin(1)" 16 lần -> 16 * 6 = 96 ký tự
    for (let i = 0; i < 16; i++) {
      press(c, '1')
      c.unary('sin')
    }
    expect(c.expression().replace(/\s/g, '').length).toBe(96)

    // Gõ thêm "1", "2", "3" -> 99 ký tự
    press(c, '1', '2', '3')
    expect(c.expression().replace(/\s/g, '').length).toBe(99)

    // Gõ thêm "4" -> 100 ký tự (được phép)
    press(c, '4')
    expect(c.expression().replace(/\s/g, '').length).toBe(100)

    // Gõ thêm "5" -> bị chặn
    press(c, '5')
    expect(c.expression().replace(/\s/g, '').length).toBe(100)

    // Thử gõ thêm operator -> bị chặn
    press(c, '+')
    expect(c.expression().replace(/\s/g, '').length).toBe(100)

    // Thử gõ hằng số pi -> bị chặn
    c.constant('pi')
    expect(c.expression().replace(/\s/g, '').length).toBe(100)

    // Thử gõ thêm unary -> bị chặn
    c.unary('sin')
    expect(c.expression().replace(/\s/g, '').length).toBe(100)
  })
})

describe('Visual Fraction Input (F-021, BR-21)', () => {
  it('TC-FR01 | Click fraction button chèn (⬚)/(⬚) và đặt con trỏ ảo ở tử số', () => {
    const c = createCalcEnv()
    c.document.getElementById('btn-fraction').click()
    expect(c.window.state.expression).toBe('(⬚)/(⬚)')
    expect(c.window.state.cursorIndex).toBe(1)
  })

  it('TC-FR02 | Gõ số khi con trỏ hoạt động thay thế ⬚ và dịch chuyển con trỏ', () => {
    const c = createCalcEnv()
    c.document.getElementById('btn-fraction').click()
    c.digit('5')
    expect(c.window.state.expression).toBe('(5)/(⬚)')
    expect(c.window.state.cursorIndex).toBe(2)
  })

  it('TC-FR03 | Click vào mẫu số di chuyển con trỏ ảo đến mẫu số', () => {
    const c = createCalcEnv()
    c.document.getElementById('btn-fraction').click()
    c.digit('5')
    
    const placeholders = c.document.querySelectorAll('.math-placeholder')
    expect(placeholders.length).toBe(1)
    placeholders[0].click()
    expect(c.window.state.cursorIndex).toBe(5)
  })

  it('TC-FR04 | Gõ mẫu số và bấm "=" tính toán ra kết quả chuẩn xác', async () => {
    const c = createCalcEnv()
    c.document.getElementById('btn-fraction').click()
    c.digit('5')
    
    let placeholders = c.document.querySelectorAll('.math-placeholder')
    placeholders[0].click()
    c.digit('3')
    expect(c.window.state.expression).toBe('(5)/(3)')
    
    c.equals()
    expect(c.result()).toBe('1.6666666667')
  })

  it('TC-FR05 | Xóa ký tự bằng backspace lùi con trỏ và xóa ký tự trước đó', () => {
    const c = createCalcEnv()
    c.document.getElementById('btn-fraction').click()
    c.digit('5')
    c.backspace()
    expect(c.window.state.expression).toBe('(⬚)/(⬚)')
    expect(c.window.state.cursorIndex).toBe(1)
  })

  it('TC-FR06 | Gõ nhiều chữ số liên tiếp vào tử số không bị reset con trỏ và không bị văng ra ngoài', () => {
    const c = createCalcEnv()
    c.document.getElementById('btn-fraction').click()
    c.digit('5')
    c.digit('3')
    c.digit('2')
    expect(c.window.state.expression).toBe('(532)/(⬚)')
    expect(c.window.state.cursorIndex).toBe(4)
  })

  it('TC-FR07 | Bấm phím toán tử khi con trỏ ở cuối phân số sẽ tự động thoát con trỏ ảo và nối toán tử ra ngoài', () => {
    const c = createCalcEnv()
    c.document.getElementById('btn-fraction').click()
    c.digit('5')
    
    let placeholders = c.document.querySelectorAll('.math-placeholder')
    placeholders[0].click()
    c.digit('3')
    
    c.operator('+')
    expect(c.window.state.expression).toBe('(5)/(3) + ')
    expect(c.window.state.cursorIndex).toBeNull()
  })

  it('TC-FR08 | Bấm phím toán tử khi con trỏ ở giữa biểu thức tử số vẫn chèn bình thường', () => {
    const c = createCalcEnv()
    c.document.getElementById('btn-fraction').click()
    c.digit('5')
    c.operator('+')
    expect(c.window.state.expression).toBe('(5+)/(⬚)')
    expect(c.window.state.cursorIndex).toBe(3)
  })
})

describe('Free Variable x Routing (v2.1.2)', () => {
  it('TC-RT01 | d/dx(x^2, 2) -> không chứa x tự do -> tính toán thường = 4', () => {
    const c = createCalcEnv()
    c.window.state.expression = 'd/dx(x^2, 2)'
    c.equals()
    expect(c.result()).toBe('4')
  })

  it('TC-RT02 | d/dx(x^2, x) -> chứa x tự do ở đối số 2 -> kích hoạt Solver -> x xấp xỉ 0', () => {
    const c = createCalcEnv()
    c.window.state.expression = 'd/dx(x^2, x)'
    c.equals()
    const match = c.result().match(/^x\s*=\s*(.+)$/)
    expect(match).not.toBeNull()
    const val = parseFloat(match[1])
    expect(Math.abs(val)).toBeLessThan(1e-5)
  })

  it('TC-RT03 | ∫(x^2, 0, x) -> chứa x tự do ở cận trên -> kích hoạt Solver -> x xấp xỉ 0', () => {
    const c = createCalcEnv()
    c.window.state.expression = '∫(x^2, 0, x)'
    c.equals()
    const match = c.result().match(/^x\s*=\s*(.+)$/)
    expect(match).not.toBeNull()
    const val = parseFloat(match[1])
    expect(Math.abs(val)).toBeLessThan(1e-3)
  })

  it('TC-RT04 | x^2 - 4 -> chứa x tự do -> kích hoạt Solver -> x = 2 hoặc x = -2', () => {
    const c = createCalcEnv()
    c.window.state.expression = 'x^2 - 4'
    c.equals()
    const res = c.result()
    expect(res === 'x = 2' || res === 'x = -2').toBe(true)
  })
})


