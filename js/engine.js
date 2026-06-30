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

/**
 * Tokenize biểu thức thành mảng các Token.
 */
export function tokenize(expr) {
  // Preprocess display/unicode symbols to standard math functions/operators
  expr = expr
    .replace(/ʸ√x/g, '__YROOT__')
    .replace(/³√/g, 'cbrt')
    .replace(/√/g, 'sqrt')
    .replace(/__YROOT__/g, 'ʸ√x')
    .replace(/π/g, 'pi')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\|([^|]+)\|/g, 'abs($1)');

  // Normalize whitespace
  expr = expr.replace(/\s+/g, '');
  
  const tokens = [];
  let i = 0;
  
  while (i < expr.length) {
    const char = expr[i];
    
    // 0. Calculus functions (d/dx and ∫)
    if (expr.slice(i).startsWith('d/dx(') || expr.slice(i).startsWith('∫(')) {
      const isDeriv = expr.slice(i).startsWith('d/dx(');
      const funcName = isDeriv ? 'd/dx' : '∫';
      const startIdx = i + (isDeriv ? 5 : 2);
      
      // Find matching parenthesis
      let parenCount = 1;
      let endIdx = startIdx;
      while (endIdx < expr.length && parenCount > 0) {
        if (expr[endIdx] === '(') parenCount++;
        else if (expr[endIdx] === ')') parenCount--;
        endIdx++;
      }
      
      if (parenCount > 0) {
        throw new Error('Lỗi cú pháp');
      }
      
      const content = expr.slice(startIdx, endIdx - 1);
      
      // Parse arguments separated by commas at the top level
      const args = [];
      let currentArg = '';
      let pCount = 0;
      for (let j = 0; j < content.length; j++) {
        const c = content[j];
        if (c === '(') pCount++;
        else if (c === ')') pCount--;
        
        if (c === ',' && pCount === 0) {
          args.push(currentArg);
          currentArg = '';
        } else {
          currentArg += c;
        }
      }
      args.push(currentArg);
      
      // Validate argument count
      if (isDeriv && args.length !== 2) {
        throw new Error('Lỗi cú pháp');
      }
      if (!isDeriv && args.length !== 3) {
        throw new Error('Lỗi cú pháp');
      }
      
      // Compile each argument recursively
      const subRPNs = args.map(arg => {
        if (arg.trim() === '') {
          throw new Error('Lỗi cú pháp');
        }
        const subTokens = tokenize(arg);
        return shuntingYard(subTokens);
      });
      
      tokens.push({
        type: 'CALCULUS_FUNC',
        value: funcName,
        subRPNs: subRPNs
      });
      
      i = endIdx;
      continue;
    }
    
    // 1. Khớp số thập phân hoặc số nguyên
    let numMatch = expr.slice(i).match(/^\d+(?:\.\d+)?/);
    if (numMatch) {
      let numStr = numMatch[0];
      let nextIdx = i + numStr.length;
      // Khớp ký hiệu khoa học e+ hoặc e-
      if (nextIdx < expr.length && (expr[nextIdx] === 'e' || expr[nextIdx] === 'E')) {
        let sciMatch = expr.slice(nextIdx).match(/^[eE][+-]?\d+/);
        if (sciMatch) {
          numStr += sciMatch[0];
        }
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      i += numStr.length;
      continue;
    }
    
    // 2. Hằng số & Biến số
    if (expr.slice(i, i + 2).toLowerCase() === 'pi') {
      tokens.push({ type: 'CONSTANT', value: 'pi' });
      i += 2;
      continue;
    }
    if (char === 'π') {
      tokens.push({ type: 'CONSTANT', value: 'pi' });
      i += 1;
      continue;
    }
    if (char.toLowerCase() === 'e') {
      tokens.push({ type: 'CONSTANT', value: 'e' });
      i += 1;
      continue;
    }
    if (char.toLowerCase() === 'x') {
      tokens.push({ type: 'VARIABLE', value: 'x' });
      i += 1;
      continue;
    }
    
    // 3. Dấu ngoặc đơn
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i += 1;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i += 1;
      continue;
    }
    
    // 4. Các hàm khoa học (tìm trước toán tử)
    let foundFunc = false;
    const functions = ['asin', 'acos', 'atan', 'sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'cbrt', 'abs'];
    for (const func of functions) {
      if (expr.slice(i).startsWith(func)) {
        tokens.push({ type: 'FUNCTION', value: func });
        i += func.length;
        foundFunc = true;
        break;
      }
    }
    if (foundFunc) continue;
    
    // 5. Toán tử
    // Ưu tiên khớp "ʸ√x" trước
    if (expr.slice(i).startsWith('ʸ√x')) {
      tokens.push({ type: 'OPERATOR', value: 'ʸ√x' });
      i += 3;
      continue;
    }
    
    // Kiểm tra xem toán tử minus là nhị phân hay đơn phân
    if (char === '-' || char === '−') {
      const isUnary = (tokens.length === 0 || 
                       tokens[tokens.length - 1].type === 'OPERATOR' || 
                       tokens[tokens.length - 1].type === 'LPAREN' ||
                       tokens[tokens.length - 1].type === 'FUNCTION');
      if (isUnary) {
        tokens.push({ type: 'UNARY_MINUS', value: 'UNARY_MINUS' });
      } else {
        tokens.push({ type: 'OPERATOR', value: '−' });
      }
      i += 1;
      continue;
    }
    
    const singleOps = {
      '+': '+',
      '×': '×',
      '*': '×',
      '÷': '÷',
      '/': '÷',
      '^': '^',
      '%': '%',
      '!': '!'
    };
    
    if (char in singleOps) {
      tokens.push({ type: 'OPERATOR', value: singleOps[char] });
      i += 1;
      continue;
    }
    
    // Nếu có ký tự lạ không khớp
    throw new Error('Lỗi cú pháp');
  }
  
  // Tự động chèn toán tử nhân ẩn (Implicit Multiplication)
  const finalTokens = [];
  for (let j = 0; j < tokens.length; j++) {
    const curr = tokens[j];
    finalTokens.push(curr);
    if (j < tokens.length - 1) {
      const next = tokens[j + 1];
      const leftCanMultiply = (curr.type === 'NUMBER' || curr.type === 'CONSTANT' || curr.type === 'VARIABLE' || curr.type === 'RPAREN' || curr.value === '%' || curr.value === '!');
      const rightCanMultiply = (next.type === 'NUMBER' || next.type === 'CONSTANT' || next.type === 'VARIABLE' || next.type === 'LPAREN' || next.type === 'FUNCTION');
      if (leftCanMultiply && rightCanMultiply) {
        finalTokens.push({ type: 'OPERATOR', value: '×' });
      }
    }
  }
  
  return finalTokens;
}

const operatorPrecedence = {
  '+': 2,
  '−': 2,
  '×': 3,
  '÷': 3,
  '^': 4,
  'ʸ√x': 4,
  'UNARY_MINUS': 5,
  '%': 6,
  '!': 6
};

const operatorAssociativity = {
  '+': 'LEFT',
  '−': 'LEFT',
  '×': 'LEFT',
  '÷': 'LEFT',
  '^': 'RIGHT',
  'ʸ√x': 'RIGHT',
  'UNARY_MINUS': 'RIGHT'
};

/**
 * Chuyển đổi mảng token trung tố thành hậu tố (RPN) bằng Shunting-yard.
 */
export function shuntingYard(tokens) {
  const outputQueue = [];
  const operatorStack = [];
  
  for (const token of tokens) {
    if (token.type === 'NUMBER' || token.type === 'CONSTANT' || token.type === 'VARIABLE' || token.type === 'CALCULUS_FUNC') {
      outputQueue.push(token);
    } else if (token.type === 'FUNCTION') {
      operatorStack.push(token);
    } else if (token.type === 'OPERATOR') {
      const val = token.value;
      if (val === '%' || val === '!') {
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'OPERATOR' || top.type === 'UNARY_MINUS') {
            const topPrec = operatorPrecedence[top.value];
            const currPrec = operatorPrecedence[val];
            if (topPrec > currPrec || (topPrec === currPrec && operatorAssociativity[val] === 'LEFT')) {
              outputQueue.push(operatorStack.pop());
              continue;
            }
          }
          break;
        }
        outputQueue.push(token);
      } else {
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'OPERATOR' || top.type === 'UNARY_MINUS') {
            const topPrec = operatorPrecedence[top.value];
            const currPrec = operatorPrecedence[val];
            if (topPrec > currPrec || (topPrec === currPrec && operatorAssociativity[val] === 'LEFT')) {
              outputQueue.push(operatorStack.pop());
              continue;
            }
          }
          break;
        }
        operatorStack.push(token);
      }
    } else if (token.type === 'UNARY_MINUS') {
      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundLparen = false;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'LPAREN') {
          operatorStack.pop();
          foundLparen = true;
          break;
        } else {
          outputQueue.push(operatorStack.pop());
        }
      }
      if (!foundLparen) {
        throw new Error('Lỗi cú pháp');
      }
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
        outputQueue.push(operatorStack.pop());
      }
    }
  }
  
  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Lỗi cú pháp');
    }
    outputQueue.push(top);
  }
  
  return outputQueue;
}

/**
 * Lượng giá biểu thức RPN sử dụng stack.
 */
function evaluateRPNInternal(rpn, xValue = null, angleUnit = 'DEG', envDepth = 0) {
  const stack = [];
  
  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      const val = parseFloat(token.value);
      if (isNaN(val)) {
        throw new Error('Lỗi toán học');
      }
      stack.push(val);
    } else if (token.type === 'CONSTANT') {
      if (token.value === 'pi') {
        stack.push(Math.PI);
      } else if (token.value === 'e') {
        stack.push(Math.E);
      } else {
        throw new Error('Lỗi toán học');
      }
    } else if (token.type === 'VARIABLE') {
      if (xValue === null || xValue === undefined) {
        throw new Error('Lỗi cú pháp');
      }
      stack.push(xValue);
    } else if (token.type === 'UNARY_MINUS') {
      if (stack.length < 1) {
        throw new Error('Lỗi cú pháp');
      }
      const a = stack.pop();
      stack.push(-a);
    } else if (token.type === 'OPERATOR') {
      const op = token.value;
      if (op === '%') {
        if (stack.length < 1) {
          throw new Error('Lỗi cú pháp');
        }
        const a = stack.pop();
        stack.push(a / 100);
      } else if (op === '!') {
        if (stack.length < 1) {
          throw new Error('Lỗi cú pháp');
        }
        const a = stack.pop();
        if (a < 0 || !Number.isInteger(a) || a > 170) {
          throw new Error('Lỗi toán học');
        }
        stack.push(calculateFactorial(a));
      } else {
        if (stack.length < 2) {
          throw new Error('Lỗi cú pháp');
        }
        const b = stack.pop();
        const a = stack.pop();
        try {
          const res = performCalculation(a, op, b);
          stack.push(res);
        } catch (err) {
          throw err;
        }
      }
    } else if (token.type === 'FUNCTION') {
      if (stack.length < 1) {
        throw new Error('Lỗi cú pháp');
      }
      const a = stack.pop();
      try {
        const res = performUnaryCalculation(a, token.value, angleUnit);
        stack.push(res);
      } catch (err) {
        throw err;
      }
    } else if (token.type === 'CALCULUS_FUNC') {
      if (envDepth >= 3) {
        throw new Error('Lỗi toán học');
      }
      const depth = envDepth + 1;
      const funcName = token.value;
      const subRPNs = token.subRPNs;
      
      if (funcName === 'd/dx') {
        const rpn_f = subRPNs[0];
        const rpn_x0 = subRPNs[1];
        
        const x0 = evaluateRPNInternal(rpn_x0, xValue, angleUnit, depth);
        const h = 1e-5;
        const xPlus = x0 + h;
        const xMinus = x0 - h;
        
        const fPlus = evaluateRPNInternal(rpn_f, xPlus, angleUnit, depth);
        const fMinus = evaluateRPNInternal(rpn_f, xMinus, angleUnit, depth);
        
        const derivative = (fPlus - fMinus) / (2 * h);
        if (isNaN(derivative) || !isFinite(derivative)) {
          throw new Error('Lỗi toán học');
        }
        stack.push(derivative);
      } else if (funcName === '∫') {
        const rpn_f = subRPNs[0];
        const rpn_a = subRPNs[1];
        const rpn_b = subRPNs[2];
        
        const a = evaluateRPNInternal(rpn_a, xValue, angleUnit, depth);
        const b = evaluateRPNInternal(rpn_b, xValue, angleUnit, depth);
        
        if (a === b) {
          stack.push(0);
        } else {
          let lower = a;
          let upper = b;
          let factor = 1;
          if (b < a) {
            lower = b;
            upper = a;
            factor = -1;
          }
          
          const N = 1000;
          const h = (upper - lower) / N;
          
          const evaluateAt = (x) => {
            const fx = evaluateRPNInternal(rpn_f, x, angleUnit, depth);
            if (isNaN(fx) || !isFinite(fx)) {
              throw new Error('Lỗi toán học');
            }
            return fx;
          };
          
          let sum = evaluateAt(lower) + evaluateAt(upper);
          for (let k = 1; k < N; k++) {
            const x = lower + k * h;
            const fx = evaluateAt(x);
            if (k % 2 === 1) {
              sum += 4 * fx;
            } else {
              sum += 2 * fx;
            }
          }
          
          const integralValue = (h / 3) * sum * factor;
          if (isNaN(integralValue) || !isFinite(integralValue)) {
            throw new Error('Lỗi toán học');
          }
          stack.push(integralValue);
        }
      }
    }
  }
  
  if (stack.length !== 1) {
    throw new Error('Lỗi cú pháp');
  }
  
  return stack[0];
}

export function evaluateRPN(rpn, xValue = null, angleUnit = 'DEG') {
  return evaluateRPNInternal(rpn, xValue, angleUnit, 0);
}

/**
 * Phân tích và tính toán biểu thức PEMDAS (F-012).
 */
export function evaluateExpression(expr, angleUnit = 'DEG') {
  const tokens = tokenize(expr);
  const containsX = tokens.some(t => t.type === 'VARIABLE');
  if (containsX) {
    throw new Error('Lỗi cú pháp');
  }
  const rpn = shuntingYard(tokens);
  return evaluateRPN(rpn, null, angleUnit);
}

/**
 * Giải phương trình Solver (F-014).
 */
export function solveEquation(coefficients, type) {
  if (!Array.isArray(coefficients)) {
    throw new Error('Hệ số gửi lên không phải là định dạng số hợp lệ');
  }

  const expectedLengths = {
    linear: 2,
    quadratic: 3,
    system2: 6
  };

  const expectedLength = expectedLengths[type];
  if (expectedLength === undefined) {
    throw new Error('Loại phương trình không hỗ trợ');
  }

  if (coefficients.length !== expectedLength) {
    throw new Error('Hệ số gửi lên không phải là định dạng số hợp lệ');
  }

  for (const c of coefficients) {
    if (typeof c !== 'number' || isNaN(c) || !isFinite(c)) {
      throw new Error('Hệ số gửi lên không phải là định dạng số hợp lệ');
    }
  }
  
  if (type === 'linear') {
    const [a, b] = coefficients;
    if (a !== 0) {
      return [formatResult(-b / a)];
    } else {
      if (b === 0) {
        return ['Vô số nghiệm'];
      } else {
        return ['Vô nghiệm'];
      }
    }
  } else if (type === 'quadratic') {
    const [a, b, c] = coefficients;
    if (a === 0) {
      return solveEquation([b, c], 'linear');
    }
    
    const delta = b * b - 4 * a * c;
    if (delta > 0) {
      const x1 = (-b + Math.sqrt(delta)) / (2 * a);
      const x2 = (-b - Math.sqrt(delta)) / (2 * a);
      return [formatResult(x1), formatResult(x2)];
    } else if (delta === 0) {
      const x = -b / (2 * a);
      return [formatResult(x)];
    } else {
      const u = -b / (2 * a);
      const v = Math.sqrt(-delta) / (2 * a);
      
      const uStr = formatResult(u);
      const vStr = formatResult(Math.abs(v));
      
      const root1 = `${uStr} + ${vStr}i`;
      const root2 = `${uStr} - ${vStr}i`;
      return [root1, root2];
    }
  } else if (type === 'system2') {
    const [a1, b1, c1, a2, b2, c2] = coefficients;
    const D = a1 * b2 - a2 * b1;
    const Dx = c1 * b2 - c2 * b1;
    const Dy = a1 * c2 - a2 * c1;
    
    if (D !== 0) {
      const x = Dx / D;
      const y = Dy / D;
      return ['x = ' + formatResult(x), 'y = ' + formatResult(y)];
    } else {
      if (Dx === 0 && Dy === 0) {
        return ['Vô số nghiệm'];
      } else {
        return ['Vô nghiệm'];
      }
    }
  } else {
    throw new Error('Loại phương trình không hỗ trợ');
  }
}

/**
 * Tính tích phân xác định bằng phương pháp Simpson (F-015).
 */
export function integrateSimpson(expr, a, b, angleUnit = 'DEG') {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (isNaN(numA) || isNaN(numB) || !isFinite(numA) || !isFinite(numB)) {
    throw new Error('Lỗi toán học');
  }
  
  if (numA === numB) {
    return 0;
  }
  
  let lower = numA;
  let upper = numB;
  let factor = 1;
  if (numB < numA) {
    lower = numB;
    upper = numA;
    factor = -1;
  }
  
  let rpn;
  try {
    const tokens = tokenize(expr);
    rpn = shuntingYard(tokens);
  } catch (err) {
    throw new Error('Lỗi cú pháp');
  }
  
  const N = 1000;
  const h = (upper - lower) / N;
  
  const evaluateAt = (x) => {
    try {
      const val = evaluateRPN(rpn, x, angleUnit);
      if (isNaN(val) || !isFinite(val)) {
        throw new Error('Lỗi toán học');
      }
      return val;
    } catch (err) {
      throw new Error('Lỗi toán học');
    }
  };
  
  let sum = evaluateAt(lower) + evaluateAt(upper);
  for (let i = 1; i < N; i++) {
    const x = lower + i * h;
    const fx = evaluateAt(x);
    if (i % 2 === 1) {
      sum += 4 * fx;
    } else {
      sum += 2 * fx;
    }
  }
  
  const integralValue = (h / 3) * sum * factor;
  if (isNaN(integralValue) || !isFinite(integralValue)) {
    throw new Error('Lỗi toán học');
  }
  
  return integralValue;
}

/**
 * Bộ giải phương trình Tìm x bằng phương pháp Newton-Raphson (F-020).
 */
export function solveForX(expr, angleUnit = 'DEG') {
  let rpn;
  try {
    const tokens = tokenize(expr);
    rpn = shuntingYard(tokens);
  } catch (err) {
    throw new Error('Lỗi cú pháp');
  }
  
  const startPoints = [1.0, 0.0, -1.0, 10.0, -10.0];
  const maxIterations = 100;
  const tolerance = 1e-12;
  const h = 1e-5;
  const flatDerivativeThreshold = 1e-12;
  
  const evaluateAt = (x) => {
    const val = evaluateRPN(rpn, x, angleUnit);
    if (isNaN(val) || !isFinite(val)) {
      throw new Error('Lỗi toán học');
    }
    return val;
  };
  
  for (const x0 of startPoints) {
    let xn = x0;
    let converged = false;
    
    for (let iter = 0; iter < maxIterations; iter++) {
      let fxn;
      try {
        fxn = evaluateAt(xn);
      } catch (err) {
        if (err.message === 'Lỗi cú pháp') {
          throw err;
        }
        break; // Gặp lỗi toán học ở điểm này, thử điểm xuất phát tiếp theo
      }
      
      if (Math.abs(fxn) < tolerance) {
        converged = true;
        break;
      }
      
      let fPlus, fMinus;
      try {
        fPlus = evaluateAt(xn + h);
        fMinus = evaluateAt(xn - h);
      } catch (err) {
        if (err.message === 'Lỗi cú pháp') {
          throw err;
        }
        break;
      }
      
      const df = (fPlus - fMinus) / (2 * h);
      if (Math.abs(df) < flatDerivativeThreshold) {
        break; // Đạo hàm quá phẳng, thử điểm xuất phát tiếp theo
      }
      
      const nextX = xn - fxn / df;
      if (isNaN(nextX) || !isFinite(nextX)) {
        break;
      }
      xn = nextX;
    }
    
    if (converged) {
      // Đảm bảo sai số đạt yêu cầu BR-14: |f(x_n)| < 10^-7
      try {
        if (Math.abs(evaluateAt(xn)) < 1e-7) {
          return 'x = ' + formatResult(xn);
        }
      } catch (e) {
        // Bỏ qua điểm này nếu có lỗi
      }
    }
  }
  
  throw new Error('Lỗi toán học');
}

