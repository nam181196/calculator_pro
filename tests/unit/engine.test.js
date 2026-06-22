/**
 * tests/unit/engine.test.js
 * ─────────────────────────────────────────────────────────────
 * Unit tests for Calculator Engine (js/engine.js)
 * Covers all mathematical logic, conversions (DEG/RAD), error boundaries,
 * and result formatting for Simple Calculator v2.0.0.
 */

import { describe, it, expect } from 'vitest';
import { 
  performCalculation, 
  performUnaryCalculation, 
  formatResult,
  solveForX
} from '../../js/engine.js';

describe('Engine: performCalculation (2 operands)', () => {
  it('TC-ENG01 | Phép cộng cơ bản', () => {
    expect(performCalculation('5.5', '+', '4.5')).toBe(10);
  });

  it('TC-ENG02 | Phép trừ cơ bản', () => {
    expect(performCalculation('10', '−', '4.5')).toBe(5.5);
  });

  it('TC-ENG03 | Phép nhân cơ bản', () => {
    expect(performCalculation('3', '×', '1.5')).toBe(4.5);
  });

  it('TC-ENG04 | Phép chia cơ bản', () => {
    expect(performCalculation('10', '÷', '4')).toBe(2.5);
  });

  it('TC-ENG05 | Chia cho 0 -> ném lỗi', () => {
    expect(() => performCalculation('5', '÷', '0')).toThrow('Không thể chia cho 0');
  });

  it('TC-ENG06 | Căn bậc n (ʸ√x): Bậc chẵn của số dương', () => {
    expect(performCalculation('4', 'ʸ√x', '81')).toBe(3);
  });

  it('TC-ENG07 | Căn bậc n (ʸ√x): Bậc lẻ của số âm', () => {
    expect(performCalculation('3', 'ʸ√x', '-8')).toBe(-2);
  });

  it('TC-ENG08 | Căn bậc n (ʸ√x): Bậc chẵn của số âm -> ném lỗi', () => {
    expect(() => performCalculation('2', 'ʸ√x', '-9')).toThrow('Lỗi toán học');
  });

  it('TC-ENG09 | Căn bậc n (ʸ√x): Bậc 0 -> ném lỗi', () => {
    expect(() => performCalculation('0', 'ʸ√x', '81')).toThrow('Lỗi toán học');
  });

  it('TC-ENG10 | Toán hạng không hợp lệ -> ném lỗi', () => {
    expect(() => performCalculation('abc', '+', '5')).toThrow('Lỗi toán học');
    expect(() => performCalculation('5', '+', 'def')).toThrow('Lỗi toán học');
  });
});

describe('Engine: performUnaryCalculation (1 operand)', () => {
  // ── Lượng giác ở chế độ DEG ──────────────────────────────
  describe('Lượng giác (DEG mode)', () => {
    it('TC-UNY01 | sin(30 deg) = 0.5', () => {
      expect(performUnaryCalculation('30', 'sin', 'DEG')).toBeCloseTo(0.5, 10);
    });

    it('TC-UNY02 | sin(90 deg) = 1', () => {
      expect(performUnaryCalculation('90', 'sin', 'DEG')).toBeCloseTo(1, 10);
    });

    it('TC-UNY03 | cos(60 deg) = 0.5', () => {
      expect(performUnaryCalculation('60', 'cos', 'DEG')).toBeCloseTo(0.5, 10);
    });

    it('TC-UNY04 | cos(90 deg) = 0', () => {
      expect(performUnaryCalculation('90', 'cos', 'DEG')).toBeCloseTo(0, 10);
    });

    it('TC-UNY05 | tan(45 deg) = 1', () => {
      expect(performUnaryCalculation('45', 'tan', 'DEG')).toBeCloseTo(1, 10);
    });

    it('TC-UNY06 | tan(90 deg) -> lỗi miền số (cos=0) -> ném lỗi', () => {
      expect(() => performUnaryCalculation('90', 'tan', 'DEG')).toThrow('Lỗi toán học');
    });

    it('TC-UNY07 | asin(0.5) = 30 deg', () => {
      expect(performUnaryCalculation('0.5', 'asin', 'DEG')).toBeCloseTo(30, 10);
    });

    it('TC-UNY08 | asin(2) -> vượt miền [-1, 1] -> ném lỗi', () => {
      expect(() => performUnaryCalculation('2', 'asin', 'DEG')).toThrow('Lỗi toán học');
    });

    it('TC-UNY09 | acos(0.5) = 60 deg', () => {
      expect(performUnaryCalculation('0.5', 'acos', 'DEG')).toBeCloseTo(60, 10);
    });

    it('TC-UNY10 | acos(-2) -> vượt miền [-1, 1] -> ném lỗi', () => {
      expect(() => performUnaryCalculation('-2', 'acos', 'DEG')).toThrow('Lỗi toán học');
    });

    it('TC-UNY11 | atan(1) = 45 deg', () => {
      expect(performUnaryCalculation('1', 'atan', 'DEG')).toBeCloseTo(45, 10);
    });
  });

  // ── Lượng giác ở chế độ RAD ──────────────────────────────
  describe('Lượng giác (RAD mode)', () => {
    it('TC-UNY12 | sin(pi/6 rad) = 0.5', () => {
      const piOver6 = Math.PI / 6;
      expect(performUnaryCalculation(String(piOver6), 'sin', 'RAD')).toBeCloseTo(0.5, 10);
    });

    it('TC-UNY13 | cos(pi/3 rad) = 0.5', () => {
      const piOver3 = Math.PI / 3;
      expect(performUnaryCalculation(String(piOver3), 'cos', 'RAD')).toBeCloseTo(0.5, 10);
    });

    it('TC-UNY14 | tan(pi/4 rad) = 1', () => {
      const piOver4 = Math.PI / 4;
      expect(performUnaryCalculation(String(piOver4), 'tan', 'RAD')).toBeCloseTo(1, 10);
    });

    it('TC-UNY15 | asin(0.5) = pi/6 rad', () => {
      const expected = Math.PI / 6;
      expect(performUnaryCalculation('0.5', 'asin', 'RAD')).toBeCloseTo(expected, 10);
    });

    it('TC-UNY16 | acos(0.5) = pi/3 rad', () => {
      const expected = Math.PI / 3;
      expect(performUnaryCalculation('0.5', 'acos', 'RAD')).toBeCloseTo(expected, 10);
    });

    it('TC-UNY17 | atan(1) = pi/4 rad', () => {
      const expected = Math.PI / 4;
      expect(performUnaryCalculation('1', 'atan', 'RAD')).toBeCloseTo(expected, 10);
    });
  });

  // ── Logarithm & Căn thức ──────────────────────────────────
  describe('Logarithm & Roots', () => {
    it('TC-UNY18 | ln(e) = 1', () => {
      expect(performUnaryCalculation(String(Math.E), 'ln')).toBeCloseTo(1, 10);
    });

    it('TC-UNY19 | ln(0) -> ném lỗi', () => {
      expect(() => performUnaryCalculation('0', 'ln')).toThrow('Lỗi toán học');
    });

    it('TC-UNY20 | ln(-5) -> ném lỗi', () => {
      expect(() => performUnaryCalculation('-5', 'ln')).toThrow('Lỗi toán học');
    });

    it('TC-UNY21 | log(100) = 2', () => {
      expect(performUnaryCalculation('100', 'log')).toBeCloseTo(2, 10);
    });

    it('TC-UNY22 | log(-1) -> ném lỗi', () => {
      expect(() => performUnaryCalculation('-1', 'log')).toThrow('Lỗi toán học');
    });

    it('TC-UNY23 | sqrt(9) = 3', () => {
      expect(performUnaryCalculation('9', 'sqrt')).toBe(3);
    });

    it('TC-UNY24 | sqrt(-4) -> ném lỗi', () => {
      expect(() => performUnaryCalculation('-4', 'sqrt')).toThrow('Lỗi toán học');
    });

    it('TC-UNY25 | cbrt(-8) = -2', () => {
      expect(performUnaryCalculation('-8', 'cbrt')).toBe(-2);
    });
  });

  // ── Bình phương, Giai thừa, Trị tuyệt đối, Phần trăm ──────
  describe('Powers, Factorials & Others', () => {
    it('TC-UNY26 | sq(-5) = 25', () => {
      expect(performUnaryCalculation('-5', 'sq')).toBe(25);
    });

    it('TC-UNY27 | cube(-3) = -27', () => {
      expect(performUnaryCalculation('-3', 'cube')).toBe(-27);
    });

    it('TC-UNY28 | factorial(0) = 1', () => {
      expect(performUnaryCalculation('0', 'factorial')).toBe(1);
    });

    it('TC-UNY29 | factorial(5) = 120', () => {
      expect(performUnaryCalculation('5', 'factorial')).toBe(120);
    });

    it('TC-UNY30 | factorial(170) -> không tràn số kép', () => {
      expect(performUnaryCalculation('170', 'factorial')).toBeGreaterThan(0);
    });

    it('TC-UNY31 | factorial(171) -> tràn số (>170) -> ném lỗi', () => {
      expect(() => performUnaryCalculation('171', 'factorial')).toThrow('Lỗi toán học');
    });

    it('TC-UNY32 | factorial(5.5) -> số thập phân -> ném lỗi', () => {
      expect(() => performUnaryCalculation('5.5', 'factorial')).toThrow('Lỗi toán học');
    });

    it('TC-UNY33 | factorial(-3) -> số âm -> ném lỗi', () => {
      expect(() => performUnaryCalculation('-3', 'factorial')).toThrow('Lỗi toán học');
    });

    it('TC-UNY34 | abs(-10.5) = 10.5', () => {
      expect(performUnaryCalculation('-10.5', 'abs')).toBe(10.5);
    });

    it('TC-UNY35 | percent(75) = 0.75', () => {
      expect(performUnaryCalculation('75', 'percent')).toBe(0.75);
    });
  });
});

describe('Engine: formatResult', () => {
  it('TC-FMT01 | Số 0 -> "0"', () => {
    expect(formatResult(0)).toBe('0');
  });

  it('TC-FMT02 | Làm tròn tối đa 10 chữ số thập phân', () => {
    expect(formatResult(1 / 3)).toBe('0.3333333333');
    expect(formatResult(0.1 + 0.2)).toBe('0.3');
  });

  it('TC-FMT03 | Kết quả quá lớn (>= 1e15) -> hiển thị dạng scientific notation', () => {
    expect(formatResult(1000000000000000)).toMatch(/1e\+15/);
    expect(formatResult(12345678901234567)).toMatch(/1\.2345678901e\+16/);
  });

  it('TC-FMT04 | Kết quả quá nhỏ (< 1e-9) -> hiển thị dạng scientific notation', () => {
    expect(formatResult(0.000000000099)).toMatch(/9\.9e\-11/);
  });

  it('TC-FMT05 | Loại bỏ số 0 thừa ở phần thập phân số mũ', () => {
    expect(formatResult(1.5e20)).toBe('1.5e+20');
    expect(formatResult(5.0e15)).toBe('5e+15');
  });
});

describe('Engine: solveForX (Newton-Raphson Solver)', () => {
  it('TC-SLV01 | Giải phương trình bậc nhất (2x - 4 = 0)', () => {
    expect(solveForX('2x - 4')).toBe('x = 2');
  });

  it('TC-SLV02 | Giải phương trình bậc hai (x^2 - 9 = 0)', () => {
    const res = solveForX('x^2 - 9');
    expect(res === 'x = 3' || res === 'x = -3').toBe(true);
  });

  it('TC-SLV03 | Giải phương trình lượng giác (sin(x) - 0.5 = 0 ở chế độ DEG)', () => {
    expect(solveForX('sin(x) - 0.5', 'DEG')).toBe('x = 30');
  });

  it('TC-SLV04 | Phương trình vô nghiệm thực (x^2 + 9 = 0) -> ném lỗi', () => {
    expect(() => solveForX('x^2 + 9')).toThrow('Lỗi toán học');
  });

  it('TC-SLV05 | Biểu thức lỗi cú pháp -> ném lỗi', () => {
    expect(() => solveForX('x +')).toThrow('Lỗi cú pháp');
  });
});
