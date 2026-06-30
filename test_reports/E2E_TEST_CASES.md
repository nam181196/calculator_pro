# CHI TIẾT CÁC CA KIỂM THỬ ĐẦU-CUỐI (END-TO-END TEST CASES) - v2.1.2
## TẬP TIN: [calculator.spec.js](file:///Users/nam/Desktop/calculator/tests/e2e/calculator.spec.js)

Tài liệu này liệt kê chi tiết 40 ca kiểm thử đầu-cuối (E2E) chạy tự động bằng Playwright trên trình duyệt Chromium thật đối với ứng dụng Simple Calculator Web App.

---

## 1. DANH SÁCH CHI TIẾT CÁC CA KIỂM THỬ E2E

| Mã Test | Tên / Chức năng kiểm thử | Các bước thực hiện thao tác giả lập | Kết quả mong đợi trên giao diện hiển thị | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-E01** | Tải trang mặc định | Mở URL ứng dụng máy tính | Dòng dưới hiển thị `"0"`, dòng trên rỗng. Không có lỗi. | **Passed** |
| **TC-E02** | Phép cộng cơ bản (F-001) | Bấm phím: `5` $\rightarrow$ `+` $\rightarrow$ `3` $\rightarrow$ `=` | Kết quả hiển thị `"8"`. Biểu thức hiển thị `"5 + 3"`. | **Passed** |
| **TC-E03** | Phép trừ cơ bản (F-002) | Bấm phím: `1` $\rightarrow$ `0` $\rightarrow$ `−` $\rightarrow$ `4` $\rightarrow$ `=` | Kết quả hiển thị `"6"`. Biểu thức hiển thị `"10 − 4"`. | **Passed** |
| **TC-E04** | Phép nhân cơ bản (F-003) | Bấm phím: `7` $\rightarrow$ `×` $\rightarrow$ `6` $\rightarrow$ `=` | Kết quả hiển thị `"42"`. Biểu thức hiển thị `"7 × 6"`. | **Passed** |
| **TC-E05** | Phép chia cơ bản (F-004) | Bấm phím: `1` $\rightarrow$ `0` $\rightarrow$ `÷` $\rightarrow$ `4` $\rightarrow$ `=` | Kết quả hiển thị `"2.5"`. Biểu thức hiển thị `"10 ÷ 4"`. | **Passed** |
| **TC-E06** | Nhập số thập phân (F-005) | Bấm phím: `1` $\rightarrow$ `.` $\rightarrow$ `5` $\rightarrow$ `+` $\rightarrow$ `2` $\rightarrow$ `.` $\rightarrow$ `5` $\rightarrow$ `=` | Kết quả hiển thị `"4"`. Biểu thức hiển thị `"1.5 + 2.5"`. | **Passed** |
| **TC-E07** | Triệt tiêu sai số nổi (BR-06) | Bấm phím: `0` $\rightarrow$ `.` $\rightarrow$ `1` $\rightarrow$ `+` $\rightarrow$ `0` $\rightarrow$ `.` $\rightarrow$ `2` $\rightarrow$ `=` | Kết quả hiển thị đúng `"0.3"` (không lỗi phẩy động). | **Passed** |
| **TC-E08** | Hiển thị kết quả âm (F-006) | Bấm phím: `2` $\rightarrow$ `−` $\rightarrow$ `9` $\rightarrow$ `=` | Kết quả hiển thị đúng `"-7"` (có dấu âm). | **Passed** |
| **TC-E09** | AC xóa màn hình (F-007) | Bấm phím: `5` $\rightarrow$ `2` $\rightarrow$ `+` $\rightarrow$ `3` $\rightarrow$ `AC` | Màn hình reset sạch về mặc định: kết quả `"0"`, biểu thức rỗng. | **Passed** |
| **TC-E10** | AC thoát lỗi chia cho 0 | Bấm phím: `5` $\rightarrow$ `÷` $\rightarrow$ `0` $\rightarrow$ `=` $\rightarrow$ `AC` | Thoát khỏi Error State, máy tính mở khóa bình thường. | **Passed** |
| **TC-E11** | Tính tiếp sau lỗi chia cho 0 | Gây lỗi chia cho 0 $\rightarrow$ bấm `AC` $\rightarrow$ bấm `7 + 2 =` | Máy tính tính bình thường ra kết quả `"9"`. | **Passed** |
| **TC-E12** | Xóa ký tự backspace (F-008) | Gõ `"123"` $\rightarrow$ click phím xóa `⌫` | Dòng kết quả dưới cập nhật giảm còn `"12"`. | **Passed** |
| **TC-E13** | Chặn backspace sau `=` | Tính toán ra kết quả $\rightarrow$ bấm `⌫` | Kết quả giữ nguyên, không được phép xóa sửa kết quả cuối. | **Passed** |
| **TC-E14** | Chặn backspace sau operator | Bấm `5 +` $\rightarrow$ bấm `⌫` | Giữ nguyên trạng thái chờ số thứ hai, dòng dưới là `"0"`. | **Passed** |
| **TC-E15** | Giới hạn 15 chữ số (F-009) | Click nút số `1` liên tục 16 lần trên UI | Màn hình chỉ nhận đúng 15 chữ số, chữ số 16 bị chặn lại. | **Passed** |
| **TC-E16** | Báo lỗi chia cho 0 (F-010) | Bấm phím: `1` $\rightarrow$ `0` $\rightarrow$ `÷` $\rightarrow$ `0` $\rightarrow$ `=` | Kết quả hiện `"Không thể chia cho 0"`. Kích hoạt Error CSS. | **Passed** |
| **TC-E17** | Khóa bàn phím khi lỗi | Gây lỗi chia cho 0 $\rightarrow$ cố tình bấm số `9` | Bàn phím bị khóa, kết quả vẫn giữ nguyên chữ cảnh báo lỗi. | **Passed** |
| **TC-E18** | Số mũ khoa học lớn (F-011) | Nhập biểu thức nhân số cực lớn để kết quả $\ge 10^{15}$ | Kết quả hiển thị dưới định dạng số mũ khoa học có ký tự `e+`. | **Passed** |
| **TC-E19** | Bàn phím: Phím số 0-9 | Gõ phím cứng `'5'`, `'2'`, `'3'` trên bàn phím vật lý | Kết quả hiển thị `"523"` tương tự bấm phím ảo. | **Passed** |
| **TC-E19b**| Bàn phím: Toán tử & Enter | Gõ phím cứng `'5'`, `'+'`, `'3'` và bấm phím `'Enter'` | Kết quả hiển thị `"8"`. Biểu thức hiển thị `"5 + 3"`. | **Passed** |
| **TC-E20** | Bàn phím: Phím `=` | Gõ phím cứng `'7'`, `'*'`, `'6'` và bấm phím `'='` | Kích hoạt phép tính nhân và trả về kết quả `"42"`. | **Passed** |
| **TC-E21** | Bàn phím: Phím `Escape` | Gõ biểu thức $\rightarrow$ bấm phím cứng `Escape` | Xóa sạch màn hình và reset tương tự phím `AC`. | **Passed** |
| **TC-E22** | Bàn phím: Phím `Backspace`| Gõ `"123"` $\rightarrow$ bấm phím cứng `Backspace` | Màn hình kết quả dưới lùi về hiển thị `"12"`. | **Passed** |
| **TC-E23** | Bàn phím: Phím `/` | Gõ `'1'`, `'0'`, `'/'`, `'2'` và bấm `'Enter'` | Kích hoạt phép chia và trả về kết quả `"5"`. | **Passed** |
| **TC-E24** | Bàn phím: Phím `-` | Gõ `'9'`, `'-'`, `'4'` và bấm `'Enter'` | Kích hoạt phép trừ và trả về kết quả `"5"`. | **Passed** |
| **TC-E25** | Kế thừa kết quả (BRD §6) | Tính `8 + 2 =` (kết quả 10) $\rightarrow$ gõ tiếp `× 3 =` | Tiếp tục thực hiện phép nhân trên số 10 ra kết quả `"30"`. | **Passed** |
| **TC-E26** | Reset khi gõ số mới (BRD §6)| Tính `5 + 3 =` (kết quả 8) $\rightarrow$ gõ tiếp số `4` | Tự động xóa kết quả 8 cũ và bắt đầu biểu thức mới từ số `4`. | **Passed** |
| **TC-E27** | Ghi đè toán tử (BRD §6) | Bấm `5` $\rightarrow$ `+` $\rightarrow$ `−` $\rightarrow$ `3` $\rightarrow$ `=` | Ghi đè toán tử cộng thành trừ, kết quả tính đúng ra `"2"`. | **Passed** |
| **TC-E28** | Chặn `=` liên tiếp | Tính toán xong ra kết quả $\rightarrow$ nhấn `=` 3 lần nữa | Kết quả giữ nguyên, không lặp lại phép toán. | **Passed** |
| **TC-E29** | Highlight phím toán tử | Bấm `5 +` $\rightarrow$ kiểm tra CSS nút `+` $\rightarrow$ gõ `3` | Nút `+` có class `is-active` (highlight), tắt khi gõ tiếp `3`. | **Passed** |
| **TC-E30** | Layout hiển thị hai dòng | Nhập biểu thức `5 + 3` (chưa bấm bằng) | Dòng trên hiển thị `"5 + 3"`, dòng dưới hiển thị `"3"`. | **Passed** |
| **TC-E31** | Thay đổi chủ đề Theme | Click nút chuyển đổi chủ đề `#btn-theme` | Đổi class của HTML element từ tối sang sáng, màu nền thay đổi. | **Passed** |
| **TC-E32** | Chế độ Scientific & Góc | Bật Scientific mode $\rightarrow$ DEG mode $\rightarrow$ tính `sin(90)` $\rightarrow$ RAD mode $\rightarrow$ cos(pi) | `sin(90)` DEG = `1`. `cos(pi)` RAD = `-1`. Nhập hằng số hiển thị chuẩn. | **Passed** |
| **TC-E33** | Lịch sử tính toán | Tính `5+3=8` $\rightarrow$ mở Sidebar $\rightarrow$ click card khôi phục | Lưu lịch sử, hiển thị trên card, click khôi phục đúng trạng thái. | **Passed** |
| **TC-E34** | Đăng ký & Đăng xuất | Nhấp đăng nhập $\rightarrow$ chuyển đăng ký $\rightarrow$ nhập email/pass | Đăng ký qua Mock Auth thành công, hiện email, đăng xuất ẩn info. | **Passed** |
| **TC-E35** | Lỗi toán học khoa học | Chạy các phép toán lỗi: `ln(0)`, `asin(2)`, `tan(90)`, `171!` | Tất cả đều kích hoạt Error State và khóa bàn phím thành công. | **Passed** |
| **TC-E36** | Số mũ khoa học nhỏ | Tính phép toán chia cho số cực lớn: `1 ÷ 10000000000` | Kết quả hiển thị dạng scientific notation có ký tự `e-`. | **Passed** |
| **TC-E37** | **Phím x ảo & Newton Solver**| Click nút ảo `x` $\rightarrow$ `sq` $\rightarrow$ `-` $\rightarrow$ `9` $\rightarrow$ `=` | Màn hình chính giải ra kết quả là `"x = 3"` hoặc `"x = -3"`. | **Passed** |
| **TC-E38** | **Phím x vật lý & Solver** | Gõ phím cứng `'x'` $\rightarrow$ `'-'` $\rightarrow$ `'4'` $\rightarrow$ bấm `'Enter'` | Kích hoạt solver tìm x giải phương trình x - 4 = 0 ra `"x = 4"`. | **Passed** |
| **TC-E39** | **Phím phân số đứng 2D** | Click `■/□` $\rightarrow$ gõ `5` ở tử $\rightarrow$ click mẫu $\rightarrow$ gõ `2` $\rightarrow$ `=` | Giao diện hiển thị phân số 2D dạng placeholder, kết quả = `2.5`. | **Passed** |
| **TC-E40** | **Xóa phân số & Thoát** | Click phân số $\rightarrow$ gõ tử $\rightarrow$ backspace $\rightarrow$ click mẫu $\rightarrow$ gõ $\rightarrow$ `+` | Xóa tử số khôi phục `⬚`. Nhấn toán tử tự động thoát con trỏ. | **Passed** |
