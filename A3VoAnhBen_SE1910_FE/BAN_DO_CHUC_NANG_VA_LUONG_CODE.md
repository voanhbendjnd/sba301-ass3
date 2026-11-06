# BẢN ĐỒ CHỨC NĂNG, GIẢI THUẬT VÀ LUỒNG DỮ LIỆU TOÀN BỘ FRONTEND

**Tác giả:** Võ Anh Ben - SE1910  
**Dự án:** FUNews Management System (`A2VoAnhBen_SE1910_FE`)  
**Khóa học:** SBA301 - Web Applications Development (Assignment 02)  
**Mục đích tài liệu:** Hướng dẫn tra cứu vị trí file, tên hàm, cấu trúc giải thuật và luồng dữ liệu (Data & Event Flow) chi tiết của toàn bộ hệ thống Frontend kết nối với RESTful API Spring Boot 3 & MS SQL Server.

---

## MỤC LỤC TRA CỨU NHANH

1. [Tổng quan Kiến trúc & Cấu hình Axios Client](#1-tổng-quan-kiến-trúc--cấu-hình-axios-client)
2. [Quản lý Trạng thái Toàn cục & Máy trạng thái Điều hướng (State Machine in App.jsx)](#2-quản-lý-trạng-thái-toàn-cục--máy-trạng-thái-điều-hướng-state-machine-in-appjsx)
3. [Phân hệ Khách vãng lai: Đọc tin tức công khai & Tìm kiếm đa tiêu chí](#3-phân-hệ-khách-vãng-lai-đọc-tin-tức-công-khai--tìm-kiếm-đa-tiêu-chí)
4. [Phân hệ Xác thực: Đăng nhập bằng Email & Mật khẩu (Authentication Flow)](#4-phân-hệ-xác-thực-đăng-nhập-bằng-email--mật-khẩu-authentication-flow)
5. [Phân quyền Quản trị viên (Admin - Role 1): Quản lý Tài khoản (Account Management)](#5-phân-quyền-quản-trị-viên-admin---role-1-quản-lý-tài-khoản-account-management)
6. [Phân quyền Nhân viên (Staff - Role 2): Quản lý Chuyên mục (Category Management)](#6-phân-quyền-nhân-viên-staff---role-2-quản-lý-chuyên-mục-category-management)
7. [Phân quyền Nhân viên (Staff - Role 2): Quản lý Bài viết & Gắn thẻ Tags (News Article Management)](#7-phân-quyền-nhân-viên-staff---role-2-quản-lý-bài-viết--gắn-thẻ-tags-news-article-management)
8. [Phân quyền Nhân viên (Staff - Role 2): Lịch sử bài viết cá nhân (News History)](#8-phân-quyền-nhân-viên-staff---role-2-lịch-sử-bài-viết-cá-nhân-news-history)
9. [Phân quyền Nhân viên (Staff - Role 2): Hồ sơ cá nhân & Đổi mật khẩu (Profile Management)](#9-phân-quyền-nhân-viên-staff---role-2-hồ-sơ-cá-nhân--đổi-mật-khẩu-profile-management)
10. [Hệ thống Thông báo Toast & Cơ chế Bắt lỗi Toàn cục (Toast & Error Handling)](#10-hệ-thống-thông-báo-toast--cơ-chế-bắt-lỗi-toàn-cục-toast--error-handling)

---

## CHI TIẾT TỪNG CHỨC NĂNG & GIẢI THUẬT

### 1. Tổng quan Kiến trúc & Cấu hình Axios Client

- **Vị trí file:** `src/services/api.js`
- **Mục đích:** Khởi tạo instance Axios kết nối Backend tại `http://localhost:8080/api`.
- **Giải thuật Interceptor:**
  - Bắt mọi phản hồi từ Spring Boot.
  - Khi HTTP Status là lỗi (400, 404, 409, 500): Trích xuất thông điệp lỗi nghiệp vụ từ `error.response.data.message` (chuẩn hóa bởi `GlobalExceptionHandler` của Backend).
  - Trả về đối tượng `Error(message)` đồng nhất cho toàn bộ các trang giao diện.

```
[UI Component / Page]
         ↓ (gọi hàm service)
[Service Layer: authService, newsService, ...]
         ↓ (gửi HTTP qua Axios)
[Axios Instance api.js]  ⇄  [Spring Boot REST API :8080]
         ↓ (bắt lỗi nghiệp vụ qua Interceptor)
[Cập nhật State UI & Hiển thị Toast thông báo]
```

---

### 2. Quản lý Trạng thái Toàn cục & Máy trạng thái Điều hướng (State Machine in App.jsx)

- **Vị trí file:** `src/App.jsx`
- **Các State cốt lõi:**
  - `currentUser`: Thông tin phiên đăng nhập `{ accountId, accountName, accountEmail, accountRole }` lấy từ `sessionStorage`.
  - `view`: Trạng thái hiển thị cấp cao:
    - `'public'`: Giao diện đọc tin tức dành cho khách (khi chưa đăng nhập).
    - `'login'`: Giao diện đăng nhập hệ thống.
    - `'app'`: Giao diện làm việc của cán bộ sau khi đã đăng nhập.
  - `page`: Trang chức năng bên trong giao diện `'app'`:
    - Với Admin: `'accounts'`.
    - Với Staff: `'categories'`, `'news'`, `'history'`, `'profile'`.
- **Luồng hoạt động (Operational Flow):**
  1. Khi mở ứng dụng: `App.jsx` kiểm tra `authService.getCurrentUser()`. Nếu chưa có user -> hiển thị `view = 'public'`.
  2. Bấm "Đăng nhập cán bộ" -> Chuyển `view = 'login'`.
  3. Đăng nhập thành công -> Lưu session, chuyển `view = 'app'` và tự động mở đúng trang theo vai trò (`user.accountRole`).
  4. Bấm "Đăng xuất" -> Xóa session, chuyển `view = 'public'`.

---

### 3. Phân hệ Khách vãng lai: Đọc tin tức công khai & Tìm kiếm đa tiêu chí

- **Vị trí file:** `src/pages/PublicNewsPage.jsx`
- **Endpoint API:**
  - `GET /api/news/public`: Lấy danh sách tin tức Active (`newsStatus = 1`).
  - `GET /api/categories`: Lấy danh sách chuyên mục.
- **Giải thuật Lọc đa tiêu chí theo thời gian thực (Realtime Multi-criteria Filter):**
  - **Input:** Mảng gốc `newsList`, chuyên mục đang chọn `selectedCat` ('ALL' hoặc `categoryId`), từ khóa tìm kiếm `searchKw`.
  - **Xử lý:**
    ```javascript
    const filteredNews = newsList.filter((item) => {
      // 1. Kiểm tra chuyên mục
      const matchCat = selectedCat === 'ALL' || item.category?.categoryId === Number(selectedCat);
      // 2. Kiểm tra từ khóa không phân biệt hoa thường
      const kw = searchKw.trim().toLowerCase();
      const matchKw = !kw || 
        item.newsTitle?.toLowerCase().includes(kw) ||
        item.headline?.toLowerCase().includes(kw) ||
        item.newsContent?.toLowerCase().includes(kw);
      return matchCat && matchKw;
    });
    ```
  - **Output:** Mảng `filteredNews` được render ra danh sách các thẻ bài viết (Cards).
- **Luồng Xem chi tiết bài viết:**
  - Nhấn nút "Chi tiết" tại một thẻ tin -> `setReadingArticle(article)`.
  - Popup Modal xuất hiện hiển thị: Tiêu đề, chuyên mục, ngày đăng, nguồn tin, tóm tắt, toàn văn nội dung và danh sách các thẻ tags.

---

### 4. Phân hệ Xác thực: Đăng nhập bằng Email & Mật khẩu (Authentication Flow)

- **Vị trí file:** `src/pages/LoginPage.jsx` & `src/services/authService.js`
- **Endpoint API:** `POST /api/auth/login`
- **Luồng hoạt động (Data Flow):**
  1. Người dùng nhập Email và Mật khẩu trên Form.
  2. Client-side Validation: Kiểm tra email và password không được để trống.
  3. Gửi payload `{ email: "...", password: "..." }` qua `authService.login()`.
  4. Xử lý phản hồi:
     - Nếu thành công: Nhận về dữ liệu tài khoản, lưu chuỗi JSON vào `sessionStorage` với key `'funews_user'`.
     - Gọi `onLoginSuccess(user)` -> `App.jsx` kích hoạt phân luồng giao diện:
       - Nếu `accountRole === 1`: Điều hướng vào trang Quản lý Tài khoản (Admin).
       - Nếu `accountRole === 2`: Điều hướng vào trang Quản lý Bài viết (Staff).
     - Nếu thất bại: Backend trả về lỗi 400 (Bad Request) -> Hiển thị thông báo đỏ trên màn hình đăng nhập.
  5. Có sẵn 2 nút chọn nhanh tài khoản demo: Admin (`admin@funews.com` / `123456`) và Staff (`staff@funews.com` / `123456`).

---

### 5. Phân quyền Quản trị viên (Admin - Role 1): Quản lý Tài khoản (Account Management)

- **Vị trí file:** `src/pages/AccountManagementPage.jsx` & `src/services/accountService.js`
- **Endpoint API:**
  - `GET /api/accounts`: Danh sách tất cả tài khoản.
  - `POST /api/accounts`: Tạo mới tài khoản (Họ tên, Email, Vai trò, Mật khẩu).
  - `PUT /api/accounts/{id}`: Cập nhật thông tin tài khoản.
  - `DELETE /api/accounts/{id}`: Xóa tài khoản.
  - `GET /api/accounts/search?keyword=...`: Tìm kiếm theo Họ tên hoặc Email.
- **Ràng buộc nghiệp vụ xóa tài khoản (Delete Constraint Rule):**
  - **Đề bài quy định:** *"The delete action will delete an account in the case this account is not belong to any news articles (created). If the account is already created any news article, cannot delete."*
  - **Luồng dữ liệu khi Xóa:**
    1. Bấm nút Xóa trên bảng -> Mở Popup Modal xác nhận với thông tin tài khoản.
    2. Bấm "Xác nhận xóa" -> Gửi request `DELETE /api/accounts/{id}`.
    3. Nếu tài khoản đã từng tạo bài viết:
       - Backend kiểm tra `countByCreatedById(id) > 0` và trả về mã HTTP `409 Conflict` kèm thông điệp: *"Không thể xóa tài khoản này vì tài khoản đã tạo X bài viết!"*.
       - Frontend bắt lỗi tại khối `catch` và gọi `showToast(err.message, 'danger')`.
       - Màn hình xuất hiện Toast màu đỏ cảnh báo từ chối xóa, giữ toàn vẹn dữ liệu.

---

### 6. Phân quyền Nhân viên (Staff - Role 2): Quản lý Chuyên mục (Category Management)

- **Vị trí file:** `src/pages/CategoryManagementPage.jsx` & `src/services/categoryService.js`
- **Endpoint API:**
  - `GET /api/categories`: Danh sách chuyên mục.
  - `POST /api/categories`: Tạo chuyên mục mới qua Popup Dialog.
  - `PUT /api/categories/{id}`: Cập nhật chuyên mục qua Popup Dialog.
  - `DELETE /api/categories/{id}`: Xóa chuyên mục.
  - `GET /api/categories/search?keyword=...`: Tìm kiếm theo tên hoặc mô tả.
- **Ràng buộc nghiệp vụ xóa chuyên mục (Delete Constraint Rule):**
  - **Đề bài quy định:** *"Category management (The delete action will delete an item in the case this item is not belong to any news articles. If the item is already stored in a news article cannot delete.)"*
  - **Luồng dữ liệu khi Xóa:**
    1. Bấm nút Xóa -> Mở Modal xác nhận xóa chuyên mục.
    2. Gửi request `DELETE /api/categories/{id}`.
    3. Nếu chuyên mục đang chứa bài viết:
       - Backend kiểm tra `countByCategory_CategoryId(id) > 0` -> Trả về HTTP `409 Conflict` với thông điệp: *"Không thể xóa chuyên mục này vì đang có X bài viết thuộc về nó!"*.
       - Frontend bắt lỗi và hiển thị Toast đỏ cảnh báo chi tiết.

---

### 7. Phân quyền Nhân viên (Staff - Role 2): Quản lý Bài viết & Gắn thẻ Tags (News Article Management)

- **Vị trí file:** `src/pages/NewsManagementPage.jsx` & `src/services/newsService.js`
- **Endpoint API:**
  - `GET /api/news`: Lấy toàn bộ bài viết trong hệ thống.
  - `POST /api/news`: Tạo bài viết mới.
  - `PUT /api/news/{id}`: Chỉnh sửa bài viết.
  - `DELETE /api/news/{id}`: Xóa bài viết.
  - `GET /api/news/search?keyword=...`: Tìm kiếm bài viết.
  - `GET /api/tags`: Lấy danh sách các thẻ tags để chọn.
- **Giải thuật Multi-select Thẻ Tags (Tag Toggle Algorithm):**
  - Mỗi khi nhân viên bấm vào một thẻ Tag badge trên Modal Form:
    ```javascript
    function toggleTag(tagId) {
      setFormData((prev) => {
        const exists = prev.tagIds.includes(tagId);
        return {
          ...prev,
          tagIds: exists
            ? prev.tagIds.filter((id) => id !== tagId) // Bỏ chọn
            : [...prev.tagIds, tagId],                 // Thêm vào
        };
      });
    }
    ```
- **Luồng Tạo/Sửa Bài viết:**
  - Nhập Tiêu đề (`newsTitle`), Tóm tắt (`headline`), Chuyên mục (`categoryId`), Nguồn tin (`newsSource`), Nội dung (`newsContent`), Trạng thái (`newsStatus`: 1 Active / 0 Inactive), Thẻ Tags (`tagIds`).
  - Hệ thống tự động gán `createdById = currentUser.accountId`.
  - Gửi POST / PUT lên Backend -> Dữ liệu được lưu vào bảng `NewsArticle` và bảng liên kết `NewsTag` trong SQL Server.

---

### 8. Phân quyền Nhân viên (Staff - Role 2): Lịch sử bài viết cá nhân (News History)

- **Vị trí file:** `src/pages/NewsHistoryPage.jsx`
- **Endpoint API:** `GET /api/news/history?staffId={accountId}`
- **Đề bài quy định:** *"Staff role is allowed to: View news history created by him/her."*
- **Giải thuật Thống kê Số liệu Tổng hợp (Aggregation Stats Algorithm):**
  - Khi tải về danh sách bài viết `historyList` của riêng nhân viên đang đăng nhập:
    - Tổng bài viết: `historyList.length`.
    - Bài viết đã xuất bản (Active): `historyList.filter(n => n.newsStatus === 1).length`.
    - Bản nháp / Tạm ẩn: `historyList.length - activeCount`.
  - Hiển thị 3 thẻ Widget đếm số liệu ở đầu trang và bảng danh sách có hiển thị ngày cập nhật lần cuối `modifiedDate`.

---

### 9. Phân quyền Nhân viên (Staff - Role 2): Hồ sơ cá nhân & Đổi mật khẩu (Profile Management)

- **Vị trí file:** `src/pages/ProfilePage.jsx`
- **Endpoint API:** `PUT /api/accounts/{id}`
- **Đề bài quy định:** *"Staff role is allowed to: Manage his/her the profile."*
- **Luồng Đồng bộ Phiên sau Cập nhật (Session Synchronization Flow):**
  1. Nhân viên xem thông tin hiện tại: Họ tên, Email (chỉ đọc), Vai trò (chỉ đọc).
  2. Nhân viên có thể chỉnh sửa Họ tên và nhập Mật khẩu mới (kèm xác nhận mật khẩu).
  3. Khi nhấn "Lưu thay đổi":
     - Gửi HTTP PUT `/api/accounts/{id}`.
     - Sau khi Backend cập nhật thành công:
       ```javascript
       const newSessionUser = {
         ...currentUser,
         accountName: updated.accountName,
       };
       authService.saveCurrentUser(newSessionUser);
       onProfileUpdated(newSessionUser);
       ```
     - State toàn cục trên `App.jsx` được làm mới -> Tên hiển thị trên thanh Header và Avatar Sidebar tự động cập nhật ngay lập tức mà không cần F5 tải lại trang!

---

### 10. Hệ thống Thông báo Toast & Cơ chế Bắt lỗi Toàn cục (Toast & Error Handling)

- **Vị trí file:** `src/App.jsx`
- **Cơ chế hoạt động:**
  - Component con gọi hàm `showToast(message, type)`.
  - State `toast = { message, type: 'success' | 'danger' }` được kích hoạt.
  - Giải thuật tự hủy thông báo bằng Timer:
    ```javascript
    useEffect(() => {
      if (!toast) return;
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer); // Cleanup để tránh rò rỉ bộ nhớ
    }, [toast]);
    ```
  - Toast hiển thị cố định ở góc dưới cùng bên phải màn hình (`position-fixed bottom-0 end-0`), có màu xanh (success) hoặc màu đỏ (danger) và có nút đóng nhanh.
