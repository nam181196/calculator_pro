# BẢNG RÀ SOÁT TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA CHECKLIST)
## DỰ ÁN: SIMPLE CALCULATOR WEB APP (v1.0.0 -> v2.1.2)

Tài liệu này dùng để đối chiếu chi tiết 100% giữa các yêu cầu nghiệp vụ (BRD), quy tắc nghiệp vụ (Business Rules) và các ca kiểm thử tự động tương ứng nhằm đảm bảo sản phẩm bàn giao đạt chất lượng tuyệt đối trước khi nghiệm thu.

---

## 1. PHẦN A: ĐỐI CHIẾU DANH MỤC TÍNH NĂNG (FEATURES CHECKLIST)

### Giai đoạn 1 (v1.0.0): Máy tính cơ bản (MVP)
*   [x] **F-001 | Phép cộng (+)**
    *   *Tiêu chí:* Tính đúng tổng 2 số thực, xử lý dấu thập phân và số âm.
    *   *Mã Test Case bao phủ:* `TC-ENG01` (Unit), `TC-EQ01` (Integration), `TC-E02` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-002 | Phép trừ (−)**
    *   *Tiêu chí:* Tính đúng hiệu 2 số thực, hiển thị dấu trừ `"−"` chuẩn.
    *   *Mã Test Case bao phủ:* `TC-ENG02` (Unit), `TC-EQ02` (Integration), `TC-E03` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-003 | Phép nhân (×)**
    *   *Tiêu chí:* Tính đúng tích 2 số thực.
    *   *Mã Test Case bao phủ:* `TC-ENG03` (Unit), `TC-EQ03` (Integration), `TC-E04` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-004 | Phép chia (÷)**
    *   *Tiêu chí:* Tính đúng thương 2 số thực, làm tròn tối đa 10 chữ số thập phân.
    *   *Mã Test Case bao phủ:* `TC-ENG04` (Unit), `TC-EQ04` (Integration), `TC-E05` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-005 | Số thập phân**
    *   *Tiêu chí:* Cho phép nhập dấu thập phân, chặn dấu thập phân thứ hai trên cùng một số.
    *   *Mã Test Case bao phủ:* `TC-DP01` -> `TC-DP06` (Integration), `TC-E06` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-006 | Kết quả âm**
    *   *Tiêu chí:* Hiển thị đúng dấu trừ âm khi kết quả phép tính $<0$.
    *   *Mã Test Case bao phủ:* `TC-EQ08` (Integration), `TC-E08` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-007 | AC xóa toàn bộ**
    *   *Tiêu chí:* Reset toàn bộ trạng thái nhập, biểu thức và thoát khỏi Error State.
    *   *Mã Test Case bao phủ:* `TC-AC01` -> `TC-AC04` (Integration), `TC-E09`, `TC-E10` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-008 | Phím xóa lùi ⌫**
    *   *Tiêu chí:* Xóa chữ số cuối cùng đang gõ, chặn xóa khi đã tính xong hoặc bị lỗi.
    *   *Mã Test Case bao phủ:* `TC-BS01` -> `TC-BS08` (Integration), `TC-E12`, `TC-E13` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-009 | Giới hạn 15 chữ số**
    *   *Tiêu chí:* Khóa không cho nhập thêm chữ số thứ 16 trên một toán hạng.
    *   *Mã Test Case bao phủ:* `TC-D08`, `TC-D09` (Integration), `TC-E15` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-010 | Xử lý lỗi chia cho 0**
    *   *Tiêu chí:* Hiện cảnh báo `"Không thể chia cho 0"`, khóa bàn phím và chỉ mở khi bấm `AC`.
    *   *Mã Test Case bao phủ:* `TC-ENG05` (Unit), `TC-DIV01` -> `TC-DIV06` (Integration), `TC-E16`, `TC-E17` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)

### Giai đoạn 2 (v2.0.0): Scientific Mode & Cloud Sync
*   [x] **F-011 | Định dạng khoa học (e+)**
    *   *Tiêu chí:* Kết quả phép tính cực lớn ($\ge 10^{15}$) tự động chuyển sang số mũ.
    *   *Mã Test Case bao phủ:* `TC-FMT03` (Unit), `TC-EQ07` (Integration), `TC-E18` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-012 | Bàn phím vật lý**
    *   *Tiêu chí:* Nhận diện phím số, toán tử, Enter (`=`), Esc (`AC`), Backspace từ bàn phím vật lý.
    *   *Mã Test Case bao phủ:* `TC-E19` -> `TC-E24` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-013 | Phím Unary khoa học**
    *   *Tiêu chí:* Tính đúng căn bậc 2, bình phương, lập phương, trị tuyệt đối, phần trăm.
    *   *Mã Test Case bao phủ:* `TC-UNY23` -> `TC-UNY27`, `TC-UNY34`, `TC-UNY35` (Unit), `TC-SCI01` -> `TC-SCI05` (Integration)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-014 | DEG/RAD Toggle**
    *   *Tiêu chí:* Đổi chế độ góc cho hàm lượng giác, trả kết quả đúng theo đơn vị được chọn.
    *   *Mã Test Case bao phủ:* `TC-UNY01` -> `TC-UNY17` (Unit), `TC-BR10` (Integration), `TC-E32` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-015 | Đổi Theme tối/sáng**
    *   *Tiêu chí:* Chuyển đổi giao diện Light/Dark mode mượt mà, lưu cấu hình vào Local Storage.
    *   *Mã Test Case bao phủ:* `TC-E31` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-016 | Lịch sử cục bộ**
    *   *Tiêu chí:* Lưu trữ tối đa 20 phép tính gần nhất vào Local Storage, hỗ trợ click để khôi phục.
    *   *Mã Test Case bao phủ:* `TC-E33` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-017 | Xác thực Firebase Auth**
    *   *Tiêu chí:* Cho phép đăng ký, đăng nhập, bảo lưu trạng thái phiên làm việc (Mock Auth fallback).
    *   *Mã Test Case bao phủ:* `TC-E34` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-018 | Đồng bộ đám mây (Cloud Sync)**
    *   *Tiêu chí:* Tự động đồng bộ lịch sử lên Firebase Firestore khi online, lưu hàng đợi ngoại tuyến khi offline.
    *   *Mã Test Case bao phủ:* `TC-E34` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)

### Giai đoạn 3 & 4 (v2.1.0 -> v2.1.2): Advanced Parser & Solver v2.1.2
*   [x] **F-019 | Phím ảo/cứng ẩn x**
    *   *Tiêu chí:* Thêm phím ảo `x` và nhận phím cứng `x`/`X` để nhập ẩn biến tự do trên màn hình chính.
    *   *Mã Test Case bao phủ:* `TC-E37` (Phím ảo), `TC-E38` (Phím cứng) (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-020 | Bộ giải phương trình Newton-Raphson**
    *   *Tiêu chí:* Giải phương trình dạng `Biểu thức = 0` trên màn hình chính, hội tụ nhanh, báo lỗi nếu vô nghiệm thực.
    *   *Mã Test Case bao phủ:* `TC-SLV01` -> `TC-SLV05` (Unit), `TC-RT01` -> `TC-RT04` (Integration), `TC-E37`, `TC-E38` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)
*   [x] **F-021 | Nút nhập phân số trực quan (■/□)**
    *   *Tiêu chí:* Chèn cấu trúc `(⬚)/(⬚)`, hỗ trợ con trỏ ảo điền tử/mẫu số và tự động thoát phân số.
    *   *Mã Test Case bao phủ:* `TC-FR01` -> `TC-FR08` (Integration), `TC-E39`, `TC-E40` (E2E)
    *   *Trạng thái:* 🟢 ĐẠT (Passed)

---

## 2. PHẦN B: ĐỐI CHIẾU QUY TẮC NGHIỆP VỤ (BUSINESS RULES CHECKLIST)

*   [x] **BR-01 | Kế thừa toán hạng:** Kết quả trước đó tự động làm toán hạng 1 cho toán tử nhị phân gõ tiếp theo $\rightarrow$ **ĐẠT** (`TC-BR01`, `TC-E25`).
*   [x] **BR-02 | Reset gõ số mới:** Gõ số mới sau khi nhấn `=` sẽ xóa sạch phép tính cũ $\rightarrow$ **ĐẠT** (`TC-BR02`, `TC-E26`).
*   [x] **BR-03 | Giới hạn độ dài biểu thức:** Khóa không cho nhập biểu thức vượt quá 100 ký tự $\rightarrow$ **ĐẠT** (`TC-BR03-v2.1.1`).
*   [x] **BR-06 | Khử sai số phẩy động:** Kết hợp làm tròn dấu phẩy động cho các phép tính nhạy cảm như `0.1 + 0.2` $\rightarrow$ **ĐẠT** (`TC-BR06`, `TC-E07`).
*   [x] **BR-09 | Số thập phân cực nhỏ:** Chuyển sang scientific notation dạng `e-` nếu giá trị dương nhỏ hơn $10^{-9}$ $\rightarrow$ **ĐẠT** (`TC-FMT04`, `TC-E36`).
*   [x] **BR-10 | Lượng giác lượng giá góc:** Lượng giá đúng giá trị lượng giác theo DEG hoặc RAD tại thời điểm tính $\rightarrow$ **ĐẠT** (`TC-BR10`, `TC-E32`).
*   [x] **BR-11 | Lỗi toán học hàm khoa học:** Báo lỗi `"Lỗi toán học"` đối với các miền giá trị không xác định như $ln(0)$, $asin(2)$, $171!$ $\rightarrow$ **ĐẠT** (`TC-SCI-ERR01` -> `TC-SCI-ERR03`, `TC-E35`).
*   [x] **BR-14 | Xử lý biến tự do x (Newton-Raphson):** Tự động phát hiện biến `x` ngoài hàm giải tích, chạy lặp 100 vòng tìm nghiệm, báo lỗi nếu không hội tụ $\rightarrow$ **ĐẠT** (`TC-RT02` -> `TC-RT04`, `TC-SLV04`).
*   [x] **BR-21 | Nhập phân số trực quan:** Tự đặt con trỏ ở tử số, click để chuyển vùng nhập tử/mẫu, xóa lùi khôi phục `⬚`, gõ toán tử tự động thoát phân số $\rightarrow$ **ĐẠT** (`TC-FR01` -> `TC-FR08`, `TC-E40`).

---

## 3. PHẦN C: ĐỐI CHIẾU TIÊU CHÍ PHI CHỨC NĂNG (NON-FUNCTIONAL NFR CHECKLIST)

*   [x] **NFR-01 | Thời gian phản hồi tính toán (< 100ms):**
    *   *Yêu cầu:* Tích phân, đạo hàm và Solver Newton-Raphson trả kết quả nhanh chóng.
    *   *Kết quả thực tế:* Đo lường hiệu năng thực tế đạt $< 80ms$ cho Solver và $< 10ms$ cho PEMDAS $\rightarrow$ **ĐẠT** (mục 5 Báo cáo tổng hợp).
*   [x] **NFR-02 | Hoạt động Offline-First:**
    *   *Yêu cầu:* Trang tải tức thì và tính toán được khi ngắt mạng internet.
    *   *Kết quả thực tế:* Tải trang qua cache $< 100ms$, toàn bộ logic toán học chạy hoàn toàn ở phía client (JSDOM/Client-side Engine) $\rightarrow$ **ĐẠT** (mục 5 Báo cáo tổng hợp).
*   [x] **NFR-03 | An toàn bảo mật (Security):**
    *   *Yêu cầu:* Không dùng hàm nguy hại `eval()`, chống mã độc XSS.
    *   *Kết quả thực tế:* Trình phân tích PEMDAS dùng Shunting-yard viết tay 100%, cô lập biến toàn cục $\rightarrow$ **ĐẠT** (mục 5 Báo cáo tổng hợp).
