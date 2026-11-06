# BẢN ĐỒ CHỨC NĂNG VÀ LUỒNG HOẠT ĐỘNG TOÀN BỘ HỆ THỐNG

**Author:** Võ Anh Ben - CE190709  
**Project:** FUNews Management System (`Benva-CE190709`)  
**Khóa học:** SBA301 - Assignment 01  
**Mục đích tài liệu:** Hướng dẫn tra cứu vị trí file, dòng code, tên hàm và luồng dữ liệu (Data/Event Flow) của từng chức năng để phục vụ việc đọc code, thuyết trình và bảo vệ bài thi.

---

## MỤC LỤC TRA CỨU NHANH

1. [Khởi tạo & Đồng bộ Dữ liệu (LocalStorage Persistence)](#1-khởi-tạo--đồng-bộ-dữ-liệu-localstorage-persistence)
2. [Đăng nhập (Authentication - Login)](#2-đăng-nhập-authentication---login)
3. [Duy trì phiên đăng nhập khi F5 / Reload (Session Persistence)](#3-duy-trì-phiên-đăng-nhập-khi-f5--reload-session-persistence)
4. [Đăng xuất (Logout)](#4-đăng-xuất-logout)
5. [Điều hướng trang (Navigation - SPA) & Master Layout](#5-điều-hướng-trang-navigation---spa--master-layout)
6. [Thống kê tổng quan trên Dashboard](#6-thống-kê-tổng-quan-trên-dashboard)
7. [Tạo bài viết nhanh từ Dashboard](#7-tạo-bài-viết-nhanh-từ-dashboard)
8. [Xem danh sách bản ghi (Read / Display List)](#8-xem-danh-sách-bản-ghi-read--display-list)
9. [Tìm kiếm và Lọc dữ liệu (Search & Multi-Filter)](#9-tìm-kiếm-và-lọc-dữ-liệu-search--multi-filter)
10. [Mở Popup biểu mẫu Tạo mới / Chỉnh sửa (Modal Form)](#10-mở-popup-biểu-mẫu-tạo-mới--chỉnh-sửa-modal-form)
11. [Kiểm tra hợp lệ dữ liệu nhập (Form Validation)](#11-kiểm-tra-hợp-lệ-dữ-liệu-nhập-form-validation)
12. [Khôi phục dữ liệu ban đầu trên Form (Reset Form)](#12-khôi-phục-dữ-liệu-ban-đầu-trên-form-reset-form)
13. [Tạo mới bản ghi (Create Record - Bất biến / Immutable)](#13-tạo-mới-bản-ghi-create-record---bất-biến--immutable)
14. [Chỉnh sửa bản ghi (Update Record - Bất biến / Immutable)](#14-chỉnh-sửa-bản-ghi-update-record---bất-biến--immutable)
15. [Kiểm tra ràng buộc khóa ngoại & Xóa an toàn (Delete & Protection)](#15-kiểm-tra-ràng-buộc-khóa-ngoại--xóa-an-toàn-delete--protection)
16. [Cài đặt cấu hình tòa soạn & Tên hiển thị (Settings)](#16-cài-đặt-cấu-hình-tòa-soạn--tên-hiển-thị-settings)
17. [Hệ thống thông báo Toast & Cảnh báo lỗi lưu trữ](#17-hệ-thống-thông-báo-toast--cảnh-báo-lỗi-lưu-trữ)

---

## CHI TIẾT TỪNG CHỨC NĂNG

### 1. Khởi tạo & Đồng bộ Dữ liệu (LocalStorage Persistence)

- **Vị trí file & dòng code:**
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L8-L12): Khai báo key `STORAGE_KEY = 'funews.data.v1'`.
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L49-L121): Hàm `isValidData(data)` - Kiểm tra toàn vẹn cấu trúc dữ liệu lưu trữ.
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L130-L148): Hàm `loadData(storage)` - Nạp dữ liệu từ storage hoặc nạp seed mặc định.
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L157-L164): Hàm `saveData(storage, data)` - Ghi dữ liệu JSON vào storage.
  - [src/data/seed.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/data/seed.js#L22-L106): Hàm `createSeed()` - Tạo dữ liệu mẫu khởi đầu (4 danh mục, 3 user, 4 bài viết).
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L26-L32): Hàm `browserStorage()` - Truy cập `window.localStorage` an toàn với `try-catch`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L56-L57): State `loaded` và `data` khởi tạo dữ liệu ban đầu.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L77-L80): Hook `useEffect` lắng nghe `data` thay đổi để tự động lưu vào storage.

- **Các hàm liên quan:** `browserStorage()`, `loadData()`, `isValidData()`, `createSeed()`, `saveData()`.

- **Luồng hoạt động (Operational Flow):**
  1. Khi ứng dụng khởi chạy lần đầu trong trình duyệt, `App.jsx` gọi `loadData(browserStorage())`.
  2. `loadData` lấy chuỗi thô từ `localStorage.getItem('funews.data.v1')`.
     - Nếu chưa từng có dữ liệu: Tự động gọi `createSeed()` để tạo dữ liệu mẫu và trả về.
     - Nếu đã có chuỗi: `JSON.parse` và chuyển qua hàm `isValidData(data)` kiểm tra tính toàn vẹn (đủ mảng categories, news, users; id duy nhất; quan hệ khóa ngoại hợp lệ). Nếu dữ liệu lỗi, rơi vào khối `catch` để nạp seed an toàn và kèm cảnh báo `warning`.
  3. Dữ liệu nạp được đưa vào state `data` của `App.jsx`.
  4. Mỗi khi người dùng Thêm/Sửa/Xóa khiến state `data` thay đổi, `useEffect` trong `App.jsx` được kích hoạt và tự động gọi `saveData(storage, data)` để lưu đè chuỗi JSON mới vào `localStorage`.

---

### 2. Đăng nhập (Authentication - Login)

- **Vị trí file & dòng code:**
  - [src/pages/LoginPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/LoginPage.jsx#L14-L123): Toàn bộ component `LoginPage`.
  - [src/pages/LoginPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/LoginPage.jsx#L17-L24): Các state `username`, `password`, `error`, `visible` (ẩn/hiện pass).
  - [src/pages/LoginPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/LoginPage.jsx#L33-L51): Hàm `submit(event)` - Xử lý khi nhấn nút Đăng nhập.
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L366-L370): Hàm `authenticate(username, password)` - Kiểm tra thông tin tài khoản Admin/Admin.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L97-L105): Hàm `login(currentUser)` - Cập nhật user state và lưu sessionStorage.

- **Các hàm liên quan:** `submit()` (trong LoginPage), `authenticate()` (trong dataService), `login()` (trong App).

- **Luồng hoạt động (Operational Flow):**
  1. Người dùng nhập `Username` và `Password` trên giao diện, kích hoạt `onChange` cập nhật state `username` và `password`.
  2. Bấm nút **Sign in** (kích hoạt sự kiện submit form).
  3. Hàm `submit(event)` trong `LoginPage.jsx` chạy:
     - Gọi `event.preventDefault()` để ngăn trình duyệt reload trang.
     - Kiểm tra nếu `username.trim()` hoặc `password.trim()` bị rỗng -> gán `error = "Enter your username and password."` và dừng lại.
     - Nếu có nhập liệu, gọi hàm `authenticate(username, password)` từ `dataService.js`.
  4. Hàm `authenticate()` kiểm tra điều kiện chính xác: `username === 'Admin' && password === 'Admin'`.
     - Nếu sai: Trả về `null`. `submit` gán `error = "Incorrect username or password. Try Admin / Admin."`.
     - Nếu đúng: Trả về đối tượng `{ id: 'user-admin', username: 'Admin', role: 1 }`.
  5. `LoginPage` gọi callback `onLogin(user)` truyền lên component cha `App.jsx`.
  6. Hàm `login(currentUser)` trong `App.jsx` chạy:
     - Cập nhật state `user = currentUser`.
     - Set state `page = 'dashboard'`.
     - Lưu `sessionStorage.setItem('funews.session.v1', 'user-admin')`.
  7. Component `App.jsx` re-render: vì `user` đã có giá trị, giao diện chuyển từ `LoginPage` sang `AdminLayout`.

---

### 3. Duy trì phiên đăng nhập khi F5 / Reload (Session Persistence)

- **Vị trí file & dòng code:**
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L11): Khai báo key `SESSION_KEY = 'funews.session.v1'`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L40-L48): Hàm `readSession()`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L60): State `const [user, setUser] = useState(readSession)`.

- **Các hàm liên quan:** `readSession()`.

- **Luồng hoạt động (Operational Flow):**
  1. Khi người dùng tải lại trang (nhấn F5 / Reload tab hiện tại), toàn bộ bộ nhớ RAM của ứng dụng React bị xóa.
  2. State `user` trong `App.jsx` được khởi tạo bằng hàm khởi tạo lười (lazy initializer) `readSession`.
  3. `readSession()` đọc `sessionStorage.getItem('funews.session.v1')`.
     - Nếu bằng `'user-admin'`: Trả về đối tượng `{ id: 'user-admin', username: 'Admin', role: 1 }`, giúp người dùng tiếp tục ở trạng thái đã đăng nhập và vào thẳng Dashboard.
     - Nếu không có: Trả về `null`, ứng dụng hiển thị màn hình đăng nhập.

---

### 4. Đăng xuất (Logout)

- **Vị trí file & dòng code:**
  - [src/components/AdminLayout.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/AdminLayout.jsx#L120-L123): Nút bấm Sign out trong `Sidebar`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L111-L121): Hàm `logout()`.

- **Các hàm liên quan:** `logout()`.

- **Luồng hoạt động (Operational Flow):**
  1. Người dùng bấm vào nút **Sign out** ở chân Sidebar.
  2. Sự kiện `onClick` gọi prop `onLogout()`, truyền ngược lên hàm `logout()` trong `App.jsx`.
  3. Hàm `logout()` thực hiện:
     - Đặt lại state `setUser(null)`.
     - Đặt lại trang hiện tại `setPage('dashboard')`.
     - Tắt cờ tạo bài viết `setCreateNews(false)`.
     - Xóa khóa phiên đăng nhập: `sessionStorage.removeItem('funews.session.v1')`.
  4. Ứng dụng re-render: vì `user` là `null`, màn hình quản trị biến mất và màn hình `LoginPage` hiển thị lại. Dữ liệu trong `localStorage` vẫn được bảo toàn nguyên vẹn.

---

### 5. Điều hướng trang (Navigation - SPA) & Master Layout

- **Vị trí file & dòng code:**
  - [src/components/AdminLayout.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/AdminLayout.jsx#L23-L29): Mảng cấu hình menu `menuItems` (Dashboard, Category, News, Users, Settings).
  - [src/components/AdminLayout.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/AdminLayout.jsx#L39-L66): Component `Header` (hiển thị Breadcrumb và thông tin admin).
  - [src/components/AdminLayout.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/AdminLayout.jsx#L79-L128): Component `Sidebar` (menu các trang và nút đăng xuất).
  - [src/components/AdminLayout.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/AdminLayout.jsx#L140-L169): Component `AdminLayout` (kết hợp Sidebar + Header + Content).
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L63): State `const [page, setPage] = useState('dashboard')`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L128-L131): Hàm `navigate(nextPage)`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L210-L248): Khối render có điều kiện (`page === 'dashboard'`, `categories`, `news`, `users`, `settings`).

- **Các hàm liên quan:** `navigate()` (App), `Header()`, `Sidebar()`, `AdminLayout()`.

- **Luồng hoạt động (Operational Flow):**
  1. Người dùng bấm vào một nút trên Sidebar (ví dụ: "Category").
  2. Sự kiện `onClick` gọi `onNavigate('categories')`.
  3. Hàm `navigate('categories')` trong `App.jsx` chạy, gọi `setPage('categories')`.
  4. React re-render `App.jsx`: Component con `<ManagementPage entity="categories" ... />` được nạp vào vùng thẻ `<main>` mà hoàn toàn **không tải lại toàn bộ tài liệu HTML** (Single Page Application).
  5. `Header` tự động cập nhật breadcrumb: `FUNews > Category`.

---

### 6. Thống kê tổng quan trên Dashboard

- **Vị trí file & dòng code:**
  - [src/pages/DashboardPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/DashboardPage.jsx#L14-L20): Hàm `formatDate(value)` - Format ngày dạng `27 Oct 2026`.
  - [src/pages/DashboardPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/DashboardPage.jsx#L31-L64): Component `DashboardPage` tính toán các biến `recent`, `active`, `stats`.
  - [src/pages/DashboardPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/DashboardPage.jsx#L80-L84): Vùng `.welcome-banner` hiển thị `data.settings.publicationName`.
  - [src/pages/DashboardPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/DashboardPage.jsx#L87-L99): Render lưới 3 thẻ thống kê (`stats-grid`).
  - [src/pages/DashboardPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/DashboardPage.jsx#L124-L154): Render bảng 5 bài viết mới nhất.

- **Các hàm liên quan:** `DashboardPage()`, `formatDate()`.

- **Luồng hoạt động (Operational Flow):**
  1. `DashboardPage` nhận prop `data` từ `App.jsx`.
  2. Tạo bản copy mảng tin tức `[...data.news]`, dùng hàm `sort()` sắp xếp giảm dần theo thời gian tạo `createdAt`, sau đó dùng `slice(0, 5)` để lấy đúng 5 bài mới nhất đưa vào biến `recent`.
  3. Lọc số bài viết active: `data.news.filter(item => item.status === 1).length`.
  4. Tổng hợp mảng `stats` chứa số lượng và chi tiết của Tin tức, Danh mục và Người dùng. Bấm vào mỗi thẻ sẽ kích hoạt `onNavigate(page)` để nhảy thẳng tới trang quản trị đó.
  5. Đối với mỗi bài viết trong bảng: Dùng `data.users.find()` để lấy username của tác giả và `data.categories.find()` để lấy tên danh mục tương ứng.

---

### 7. Tạo bài viết nhanh từ Dashboard

- **Vị trí file & dòng code:**
  - [src/pages/DashboardPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/DashboardPage.jsx#L73-L76): Nút "Create article" trên Dashboard.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L66): State `const [createNews, setCreateNews] = useState(false)`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L214-L217): Callback `onCreateNews={() => { setCreateNews(true); setPage('news'); }}`.
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L47-L58): Khởi tạo state `dialog` dựa trên prop `initialCreate`.

- **Các hàm liên quan:** `onCreateNews()` (DashboardPage), `setCreateNews()`, `ManagementPage()`.

- **Luồng hoạt động (Operational Flow):**
  1. Người dùng đang ở màn hình Dashboard bấm nút **Create article**.
  2. Callback kích hoạt: `setCreateNews(true)` và `setPage('news')`.
  3. `App.jsx` chuyển sang render `ManagementPage` với prop `entity="news"` và `initialCreate={true}`.
  4. Trong `ManagementPage.jsx`, state `dialog` được khởi tạo: `initialCreate ? { selected: null } : null`. Vì `initialCreate` là `true`, state `dialog` có giá trị ngay từ lần render đầu tiên.
  5. Popup form tạo bài viết mới tự động mở ra ngay khi trang News vừa xuất hiện.

---

### 8. Xem danh sách bản ghi (Read / Display List)

- **Vị trí file & dòng code:**
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L164-L268): Vùng hiển thị thẻ `<table>`.
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L83): Hàm `recordName(item)` - Lấy tên hiển thị theo thực thể.
  - [src/components/StatusBadge.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/StatusBadge.jsx#L12-L20): Component hiển thị badge `Active` hoặc `Inactive`.

- **Các hàm liên quan:** `ManagementPage()`, `recordName()`, `StatusBadge()`.

- **Luồng hoạt động (Operational Flow):**
  1. `ManagementPage` nhận prop `entity` (`'categories'`, `'news'`, hoặc `'users'`) và `data`.
  2. Lấy danh sách tương ứng: `const list = data[entity]`.
  3. Lọc qua hàm `searchRecords()` để tạo ra mảng `displayed`.
  4. Duyệt qua mảng `displayed` bằng phương thức `.map(item => ...)` để render từng dòng `<tr>`:
     - Nếu là Categories: hiển thị Tên danh mục, Mô tả, Trạng thái.
     - Nếu là News: hiển thị Tiêu đề, Tác giả, Tags, Tên danh mục (tra cứu qua `data.categories`), Ngày tạo, Trạng thái.
     - Nếu là Users: hiển thị Tên người dùng, Vai trò (Admin/Staff), Trạng thái. Mật khẩu không hiển thị trên bảng để bảo mật.
     - Mỗi dòng đều có thuộc tính `data-testid="record-row"` và nút Sửa (Pencil), Xóa (Trash2).

---

### 9. Tìm kiếm và Lọc dữ liệu (Search & Multi-Filter)

- **Vị trí file & dòng code:**
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L49-L55): Các state `keyword`, `status`, `category`.
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L88-L92): Hàm `clearFilters()`.
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L110-L160): Khung công cụ `management-toolbar` (ô input tìm kiếm + 2 thẻ select lọc).
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L20-L23): Hàm `normalize(value)` - Chuẩn hóa chuỗi (trim + toLowerCase).
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L337-L356): Hàm `searchRecords(list, entity, keyword, status, categoryId)`.

- **Các hàm liên quan:** `searchRecords()`, `normalize()`, `clearFilters()`.

- **Luồng hoạt động (Operational Flow):**
  1. Người dùng nhập văn bản vào ô tìm kiếm hoặc chọn giá trị từ dropdown Status/Category.
  2. Sự kiện `onChange` cập nhật state cục bộ (`keyword`, `status`, hoặc `category`).
  3. `ManagementPage` tự động chạy lại:
     `const displayed = searchRecords(list, entity, keyword, status, category);`
  4. Hàm `searchRecords` thực hiện:
     - Dùng `normalize(keyword)` để loại bỏ khoảng trắng hai đầu và đổi chữ thường.
     - Với mỗi `item` trong `list`, ghép các trường tìm kiếm lại thành chuỗi `text` (Category lấy `name`; User lấy `username`; News lấy `title + content + tags`).
     - So sánh: `normalize(text).includes(query)` VÀ kiểm tra điều kiện `status` VÀ kiểm tra điều kiện `categoryId`.
  5. Mảng kết quả `displayed` được trả về để render bảng. **Mảng gốc `data[entity]` trong `App.jsx` hoàn toàn không bị thay đổi**.
  6. Nếu không tìm thấy kết quả nào, giao diện hiển thị `.empty-state` cùng nút **Clear filters** (bấm vào sẽ gọi `clearFilters()` đưa các bộ lọc về mặc định).

---

### 10. Mở Popup biểu mẫu Tạo mới / Chỉnh sửa (Modal Form)

- **Vị trí file & dòng code:**
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L58): State `const [dialog, setDialog] = useState(...)`.
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L102-L105): Nút "Create" kích hoạt `setDialog({ selected: null })`.
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L244-L251): Nút "Edit" kích hoạt `setDialog({ selected: item })`.
  - [src/components/Modal.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/Modal.jsx#L19-L46): Component `Modal` sử dụng thẻ `<dialog>` HTML5.
  - [src/components/RecordForm.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/RecordForm.jsx#L34-L42): Khởi tạo state `form` từ `selected` hoặc `defaults`.

- **Các hàm liên quan:** `setDialog()`, `RecordForm()`, `Modal()`.

- **Luồng hoạt động (Operational Flow):**
  1. **Khi bấm Tạo mới (Create):**
     - Kích hoạt `setDialog({ selected: null })`.
     - `RecordForm` nhận prop `selected = null`. Biến `initial` lấy giá trị từ object `defaults[entity]` (tất cả các trường rỗng, status = 1).
  2. **Khi bấm Chỉnh sửa (Edit):**
     - Kích hoạt `setDialog({ selected: item })`.
     - `RecordForm` nhận prop `selected = item`. Biến `initial` sao chép từ bản ghi: `{ ...selected, tags: selected.tags?.join(', ') ?? '' }`. Mọi thông tin cũ tự động được điền sẵn lên các ô input.
  3. Component `Modal.jsx` chứa hook `useEffect`: ngay khi render, gọi `dialog.showModal()` để khóa focus bên trong hộp thoại, làm mờ nền phía sau và cho phép người dùng nhấn phím **Escape** để đóng form.

---

### 11. Kiểm tra hợp lệ dữ liệu nhập (Form Validation)

- **Vị trí file & dòng code:**
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L175-L225): Hàm `validateRecord(entity, form, data, editingId)`.
  - [src/components/RecordForm.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/RecordForm.jsx#L44): State `const [errors, setErrors] = useState({})`.
  - [src/components/RecordForm.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/RecordForm.jsx#L112-L121): Hàm `submit(event)` trong RecordForm.
  - [src/components/RecordForm.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/RecordForm.jsx#L63-L104): Helper `field(...)` hiển thị thẻ `<small className="field-error">`.

- **Các hàm liên quan:** `validateRecord()`, `submit()`, `hasText()`, `normalize()`.

- **Luồng hoạt động (Operational Flow):**
  1. Người dùng bấm nút **Create...** hoặc **Save changes** trên modal form.
  2. Hàm `submit(event)` trong `RecordForm.jsx` chạy, gọi hàm `validateRecord(entity, form, data, selected?.id)`.
  3. Hàm `validateRecord` kiểm tra tập quy tắc:
     - **Chung:** `status` phải là 0 hoặc 1.
     - **Category:** `name` không được để trống. Tên danh mục không được trùng với danh mục khác trong hệ thống (so sánh qua `normalize` không phân biệt hoa thường; bỏ qua bản ghi đang sửa bằng `item.id !== editingId`).
     - **News:** `title` và `content` không được để trống. `categoryId` phải tồn tại trong mảng `data.categories`.
     - **Users:** `username` và `password` không được để trống. `username` không được trùng với user khác. `role` phải là 1 (Admin) hoặc 2 (Staff). Nếu đang sửa tài khoản `user-admin`, chặn không cho phép đổi username/pass/role/status.
  4. Nếu có trường vi phạm: Trả về đối tượng `errors` (ví dụ `{ name: 'Category name is required.' }`). `setErrors(nextErrors)` được gọi, form dừng lại và dòng chữ đỏ báo lỗi hiển thị ngay dưới ô input đó.
  5. Nếu dữ liệu hợp lệ: Đối tượng `errors` rỗng, code tiếp tục gọi `onSave`.

---

### 12. Khôi phục dữ liệu ban đầu trên Form (Reset Form)

- **Vị trí file & dòng code:**
  - [src/components/RecordForm.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/RecordForm.jsx#L35-L38): Biến hằng `initial`.
  - [src/components/RecordForm.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/RecordForm.jsx#L229-L239): Nút bấm **Reset** trong `RecordForm`.

- **Các hàm liên quan:** Sự kiện `onClick` của nút Reset.

- **Luồng hoạt động (Operational Flow):**
  1. Trong khi đang nhập dữ liệu mới hoặc sửa dở một bản ghi, người dùng bấm nút **Reset**.
  2. Sự kiện `onClick` kích hoạt:
     - `setForm({ ...initial })`: Đặt lại toàn bộ dữ liệu trên form về đúng giá trị lúc modal vừa được mở ra.
     - `setErrors({})`: Xóa sạch mọi thông báo lỗi validation đang hiển thị.
  3. Thao tác này hoàn toàn chỉ diễn ra trên state cục bộ của form, không làm thay đổi dữ liệu trong danh sách chính.

---

### 13. Tạo mới bản ghi (Create Record - Bất biến / Immutable)

- **Vị trí file & dòng code:**
  - [src/components/RecordForm.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/RecordForm.jsx#L119): Gọi `onSave(form, selected?.id)`.
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L305-L309): Chuyển tiếp `onSave(entity, form, id)` và đóng popup nếu thành công.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L141-L149): Hàm `save(entity, form, id)`.
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L237-L286): Hàm `saveRecord(data, entity, form, editingId = null)`.

- **Các hàm liên quan:** `submit()`, `save()`, `saveRecord()`.

- **Luồng hoạt động (Operational Flow):**
  1. Người dùng điền hợp lệ form Tạo mới và bấm **Create...**.
  2. `RecordForm` gọi `onSave(form, null)`.
  3. `App.jsx` gọi `saveRecord(data, entity, form, null)`:
     - Tạo một object mới `record`: sinh mã ngẫu nhiên `id: crypto.randomUUID()`.
     - Nếu là Category: gán `name`, `description`.
     - Nếu là User: gán `username`, `password`, `role`.
     - Nếu là News: gán `title`, `content`, `categoryId`, người tạo `createdBy: 'user-admin'`, thời gian `createdAt: new Date().toISOString()`, và mảng tags lọc trùng `tags: [...new Set(...)]`.
     - Tạo mảng mới bằng toán tử Spread: `list = [...data[entity], record]`.
     - Trả về đối tượng `{ data: { ...data, [entity]: list }, errors: {} }`.
  4. Trong `App.jsx`: `setData(result.data)` cập nhật state -> Hook `useEffect` lưu `localStorage` -> Gán thông báo `notice` (hiện Toast thông báo thành công).
  5. Trong `ManagementPage.jsx`: Nhận thấy không còn lỗi, gọi `setDialog(null)` để đóng modal form. Bảng dữ liệu tự động xuất hiện bản ghi mới.

---

### 14. Chỉnh sửa bản ghi (Update Record - Bất biến / Immutable)

- **Vị trí file & dòng code:**
  - [src/components/RecordForm.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/RecordForm.jsx#L119): Gọi `onSave(form, selected?.id)`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L141-L149): Hàm `save(entity, form, id)`.
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L237-L286): Hàm `saveRecord(data, entity, form, editingId)`.

- **Các hàm liên quan:** `submit()`, `save()`, `saveRecord()`.

- **Luồng hoạt động (Operational Flow):**
  1. Người dùng sửa thông tin trên form Chỉnh sửa và bấm **Save changes**.
  2. `RecordForm` gọi `onSave(form, selected.id)`.
  3. `App.jsx` gọi `saveRecord(data, entity, form, editingId)`:
     - Tìm bản ghi cũ trong danh sách: `const existing = data[entity].find(item => item.id === editingId)`.
     - Tạo object mới `record`: giữ nguyên `id: existing.id`.
     - Nếu là News: **giữ nguyên người tạo ban đầu (`existing.createdBy`) và ngày tạo gốc (`existing.createdAt`)**, chỉ cập nhật title, content, category, tags và status mới.
     - Dùng phương thức `.map()` để thay thế bất biến:
       `list = data[entity].map(item => item.id === editingId ? record : item)`.
  4. `App.jsx` cập nhật `setData`, lưu `localStorage`, đóng modal và hiện Toast thông báo `... updated successfully.`.

---

### 15. Kiểm tra ràng buộc khóa ngoại & Xóa an toàn (Delete & Protection)

- **Vị trí file & dòng code:**
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L61): State `const [deleting, setDeleting] = useState(null)`.
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L76): Biến `const reason = deleting ? deletionReason(data, entity, deleting.id) : ''`.
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L257-L260): Bấm nút Trash2 gọi `setDeleting(item)`.
  - [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx#L314-L348): Modal xác nhận xóa an toàn.
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L296-L310): Hàm `deletionReason(data, entity, id)`.
  - [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js#L320-L325): Hàm `deleteRecord(data, entity, id)`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L158-L165): Hàm `remove(entity, id)`.

- **Các hàm liên quan:** `setDeleting()`, `deletionReason()`, `deleteRecord()`, `remove()`.

- **Luồng hoạt động (Operational Flow):**
  1. Người dùng bấm icon thùng rác (Trash2) trên một dòng: `setDeleting(item)` được gọi -> Modal xác nhận xóa hiển thị.
  2. Hàm `deletionReason(data, entity, deleting.id)` kiểm tra xem bản ghi có được phép xóa không:
     - **Nếu là Category:** Kiểm tra `data.news.some(item => item.categoryId === id)`. Nếu có bài viết đang thuộc danh mục này -> Trả về lỗi: _"This category is used by news articles. Reassign or delete those articles first."_
     - **Nếu là User:**
       - Nếu `id === 'user-admin'` -> Trả về lỗi: _"The required Admin/Admin demo account cannot be deleted."_
       - Kiểm tra `data.news.some(item => item.createdBy === id)`. Nếu user này là tác giả của bài viết nào đó -> Trả về lỗi: _"This user is an article author. Delete their articles before deleting the user."_
  3. Nếu có `reason`: Nút **Delete** bị vô hiệu hóa (`disabled={Boolean(reason)}`) và dòng cảnh báo hiển thị trên modal. Người dùng không thể xóa được.
  4. Nếu bấm **Cancel**: `setDeleting(null)`, modal đóng lại, không có dữ liệu nào bị thay đổi.
  5. Nếu bản ghi không bị ràng buộc và người dùng bấm **Delete**:
     - Gọi `onDelete(entity, deleting.id)` truyền lên `remove()` trong `App.jsx`.
     - `deleteRecord()` lọc bỏ bản ghi bằng phương thức bất biến:
       `list = data[entity].filter(item => item.id !== id)`.
     - `App.jsx` cập nhật `data`, đồng bộ `localStorage`, đóng modal và hiện Toast thông báo _"Record deleted successfully."_.

---

### 16. Cài đặt cấu hình tòa soạn & Tên hiển thị (Settings)

- **Vị trí file & dòng code:**
  - [src/pages/SettingsPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/SettingsPage.jsx#L16-L119): Toàn bộ component `SettingsPage`.
  - [src/pages/SettingsPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/SettingsPage.jsx#L18): State `const [form, setForm] = useState({ ...settings })`.
  - [src/pages/SettingsPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/SettingsPage.jsx#L28-L39): Hàm `submit(event)`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L240-L246): Nhận cài đặt mới và cập nhật `setData({ ...data, settings })`.

- **Các hàm liên quan:** `submit()` (SettingsPage), `onSave()` (App).

- **Luồng hoạt động (Operational Flow):**
  1. Người dùng vào trang Settings, chỉnh sửa `Display name` hoặc `Publication name`.
  2. Bấm nút **Save preferences**.
  3. Hàm `submit(event)` chạy:
     - Kiểm tra nếu `displayName` hoặc `publicationName` bị để trống -> gán `error = "Display name and publication name are required."`.
     - Nếu hợp lệ: gọi callback `onSave(...)` truyền dữ liệu đã trim lên `App.jsx`.
  4. Trong `App.jsx`: `setData({ ...data, settings })` cập nhật state `data`.
  5. `useEffect` tự động đồng bộ cấu hình mới vào `localStorage`.
  6. Header của ứng dụng ngay lập tức hiển thị tên người dùng mới và màn hình Dashboard hiển thị tên tòa soạn mới. Hiện Toast thông báo _"Preferences saved successfully."_.

---

### 17. Hệ thống thông báo Toast & Cảnh báo lỗi lưu trữ

- **Vị trí file & dòng code:**
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L69): State `const [warning, setWarning] = useState(loaded.warning)`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L72): State `const [notice, setNotice] = useState('')`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L83-L89): Hook `useEffect` hẹn giờ tự tắt Toast sau 4.5 giây.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L196-L207): Render thanh thông báo cảnh báo `.storage-warning`.
  - [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx#L251-L261): Render hộp thông báo Toast `.toast-message`.

- **Các hàm liên quan:** `setNotice()`, `setWarning()`, `setTimeout()`.

- **Luồng hoạt động (Operational Flow):**
  1. **Thông báo Toast (Thành công):**
     - Khi bất kỳ thao tác Thêm / Sửa / Xóa / Lưu cài đặt hoàn tất thành công, hàm gọi `setNotice("Nội dung thông báo")`.
     - Hộp Toast xuất hiện cố định ở góc dưới bên phải màn hình (`role="status"`).
     - Hook `useEffect` tự động chạy hàm `setTimeout(() => setNotice(''), 4500)` để đóng thông báo sau 4.5 giây, hoặc người dùng có thể chủ động bấm nút [X] (`aria-label="Dismiss notification"`) để tắt ngay lập tức.
  2. **Cảnh báo Storage (Lỗi lưu trữ):**
     - Nếu localStorage bị đầy (QuotaExceededError) hoặc bị trình duyệt chặn, hàm `saveData` trả về thông báo lỗi và `setWarning(error)` được kích hoạt.
     - Thanh cảnh báo màu vàng hiển thị ở đầu trang để người dùng biết dữ liệu chỉ tạm thời tồn tại trong phiên duyệt web hiện tại.

---

## BẢNG TỔNG KẾT TRA CỨU FILE TOÀN DỰ ÁN

| Đường dẫn File                                                                                                                             | Vai trò chính trong hệ thống                                                                                              |
| :----------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| [src/services/dataService.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/services/dataService.js)       | Chứa toàn bộ nghiệp vụ: Load/Save Storage, Validate form, CRUD bất biến, Kiểm tra ràng buộc xóa, Tìm kiếm/lọc, Mock Login |
| [src/App.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/App.jsx)                                       | Quản lý state toàn cục (`data`, `user`, `page`, `notice`), điều hướng trang, điều phối các hàm CRUD                       |
| [src/data/seed.js](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/data/seed.js)                             | Khởi tạo dữ liệu mẫu ban đầu cho Categories, Users, News và Settings mặc định                                             |
| [src/pages/LoginPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/LoginPage.jsx)               | Giao diện và xử lý đăng nhập, ẩn/hiện mật khẩu, kiểm tra tài khoản mẫu                                                    |
| [src/pages/DashboardPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/DashboardPage.jsx)       | Hiển thị 3 thẻ thống kê tổng quan, bảng 5 bài viết mới nhất và nút tạo bài viết nhanh                                     |
| [src/pages/ManagementPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/ManagementPage.jsx)     | Trang quản lý dùng chung cho Category, News, Users: Tìm kiếm, Bộ lọc, Hiển thị bảng, Mở form, Xác nhận xóa                |
| [src/pages/SettingsPage.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/pages/SettingsPage.jsx)         | Giao diện chỉnh sửa tên hiển thị quản trị viên và tên tòa soạn / ấn phẩm                                                  |
| [src/components/AdminLayout.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/AdminLayout.jsx) | Khung bố cục Master Layout kết hợp Header, Sidebar điều hướng và Footer                                                   |
| [src/components/RecordForm.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/RecordForm.jsx)   | Biểu mẫu động dùng chung cho Thêm mới và Chỉnh sửa, tích hợp validate và nút Reset                                        |
| [src/components/Modal.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/Modal.jsx)             | Hộp thoại modal chuẩn thẻ `<dialog>` HTML5, tự động bẫy focus và hỗ trợ phím Escape                                       |
| [src/components/StatusBadge.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/StatusBadge.jsx) | Huy hiệu hiển thị trạng thái Active (xanh lá nhạt) hoặc Inactive (xám nhạt)                                               |
| [src/components/Brand.jsx](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/components/Brand.jsx)             | Component thương hiệu hiển thị icon và chữ FUNews trên thanh Sidebar                                                      |
| [src/styles.css](file:///c:/Users/PC/Documents/Semester7/sba301/SBA301_Ass1/BENVA_CE190709/src/styles.css)                                 | Toàn bộ định dạng giao diện sáng (Light Theme) đơn giản, chuẩn mực, responsive trên di động                               |
