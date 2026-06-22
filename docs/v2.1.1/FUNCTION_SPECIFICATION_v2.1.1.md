# MODULE FUNCTIONAL SPECIFICATION - Simple Calculator Web App v2.1.1

| Thông tin | Chi tiết |
| :--- | :--- |
| **Dự án** | Simple Calculator Web App |
| **Module** | Core API & UI Display Services |
| **Phiên bản** | v2.1.1 |
| **Ngày cập nhật** | 2026-06-18 |
| **Trạng thái** | DRAFT |
| **Tác giả** | Nam (Product Owner & Developer) |

---

## REVISION HISTORY
| Phiên bản | Ngày | Người sửa | Mô tả |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-05-31 | Nam | Đặc tả các chức năng v1.0.0 dạng cũ (quá dài, trùng lặp nhiều phần) |
| 2.0.0 | 2026-06-09 | Nam | Tái cấu trúc hoàn toàn sang dạng Đặc tả API/SDK Services theo định dạng template chuẩn |
| 2.1.0 | 2026-06-16 | Nam | Nâng cấp các chức năng nâng cao: PEMDAS Parser (F-012), Solver (F-014) và Definite Integral (F-015) |
| 2.1.1 | 2026-06-18 | Nam | Nâng cấp v2.1.1: Tích hợp Đạo hàm/Tích phân đệ quy (F-018) và Đặc tả Giao diện Hiển thị Liền mạch & Thanh Chỉ báo (F-017) |

---

# MODULE 1: CALCULATOR ENGINE SERVICE

Cung cấp các API tính toán cốt lõi, bộ giải phương trình đại số và bộ tính tích phân xác định/đạo hàm cho ứng dụng máy tính.

---

## [FUNCTION] Phân tích và tính toán biểu thức PEMDAS (Tích hợp Giải tích)
Label: [Engine.evaluateExpression]

API: POST /engine/calculate

---

### [SECTION] Business Description
Nhận dạng chuỗi biểu thức toán học hoàn chỉnh do người dùng nhập từ giao diện, phân tích cú pháp (Tokenize & Parse) theo thứ tự ưu tiên các toán tử toán học (PEMDAS) để tính toán ra kết quả cuối cùng. Tự động lượng giá đệ quy các toán tử giải tích phức hợp (đạo hàm số, tích phân số lồng nhau) được tích hợp trực tiếp trong biểu thức.

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Biểu thức phải là chuỗi ký tự hợp lệ, không chứa các ký tự lạ ngoài số học, biến tự do `x`, toán tử, dấu phẩy `,`, hằng số và các hàm toán học hỗ trợ.
- Biến tự do `x` (không phân biệt hoa thường) chỉ được phép xuất hiện bên trong phạm vi các đối số của hàm giải tích `d/dx(f(x), x_0)` hoặc `∫(f(x), a, b)`.

---

### [SECTION] Main Flow
1. Tiếp nhận biểu thức toán học dạng chuỗi tại `/engine/calculate` với body chứa `"expression"`.
2. Kiểm tra tính hợp lệ của biến tự do `x` (BR-14):
   - Duyệt tìm tất cả vị trí xuất hiện của ký tự `'x'` hoặc `'X'`.
   - Xác định xem tất cả các vị trí này có nằm hoàn toàn bên trong cặp ngoặc đơn của hàm giải tích `d/dx(...)` hoặc `∫(...)` hay không.
   - Nếu phát hiện bất kỳ ký tự `'x'` tự do nào nằm ngoài phạm vi các toán tử giải tích trên, lập tức trả về mã lỗi `400 Bad Request` kèm thông điệp `"Lỗi cú pháp"`.
3. Gửi chuỗi biểu thức vào bộ **Tokenizer** để phân tách thành các token (`NUMBER`, `OPERATOR`, `FUNCTION`, `PARENTHESIS`, `COMMA` v.v.). Tokenizer nhận dạng dấu phẩy `,` để ngăn cách các đối số.
4. Gửi mảng token vào bộ **Parser** sử dụng thuật toán **Shunting-yard** để kiểm tra tính cân đối của dấu ngoặc đơn và xây dựng mảng Hậu tố (RPN).
   - Kiểm tra số lượng đối số truyền vào các hàm giải tích: `d/dx` phải có đúng 2 đối số, `∫` phải có đúng 3 đối số. Nếu không đúng, trả về mã lỗi `400 Bad Request` kèm `"Lỗi cú pháp"`.
5. Bộ **Evaluator** thực hiện lượng giá mảng RPN thông qua Value Stack:
   - Nếu gặp các hàm giải tích thường (sin, cos, ln, v.v.), áp dụng tính toán trực tiếp.
   - Nếu gặp token hàm giải tích `d/dx(f(x), x_0)`:
     - Trích xuất mảng RPN của biểu thức con $f(x)$ và giá trị điểm thế $x_0$.
     - Gọi đệ quy Evaluator lượng giá mảng RPN của $f(x)$ tại điểm $x = x_0 + 10^{-5}$ và $x = x_0 - 10^{-5}$.
     - Tính kết quả đạo hàm số theo công thức sai phân trung tâm (BR-20).
   - Nếu gặp token hàm giải tích `∫(f(x), a, b)`:
     - Trích xuất mảng RPN của biểu thức con $f(x)$, cận dưới $a$ và cận trên $b$.
     - Gọi đệ quy Evaluator lượng giá mảng RPN của $f(x)$ tại 1001 điểm chia từ $a$ đến $b$ để tính tổng tích phân số theo công thức Simpson's Rule.
   - **Xử lý lỗi toán học động:**
     - Nếu phát hiện phép chia cho 0 (`÷ 0`), trả về mã lỗi `400 Bad Request` kèm `"Không thể chia cho 0"`.
     - Nếu phát hiện miền xác định bị vi phạm (căn số âm, log số âm, v.v.) hoặc kết quả đệ quy trả về $NaN$/$Infinity$, trả về mã lỗi `400 Bad Request` kèm `"Lỗi toán học"`.
     - Nếu độ sâu đệ quy giải tích lồng nhau vượt quá **3 cấp**, dừng tính toán và trả về mã lỗi `400 Bad Request` kèm `"Lỗi toán học"` (ngăn ngừa tràn Stack).
6. Thực hiện định dạng kết quả:
   - Nếu kết quả $|value| \ge 10^{15}$ hoặc $|value| < 10^{-9}$ (ngoại trừ 0), định dạng theo số mũ khoa học (`toExponential(10)`).
   - Ngược lại, làm tròn tối đa 10 chữ số thập phân (`toFixed(10)`), triệt tiêu sai số nổi (`toPrecision(14)`).
7. Trả về kết quả JSON thành công `200 OK`.

---

### [SECTION] Business Rules
- **Quy tắc PEMDAS (BR-12):** Bắt buộc tuân thủ thứ tự ưu tiên dấu ngoặc, hàm giải tích, lũy thừa, nhân/chia, cộng/trừ.
- **Ràng buộc Giải tích đệ quy (BR-20):** Giới hạn đệ quy 3 cấp, áp dụng bước sai phân $h = 10^{-5}$ và tích phân Simpson $N = 1000$ khoảng chia.
- **Xử lý biến tự do x (BR-14):** Ký tự `x` chỉ hợp lệ bên trong hàm giải tích.

---

### [SECTION] Side Effects
- None

---

### [SECTION] Input

**Body (Giải tích phức hợp):**
```json
{
  "expression": "d/dx(x^2, 2) / d/dx(x^3, 2)"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "result": "0.3333333333"
}
```

---

### [SECTION] Error Codes
- 400 - Bad Request
  ```json
  {
    "status": "error",
    "message": "Lỗi toán học"
  }
  ```
  *(Hoặc `"Lỗi cú pháp"`, `"Không thể chia cho 0"`)*

---

## [FUNCTION] Tính toán một toán hạng khoa học
Label: [Engine.performUnaryCalculation]

API: POST /engine/calculate-unary

---

### [SECTION] Business Description
Tính toán các hàm toán học một toán hạng (sin, cos, √, ³√, x², x³, v.v.) ở chế độ nhập liệu khoa học cơ bản (kế thừa từ v2.1.0).

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Đầu vào phải biểu diễn số thực hợp lệ.

---

### [SECTION] Main Flow
1. Nhận yêu cầu tính toán tại `/engine/calculate-unary` với body chứa giá trị số thực, tên hàm và đơn vị góc.
2. Kiểm tra miền xác định của các hàm. Nếu vi phạm, trả lại mã `400 Bad Request` kèm `"Lỗi toán học"`.
3. Chuyển đổi góc: Đổi độ sang radian nếu là DEG đối với lượng giác, và ngược lại đối với lượng giác ngược.
4. Tính toán giá trị và thực hiện định dạng kết quả làm tròn tương tự PEMDAS.
5. Trả lại kết quả thành công `200 OK`.

---

### [SECTION] Business Rules
- **Đơn vị góc lượng giác (BR-10):** Trạng thái DEG/RAD quyết định hệ số đổi lượng giác.

---

### [SECTION] Input

**Body:**
```json
{
  "value": "9",
  "functionName": "sqrt",
  "angleUnit": "DEG"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "result": "3"
}
```

---

### [SECTION] Error Codes
- 400 - Bad Request
  ```json
  {
    "status": "error",
    "message": "Lỗi toán học"
  }
  ```

---

## [FUNCTION] Giải phương trình (Solver)
Label: [Engine.solveEquation]

API: POST /engine/solve

---

### [SECTION] Business Description
Giải phương trình bậc nhất, phương trình bậc hai (hỗ trợ hiển thị nghiệm phức) và hệ phương trình tuyến tính 2 ẩn số từ các hệ số do người dùng nhập trên form của Tab "Công cụ".

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Các hệ số đầu vào phải là số thực hợp lệ.

---

### [SECTION] Main Flow
1. Tiếp nhận danh sách hệ số và phân loại phương trình tại `/engine/solve` với body chứa mảng `"coefficients"` và `"type"`.
2. Kiểm tra loại phương trình:
   - **Bậc nhất (`"linear"`):** Giải phương trình $ax+b=0$.
     - Nếu $a \neq 0$, nghiệm $x = -b/a$.
     - Nếu $a == 0$: Nếu $b == 0$ trả về `"Vô số nghiệm"`, nếu $b \neq 0$ trả về `"Vô nghiệm"`.
   - **Bậc hai (`"quadratic"`):** Giải phương trình $ax^2+bx+c=0$.
     - Nếu $a == 0$, hạ cấp giải theo bậc nhất $bx+c=0$.
     - Nếu $a \neq 0$, tính biệt thức $\Delta = b^2 - 4ac$:
       - Nếu $\Delta > 0$: 2 nghiệm thực $x_{1,2} = \frac{-b \pm \sqrt{\Delta}}{2a}$.
       - Nếu $\Delta == 0$: 1 nghiệm kép $x = \frac{-b}{2a}$.
       - Nếu $\Delta < 0$: 2 nghiệm phức $x_{1,2} = \frac{-b}{2a} \pm \frac{\sqrt{-\Delta}}{2a}i$. Định dạng nghiệm dạng chuỗi `u + vi` và `u - vi`.
   - **Hệ 2 ẩn (`"system2"`):** Giải hệ $\begin{cases}a_1x+b_1y=c_1\\a_2x+b_2y=c_2\end{cases}$ (Mảng coefficients chứa `[a1, b1, c1, a2, b2, c2]`).
     - Áp dụng phương pháp Cramer tính định thức $D, D_x, D_y$.
     - Nếu $D \neq 0$: Hệ có nghiệm duy nhất $x = D_x/D$, $y = D_y/D$.
     - Nếu $D == 0$: Nếu $D_x == 0$ và $D_y == 0$ trả về `"Vô số nghiệm"`, ngược lại trả về `"Vô nghiệm"`.
3. Làm tròn các nghiệm số thực tối đa 10 chữ số thập phân.
4. Trả về kết quả JSON thành công `200 OK`.

---

### [SECTION] Business Rules
- **Ràng buộc Solver (BR-15):** Xử lý hạ cấp phương trình khi hệ số $a=0$, định dạng hiển thị nghiệm phức tiêu chuẩn, và trả về thông báo vô nghiệm/vô số nghiệm tường minh.

---

### [SECTION] Input

**Body (Hệ phương trình 2 ẩn):**
```json
{
  "coefficients": [1, 1, 3, 1, -1, 1],
  "type": "system2"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "roots": ["x = 2", "y = 1"]
}
```

---

## [FUNCTION] Tính tích phân xác định (Tab phụ)
Label: [Engine.integrateSimpson]

API: POST /engine/calculate-unary (Định tuyến tích phân)

---

### [SECTION] Business Description
Tính toán giá trị xấp xỉ số học của tích phân xác định $\int_a^b f(x) dx$ bằng phương pháp Simpson's Rule phục vụ giao diện Tab phụ "Tích Phân" kế thừa từ v2.1.0.

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Hàm số $f(x)$ phải là chuỗi biểu thức toán học hợp lệ.
- Cận $a, b$ phải là các số thực hữu hạn.

---

### [SECTION] Main Flow
1. Nhận yêu cầu tính tích phân tại `/engine/calculate-unary` với body chứa `"value"` (hàm $f(x)$), `"functionName": "integral"`, `"lowerLimit"` (cận $a$), `"upperLimit"` (cận $b$), và đơn vị góc.
2. Kiểm tra cận tích phân:
   - Nếu $a == b$, trả về kết quả `0` ngay lập tức.
   - Nếu $b < a$, đổi hướng tích phân (hoán đổi cận) và nhân kết quả cuối cùng với $-1$.
3. Phân hoạch đoạn tích phân thành $N = 1000$ khoảng chia bằng nhau. Bước nhảy $h = (b-a)/N$.
4. Sử dụng bộ **Evaluator** để tính giá trị của hàm tại từng điểm chia $x_i = a + i \cdot h$:
   - Tại mỗi điểm $x_i$, Evaluator thế giá trị của $x_i$ vào biến tự do `x` để tính giá trị hàm $f(x_i)$.
   - Nếu quá trình tính toán tại bất kỳ điểm nào cho ra kết quả lỗi ($NaN$, $Infinity$), dừng thuật toán và trả lại mã `400 Bad Request` kèm `"Lỗi toán học"`.
5. Tính tổng tích phân số theo công thức Simpson's Rule.
6. Làm tròn kết quả tối đa 10 chữ số thập phân.
7. Trả lại kết quả thành công `200 OK`.

---

### [SECTION] Business Rules
- **Ràng buộc cận tích phân (BR-16):** Đảo cận tự động, trả về 0 khi cận bằng nhau.
- **Ràng buộc hàm liên tục (BR-16):** Báo lỗi toán học nếu hàm số gặp điểm bất định.

---

### [SECTION] Input

**Body:**
```json
{
  "value": "x^2",
  "functionName": "integral",
  "angleUnit": "DEG",
  "lowerLimit": 0,
  "upperLimit": 1
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "result": "0.3333333333"
}
```

---

# MODULE 2: AUTHENTICATION SERVICE

Cung cấp các API xác thực người dùng để đồng bộ dữ liệu đám mây qua Firebase Authentication (kế thừa v2.1.0).

---

## [FUNCTION] Đăng ký tài khoản
Label: [AuthService.register]

API: POST /auth/register

---

## [FUNCTION] Đăng nhập tài khoản
Label: [AuthService.login]

API: POST /auth/login

---

## [FUNCTION] Đăng xuất tài khoản
Label: [AuthService.logout]

API: POST /auth/logout

---

# MODULE 3: CLOUD STORAGE & SYNC SERVICE

Cung cấp các API lưu trữ lịch sử phép tính và đồng bộ hóa đám mây (Cloud Sync) giữa localStorage và Cloud Firestore (kế thừa v2.1.0).

---

## [FUNCTION] Lưu mới phép tính
Label: [StorageService.saveHistoryEntry]

API: POST /history

---

### [SECTION] Main Flow
1. Nhận đối tượng phép tính tại `/history` chứa `expression`, `result`, `status`, và `userId`.
2. Tự động sinh ID duy nhất (UUID v4) và gán thời gian hiện tại (`timestamp`).
3. Đọc dữ liệu lịch sử cục bộ trong `calc_local_history` của `localStorage`. Thêm phần tử mới và giới hạn tối đa 50 phần tử theo cơ chế FIFO.
4. Nếu có truyền `userId` (đã đăng nhập):
   - Nếu online: Ghi bản ghi vào collection `'history'` trên Firestore.
   - Nếu offline: Ghi bản ghi vào mảng hàng đợi ngoại tuyến `calc_offline_queue` trong `localStorage` để đồng bộ sau.
5. Trả về đối tượng lịch sử đã ghi nhận đầy đủ thuộc tính.

---

### [SECTION] Business Rules
- **Định dạng giải tích v2.1.1:** Lưu trữ các chuỗi PEMDAS chứa đạo hàm và biểu thức kết hợp giải tích trực tiếp làm trường `expression` và lưu kết quả đã tính toán làm trường `result`.

---

## [FUNCTION] Đăng ký lắng nghe lịch sử đám mây
Label: [StorageService.streamCloudHistory]

API: GET /history

---

## [FUNCTION] Đồng bộ hàng đợi ngoại tuyến
Label: [StorageService.syncOfflineQueue]

API: POST /history/sync

---

## [FUNCTION] Xóa lịch sử đám mây
Label: [StorageService.clearCloudHistory]

API: DELETE /history

---

# MODULE 4: CLIENT-SIDE UI & DISPLAY CONTROLLER

Cung cấp các đặc tả hàm điều khiển giao diện hiển thị liền mạch và thanh trạng thái chỉ báo hệ thống trực tiếp trên trình duyệt Client (Không truyền tải qua mạng).

---

## [FUNCTION] Hiển thị Biểu thức Liền mạch và Căn lề
Label: [UI.updateExpressionDisplay]

Giao diện: DOM Element `#display-expression` & `#display-result`

---

### [SECTION] Business Description
Tự động ghép nối toán hạng đang gõ thời gian thực vào dòng biểu thức phía trên để người dùng theo dõi biểu thức liền mạch, đồng thời thực hiện căn lề trái cho dòng biểu thức và căn lề phải cho dòng kết quả để tối ưu hóa khả năng đọc.

---

### [SECTION] Actor
- UI View / Event Listeners

---

### [SECTION] Preconditions
- Các phần tử HTML mang ID `#display-expression` và `#display-result` bắt buộc phải tồn tại trong DOM tree.

---

### [SECTION] Main Flow
1. Lắng nghe các sự kiện nhập liệu từ bàn phím cứng hoặc click bàn phím ảo.
2. Controller cập nhật trạng thái `state.expression` và `state.currentInput`.
3. Hàm hiển thị `updateDisplay(state)` thực hiện ghép nối chuỗi biểu thức:
   - Nếu `state.currentInput` không phải là `"0"` (hoặc biểu thức kết thúc bằng toán tử và `state.currentInput` khác rỗng): tiến hành ghép nối hiển thị:
     `Dòng biểu thức = state.expression + state.currentInput`
   - Nếu biểu thức kết thúc bằng toán tử và người dùng chưa gõ toán hạng tiếp theo, hiển thị:
     `Dòng biểu thức = state.expression + "0"`
4. Đẩy chuỗi ghép nối vào phần tử `#display-expression` dưới dạng văn bản và áp dụng CSS căn lề trái (`text-align: left`).
5. Đẩy giá trị toán hạng đang nhập hiện hành `state.currentInput` (trong lúc gõ) hoặc kết quả cuối cùng (sau khi bấm `=`) vào phần tử `#display-result` và áp dụng CSS căn lề phải (`text-align: right`).
6. Kiểm tra kích thước văn bản dòng biểu thức:
   - Đo thuộc tính `scrollWidth` và `clientWidth` của phần tử `#display-expression`.
   - Nếu `scrollWidth > clientWidth`, tự động giảm thuộc tính `font-size` (từ `1.8rem` giảm dần xuống tối thiểu `1.1rem` tương ứng với độ dài chuỗi ký tự) để đảm bảo toàn bộ biểu thức hiển thị trên một dòng duy nhất mà không bị xuống dòng làm phá vỡ layout.

---

### [SECTION] Business Rules
- **Biểu thức liền mạch (BR-19):** Luôn hiển thị toàn bộ chuỗi biểu thức gồm cả số đang gõ thời gian thực trên một dòng căn trái.
- **Kích thước cố định (BR-19):** Khung hiển thị ngoài `.display` phải cố định chiều cao tối thiểu `116px` để tránh hiện tượng co giật layout (Layout Shift) khi font-size thay đổi hoặc chỉ báo bật/tắt.

---

## [FUNCTION] Cập nhật các chỉ báo trạng thái trên màn hình
Label: [UI.updateStatusIndicators]

Giao diện: DOM Elements `.display__indicator` (`S`, `A`, `Math`, `D`, `R`, `▲`, `▼`)

---

### [SECTION] Business Description
Tự động bật/tắt các lớp kích hoạt hoạt họa (`.is-active`) trên các thẻ ký hiệu chỉ báo trạng thái nằm ở viền trên màn hình máy tính tùy thuộc vào sự thay đổi trạng thái hoạt động của ứng dụng Client.

---

### [SECTION] Actor
- UI View / Event Listeners

---

### [SECTION] Preconditions
- Các thẻ chỉ báo trạng thái phải tồn tại trong DOM tree thuộc vùng viền trên màn hình máy tính.

---

### [SECTION] Main Flow
1. Khi hàm `updateDisplay(state)` được gọi sau mỗi sự kiện phím, tiến hành kiểm tra các cờ trạng thái trong `state`.
2. Kiểm tra chỉ báo **S (Shift)**:
   - Nếu `state.waitingForUnaryInput === true` (chờ nhập toán hạng cho hàm Unary), thêm class `.is-active` để làm sáng đèn LED chỉ báo `S`.
   - Ngược lại, xóa bỏ class `.is-active` của `S`.
3. Kiểm tra chỉ báo **D (Degree)** và **R (Radian)**:
   - Nếu `state.angleUnit === 'DEG'`, thêm class `.is-active` cho `D` và xóa của `R`.
   - Nếu `state.angleUnit === 'RAD'`, thêm class `.is-active` cho `R` và xóa của `D`.
4. Chỉ báo **Math** luôn luôn giữ trạng thái thêm class `.is-active` (luôn sáng biểu thị chế độ nhập biểu thức tự nhiên).
5. Kiểm tra chỉ báo cuộn lịch sử **▲ / ▼**:
   - Nếu danh sách lịch sử cục bộ của Client có chứa dữ liệu (`calc_local_history.length >= 1`):
     - Thêm class `.is-active` cho cả hai mũi tên `▲` và `▼` để thông báo cho người dùng biết có thể dùng phím cuộn xem lịch sử.
   - Ngược lại, xóa bỏ class `.is-active` để tắt các mũi tên chỉ báo này.

---

### [SECTION] Business Rules
- **Phản hồi thời gian thực (BR-18):** Trạng thái chỉ báo bắt buộc phản ánh chính xác trạng thái logic của bộ nhớ máy tính trong thời gian thực với độ trễ tối thiểu (< 16ms).

---

# NOTES

- Tài liệu đặc tả API và UI này cung cấp đầy đủ các mô hình truyền tải mạng và đặc tả logic cập nhật DOM nội bộ Client phục vụ kiểm thử thủ công và tự động.
- Các hàm xác thực Firebase Auth và đồng bộ Firestore được duy trì nguyên vẹn tính tương thích ngược từ các phiên bản v2.1.0 và v2.0.0.

---

END OF DOCUMENT
