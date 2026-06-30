# NHẬT KÝ THAY ĐỔI DỰ ÁN (CHANGELOG)
## SIMPLE CALCULATOR WEB APP (Từ v1.0.0 đến v2.1.2)

Tài liệu này tổng hợp toàn bộ các thay đổi, chỉnh sửa và nâng cấp kỹ thuật của dự án **Simple Calculator Web App** được phân loại chi tiết theo từng cấu phần tài liệu đặc tả thiết kế và tập tin sản phẩm, qua các phiên bản từ v1.0.0 đến v2.1.2.

---

## 1. TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD)

Dưới đây là tiến trình thay đổi của tài liệu **Business Requirements Document (BRD)** qua các phiên bản:

### 1.1. Phiên bản 1.0.0 (Release: 2026-05-28)
*Phiên bản máy tính cơ bản đầu tiên theo mô hình Spec-Driven Development.*
- **Tính năng cơ bản:** Hỗ trợ 4 phép toán nhị phân cộng (`+`), trừ (`−`), nhân (`×`), và chia (`÷`).
- **Giới hạn nhập liệu (BR-04):** Cho phép nhập tối đa 15 chữ số thực. Chữ số thứ 16 trở đi bị bỏ qua.
- **Xử lý lỗi chia cho 0 (BR-05):** Khi chia cho 0, hiển thị thông điệp `"Không thể chia cho 0"`, kích hoạt trạng thái Lỗi (Error State) và khóa toàn bộ bàn phím cho đến khi người dùng nhấn phím `AC`.
- **Làm tròn số thập phân (BR-06):** Kết quả phép toán được làm tròn tối đa 10 chữ số thập phân và triệt tiêu sai số dấu phẩy động nổi.
- **Phím AC (BR-07):** Phím xóa toàn bộ (`AC`) là cách duy nhất để xóa màn hình và khôi phục trạng thái máy tính từ trạng thái lỗi.

### 1.2. Phiên bản 2.0.0 (Release: 2026-06-08)
*Nâng cấp lớn: Scientific Mode, Dark/Light Mode, Firebase Auth và đồng bộ đám mây Cloud History Sync.*
- **Gộp nhóm tính năng số học cơ bản:** Tổng hợp 12 tính năng nhỏ từ v1.0.0 (bao gồm các phép tính cộng, trừ, nhân, chia riêng biệt) thành 5 nhóm lớn để tài liệu súc tích, trong đó 4 phép tính nhị phân được gộp chung thành một tính năng duy nhất `F-001 Các phép tính số học cơ bản`.
- **Scientific Mode:** Bổ sung các phép tính một toán hạng (sin, cos, tan, asin, acos, atan, ln, log, sqrt, cbrt, bình phương `x²`, lập phương `x³`, giai thừa `x!`, trị tuyệt đối `|x|`, phần trăm `%`).
- **Hằng số toán học:** Thêm phím nóng chèn nhanh hằng số `π` (Pi) và `e`.
- **Dấu ngoặc đơn:** Hỗ trợ phím ngoặc mở `(` và ngoặc đóng `)` để kiểm soát độ ưu tiên phép tính.
- **Thay đổi quy tắc Unary (BR-10 & BR-11):** Bắt buộc phải nhấn `=` để tính toán hàm 1 toán hạng (sin, cos, ln, giai thừa, v.v.), giúp người dùng nhập cả biểu thức liền mạch trước khi tính.
- **Theme Tối/Sáng:** Thiết kế giao diện kính mờ (Glassmorphic) hỗ trợ Theme Tối (Deep Space Dark) và Theme Sáng (Soft Cream Light). Tự lưu cấu hình vào Local Storage.
- **Đồng bộ Lịch sử tính toán:** 
  - Lưu 50 kết quả gần nhất tại Local Storage (`localStorage`).
  - Khi đăng nhập, tự động đồng bộ lên Firebase Cloud Firestore (lưu trữ tối đa 200 bản ghi).
  - Hỗ trợ chế độ ngoại tuyến (Offline-First Sync Queue) tự động xếp hàng đợi đồng bộ khi mất mạng và đẩy lên đám mây khi kết nối mạng trở lại.

### 1.3. Phiên bản 2.1.0 (Release: 2026-06-15)
*Nâng cấp lõi: PEMDAS Parser, Tab Giải phương trình (Solver) và Tab Tích phân Simpson.*
- **Parser biểu thức PEMDAS (F-012):** Cho phép nhập chuỗi biểu thức phức hợp chứa nhiều ngoặc đơn, toán tử lồng nhau và tự động ưu tiên tính theo quy tắc PEMDAS (Ngoặc -> Hàm -> Lũy thừa -> Nhân/Chia -> Cộng/Trừ) khi nhấn phím `=`.
- **Tab Solver (Giải phương trình - F-014):** 
  - Giải phương trình bậc nhất $ax + b = 0$.
  - Giải phương trình bậc hai $ax^2 + bx + c = 0$ (Hỗ trợ nghiệm thực và nghiệm phức dạng $u \pm vi$).
  - Giải hệ 2 phương trình bậc nhất 2 ẩn.
- **Tab Definite Integral (Tích phân xác định - F-015):** Tính toán tích phân số của hàm $f(x)$ bất kỳ trên đoạn cận từ $a$ đến $b$ bằng phương pháp Simpson's Rule với 1000 khoảng chia.

### 1.4. Phiên bản 2.1.1 (Release: 2026-06-18)
*Nâng cấp nâng cao: Thanh chỉ báo trạng thái, Đạo hàm & Tích phân đệ quy trực tiếp.*
- **Thanh chỉ báo trạng thái (F-017):** Tích hợp thanh trạng thái nằm sát trên display gồm:
  - `S` (đang chờ toán hạng cho phép toán Unary).
  - `A` (phím Shift hoạt động - dự phòng tương lai).
  - `Math` (luôn sáng biểu thị chế độ biểu diễn toán học).
  - `D` / `R` (sáng tương ứng với chế độ góc DEG/RAD hiện hành).
  - `▲` / `▼` (sáng nếu lịch sử cục bộ hoặc lịch sử đám mây có từ 1 bản ghi trở lên).
- **Tích phân & Đạo hàm trực tiếp (F-018):**
  - Đưa phép toán đạo hàm số học `d/dx(f(x), x_0)` vào dòng nhập liệu chính. Đạo hàm được tính qua công thức sai phân trung tâm với bước dịch chuyển $h = 10^{-5}$.
  - Đưa phép tính tích phân `∫(f(x), a, b)` trực tiếp lên màn hình PEMDAS chính.
- **Tính toán giải tích đệ quy:** Cho phép viết các biểu thức giải tích lồng nhau (ví dụ: đạo hàm của một tích phân). Giới hạn tối đa **3 cấp đệ quy** để tránh treo CPU trình duyệt.

### 1.5. Phiên bản 2.1.2 (Release: 2026-06-25)
*Nâng cấp hiện hành: Phím nhập ẩn x, Bộ giải tìm x (Newton-Raphson Solver), Phím phân số trực quan `■/□` và hiển thị định dạng toán học 2D.*
- **Phím ẩn biến `x` (F-019):** Thêm nút ảo `x` chuyên dụng trên Scientific Keypad. Hỗ trợ nhập phím cứng `x`/`X` từ bàn phím vật lý.
- **General Numerical Solver (Tìm x - F-020):** Người dùng có thể viết một phương trình chứa biến tự do `x` (ví dụ: `x^2 - 9 = 0` hoặc chỉ gõ `x^2 - 9` biểu thị phương trình bằng 0) trực tiếp từ màn hình PEMDAS chính. Khi nhấn `=`, máy tính sẽ tự động chạy bộ giải tìm nghiệm số học thực xấp xỉ sử dụng phương pháp lặp **Newton-Raphson** đa điểm khởi trị thực.
- **Phím phân số trực quan `■/□` (F-021):** Thêm phím phân số đứng chèn cấu trúc `(⬚)/(⬚)` vào màn hình. 
  - Con trỏ ảo tự động nhảy vào ô vuông nét đứt ở tử số.
  - Người dùng có thể click hoặc chạm trực tiếp vào ô vuông tử/mẫu trên màn hình để đặt con trỏ nhập số.
  - Gõ ký tự đầu tiên sẽ thay thế ô vuông `⬚` tương ứng.

---

## 2. ĐẶC TẢ CHỨC NĂNG (FSD)

Dưới đây là tiến trình thay đổi của tài liệu **Functional Specification (FSD)** qua các phiên bản:

### 2.1. Phiên bản 1.0.0 (Release: 2026-05-28)
- **Cơ chế hoạt động:** Eager-evaluation đơn giản. Nhập toán hạng thứ nhất, nhấn toán tử nhị phân, nhập toán hạng thứ hai và nhấn phím `=` để tính toán trực tiếp.
- **Sự kiện giao diện (Event Handlers):** Định nghĩa các hàm điều hướng trạng thái cơ bản:
  - `handleDigit(digit)`: Thêm chữ số.
  - `handleDecimalPoint()`: Chèn dấu thập phân `.`.
  - `handleOperator(op)`: Lưu toán tử và chuẩn bị toán hạng tiếp theo.
  - `handleEquals()`: Thực thi phép tính.
  - `handleAllClear()`: Reset toàn bộ máy tính.

### 2.2. Phiên bản 2.0.0 (Release: 2026-06-08)
- **Tầng định tuyến REST API giả lập Client-side (`js/api-mock.js`):** Chặn cuộc gọi mạng `window.fetch` toàn cục để chuyển hướng xuống Service Layer local, cho phép máy tính chạy không cần cài đặt Node.js backend.
- **API endpoints mới:**
  - `POST /auth/register`: Đăng ký tài khoản.
  - `POST /auth/login`: Đăng nhập tài khoản.
  - `POST /auth/logout`: Đăng xuất.
  - `GET /history`: Lấy danh sách lịch sử.
  - `POST /history`: Lưu kết quả tính toán.
  - `DELETE /history`: Xóa sạch lịch sử.
- **Nhập liệu bàn phím vật lý:** Ánh xạ các phím cứng (0-9, `.`, `+`, `-`, `*`, `/`, `Enter`, `Backspace`, `Escape`) tương ứng với phím ảo trên UI.

### 2.3. Phiên bản 2.1.0 (Release: 2026-06-15)
- **Lõi Parser toán học:**
  - `tokenize(expr)`: Phân tách chuỗi biểu thức thành danh sách token (số, biến, toán tử, hàm).
  - `shuntingYard(tokens)`: Chuyển đổi từ định dạng trung tố (Infix) sang hậu tố (Reverse Polish Notation - RPN) sử dụng stack.
  - `evaluateRPN(rpn, xValue)`: Lượng giá stack RPN, hỗ trợ truyền giá trị ẩn $x$ phục vụ tính giải tích.
- **Giao diện hiển thị hai dòng:** Dòng trên hiển thị biểu thức PEMDAS đầy đủ kèm nút cuộn màn hình. Dòng dưới hiển thị số đang nhập hoặc kết quả cuối cùng.

### 2.4. Phiên bản 2.1.1 (Release: 2026-06-18)
- **Tokenizer dấu phẩy `,`:** Cho phép nhận diện dấu phẩy làm phân cách đối số trong hàm giải tích (ví dụ `d/dx` nhận 2 đối số, `∫` nhận 3 đối số).
- **Evaluator đệ quy:** Khi gặp token giải tích, trích xuất mảng RPN của hàm con $f(x)$ và gọi đệ quy Evaluator lượng giá tại các điểm chia (Simpson) hoặc điểm sai phân.

### 2.5. Phiên bản 2.1.2 (Release: 2026-06-25)
- **Math Layout Renderer (F-017 bổ sung):** Thiết kế bộ định dạng hiển thị toán học 2D trong `js/ui.js` (`DisplayParser`, `tokenizeDisplay`, `renderASTToHTML`):
  - Hiển thị phép chia `/` dạng phân số đứng tử/mẫu trực quan.
  - Hiển thị số mũ `^` dạng superscript (`<sup>`).
  - Hiển thị ký hiệu tích phân `∫` đi kèm 2 cận đứng.
- **Newton-Raphson Solver:** 
  - Khởi tạo lặp từ 5 điểm khởi đầu thực: `[1.0, 0.0, -1.0, 10.0, -10.0]`.
  - Tối đa 100 vòng lặp cho mỗi điểm xuất phát. Ngưỡng sai số tuyệt đối xác nhận hội tụ thành công là $< 10^{-7}$.
  - Trả về kết quả dưới dạng `x = [nghiệm]`.

---

## 3. THIẾT KẾ KIẾN TRÚC (SAD)

Dưới đây là tiến trình thay đổi của tài liệu **System Architecture Document (SAD)** qua các phiên bản:

### 3.1. Phiên bản 1.0.0 (Release: 2026-05-28)
- **Kiến trúc nguyên khối tĩnh (Static Monolithic):** Toàn bộ mã nguồn chạy trên Client dưới dạng ứng dụng một trang (SPA) gồm: `index.html`, `style.css`, `calculator.js`.
- **Không có bước build (Zero-build step):** Ứng dụng chạy trực tiếp bằng cách mở file HTML trên trình duyệt.

### 3.2. Phiên bản 2.0.0 (Release: 2026-06-08)
- **Cấu trúc phân tầng Service:** Tách controller (`calculator.js`) khỏi lõi tính toán và các tác vụ hệ thống:
  - `js/engine.js`: Xử lý phép tính cơ bản và khoa học.
  - `js/ui.js`: View Layer quản lý giao diện, modal, sidebar lịch sử và theme.
  - `js/sync.js`: Quản lý đồng bộ local/cloud lịch sử.
  - `auth/firebase-auth.js`: Kết nối dịch vụ Firebase Auth (Mocking / Real).
- **Thiết lập Unit Test Suite (`tests/unit/setup.js`):** Xây dựng môi trường JSDOM độc lập. Tự động tiền xử lý mã nguồn: loại bỏ import/export của ES Modules và biến các hàm `async/await` thành đồng bộ để Vitest có thể kiểm thử trực tiếp mà không cần cấu hình phức tạp.

### 3.3. Phiên bản 2.1.0 (Release: 2026-06-15)
- Bổ sung các cấu trúc giải thuật toán học vào `js/engine.js`: `solveEquation()`, `integrateSimpson()`.
- Chèn toán tử nhân ẩn (Implicit Multiplication): Bộ tokenizer tự động chèn toán tử `×` vào giữa các token liền kề (ví dụ: `2pi` -> `2 × pi`, `5(2+3)` -> `5 × (2+3)`).

### 3.4. Phiên bản 2.1.1 (Release: 2026-06-18)
- **Derivative & Integral Precision Budget (SAD §2):** Cố định số điểm chia tích phân số $N = 1000$ và sai phân đạo hàm $h = 10^{-5}$ để giữ thời gian tính toán giải tích lồng nhau luôn dưới **10ms**.
- **Ngăn ngừa tràn ngăn xếp:** Gắn thêm biến đếm độ sâu `envDepth` vào hàm lượng giá stack RPN. Nếu `envDepth >= 3`, dừng tính toán ngay lập tức và ném ra ngoại lệ `"Lỗi toán học"`.

### 3.5. Phiên bản 2.1.2 (Release: 2026-06-25)
- **Bảo toàn textContent:** Để tránh làm hỏng các bài kiểm thử tự động (Unit & E2E) vốn đọc thuộc tính `.textContent` của màn hình, các thẻ HTML 2D được thiết kế đặc biệt:
  - Các toán tử phân tách được ẩn đi bằng CSS `display: none`.
  - Cận tích phân được kết xuất thông qua các thuộc tính HTML `data-upper` và `data-lower` và dựng giao diện trực quan bằng CSS pseudo-elements `::before` và `::after` mà không tạo thêm nút Text Node trong cây DOM.
- **Quản lý con trỏ ảo:** Gắn thêm biến `cursorIndex` vào State Model của máy tính để theo dõi vị trí chèn ký tự.
- **Toán tử thông minh (Smart Operator):** Khi đang ở trong chế độ con trỏ của phân số, nếu con trỏ ở cuối phân số và người dùng nhấn phím toán tử nhị phân, hệ thống tự động thoát chế độ con trỏ để nối toán tử nhị phân ra sau phân số thay vì chèn vào trong mẫu số.
- **Loại bỏ rò rỉ bảo mật:** Loại bỏ hoàn toàn dòng gán biến `window.state = state;` trong production code, chỉ chèn động trong file `tests/integration/setup.js` phục vụ môi trường kiểm thử JSDOM.
- **Sửa lỗi toán tử Postfix (Postfix Operator Logic):** Khắc phục lỗi tự động chèn thêm số `0` khi nhấn các toán tử nhị phân ngay sau toán tử postfix (như bình phương `²`, lập phương `³`, giai thừa `!`, phần trăm `%`). Đã tối ưu hóa logic nhận diện ký tự kết thúc biểu thức trước đó bằng biểu thức chính quy (regex) để ngăn việc reset nhầm `currentInput` về `'0'`.
- **Tái cấu trúc hệ thống kiểm thử:** Phân tách rõ ràng giữa Unit Tests (chỉ kiểm thử thuật toán toán học của `engine.js` trong thư mục `tests/unit/`) và Integration Tests (kiểm thử tích hợp giao diện JSDOM phối hợp giữa DOM, `ui.js`, `calculator.js`, và `api-mock.js` trong thư mục `tests/integration/`). Di chuyển `setup.js` và `calculator.test.js` từ `tests/unit/` sang `tests/integration/`.

---

## 4. THIẾT KẾ CƠ SỞ DỮ LIỆU (DBD)

Dưới đây là tiến trình thay đổi của tài liệu **Database Design Document (DBD)** qua các phiên bản:

### 4.1. Phiên bản 1.0.0 (Release: 2026-05-28)
- Chưa có hệ thống lưu trữ dữ liệu hoặc lịch sử tính toán ở phiên bản này.

### 4.2. Phiên bản 2.0.0 (Release: 2026-06-08)
- **Local Storage Schema:**
  - `calc_theme`: `'light'` hoặc `'dark'`.
  - `calc_angle_unit`: `'DEG'` hoặc `'RAD'`.
  - `calc_local_history`: Mảng JSON chứa tối đa 50 phần tử lịch sử.
  - `calc_offline_queue`: Hàng đợi đồng bộ lịch sử offline.
- **Cloud Database (Firestore) Schema:**
  - Collection `history`: tài liệu chứa `id` (PK), `userId` (FK), `expression`, `result`, `status`, `timestamp`.

### 4.3. Phiên bản 2.1.0 (Release: 2026-06-15)
- Mở rộng cấu trúc cột `expression` và `result` trong Database để hỗ trợ lưu lịch sử phép tính Solver:
  - `expression`: `"Giải PT: x² - 3x + 2 = 0"` -> `result`: `"x₁=2, x₂=1"`.
  - `expression`: `"Giải hệ PT: {x+y=3, x-y=1}"` -> `result`: `"x = 2, y = 1"`.
  - `expression`: `"∫(x², 0, 1)"` -> `result`: `"0.3333333333"`.

### 4.4. Phiên bản 2.1.1 (Release: 2026-06-18)
- Hỗ trợ lưu trữ lịch sử các biểu thức giải tích lồng nhau và thương tích phân dưới dạng chuỗi PEMDAS phẳng vào database.

### 4.5. Phiên bản 2.1.2 (Release: 2026-06-25)
- Cập nhật định dạng lưu trữ phân số đứng dưới dạng chuỗi PEMDAS phẳng (`(5)/(3)`) và kết quả Solver Newton-Raphson dạng `x = [nghiệm]`.

---

## 5. TIẾN TRÌNH CÁC TẬP TIN SẢN PHẨM KHÁC (SOURCE CODE & TEST FILES)

Dưới đây là lịch sử biến đổi của các tập tin cốt lõi và các tập tin kiểm thử trong dự án qua các phiên bản:

| Tên Tập Tin | Vai trò & Sự Thay Đổi Qua Các Phiên Bản |
| :--- | :--- |
| **`index.html`** | - **v1.0.0:** Khởi tạo layout màn hình hiển thị 1 dòng và bàn phím cơ bản.<br>- **v2.0.0:** Thêm Scientific Keypad, Auth Modal, Sync Modal, nút Theme, Sidebar lịch sử.<br>- **v2.1.0:** Tách biệt layout hiển thị thành Expression dòng trên và Result dòng dưới.<br>- **v2.1.2:** Bổ sung nút nhập biến ảo `x` và nút phân số `■/□` (thay thế nút cbrt cũ). |
| **`style.css`** | - **v1.0.0:** Tạo stylesheet giao diện máy tính cơ bản.<br>- **v2.0.0:** Viết bộ CSS giao diện kính mờ (Glassmorphism), thiết lập bộ biến màu (Color Palette) cho Dark/Light mode.<br>- **v2.1.0:** Định dạng màn hình 2 dòng cuộn và Tab menu cho Solver/Integral.<br>- **v2.1.2:** Bổ sung style hiển thị toán học 2D (fraction, numerator, denominator, pow-op, math-placeholder, limits). Sửa lỗi cận tích phân bị ẩn bằng cách thêm định nghĩa CSS pseudo-elements `.limits::before` và `.limits::after` dùng `content: attr()`. |
| **`calculator.js`** | - **v1.0.0:** Controller quản lý state máy tính và sự kiện click DOM dạng sơ khai.<br>- **v2.0.0:** Tách logic tính toán ra engine.js, thêm lắng nghe phím cứng và tích hợp Firebase Auth, đồng bộ lịch sử.<br>- **v2.1.0:** Cập nhật để gửi toàn bộ chuỗi biểu thức PEMDAS dài tới engine tính toán.<br>- **v2.1.2:** Thêm biến `cursorIndex` vào model. Triển khai hàm `insertAtCursor(char)`, `handleFraction()` và `hasFreeVariableX()`. Loại bỏ rò rỉ `window.state = state;` ra global. Thêm logic Smart Operator tự động nhảy ra ngoài phân số. Sửa lỗi tự động chèn số `0` sau toán tử postfix. |
| **`js/engine.js`** | - **v2.0.0:** *(Mới)* Tách biệt lõi tính toán, hỗ trợ thêm các hàm lượng giác, logarit, trị tuyệt đối và giai thừa.<br>- **v2.1.0:** Viết bộ Tokenizer, Parser Shunting-Yard (trung tố sang hậu tố RPN) và bộ giải phương trình Solver phụ, tính tích phân Simpson.<br>- **v2.1.1:** Bổ sung tính năng đạo hàm sai phân số học và tính giải tích đệ quy tối đa 3 cấp.<br>- **v2.1.2:** Tích hợp bộ giải phương trình số học Tìm x (`solveForX`) chạy thuật toán Newton-Raphson đa điểm khởi đầu với ngưỡng sai số tuyệt đối $< 10^{-7}$. |
| **`js/ui.js`** | - **v2.0.0:** *(Mới)* Quản lý giao diện, hiển thị số, mở/đóng Modal, Sidebar, và chuyển đổi Theme.<br>- **v2.1.2:** Tích hợp bộ định dạng biểu thức toán học 2D (`DisplayParser`, `tokenizeDisplay`, `renderASTToHTML`, `formatExpressionToHTML`) để kết xuất HTML phân số đứng tử/mẫu, số mũ superscript và cận tích phân đệ quy. |
| **`js/api-mock.js`** | - **v2.0.0:** *(Mới)* Đánh chặn fetch API toàn cục phục vụ chạy offline-first không cần backend Node.js.<br>- **v2.1.0:** Thêm định tuyến cho `/engine/solve` và `/engine/calculate-unary` tích hợp tích phân.<br>- **v2.1.2:** Thêm định tuyến cho `/engine/solve-x` dẫn tới lõi giải phương trình số học Tìm x. |
| **`tests/integration/setup.js`** | - **v2.0.0:** *(Mới tại `tests/unit/setup.js`)* Đọc file HTML, làm sạch import/export/async/await để chạy test JSDOM đồng bộ.<br>- **v2.1.2:** Di chuyển sang thư mục `tests/integration/` nhằm phân tách rõ ràng và tích hợp tiêm động `window.state = state;` vào JSDOM phục vụ kiểm thử tích hợp. |
| **`tests/integration/calculator.test.js`** | - **v1.0.0:** *(Mới tại `tests/unit/calculator.test.js`)* Viết bộ test cơ bản cho cộng, trừ, nhân, chia.<br>- **v2.0.0:** Thêm các test khoa học, hằng số, DEG/RAD.<br>- **v2.1.2:** Di chuyển sang thư mục `tests/integration/`. Bổ sung các kịch bản test mới cho phân số trực quan đa chữ số (`TC-FR06`), thoát con trỏ thông minh khi bấm toán tử (`TC-FR07`), chèn toán tử ở giữa (`TC-FR08`). |
| **`tests/unit/engine.test.js`** | - **v2.0.0:** *(Mới)* Viết các test case đơn vị cho lõi tính toán `engine.js` (phép tính 2 toán hạng, lượng giác, giai thừa, hằng số).<br>- **v2.1.0:** Bổ sung kiểm thử đơn vị cho PEMDAS parser, hệ phương trình, tích phân Simpson.<br>- **v2.1.1:** Bổ sung kiểm thử đơn vị cho đạo hàm và tích phân đệ quy.<br>- **v2.1.2:** Bổ sung kiểm thử đơn vị cho bộ giải phương trình tìm x (`solveForX`) dùng Newton-Raphson. |
| **`tests/e2e/calculator.spec.js`** | - **v2.0.0:** *(Mới)* Viết 30 kịch bản kiểm thử E2E trên trình duyệt thực qua Playwright.<br>- **v2.1.0:** Bổ sung kịch bản kiểm thử E2E cho PEMDAS, Solver bậc 1, bậc 2, hệ phương trình, tích phân Simpson.<br>- **v2.1.1:** Bổ sung kịch bản kiểm thử E2E cho đạo hàm số học và tích phân đệ quy.<br>- **v2.1.2:** Bổ sung các kịch bản kiểm thử E2E cho phím phân số, phím ẩn `x` và bộ giải phương trình tìm x (`TC-E37` đến `TC-E40`). |
