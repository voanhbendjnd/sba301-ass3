# AI usage log

**Author:** Võ Anh Ben - CE190709

Ngày thực hiện: 05/10/2026 (Asia/Saigon). Người dùng cung cấp tên project `Benva-CE190709`.

**Phạm vi thực tế:** AI đọc PDF, phân tích, thiết kế, hỗ trợ viết source React, tests, CSS, tài liệu, chạy kiểm thử và tạo logo. Không khẳng định source do sinh viên tự viết, không tạo lịch sử Git giả, không tự xác nhận năng lực của sinh viên.

| Prompt/yêu cầu                                                                              | Mục đích                                  | Phần áp dụng                                | Kiểm chứng                                  | Phần cần sinh viên tự làm                             |
| ------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| “thực hiện làm project tuân theo mô tả trong file PDF yêu cầu… điểm không rõ… làm đơn giản” | xây dựng frontend đúng core scope         | React/Vite, data/service, UI, docs/tests    | PDF R01–R12, build/unit/E2E, screenshots    | đọc source, tự kiểm thử và điều chỉnh trước nộp       |
| Cung cấp tên `Benva-CE190709`                                                               | project naming                            | folder và package metadata                  | đối chiếu folder/package.json               | xác nhận quy ước tên của lớp                          |
| Logo prompt bên dưới                                                                        | asset AI theo R04                         | public/assets/funews-logo.png, Brand/Header | kiểm tra ảnh, T03 naturalWidth, screenshots | biết provenance và giải thích cách dùng asset         |
| Tách validation/CRUD/search khỏi UI, kiểm thử normal/negative/edge                          | dễ giải thích và tránh sai relation/state | dataService.js, unit và browser tests       | actual test outputs trong evidence          | tự đọc và chạy tests, kiểm chứng lại                  |
| Chuẩn bị design/test/debug/code guide                                                       | evidence cho rubric                       | docs/*.md                                   | đối chiếu source và run log                 | tự luyện interview/modification, không đọc thuộc lòng |

## Logo: built-in imagegen

File cuối: `public/assets/funews-logo.png`. Công cụ: built-in `image_gen.imagegen`, transparent_background = true; không sử dụng CLI/API key. Ảnh gốc được copy vào project, không phụ thuộc đường dẫn máy tác giả. Logo được kiểm tra hiển thị trong browser.

Prompt cuối (nguyên văn):

> Use case: logo-brand. Create one compact professional emblem for FUNewsManagementSystem, a university news editorial admin application. Stylized open newspaper pages forming an F, a small orange square at upper right, dark navy blue and warm orange palette. Flat clean geometric brand mark, crisp silhouette, centered square composition with minimal padding, readable at 40 pixels. Transparent background. No lettering, no words, no gradients, no shadows, no mockup. This is a project asset.

## Giả định và điều chỉnh đã áp dụng

- PDF cho phép mock frontend: không xây Spring Boot/database.
- Không có template giảng viên trong workspace: lấy Bootstrap Dashboard example MIT, lưu source/license; ghi rõ giả định.
- Navigation dùng state; cùng modal cho Create/Edit; storage mock; category/user references chặn xóa; demo Admin được bảo vệ.
- Font tải về local; React state update immutable; service tests độc lập với UI.
- Expected unit search được sửa sau khi kiểm tra data thực tế: cả 4 seed articles có từ “students”. Không sửa logic đúng chỉ để test xanh.

## Bổ sung sau khi sinh viên kiểm chứng

| Ngày          | Phần tự đọc/test  | Thay đổi tự thực hiện | Kết quả/bằng chứng |
| ------------- | ----------------- | --------------------- | ------------------ |
| Chưa xác nhận | Sinh viên tự điền | Sinh viên tự điền     | Sinh viên tự điền  |

PDF mục 0.3/9.2 yêu cầu không nộp source trọn bộ từ AI mà không làm chủ; AI không thay thế interview/debug/transfer. Hồ sơ này minh bạch mức hỗ trợ, không chứng minh thay năng lực cá nhân.
