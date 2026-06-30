# CHI TIẾT CÁC CA KIỂM THỬ TÍCH HỢP (INTEGRATION TEST CASES) - v2.1.2
## TẬP TIN: [calculator.test.js](file:///Users/nam/Desktop/calculator/tests/integration/calculator.test.js)

Tài liệu này tổng hợp chi tiết toàn bộ 111 ca kiểm thử tích hợp giao diện JSDOM trong [calculator.test.js](file:///Users/nam/Desktop/calculator/tests/integration/calculator.test.js).

---

## 1. PHÂN HỆ: XỬ LÝ NHẬP SỐ (handleDigit) - 10 Cases
*   **TC-D01 | Trạng thái lỗi:** Đang ở Error State (`isError = true`) -> gõ số -> Digit bị bỏ qua, màn hình không thay đổi.
*   **TC-D02 | Tiếp tục sau "=" (non-zero):** Nhấn `=`, gõ số khác `0` -> Reset biểu thức cũ và bắt đầu số mới.
*   **TC-D03 | Tiếp tục sau "=" (zero):** Nhấn `=`, gõ số `0` -> reset kết quả hiển thị dưới về `"0"`.
*   **TC-D04 | Nhập số thứ hai sau toán tử (non-zero):** Nhập `5 +`, gõ `3` -> bắt đầu nhập số thứ hai.
*   **TC-D05 | Nhập số thứ hai sau toán tử (zero):** Nhập `5 +`, gõ `0` -> kết quả hiển thị dưới là `"0"`.
*   **TC-D06 | Xử lý số 0 đi đầu (Leading Zero):** Màn hình đang là `"0"`, gõ `7` -> thay thế `"0"` bằng `"7"` (không tạo `"07"`).
*   **TC-D07 | Nhập nhiều số 0:** Màn hình đang là `"0"`, gõ `0` -> giữ nguyên `"0"` (không tạo `"00"`).
*   **TC-D08 | Giới hạn 15 chữ số:** Gõ 16 chữ số `1` -> chữ số thứ 16 bị bỏ qua.
*   **TC-D09 | Đủ 15 chữ số:** Gõ đúng 15 chữ số `3` -> Màn hình nhận đủ 15 chữ số.
*   **TC-D10 | Ghép nối chuỗi:** Gõ tuần tự `1` -> `2` -> `3` -> kết quả hiển thị chuỗi `"123"`.

---

## 2. PHÂN HỆ: XỬ LÝ DẤU THẬP PHÂN (handleDecimalPoint) - 6 Cases
*   **TC-DP01 | Trạng thái lỗi:** Đang lỗi -> nhấn `.` -> Bị bỏ qua.
*   **TC-DP02 | Sau toán tử:** Đang chờ số thứ hai -> nhấn `.` -> hiển thị `"0."`.
*   **TC-DP03 | Sau dấu "=":** Đã có kết quả -> nhấn `.` -> Reset và bắt đầu biểu thức mới với `"0."`.
*   **TC-DP04 | Tránh trùng lặp:** Đã có dấu `.` trong số -> nhấn `.` lần hai -> Bị bỏ qua (chỉ một dấu `.` mỗi toán hạng).
*   **TC-DP05 | Số 0 đi đầu:** Màn hình là `"0"` -> nhấn `.` -> hiển thị `"0."`.
*   **TC-DP06 | Số thực thường:** Màn hình là `"5"` -> nhấn `.` -> hiển thị `"5."`.

---

## 3. PHÂN HỆ: ĐIỀU HƯỚNG TOÁN TỬ (handleOperator) - 11 Cases
*   **TC-OP01 | Trạng thái lỗi:** Đang lỗi -> nhấn toán tử -> Bị bỏ qua.
*   **TC-OP02 | Kế thừa kết quả:** Có kết quả `=` -> nhấn toán tử -> Kết quả trở thành `firstOperand` mới.
*   **TC-OP03 | Reset kết quả dưới:** Có kết quả `=` -> nhấn toán tử -> Dòng kết quả dưới reset về `"0"`.
*   **TC-OP04 | Đè toán tử liên tiếp:** Nhập `5 +`, nhấn `−` -> Ghi đè thành `5 − 0` (giữ `firstOperand`).
*   **TC-OP05 | Thực thi sau khi đè:** Nhập `5 + - 3 =` -> thực hiện đúng phép trừ: `5 − 3 = 2`.
*   **TC-OP06 | Reset kết quả dưới:** Nhấn toán tử nhị phân -> Dòng kết quả dưới reset về `"0"`.
*   **TC-OP07 | Biểu thức dòng trên:** Gõ `523 +` -> Expression hiển thị `"523 + 0"`.
*   **TC-OP08 | Đèn chỉ báo hoạt động:** Bấm `+` -> Phím `+` được kích hoạt highlight class `is-active`.
*   **TC-OP09 | Tắt chỉ báo:** Bấm `5 + 3` -> Tắt highlight khi bắt đầu gõ số thứ hai.
*   **TC-OP10 | Tính liên hoàn (Chain 1):** Bấm `5 + 3 ×` -> Hiển thị `"5 + 3 × 0"`, không tự động tính ra kết quả trung gian (Non-eager PEMDAS).
*   **TC-OP11 | Tính liên hoàn (Chain 2):** Bấm `10 ÷ 2 +` -> Hiển thị `"10 ÷ 2 + 0"`, không tự động tính.

---

## 4. PHÂN HỆ: THỰC THI PHÉP BẰNG (handleEquals) - 14 Cases

### 4.1. Bảng phép tính (FS Output examples)
*   **TC-EQ01 | Phép cộng:** `5 + 3 = 8`
*   **TC-EQ02 | Phép trừ:** `10 − 4 = 6`
*   **TC-EQ03 | Phép nhân:** `7 × 6 = 42`
*   **TC-EQ04 | Phép chia:** `10 ÷ 4 = 2.5`
*   **TC-EQ05 | Khử sai số phập phân:** `0.1 + 0.2` = `0.3` (không bị lỗi dấu phẩy động `0.30000000000000004`).
*   **TC-EQ06 | Làm tròn số thập phân:** `1 ÷ 3` = `0.3333333333` (làm tròn đúng 10 chữ số thập phân).
*   **TC-EQ07 | Số mũ khoa học lớn:** `9 × 999999999999999` $\ge 10^{15}$ -> chuyển sang hiển thị dạng mũ khoa học `e+`.
*   **TC-EQ08 | Hiển thị kết quả âm:** `3 − 7 = -4` (hiển thị đúng dấu âm `"−"`).

### 4.2. Preconditions & Guards
*   **TC-EQ09 | Trạng thái lỗi:** Đang ở Error State -> nhấn `=` -> Bị bỏ qua.
*   **TC-EQ10 | Chưa có toán tử:** Màn hình chỉ có số `"5"` -> nhấn `=` -> Giữ nguyên kết quả hiển thị (không crash).
*   **TC-EQ11 | Chưa nhập số thứ hai:** Bấm `5 +` -> nhấn `=` -> Bị bỏ qua (đang chờ toán hạng 2).
*   **TC-EQ12 | Nhấn "=" liên tiếp:** Nhấn `=` nhiều lần liên tục -> Giữ nguyên kết quả, không lặp lại phép tính.

### 4.3. Display Spec (Đặc tả dòng hiển thị)
*   **TC-EQ13 | Dòng trên kết quả:** Nhập `523 + 47 =` -> Dòng trên giữ nguyên biểu thức đầy đủ `"523 + 47"`.
*   **TC-EQ14 | Dòng trên đang nhập:** Nhập `523 + 4` (chưa bấm bằng) -> Dòng trên hiển thị `"523 + 0"`.

---

## 5. PHÂN HỆ: XỬ LÝ LỖI CHIA CHO 0 (handleDivisionByZero) - 6 Cases
*   **TC-DIV01:** `10 ÷ 0` -> Kích hoạt Error State (`isError = true`).
*   **TC-DIV02:** Dòng dưới hiển thị đúng thông điệp báo lỗi `"Không thể chia cho 0"`.
*   **TC-DIV03:** Dòng trên biểu thức hiển thị rõ `"10 ÷ 0"`.
*   **TC-DIV04 | Khóa số:** Sau khi gặp lỗi chia cho 0, bàn phím số bị vô hiệu hóa.
*   **TC-DIV05 | Khóa toán tử:** Sau khi gặp lỗi chia cho 0, bàn phím toán tử bị vô hiệu hóa.
*   **TC-DIV06 | Khóa decimal:** Sau khi gặp lỗi chia cho 0, phím thập phân `.` bị vô hiệu hóa.

---

## 6. PHÂN HỆ: ĐIỀU KHIỂN AC (handleAllClear) - 4 Cases
*   **TC-AC01 | Reset trạng thái gõ:** Bấm `523 + 4` -> nhấn `AC` -> Xóa sạch biểu thức về rỗng, kết quả về `"0"`.
*   **TC-AC02 | Thoát trạng thái lỗi:** Đang bị khóa lỗi chia cho 0 -> nhấn `AC` -> Khôi phục máy tính về trạng thái bình thường (cách duy nhất).
*   **TC-AC03 | Tính tiếp sau lỗi:** Sau khi bấm `AC` giải phóng lỗi, có thể thực hiện tính toán bình thường.
*   **TC-AC04 | AC sau dấu bằng:** Đã tính xong kết quả `=` -> nhấn `AC` -> Xóa sạch màn hình và reset đúng.

---

## 7. PHÂN HỆ: PHÍM XÓA (handleBackspace) - 8 Cases
*   **TC-BS01 | Chặn sau "=":** Có kết quả `=` -> nhấn `⌫` -> Bị bỏ qua, không xóa kết quả đã tính xong.
*   **TC-BS02 | Chặn khi lỗi:** Đang bị lỗi -> nhấn `⌫` -> Bị bỏ qua.
*   **TC-BS03 | Chặn sau toán tử:** Bấm `5 +` -> nhấn `⌫` -> Bị bỏ qua (giữ nguyên `"5 + 0"`).
*   **TC-BS04 | Xóa số nhiều chữ số:** Chuỗi `"523"` -> nhấn `⌫` -> Xóa số cuối còn `"52"`.
*   **TC-BS05 | Xóa chữ số duy nhất:** Chuỗi `"5"` -> nhấn `⌫` -> Quay về trạng thái mặc định `"0"`.
*   **TC-BS06 | Xóa số thập phân lơ lửng:** Chuỗi `"0."` -> nhấn `⌫` -> Quay về `"0"`.
*   **TC-BS07 | Xóa số thập phân đầy đủ:** Chuỗi `"5.3"` -> nhấn `⌫` -> Còn `"5."`.
*   **TC-BS08 | Xóa lặp lại:** Bấm liên tục `⌫` cho đến khi biểu thức quay về `"0"`.

---

## 8. QUY TẮC NGHIỆP VỤ (BRD Business Rules §6) - 7 Cases
*   **TC-BR01 | Kế thừa toán hạng:** Kết quả tính xong + nhấn toán tử -> kết quả trở thành `firstOperand` mới.
*   **TC-BR02 | Gõ số mới sau bằng:** Kết quả tính xong + gõ số -> xóa biểu thức cũ và bắt đầu biểu thức mới.
*   **TC-BR03 | Giới hạn ký tự:** Giới hạn 15 chữ số mỗi toán hạng.
*   **TC-BR04 | Một dấu thập phân:** Chặn dấu thập phân thứ hai trên cùng một toán hạng.
*   **TC-BR05 | Khóa phím khi lỗi:** Toàn bộ phím số, toán tử, bằng, decimal bị khóa khi có lỗi chia cho 0.
*   **TC-BR06 | Khử sai số phẩy động:** Kiểm tra phép tính `0.1 + 0.2 = 0.3` đạt độ chính xác cao.
*   **TC-BR07 | Hiển thị số âm:** Đảm bảo dấu âm hiển thị đúng dạng `"−"` trước số.

---

## 9. DANH MỤC TÍNH NĂNG (BRD Feature Checklist) - 11 Cases
*   **F-001 | Phép cộng (+):** Thực thi tích hợp nút cộng.
*   **F-002 | Phép trừ (−):** Thực thi tích hợp nút trừ.
*   **F-003 | Phép nhân (×):** Thực thi tích hợp nút nhân.
*   **F-004 | Phép chia (÷):** Thực thi tích hợp nút chia.
*   **F-005 | Số thập phân:** Nhập số thực với dấu thập phân.
*   **F-006 | Kết quả âm:** Phản ánh đúng kết quả âm trên UI.
*   **F-007 | AC xóa toàn bộ:** Trả trạng thái máy tính về mặc định.
*   **F-008 | Backspace ⌫:** Xóa ký tự cuối cùng của số đang gõ.
*   **F-009 | Giới hạn độ dài:** Giới hạn 15 chữ số cho toán hạng.
*   **F-010 | Xử lý lỗi chia cho 0:** Thông báo đúng và vô hiệu hóa phím.
*   **F-011 | Định dạng khoa học:** Kết quả cực lớn hiển thị dạng số mũ.

---

## 10. PHÂN HỆ HẰNG SỐ (handleConstant) - 8 Cases
*   **TC-CONST01 | Số Pi:** Bấm `pi` -> hiển thị giá trị làm tròn `"3.1415926536"`.
*   **TC-CONST02 | Số E:** Bấm `e` -> hiển thị giá trị làm tròn `"2.7182818285"`.
*   **TC-CONST03 | Chặn khi lỗi:** Đang bị lỗi -> bấm hằng số -> Bị bỏ qua.
*   **TC-CONST04 | Kế thừa hằng số:** Sau phép tính `=`, bấm `pi` -> Reset và nạp `pi` làm toán hạng mới.
*   **TC-CONST05 | Làm toán hạng hai:** Gõ `1 ×` -> nhấn `pi` -> Gán `pi` làm toán hạng thứ hai.
*   **TC-CONST06 | Số sau hằng số:** Bấm `pi` -> gõ số `5` -> Bắt đầu số mới hoàn toàn.
*   **TC-CONST07 | Chuỗi hằng số & lượng giác:** Tính `pi` -> nhấn `sin` -> Trả về `0.0548036651` (DEG).
*   **TC-CONST08 | Chuỗi hằng số & log:** Tính `e` -> nhấn `ln` -> Trả về `1`.

---

## 11. HÀM KHOA HỌC (handleUnaryCalculation - Scientific Mode) - 14 Cases
*   **TC-SCI01 | Căn bậc hai:** `sqrt(9) = 3`.
*   **TC-SCI02 | Phần trăm:** `75% = 0.75`.
*   **TC-SCI03 | Trị tuyệt đối:** `abs(-10.5) = 10.5`.
*   **TC-SCI04 | Bình phương:** `5^2 = 25`.
*   **TC-SCI05 | Lập phương:** `3^3 = 27`.
*   **TC-SCI06 | Giai thừa:** `5! = 120`.
*   **TC-SCI07 | Lượng giá giữa dòng:** Nhập toán tử nhị phân -> nhấn unary -> áp dụng unary lên `currentInput` hiện hành.
*   **TC-SCI-ERR01 | Log số 0:** `ln(0)` -> kích hoạt Error State.
*   **TC-SCI-ERR02 | Khóa phím khi log lỗi:** `ln(0)` -> hiển thị thông báo lỗi và khóa bàn phím.
*   **TC-SCI-ERR03 | Giai thừa số âm:** `factorial(-3)` -> kích hoạt Error State.
*   **TC-SCI-ERR04 | Chặn khi lỗi:** Đang bị lỗi -> bấm unary -> Bị bỏ qua.
*   **TC-BR10 | Góc DEG/RAD:** Toggle góc chuyển đổi lượng giác giữa DEG (sin(30)=0.5) và RAD.
*   **TC-BACKSPACE-UNARY:** Nút Backspace xóa hàm Unary lửng lơ.
*   **TC-BR03-v2.1.1 | Giới hạn biểu thức:** Khóa bàn phím khi chuỗi biểu thức tích lũy vượt quá 100 ký tự.

---

## 12. PHÂN SỐ ĐỨNG v2.1.2 (Visual Fraction Input) - 8 Cases
*   **TC-FR01 | Khởi tạo phân số:** Bấm `■/□` -> Chèn `(⬚)/(⬚)` và đặt con trỏ ở tử số (`cursorIndex = 1`).
*   **TC-FR02 | Điền tử số:** Gõ số thay thế `⬚` tử số và dịch chuyển con trỏ ảo.
*   **TC-FR03 | Chọn mẫu số:** Click chuột vào vùng mẫu số di chuyển con trỏ ảo tới mẫu số.
*   **TC-FR04 | Tính toán kết quả:** Gõ mẫu số, bấm `=` -> tính toán ra kết quả phân số đứng chính xác.
*   **TC-FR05 | Xóa ký tự phân số:** Nhấn `⌫` lùi con trỏ và xóa ký tự trong phân số đứng.
*   **TC-FR06 | Tránh văng con trỏ:** Gõ nhiều chữ số vào tử số không bị reset hoặc bị văng ra ngoài cấu trúc.
*   **TC-FR07 | Thoát thông minh:** Bấm phím toán tử khi con trỏ ở cuối phân số tự động nhảy ra ngoài chèn toán tử.
*   **TC-FR08 | Chèn trong tử số:** Bấm phím toán tử khi con trỏ ở giữa tử số vẫn chèn bình thường bên trong tử số.

---

## 13. GIẢI PHƯƠNG TRÌNH TÌM X v2.1.2 (Free Variable x Routing) - 4 Cases
*   **TC-RT01 | PEMDAS thường:** Biểu thức đạo hàm thường `"d/dx(x^2, 2)"` không chứa ẩn x tự do -> Tính ra kết quả `4`.
*   **TC-RT02 | Solver đối số:** Biểu thức `"d/dx(x^2, x)"` chứa ẩn x tự do ở đối số -> kích hoạt Solver giải ra nghiệm thực xấp xỉ `0`.
*   **TC-RT03 | Solver cận:** Biểu thức `"∫(x^2, 0, x)"` chứa ẩn x tự do ở cận -> kích hoạt Solver giải ra nghiệm thực xấp xỉ `0`.
*   **TC-RT04 | Solver đại số:** Biểu thức `"x^2 - 4"` chứa ẩn x tự do ngoài hàm giải tích -> kích hoạt Solver giải ra nghiệm thực `"x = 2"` hoặc `"x = -2"`.
