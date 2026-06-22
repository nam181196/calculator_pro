# SYSTEM ARCHITECTURE DOCUMENT (SAD) - Simple Calculator Web App v2.1.0

| Thông tin         | Chi tiết                        |
| :---------------- | :------------------------------ |
| **Dự án**         | Simple Calculator Web App       |
| **Phiên bản**     | v2.1.0                          |
| **Ngày cập nhật** | 2026-06-15                      |
| **Trạng thái**    | DRAFT                           |
| **Tác giả**       | Nam (Product Owner & Developer) |

---

## NHẬT KÝ THAY ĐỔI

| Version | Ngày       | Người sửa | Mô tả thay đổi                                                                                                |
| :------ | :--------- | :-------- | :------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2026-05-29 | Nam       | Tài liệu kiến trúc ban đầu (v1.0.0)                                                                           |
| 2.0.0   | 2026-06-08 | Nam       | Cập nhật v2.0.0: Thêm Scientific Mode, Dark/Light Mode, Cloud History Sync, Firebase Authentication           |
| 2.1.0   | 2026-06-15 | Nam       | Nâng cấp v2.1.0: Thiết kế Expression Parser (PEMDAS), Equation Solver, Definite Integral Engine               |

---

## Section 1: Introduction and Goals

Simple Calculator Web App v2.1.0 nâng cấp hệ thống tính toán từ mô hình **tuần tự đơn giản** (chỉ thực hiện tính toán từng cặp hai số hạng) sang mô hình **Phân tích cú pháp biểu thức (Expression Parser)**. Đây là bước nhảy vọt giúp người dùng nhập liệu tự nhiên và giải quyết được các bài toán phức tạp hơn ngay trên trình duyệt mà không cần sử dụng máy tính khoa học chuyên dụng.

**Mục tiêu kiến trúc chính:**
- **Zero build step:** Tiếp tục duy trì nguyên tắc chạy trực tiếp mã nguồn ES Modules trong trình duyệt không qua build tool hay bundler.
- **Tách biệt mối quan tâm (Separation of Concerns):** Phân chia rõ ràng lớp hiển thị giao diện (View), điều phối (Controller), định tuyến API cục bộ (Mock API) và bộ xử lý toán học (Expression Engine).
- **Tính toán số học chính xác (Solver & Calculus):** Cung cấp các thuật toán hiệu năng cao để giải phương trình đại số và tính tích phân xác định trực tiếp trên luồng chính mà không gây đơ/treo giao diện.
- **Đồng bộ hóa nâng cao:** Mở rộng khả năng lưu trữ lịch sử hai tầng để xử lý các công thức nâng cao.

---

## Section 2: Architecture Constraints

- **Runtime & Ngôn ngữ:** Chỉ chạy trên trình duyệt sử dụng HTML5, CSS3 và Vanilla JS (ES Modules). Không phụ thuộc vào thư viện bên thứ ba bên ngoài Firebase CDN.
- **An toàn tính toán (No eval):** Bộ phân tích biểu thức bắt buộc triển khai thủ công bằng thuật toán **Shunting-yard** nhằm loại bỏ hoàn toàn việc sử dụng hàm `eval()` (rủi ro bảo mật XSS lớn).
- **Giới hạn thời gian thực thi (Performance budget):** Thuật toán tích phân Simpson's Rule giới hạn mặc định $N = 1000$ khoảng chia để đảm bảo thời gian tính toán luôn dưới **5ms**, nằm trong ngân sách render 60fps của trình duyệt.
- **Tính độc lập offline (Mock API):** Không phụ thuộc vào server thật. Tầng định tuyến fetch mock sẽ chặn toàn bộ request toán học/auth để chuyển hướng xuống engine local, đảm bảo chạy offline hoàn toàn.

---

## Section 3: Context and Scope

Hệ thống hoạt động độc lập ngay trên thiết bị khách (Client-side). Giao diện máy tính cung cấp ba tab chính để người dùng chọn tương tác, sau đó chuyển tín hiệu xuống Controller xử lý thông qua Mock API.

```mermaid
graph TD
    User([Người dùng]) -- Nhập biểu thức / hệ số --> UI[ui.js - View Layer]
    UI -- Điều hướng sự kiện --> Controller[calculator.js - Controller]
    Controller -- Gửi Fetch API --> MockAPI[api-mock.js - Mock API Layer]
    
    MockAPI -- /engine/calculate --> ParserEngine[engine.js - Parser Layer]
    MockAPI -- /engine/calculate-unary --> ParserEngine
    MockAPI -- /engine/calculate-unary (Integral) --> IntegralEngine[engine.js - Calculus Layer]
    MockAPI -- /engine/solve --> SolverEngine[engine.js - Solver Layer]
    MockAPI -- /auth/ & /history --> SyncService[sync.js & firebase-auth.js]
    
    ParserEngine -- Kết quả --> UI
    IntegralEngine -- Thế biến x --> ParserEngine
```

---

## Section 4: Data Architecture & Persistence

Toàn bộ dữ liệu cấu hình giao diện (Theme, góc DEG/RAD) và lịch sử tính toán được lưu giữ ở hai tầng:
1. **Local Storage (Tier 1):** Lưu trữ cấu hình và tối đa 50 phép tính gần nhất trong queue offline.
2. **Cloud Firestore (Tier 2):** Đồng bộ hóa tối đa 200 bản ghi lịch sử lên Firestore khi người dùng đăng nhập.

### Schema dữ liệu cho các phép toán v2.1.0 mới:
*   **PEMDAS (F-012/F-013):** Lưu trữ biểu thức dạng chuỗi hoàn chỉnh (ví dụ: `2 + 3 × (4 - 1)` với kết quả `11`).
*   **Solver (F-014):** 
    *   Bậc 2: `Giải PT: ax² + bx + c = 0 → x = nghiệm` (Ví dụ: `Giải PT: x² - 3x + 2 = 0 → x₁=2, x₂=1`).
    *   Bậc 1: `Giải PT: ax + b = 0 → x = nghiệm`.
    *   Hệ 2 ẩn: `Giải hệ PT: {a1x+b1y=c1, a2x+b2y=c2} → x = nghiệmX, y = nghiệmY`.
*   **Definite Integral (F-015):** Lưu dạng `∫(f(x), a, b) = kết quả` (Ví dụ: `∫(x², 0, 1) = 0.3333333333`).

---

## Section 5: Building Block View

### 5.1. Cấu trúc Phân tầng (Layered Architecture)

Dự án tuân thủ kiến trúc phân tầng dạng Service nhằm đảm bảo tính bảo trì và dễ viết test:

1.  **View Layer (index.html, style.css, ui.js):**
    *   Quản lý DOM, lắng nghe sự kiện từ UI/Bàn phím, toggle các tab màn hình (Cơ bản, Khoa học, Công cụ).
    *   Validate dữ liệu nhập vào Solver (chỉ cho phép số thực) và cận Tích phân trước khi gửi lệnh tính.
2.  **Controller Layer (calculator.js):**
    *   Quản lý trạng thái máy tính (calculator state: `currentInput`, `expression`, `isError`, `pendingUnary`, v.v.).
    *   Chuyển tiếp yêu cầu tính toán sang Mock API và cập nhật lại giao diện.
3.  **Mock API Layer (api-mock.js):**
    *   Ghi đè `window.fetch` toàn cục, đóng vai trò như một Router trung gian đón nhận các request mạng giả lập (`/engine/calculate`, `/engine/calculate-unary`, `/auth/login`, `/history`) và trả về `Response` JSON.
4.  **Engine Layer (engine.js):**
    *   Thực hiện toàn bộ logic toán học. Được chia thành các module chức năng độc lập (Tokenizer, Shunting-yard Parser, RPN Evaluator, Solver, Definite Integral).
5.  **Service Layer (firebase-auth.js, sync.js):**
    *   Xác thực phiên làm việc của người dùng và quản lý lưu trữ, đồng bộ dữ liệu.

```
Mã nguồn /js
├── engine.js       (Lõi tính toán số học & đại số - Không phụ thuộc DOM)
├── ui.js           (Lớp giao diện điều khiển phần tử hiển thị)
├── api-mock.js     (Tầng trung gian đánh chặn window.fetch)
├── sync.js         (Đồng bộ hóa dữ liệu lịch sử)
└── ../auth/        (Quản lý Firebase Authentication)
```

### 5.2. Phân rã Module trong engine.js

*   **Tokenizer:** Duyệt chuỗi biểu thức và chia nhỏ thành mảng các Token (`NUMBER`, `VARIABLE`, `OPERATOR`, `FUNCTION`, `PARENTHESIS`).
*   **Parser (Shunting-yard):** Chuyển mảng Token từ dạng Trung tố (Infix) sang dạng Hậu tố (Reverse Polish Notation - RPN) sử dụng Operator Stack.
*   **Evaluator:** Sử dụng Value Stack tính toán kết quả từ mảng RPN. Hỗ trợ thay thế biến tự do `x` bằng một giá trị thực tế (sử dụng khi tính tích phân).
*   **Solver Module:** Giải các phương trình đại số ($ax+b=0$, $ax^2+bx+c=0$ hỗ trợ nghiệm phức, và hệ phương trình 2 ẩn qua Cramer).
*   **Calculus Module:** Triển khai tích phân Simpson's Rule trên mảng các điểm chia rời rạc, gọi lại Evaluator để tính giá trị hàm $f(x)$ tại từng điểm.

---

## Section 6: Non-Functional Architecture Aspects

### 6.1 Performance & UX Strategy
- **Giao diện phản hồi ngay lập tức:** Khi gõ biểu thức, các ký tự được lưu trữ và nối chuỗi ngay trên dòng biểu thức mà không thực thi tính toán trung gian, giúp giảm thiểu độ trễ giao diện.
- **Tránh nghẽn Main Thread:** Phép tính tích phân số có độ phức tạp $O(N)$ được cố định $N=1000$ khoảng chia giúp giải thuật chạy dưới $1ms$ trên các CPU hiện đại, không cần đưa vào Web Worker.

### 6.2 Offline-First Sync Strategy
- Tận dụng `api-mock.js` để lưu tạm các bản ghi lịch sử vào `localStorage` khi mất mạng (`navigator.onLine === false`).
- Khi phát hiện thiết bị online trở lại, hệ thống tự động đẩy các bản ghi trong hàng đợi local lên Firestore.

### 6.3 Security Constraints
- Triệt tiêu hoàn toàn rủi ro tiêm mã độc (XSS) bằng việc tự viết bộ Parser riêng. Chuỗi người dùng nhập vào không bao giờ được chuyển vào các hàm nguy hiểm như `eval()` hay `Function()`.
- Quy định Firestore Security Rules chỉ cho phép đọc/ghi dữ liệu lịch sử khi `request.auth.uid == resource.data.userId`.

---

## Section 7: Runtime View

### 7.1 Luồng tính toán biểu thức PEMDAS (F-012)

```mermaid
sequenceDiagram
    autonumber
    participant U as Người dùng
    participant UI as Giao diện UI (ui.js)
    participant C as Controller (calculator.js)
    participant M as Mock API (api-mock.js)
    participant E as Engine (engine.js)

    U->>UI: Bấm các nút số và toán tử (2 + 3 x 4)
    UI->>C: Bổ sung ký tự vào biểu thức đang nhập
    C->>UI: Cập nhật dòng hiển thị phía trên: "2 + 3 × 4"
    U->>UI: Nhấn phím "="
    UI->>C: Yêu cầu tính toán biểu thức
    C->>M: fetch("/engine/calculate", { body: { expression: "2 + 3 * 4" } })
    M->>E: evaluateExpression("2 + 3 * 4")
    Note over E: Tokenize -> Shunting-yard -> Evaluate RPN
    E-->>M: Trả về kết quả: 14
    M-->>C: Response (200 OK): { result: "14" }
    C->>UI: Hiển thị 14 ở dòng dưới
```

### 7.2 Luồng giải phương trình Solver (F-014)

```mermaid
sequenceDiagram
    autonumber
    participant U as Người dùng
    participant UI as Tab Giải PT (ui.js)
    participant C as Controller (calculator.js)
    participant M as Mock API (api-mock.js)
    participant E as Engine (engine.js)
    participant Sync as Sync Service (sync.js)

    U->>UI: Nhập hệ số a=1, b=-3, c=2 (bậc hai) và bấm Giải
    UI->>C: Gọi hàm solveEquation([1, -3, 2], "quadratic")
    C->>M: fetch("/engine/solve", { body: { coefficients: [1, -3, 2], type: "quadratic" } })
    M->>E: solveQuadratic(1, -3, 2)
    E-->>M: Trả về kết quả: { roots: [2, 1] }
    M-->>C: Response (200 OK): { roots: [2, 1] }
    C->>UI: Hiển thị kết quả "x1 = 2, x2 = 1"
    C->>M: fetch("/history", { body: { expression: "Giải PT: x² - 3x + 2 = 0", result: "x₁=2, x₂=1" } })
    M->>Sync: saveHistoryEntry(...)
    Sync->>Sync: Ghi Local Storage / Firestore
```

### 7.3 Luồng tính toán Tích phân xác định (F-015)

```mermaid
sequenceDiagram
    autonumber
    participant U as Người dùng
    participant UI as Tab Tích Phân (ui.js)
    participant C as Controller (calculator.js)
    participant M as Mock API (api-mock.js)
    participant E as Engine (engine.js)
    participant Sync as Sync Service (sync.js)

    U->>UI: Nhập f(x) = "x^2", cận a=0, b=1 và bấm Tính
    UI->>C: Gọi hàm calculateIntegral("x^2", 0, 1)
    C->>M: fetch("/engine/calculate-unary", { body: { value: "x^2", functionName: "integral", angleUnit: "DEG", lowerLimit: 0, upperLimit: 1 } })
    M->>E: integrateSimpson("x^2", 0, 1)
    loop Simpson's Rule (N=1000)
        E->>E: evaluate RPN of "x^2" với x = xi
    end
    E-->>M: Trả về kết quả: 0.3333333333
    M-->>C: Response (200 OK): { result: "0.3333333333" }
    C->>UI: Hiển thị kết quả "0.3333333333" lên màn hình chính
    C->>M: fetch("/history", { body: { expression: "∫(x², 0, 1)", result: "0.3333333333" } })
    M->>Sync: saveHistoryEntry(...)
    Sync->>Sync: Ghi Local Storage / Firestore
```

---

## Section 8: Deployment View

Do ứng dụng Simple Calculator v2.1.0 tuân thủ kiến trúc **Zero Build Step / Static App**, mô hình triển khai cực kỳ tinh giản:

- **Local Development:** Chỉ cần một HTTP server tĩnh siêu nhẹ chạy bằng Python hoặc Node.js để chạy được giao diện và định tuyến fetch mock (ví dụ: `python3 -m http.server 3000`).
- **Production Deployment:** Triển khai trực tiếp toàn bộ thư mục dự án lên các dịch vụ lưu trữ tĩnh (như GitHub Pages, Vercel, Netlify hoặc Firebase Hosting) dưới dạng các file HTML, CSS và JS tĩnh.
- **Firebase SDK Delivery:** Các thư viện Firebase Authentication và Firestore được nhúng trực tiếp qua thẻ script CDN từ máy chủ Google, không đóng gói cục bộ.

---

## C4 Model Diagrams

### Level 1: System Context Diagram

```mermaid
C4Context
    title System Context diagram for Simple Calculator Web App
    
    Person(user, "Người dùng", "Thực hiện tính toán và giải toán nâng cao")
    System(calc_app, "Simple Calculator Web App", "Giao diện máy tính và các bộ công cụ giải toán")
    SystemDb_Ext(local_storage, "Local Storage", "Lưu lịch sử offline và cấu hình theme")
    SystemDb_Ext(firestore, "Cloud Firestore", "Lưu trữ lịch sử đồng bộ hóa trực tuyến")
    System_Ext(firebase_auth, "Firebase Auth", "Xác thực tài khoản người dùng")

    Rel(user, calc_app, "Nhập dữ liệu và xem kết quả", "UI/Keyboard")
    Rel(calc_app, local_storage, "Đọc/Ghi dữ liệu", "HTML5 Storage API")
    Rel(calc_app, firebase_auth, "Gửi yêu cầu đăng nhập", "HTTPS/REST")
    Rel(calc_app, firestore, "Đồng bộ hóa dữ liệu", "HTTPS/gRPC")
```

### Level 2: Container Diagram

```mermaid
C4Container
    title Container diagram for Simple Calculator Web App
    
    Container(ui_view, "UI View", "HTML, CSS, ui.js", "Hiển thị giao diện người dùng và nhận sự kiện")
    Container(controller, "Controller", "calculator.js", "Quản lý trạng thái và điều phối logic")
    Container(mock_api, "Mock API Router", "api-mock.js", "Đánh chặn fetch và định tuyến")
    Container(math_engine, "Math Engine", "engine.js", "Thực hiện tính toán biểu thức, giải phương trình và tích phân")
    Container(sync_service, "Sync Service", "sync.js", "Quản lý hàng đợi lịch sử và đồng bộ")
    
    SystemDb_Ext(local_storage, "Local Storage", "Lưu lịch sử offline và cấu hình")
    SystemDb_Ext(firestore, "Cloud Firestore", "Đồng bộ hóa trực tuyến")
    System_Ext(firebase_auth, "Firebase Auth", "Xác thực tài khoản")

    Rel(ui_view, controller, "Gửi sự kiện bấm phím / submit form", "JS Calls")
    Rel(controller, mock_api, "Gửi yêu cầu tính toán / sync", "fetch API")
    Rel(mock_api, math_engine, "Gọi hàm logic số học", "JS Modules")
    Rel(mock_api, sync_service, "Yêu cầu lưu lịch sử", "JS Modules")
    Rel(controller, ui_view, "Cập nhật hiển thị giao diện", "DOM API")
    Rel(sync_service, local_storage, "Đọc/Ghi dữ liệu", "HTML5 Storage API")
    Rel(sync_service, firestore, "Đồng bộ hóa dữ liệu", "HTTPS/gRPC")
    Rel(mock_api, firebase_auth, "Gửi request xác thực mock", "HTTPS/REST")
```

### Level 3: Component Diagram (Focus: Math Engine)

```mermaid
C4Component
    title Component diagram for Math Engine (engine.js)

    Component(tokenizer, "Tokenizer", "Lexer", "Quét và phân loại ký tự biểu thức thành Token")
    Component(parser, "Shunting-Yard Parser", "Parser", "Chuyển đổi biểu thức trung tố thành RPN")
    Component(evaluator, "RPN Evaluator", "Evaluator", "Tính toán giá trị từ RPN, hỗ trợ thế biến x")
    Component(solver, "Equation Solver", "Solver Component", "Tính toán nghiệm phương trình bậc 1, bậc 2, hệ 2 ẩn")
    Component(calculus, "Simpson's Integral Engine", "Integral Component", "Tính tổng tích phân số")

    Rel(parser, tokenizer, "Yêu cầu mảng Token")
    Rel(evaluator, parser, "Đọc dữ liệu mảng RPN")
    Rel(calculus, evaluator, "Gọi Evaluator tính f(xi) tại từng điểm chia")
```

---

END OF DOCUMENT
