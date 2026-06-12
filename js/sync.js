/* ============================================================
   js/sync.js — Cloud Storage & Sync Service (FS Module 3)
   Cung cấp các API lưu trữ lịch sử và đồng bộ hóa đám mây
   Ref: FUNCTION_SPECIFICATION_v2.0.0.md — MODULE 3
   ============================================================ */

import { db, isFirebaseConfigured } from '../auth/firebase-auth.js';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocs,
  deleteDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const KEY_LOCAL_HISTORY = 'calc_local_history';
const KEY_OFFLINE_QUEUE = 'calc_offline_queue';
const KEY_MOCK_CLOUD_HISTORY = 'calc_mock_cloud_history';

// Cache for mock cloud history listeners (active when offline mock mode is active)
const mockCloudListeners = new Set();

// ============================================================
// MOCK CLOUD STORAGE HELPERS (Chạy khi chưa cấu hình Firebase)
// ============================================================

export function getMockCloudHistory() {
  const data = localStorage.getItem(KEY_MOCK_CLOUD_HISTORY);
  return data ? JSON.parse(data) : [];
}

export function saveMockCloudHistory(history) {
  localStorage.setItem(KEY_MOCK_CLOUD_HISTORY, JSON.stringify(history));
  // Notify all mock subscribers
  mockCloudListeners.forEach(listener => {
    try {
      const userHistory = history.filter(item => item.userId === listener.uid);
      listener.callback(userHistory);
    } catch (e) {
      console.error("Lỗi callback mock cloud stream:", e);
    }
  });
}

function saveMockCloudHistoryEntry(entry) {
  const history = getMockCloudHistory();
  history.push(entry);
  if (history.length > 200) {
    history.shift(); // Limit to 200 entries FIFO
  }
  saveMockCloudHistory(history);
}

// ============================================================
// PUBLIC STORAGE & SYNC SERVICE APIS
// ============================================================

/**
 * Lấy lịch sử tính toán cục bộ dưới dạng Mảng.
 */
export function getLocalHistory() {
  const data = localStorage.getItem(KEY_LOCAL_HISTORY);
  return data ? JSON.parse(data) : [];
}

/**
 * Lưu phép tính mới hoàn thành (F-010 / BR-08).
 */
export async function saveHistoryEntry(expression, result, status = 'success', currentUser = null) {
  const uuid = generateUUID();
  const entry = {
    id: uuid,
    userId: currentUser ? currentUser.uid : null,
    expression,
    result,
    status,
    timestamp: Date.now()
  };

  // 1. Lưu vào Local History (Tối đa 50 phần tử, FIFO)
  const localHistory = getLocalHistory();
  localHistory.push(entry);
  
  if (localHistory.length > 50) {
    localHistory.shift(); // Xóa phần tử cũ nhất
  }
  localStorage.setItem(KEY_LOCAL_HISTORY, JSON.stringify(localHistory));

  // 2. Xử lý đồng bộ Cloud nếu đã đăng nhập
  if (currentUser) {
    if (isFirebaseConfigured) {
      if (navigator.onLine) {
        try {
          await addDoc(collection(db, 'history'), entry);
        } catch (error) {
          console.error("Lỗi khi lưu trực tiếp lên Firestore:", error);
          // Fallback ghi vào offline queue nếu Firestore lỗi
          addToOfflineQueue(entry);
        }
      } else {
        // Đang offline -> đưa vào hàng đợi đồng bộ
        addToOfflineQueue(entry);
      }
    } else {
      // Lưu vào Mock Cloud database cục bộ
      saveMockCloudHistoryEntry(entry);
    }
  }
  
  return entry;
}

/**
 * Đăng ký lắng nghe trực tuyến lịch sử đám mây (onSnapshot - max 200).
 */
export function streamCloudHistory(uid, onUpdate) {
  if (!uid) {
    onUpdate([]);
    return () => {};
  }

  // Tải danh sách lịch sử ban đầu qua API GET /history
  fetch(`/history?userId=${uid}&limit=200`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        onUpdate(data.data);
      }
    })
    .catch(err => {
      console.error("Lỗi khi tải lịch sử đám mây ban đầu qua API:", err);
    });

  if (!isFirebaseConfigured) {
    const listenerRecord = { 
      uid, 
      callback: (list) => {
        // Trả về danh sách sắp xếp timestamp giảm dần
        const sorted = [...list].sort((a, b) => b.timestamp - a.timestamp);
        onUpdate(sorted);
      } 
    };
    mockCloudListeners.add(listenerRecord);
    
    return () => {
      mockCloudListeners.delete(listenerRecord);
    };
  }

  const q = query(
    collection(db, 'history'),
    where('userId', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(200)
  );

  // Trả về hàm hủy đăng ký lắng nghe (unsubscribe)
  return onSnapshot(q, (snapshot) => {
    const historyList = [];
    snapshot.forEach((doc) => {
      historyList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    onUpdate(historyList);
  }, (error) => {
    console.error("Lỗi khi stream dữ liệu lịch sử đám mây:", error);
  });
}

/**
 * Hỏi và đồng bộ lịch sử cục bộ lên Cloud khi đăng nhập (Reconcile - BR-07).
 */
export async function checkAndSyncLocalHistory(uid, onPromptConfirm) {
  const localHistory = getLocalHistory();
  // Chỉ hỏi nếu có bản ghi cục bộ
  if (localHistory.length > 0) {
    onPromptConfirm(async () => {
      try {
        const response = await fetch('/history/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid, entries: localHistory })
        });
        if (response.ok) {
          // Xóa lịch sử local sau khi đồng bộ thành công để tránh trùng lặp
          localStorage.removeItem(KEY_LOCAL_HISTORY);
        } else {
          const errData = await response.json();
          throw new Error(errData.message || 'Lỗi đồng bộ');
        }
      } catch (error) {
        console.error("Lỗi khi đồng bộ lịch sử local lên Cloud:", error);
      }
    });
  }
}


export async function clearCloudHistory(uid) {
  if (!uid) return;

  if (!isFirebaseConfigured) {
    // Xóa trong Mock Cloud Storage
    const history = getMockCloudHistory();
    const updated = history.filter(item => item.userId !== uid);
    saveMockCloudHistory(updated);
    return;
  }

  const q = query(
    collection(db, 'history'),
    where('userId', '==', uid)
  );
  try {
    const snapshot = await getDocs(q);
    const deletePromises = [];
    snapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, 'history', document.id)));
    });
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Lỗi khi xóa lịch sử đám mây:", error);
    throw error;
  }
}

/* ---------- Hàm Helper Nội bộ ---------- */

function addToOfflineQueue(entry) {
  const queueData = localStorage.getItem(KEY_OFFLINE_QUEUE);
  const queue = queueData ? JSON.parse(queueData) : [];
  queue.push(entry);
  localStorage.setItem(KEY_OFFLINE_QUEUE, JSON.stringify(queue));
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback sinh chuỗi ngẫu nhiên giống UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
