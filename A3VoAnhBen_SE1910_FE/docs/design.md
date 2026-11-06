# Thiết kế và lý do

**Author:** Võ Anh Ben - CE190709

## Component tree

```text
main.jsx → React StrictMode → App
  ├─ chưa có currentUser → LoginPage → Brand
  └─ có currentUser → AdminLayout
       ├─ Sidebar → Brand + menuItems
       ├─ Header → breadcrumb + displayName
       └─ Content
           ├─ DashboardPage
           ├─ ManagementPage (Category / News / Users)
           │    ├─ table + filters + empty state
           │    ├─ RecordForm → Modal (Create / Edit)
           │    └─ Modal (Delete confirmation)
           └─ SettingsPage
  + storage warning / success notification
```

## Template decomposition

`template/dashboard.html` và `dashboard.css` là Bootstrap 5.3.3 Dashboard example gốc, chỉ để đối chiếu, không chạy DOM scripts cũ trong React.

| Template                    | React                             | Lý do                                  |
| --------------------------- | --------------------------------- | -------------------------------------- |
| Sidebar navigation          | `Sidebar`, menuItems              | dùng chung 5 page, event đổi state     |
| Header/top bar              | `Header`, `Brand`                 | breadcrumb, user, logo tái sử dụng     |
| Main content                | `AdminLayout` children            | mỗi page có trách nhiệm riêng          |
| List/table/content headings | `ManagementPage`, `DashboardPage` | dữ liệu map bằng ID, controlled search |

Thay `class` bằng `className`; event dùng `onClick/onChange/onSubmit`; loại bỏ DOM manipulation/click handlers từ template. CSS được điều chỉnh về màu navy/cam của logo và thêm dialog/mobile. Bootstrap CSS imported một lần tại `main.jsx`. Không cần Bootstrap JS vì native dialog và React state điều khiển UI.

## Data sketch

```text
Category(id, name, description, status)
  1 ← News.categoryId → nhiều News
User(id, username, password, role, status)
  1 ← News.createdBy → nhiều News
News(id, title, content, categoryId, createdBy, status, tags[], createdAt)
Settings(displayName, publicationName)
Session(currentUser) → fixed user-admin
```

Foreign key được giữ bằng validation; không dùng index của array làm ID. `crypto.randomUUID()` tránh trùng khi xóa rồi tạo. Khi edit News, createdBy/createdAt giữ nguyên; title/content/tags/category/status được thay.

## State ownership

| State                           | Chủ sở hữu     | Persist?                | Lý do                                             |
| ------------------------------- | -------------- | ----------------------- | ------------------------------------------------- |
| categories/news/users/settings  | App            | localStorage            | Dashboard, forms và pages đều đọc                 |
| currentUser                     | App            | ID trong sessionStorage | bảo vệ render admin; logout rõ                    |
| page, createNews                | App            | không                   | navigation nhỏ, reset về Dashboard sau reload     |
| keyword/status/category filter  | ManagementPage | không                   | chỉ ảnh hưởng displayed list                      |
| dialog `{ selected }`, deleting | ManagementPage | không                   | tách Edit/Create với confirmation                 |
| form/errors                     | RecordForm     | không                   | copy selected, không sửa shared data trước submit |
| menuOpen                        | AdminLayout    | không                   | mobile drawer local                               |
| settings form/error             | SettingsPage   | khi Save mới persist    | cancel navigation không lưu                       |
| notice/warning                  | App            | không                   | thông báo theo vòng đời tab                       |

## 6 quyết định thiết kế

| Quyết định       | Lựa chọn                                   | Lý do/trade-off                                                | Ảnh hưởng nếu thay đổi                                        |
| ---------------- | ------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------- |
| Navigation       | state `page`                               | ít dependency, đúng scope; không deep link                     | thêm Router và route guard nếu cần URL/back-forward           |
| State ownership  | data ở App, props xuống                    | shared state nhỏ, luồng đọc dễ; props thêm khi scale           | Context khi nhiều tầng; không cần Redux hiện tại              |
| Persistence      | localStorage data + sessionStorage auth ID | CRUD còn sau refresh; mock session theo tab                    | thay read/write bằng API và auth thật, có loading/error async |
| Dialog reuse     | Modal chung, RecordForm theo entity        | focus/Escape nhất quán; form khác nhau rõ                      | entity phức tạp tách form chuyên biệt, giữ Modal              |
| Search           | derive từ original list mỗi render         | không mất source, kết hợp filter đơn giản; O(n) đủ dữ liệu nhỏ | server search/pagination cho dataset lớn                      |
| Folder structure | pages/components/data/services             | trách nhiệm rõ, pure service test bằng Node                    | thêm API client/repository ở services khi kết nối Spring Boot |

Quyết định bổ sung: restrict delete có FK, giữ demo Admin; Settings tối thiểu hai trường; password chỉ mock; font/asset lưu local để không phụ thuộc CDN khi demo.

## Luồng sự kiện

Login: input → local form state → submit/preventDefault → authenticate → App currentUser/session ID → render AdminLayout.

Create: Add → dialog selected null → form defaults → validate → saveRecord spread append → setData → React render → effect saveData → close dialog + toast.

Edit: click item → selected object → form copy → validate → replace bằng ID → setData. Không mutate selected/item/source. `key=selected.id` reset form khi đổi record.

Delete: click → deleting item → Modal → Cancel chỉ đóng; Confirm gọi deleteRecord/deletionReason → filter ID → setData. Category/User có FK được báo lý do và disable confirm.

Search: keyword state → `searchRecords(data[entity], ...)` → displayed; không gán displayed vào data. Clear search/filters trả đầy đủ source. CRUD khi lọc vẫn match ID từ original list.

Storage: lazy load đầu tiên → parse + semantic validation → seed nếu thiếu/hỏng → warning nếu hỏng → data state. Effect ghi sau mỗi thay đổi. Quota/blocked storage báo warning, không phá thao tác trong bộ nhớ.
