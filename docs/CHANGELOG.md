# NHẬT KÝ THAY ĐỔI DỰ ÁN (CHANGELOG)
## SIMPLE CALCULATOR WEB APP (Từ v1.0.0 đến v2.1.2)

Tài liệu này tổng hợp toàn bộ các thay đổi, chỉnh sửa và nâng cấp kỹ thuật của dự án **Simple Calculator Web App** qua từng phiên bản, sắp xếp theo trình tự thời gian từ bản khởi đầu đến bản hiện hành.

---

## 1. PHIÊN BẢN 1.0.0 (Khởi tạo - Release: 2026-05-28)
*Phiên bản máy tính cơ bản đầu tiên theo mô hình Spec-Driven Development.*

### 1.1. Yêu cầu & Nghiệp vụ (BRD)
- **Tính năng cơ bản:** Hỗ trợ 4 phép toán nhị phân cộng (`+`), trừ (`−`), nhân (`×`), và chia (`÷`).
- **Giới hạn nhập liệu (BR-04):** Cho phép nhập tối đa 15 chữ số thực. Chữ số thứ 16 trở đi bị bỏ qua.
- **Xử lý lỗi chia cho 0 (BR-05):** Khi chia cho 0, hiển thị thông điệp `"Không thể chia cho 0"`, kích hoạt trạng thái Lỗi (Error State) và khóa toàn bộ bàn phím cho đến khi người dùng nhấn phím `AC`.
- **Làm tròn số thập phân (BR-06):** Kết quả phép toán được làm tròn tối đa 10 chữ số thập phân và triệt tiêu sai số dấu phẩy động nổi.
- **Phím AC (BR-07):** Phím xóa toàn bộ (`AC`) là cách duy nhất để xóa màn hình và khôi phục trạng thái máy tính từ trạng thái lỗi.

### 1.2. Đặc tả Chức năng (FSD)
- **Cơ chế hoạt động:** Eager-evaluation đơn giản. Nhập toán hạng thứ nhất, nhấn toán tử nhị phân, nhập toán hạng thứ hai và nhấn phím `=` để tính toán trực tiếp.
- **Sự kiện giao diện (Event Handlers):** Định nghĩa các hàm điều hướng trạng thái cơ bản:
  - `handleDigit(digit)`: Thêm chữ số.
  - `handleDecimalPoint()`: Chèn dấu thập phân `.`.
  - `handleOperator(op)`: Lưu toán tử và chuẩn bị toán hạng tiếp theo.
  - `handleEquals()`: Thực thi phép tính.
  - `handleAllClear()`: Reset toàn bộ máy tính.

### 1.3. Thiết kế Kiến trúc (SAD)
- **Kiến trúc nguyên khối tĩnh (Static Monolithic):** Toàn bộ mã nguồn chạy trên Client dưới dạng ứng dụng một trang (SPA) gồm:
  - `index.html`: Cấu trúc giao diện và layout phím bấm cơ bản.
  - `style.css`: Giao diện hiển thị máy tính.
  - `calculator.js`: Xử lý trực tiếp cả logic trạng thái và sự kiện DOM.
- **Không có bước build (Zero-build step):** Ứng dụng chạy trực tiếp bằng cách mở file HTML trên trình duyệt.

### 1.4. Thiết kế Cơ sở Dữ liệu (DBD)
- Chưa có hệ thống lưu trữ dữ liệu hoặc lịch sử tính toán ở phiên bản này.

---

## 2. PHIÊN BẢN 2.0.0 (Scientific & Cloud Sync - Release: 2026-06-08)
*Nâng cấp lớn: Scientific Mode, Dark/Light Mode, Firebase Auth và đồng bộ đám mây Cloud History Sync.*

### 2.1. Yêu cầu & Nghiệp vụ (BRD)
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

### 2.2. Đặc tả Chức năng (FSD)
- **Tầng định tuyến REST API giả lập Client-side (`js/api-mock.js`):** Chặn cuộc gọi mạng `window.fetch` toàn cục để chuyển hướng xuống Service Layer local, cho phép máy tính chạy không cần cài đặt Node.js backend.
- **API endpoints mới:**
  - `POST /auth/register`: Đăng ký tài khoản.
  - `POST /auth/login`: Đăng nhập tài khoản.
  - `POST /auth/logout`: Đăng xuất.
  - `GET /history`: Lấy danh sách lịch sử.
  - `POST /history`: Lưu kết quả tính toán.
  - `DELETE /history`: Xóa sạch lịch sử.
- **Nhập liệu bàn phím vật lý:** Ánh xạ các phím cứng (0-9, `.`, `+`, `-`, `*`, `/`, `Enter`, `Backspace`, `Escape`) tương ứng với phím ảo trên UI.

### 2.3. Thiết kế Kiến trúc (SAD)
- **Cấu trúc phân tầng Service:** Tách controller (`calculator.js`) khỏi lõi tính toán và các tác vụ hệ thống:
  - `js/engine.js`: Xử lý phép tính cơ bản và khoa học.
  - `js/ui.js`: View Layer quản lý giao diện, modal, sidebar lịch sử và theme.
  - `js/sync.js`: Quản lý đồng bộ local/cloud lịch sử.
  - `auth/firebase-auth.js`: Kết nối dịch vụ Firebase Auth (Mocking / Real).
- **Thiết lập Unit Test Suite (`tests/unit/setup.js`):** Xây dựng môi trường JSDOM độc lập. Tự động tiền xử lý mã nguồn: loại bỏ import/export của ES Modules và biến các hàm `async/await` thành đồng bộ để Vitest có thể kiểm thử trực tiếp mà không cần cấu hình phức tạp.

### 2.4. Thiết kế Cơ sở Dữ liệu (DBD)
- **Local Storage Schema:**
  - `calc_theme`: `'light'` hoặc `'dark'`.
  - `calc_angle_unit`: `'DEG'` hoặc `'RAD'`.
  - `calc_local_history`: Mảng JSON chứa tối đa 50 phần tử lịch sử.
  - `calc_offline_queue`: Hàng đợi đồng bộ lịch sử offline.
- **Cloud Database (Firestore) Schema:**
  - Collection `history`: tài liệu chứa `id` (PK), `userId` (FK), `expression`, `result`, `status`, `timestamp`.

---

## 3. PHIÊN BẢN 2.1.0 (PEMDAS Parser & Solver - Release: 2026-06-15)
*Nâng cấp lõi: PEMDAS Parser, Tab Giải phương trình (Solver) và Tab Tích phân Simpson.*

### 3.1. Yêu cầu & Nghiệp vụ (BRD)
- **Parser biểu thức PEMDAS (F-012):** Cho phép nhập chuỗi biểu thức phức hợp chứa nhiều ngoặc đơn, toán tử lồng nhau và tự động ưu tiên tính theo quy tắc PEMDAS (Ngoặc -> Hàm -> Lũy thừa -> Nhân/Chia -> Cộng/Trừ) khi nhấn phím `=`.
- **Tab Solver (Giải phương trình - F-014):** 
  - Giải phương trình bậc nhất $ax + b = 0$.
  - Giải phương trình bậc hai $ax^2 + bx + c = 0$ (Hỗ trợ nghiệm thực và nghiệm phức dạng $u \pm vi$).
  - Giải hệ 2 phương trình bậc nhất 2 ẩn.
- **Tab Definite Integral (Tích phân xác định - F-015):** Tính toán tích phân số của hàm $f(x)$ bất kỳ trên đoạn cận từ $a$ đến $b$ bằng phương pháp Simpson's Rule với 1000 khoảng chia.

### 3.2. Đặc tả Chức năng (FSD)
- **Lõi Parser toán học:**
  - `tokenize(expr)`: Phân tách chuỗi biểu thức thành danh sách token (số, biến, toán tử, hàm).
  - `shuntingYard(tokens)`: Chuyển đổi từ định dạng trung tố (Infix) sang hậu tố (Reverse Polish Notation - RPN) sử dụng stack.
  - `evaluateRPN(rpn, xValue)`: Lượng giá stack RPN, hỗ trợ truyền giá trị ẩn $x$ phục vụ tính giải tích.
- **Giao diện hiển thị hai dòng:** Dòng trên hiển thị biểu thức PEMDAS đầy đủ kèm nút cuộn màn hình. Dòng dưới hiển thị số đang nhập hoặc kết quả cuối cùng.

### 3.3. Thiết kế Kiến trúc (SAD)
- Bổ sung các cấu trúc giải thuật toán học vào `js/engine.js`: `solveEquation()`, `integrateSimpson()`.
- Chèn toán tử nhân ẩn (Implicit Multiplication): Bộ tokenizer tự động chèn toán tử `×` vào giữa các token liền kề (ví dụ: `2pi` -> `2 × pi`, `5(2+3)` -> `5 × (2+3)`).

### 3.4. Thiết kế Cơ sở Dữ liệu (DBD)
- Mở rộng cấu trúc cột `expression` và `result` trong Database để hỗ trợ lưu lịch sử phép tính Solver:
  - `expression`: `"Giải PT: x² - 3x + 2 = 0"` -> `result`: `"x₁=2, x₂=1"`.
  - `expression`: `"Giải hệ PT: {x+y=3, x-y=1}"` -> `result`: `"x = 2, y = 1"`.
  - `expression`: `"∫(x², 0, 1)"` -> `result`: `"0.3333333333"`.

---

## 4. PHIÊN BẢN 2.1.1 (Indicators & Advanced Calculus - Release: 2026-06-18)
*Nâng cấp nâng cao: Thanh chỉ báo trạng thái, Đạo hàm & Tích phân đệ quy trực tiếp.*

### 4.1. Yêu cầu & Nghiệp vụ (BRD)
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

### 4.2. Đặc tả Chức năng (FSD)
- **Tokenizer dấu phẩy `,`:** Cho phép nhận diện dấu phẩy làm phân cách đối số trong hàm giải tích (ví dụ `d/dx` nhận 2 đối số, `∫` nhận 3 đối số).
- **Evaluator đệ quy:** Khi gặp token giải tích, trích xuất mảng RPN của hàm con $f(x)$ và gọi đệ quy Evaluator lượng giá tại các điểm chia (Simpson) hoặc điểm sai phân.

### 4.3. Thiết kế Kiến trúc (SAD)
- **Derivative & Integral Precision Budget (SAD §2):** Cố định số điểm chia tích phân số $N = 1000$ và sai phân đạo hàm $h = 10^{-5}$ để giữ thời gian tính toán giải tích lồng nhau luôn dưới **10ms**.
- **Ngăn ngừa tràn ngăn xếp:** Gắn thêm biến đếm độ sâu `envDepth` vào hàm lượng giá stack RPN. Nếu `envDepth >= 3`, dừng tính toán ngay lập tức và ném ra ngoại lệ `"Lỗi toán học"`.

### 4.4. Thiết kế Cơ sở Dữ liệu (DBD)
- Hỗ trợ lưu trữ lịch sử các biểu thức giải tích lồng nhau và thương tích phân dưới dạng chuỗi PEMDAS phẳng vào database.

---

## 5. PHIÊN BẢN 2.1.2 (General Solver & Fractions - Release: 2026-06-19 -> 2026-06-22)
*Nâng cấp hiện hành: Phím nhập ẩn x, Bộ giải tìm x (Newton-Raphson Solver), Phím phân số trực quan `■/□` và hiển thị định dạng toán học 2D.*

### 5.1. Yêu cầu & Nghiệp vụ (BRD)
- **Phím ẩn biến `x` (F-019):** Thêm nút ảo `x` chuyên dụng trên Scientific Keypad (bằng cách thu hẹp chiều rộng nút `x!`). Hỗ trợ nhập phím cứng `x`/`X` từ bàn phím vật lý.
- **General Numerical Solver (Tìm x - F-020):** Người dùng có thể viết một phương trình chứa biến tự do `x` (ví dụ: `x^2 - 9 = 0` hoặc chỉ gõ `x^2 - 9` biểu thị phương trình bằng 0) trực tiếp từ màn hình PEMDAS chính. Khi nhấn `=`, máy tính sẽ tự động chạy bộ giải tìm nghiệm số học thực xấp xỉ sử dụng phương pháp lặp **Newton-Raphson** đa điểm khởi trị thực.
- **Phím phân số trực quan `■/□` (F-021):** Thêm phím phân số đứng chèn cấu trúc `(⬚)/(⬚)` vào màn hình. 
  - Con trỏ ảo tự động nhảy vào ô vuông nét đứt ở tử số.
  - Người dùng có thể click hoặc chạm trực tiếp vào ô vuông tử/mẫu trên màn hình để đặt con trỏ nhập số.
  - Gõ ký tự đầu tiên sẽ thay thế ô vuông `⬚` tương ứng.

### 5.2. Đặc tả Chức năng (FSD)
- **Math Layout Renderer (F-017 bổ sung):** Thiết kế bộ định dạng hiển thị toán học 2D trong `js/ui.js` (`DisplayParser`, `tokenizeDisplay`, `renderASTToHTML`):
  - Hiển thị phép chia `/` dạng phân số đứng tử/mẫu trực quan.
  - Hiển thị số mũ `^` dạng superscript (`<sup>`).
  - Hiển thị ký hiệu tích phân `∫` đi kèm 2 cận đứng.
- **Newton-Raphson Solver:** 
  - Khởi tạo lặp từ 5 điểm khởi đầu thực: `[1.0, 0.0, -1.0, 10.0, -10.0]`.
  - Tối đa 100 vòng lặp cho mỗi điểm xuất phát. Ngưỡng sai số tuyệt đối xác nhận hội tụ thành công là $< 10^{-7}$.
  - Trả về kết quả dưới dạng `x = [nghiệm]`.

### 5.3. Thiết kế Kiến trúc (SAD)
- **Bảo toàn textContent:** Để tránh làm hỏng các bài kiểm thử tự động (Unit & E2E) vốn đọc thuộc tính `.textContent` của màn hình, các thẻ HTML 2D được thiết kế đặc biệt:
  - Các toán tử phân tách được ẩn đi bằng CSS `display: none`.
  - Cận tích phân được kết xuất thông qua các thuộc tính HTML `data-upper` và `data-lower` và dựng giao diện trực quan bằng CSS pseudo-elements `::before` và `::after` mà không tạo thêm nút Text Node trong cây DOM.
- **Quản lý con trỏ ảo:** Gắn thêm biến `cursorIndex` vào State Model của máy tính để theo dõi vị trí chèn ký tự.
- **Toán tử thông minh (Smart Operator):** Khi đang ở trong chế độ con trỏ của phân số, nếu con trỏ ở cuối phân số và người dùng nhấn phím toán tử nhị phân, hệ thống tự động thoát chế độ con trỏ để nối toán tử nhị phân ra sau phân số thay vì chèn vào trong mẫu số.
- **Loại bỏ rò rỉ bảo mật:** Loại bỏ hoàn toàn dòng gán biến `window.state = state;` trong production code, chỉ chèn động trong file `tests/unit/setup.js` phục vụ môi trường kiểm thử JSDOM.

### 5.4. Thiết kế Cơ sở Dữ liệu (DBD)
- Trường `expression` lưu trữ phân số đứng dưới dạng chuỗi phẳng ngăn cách bởi dấu chia (ví dụ: `(5)/(3)`). Nếu biểu thức dở dang chứa placeholder `⬚` (ví dụ `(⬚)/(⬚)`), lưu chuỗi dở dang và ghi nhận trạng thái `'error'`, kết quả `'Lỗi cú pháp'`.
- Lưu trữ lịch sử tìm x với định dạng: `expression`: `x^2 - 9` -> `result`: `x = 3` (`status = 'success'`).

---

## 6. BẢNG TỔNG HỢP TIẾN TRÌNH THEO TẬP TIN SẢN PHẨM

Dưới đây là lịch sử biến đổi của các tập tin cốt lõi trong dự án qua các phiên bản:

| Tên Tập Tin | Vai trò & Sự Thay Đổi Qua Các Phiên Bản |
| :--- | :--- |
| **`index.html`** | - **v1.0.0:** Khởi tạo layout màn hình hiển thị 1 dòng và bàn phím cơ bản.<br>- **v2.0.0:** Thêm Scientific Keypad, Auth Modal, Sync Modal, nút Theme, Sidebar lịch sử.<br>- **v2.1.0:** Tách biệt layout hiển thị thành Expression dòng trên và Result dòng dưới.<br>- **v2.1.2:** Bổ sung nút nhập biến ảo `x` và nút phân số `■/□` (thay thế nút cbrt cũ). |
| **`style.css`** | - **v1.0.0:** Tạo stylesheet giao diện máy tính cơ bản.<br>- **v2.0.0:** Viết bộ CSS giao diện kính mờ (Glassmorphism), thiết lập bộ biến màu (Color Palette) cho Dark/Light mode.<br>- **v2.1.0:** Định dạng màn hình 2 dòng cuộn và Tab menu cho Solver/Integral.<br>- **v2.1.2:** Bổ sung style hiển thị toán học 2D (fraction, numerator, denominator, pow-op, math-placeholder, limits). Sửa lỗi cận tích phân bị ẩn bằng cách thêm định nghĩa CSS pseudo-elements `.limits::before` và `.limits::after` dùng `content: attr()`. |
| **`calculator.js`** | - **v1.0.0:** Controller quản lý state máy tính và sự kiện click DOM dạng sơ khai.<br>- **v2.0.0:** Tách logic tính toán ra engine.js, thêm lắng nghe phím cứng và tích hợp Firebase Auth, đồng bộ lịch sử.<br>- **v2.1.0:** Cập nhật để gửi toàn bộ chuỗi biểu thức PEMDAS dài tới engine tính toán.<br>- **v2.1.2:** Thêm biến `cursorIndex` vào model. Triển khai hàm `insertAtCursor(char)`, `handleFraction()` và `hasFreeVariableX()`. Loại bỏ rò rỉ `window.state = state;` ra global. Thêm logic Smart Operator tự động nhảy ra ngoài phân số. |
| **`js/engine.js`** | - **v2.0.0:** *(Mới)* Tách biệt lõi tính toán, hỗ trợ thêm các hàm lượng giác, logarit, trị tuyệt đối và giai thừa.<br>- **v2.1.0:** Viết bộ Tokenizer, Parser Shunting-Yard (trung tố sang hậu tố RPN) và bộ giải phương trình Solver phụ, tính tích phân Simpson.<br>- **v2.1.1:** Bổ sung tính năng đạo hàm sai phân số học và tính giải tích đệ quy tối đa 3 cấp.<br>- **v2.1.2:** Tích hợp bộ giải phương trình số học Tìm x (`solveForX`) chạy thuật toán Newton-Raphson đa điểm khởi đầu với ngưỡng sai số tuyệt đối $< 10^{-7}$. |
| **`js/ui.js`** | - **v2.0.0:** *(Mới)* Quản lý giao diện, hiển thị số, mở/đóng Modal, Sidebar, và chuyển đổi Theme.<br>- **v2.1.2:** Tích hợp bộ định dạng biểu thức toán học 2D (`DisplayParser`, `tokenizeDisplay`, `renderASTToHTML`, `formatExpressionToHTML`) để kết xuất HTML phân số đứng tử/mẫu, số mũ superscript và cận tích phân đệ quy. |
| **`js/api-mock.js`** | - **v2.0.0:** *(Mới)* Đánh chặn fetch API toàn cục phục vụ chạy offline-first không cần backend Node.js.<br>- **v2.1.0:** Thêm định tuyến cho `/engine/solve` và `/engine/calculate-unary` tích hợp tích phân.<br>- **v2.1.2:** Thêm định tuyến cho `/engine/solve-x` dẫn tới lõi giải phương trình số học Tìm x. |
| **`tests/unit/setup.js`** | - **v2.0.0:** *(Mới)* Đọc file HTML, làm sạch import/export/async/await của ES Modules để chạy test JSDOM đồng bộ.<br>- **v2.1.2:** Tích hợp tiêm động `window.state = state;` vào môi trường JSDOM để kiểm thử đơn vị hoạt động trơn tru. |
| **`tests/unit/calculator.test.js`** | - **v1.0.0:** Viết bộ test cơ bản cho cộng, trừ, nhân, chia và chia cho 0.<br>- **v2.0.0:** Thêm các test khoa học, hằng số, DEG/RAD và xử lý lỗi miền xác định.<br>- **v2.1.2:** Bổ sung các kịch bản test mới cho phân số trực quan đa chữ số (`TC-FR06`), thoát con trỏ thông minh khi bấm toán tử (`TC-FR07`), chèn toán tử ở giữa (`TC-FR08`). |

---

## 7. TIẾN TRÌNH THAY ĐỔI CỦA CÁC TÀI LIỆU ĐẶC TẢ (BRD, FSD, SAD, DBD)

Dưới đây là lịch sử nâng cấp và tiến hóa nội dung của 4 tài liệu đặc tả thiết kế cốt lõi trong quy trình Spec-Driven Development:

### 7.1. BUSINESS REQUIREMENTS DOCUMENT (BRD)
- **v1.0.0:** Định nghĩa các yêu cầu nghiệp vụ tính toán nhị phân cơ bản (phép cộng, trừ, nhân, chia), giới hạn 15 chữ số và xử lý lỗi chia cho 0.
- **v2.0.0:** Tích hợp Scientific Mode (lượng giác, logarit, căn thức, luân chuyển DEG/RAD). Gộp nhóm 4 phép toán cơ bản rời rạc của v1.0.0 thành một tính năng `F-001`. Thêm các yêu cầu về Theme tối/sáng, Firebase Auth và Cloud History Sync (quy tắc đồng bộ BR-07, offline mode BR-08).
- **v2.1.0:** Bổ sung yêu cầu cho bộ phân tích biểu thức PEMDAS (F-012), Solver giải phương trình bậc 1, bậc 2, hệ 2 ẩn (F-014), và tích phân Simpson (F-015).
- **v2.1.1:** Thêm yêu cầu về thanh chỉ báo trạng thái (F-017), tích hợp Đạo hàm số học và Tích phân số trực tiếp vào dòng PEMDAS chính (F-018) cùng giới hạn đệ quy 3 cấp.
- **v2.1.2:** Bổ sung yêu cầu phím ẩn biến `x` (F-019), bộ giải phương trình tìm x Newton-Raphson Solver từ màn hình chính (F-020, cập nhật BR-14), và phím nhập phân số trực quan `■/□` (F-021, bổ sung BR-21).

### 7.2. FUNCTIONAL SPECIFICATION (FSD)
- **v1.0.0:** Đặc tả luồng xử lý và tham số cho 5 hàm sự kiện DOM cục bộ (`handleDigit`, `handleDecimalPoint`, `handleOperator`, `handleEquals`, `handleAllClear`).
- **v2.0.0:** Chuyển đổi sang đặc tả REST API endpoints thông qua bộ api-mock (Auth `/auth/...` và History `/history...`). Đặc tả chi tiết các trường hợp biên của tính toán Unary (sin, ln, giai thừa...). Bổ sung ánh xạ phím cứng (Keyboard mapping).
- **v2.1.0:** Đặc tả kỹ thuật giải thuật Tokenizer, Parser Shunting-Yard (trung tố sang RPN) và RPN Evaluator stack. Đặc tả APIs cho Solver (`/engine/solve`) và Tích phân Simpson (`/engine/calculate-unary` với functionName = 'integral').
- **v2.1.1:** Đặc tả việc thêm đối số dấu phẩy `,` ngăn cách để phân tích hàm giải tích nhiều đối số. Mô tả thuật toán đệ quy đạo hàm sai phân trung tâm và tích phân Simpson lồng nhau.
- **v2.1.2:** Đặc tả endpoint `/engine/solve-x` phục vụ Newton-Raphson. Đặc tả cơ chế Math Layout Renderer dịch PEMDAS sang mã HTML 2D hiển thị trực quan và quản lý con trỏ chèn `state.cursorIndex`.

### 7.3. SYSTEM ARCHITECTURE DOCUMENT (SAD)
- **v1.0.0:** Thiết kế kiến trúc SPA nguyên khối tĩnh (Static Monolithic) chạy trực tiếp trên trình duyệt, xử lý DOM và State trộn lẫn.
- **v2.0.0:** Thiết kế cấu trúc phân tầng ES Modules (View -> Controller -> Mock API -> Services/Engine). Thiết kế giải pháp Unit Test Environment dùng JSDOM tiền xử lý để chạy test Vitest đồng bộ.
- **v2.1.0:** Thiết kế lõi Math Engine tích hợp Parser RPN và các module giải toán/tích phân riêng biệt.
- **v2.1.1:** Bổ sung ràng buộc giải tích đệ quy tối đa 3 cấp (`envDepth <= 3`) để chống tràn ngăn xếp (Stack Overflow) và thiết kế cơ chế tự động co giãn font hiển thị.
- **v2.1.2:** Thiết kế cơ chế Math Layout Renderer bảo toàn thuộc tính `.textContent` trong cây DOM (ẩn toán tử và hiển thị cận tích phân qua CSS pseudo-elements `::before`/`::after` lấy giá trị từ `data-upper`/`data-lower`) nhằm duy trì tính tương thích ngược cho bộ kiểm thử tự động.

### 7.4. DATABASE DESIGN DOCUMENT (DBD)
- **v1.0.0:** Tài liệu chỉ mang tính chất giả lập SQLite học tập, không triển khai thực tế.
- **v2.0.0:** Thiết kế kiến trúc lưu trữ 2 tầng thực tế (Tier 1 Local Storage cache 50 bản ghi lịch sử, cấu hình theme/angle và hàng đợi offline; Tier 2 Firebase Firestore đồng bộ 200 bản ghi lịch sử). Thiết kế cấu trúc bảng `history`.
- **v2.1.0:** Ánh xạ các định dạng biểu thức và kết quả của Solver phụ và tích phân Simpson phụ vào các cột `expression` và `result` trong Database.
- **v2.1.1:** Cập nhật schema lưu trữ cho biểu thức giải tích lồng nhau và chỉ báo lịch sử.
- **v2.1.2:** Cập nhật định dạng lưu trữ phân số đứng dưới dạng chuỗi PEMDAS phẳng (`(5)/(3)`) và kết quả Solver Newton-Raphson dạng `x = [nghiệm]`.

