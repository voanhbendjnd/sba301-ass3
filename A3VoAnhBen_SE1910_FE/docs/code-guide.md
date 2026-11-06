# Hướng dẫn đọc code và luyện bảo vệ

**Author:** Võ Anh Ben - CE190709

Tài liệu là bản đồ đọc code, không phải xác nhận sinh viên đã hiểu. Hãy tự chạy, mở đúng file và giải thích bằng dữ liệu thực tế.

## Mở file trong 30 giây

| Cần giải thích            | File/function                                                        |
| ------------------------- | -------------------------------------------------------------------- |
| Lệnh chạy                 | package.json: dev/build/preview/test/test:e2e                        |
| Controlled login và lỗi   | src/pages/LoginPage.jsx: submit, username/password state             |
| Admin/Admin condition     | src/services/dataService.js: authenticate                            |
| Auth state/logout         | src/App.jsx: readSession, login, logout, conditional render          |
| Menu/navigation           | src/components/AdminLayout.jsx: menuItems; App: navigate/page        |
| Category create/update    | RecordForm: submit → App: save → dataService: saveRecord             |
| Relation News/category    | dataService: validateRecord, isValidData; RecordForm category select |
| User role labels          | ManagementPage: role-badge; seed role 1/2                            |
| Delete confirm/cancel     | ManagementPage: deleting state, confirmation Modal → App remove      |
| Search original/displayed | ManagementPage: list/displayed → dataService searchRecords           |
| Modal mode/prefill        | RecordForm: initial/selected, ManagementPage dialog state            |
| localStorage              | App load/effect → dataService loadData/saveData                      |

## Giải thích theo 5 tầng

Ví dụ Category Create:

1. **Purpose:** RecordForm lấy thông tin một danh mục mới.
2. **Input:** entity/categories, selected null, data và onSave/onClose props.
3. **Trigger:** onChange cập nhật form; onSubmit gọi submit và preventDefault để không reload trang.
4. **Transform:** validateRecord kiểm tra tên rỗng/trùng, status; saveRecord trim, tạo UUID và `[...oldList, record]`.
5. **Output:** App setData bằng object mới; React render bảng; effect ghi localStorage; dialog đóng, toast hiện.

Edit khác Create: selected có ID; initial copy từ item; `map` thay đúng item.id, không append. CreatedBy/date của bài viết giữ nguyên. Cancel chỉ đóng modal, không gọi onSave.

Delete: bấm row action mới chỉ mở confirmation. Cancel đóng; Confirm gọi remove. deletionReason chặn category có bài hoặc user là tác giả. `filter(item.id !== selectedId)` tạo array mới nên React nhận reference mới.

Search: keyword và filters là UI state; source list trong App không đổi. searchRecords lấy source, normalize trim/lowercase rồi filter, rendered list dùng item.id làm key. Sửa record khi đang lọc vẫn dùng ID gốc; nếu đổi title không khớp query, record sẽ ẩn đúng theo filter và có thể thấy lại sau Clear.

## Kiến thức cần tự nắm

- Props là đầu vào component; state là giá trị React giữ giữa các render. `setState` tạo render với giá trị mới, không nên đọc nó như assignment synchronous.
- Input `value={form.name}` + `onChange` là controlled input. Không đổi trực tiếp `form.name`.
- Array immutable dùng spread/create, map/update, filter/delete. Tránh push/splice trực tiếp trên state.
- `key=item.id` ổn định khi thêm/xóa/filter; index có thể thay và gây nhầm identity.
- App shared data giúp Dashboard/News/Category cùng cập nhật; form/filter/modal local để không chia sẻ không cần thiết.
- `useEffect` persistence chạy sau render khi data đổi. Lazy load chỉ dùng lúc khởi tạo; StrictMode development có thể chạy kiểm tra effect nhiều lần nên thao tác phải an toàn.
- localStorage chứa data còn sau reload; sessionStorage chứa ID session trong tab; page/dialog/search reset sau reload. Logout không xóa dữ liệu.
- Native dialog `showModal` làm background inert và giữ focus trong modal; Escape gọi onCancel; cleanup đóng dialog.
- `npm install` đọc metadata/lock để cài node_modules; `npm run dev` gọi script Vite; `npm run build` bundle vào dist. Không nộp node_modules vì tái tạo được.

## Demo gợi ý 5 phút

Login trống/sai → Admin/Admin → Dashboard → tạo Category → sửa/tìm → tạo News chọn category/tags → thử xóa Category đang dùng (bị chặn) → tạo/sửa User Staff → delete Cancel rồi Confirm → Settings Save → reload kiểm tra → logout.

## Luyện modification không dùng AI

Ví dụ đề bài: thêm trường email cho User và validation email.

Trước sửa, ghi impact: seed/schema load → form field/default → validation → saveRecord → list → tests. Chọn email optional để seed cũ vẫn đọc được, email có nội dung thì phải hợp lệ. Tự xác định rule trước khi code.

| Bước | Việc tự làm                             | Test mới                                                         |
| ---- | --------------------------------------- | ---------------------------------------------------------------- |
| 1    | thêm email optional vào user data       | seed/schema vẫn hợp lệ                                           |
| 2    | input email controlled trong RecordForm | prefill edit, empty create                                       |
| 3    | validation + persistence                | email sai không Save, email đúng reload còn                      |
| 4    | thêm cell vào Users                     | hiển thị đúng từng record                                        |
| 5    | regression                              | login, username unique, role/status, Admin protection không hỏng |

Ví dụ khác: sort bài theo title. Phân tích `displayed` list → sort **copy** → dropdown local state → test search/filter vẫn kết hợp đúng. Không sort trực tiếp source state.

Reset form là ví dụ transfer đã được AI triển khai trong bản này và kiểm tra T44; sinh viên chưa được coi là đã tự thực hiện. Để đáp ứng rubric thực hành, hãy tự chọn một yêu cầu mới, sửa và ghi test trước/sau.

## Debug rehearsal

Edit nhầm record: kiểm tra selected.id → form copy → onSave id → map condition; không dùng vị trí row đã filter. Search mất data: so sánh original list với displayed, tìm setter ghi nhầm filtered list. Reload mất data: kiểm tra STORAGE_KEY, effect dependencies, warning, JSON và schema. Không đoán/sửa hàng loạt trước khi có bằng chứng.

## Checklist cá nhân trước nộp

- [ ] Tôi tự cài/chạy được từ terminal mới.
- [ ] Tôi mở và giải thích login/CRUD/search bằng event–state–render.
- [ ] Tôi kiểm tra cả case lỗi, Cancel, data rỗng, reload.
- [ ] Tôi tự làm một modification không dùng AI và lưu bằng chứng.
- [ ] Tôi đọc quy định AI của lớp, chỉnh sửa/làm chủ source và khai báo đúng.
- [ ] Tôi xác nhận deadline, template lớp, screenshot/video/GitHub theo giảng viên.

Các ô được để trống vì chỉ sinh viên có thể xác nhận những việc cá nhân này.
