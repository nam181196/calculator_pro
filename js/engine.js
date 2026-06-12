/* ============================================================
   js/engine.js — Calculator Engine Service (FS Module 1)
   Cung cấp các API tính toán toán học cốt lõi (cơ bản và khoa học)
   Ref: FUNCTION_SPECIFICATION_v2.0.0.md — MODULE 1
   ============================================================ */

'use strict';

/**
 * Thực hiện phép tính 2 toán hạng cơ bản và căn bậc n.
 * Trả về giá trị số hoặc ném ra mã lỗi chuỗi ('Lỗi toán học' / 'Không thể chia cho 0').
 */
export function performCalculation(operand1, operator, operand2) {
  const num1 = parseFloat(operand1);
  const num2 = parseFloat(operand2);

  if (isNaN(num1) || isNaN(num2)) {
    throw new Error('Lỗi toán học');
  }

  // BR-05: Chia cho 0
  if (operator === '÷' && num2 === 0) {
    throw new Error('Không thể chia cho 0');
  }

  let result;
  switch (operator) {
    case '+':
      result = num1 + num2;
      break;
    case '−':
      result = num1 - num2;
      break;
    case '×':
      result = num1 * num2;
      break;
    case '÷':
      result = num1 / num2;
      break;
    case '^':
      result = Math.pow(num1, num2);
      break;
    case 'ʸ√x':
      // Căn bậc n của x (n ʸ√ x). Ở đây: num1 = n (bậc), num2 = x (số dưới căn).
      // Công thức: x^(1/n).
      if (num1 === 0) {
        throw new Error('Lỗi toán học'); // Căn bậc 0 không xác định
      }
      if (num2 < 0 && num1 % 2 === 0) {
        throw new Error('Lỗi toán học'); // Căn bậc chẵn của số âm (số ảo)
      }
      
      if (num2 < 0) {
        // Căn bậc lẻ của số âm: ví dụ căn bậc 3 của -8 = -(-8)^(1/3) = -2
        result = -Math.pow(-num2, 1 / num1);
      } else {
        result = Math.pow(num2, 1 / num1);
      }
      break;
    default:
      throw new Error('Lỗi toán học');
  }

  if (!isFinite(result) || isNaN(result)) {
    throw new Error('Lỗi toán học');
  }

  return result;
}

/**
 * Thực hiện phép tính khoa học 1 toán hạng tức thời.
 * Trả về giá trị số hoặc ném ra lỗi.
 */
export function performUnaryCalculation(value, functionName, angleUnit = 'DEG') {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error('Lỗi toán học');
  }

  let result;

  switch (functionName) {
    // --- Lượng giác ---
    case 'sin':
      result = Math.sin(convertToRadian(num, angleUnit));
      break;
    case 'cos':
      result = Math.cos(convertToRadian(num, angleUnit));
      break;
    case 'tan':
      // tan(90 deg) hoặc odd multiples of 90 deg is undefined (infinity)
      const radVal = convertToRadian(num, angleUnit);
      if (Math.abs(Math.cos(radVal)) < 1e-14) {
        throw new Error('Lỗi toán học');
      }
      result = Math.sin(radVal) / Math.cos(radVal);
      break;
    case 'asin':
      if (num < -1 || num > 1) {
        throw new Error('Lỗi toán học');
      }
      result = convertFromRadian(Math.asin(num), angleUnit);
      break;
    case 'acos':
      if (num < -1 || num > 1) {
        throw new Error('Lỗi toán học');
      }
      result = convertFromRadian(Math.acos(num), angleUnit);
      break;
    case 'atan':
      result = convertFromRadian(Math.atan(num), angleUnit);
      break;

    // --- Logarithm ---
    case 'ln':
      if (num <= 0) {
        throw new Error('Lỗi toán học');
      }
      result = Math.log(num);
      break;
    case 'log':
      if (num <= 0) {
        throw new Error('Lỗi toán học');
      }
      result = Math.log10(num);
      break;

    // --- Căn thức ---
    case 'sqrt':
      if (num < 0) {
        throw new Error('Lỗi toán học');
      }
      result = Math.sqrt(num);
      break;
    case 'cbrt':
      result = Math.cbrt(num);
      break;

    // --- Mũ & Lũy thừa ---
    case 'sq':
      result = num * num;
      break;
    case 'cube':
      result = num * num * num;
      break;

    // --- Giai thừa ---
    case 'factorial':
      // Giai thừa n! chỉ nhận số nguyên không âm và <= 170
      if (num < 0 || !Number.isInteger(num) || num > 170) {
        throw new Error('Lỗi toán học');
      }
      result = calculateFactorial(num);
      break;

    // --- Trị tuyệt đối ---
    case 'abs':
      result = Math.abs(num);
      break;

    // --- Phần trăm ---
    case 'percent':
      result = num / 100;
      break;

    default:
      throw new Error('Lỗi toán học');
  }

  if (!isFinite(result) || isNaN(result)) {
    throw new Error('Lỗi toán học');
  }

  return result;
}

/**
 * Định dạng kết quả hiển thị theo quy tắc làm tròn 10 chữ số thập phân
 * hoặc chuyển đổi sang ký hiệu khoa học nếu quá lớn/nhỏ (BR-06 & BR-09).
 */
export function formatResult(value) {
  if (value === 0) return '0';
  
  const abs = Math.abs(value);

  // BR-09: Hiển thị ký hiệu khoa học khi kết quả quá lớn hoặc quá nhỏ (ngoại trừ 0)
  if (abs >= 1e15 || abs < 1e-9) {
    // toExponential(10) và loại bỏ trailing zeros ở phần thập phân số mũ
    return value.toExponential(10).replace(/\.?0+(e)/, '$1');
  }

  // BR-06: Làm tròn tối đa 10 chữ số thập phân
  const rounded = parseFloat(value.toPrecision(14));
  
  // Tránh sai số nổi, ví dụ: 0.1 + 0.2 = 0.30000000000000004
  const finalResult = parseFloat(rounded.toFixed(10));
  return String(finalResult);
}

/* ---------- Hàm Helper Nội bộ ---------- */

function convertToRadian(value, unit) {
  return unit === 'DEG' ? (value * Math.PI) / 180 : value;
}

function convertFromRadian(rad, unit) {
  return unit === 'DEG' ? (rad * 180) / Math.PI : rad;
}

function calculateFactorial(n) {
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}
