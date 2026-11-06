/**
 * Author: Võ Anh Ben - SE1910
 * Dịch vụ Xác thực người dùng (Authentication Service)
 * Quản lý phiên đăng nhập và giao tiếp với endpoint `/api/auth` của Spring Boot Backend.
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU XÁC THỰC (AUTHENTICATION & SESSION ALGORITHM)
 * ===================================================================================
 * 
 * 1. Luồng Đăng nhập (Login Flow):
 *    - Khi người dùng nhấn nút "Đăng nhập" tại `LoginPage.jsx`:
 *      + Form thu thập `{ email, password }`.
 *      + Gọi hàm `authService.login(email, password)`.
 *      + Gửi HTTP POST tới Backend: `/api/auth/login`.
 *      + Backend xử lý:
 *        * Kiểm tra khớp với `application.properties` -> Nếu đúng là Staff: cấp token mang quyền Staff.
 *        * Kiểm tra bảng `Customer` trong SQL Server -> Nếu đúng: kiểm tra mật khẩu, cấp token mang quyền Customer.
 *      + Phản hồi nhận về: Đối tượng `LoginResponse` chứa `{ token, accountId, accountName, accountEmail, accountRole, role }`.
 *      + Lưu trữ phiên: Mã hóa JSON và lưu vào `sessionStorage` với khóa `'fumini_hotel_user'`.
 *      + Trả dữ liệu về cho `LoginPage.jsx` -> Kích hoạt callback `onLoginSuccess(user)` trên `App.jsx`.
 * 
 * 2. Luồng Đăng ký (Register Flow):
 *    - Khi khách hàng điền form và nhấn "Tạo tài khoản" tại tab Đăng ký của `LoginPage.jsx`:
 *      + Gọi hàm `authService.register(customerData)`.
 *      + Gửi HTTP POST tới Backend: `/api/auth/register`.
 *      + Payload: `{ customerFullName, telephone, emailAddress, customerBirthday, password }`.
 *      + Backend kiểm tra email trùng lặp -> Lưu Customer mới vào DB với `CustomerStatus = 1` (Active).
 *      + Trả về đối tượng Customer vừa tạo.
 * 
 * 3. Luồng Khôi phục Phiên (Session Restore Flow):
 *    - Khi mở ứng dụng hoặc tải lại trang F5:
 *      + Gọi `authService.getCurrentUser()`.
 *      + Đọc từ `sessionStorage`. Nếu có, parse JSON trả về thông tin người dùng đang online.
 *      + Giúp duy trì trạng thái đăng nhập liên tục mà không bị văng ra ngoài.
 * 
 * 4. Luồng Đăng xuất (Logout Flow):
 *    - Khi người dùng nhấn "Đăng xuất" tại thanh Sidebar:
 *      + Gọi `authService.logout()`.
 *      + Xóa sạch mục `'fumini_hotel_user'` trong `sessionStorage`.
 *      + Đưa trạng thái ứng dụng trở lại màn hình Khách vãng lai xem phòng (`public`).
 */

import api from './api.js';

// Khóa định danh lưu trữ thông tin phiên làm việc trong trình duyệt
const AUTH_USER_KEY = 'fumini_hotel_user';

export const authService = {
  /**
   * Giải thuật Đăng nhập hệ thống:
   * @param {string} email - Địa chỉ email đăng nhập
   * @param {string} password - Mật khẩu đăng nhập
   * @returns {Promise<Object>} Đối tượng thông tin người dùng kèm JWT Token từ server
   */
  async login(email, password) {
    // 1. Gửi request POST đến Backend /api/auth/login
    const res = await api.post('/auth/login', { email, password });
    // 2. Nhận dữ liệu phản hồi và lưu phiên làm việc vào sessionStorage
    if (res.data) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data));
    }
    return res.data;
  },

  /**
   * Giải thuật Đăng ký tài khoản Khách hàng mới:
   * @param {Object} customerData - Thông tin họ tên, email, sđt, ngày sinh, mật khẩu
   * @returns {Promise<Object>} Thông tin khách hàng đã được lưu vào Database
   */
  async register(customerData) {
    // Gửi request POST đến Backend /api/auth/register
    const res = await api.post('/auth/register', customerData);
    return res.data;
  },

  /**
   * Lấy thông tin người dùng hiện tại từ sessionStorage
   * @returns {Object|null} Thông tin người dùng hoặc null nếu chưa đăng nhập
   */
  getCurrentUser() {
    try {
      const stored = sessionStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Cập nhật lại thông tin người dùng trong sessionStorage khi đổi họ tên/hồ sơ
   * @param {Object} user - Đối tượng thông tin người dùng mới
   */
  saveCurrentUser(user) {
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  /**
   * Hủy phiên đăng nhập và dọn dẹp bộ nhớ tạm
   */
  logout() {
    sessionStorage.removeItem(AUTH_USER_KEY);
  },
};
