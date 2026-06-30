# CHI TIẾT CÁC CA KIỂM THỬ ĐƠN VỊ (UNIT TEST CASES) - v2.1.2
## TẬP TIN: [engine.test.js](file:///Users/nam/Desktop/calculator/tests/unit/engine.test.js)

Tài liệu này liệt kê chi tiết 69 ca kiểm thử đơn vị đối với các giải thuật tính toán cốt lõi trong [engine.js](file:///Users/nam/Desktop/calculator/js/engine.js).

---

## 1. PHÂN HỆ: PHÉP TÍNH NHỊ PHÂN 2 TOÁN HẠNG (performCalculation)

| Mã Test | Tên/Mô tả kịch bản | Giá trị đầu vào (Operand 1, Op, Operand 2) | Kết quả mong đợi (Expected Output) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-ENG01** | Phép cộng cơ bản | `5.5`, `+`, `4.5` | `10` | **Passed** |
| **TC-ENG02** | Phép trừ cơ bản | `10`, `−`, `4.5` | `5.5` | **Passed** |
| **TC-ENG03** | Phép nhân cơ bản | `3`, `×`, `1.5` | `4.5` | **Passed** |
| **TC-ENG04** | Phép chia cơ bản | `10`, `÷`, `4` | `2.5` | **Passed** |
| **TC-ENG05** | Chia cho 0 | `5`, `÷`, `0` | Ném lỗi `"Không thể chia cho 0"` | **Passed** |
| **TC-ENG06** | Căn bậc n (ʸ√x): Bậc chẵn của số dương | `4`, `ʸ√x`, `81` | `3` | **Passed** |
| **TC-ENG07** | Căn bậc n (ʸ√x): Bậc lẻ của số âm | `3`, `ʸ√x`, `-8` | `-2` | **Passed** |
| **TC-ENG08** | Căn bậc n (ʸ√x): Bậc chẵn của số âm | `2`, `ʸ√x`, `-9` | Ném lỗi `"Lỗi toán học"` | **Passed** |
| **TC-ENG09** | Căn bậc n (ʸ√x): Bậc 0 | `0`, `ʸ√x`, `81` | Ném lỗi `"Lỗi toán học"` | **Passed** |
| **TC-ENG10** | Toán hạng không hợp lệ | `abc`, `+`, `5` / `5`, `+`, `def` | Ném lỗi `"Lỗi toán học"` | **Passed** |

---

## 2. PHÂN HỆ: PHÉP TÍNH ĐƠN PHÂN 1 TOÁN HẠNG (performUnaryCalculation)

### 2.1. Lượng giác ở chế độ DEG (DEG Mode)
*   **TC-UNY01:** `sin(30 deg)` $\rightarrow$ Đầu vào: `30`, `sin`, `DEG` $\rightarrow$ Kết quả: `0.5`
*   **TC-UNY02:** `sin(90 deg)` $\rightarrow$ Đầu vào: `90`, `sin`, `DEG` $\rightarrow$ Kết quả: `1`
*   **TC-UNY03:** `cos(60 deg)` $\rightarrow$ Đầu vào: `60`, `cos`, `DEG` $\rightarrow$ Kết quả: `0.5`
*   **TC-UNY04:** `cos(90 deg)` $\rightarrow$ Đầu vào: `90`, `cos`, `DEG` $\rightarrow$ Kết quả: `0`
*   **TC-UNY05:** `tan(45 deg)` $\rightarrow$ Đầu vào: `45`, `tan`, `DEG` $\rightarrow$ Kết quả: `1`
*   **TC-UNY06:** `tan(90 deg)` (cos=0) $\rightarrow$ Đầu vào: `90`, `tan`, `DEG` $\rightarrow$ Ném lỗi `"Lỗi toán học"`
*   **TC-UNY07:** `asin(0.5)` $\rightarrow$ Đầu vào: `0.5`, `asin`, `DEG` $\rightarrow$ Kết quả: `30`
*   **TC-UNY08:** `asin(2)` (Vượt miền [-1, 1]) $\rightarrow$ Đầu vào: `2`, `asin`, `DEG` $\rightarrow$ Ném lỗi `"Lỗi toán học"`
*   **TC-UNY09:** `acos(0.5)` $\rightarrow$ Đầu vào: `0.5`, `acos`, `DEG` $\rightarrow$ Kết quả: `60`
*   **TC-UNY10:** `acos(-2)` (Vượt miền [-1, 1]) $\rightarrow$ Đầu vào: `-2`, `acos`, `DEG` $\rightarrow$ Ném lỗi `"Lỗi toán học"`
*   **TC-UNY11:** `atan(1)` $\rightarrow$ Đầu vào: `1`, `atan`, `DEG` $\rightarrow$ Kết quả: `45`

### 2.2. Lượng giác ở chế độ RAD (RAD Mode)
*   **TC-UNY12:** `sin(pi/6 rad)` $\rightarrow$ Đầu vào: `pi/6`, `sin`, `RAD` $\rightarrow$ Kết quả: `0.5`
*   **TC-UNY13:** `cos(pi/3 rad)` $\rightarrow$ Đầu vào: `pi/3`, `cos`, `RAD` $\rightarrow$ Kết quả: `0.5`
*   **TC-UNY14:** `tan(pi/4 rad)` $\rightarrow$ Đầu vào: `pi/4`, `tan`, `RAD` $\rightarrow$ Kết quả: `1`
*   **TC-UNY15:** `asin(0.5)` $\rightarrow$ Đầu vào: `0.5`, `asin`, `RAD` $\rightarrow$ Kết quả: `pi/6` (≈ 0.5235987756)
*   **TC-UNY16:** `acos(0.5)` $\rightarrow$ Đầu vào: `0.5`, `acos`, `RAD` $\rightarrow$ Kết quả: `pi/3` (≈ 1.0471975512)
*   **TC-UNY17:** `atan(1)` $\rightarrow$ Đầu vào: `1`, `atan`, `RAD` $\rightarrow$ Kết quả: `pi/4` (≈ 0.7853981633)

### 2.3. Logarithm & Căn thức
*   **TC-UNY18:** `ln(e)` $\rightarrow$ Đầu vào: `e`, `ln` $\rightarrow$ Kết quả: `1`
*   **TC-UNY19:** `ln(0)` $\rightarrow$ Đầu vào: `0`, `ln` $\rightarrow$ Ném lỗi `"Lỗi toán học"`
*   **TC-UNY20:** `ln(-5)` $\rightarrow$ Đầu vào: `-5`, `ln` $\rightarrow$ Ném lỗi `"Lỗi toán học"`
*   **TC-UNY21:** `log(100)` $\rightarrow$ Đầu vào: `100`, `log` $\rightarrow$ Kết quả: `2`
*   **TC-UNY22:** `log(-1)` $\rightarrow$ Đầu vào: `-1`, `log` $\rightarrow$ Ném lỗi `"Lỗi toán học"`
*   **TC-UNY23:** `sqrt(9)` $\rightarrow$ Đầu vào: `9`, `sqrt` $\rightarrow$ Kết quả: `3`
*   **TC-UNY24:** `sqrt(-4)` $\rightarrow$ Đầu vào: `-4`, `sqrt` $\rightarrow$ Ném lỗi `"Lỗi toán học"`
*   **TC-UNY25:** `cbrt(-8)` $\rightarrow$ Đầu vào: `-8`, `cbrt` $\rightarrow$ Kết quả: `-2`

### 2.4. Bình phương, Lập phương, Giai thừa, Trị tuyệt đối & Phần trăm
*   **TC-UNY26:** `sq(-5)` $\rightarrow$ Đầu vào: `-5`, `sq` $\rightarrow$ Kết quả: `25`
*   **TC-UNY27:** `cube(-3)` $\rightarrow$ Đầu vào: `-3`, `cube` $\rightarrow$ Kết quả: `-27`
*   **TC-UNY28:** `factorial(0)` $\rightarrow$ Đầu vào: `0`, `factorial` $\rightarrow$ Kết quả: `1`
*   **TC-UNY29:** `factorial(5)` $\rightarrow$ Đầu vào: `5`, `factorial` $\rightarrow$ Kết quả: `120`
*   **TC-UNY30:** `factorial(170)` $\rightarrow$ Đầu vào: `170`, `factorial` $\rightarrow$ Kết quả: Số thực cực lớn dương (>0)
*   **TC-UNY31:** `factorial(171)` (Tràn số kép) $\rightarrow$ Đầu vào: `171`, `factorial` $\rightarrow$ Ném lỗi `"Lỗi toán học"`
*   **TC-UNY32:** `factorial(5.5)` (Số thập phân) $\rightarrow$ Đầu vào: `5.5`, `factorial` $\rightarrow$ Ném lỗi `"Lỗi toán học"`
*   **TC-UNY33:** `factorial(-3)` (Số âm) $\rightarrow$ Đầu vào: `-3`, `factorial` $\rightarrow$ Ném lỗi `"Lỗi toán học"`
*   **TC-UNY34:** `abs(-10.5)` $\rightarrow$ Đầu vào: `-10.5`, `abs` $\rightarrow$ Kết quả: `10.5`
*   **TC-UNY35:** `percent(75)` $\rightarrow$ Đầu vào: `75`, `percent` $\rightarrow$ Kết quả: `0.75`

---

## 3. PHÂN HỆ: ĐỊNH DẠNG KẾT QUẢ HIỂN THỊ (formatResult)

| Mã Test | Ý nghĩa/Mô tả kịch bản | Dữ liệu đầu vào | Kết quả hiển thị mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-FMT01** | Số 0 | `0` | `"0"` | **Passed** |
| **TC-FMT02** | Làm tròn tối đa 10 chữ số thập phân | `1 / 3` / `0.1 + 0.2` | `"0.3333333333"` / `"0.3"` | **Passed** |
| **TC-FMT03** | Kết quả quá lớn ($\ge 10^{15}$) | `1000000000000000` | Định dạng số mũ khoa học (`1e+15`) | **Passed** |
| **TC-FMT04** | Kết quả quá nhỏ ($< 10^{-9}$) | `0.000000000099` | Định dạng số mũ khoa học (`9.9e-11`) | **Passed** |
| **TC-FMT05** | Loại bỏ số 0 thừa ở phần thập phân | `1.5e20` / `5.0e15` | `"1.5e+20"` / `"5e+15"` | **Passed** |

---

## 4. PHÂN HỆ: PARSER PEMDAS & GIẢI TÍCH (evaluateExpression)

| Mã Test | Ý nghĩa/Mô tả kịch bản | Chuỗi biểu thức đầu vào | Kết quả mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-EXP-CALC01**| Đạo hàm số đơn giản | `"d/dx(x^2, 2)"` | `4` (sai phân $h=10^{-5}$) | **Passed** |
| **TC-EXP-CALC02**| Tích phân số đơn giản | `"∫(x^2, 0, 1)"` | `0.3333333333` (Simpson) | **Passed** |
| **TC-EXP-CALC03**| Đạo hàm đệ quy lồng tích phân | `"d/dx(∫(x^2, 0, x), 2)"` | `4` (đệ quy lượng giá) | **Passed** |
| **TC-EXP-CALC04**| Biểu thức PEMDAS tiêu chuẩn | `"2 + 3 * 4"` | `14` | **Passed** |
| **TC-EXP-CALC05**| Căn bậc 3 | `"³√8"` | `2` | **Passed** |
| **TC-EXP-CALC06**| Căn bậc n | `"3 ʸ√x 8"` | `2` | **Passed** |

---

## 5. PHÂN HỆ: BỘ GIẢI PHƯƠNG TRÌNH TÌM X (solveForX)

| Mã Test | Mô tả kịch bản | Biểu thức $f(x)$ đầu vào ($f(x)=0$) | Nghiệm thực tìm thấy | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-SLV01** | Giải phương trình bậc nhất | `"2x - 4"` | `"x = 2"` | **Passed** |
| **TC-SLV02** | Giải phương trình bậc hai | `"x^2 - 9"` | `"x = 3"` hoặc `"x = -3"` | **Passed** |
| **TC-SLV03** | Giải lượng giác ở DEG | `"sin(x) - 0.5"` | `"x = 30"` | **Passed** |
| **TC-SLV04** | Phương trình vô nghiệm thực | `"x^2 + 9"` | Ném lỗi `"Lỗi toán học"` | **Passed** |
| **TC-SLV05** | Lỗi cú pháp biểu thức | `"x +"` | Ném lỗi `"Lỗi cú pháp"` | **Passed** |

---

## 6. PHÂN HỆ: TAB GIẢI PHƯƠNG TRÌNH PHỤ (solveEquation)

| Mã Test | Loại phương trình | Mảng hệ số truyền vào | Nghiệm mong đợi trả về | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-EQ01** | Bậc nhất (`linear`) | `[2, -4]` | `["2"]` | **Passed** |
| **TC-EQ02** | Bậc hai (`quadratic`) | `[1, 0, -9]` | `["3", "-3"]` | **Passed** |
| **TC-EQ03** | Hệ 2 ẩn (`system2`) | `[1, 1, 3, 1, -1, 1]` | `["x = 2", "y = 1"]` | **Passed** |
| **TC-EQ04** | Lỗi: Thiếu hệ số bậc 2 | `[1, 0]` | Ném lỗi `"Hệ số không hợp lệ"` | **Passed** |
| **TC-EQ05** | Lỗi: Thừa hệ số bậc 1 | `[2, -4, 0]` | Ném lỗi `"Hệ số không hợp lệ"` | **Passed** |
| **TC-EQ06** | Lỗi: Loại PT không hỗ trợ | `[1, 2]` (type: `invalid_type`) | Ném lỗi `"Loại phương trình không hỗ trợ"`| **Passed** |
| **TC-EQ07** | Lỗi: Hệ số ko phải mảng | `"not_an_array"` | Ném lỗi `"Hệ số không hợp lệ"` | **Passed** |
| **TC-EQ08** | Lỗi: Hệ số chứa NaN | `[2, NaN]` | Ném lỗi `"Hệ số không hợp lệ"` | **Passed** |
