# Evidence index

**Author:** Võ Anh Ben - CE190709

Ngày kiểm chứng: 05/10/2026, Asia/Saigon.

- `e2e-results.json`: lần chạy đầy đủ Chromium, 49 pass, 0 fail/skipped/flaky.
- `e2e-edge-results.json`: lần chạy đầy đủ Edge, 49 pass.
- `verification.txt`: npm ci/build/unit/format và kết quả browser; cuối cùng chạy lại T43/T46 sau sửa CSS.
- `01-login.png`, `02-login-error.png`: login và validation.
- `03-dashboard.png`: master layout, logo và thống kê.
- `04-categories.png`, `05-news.png`, `06-users.png`: READ của ba entity.
- `07-settings.png`: preferences.
- `08-mobile.png`: layout 390px, drawer đã đóng, bảng cuộn ngang trong vùng riêng.
- `create-categories.png`, `create-news.png`, `create-users.png`: popup Create có field phù hợp.
- `edit-category.png`: popup Edit prefill.
- `delete-confirmation.png`: xác nhận xóa, Cancel/Confirm.
- `search-no-results.png`: no-result state và clear filters.

Ảnh được tạo từ application đang chạy bằng Playwright T46 và đã xem để kiểm tra bố cục. Test dùng context riêng với dữ liệu seed. Chi tiết thao tác/expected/actual trong `../test-matrix.md`.

Chạy lại suite đầy đủ: `npm run test:e2e`. Chạy riêng screenshot mà giữ JSON report đầy đủ trước đó: `npx playwright test -g T46 --reporter=list`.
