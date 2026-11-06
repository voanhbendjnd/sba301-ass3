# Requirement Traceability Matrix

**Author:** Võ Anh Ben - CE190709

Nguồn: SBA301 Assignment 01 Student Guide, đặc biệt trang 3–6, 8–13 và 18. Phạm vi: frontend quản trị React/Vite; không cần Spring Boot hoặc DB.

| ID  | Yêu cầu                                  | File/UI chứng minh                                                  | Kiểm thử                       |
| --- | ---------------------------------------- | ------------------------------------------------------------------- | ------------------------------ |
| R01 | ReactJS + Vite, project đúng tên         | `Benva-CE190709/package.json`, `vite.config.js`, `main.jsx`         | `npm run dev`, `npm run build` |
| R02 | Login page                               | `pages/LoginPage.jsx`                                               | T01/T02                        |
| R03 | Admin/Admin vào admin                    | `authenticate` trong `dataService.js`, `App.jsx` conditional render | T03/T04                        |
| R04 | Logo AI + Header                         | `public/assets/funews-logo.png`, `Brand.jsx`, `AdminLayout.jsx`     | T03, ảnh login/dashboard       |
| R05 | Master layout Header/Sidebar/Content     | `AdminLayout.jsx`                                                   | T05/T06/T43                    |
| R06 | Dashboard/Category/News/Users/Settings   | `menuItems`, `App` page state                                       | T05/T06                        |
| R07 | Category CRUD + Search                   | `ManagementPage entity="categories"`                                | T07–T14                        |
| R08 | News CRUD + Search                       | `ManagementPage entity="news"`                                      | T15–T22                        |
| R09 | User CRUD + Search                       | `ManagementPage entity="users"`                                     | T23–T30                        |
| R10 | Create/Update dialog                     | `RecordForm.jsx`, `Modal.jsx`                                       | T08/T10/T16/T18/T24/T26/T38    |
| R11 | Delete confirmation                      | `ManagementPage.jsx` deleting state                                 | T11/T12/T19/T20/T27/T28        |
| R12 | Data model role/status/category relation | `seed.js`, `validateRecord/isValidData/deletionReason`              | T31–T35/T36/T42, unit tests    |

## Màn hình và trách nhiệm

| Khu vực   | Input                              | Xử lý                                                        | Output                   |
| --------- | ---------------------------------- | ------------------------------------------------------------ | ------------------------ |
| Login     | username/password                  | empty check → exact credential check → auth state            | error hoặc Dashboard     |
| Dashboard | shared data                        | count, sort copies, resolve foreign keys                     | 3 thống kê, bài mới nhất |
| Category  | name/description/status            | validate tên unique → CRUD theo ID                           | list/dialog/feedback     |
| News      | title/content/category/status/tags | validate relation → preserve author/date khi edit            | list và article form     |
| Users     | username/mock password/role/status | unique username → numeric role/status → protect demo account | role labels và list      |
| Settings  | displayName/publicationName        | required/trim → persist                                      | header/banner đổi tên    |

## Entity và constraint

- Category: `id` UUID hoặc seed ID unique, `name` required/unique case-insensitive, `description` optional string, `status` 0/1.
- News: `id`, `title` required, `content` required, `categoryId` tồn tại, `createdBy` user ID tồn tại, `status` 0/1, `tags` string array, `createdAt` ISO timestamp.
- User: `id`, `username` required/unique case-insensitive, mock `password` required, `role` 1/2, `status` 0/1.
- Session: currentUser trong App; sessionStorage chỉ lưu ID `user-admin`, logout remove key.
- Settings: displayName/publicationName required, persist cùng shared data.
- Chặn xóa relation thay vì cascade; giữ Admin/Admin cố định. Các user khác vẫn đủ CRUD.

## Input–Process–Output của CRUD

| Use case | Input                     | Process                                   | Output                               |
| -------- | ------------------------- | ----------------------------------------- | ------------------------------------ |
| Read     | original entity array     | map bằng `item.id`, resolve labels        | table hoặc empty state               |
| Create   | empty form                | validate → UUID → spread append → setData | record mới, dialog đóng, success     |
| Update   | selected item + form copy | validate → map, match ID → replace        | đúng record đổi, các record khác giữ |
| Delete   | selected item             | confirm → relation check → filter by ID   | record mất; Cancel không gọi remove  |
| Search   | keyword/status/category   | trim/lowercase → filter source list       | subset/no result, source không mất   |

## Phần chưa rõ và lựa chọn

Tên project theo câu trả lời người dùng `Benva-CE190709`. Chưa có template riêng lớp; dùng Bootstrap Dashboard example MIT, giữ file gốc. Settings tối thiểu hai trường cấu hình. Navigation dùng state vì PDF cho phép; không có deep link/back-forward route. Không có login Staff, backend hoặc API thật.

## Evidence theo milestone

M1: scripts/build/log; M2: template source và component sketch; M3: T01–T04; M4: ảnh dashboard/mobile; M5: T05–T06; M6: seed/service/unit tests; M7: screenshots 3 danh sách; M8: form tests/screenshots; M9: cancel/confirm tests; M10: search tests; M11: README, matrix, evidence, source.
