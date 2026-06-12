# MODULE FUNCTIONAL SPECIFICATION - Simple Calculator Web App

| Information    | Details                         |
| :------------- | :------------------------------ |
| **Project**    | Simple Calculator Web App       |
| **Module**     | Calculator Core                 |
| **Version**    | v1.0.0                          |
| **Last Updated** | 2026-05-31                    |
| **Status**     | DRAFT                           |
| **Author**     | Nam (Product Owner & Developer) |

---

## REVISION HISTORY

| Version | Date       | Updated By | Description       |
| :------ | :--------- | :--------- | :---------------- |
| 1.0.0   | 2026-05-31 | Nam        | Initial version   |

---

# MODULE 1: INPUT HANDLING

## [FUNCTION] Nhập chữ số
Label: [EventController.handleDigit]

Handler: click (button.digit) | keydown (key: 0–9)

---

### [SECTION] Business Description
Người dùng bấm một chữ số (0–9) bằng nút giao diện hoặc bàn phím. Chữ số được nối vào cuối chuỗi số đang nhập và hiển thị lên dòng dưới màn hình.

---

### [SECTION] Actor
- Người dùng

---

### [SECTION] Preconditions
- Ứng dụng không đang ở trạng thái lỗi (`isError = false`).
- Số đang nhập chưa đạt giới hạn 15 chữ số.

---

### [SECTION] Main Flow
1. Nhận sự kiện click nút số hoặc keydown với key `0`–`9`.
2. Kiểm tra độ dài chuỗi đang nhập — nếu đã đủ 15 ký tự thì bỏ qua.
3. Nếu `shouldResetNext = true`: xóa toàn bộ state, bắt đầu phép tính mới.
4. Nối chữ số vào cuối `currentInput`.
5. Gọi `View.updateDisplay(state)` để cập nhật dòng dưới màn hình.

---

### [SECTION] Business Rules
- Nếu `currentInput = "0"` và chữ số nhập vào khác `0`: thay thế `"0"` bằng chữ số mới (không tạo ra `"07"`).
- Nếu `currentInput = "0"` và chữ số nhập vào là `0`: giữ nguyên `"0"`, không tạo `"00"`.
- Tối đa **15 chữ số** mỗi toán hạng. Vượt giới hạn → bỏ qua, không có thông báo lỗi.

---

### [SECTION] Side Effects
- Cập nhật `firstOperand` hoặc `secondOperand` trong Engine state (tùy giai đoạn nhập).

---

### [SECTION] Input

**Event trigger:**
- Click: `button[data-digit]`
- Keydown: `key = "0"` đến `"9"`

---

### [SECTION] Output

**Màn hình:**
- Dòng dưới: chuỗi số đang nhập cập nhật real-time.
- Dòng trên: không thay đổi.

**Ví dụ:**
```
Bấm: 5 → 2 → 3
Dòng dưới: "523"
```

---

### [SECTION] Error Codes
- Không có. Trường hợp vượt giới hạn hoặc ở Error State → bỏ qua lặng lẽ.

---

## [FUNCTION] Nhập dấu thập phân
Label: [EventController.handleDecimalPoint]

Handler: click (button.decimal) | keydown (key: ".")

---

### [SECTION] Business Description
Người dùng bấm nút `.` để bắt đầu phần thập phân của số đang nhập. Mỗi toán hạng chỉ được phép có một dấu chấm.

---

### [SECTION] Actor
- Người dùng

---

### [SECTION] Preconditions
- Ứng dụng không đang ở Error State.
- Số đang nhập chưa chứa dấu `.`.

---

### [SECTION] Main Flow
1. Nhận sự kiện click nút `.` hoặc keydown với key `"."`.
2. Kiểm tra `currentInput` đã chứa dấu `.` chưa — nếu rồi thì bỏ qua.
3. Nếu `currentInput` rỗng hoặc bằng `"0"`: đặt `currentInput = "0."`.
4. Ngược lại: nối `.` vào cuối `currentInput`.
5. Gọi `View.updateDisplay(state)`.

---

### [SECTION] Business Rules
- Mỗi toán hạng **chỉ có một dấu `.`**. Bấm thêm lần hai → bỏ qua.
- Bấm `.` khi chưa nhập số nào → tự động hiển thị `"0."`.

---

### [SECTION] Side Effects
- Cập nhật `firstOperand` hoặc `secondOperand`.

---

### [SECTION] Input

**Event trigger:**
- Click: `button[data-decimal]`
- Keydown: `key = "."`

---

### [SECTION] Output

**Màn hình:**
- Dòng dưới: hiển thị số kèm dấu chấm, ví dụ `"5."` hoặc `"0."`.

---

### [SECTION] Error Codes
- Không có.

---

# MODULE 2: OPERATOR HANDLING

## [FUNCTION] Chọn toán tử
Label: [EventController.handleOperator]

Handler: click (button.operator) | keydown (key: +, -, *, /)

---

### [SECTION] Business Description
Người dùng bấm một trong 4 toán tử (`+`, `−`, `×`, `÷`). Hành động này xác nhận số thứ nhất và đặt toán tử chờ nhập số thứ hai.

---

### [SECTION] Actor
- Người dùng

---

### [SECTION] Preconditions
- `firstOperand` không rỗng (đã nhập ít nhất một số).

---

### [SECTION] Main Flow
1. Nhận sự kiện click nút toán tử hoặc keydown với key `+`, `-`, `*`, `/`.
2. Lưu giá trị hiện tại vào `firstOperand`.
3. Lưu `operator`.
4. Xóa `currentInput`, sẵn sàng nhận `secondOperand`.
5. Gọi `View.updateDisplay(state)`.

---

### [SECTION] Business Rules
- Nếu bấm toán tử **sau khi đã có kết quả** (`shouldResetNext = true`): kết quả hiện tại trở thành `firstOperand` — tiếp tục tính không reset.
- Nếu bấm **toán tử liên tiếp** (ví dụ: `5 + −`): toán tử mới ghi đè toán tử cũ, `firstOperand` giữ nguyên.

---

### [SECTION] Side Effects
- Cập nhật `operator` và `firstOperand` trong Engine state.

---

### [SECTION] Input

**Event trigger:**
- Click: `button[data-operator]` với `data-operator` = `"+"` | `"-"` | `"×"` | `"÷"`
- Keydown: `key = "+"` | `"-"` | `"*"` | `"/"`

---

### [SECTION] Output

**Màn hình:**
- Dòng trên: `"[firstOperand] [operator]"` — ví dụ: `"523 +"`.
- Dòng dưới: xóa về `"0"`, chờ nhập số tiếp theo.

---

### [SECTION] Error Codes
- Nếu `firstOperand` rỗng → bỏ qua, không làm gì.

---

# MODULE 3: CALCULATION

## [FUNCTION] Thực hiện phép tính
Label: [EventController.handleEquals]

Handler: click (button#equals) | keydown (key: Enter | "=")

---

### [SECTION] Business Description
Người dùng bấm `=` để yêu cầu tính toán. Engine thực hiện phép tính từ `firstOperand`, `operator`, `secondOperand` và hiển thị kết quả.

---

### [SECTION] Actor
- Người dùng

---

### [SECTION] Preconditions
- `firstOperand`, `operator`, và `secondOperand` đều không rỗng.

---

### [SECTION] Main Flow
1. Nhận sự kiện click `=` hoặc keydown `Enter`.
2. Gọi `Engine.calculate(firstOperand, operator, secondOperand)`.
3. Làm tròn kết quả tối đa 10 chữ số thập phân.
4. Nếu kết quả vượt 15 chữ số → chuyển sang ký hiệu khoa học.
5. Nếu kết quả là `Infinity` hoặc `NaN` → chuyển sang Error State.
6. Cập nhật dòng trên: biểu thức đầy đủ `"[a] [op] [b]"`.
7. Cập nhật dòng dưới: kết quả.
8. Đặt `shouldResetNext = true`.

---

### [SECTION] Business Rules
- Kết quả làm tròn tối đa **10 chữ số thập phân**: `0.1 + 0.2 = 0.3` (không phải `0.30000000000000004`).
- `÷ 0` → vào Error State (xem Function bên dưới).
- Bấm `=` nhiều lần liên tiếp → chỉ hiển thị lại kết quả, **không** lặp lại phép tính.

---

### [SECTION] Side Effects
- `shouldResetNext = true`.
- State cũ (`firstOperand`, `operator`, `secondOperand`) được giữ cho đến khi người dùng bấm tiếp.

---

### [SECTION] Input

**Event trigger:**
- Click: `button#equals`
- Keydown: `key = "Enter"` hoặc `key = "="`

---

### [SECTION] Output

**Thành công:**
```
Dòng trên: "523 + 47"
Dòng dưới: "570"
```

**Bảng ví dụ kết quả:**

| Phép tính           | Kết quả hiển thị     |
| :------------------ | :------------------- |
| `5 + 3`             | `8`                  |
| `10 − 4`            | `6`                  |
| `7 × 6`             | `42`                 |
| `10 ÷ 4`            | `2.5`                |
| `0.1 + 0.2`         | `0.3`                |
| `1 ÷ 3`             | `0.3333333333`       |
| `9 × 9999999999999` | `8.999999999999e+13` |

---

### [SECTION] Error Codes
- Chia cho 0 → chuyển sang Error State.
- Kết quả `Infinity` / `NaN` → chuyển sang Error State.

---

## [FUNCTION] Xử lý lỗi chia cho 0
Label: [Engine.handleDivisionByZero]

Handler: Tự động kích hoạt bởi Engine khi phát hiện ÷ 0

---

### [SECTION] Business Description
Khi phép chia có mẫu số bằng 0, ứng dụng chuyển sang Error State, hiển thị thông báo lỗi và khóa toàn bộ input cho đến khi người dùng nhấn AC.

---

### [SECTION] Actor
- Hệ thống (tự động)

---

### [SECTION] Preconditions
- `operator = "÷"` và `secondOperand = "0"`.

---

### [SECTION] Main Flow
1. Engine phát hiện điều kiện chia cho 0.
2. Đặt `isError = true`.
3. View hiển thị thông báo lỗi trên dòng dưới.
4. Dòng trên hiển thị biểu thức: `"[a] ÷ 0"`.
5. Vô hiệu hóa toàn bộ phím trừ AC.

---

### [SECTION] Business Rules
- Khi `isError = true`: **chỉ AC hoạt động**. Mọi phím khác bị bỏ qua.
- Sau khi nhấn AC: thoát Error State, về `"0"`.

---

### [SECTION] Side Effects
- `isError = true` trong Engine state.

---

### [SECTION] Input
- Không có input trực tiếp từ người dùng — được gọi nội bộ bởi `handleEquals`.

---

### [SECTION] Output

```
Dòng trên: "10 ÷ 0"
Dòng dưới: "Không thể chia cho 0"
```

---

### [SECTION] Error Codes
- N/A (chính function này xử lý lỗi)

---

# MODULE 4: DISPLAY CONTROL

## [FUNCTION] Xóa toàn bộ (AC)
Label: [EventController.handleAllClear]

Handler: click (button#ac) | keydown (key: Escape)

---

### [SECTION] Business Description
Người dùng bấm AC để reset toàn bộ ứng dụng về trạng thái ban đầu. Hoạt động ở mọi trạng thái, kể cả Error State.

---

### [SECTION] Actor
- Người dùng

---

### [SECTION] Preconditions
- Không có. AC hoạt động ở mọi trạng thái.

---

### [SECTION] Main Flow
1. Nhận sự kiện click `AC` hoặc keydown `Escape`.
2. Reset toàn bộ Engine state: `firstOperand = ""`, `operator = null`, `secondOperand = ""`, `shouldResetNext = false`, `isError = false`.
3. Gọi `View.updateDisplay()` → dòng dưới về `"0"`, dòng trên về trống.

---

### [SECTION] Business Rules
- AC là hành động **không thể hủy** — mọi dữ liệu đang nhập bị mất ngay lập tức.
- AC thoát được **Error State** — đây là cách duy nhất để thoát.

---

### [SECTION] Side Effects
- Toàn bộ Engine state được reset về giá trị khởi tạo.

---

### [SECTION] Input

**Event trigger:**
- Click: `button#ac`
- Keydown: `key = "Escape"`

---

### [SECTION] Output

```
Dòng trên: (trống)
Dòng dưới: "0"
```

---

### [SECTION] Error Codes
- Không có.

---

## [FUNCTION] Xóa ký tự cuối (⌫)
Label: [EventController.handleBackspace]

Handler: click (button#backspace) | keydown (key: Backspace)

---

### [SECTION] Business Description
Người dùng bấm ⌫ để xóa chữ số cuối cùng của số đang nhập. Chỉ hoạt động trong giai đoạn nhập số, không hoạt động sau khi đã nhấn `=`.

---

### [SECTION] Actor
- Người dùng

---

### [SECTION] Preconditions
- Đang trong giai đoạn nhập số (`shouldResetNext = false`).
- Ứng dụng không đang ở Error State.

---

### [SECTION] Main Flow
1. Nhận sự kiện click `⌫` hoặc keydown `Backspace`.
2. Kiểm tra điều kiện: nếu `shouldResetNext = true` hoặc `isError = true` → bỏ qua.
3. Xóa ký tự cuối của `currentInput`.
4. Nếu `currentInput` trở thành rỗng sau khi xóa → đặt về `"0"`.
5. Gọi `View.updateDisplay(state)`.

---

### [SECTION] Business Rules
- Xóa ký tự cuối khi chỉ còn 1 ký tự → về `"0"`.
- **Không hoạt động** sau khi nhấn `=` (kết quả không thể sửa bằng ⌫).
- **Không hoạt động** khi đang ở Error State.

---

### [SECTION] Side Effects
- Cập nhật `firstOperand` hoặc `secondOperand` trong Engine state.

---

### [SECTION] Input

**Event trigger:**
- Click: `button#backspace`
- Keydown: `key = "Backspace"`

---

### [SECTION] Output

```
Trước: "523" → Sau: "52"
Trước: "5"   → Sau: "0"
Trước: "0."  → Sau: "0"
Trước: "5.3" → Sau: "5."
```

---

### [SECTION] Error Codes
- Nếu `shouldResetNext = true` hoặc `isError = true` → bỏ qua lặng lẽ.

---

# MODULE 5: KEYBOARD SUPPORT

## [FUNCTION] Xử lý input bàn phím
Label: [EventController.handleKeydown]

Handler: keydown (document level)

---

### [SECTION] Business Description
Toàn bộ chức năng calculator có thể sử dụng hoàn toàn bằng bàn phím mà không cần chuột. Event listener được gắn ở cấp `document` để bắt mọi tổ hợp phím.

---

### [SECTION] Actor
- Người dùng

---

### [SECTION] Preconditions
- Trang web đang được focus (không có input field nào khác đang active).

---

### [SECTION] Main Flow
1. Lắng nghe sự kiện `keydown` ở `document`.
2. Xác định phím được nhấn.
3. Ánh xạ sang hành động tương ứng và gọi handler.
4. Gọi `event.preventDefault()` với các phím có hành vi mặc định của trình duyệt (phím `/`).

---

### [SECTION] Business Rules
- Phím `/` phải gọi `event.preventDefault()` để ngăn trình duyệt mở Quick Find.
- Chỉ xử lý phím khi không có element nào khác đang được focus.

---

### [SECTION] Side Effects
- Mỗi phím kích hoạt đúng function handler tương ứng — hiệu ứng hoàn toàn giống như click nút trên giao diện.

---

### [SECTION] Input

**Keyboard Mapping:**

| Phím              | Tương đương nút | Function được gọi          |
| :---------------- | :-------------- | :------------------------- |
| `0` – `9`         | Nút số          | `handleDigit`              |
| `.`               | Nút `.`         | `handleDecimalPoint`       |
| `+`               | Nút `+`         | `handleOperator("+")`      |
| `-`               | Nút `−`         | `handleOperator("-")`      |
| `*`               | Nút `×`         | `handleOperator("×")`      |
| `/`               | Nút `÷`         | `handleOperator("÷")`      |
| `Enter` hoặc `=`  | Nút `=`         | `handleEquals`             |
| `Backspace`       | Nút `⌫`         | `handleBackspace`          |
| `Escape`          | Nút `AC`        | `handleAllClear`           |

---

### [SECTION] Output
- Giống như kết quả của function handler tương ứng được gọi.

---

### [SECTION] Error Codes
- Phím không thuộc mapping → bỏ qua, không có hiệu ứng.

---

# NOTES

- Mỗi function là **độc lập và tự giải thích** — đọc một function không cần đọc các function khác.
- Tài liệu này là nền tảng trực tiếp để implement `calculator.js` (tham chiếu SAD Section 5.2).
- Thứ tự ưu tiên implement gợi ý: Module 3 → Module 2 → Module 1 → Module 4 → Module 5.
- Để convert sang test cases: mỗi dòng trong `[SECTION] Business Rules` và `[SECTION] Error Codes` là một test case độc lập.

---

END OF DOCUMENT
