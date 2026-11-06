# BỐI CẢNH RA ĐỜI, BÀI TOÁN THỰC TẾ VÀ GIẢI PHÁP CÔNG NGHỆ CỦA HỆ THỐNG FU MINI HOTEL MANAGEMENT SYSTEM (FUMiniHotelSystem)

**Dự án:** FUMiniHotelSystem (Hệ thống Quản lý Khách sạn & Đặt phòng Trực tuyến An toàn với Spring Boot và ReactJS)  
**Tác giả:** Võ Anh Ben - MSSV: CE190709 - Lớp: SE1910  
**Môn học:** SBA301 - Web Applications Development (Assignment 03: Securing REST Services with Spring Boot)  

---

## 1. TẠI SAO LẠI CÓ DỰ ÁN NÀY? (BỐI CẢNH & VẤN ĐỀ THỰC TẾ)

### 📌 Ví dụ thực tế dễ hình dung:
> Giống như việc **"Một khách sạn mini gia đình hoạt động nhiều năm bằng sổ tay ghi chép hoặc bảng tính Excel rời rạc: Khi mùa cao điểm du lịch đến, khách hàng gọi điện hoặc đến tận quầy nhưng nhân viên không biết phòng nào còn trống, dễ xảy ra tình trạng đặt trùng phòng (overbooking); khách hàng ở xa không có cách nào xem hình ảnh, giá phòng và đặt trước; còn quản lý khách sạn thì lo sợ thất thoát doanh thu, nhân viên vô tình xóa nhầm dữ liệu phòng làm mất toàn bộ hóa đơn lịch sử thanh toán của khách hàng"**.

Trong ngành dịch vụ lưu trú và khách sạn quy mô vừa và nhỏ (Mini Hotel):
1. **Thiếu kênh tương tác trực tuyến cho khách hàng:**
   - Khách du lịch muốn chủ động tra cứu các loại phòng (Standard, Deluxe, Suite, Family...), xem sức chứa và giá cả mọi lúc mọi nơi mà không bắt buộc phải gọi điện thoại hay đến tận nơi.
   - Nhu cầu tự đăng ký tài khoản, tự chọn nhiều phòng cho chuyến du lịch cùng bạn bè/gia đình và xem lại lịch sử đặt phòng cá nhân.
2. **Quy trình vận hành thủ công dễ sai sót và trùng lặp:**
   - Việc ghi nhận đơn đặt phòng thủ công dễ gây nhầm lẫn về ngày Check-in/Check-out, gây xung đột phòng và mất uy tín kinh doanh.
   - Khó kiểm soát trạng thái phòng theo thời gian thực (phòng đang hoạt động `Active` hay tạm dừng phục vụ `Inactive`).
3. **Nguy cơ vi phạm an toàn thông tin và lỗ hổng bảo mật REST API:**
   - Các hệ thống truyền thống lưu mật khẩu dạng văn bản thô (Plaintext), không phân quyền chặt chẽ giữa khách hàng (Customer) và nhân viên quản lý (Staff).
   - Khi chuyển đổi lên Web và API, nếu không có cơ chế xác thực không trạng thái (Stateless Authentication) chuẩn mực, hệ thống dễ bị tấn công giả mạo hoặc đánh cắp quyền truy cập tài nguyên.
4. **Nguy cơ mất mát dữ liệu kế toán và lịch sử giao dịch (Data Integrity):**
   - Nếu nhân viên quản lý xóa thẳng tay một phòng đã từng phục vụ khách (Cascade Hard Delete), toàn bộ lịch sử hóa đơn đặt phòng (`BookingReservation` & `BookingDetail`) liên quan đến phòng đó sẽ bị phá hủy hoặc gây lỗi ràng buộc khóa ngoại, dẫn đến sai lệch báo cáo doanh thu tài chính.

👉 **Chính vì vậy, hệ thống `FUMiniHotelSystem` ra đời nhằm giải quyết toàn diện bài toán: Xây dựng một nền tảng quản lý khách sạn và đặt phòng trực tuyến hiện đại, ứng dụng cơ chế bảo mật xác thực JSON Web Token (JWT) và bảo vệ toàn vẹn dữ liệu giao dịch bằng các quy tắc nghiệp vụ nghiêm ngặt.**

---

## 2. BÀI TOÁN MÀ HỆ THỐNG NÀY GIẢI QUYẾT LÀ GÌ?

Hệ thống tập trung giải quyết **4 bài toán nghiệp vụ cốt lõi**:

### Bài toán 1: Tiếp cận thông tin mở và minh bạch (Dành cho Khách vãng lai / Public Guest)
- **Vấn đề:** Khách vãng lai muốn tham khảo thông tin phòng, giá tiền và tiện nghi một cách tự nhiên mà không bị ép buộc phải đăng nhập.
- **Giải pháp:** Cung cấp trang **Public Room Viewing Portal**:
  - Không cần đăng nhập vẫn xem được toàn bộ danh sách phòng khách sạn đang hoạt động (`Active`).
  - Hiển thị đầy đủ: Số phòng, loại phòng (`RoomType`), sức chứa tối đa (`MaxCapacity`), đơn giá theo ngày (`RoomPricePerDay`) và mô tả tiện nghi.
  - Hỗ trợ tìm kiếm theo số phòng, lọc nhanh theo loại phòng và phân trang rõ ràng.

### Bài toán 2: Đặt phòng trực tuyến và quản lý trải nghiệm cá nhân (Dành cho Khách hàng / Customer)
- **Vấn đề:** Khách hàng cần một cổng thông tin riêng để đăng ký, đặt phòng theo nhu cầu và quản lý lịch sử thanh toán cá nhân.
- **Giải pháp:** Cung cấp phân hệ dành riêng cho **Customer (Role: ROLE_CUSTOMER)**:
  - **Đăng ký tài khoản trực tuyến:** Tự khởi tạo tài khoản với Họ tên, Email, Số điện thoại, Ngày sinh và Mật khẩu (được mã hóa BCrypt an toàn).
  - **Đăng nhập và nhận vé thông hành an toàn:** Xác thực qua JWT Token, tự động lưu trữ và quản lý phiên làm việc.
  - **Đặt phòng trực tuyến đa phòng (Online Booking):** Cho phép khách hàng chọn khoảng thời gian lưu trú (Check-in, Check-out), chọn một hoặc nhiều phòng cùng lúc; hệ thống tự động tính toán tổng số tiền dựa trên số đêm và đơn giá từng phòng.
  - **Xem lịch sử đặt phòng (Booking History):** Theo dõi toàn bộ các đơn đặt phòng trong quá khứ và hiện tại kèm chi tiết từng phòng đã thuê.
  - **Quản lý hồ sơ cá nhân (My Profile):** Cập nhật thông tin liên hệ và đổi mật khẩu an toàn.

### Bài toán 3: Quản trị vận hành khách sạn toàn diện (Dành cho Nhân viên / Staff)
- **Vấn đề:** Nhân viên khách sạn cần công cụ tập trung để kiểm soát khách hàng, phòng ốc và toàn bộ đơn đặt phòng trên toàn hệ thống.
- **Giải pháp:** Cung cấp phân hệ làm việc chuyên nghiệp cho **Staff (Role: ROLE_STAFF)** (tài khoản quản trị được cấu hình trong `application.properties`):
  - **Quản lý danh mục khách hàng (Customer Management):** Tra cứu khách hàng theo tên, email; xem lịch sử đăng ký; thêm mới, chỉnh sửa và vô hiệu hóa tài khoản vi phạm.
  - **Quản lý thông tin phòng (Room Management):** Khởi tạo phòng mới, liên kết loại phòng, cấu hình số lượng khách tối đa, đơn giá và mô tả phòng.
  - **Quản lý đơn đặt phòng toàn hệ thống (Booking Management):** Giám sát toàn bộ giao dịch đặt phòng của mọi khách hàng, kiểm tra chi tiết ngày nhận/trả phòng và trạng thái thanh toán.

### Bài toán 4: Bảo vệ toàn vẹn dữ liệu bằng quy tắc nghiệp vụ nghiêm ngặt (Data Integrity Rule)
- **Vấn đề:** Ngăn ngừa việc xóa nhầm phòng đang có dữ liệu hóa đơn, đảm bảo không làm đứt gãy dữ liệu lịch sử kế toán.
- **Giải pháp áp dụng Quy tắc xóa phòng (Room Deletion Policy) theo chuẩn đề bài:**
  - **Trường hợp 1 (Phòng đã từng được thuê):** Nếu phòng đó đã tồn tại trong bất kỳ chi tiết đặt phòng nào (`BookingDetail`) $\rightarrow$ Hệ thống **TUYỆT ĐỐI KHÔNG XÓA VẬT LÝ** (Hard Delete) khỏi cơ sở dữ liệu, mà tự động **chuyển trạng thái sang `Inactive` (Soft Delete / RoomStatus = 2)**. Điều này đảm bảo lịch sử đơn đặt phòng cũ vẫn tra cứu được đầy đủ thông tin phòng đã thuê và đơn giá thời điểm đó.
  - **Trường hợp 2 (Phòng chưa từng được thuê):** Nếu phòng mới tạo và chưa phát sinh bất kỳ giao dịch thuê nào $\rightarrow$ Hệ thống cho phép **xóa hoàn toàn** (Hard Delete) khỏi cơ sở dữ liệu để giải phóng bộ nhớ.

---

## 3. CÔNG NGHỆ ĐƯỢC SỬ DỤNG VÀ KIẾN TRÚC HỆ THỐNG

Dự án áp dụng mô hình kiến trúc phân tầng hiện đại chuẩn doanh nghiệp, phân tách hoàn toàn giữa **Backend RESTful API (Spring Boot 3 + Spring Security + JWT)** và **Frontend Single Page Application (ReactJS 19 + Axios + Bootstrap 5)**:

```
[ Khách vãng lai / Khách hàng / Nhân viên ]
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│             FRONTEND (ReactJS 19 + Vite)               │
│  - PublicRoomView: Tra cứu phòng công khai             │
│  - Customer Portal: Booking, History, Profile          │
│  - Staff Portal: Room, Customer, Booking Management    │
│  - Axios Interceptor: Tự động đính kèm JWT Bearer Token│
└───────────────────────────┬────────────────────────────┘
                            │  HTTP / JSON (RESTful API)
                            │  Header: Authorization: Bearer <JWT>
                            ▼
┌────────────────────────────────────────────────────────┐
│             BACKEND (Spring Boot 3 REST API)           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Security Filter Chain: JWT Authentication Filter │  │
│  │ (AuthEntryPointJwt 401, AccessDeniedHandler 403) │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Controller Layer: Định tuyến & Tiếp nhận Request │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Service Layer: Logic nghiệp vụ, Tính giá, SoftDel│  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Repository Layer: Spring Data JPA / Hibernate    │  │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │  SQL Queries (JDBC / Hibernate Dialect)
                            ▼
┌────────────────────────────────────────────────────────┐
│             DATABASE (Microsoft SQL Server)            │
│  - Bảng: Customer, RoomType, RoomInformation,          │
│          BookingReservation, BookingDetail             │
└────────────────────────────────────────────────────────┘
```

---

### A. Phía Backend: Spring Boot 3 & Spring Security & Microsoft SQL Server

1. **Spring Boot 3.x & Java 21:**
   - Cung cấp nền tảng phát triển ứng dụng Microservice/REST API mạnh mẽ, tốc độ khởi động nhanh, tích hợp sẵn các Starter thông minh.
2. **Kiến trúc bảo mật Spring Security 6 & JSON Web Token (JWT):**
   - **Xác thực không trạng thái (Stateless Session Management):** Máy chủ không cần lưu session trong RAM, giúp hệ thống dễ dàng mở rộng theo chiều ngang (Horizontally Scalable).
   - **`JwtTokenProvider` & `JwtAuthenticationFilter`:** Đóng gói thông tin người dùng (Email, Role) vào token JWT có ký số bí mật (Secret Key) và thời hạn hết hạn (`Expiration`). Mọi request gửi lên đều được filter kiểm tra tính hợp lệ trước khi cấp phép.
   - **Xử lý ngoại lệ bảo mật chuẩn REST:**
     - `AuthEntryPointJwt`: Bắt lỗi và trả về mã `401 Unauthorized` kèm thông báo JSON khi người dùng chưa đăng nhập hoặc token không hợp lệ.
     - `CustomAccessDeniedHandler`: Bắt lỗi và trả về mã `403 Forbidden` khi người dùng không đủ quyền hạn (ví dụ: Customer cố tình truy cập API quản lý phòng của Staff).
   - **Mã hóa mật khẩu BCrypt (`BCryptPasswordEncoder`):** Đảm bảo mật khẩu lưu trong cơ sở dữ liệu được băm 1 chiều kèm salt ngẫu nhiên, chống tấn công bảng băm (Rainbow Table).
3. **Kiến trúc 3 lớp chuẩn mực (Controller - Service - Repository):**
   - **Controller Layer (`@RestController`):** Cung cấp các endpoint RESTful chuẩn ngữ nghĩa HTTP (`GET`, `POST`, `PUT`, `DELETE`):
     - `/api/auth/**`: Đăng ký, đăng nhập.
     - `/api/rooms/**`: Tra cứu phòng công khai, quản lý phòng (Staff).
     - `/api/room-types/**`: Danh mục loại phòng.
     - `/api/customers/**`: Quản lý khách hàng (Staff) & xem hồ sơ cá nhân.
     - `/api/bookings/**`: Đặt phòng, xem lịch sử (Customer) & quản trị toàn bộ đơn (Staff).
   - **Service Layer (`@Service`):** Thực thi toàn bộ quy tắc nghiệp vụ: Xác thực tài khoản Staff từ `application.properties`, mã hóa mật khẩu, kiểm tra email trùng lặp, tính tiền phòng theo số ngày, và **kiểm tra lịch sử thuê để soft delete phòng**.
   - **Repository Layer (`@Repository`):** Sử dụng Spring Data JPA để tự động hóa truy vấn dữ liệu, tối ưu hóa câu lệnh SQL và giảm thiểu mã nguồn lặp lại.
4. **Hệ thống cơ sở dữ liệu quan hệ (Microsoft SQL Server):**
   - Thiết kế chuẩn 3NF với 5 thực thể cốt lõi:
     - `Customer`: Khách hàng (CustomerID, CustomerFullName, Telephone, EmailAddress, CustomerBirthday, CustomerStatus, Password).
     - `RoomType`: Loại phòng (RoomTypeID, RoomTypeName, TypeDescription, TypeNote).
     - `RoomInformation`: Thông tin phòng (RoomID, RoomNumber, RoomDetailDescription, RoomMaxCapacity, RoomTypeID, RoomStatus, RoomPricePerDay).
     - `BookingReservation`: Đơn đặt phòng (BookingReservationID, BookingDate, TotalPrice, CustomerID, BookingStatus).
     - `BookingDetail`: Chi tiết từng phòng thuê (BookingReservationID, RoomID, StartDate, EndDate, ActualPrice).

---

### B. Phía Frontend: ReactJS 19 + Vite + Axios + Bootstrap 5

1. **ReactJS (Phiên bản React 19) & Single Page Application (SPA):**
   - Trải nghiệm mượt mà không cần tải lại trang web (No page refresh).
   - Quản lý trạng thái bằng **React Hooks (`useState`, `useEffect`, `useCallback`)** tối ưu hiệu năng render.
   - Định tuyến linh hoạt với cấu trúc điều hướng phân quyền: Menu và chức năng tự động ẩn/hiện tương ứng với vai trò của người dùng (`Guest`, `Customer`, `Staff`).
2. **Axios Client & Centralized Interceptors (`api.js`):**
   - **Request Interceptor:** Tự động kiểm tra `localStorage` và gắn tiêu đề `Authorization: Bearer <token>` vào mọi HTTP request gửi đến Backend.
   - **Response Interceptor:** Tập trung xử lý các mã lỗi HTTP toàn cục: Khi gặp `401 Unauthorized` hoặc `403 Forbidden`, hệ thống sẽ bóc tách thông điệp lỗi chi tiết từ server và hiển thị Toast cảnh báo thân thiện cho người dùng.
3. **Giao diện hiện đại với Bootstrap 5 & Lucide React:**
   - Hệ thống lưới Responsive (Grid System) tương thích hoàn hảo từ màn hình điện thoại di động đến máy tính để bàn.
   - Thẻ Card hiển thị phòng nghỉ sang trọng, kèm biểu tượng trực quan (giường, người, tiền tệ, lịch...).
4. **Tuân thủ 100% trải nghiệm người dùng theo yêu cầu đề bài:**
   - Mọi thao tác Thêm mới / Cập nhật phòng và khách hàng đều được thực hiện qua **Modal Dialog Popup** tiện lợi.
   - Thao tác Xóa luôn đi kèm **Hộp thoại xác nhận (Confirm Dialog)** cảnh báo trước khi thực hiện.
   - Thông báo kết quả tức thì qua hệ thống **Toast Notifications** sắc nét, không gây gián đoạn luồng làm việc.

---

## 4. BẢNG TỔNG KẾT VAI TRÒ VÀ GIÁ TRỊ MANG LẠI

| Đối tượng | Quyền hạn và Tính năng nổi bật | Giá trị thực tiễn mang lại |
| :--- | :--- | :--- |
| **Khách vãng lai (Guest)** | • Xem danh sách toàn bộ phòng khách sạn (`Active`)<br>• Tìm kiếm phòng theo số phòng, lọc theo loại phòng<br>• Đăng ký tài khoản khách hàng mới | Tiếp cận dịch vụ nhanh chóng, minh bạch về giá cả và phòng trống mà không bị rào cản đăng nhập. |
| **Khách hàng (Customer)** | • Đăng nhập an toàn qua JWT<br>• Đặt 1 hoặc nhiều phòng trực tuyến trong cùng 1 đơn<br>• Xem lịch sử đặt phòng & chi tiết từng phòng<br>• Quản lý thông tin hồ sơ cá nhân | Tự chủ hoàn toàn trong việc đặt phòng du lịch, theo dõi chi phí minh bạch và bảo mật thông tin cá nhân. |
| **Nhân viên (Staff)** | • Cấu hình tài khoản qua file cấu hình hệ thống<br>• Quản lý thông tin khách hàng (tìm kiếm, tạo, sửa, xóa)<br>• Quản lý phòng (Thêm, sửa, áp dụng quy tắc xóa phòng)<br>• Xem và quản lý toàn bộ các đơn đặt phòng của khách sạn | Tự động hóa quy trình quản lý, tiết kiệm thời gian, loại bỏ hoàn toàn rủi ro trùng lịch đặt phòng. |
| **Hệ thống & Doanh nghiệp** | • Bảo mật Stateless REST API với JWT & BCrypt<br>• Bảo toàn toàn vẹn dữ liệu kế toán với cơ chế Soft Delete phòng đã thuê<br>• Kiến trúc phân tầng rõ ràng, dễ bảo trì và nâng cấp | Đảm bảo an ninh thông tin, không lo mất mát dữ liệu doanh thu quá khứ, nâng cao năng lực cạnh tranh cho khách sạn. |

---

## 5. THÔNG TIN KIỂM THỬ HỆ THỐNG (DEMO ACCOUNTS)

Hệ thống được khởi tạo sẵn các tài khoản mẫu phục vụ việc kiểm tra và đánh giá:

1. **Tài khoản Nhân viên (Staff):**
   - **Email:** `staff@fuminithotel.com` *(được cấu hình trong `application.properties`)*
   - **Password:** `Staff@123`
   - **Quyền hạn:** Quản lý toàn bộ Khách hàng, Phòng nghỉ và Đơn đặt phòng.

2. **Tài khoản Khách hàng (Customer mẫu):**
   - **Email:** `customer@gmail.com`
   - **Password:** `123456`
   - **Quyền hạn:** Đặt phòng trực tuyến, xem lịch sử đặt phòng của bản thân, quản lý thông tin cá nhân.
   - *(Ngoài ra có thể tự do bấm nút **Đăng ký** trên giao diện để tạo thêm tài khoản khách hàng mới).*
