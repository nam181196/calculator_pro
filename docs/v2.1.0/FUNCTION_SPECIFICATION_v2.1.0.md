# MODULE FUNCTIONAL SPECIFICATION - Simple Calculator Web App v2.1.0

| Thông tin | Chi tiết |
| :--- | :--- |
| **Dự án** | Simple Calculator Web App |
| **Module** | Core API Services |
| **Phiên bản** | v2.1.0 |
| **Ngày cập nhật** | 2026-06-16 |
| **Trạng thái** | DRAFT |
| **Tác giả** | Nam (Product Owner & Developer) |

---

## REVISION HISTORY
| Phiên bản | Ngày | Người sửa | Mô tả |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-05-31 | Nam | Đặc tả các chức năng v1.0.0 dạng cũ (quá dài, trùng lặp nhiều phần) |
| 2.0.0 | 2026-06-09 | Nam | Tái cấu trúc hoàn toàn sang dạng Đặc tả API/SDK Services theo định dạng template chuẩn |
| 2.1.0 | 2026-06-16 | Nam | Nâng cấp các chức năng nâng cao: PEMDAS Parser (F-012), Solver (F-014) và Definite Integral (F-015) |

---

# MODULE 1: CALCULATOR ENGINE SERVICE

Cung cấp các API tính toán cốt lõi, bộ giải phương trình đại số và bộ tính tích phân xác định cho ứng dụng máy tính.

---

## [FUNCTION] Phân tích và tính toán biểu thức PEMDAS
Label: [Engine.evaluateExpression]

API: POST /engine/calculate

---

### [SECTION] Business Description
Nhận dạng chuỗi biểu thức toán học hoàn chỉnh do người dùng nhập từ giao diện, phân tích cú pháp (Tokenize & Parse) theo thứ tự ưu tiên các toán tử toán học (PEMDAS) để tính toán ra kết quả cuối cùng. Triệt tiêu sai số dấu phẩy động của Javascript.

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Biểu thức phải là chuỗi ký tự hợp lệ, không chứa các ký tự lạ ngoài số học, biến tự do `x`, toán tử, hằng số và các hàm toán học hỗ trợ.
- Biến tự do `x` không được phép xuất hiện tại đây (chỉ được sử dụng trong tab Tích phân).

---

### [SECTION] Main Flow
1. Tiếp nhận biểu thức toán học dạng chuỗi tại `/engine/calculate` với body chứa `"expression"`.
2. Kiểm tra tính hợp lệ của biến tự do `x`:
   - Nếu biểu thức chứa ký tự `'x'` hoặc `'X'`, lập tức trả về mã lỗi `400 Bad Request` kèm thông điệp `"Lỗi cú pháp"` (theo quy tắc BR-14).
3. Gửi chuỗi biểu thức vào bộ **Tokenizer** để phân tách thành các token (`NUMBER`, `OPERATOR`, `FUNCTION`, `PARENTHESIS`, v.v.).
4. Gửi mảng token vào bộ **Parser** sử dụng thuật toán **Shunting-yard** để kiểm tra tính cân đối của dấu ngoặc đơn và xây dựng mảng Hậu tố (RPN).
   - Nếu phát hiện ngoặc đơn không cân đối hoặc cú pháp sai (ví dụ: `2 + * 3`), trả về mã lỗi `400 Bad Request` kèm `"Lỗi cú pháp"`.
5. Bộ **Evaluator** thực hiện lượng giá mảng RPN thông qua Value Stack:
   - Nếu phát hiện phép chia cho 0 (`÷ 0`), trả về mã lỗi `400 Bad Request` kèm `"Không thể chia cho 0"`.
   - Nếu phát hiện giá trị căn bậc chẵn của số âm hoặc logarithm của số $\le 0$, trả về mã lỗi `400 Bad Request` kèm `"Lỗi toán học"`.
6. Thực hiện định dạng kết quả:
   - Nếu kết quả $|value| \ge 10^{15}$ hoặc $|value| < 10^{-9}$ (ngoại trừ 0), định dạng theo số mũ khoa học (`toExponential(10)`).
   - Ngược lại, làm tròn tối đa 10 chữ số thập phân (`toFixed(10)`), triệt tiêu sai số nổi (`toPrecision(14)`).
7. Trả về kết quả JSON thành công `200 OK`.

---

### [SECTION] Business Rules
- **Quy tắc PEMDAS (BR-12):** Bắt buộc tuân thủ thứ tự ưu tiên: Ngoặc `()` $\rightarrow$ Hàm lượng giác/logarithm $\rightarrow$ Lũy thừa/Căn thức $\rightarrow$ Nhân/Chia $\rightarrow$ Cộng/Trừ.
- **Xử lý biến tự do x (BR-14):** Ký tự `x` bị cấm hoàn toàn trong tính toán biểu thức PEMDAS thông thường.
- **Làm tròn số thập phân (BR-06):** Triệt tiêu sai số dấu phẩy động thập phân của Javascript trước khi lưu và hiển thị.

---

### [SECTION] Side Effects
- None

---

### [SECTION] Input

**Body:**
```json
{
  "expression": "2 + 3 × (4 - 1)"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "result": "11"
}
```

---

### [SECTION] Error Codes
- 400 - Bad Request
  ```json
  {
    "status": "error",
    "message": "Lỗi cú pháp"
  }
  ```
  *(Hoặc `"Không thể chia cho 0"`, `"Lỗi toán học"`)*

---

## [FUNCTION] Tính toán một toán hạng khoa học
Label: [Engine.performUnaryCalculation]

API: POST /engine/calculate-unary

---

### [SECTION] Business Description
Tính toán các hàm toán học một toán hạng (sin, cos, √, ³√, x², x³, v.v.) ở chế độ nhập liệu thủ công (kế thừa từ v2.0.0). Phép tính này chỉ thực hiện khi người dùng nhấn dấu `=`.

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Đầu vào phải biểu diễn số thực hợp lệ.

---

### [SECTION] Main Flow
1. Nhận yêu cầu tính toán tại `/engine/calculate-unary` với body chứa giá trị số thực, tên hàm và đơn vị góc.
2. Kiểm tra miền xác định của các hàm (ln/log đầu vào phải $> 0$, căn thức chẵn phải $\ge 0$, lượng giác ngược trong khoảng $[-1, 1]$, giai thừa phải là số nguyên $\ge 0$ và $\le 170$). Nếu vi phạm, trả lại mã `400 Bad Request` kèm `"Lỗi toán học"` hoặc `"Lỗi tính toán"`.
3. Chuyển đổi góc: Đổi độ sang radian nếu là DEG đối với lượng giác, và ngược lại đối với lượng giác ngược.
4. Tính toán giá trị và thực hiện định dạng kết quả làm tròn tương tự PEMDAS.
5. Trả lại kết quả thành công `200 OK`.

---

### [SECTION] Business Rules
- **Đơn vị góc lượng giác (BR-10):** Trạng thái DEG/RAD quyết định hệ số đổi lượng giác.
- **Yêu cầu dấu bằng (=):** Trì hoãn thực thi tính toán và hiển thị cho tới khi nhấn phím `=` để đồng bộ UX.

---

### [SECTION] Side Effects
- None

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

### [SECTION] Side Effects
- None

---

### [SECTION] Input

**Body (Phương trình bậc 2):**
```json
{
  "coefficients": [1, -3, 2],
  "type": "quadratic"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "roots": ["2", "1"]
}
```

---

### [SECTION] Error Codes
- 400 - Bad Request (Hệ số gửi lên không phải là định dạng số hợp lệ)

---

## [FUNCTION] Tính tích phân xác định
Label: [Engine.integrateSimpson]

API: POST /engine/calculate-unary

---

### [SECTION] Business Description
Tính toán giá trị xấp xỉ số học của tích phân xác định $\int_a^b f(x) dx$ bằng phương pháp Simpson's Rule trên form nhập liệu của Tab "Công cụ".

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
   - Tại mỗi điểm $x_i$, Evaluator sẽ thế giá trị của $x_i$ vào biến tự do `x` để tính giá trị hàm $f(x_i)$.
   - Nếu quá trình tính toán tại bất kỳ điểm nào cho ra kết quả lỗi ($NaN$, $Infinity$), dừng thuật toán và trả lại mã `400 Bad Request` kèm `"Lỗi toán học"` (theo quy tắc BR-16).
5. Tính tổng tích phân số theo công thức Simpson's Rule.
6. Làm tròn kết quả tối đa 10 chữ số thập phân.
7. Trả lại kết quả thành công `200 OK`.

---

### [SECTION] Business Rules
- **Ràng buộc cận tích phân (BR-16):** Đảo cận tự động, trả về 0 khi cận bằng nhau.
- **Ràng buộc hàm liên tục (BR-16):** Dừng tính toán và báo lỗi toán học ngay lập tức nếu hàm số không xác định tại bất kỳ điểm chia nào trên khoảng tích phân.

---

### [SECTION] Side Effects
- None

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

### [SECTION] Error Codes
- 400 - Bad Request
  ```json
  {
    "status": "error",
    "message": "Lỗi toán học"
  }
  ```

---

# MODULE 2: AUTHENTICATION SERVICE

Cung cấp các API xác thực người dùng để đồng bộ dữ liệu đám mây qua Firebase Authentication (kế thừa v2.0.0).

---

## [FUNCTION] Đăng ký tài khoản
Label: [AuthService.register]

API: POST /auth/register

---

### [SECTION] Business Description
Tạo tài khoản người dùng mới trên hệ thống bằng Email và Mật khẩu.

---

### [SECTION] Actor
- Khách hàng (User chưa đăng nhập)

---

### [SECTION] Preconditions
- Hệ thống online và có cấu hình Firebase Auth.

---

### [SECTION] Main Flow
1. Tiếp nhận Email và Mật khẩu tại `/auth/register`.
2. Gửi yêu cầu đăng ký tới Firebase Authentication SDK.
3. Nếu thành công, tự động đăng nhập người dùng và trả lại thông tin User ID.
4. Nếu thất bại (ví dụ: email đã tồn tại, mật khẩu yếu), bắt lỗi SDK và dịch mã lỗi thành tiếng Việt rồi trả về mã `400 Bad Request`.

---

### [SECTION] Business Rules
- Khi đăng ký thành công, hệ thống tự động đăng nhập và chuẩn bị kích hoạt luồng đồng bộ (F-011).

---

### [SECTION] Side Effects
- Tạo bản ghi người dùng mới trên cơ sở dữ liệu xác thực Firebase Auth.

---

### [SECTION] Input

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "user": {
    "uid": "user_abc123",
    "email": "user@example.com"
  }
}
```

---

### [SECTION] Error Codes
- 400 - Bad Request
  ```json
  {
    "status": "error",
    "message": "Email này đã được sử dụng bởi một tài khoản khác."
  }
  ```

---

## [FUNCTION] Đăng nhập tài khoản
Label: [AuthService.login]

API: POST /auth/login

---

### [SECTION] Business Description
Xác thực tài khoản người dùng hiện có bằng Email và Mật khẩu để bắt đầu phiên làm việc đám mây.

---

### [SECTION] Actor
- Người dùng

---

### [SECTION] Preconditions
- Hệ thống online và có cấu hình Firebase Auth.

---

### [SECTION] Main Flow
1. Nhận thông tin đăng nhập tại `/auth/login`.
2. Gọi hàm xác thực từ Firebase Authentication SDK.
3. Bắt lỗi SDK nếu mật khẩu sai hoặc tài khoản không tồn tại, dịch sang thông báo tiếng Việt thân thiện và trả về mã `401 Unauthorized`.
4. Nếu thành công, trả lời phiên đăng nhập thành công với mã `200 OK`.

---

### [SECTION] Business Rules
- Đăng nhập thành công kích hoạt đồng bộ hóa dữ liệu (F-010/F-011).

---

### [SECTION] Side Effects
- Thiết lập phiên đăng nhập và kích hoạt các stream kết nối Firestore.

---

### [SECTION] Input

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "user": {
    "uid": "user_abc123",
    "email": "user@example.com"
  }
}
```

---

### [SECTION] Error Codes
- 401 - Unauthorized
  ```json
  {
    "status": "error",
    "message": "Mật khẩu không chính xác."
  }
  ```

---

## [FUNCTION] Đăng xuất tài khoản
Label: [AuthService.logout]

API: POST /auth/logout

---

### [SECTION] Business Description
Đăng xuất tài khoản người dùng hiện tại khỏi phiên làm việc và dừng đồng bộ đám mây.

---

### [SECTION] Actor
- Người dùng đã đăng nhập

---

### [SECTION] Preconditions
- Người dùng đang đăng nhập.

---

### [SECTION] Main Flow
1. Tiếp nhận yêu cầu đăng xuất tại `/auth/logout`.
2. Gọi phương thức đăng xuất (`signOut`) của Firebase Auth SDK.
3. Hủy stream đồng bộ Firestore, đưa Client về trạng thái Khách (Guest mode).
4. Trả về thông báo thành công `200 OK`.

---

### [SECTION] Business Rules
- Khi đăng xuất, Client sẽ chuyển sang nạp dữ liệu lịch sử cục bộ từ `localStorage` (F-011).

---

### [SECTION] Side Effects
- Dừng kết nối lắng nghe Firestore.

---

### [SECTION] Input
- None

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "message": "Đăng xuất thành công."
}
```

---

### [SECTION] Error Codes
- None

---

# MODULE 3: CLOUD STORAGE & SYNC SERVICE

Cung cấp các API lưu trữ lịch sử phép tính và đồng bộ hóa đám mây (Cloud Sync) giữa localStorage và Cloud Firestore (kế thừa v2.0.0 & nâng cấp v2.1.0).

---

## [FUNCTION] Lưu mới phép tính
Label: [StorageService.saveHistoryEntry]

API: POST /history

---

### [SECTION] Business Description
Ghi nhận một phép toán (số học, giải phương trình hoặc tích phân) vừa hoàn thành vào lịch sử cục bộ (Tier 1) và Firestore (Tier 2) (Mở rộng cho F-016).

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- None

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
- **Lưu cục bộ:** Tối đa lưu 50 phép tính gần nhất (Tier 1) (F-010).
- **Lưu đám mây:** Ghi nhận lên Firestore (Tier 2) nếu online và người dùng đã đăng nhập (F-010).
- **Đồng bộ offline:** Nếu mất mạng, lưu vào hàng đợi offline để đồng bộ sau (BR-08).
- **Định dạng lịch sử nâng cao (BR-17):** Trực tiếp lưu các chuỗi biểu thức và nghiệm/kết quả đã được định dạng dạng toán học của Solver và Tích phân vào cơ sở dữ liệu.

---

### [SECTION] Side Effects
- Ghi dữ liệu vào `localStorage` của trình duyệt.
- Tạo document mới trên Firebase Firestore.

---

### [SECTION] Input

**Body (Phép tính tích phân):**
```json
{
  "expression": "∫(x², 0, 1)",
  "result": "0.3333333333",
  "status": "success",
  "userId": "user_abc123"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "entry": {
    "id": "doc_12345",
    "userId": "user_abc123",
    "expression": "∫(x², 0, 1)",
    "result": "0.3333333333",
    "status": "success",
    "timestamp": 1780447380000
  }
}
```

---

### [SECTION] Error Codes
- None (Tự động fallback sang lưu hàng đợi offline nếu kết nối Firestore bị lỗi)

---

## [FUNCTION] Đăng ký lắng nghe lịch sử đám mây
Label: [StorageService.streamCloudHistory]

API: GET /history

---

### [SECTION] Business Description
Tải danh sách và đăng ký lắng nghe cập nhật lịch sử tính toán thời gian thực từ đám mây của người dùng.

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Người dùng đã đăng nhập và được xác thực qua Firebase Auth.

---

### [SECTION] Main Flow
1. Tiếp nhận yêu cầu tải lịch sử tại `/history` kèm tham số `userId`.
2. Khởi tạo truy vấn Firestore: `collection(db, 'history')` lọc theo `userId`, sắp xếp theo `timestamp desc` và giới hạn tối đa 200 bản ghi.
3. Thiết lập hàm `onSnapshot` để lắng nghe thay đổi thời gian thực của dữ liệu từ Firestore.
4. Mỗi khi có cập nhật, chuyển tiếp danh sách lịch sử mới nhất về cho Client render lên Sidebar.

---

### [SECTION] Business Rules
- **Giới hạn số lượng:** Chỉ tải tối đa 200 bản ghi lịch sử gần nhất để tiết kiệm băng thông và tăng tốc độ hiển thị (F-010).

---

### [SECTION] Side Effects
- Khởi động kết nối Websocket liên tục tới máy chủ Firestore.

---

### [SECTION] Input

**Query Parameters:**
- `userId`: String
- `limit`: Integer (Mặc định `200`)

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "data": [
    {
      "id": "doc_12345",
      "userId": "user_abc123",
      "expression": "∫(x², 0, 1)",
      "result": "0.3333333333",
      "status": "success",
      "timestamp": 1780447380000
    }
  ]
}
```

---

### [SECTION] Error Codes
- 403 - Forbidden (Yêu cầu bị từ chối do Firebase Security Rules nếu `userId` không khớp với token đăng nhập)

---

## [FUNCTION] Đồng bộ hàng đợi ngoại tuyến
Label: [StorageService.syncOfflineQueue]

API: POST /history/sync

---

### [SECTION] Business Description
Thực hiện đẩy toàn bộ các phép tính tích lũy được trong trạng thái ngoại tuyến lên Firestore khi khôi phục kết nối mạng, hoặc thực hiện reconcile gộp lịch sử local khi đăng nhập.

---

### [SECTION] Actor
- Hệ thống (tự động khi khôi phục mạng / sau khi đăng nhập)

---

### [SECTION] Preconditions
- Người dùng đang ở trạng thái đăng nhập.
- Kết nối Internet online.

---

### [SECTION] Main Flow
1. Nhận yêu cầu đồng bộ loạt bản ghi tại `/history/sync` kèm danh sách các phần tử cần đẩy.
2. Đọc mảng hàng đợi từ `localStorage` hoặc từ lịch sử cục bộ cần reconcile.
3. Chạy vòng lặp đẩy từng tài liệu lên Firestore dưới tên `userId` được chỉ định.
4. Sau khi hoàn thành thành công, xóa sạch danh sách dữ liệu cũ ở local.
5. Trả về thông báo thành công `200 OK`.

---

### [SECTION] Business Rules
- **Reconcile gộp lịch sử:** Khi đăng nhập, nếu local có dữ liệu, hỏi người dùng và đẩy gộp lên Firestore (BR-07).
- **Tự động đồng bộ offline:** Đẩy đồng loạt các phép tính trong queue khi phát hiện kết nối mạng được khôi phục mà không làm phiền người dùng (BR-08).

---

### [SECTION] Side Effects
- Tạo nhiều tài liệu mới trên Firestore.
- Xóa các khóa `calc_offline_queue` hoặc `calc_local_history` trong `localStorage`.

---

### [SECTION] Input

**Body:**
```json
{
  "userId": "user_abc123",
  "entries": [
    {
      "id": "doc_12345",
      "expression": "∫(x², 0, 1)",
      "result": "0.3333333333",
      "status": "success",
      "timestamp": 1780447380000
    }
  ]
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "message": "Đồng bộ hóa hoàn tất."
}
```

---

### [SECTION] Error Codes
- 400 - Bad Request (Lỗi cấu trúc payload hoặc không có bản ghi nào để đồng bộ)
- 403 - Forbidden (Lỗi phân quyền Firestore)

---

## [FUNCTION] Xóa lịch sử đám mây
Label: [StorageService.clearCloudHistory]

API: DELETE /history

---

### [SECTION] Business Description
Xóa bỏ hoàn toàn toàn bộ các tài liệu lịch sử tính toán đã được lưu trữ của người dùng trên Cloud Firestore.

---

### [SECTION] Actor
- Người dùng

---

### [SECTION] Preconditions
- Người dùng đang đăng nhập.

---

### [SECTION] Main Flow
1. Nhận yêu cầu xóa lịch sử tại endpoint `/history` kèm `userId`.
2. Tìm kiếm tất cả các tài liệu trong Firestore collection `'history'` có trường `userId` khớp.
3. Chạy vòng lặp thực hiện xóa từng document.
4. Trả về phản hồi thành công `200 OK`.

---

### [SECTION] Business Rules
- Chỉ cho phép xóa dữ liệu lịch sử thuộc quyền sở hữu của chính người dùng đăng nhập (được kiểm soát bởi Firebase Security Rules).

---

### [SECTION] Side Effects
- Xóa bỏ dữ liệu document trên Cloud Firestore, kích hoạt sự kiện cập nhật xóa sạch Sidebar của Client.

---

### [SECTION] Input

**Query Parameters:**
- `userId`: String

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "message": "Xóa lịch sử thành công."
}
```

---

### [SECTION] Error Codes
- 403 - Forbidden (Từ chối nếu người dùng tìm cách xóa dữ liệu của tài khoản khác)
- 500 - Internal Server Error (Lỗi kết nối hoặc lỗi máy chủ đám mây)

---

# NOTES

- Tài liệu đặc tả API này cung cấp các mô hình request/response dữ liệu và luồng xử lý tương tự như các web services truyền thống.
- Các hàm giao diện Client (update hiển thị, toggle giao diện sáng tối) được tách rời khỏi tài liệu này vì chúng là các hành động DOM local thuần túy không có hợp đồng truyền tải mạng.

---

END OF DOCUMENT
