/* ============================================================
   auth/firebase-auth.js — Authentication Service (FS Module 2)
   Cung cấp các API xác thực người dùng qua Firebase Authentication
   Ref: FUNCTION_SPECIFICATION_v2.0.0.md — MODULE 2
   ============================================================ */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Cấu hình Firebase (Người dùng thay thế bằng cấu hình thực tế của dự án của mình)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Kiểm tra xem cấu hình Firebase đã được điền chưa
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app, auth, db;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase SDK:", error);
  }
} else {
  console.warn("Firebase chưa được cấu hình. Các tính năng Đăng nhập & Đồng bộ đám mây sẽ chạy ở chế độ giả lập (Mock Offline-First). Vui lòng cập nhật API Keys trong file auth/firebase-auth.js để kết nối trực tuyến.");
}

export { auth, db };

// ============================================================
// LOCAL STORAGE MOCK AUTH FALLBACK (Chạy khi chưa cấu hình Firebase)
// ============================================================

function getMockUsers() {
  const data = localStorage.getItem('calc_mock_users');
  return data ? JSON.parse(data) : {};
}

function saveMockUsers(users) {
  localStorage.setItem('calc_mock_users', JSON.stringify(users));
}

function getMockCurrentUser() {
  const data = localStorage.getItem('calc_mock_current_user');
  return data ? JSON.parse(data) : null;
}

function setMockCurrentUser(user) {
  if (user) {
    localStorage.setItem('calc_mock_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('calc_mock_current_user');
  }
}

const mockListeners = new Set();

function triggerMockAuthChange(user) {
  mockListeners.forEach(callback => {
    try {
      callback(user);
    } catch (e) {
      console.error("Lỗi callback mock auth:", e);
    }
  });
}

// ============================================================
// PUBLIC AUTH SERVICE APIS
// ============================================================

/**
 * Đăng ký tài khoản mới bằng Email & Mật khẩu.
 */
export async function register(email, password) {
  if (!isFirebaseConfigured) {
    // Giả lập độ trễ mạng 350ms
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const users = getMockUsers();
    if (users[email]) {
      throw new Error("Email này đã được sử dụng cho tài khoản khác.");
    }
    
    const uid = 'mock_uid_' + Math.random().toString(36).substr(2, 9);
    users[email] = { uid, email, password };
    saveMockUsers(users);

    const user = { uid, email };
    setMockCurrentUser(user);
    triggerMockAuthChange(user);
    return user;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code));
  }
}

/**
 * Đăng nhập tài khoản bằng Email & Mật khẩu.
 */
export async function login(email, password) {
  if (!isFirebaseConfigured) {
    // Giả lập độ trễ mạng 350ms
    await new Promise(resolve => setTimeout(resolve, 350));

    const users = getMockUsers();
    const userRecord = users[email];
    if (!userRecord || userRecord.password !== password) {
      throw new Error("Email hoặc mật khẩu không chính xác.");
    }

    const user = { uid: userRecord.uid, email: userRecord.email };
    setMockCurrentUser(user);
    triggerMockAuthChange(user);
    return user;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code));
  }
}

/**
 * Đăng xuất tài khoản hiện tại.
 */
export async function logout() {
  if (!isFirebaseConfigured) {
    setMockCurrentUser(null);
    triggerMockAuthChange(null);
    return;
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    throw new Error("Không thể đăng xuất. Vui lòng thử lại.");
  }
}

/**
 * Đăng ký lắng nghe sự kiện thay đổi trạng thái xác thực.
 */
export function onAuthChanged(callback) {
  if (!isFirebaseConfigured) {
    mockListeners.add(callback);
    // Trả về trạng thái mock hiện tại tức thì
    callback(getMockCurrentUser());
    return () => {
      mockListeners.delete(callback);
    };
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Chuyển dịch mã lỗi Firebase Auth thô sang ngôn ngữ tiếng Việt thân thiện (FS Module 8).
 */
function translateAuthError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Định dạng email không hợp lệ.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị khóa.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác.';
    case 'auth/wrong-password':
      return 'Mật khẩu không chính xác.';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng cho tài khoản khác.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu (tối thiểu 6 ký tự).';
    case 'auth/network-request-failed':
      return 'Kết nối mạng không ổn định. Vui lòng thử lại.';
    default:
      return 'Đã xảy ra lỗi hệ thống khi xác thực. Vui lòng thử lại sau.';
  }
}
