/**
 * Author: Võ Anh Ben - SE1910
 * Tệp cấu hình Axios Client trung tâm của hệ thống Frontend FUMiniHotelSystem
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG TRUYỀN DẪN DỮ LIỆU HTTP (HTTP CLIENT & JWT INTERCEPTOR PIPELINE)
 * ===================================================================================
 * 
 * 1. Khởi tạo Axios Instance:
 *    - `baseURL`: Trỏ trực tiếp đến Spring Boot REST API tại 'http://localhost:8080/api'.
 *    - `Content-Type`: 'application/json' cho toàn bộ payload truyền đi.
 *    - `timeout`: 10000ms (10 giây) tránh tình trạng treo kết nối khi mạng chậm hoặc server bận.
 * 
 * 2. Luồng Request Interceptor (Gắn JWT Bearer Token tự động):
 *    - Khi bất kỳ Component/Page nào kích hoạt thao tác gọi API (Click nút Lấy dữ liệu, Thêm, Sửa, Xóa):
 *      + Request đi qua hàm Interceptor này trước khi bay qua mạng tới Server.
 *      + Đọc khóa 'fumini_hotel_user' trong `sessionStorage`.
 *      + Nếu tìm thấy đối tượng User và có `user.token` (chuỗi JWT sinh bởi Backend):
 *        -> Tự động gán Header: `Authorization: Bearer <token>`.
 *      + Kết quả: Phía Backend Spring Boot sẽ nhận được Token, qua lớp `JwtAuthenticationFilter`
 *        để xác minh danh tính và phân quyền (Staff/Customer) mà component không cần truyền thủ công.
 * 
 * 3. Luồng Response Interceptor (Chuẩn hóa thông điệp lỗi & Phản hồi):
 *    - Khi Spring Boot phản hồi về Client:
 *      + Nếu HTTP Status 2xx (Thành công): Trả thẳng dữ liệu `response` về cho caller.
 *      + Nếu HTTP Status 4xx/5xx (Thất bại / Lỗi nghiệp vụ):
 *        -> Trích xuất thông điệp chi tiết từ `error.response.data.message` (do GlobalExceptionHandler hoặc Security trả về).
 *        -> Nếu không có, dự phòng lấy `error.response.data.error` hoặc `error.message`.
 *        -> Đóng gói thành `new Error(message)` và reject Promise.
 *        -> Kết quả: Component gọi API trong khối `try/catch` sẽ bắt đúng thông điệp lỗi tiếng Việt rõ ràng
 *           để hiển thị lên Toast Notification hoặc Alert.
 */

import axios from 'axios';

// Khởi tạo instance Axios dùng chung toàn ứng dụng
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Địa chỉ gốc của Spring Boot REST API
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Thời gian chờ tối đa 10 giây
});

/**
 * Request Interceptor:
 * Giải thuật tự động đính kèm Token xác thực:
 * Input: config request chuẩn bị gửi đi
 * Process: Lấy token từ sessionStorage -> Gắn vào Authorization header
 * Output: config đã được bảo vệ bằng JWT Bearer Token
 */
api.interceptors.request.use(
  (config) => {
    try {
      const stored = sessionStorage.getItem('fumini_hotel_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.token) {
          // Gắn token theo chuẩn RFC 6750 Bearer Token
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch {
      // Bỏ qua nếu parse JSON lỗi, gửi request nguyên bản
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Giải thuật chuẩn hóa thông điệp lỗi:
 * Input: HTTP Response hoặc Error từ máy chủ
 * Process: Phân tích mã lỗi và bóc tách câu thông báo chi tiết
 * Output: Promise.resolve(response) nếu thành công hoặc Promise.reject(Error) với nội dung rõ nghĩa
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Không thể kết nối đến máy chủ Spring Boot (8080)';
    return Promise.reject(new Error(message));
  }
);

export default api;
