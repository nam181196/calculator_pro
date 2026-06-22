/* ============================================================
   js/api-mock.js — Client-Side Mock REST API Router
   
   Tầng trung gian (Mock Router Layer) chặn các lời gọi window.fetch
   và định tuyến tới Service Layers tương ứng (Engine, Auth, Sync).
   
   Mục đích: Cho phép Controller (calculator.js) gọi các API endpoint
   theo đúng hợp đồng FS v2.0.0 (POST /engine/calculate, POST /auth/login,
   GET /history...) mà không cần backend thực sự — duy trì nguyên tắc
   "Zero build step, static, offline-first" của SAD v2.0.0.
   
   Ref: FUNCTION_SPECIFICATION_v2.0.0.md — Tất cả 3 Module
        SYSTEM_ARCHITECTURE_v2.0.0.md — Section 2 (Constraints)
   ============================================================ */

import { 
  performCalculation, 
  performUnaryCalculation, 
  formatResult,
  evaluateExpression,
  solveEquation,
  integrateSimpson,
  solveForX
} from './engine.js';
import { register, login, logout, db, isFirebaseConfigured } from '../auth/firebase-auth.js';
import { saveHistoryEntry, clearCloudHistory, getMockCloudHistory, saveMockCloudHistory } from './sync.js';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Cache original fetch
const originalFetch = window.fetch;

// Helper to construct responses
const jsonResponse = (status, data) => {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json' }
  });
};

// Override window.fetch
window.fetch = async function (url, options = {}) {
  const urlStr = typeof url === 'string' ? url : (url.url || '');

  // Parse path and method
  let path = urlStr;
  let searchParams = new URLSearchParams();

  try {
    const urlObj = new URL(urlStr, window.location.origin);
    path = urlObj.pathname;
    searchParams = urlObj.searchParams;
  } catch (e) {
    // Fallback if URL is relative and URL parser fails
    if (urlStr.includes('?')) {
      const parts = urlStr.split('?');
      path = parts[0];
      searchParams = new URLSearchParams(parts[1]);
    }
  }

  const method = (options.method || 'GET').toUpperCase();

  // Determine if it is a mock API request
  const isMockEndpoint =
    path.startsWith('/engine/') ||
    path.startsWith('/auth/') ||
    path.startsWith('/history');

  if (!isMockEndpoint) {
    return originalFetch.apply(this, arguments);
  }

  // Parse body
  let body = {};
  if (options.body) {
    try {
      body = JSON.parse(options.body);
    } catch (e) {
      body = options.body;
    }
  }

  try {
    // ------------------------------------------------------------
    // 1. CALCULATOR ENGINE ENDPOINTS
    // ------------------------------------------------------------
    if (path === '/engine/calculate' && method === 'POST') {
      const { expression, operand1, operator, operand2, angleUnit } = body;
      try {
        let result;
        if (expression !== undefined) {
          result = evaluateExpression(expression, angleUnit || 'DEG');
        } else {
          result = performCalculation(operand1, operator, operand2);
        }
        const formatted = formatResult(result);
        return jsonResponse(200, { status: 'success', result: formatted });
      } catch (err) {
        return jsonResponse(400, { status: 'error', message: err.message });
      }
    }
 
    if (path === '/engine/solve-x' && method === 'POST') {
      const { expression, angleUnit } = body;
      try {
        const result = solveForX(expression, angleUnit || 'DEG');
        return jsonResponse(200, { status: 'success', result });
      } catch (err) {
        return jsonResponse(400, { status: 'error', message: err.message });
      }
    }

    if (path === '/engine/calculate-unary' && method === 'POST') {
      const { value, functionName, angleUnit, lowerLimit, upperLimit } = body;
      try {
        let result;
        if (functionName === 'integral') {
          result = integrateSimpson(value, lowerLimit, upperLimit, angleUnit || 'DEG');
        } else {
          result = performUnaryCalculation(value, functionName, angleUnit || 'DEG');
        }
        const formatted = formatResult(result);
        return jsonResponse(200, { status: 'success', result: formatted });
      } catch (err) {
        return jsonResponse(400, { status: 'error', message: err.message });
      }
    }

    if (path === '/engine/solve' && method === 'POST') {
      const { coefficients, type } = body;
      try {
        const roots = solveEquation(coefficients, type);
        return jsonResponse(200, { status: 'success', roots });
      } catch (err) {
        return jsonResponse(400, { status: 'error', message: err.message });
      }
    }

    // ------------------------------------------------------------
    // 2. AUTHENTICATION ENDPOINTS
    // ------------------------------------------------------------
    if (path === '/auth/register' && method === 'POST') {
      const { email, password } = body;
      try {
        const user = await register(email, password);
        return jsonResponse(200, {
          status: 'success',
          user: { uid: user.uid, email: user.email }
        });
      } catch (err) {
        return jsonResponse(400, { status: 'error', message: err.message });
      }
    }

    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = body;
      try {
        const user = await login(email, password);
        return jsonResponse(200, {
          status: 'success',
          user: { uid: user.uid, email: user.email }
        });
      } catch (err) {
        return jsonResponse(401, { status: 'error', message: err.message });
      }
    }

    if (path === '/auth/logout' && method === 'POST') {
      try {
        await logout();
        return jsonResponse(200, { status: 'success', message: 'Đăng xuất thành công.' });
      } catch (err) {
        return jsonResponse(500, { status: 'error', message: err.message });
      }
    }

    // ------------------------------------------------------------
    // 3. CLOUD STORAGE & SYNC ENDPOINTS
    // ------------------------------------------------------------
    if (path === '/history' && method === 'POST') {
      const { expression, result, status, userId } = body;
      const currentUser = userId ? { uid: userId } : null;
      try {
        const entry = await saveHistoryEntry(expression, result, status, currentUser);
        return jsonResponse(200, { status: 'success', entry });
      } catch (err) {
        return jsonResponse(500, { status: 'error', message: err.message });
      }
    }

    if (path === '/history' && method === 'GET') {
      const userId = searchParams.get('userId');
      const limitVal = parseInt(searchParams.get('limit') || '200');
      if (!userId) {
        return jsonResponse(400, { status: 'error', message: 'Thiếu userId' });
      }

      try {
        let historyList = [];
        if (isFirebaseConfigured) {
          const q = query(
            collection(db, 'history'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(limitVal)
          );
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            historyList.push({ id: doc.id, ...doc.data() });
          });
        } else {
          const allMockHistory = getMockCloudHistory();
          historyList = allMockHistory
            .filter(item => item.userId === userId)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limitVal);
        }
        return jsonResponse(200, { status: 'success', data: historyList });
      } catch (err) {
        return jsonResponse(500, { status: 'error', message: err.message });
      }
    }

    if (path === '/history' && method === 'DELETE') {
      const userId = searchParams.get('userId');
      if (!userId) {
        return jsonResponse(400, { status: 'error', message: 'Thiếu userId' });
      }
      try {
        await clearCloudHistory(userId);
        return jsonResponse(200, { status: 'success', message: 'Xóa lịch sử thành công.' });
      } catch (err) {
        return jsonResponse(500, { status: 'error', message: err.message });
      }
    }

    if (path === '/history/sync' && method === 'POST') {
      const { userId, entries } = body;
      if (!userId || !entries || !Array.isArray(entries)) {
        return jsonResponse(400, { status: 'error', message: 'Lỗi cấu trúc payload hoặc không có bản ghi nào để đồng bộ' });
      }
      try {
        if (isFirebaseConfigured) {
          for (const entry of entries) {
            entry.userId = userId;
            await addDoc(collection(db, 'history'), entry);
          }
        } else {
          const history = getMockCloudHistory();
          for (const entry of entries) {
            entry.userId = userId;
            history.push(entry);
          }
          if (history.length > 200) {
            history.splice(0, history.length - 200);
          }
          saveMockCloudHistory(history);
        }
        return jsonResponse(200, { status: 'success', message: 'Đồng bộ hóa hoàn tất.' });
      } catch (err) {
        return jsonResponse(403, { status: 'error', message: err.message });
      }
    }

  } catch (err) {
    return jsonResponse(500, { status: 'error', message: err.message });
  }

  return jsonResponse(404, { status: 'error', message: 'Endpoint not found' });
};
