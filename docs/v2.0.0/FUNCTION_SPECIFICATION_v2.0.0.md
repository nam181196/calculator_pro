# MODULE FUNCTIONAL SPECIFICATION - Simple Calculator Web App

| Information | Details |
| :--- | :--- |
| **Project** | Simple Calculator Web App |
| **Module** | Core API Services |
| **Version** | v2.0.0 |
| **Last Updated** | 2026-06-09 |
| **Status** | DRAFT |
| **Author** | Nam (Product Owner & Developer) |

---

## REVISION HISTORY
| Version | Date | Updated By | Description |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-05-31 | Nam | Đặc tả các chức năng v1.0.0 dạng cũ (quá dài, trùng lặp nhiều phần) |
| 2.0.0 | 2026-06-09 | Nam | Tái cấu trúc hoàn toàn sang dạng Đặc tả API/SDK Services theo định dạng template chuẩn |

---

# MODULE 1: CALCULATOR ENGINE SERVICE

Cung cấp các API tính toán toán học cốt lõi (cơ bản và khoa học đơn phân) cho ứng dụng máy tính.

## [FUNCTION] Tính toán hai toán hạng
Label: [Engine.performCalculation]

API: POST /engine/calculate

---

### [SECTION] Business Description
Thực hiện các phép toán cơ bản hai toán hạng gồm cộng, trừ, nhân, chia, lũy thừa (x^y) và căn bậc n của x. Làm tròn để triệt tiêu sai số dấu phẩy động.

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Các toán hạng đầu vào phải biểu diễn số thực hợp lệ.

---

### [SECTION] Main Flow
1. Tiếp nhận yêu cầu tính toán tại `/engine/calculate` với body chứa hai số thực và một toán tử.
2. Kiểm tra điều kiện chia cho 0:
   - Nếu toán tử là `"÷"` và số thứ hai bằng `0`.
   - Trả lại mã trạng thái `400 Bad Request` kèm thông điệp báo lỗi `"Không thể chia cho 0"`.
3. Kiểm tra các điều kiện không xác định của căn bậc n (`ʸ√x`):
   - Nếu số thứ nhất (bậc căn) bằng `0` (không tồn tại căn bậc 0).
   - Hoặc số thứ nhất (bậc căn) là số chẵn và số thứ hai (số dưới căn) nhỏ hơn `0` (số ảo).
   - Trả lại mã trạng thái `400 Bad Request` kèm thông điệp báo lỗi `"Lỗi toán học"`.
4. Tính toán kết quả tương ứng theo toán tử.
5. Đảm bảo kết quả là một số hợp lệ (không phải `NaN` hoặc `Infinity`). Nếu không hợp lệ, trả lại mã `400 Bad Request` với `"Lỗi toán học"`.
6. Thực hiện định dạng kết quả:
   - Nếu kết quả $|value| \ge 10^{15}$ hoặc $|value| < 10^{-9}$ (ngoại trừ 0), định dạng theo số mũ ký hiệu khoa học (`toExponential(10)`).
   - Ngược lại, làm tròn tối đa 10 chữ số thập phân (`toFixed(10)`), triệt tiêu sai số nổi (`toPrecision(14)`).
7. Trả về kết quả JSON thành công `200 OK`.

---

### [SECTION] Business Rules
- **Lỗi chia cho 0:** Bẫy lỗi và trả về mã lỗi rõ ràng để hệ thống khóa các phím bấm ở giao diện (BR-05).
- **Làm tròn số thập phân:** Triệt tiêu sai số dấu phẩy động thập phân của Javascript (BR-06).
- **Ký hiệu khoa học:** Tự động chuyển đổi sang dạng số mũ lũy thừa khi số vượt quá giới hạn hiển thị 15 chữ số phần nguyên (BR-09).

---

### [SECTION] Side Effects
- None

---

### [SECTION] Input

**Body:**
```json
{
  "operand1": "523",
  "operator": "+",
  "operand2": "47"
}
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": "success",
  "result": "570"
}
```

---

### [SECTION] Error Codes
- 400 - Bad Request
  ```json
  {
    "status": "error",
    "message": "Không thể chia cho 0"
  }
  ```

---

## [FUNCTION] Tính toán một toán hạng khoa học
Label: [Engine.performUnaryCalculation]

API: POST /engine/calculate-unary

---

### [SECTION] Business Description
Tính toán các hàm toán học nâng cao một toán hạng (Scientific Mode) gồm phần trăm, lượng giác, logarithm, bình phương, căn thức và giai thừa. Các kết quả tính toán này được trì hoãn và chỉ thực thi khi người dùng nhấn dấu `=` hoặc thực hiện chuỗi tính toán liên tiếp, chuẩn bị cho Expression Parser ở phiên bản sau.

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- Đầu vào phải biểu diễn số thực hợp lệ.

---

### [SECTION] Main Flow
1. Tiếp nhận yêu cầu tính toán tại `/engine/calculate-unary` với body chứa giá trị số thực, tên hàm lượng giác/logarithm và đơn vị góc.
2. Kiểm tra miền xác định của các hàm:
   - **Logarithm (`ln`, `log`):** Giá trị đầu vào phải $> 0$.
   - **Giai thừa (`n!`):** Giá trị đầu vào phải là số nguyên không âm và $\le 170$.
   - **Căn bậc hai ($\sqrt{x}$):** Giá trị đầu vào phải $\ge 0$.
   - **Lượng giác ngược (`asin`, `acos`):** Giá trị đầu vào phải nằm trong đoạn $[-1, 1]$.
3. Nếu vi phạm, trả lại mã trạng thái `400 Bad Request` kèm thông báo lỗi thích hợp.
4. Thực hiện chuyển đổi hệ góc:
   - Đối với hàm lượng giác (`sin`, `cos`, `tan`): Nếu đơn vị góc là `'DEG'`, đổi từ góc sang radian trước khi dùng hàm Javascript.
   - Đối với hàm lượng giác ngược: Nếu đơn vị góc là `'DEG'`, đổi kết quả radian thu được sang góc độ.
5. Định dạng kết quả thông qua hàm làm tròn hoặc đổi sang số mũ khoa học giống như phép toán 2 toán hạng.
6. Trả lại kết quả thành công `200 OK`.

---

### [SECTION] Business Rules
- **Đơn vị góc lượng giác:** Đơn vị góc (DEG/RAD) quyết định trực tiếp hệ số đổi lượng giác trước khi xử lý (BR-10).
- **Lỗi hàm khoa học:** Các lỗi vi phạm miền xác định trả về `"Lỗi toán học"` hoặc `"Lỗi tính toán"` (BR-11).

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

# MODULE 2: AUTHENTICATION SERVICE

Cung cấp các API xác thực người dùng để đồng bộ dữ liệu đám mây qua Firebase Authentication.

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

Cung cấp các API lưu trữ lịch sử phép tính và đồng bộ hóa đám mây (Cloud Sync) giữa localStorage và Cloud Firestore.

## [FUNCTION] Lưu mới phép tính
Label: [StorageService.saveHistoryEntry]

API: POST /history

---

### [SECTION] Business Description
Ghi nhận một phép toán vừa hoàn thành vào lịch sử cục bộ (Tier 1) và Firestore (Tier 2).

---

### [SECTION] Actor
- Controller / Client UI

---

### [SECTION] Preconditions
- None

---

### [SECTION] Main Flow
1. Nhận đối tượng phép tính tại `/history`.
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

---

### [SECTION] Side Effects
- Ghi dữ liệu vào `localStorage` của trình duyệt.
- Tạo document mới trên Firebase Firestore.

---

### [SECTION] Input

**Body:**
```json
{
  "expression": "sin(90)",
  "result": "1",
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
    "expression": "sin(90)",
    "result": "1",
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
      "expression": "sin(90)",
      "result": "1",
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
      "expression": "sin(90)",
      "result": "1",
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
