# Debug log — lỗi quan sát thực tế

**Author:** Võ Anh Ben - CE190709

Ghi đúng lỗi đã gặp; không dùng bug giả để làm evidence. Các lỗi hiện tại chủ yếu thuộc setup và test expectation. Không khẳng định đây là ba lỗi logic ứng dụng do sinh viên tự debug.

## D01 — npm install chạy ở thư mục cha

- Triệu chứng: npm báo ENOENT, không tìm thấy package.json tại `Ass1/package.json`.
- Giả thuyết: command vẫn ở thư mục cha sau khi đổi tên folder project.
- Kiểm tra: đường dẫn npm in và vị trí `Benva-CE190709/package.json`.
- Root cause: rename xong nhưng install chưa đổi working directory.
- Fix: chạy npm với working directory project `Benva-CE190709`.
- Retest: install thành công, dependency audit 0 vulnerabilities tại lần chạy; build thành công.

## D02 — tải HTML/CSS template không đúng version/endpoint

- Triệu chứng: URL raw Bootstrap v5.3.8 dashboard trả HTTP 404; endpoint website trả 403.
- Giả thuyết: example source không truy cập được ở endpoint/version thử ban đầu.
- Kiểm tra: HTTP responses; thử tag ổn định v5.3.3 raw source.
- Root cause: nguồn template ở URL chọn ban đầu không khả dụng; không suy diễn lỗi mạng thành code frontend lỗi.
- Fix: dùng Bootstrap **5.3.3** Dashboard example, lưu `dashboard.html`, `dashboard.css`, MIT LICENSE. Runtime CSS 5.3.8 được quản lý bằng npm.
- Retest: 3 file gốc tải thành công; layout React dùng sidebar/header/content tương ứng, browser screenshots xác nhận.

## D03 — unit test search có expected count sai

- Triệu chứng: test “search trims and ignores case…” báo actual 4, expected 3; 17/18 unit tests pass lần đầu.
- Giả thuyết: search content/tags mở rộng hơn title-only hoặc seed có thêm matching article.
- Kiểm tra: đọc seed title/content/tags của cả 4 articles và scope `searchRecords`.
- Root cause: cả 4 bài có “students” trong content; expectation 3 viết sai. Logic trim/lowercase và scope search đúng thiết kế.
- Fix: expected count đổi thành 4, giữ kiểm tra source list không mutate.
- Retest: `npm test` 18/18 pass. Browser T21 kiểm tra title query và T39 kiểm tra kết hợp search/status/category.

## Quy trình sinh viên cần luyện

### Bổ sung — dải nhỏ của skip link xuất hiện ở mép trên ảnh mobile

- Triệu chứng: ảnh mobile có một dải navy ở đầu trang dù người dùng chưa focus vào “Skip to content”. Ảnh chụp đầu tiên cũng bắt drawer giữa transition.
- Khoanh vùng: CSS `.skip-link` có top âm cố định; screenshot diễn ra trong CSS transition của sidebar.
- Fix: ẩn toàn bộ anchor bằng translate theo chiều cao của chính nó và clip-path, thêm `width: max-content`; focus mới đưa anchor vào view và bỏ clip. Screenshot mobile dùng `animations: disabled` để chụp trạng thái hoàn tất. Clip cũng tránh dải màu khi Chromium chụp full-page với viewport cao hơn viewport ban đầu.
- Retest: T43 kiểm tra skip link nằm ngoài viewport và mobile không tràn ngang; T46 chụp lại và kiểm tra ảnh mobile không có dải navy/drawer đang đóng. Hai test pass trước lần chạy đầy đủ cuối.

Triệu chứng → khoanh vùng component/state/event → kiểm tra input → kiểm tra transform → sửa nhỏ nhất → chạy lại case lỗi và regression. Ghi thêm lỗi thực tế khi tự sửa project. Không trình bày log AI này như chứng minh rằng mình đã trực tiếp debug trong buổi đánh giá.
