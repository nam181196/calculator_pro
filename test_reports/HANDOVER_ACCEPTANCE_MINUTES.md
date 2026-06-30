# BIÊN BẢN NGHIỆM THU VÀ BÀN GIAO DỰ ÁN (PROJECT HANDOVER & ACCEPTANCE MINUTES)
## DỰ ÁN: SIMPLE CALCULATOR WEB APP (v2.1.2)

Hôm nay, ngày ...... tháng ...... năm 2026, các bên liên quan đã tiến hành rà soát kết quả kiểm thử UAT và thống nhất ký biên bản nghiệm thu bàn giao sản phẩm phần mềm.

---

## 1. THÀNH PHẦN THAM GIA

*   **BÊN A (ĐẠI DIỆN KHÁCH HÀNG / PRODUCT OWNER):**
    *   Ông/Bà: **Nam** - Chức vụ: **Product Owner**
*   **BÊN B (ĐẠI DIỆN ĐỘI PHÁT TRIỂN / QA ASSISTANT):**
    *   Ông/Bà: **Nam** - Chức vụ: **Technical Lead & QA Lead**

---

## 2. NỘI DUNG NGHIỆM THU & BÀN GIAO

Bên B tiến hành bàn giao và Bên A nghiệm thu các hạng mục sản phẩm sau:

### 2.1. Mã nguồn sản phẩm (Source Code)
*   **Kho lưu trữ Git:** `https://github.com/nam181196/calculator_pro.git` (Nhánh `main`)
*   **Commit ID bàn giao:** `04e6398` (hoặc commit ID cuối cùng sau UAT)
*   **Đóng gói vận hành:** Cấu hình Dockerfile phục vụ web tĩnh qua Nginx đã được tích hợp đầy đủ.

### 2.2. Bộ hồ sơ nghiệm thu kỹ thuật (QA Documents)
1.  **Báo cáo tổng kết kiểm thử toàn dự án:** [TEST_SUMMARY_REPORT.md](file:///Users/nam/Desktop/calculator/test_reports/TEST_SUMMARY_REPORT.md)
2.  **Bảng rà soát tiêu chí chấp nhận:** [AC_CHECKLIST.md](file:///Users/nam/Desktop/calculator/test_reports/AC_CHECKLIST.md)
3.  **Đặc tả chi tiết 220 ca kiểm thử:** [UNIT_TEST_CASES.md](file:///Users/nam/Desktop/calculator/test_reports/UNIT_TEST_CASES.md), [INTEGRATION_TEST_CASES.md](file:///Users/nam/Desktop/calculator/test_reports/INTEGRATION_TEST_CASES.md), [E2E_TEST_CASES.md](file:///Users/nam/Desktop/calculator/test_reports/E2E_TEST_CASES.md)
4.  **Hướng dẫn kiểm thử UAT dành cho Khách hàng:** [UAT_GUIDE.md](file:///Users/nam/Desktop/calculator/test_reports/UAT_GUIDE.md)

---

## 3. ĐÁNH GIÁ KẾT QUẢ KIỂM THỬ CHẤP NHẬN (UAT RESULTS)

*   **Số lượng kịch bản UAT thực hiện:** 3 kịch bản lớn (bao phủ toàn bộ 21 chức năng từ F-001 đến F-021).
*   **Tỷ lệ Đạt (Pass Rate):** **100%** (Không còn lỗi Blocker, Critical hoặc Major tồn đọng).
*   **Trạng thái môi trường Staging Docker:** Hoạt động ổn định trên cổng 8086, tốc độ phản hồi tính toán thực tế $<80ms$.

---

## 4. KẾT LUẬN CỦA CÁC BÊN

1.  Bên A xác nhận sản phẩm hoạt động đúng đặc tả yêu cầu quy định trong BRD, giao diện phân số 2D hiển thị trực quan và bộ giải phương trình tìm x hội tụ chính xác.
2.  Bên A đồng ý nghiệm thu toàn diện dự án **Simple Calculator Web App phiên bản v2.1.2** và đồng ý cho phép triển khai Golive chính thức trên môi trường Production.
3.  Biên bản này được lập thành hai bản có giá trị pháp lý như nhau, mỗi bên giữ một bản làm căn cứ hoàn tất thủ tục thanh quyết toán hợp đồng bàn giao dự án.

---

## 5. CHỮ KÝ XÁC NHẬN NGHIỆM THU

| ĐẠI DIỆN BÊN A (Product Owner) | ĐẠI DIỆN BÊN B (Tech Lead & QA) |
| :---: | :---: |
| <br><br> *(Ký tên và ghi rõ họ tên)* | <br><br> *(Ký tên và ghi rõ họ tên)* |
| <br> **Nam** | <br> **Nam** |
