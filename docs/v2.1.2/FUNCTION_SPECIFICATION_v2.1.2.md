# MODULE FUNCTIONAL SPECIFICATION - Simple Calculator Web App v2.1.2

| Thông tin | Chi tiết |
| :--- | :--- |
| **Dự án** | Simple Calculator Web App |
| **Module** | Core API & UI Display Services |
| **Phiên bản** | v2.1.2 |
| **Ngày cập nhật** | 2026-06-19 |
| **Trạng thái** | APPROVED |
| **Tác giả** | Nam (Product Owner & Developer) |

---

## REVISION HISTORY
| Phiên bản | Ngày | Người sửa | Mô tả |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-05-31 | Nam | Đặc tả các chức năng v1.0.0 dạng cũ (quá dài, trùng lặp nhiều phần) |
| 2.0.0 | 2026-06-09 | Nam | Tái cấu trúc hoàn toàn sang dạng Đặc tả API/SDK Services theo định dạng template chuẩn |
| 2.1.0 | 2026-06-16 | Nam | Nâng cấp các chức năng nâng cao: PEMDAS Parser (F-012), Solver (F-014) và Definite Integral (F-015) |
| 2.1.1 | 2026-06-18 | Nam | Nâng cấp v2.1.1: Tích hợp Đạo hàm/Tích phân đệ quy (F-018) và Đặc tả Giao diện Hiển thị Liền mạch & Thanh Chỉ báo (F-017) |
| 2.1.2 | 2026-06-19 | Nam | Tích hợp hiển thị biểu thức định dạng toán học trực quan (Math Layout Renderer - F-017 bổ sung), phím ẩn biến `x` (F-019), bộ giải phương trình Tìm x (Newton-Raphson Solver - F-020) và phím nhập phân số trực quan `■/□` (F-021) dạng ô vuông điền tham số. |

---

# MODULE 1: CALCULATOR ENGINE SERVICE

Cung cấp các API tính toán cốt lõi, bộ giải phương trình đại số, bộ giải tích số đệ quy, và bộ giải phương trình số học Tìm x cho ứng dụng máy tính.

---

## [FUNCTION] Phân tích và tính toán biểu thức PEMDAS (Tích hợp Giải tích)
Label: [Engine.evaluateExpression]

API: POST /engine/calculate

---

### [SECTION] Business Description
Nhận dạng chuỗi biểu thức toán học hoàn chỉnh do người dùng nhập từ giao diện, phân tích cú pháp (Tokenize & Parse) theo thứ tự ưu tiên các toán tử toán học (PEMDAS) để tính toán ra kết quả cuối cùng. Tự động lượng giá đệ quy các toán tử giải tích phức hợp (đạo hàm số, tích phân số lồng nhau) được tích hợp trực tiếp trong biểu thức. Không hỗ trợ biến tự do `x` (nếu phát hiện biến tự do `x`, trả về lỗi cú pháp).

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Biểu thức phải là chuỗi ký tự hợp lệ, không chứa các ký tự lạ ngoài số học, biến tự do `x`, toán tử, dấu phẩy `,`, hằng số và các hàm toán học hỗ trợ.
- Biến tự do `x` chỉ được phép xuất hiện bên trong phạm vi các đối số của hàm giải tích `d/dx(f(x), x_0)` hoặc `∫(f(x), a, b)`.

---

### [SECTION] Main Flow
1. Tiếp nhận biểu thức toán học dạng chuỗi tại `/engine/calculate` với body chứa `"expression"` và `"angleUnit"`.
2. Kiểm tra tính hợp lệ của biến tự do `x`:
   - Duyệt tìm tất cả vị trí xuất hiện của ký tự `'x'` hoặc `'X'`.
   - Nếu phát hiện bất kỳ ký tự `'x'` tự do nào nằm ngoài phạm vi các toán tử giải tích (`d/dx` hoặc `∫`), lập tức trả về mã lỗi `400 Bad Request` kèm thông điệp `"Lỗi cú pháp"`.
3. Gửi chuỗi biểu thức vào bộ **Tokenizer** để phân tách thành các token (`NUMBER`, `OPERATOR`, `FUNCTION`, `PARENTHESIS`, `COMMA` v.v.). Tokenizer nhận dạng dấu phẩy `,` để ngăn cách các đối số.
4. Gửi mảng token vào bộ **Parser** sử dụng thuật toán **Shunting-yard** để kiểm tra tính cân đối của dấu ngoặc đơn và xây dựng mảng Hậu tố (RPN).
   - Kiểm tra số lượng đối số truyền vào các hàm giải tích: `d/dx` phải có đúng 2 đối số, `∫` phải có đúng 3 đối số. Nếu không đúng, trả về mã lỗi `400 Bad Request` kèm `"Lỗi cú pháp"`.
5. Bộ **Evaluator** thực hiện lượng giá mảng RPN thông qua Value Stack:
   - Nếu gặp các hàm giải tích thường (sin, cos, ln, v.v.), áp dụng tính toán trực tiếp.
   - Nếu gặp token hàm giải tích `d/dx(f(x), x_0)`:
     - Trích xuất mảng RPN của biểu thức con $f(x)$ và giá trị điểm thế $x_0$.
     - Gọi đệ quy Evaluator lượng giá mảng RPN của $f(x)$ tại điểm $x = x_0 + 10^{-5}$ và $x = x_0 - 10^{-5}$.
     - Tính kết quả đạo hàm số theo công thức sai phân trung tâm.
   - Nếu gặp token hàm giải tích `∫(f(x), a, b)`:
     - Trích xuất mảng RPN của biểu thức con $f(x)$, cận dưới $a$ và cận trên $b$.
     - Gọi đệ quy Evaluator lượng giá mảng RPN của $f(x)$ tại 1001 điểm chia từ $a$ đến $b$ để tính tổng tích phân số theo công thức Simpson's Rule.
   - **Xử lý lỗi toán học động:**
     - Nếu phát hiện phép chia cho 0 (`÷ 0`), trả về mã lỗi `400 Bad Request` kèm `"Không thể chia cho 0"`.
     - Nếu phát hiện miền xác định bị vi phạm (căn số âm, log số âm, v.v.) hoặc kết quả đệ quy trả về $NaN$/$Infinity$, trả về mã lỗi `400 Bad Request` kèm `"Lỗi toán học"`.
     - Nếu độ sâu đệ quy giải tích lồng nhau vượt quá **3 cấp**, dừng tính toán và trả về mã lỗi `400 Bad Request` kèm `"Lỗi toán học"`.
6. Thực hiện định dạng kết quả:
   - Nếu kết quả $|value| \ge 10^{15}$ hoặc $|value| < 10^{-9}$ (ngoại trừ 0), định dạng theo số mũ khoa học (`toExponential(10)`).
   - Ngược lại, làm tròn tối đa 10 chữ số thập phân (`toFixed(10)`), triệt tiêu sai số nổi (`toPrecision(14)`).
7. Trả về kết quả JSON thành công `200 OK`.

---

### [SECTION] Business Rules
- **Quy tắc PEMDAS (BR-12):** Bắt buộc tuân thủ thứ tự ưu tiên dấu ngoặc, hàm giải tích, lũy thừa, nhân/chia, cộng/trừ.
- **Ràng buộc Giải tích đệ quy (BR-20):** Giới hạn đệ quy 3 cấp, áp dụng bước sai phân $h = 10^{-5}$ và tích phân Simpson $N = 1000$ khoảng chia.
- **Xử lý biến tự do x (BR-14):** Ký tự `x` chỉ hợp lệ bên trong hàm giải tích đối với endpoint `/engine/calculate`.

---

### [SECTION] Side Effects
- None

---

### [SECTION] Input

**Body:**
```json
{
  "expression": "d/dx(x^2, 2) / d/dx(x^3, 2)",
  "angleUnit": "DEG"
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

## [FUNCTION] Bộ giải phương trình Tìm x (Newton-Raphson Solver)
Label: [Engine.solveForX]

API: POST /engine/solve-x

---

### [SECTION] Business Description
Thực hiện tìm nghiệm thực xấp xỉ cho phương trình phi tuyến $f(x) = 0$ sử dụng phương pháp lặp số học Newton-Raphson đa điểm khởi đầu. Đạo hàm $f'(x_n)$ được lượng giá số học bằng phương pháp sai phân trung tâm.

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Biểu thức đầu vào phải là chuỗi ký tự hợp lệ chứa ít nhất một biến tự do `x`.

---

### [SECTION] Main Flow
1. Tiếp nhận chuỗi biểu thức chứa biến tự do `x` tại `/engine/solve-x` với body chứa `"expression"` và `"angleUnit"`. Thực hiện Tokenize và Parse (Shunting-yard) để xây dựng mảng RPN.
2. Khởi tạo danh sách 5 điểm xuất phát thực: $x_0 \in [1.0, 0.0, -1.0, 10.0, -10.0]$.
3. Lặp qua từng điểm xuất phát trong danh sách:
   - Đặt giá trị lặp hiện hành $x_n = x_0$.
   - Thực hiện tối đa 100 vòng lặp tìm nghiệm:
     a. Lượng giá giá trị hàm $f(x_n)$ bằng cách thay thế biến tự do `x` bằng $x_n$ trong RPN và gọi bộ Evaluator.
     b. Nếu kết quả $f(x_n)$ là $NaN$ hoặc $Infinity$, dừng vòng lặp hiện tại và chuyển sang điểm xuất phát tiếp theo.
     c. Nếu sai số $|f(x_n)| < 10^{-7}$, thuật toán hội tụ thành công. Đi tới bước 4.
     d. Lượng giá giá trị đạo hàm số $f'(x_n)$ theo công thức sai phân trung tâm:
        $$f'(x_n) = \frac{f(x_n + h) - f(x_n - h)}{2h}$$ với $h = 10^{-5}$.
     e. Nếu đạo hàm $|f'(x_n)| < 10^{-12}$ (độ dốc quá phẳng, có nguy cơ chia cho 0), dừng vòng lặp hiện tại và chuyển sang điểm xuất phát tiếp theo.
     f. Cập nhật điểm lặp tiếp theo: $x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$.
     g. Nếu $x_{n+1}$ là $NaN$ hoặc $Infinity$, dừng vòng lặp hiện tại và chuyển sang điểm xuất phát tiếp theo.
     h. Gán $x_n = x_{n+1}$.
4. Nếu tìm được nghiệm hội tụ trong danh sách:
   - Thực hiện làm tròn nghiệm:
     - Nếu $|root| \ge 10^{15}$ hoặc $|root| < 10^{-9}$ (ngoại trừ 0), định dạng theo số mũ khoa học (`toExponential(10)`).
     - Ngược lại, làm tròn tối đa 10 chữ số thập phân (`toFixed(10)`), triệt tiêu sai số nổi (`toPrecision(14)`).
   - Trả về nghiệm đã định dạng: `"x = " + root`.
5. Nếu đã thử hết cả 5 điểm xuất phát mà không hội tụ được nghiệm nào thỏa mãn $|f(x_n)| < 10^{-7}$, ném ngoại lệ `"Lỗi toán học"`.

---

### [SECTION] Business Rules
- **Ngưỡng hội tụ (BR-14):** Sai số tuyệt đối của hàm tại nghiệm phải đạt $|f(x_n)| < 10^{-7}$.
- **Giới hạn số lần lặp:** Tối đa 100 lần lặp cho mỗi điểm xuất phát để tránh treo luồng CPU của trình duyệt.
- **Tính toán lượng giác:** Đơn vị góc (DEG/RAD) quyết định việc lượng giá các hàm sin, cos, tan bên trong biểu thức $f(x)$.

---

### [SECTION] Side Effects
- None

---

### [SECTION] Input

**Body:**
```json
{
  "expression": "x^2 - 9",
  "angleUnit": "DEG"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "result": "x = 3"
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

### [SECTION] Error Codes
- 400 - Bad Request
  ```json
  {
    "status": "error",
    "message": "Hệ số không hợp lệ"
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

### [SECTION] Business Description
Lưu lịch sử phép tính mới vào bộ nhớ cục bộ (Local Storage) và tự động đồng bộ hóa lên Cloud Firestore nếu người dùng đã đăng nhập và đang trực tuyến.

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Phép tính vừa được thực hiện xong và cần lưu vào lịch sử.

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
- **Định dạng giải tích v2.1.2:** Lưu trữ các chuỗi PEMDAS chứa ẩn tự do `x`, đạo hàm, hoặc biểu thức kết hợp giải tích làm trường `expression` và lưu kết quả (ví dụ `"x = 3"`) làm trường `result`.

---

### [SECTION] Side Effects
- Ghi dữ liệu vào bộ nhớ Local Storage (`calc_local_history`, `calc_offline_queue`).
- Ghi dữ liệu vào collection `'history'` trên Cloud Firestore (nếu đã đăng nhập).

---

### [SECTION] Input

**Body:**
```json
{
  "expression": "x^2 - 9",
  "result": "x = 3",
  "status": "success",
  "userId": "firebase_user_uid_123"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "id": "generated_uuid_v4",
  "userId": "firebase_user_uid_123",
  "expression": "x^2 - 9",
  "result": "x = 3",
  "status": "success",
  "timestamp": 1781839396000
}
```

---

### [SECTION] Error Codes
- 400 - Bad Request (Lỗi tham số đầu vào)
- 401 - Unauthorized (Token xác thực không hợp lệ)

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

Cung cấp các đặc tả điều khiển giao diện hiển thị liền mạch, bộ hiển thị toán học 2D trực quan và thanh trạng thái chỉ báo hệ thống trực tiếp trên trình duyệt Client (Không truyền tải qua mạng).

---

## [FUNCTION] Hiển thị Biểu thức Liền mạch và Căn lề
Label: [UI.updateExpressionDisplay]

Giao diện: DOM Element `#display-expression` & `#display-result`

---

### [SECTION] Business Description
Tự động ghép nối toán hạng hoặc biến số `x` đang gõ thời gian thực vào dòng biểu thức phía trên để người dùng theo dõi biểu thức liền mạch, đồng thời thực hiện căn lề trái cho dòng biểu thức và căn lề phải cho dòng kết quả để tối ưu hóa khả năng đọc.

---

### [SECTION] Actor
- UI View / Event Listeners

---

### [SECTION] Preconditions
- Các phần tử HTML mang ID `#display-expression` và `#display-result` bắt buộc phải tồn tại trong DOM tree.

---

### [SECTION] Main Flow
1. Lắng nghe các sự kiện nhập liệu từ bàn phím cứng hoặc click bàn phím ảo.
   - Nếu click phím ảo `x` (ID `btn-var-x` hoặc `data-action="variable"`), gọi hàm `handleVariable('x')` để chèn biến `x` vào biểu thức.
   - Nếu nhấn phím cứng `x` hoặc `X`, gọi hàm tương đương `handleVariable('x')`.
   - Nếu click phím ảo phân số `■/□` (ID `btn-fraction` hoặc `data-action="fraction"`), gọi hàm `handleFraction()` để chèn cấu trúc phân số mẫu `(⬚)/(⬚)` vào vị trí con trỏ `state.cursorIndex` (hoặc cuối biểu thức) và tự động đặt con trỏ tại ô vuông tử số đầu tiên.
   - Lắng nghe click chuột trên vùng `#display-expression`: nếu nhấn vào thẻ chứa class `.math-placeholder`, trích xuất thuộc tính `data-index` và đặt `state.cursorIndex` tại vị trí đó để hiển thị viền neon đang chọn.
2. Controller cập nhật trạng thái `state.expression` và `state.currentInput` theo vị trí chèn của con trỏ ảo.
3. Hàm hiển thị `updateDisplay(state)` thực hiện ghép nối chuỗi biểu thức và cập nhật màn hình:
   - Nếu `state.currentInput` không phải là `"0"` (hoặc biểu thức kết thúc bằng toán tử/chữ cái và `state.currentInput` khác rỗng): tiến hành ghép nối hiển thị:
     `Dòng biểu thức = state.expression + state.currentInput`
   - Nếu biểu thức kết thúc bằng toán tử và người dùng chưa gõ toán hạng tiếp theo, hiển thị:
     `Dòng biểu thức = state.expression + "0"`
4. Gọi hàm `UI.formatExpressionToHTML` để chuyển đổi chuỗi biểu thức phẳng sang mã HTML định dạng toán học 2D.
5. Đẩy mã HTML đã định dạng vào phần tử `#display-expression` và áp dụng CSS căn lề trái (`text-align: left`).
6. Đẩy giá trị toán hạng đang nhập hiện hành `state.currentInput` (trong lúc gõ) hoặc kết quả cuối cùng (sau khi bấm `=`) vào phần tử `#display-result` và áp dụng CSS căn lề phải (`text-align: right`).
7. Kiểm tra kích thước văn bản dòng biểu thức:
   - Đo thuộc tính `scrollWidth` và `clientWidth` của phần tử `#display-expression`.
   - Nếu `scrollWidth > clientWidth`, tự động giảm thuộc tính `font-size` (từ `1.8rem` giảm dần xuống tối thiểu `1.1rem` tương ứng với độ dài chuỗi ký tự) để đảm bảo toàn bộ biểu thức hiển thị trên một dòng duy nhất mà không bị xuống dòng làm phá vỡ layout.

---

### [SECTION] Business Rules
- **Biểu thức liền mạch (BR-19):** Luôn hiển thị toàn bộ chuỗi biểu thức gồm cả số và biến đang gõ thời gian thực trên một dòng căn trái.
- **Kích thước cố định (BR-19):** Khung hiển thị ngoài `.display` phải cố định chiều cao tối thiểu `116px` để tránh hiện tượng co giật layout (Layout Shift) khi font-size thay đổi hoặc chỉ báo bật/tắt.

---

## [FUNCTION] Bộ định dạng hiển thị toán học (Math Layout Renderer)
Label: [UI.formatExpressionToHTML]

Giao diện: DOM Element `#display-expression`

---

### [SECTION] Business Description
Tự động biên dịch chuỗi biểu thức phẳng toán học (PEMDAS) sang cây cú pháp hiển thị (Display AST), từ đó sinh ra mã HTML trực quan hỗ trợ phân số đứng (vertical fractions), số mũ dạng superscript, ký hiệu đạo hàm dài, và tích phân có cận đứng trên màn hình. Tự động che giấu các toán tử phân cách bằng CSS `display: none` và chuyển các cận tích phân vào thuộc tính CSS content để bảo toàn thuộc tính `.textContent` phẳng phục vụ kiểm thử tự động.

---

### [SECTION] Actor
- UI View / Layout Parser

---

### [SECTION] Preconditions
- Chuỗi biểu thức đầu vào phải tuân thủ cú pháp ký hiệu máy tính.

---

### [SECTION] Main Flow
1. Tiếp nhận chuỗi biểu thức phẳng (ví dụ: `(x^2 - 1)/(x + 1) + d/dx(x^2, 2)`).
2. Chạy bộ **Tokenizer hiển thị** nội bộ để phân tách chuỗi thành các token hiển thị.
3. Chạy bộ **Parser hiển thị** để xây dựng cây cấu trúc cú pháp AST (Display AST) dạng cây lồng nhau đại diện cho độ ưu tiên hiển thị (ví dụ: phân số, số mũ, hàm số).
4. Thực hiện duyệt đệ quy cây AST qua hàm `renderASTToHTML(node)` để sinh ra mã HTML có gắn class CSS chuyên biệt:
   - **Phép chia (`/` hoặc `÷`):** Biên dịch thành phân số đứng:
     ```html
     <span class="fraction">
       <span class="numerator">[Tử số]</span>
       <span class="fraction-op" style="display:none"> ÷ </span>
       <span class="denominator">[Mẫu số]</span>
     </span>
     ```
   - **Phép lũy thừa (`^`):** Biên dịch thành số mũ superscript:
     ```html
     [Cơ số]<span class="pow-op" style="display:none">^</span><sup>[Số mũ]</sup>
     ```
   - **Đạo hàm (`d/dx(f(x), x_0)`):** Biên dịch thành ký hiệu đạo hàm đứng trực quan:
     ```html
     <span class="deriv-expr">
       <span class="fraction">
         <span class="numerator">d</span>
         <span class="fraction-op" style="display:none">/</span>
         <span class="denominator">dx</span>
       </span>
       <span class="pow-op" style="display:none">d/dx</span>([f(x)], [x_0])
     </span>
     ```
   - **Tích phân (`∫(f(x), a, b)`):** Biên dịch thành ký hiệu tích phân cận đứng:
     ```html
     <span class="integral-expr">
       <span class="integral-sym">∫</span>
       <span class="limits" data-upper="[b]" data-lower="[a]"></span>
       <span class="pow-op" style="display:none">∫</span>
       <span class="integrand">([f(x)])</span>
       <span style="display:none">(</span>
       <span style="display:none">, [a], [b])</span>
     </span>
     ```
     *(Trong đó, cận dưới `a` và cận trên `b` được vẽ bằng CSS pseudo-elements thông qua các thuộc tính `data-lower` và `data-upper` để loại bỏ giá trị chữ của cận khỏi textContent)*.
5. Trả về chuỗi HTML hoàn chỉnh đã biên dịch để đưa vào innerHTML của `#display-expression`.

---

### [SECTION] Business Rules
- **Bảo toàn textContent (BR-17):** Mặc dù hiển thị dạng toán học 2D, thuộc tính `.textContent` của phần tử `#display-expression` vẫn phải trả về chuỗi văn bản phẳng gốc của PEMDAS (ví dụ: `2 ÷ 3` thay vì `2 3`).
- **Xử lý placeholder (BR-21):** Khi một hàm giải tích hoặc cấu trúc phân số đứng chưa được điền đủ đối số, hiển thị ô vuông nét đứt `⬚` (`<span class="math-placeholder" data-index="[chỉ_số]">⬚</span>` hoặc `<span class="math-placeholder has-cursor" data-index="[chỉ_số]">⬚</span>` nếu có con trỏ ảo tập trung) làm gợi ý nhập liệu trực quan.

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

- Tài liệu đặc tả chức năng này cung cấp các hướng dẫn chi tiết về hành vi giao diện mới (phím ảo và phím cứng biến x), logic của bộ giải nghiệm Tìm x Newton-Raphson, và cơ chế chuyển đổi hiển thị toán học 2D.
- Đảm bảo 100% tính tương thích ngược với bộ test tự động thông qua việc che giấu các ký tự toán tử bổ trợ bằng CSS.

---

END OF DOCUMENT
