/**
 * Author: Võ Anh Ben - SE1910
 * Dịch vụ Quản lý Khách hàng (Customer Service)
 * Đóng vai trò là cầu nối giao tiếp HTTP giữa các trang quản lý khách hàng (Frontend)
 * và Controller `/api/customers` (Spring Boot Backend).
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU KHÁCH HÀNG (CUSTOMER CRUD & PROFILE DATA FLOW)
 * ===================================================================================
 * 
 * 1. Lấy toàn bộ danh sách khách hàng (`getAll`):
 *    - Nơi gọi: Hook `useEffect()` khi trang `CustomerManagementPage.jsx` hoặc modal tạo đơn tải lên.
 *    - Gửi request: HTTP GET `/api/customers`.
 *    - Nhận dữ liệu: Mảng các đối tượng `Customer` lưu trong SQL Server.
 *    - Render: Đổ dữ liệu vào bảng danh sách khách hàng.
 * 
 * 2. Tìm kiếm khách hàng (`search`):
 *    - Nơi gọi: Khi người dùng nhập từ khóa và nhấn "Tìm kiếm" tại `CustomerManagementPage.jsx`.
 *    - Gửi request: HTTP GET `/api/customers/search?keyword=...`.
 *    - Nhận dữ liệu: Danh sách khách hàng thỏa mãn điều kiện họ tên, email hoặc số điện thoại.
 * 
 * 3. Thêm mới khách hàng (`create`):
 *    - Nơi gọi: Khi Staff điền form và nhấn "Tạo khách hàng" trên Modal.
 *    - Gửi request: HTTP POST `/api/customers` kèm payload `{ customerFullName, telephone, emailAddress, customerBirthday, customerStatus, password }`.
 *    - Nhận dữ liệu: Đối tượng `Customer` mới đã được lưu thành công kèm ID tự tăng.
 * 
 * 4. Cập nhật khách hàng (`update`):
 *    - Nơi gọi: Khi Staff sửa thông tin trên Modal và nhấn "Lưu thay đổi".
 *    - Gửi request: HTTP PUT `/api/customers/{id}` kèm payload cập nhật.
 *    - Nhận dữ liệu: Đối tượng `Customer` đã được chỉnh sửa.
 * 
 * 5. Xóa khách hàng (`delete`):
 *    - Nơi gọi: Khi Staff nhấn nút Thùng rác và xác nhận xóa trên Modal cảnh báo.
 *    - Gửi request: HTTP DELETE `/api/customers/{id}`.
 *    - Quy tắc nghiệp vụ Backend: Nếu khách hàng đã có đơn đặt phòng, Backend chuyển `customerStatus = 0` (Inactive)
 *      và ném thông báo; nếu chưa có đơn nào sẽ xóa hoàn toàn khỏi DB.
 * 
 * 6. Quản lý hồ sơ cá nhân (`updateProfile`):
 *    - Nơi gọi: Khi khách hàng đăng nhập tự cập nhật thông tin tại `ProfilePage.jsx`.
 *    - Gửi request: HTTP PUT `/api/customers/{id}/profile`.
 *    - Payload: `{ customerFullName, telephone, customerBirthday, oldPassword, newPassword }`.
 *    - Nhận dữ liệu: Đối tượng khách hàng đã cập nhật thông tin thành công.
 */

import api from './api.js';

export const customerService = {
  /**
   * Lấy danh sách toàn bộ khách hàng trong hệ thống (Quyền Staff)
   * @returns {Promise<Array>} Danh sách khách hàng
   */
  async getAll() {
    const res = await api.get('/customers');
    return res.data;
  },

  /**
   * Lấy thông tin chi tiết của 1 khách hàng theo ID
   * @param {number} id - Mã ID khách hàng
   * @returns {Promise<Object>} Thông tin chi tiết khách hàng
   */
  async getById(id) {
    const res = await api.get(`/customers/${id}`);
    return res.data;
  },

  /**
   * Tạo mới 1 khách hàng vào hệ thống
   * @param {Object} data - Dữ liệu biểu mẫu thêm khách hàng
   * @returns {Promise<Object>} Khách hàng đã được tạo
   */
  async create(data) {
    const res = await api.post('/customers', data);
    return res.data;
  },

  /**
   * Cập nhật thông tin khách hàng theo ID
   * @param {number} id - Mã ID khách hàng cần cập nhật
   * @param {Object} data - Dữ liệu cần chỉnh sửa
   * @returns {Promise<Object>} Khách hàng sau khi cập nhật
   */
  async update(id, data) {
    const res = await api.put(`/customers/${id}`, data);
    return res.data;
  },

  /**
   * Xóa khách hàng theo ID
   * @param {number} id - Mã ID khách hàng cần xóa
   * @returns {Promise<Object>} Thông báo kết quả từ server
   */
  async delete(id) {
    const res = await api.delete(`/customers/${id}`);
    return res.data;
  },

  /**
   * Tìm kiếm khách hàng theo từ khóa (họ tên, email, sđt)
   * @param {string} keyword - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách khách hàng khớp từ khóa
   */
  async search(keyword) {
    const res = await api.get('/customers/search', { params: { keyword } });
    return res.data;
  },

  /**
   * Khách hàng tự cập nhật thông tin hồ sơ và đổi mật khẩu
   * @param {number} id - Mã ID khách hàng đang đăng nhập
   * @param {Object} data - Thông tin hồ sơ mới
   * @returns {Promise<Object>} Thông tin khách hàng đã đồng bộ
   */
  async updateProfile(id, data) {
    const res = await api.put(`/customers/${id}/profile`, data);
    return res.data;
  },
};
