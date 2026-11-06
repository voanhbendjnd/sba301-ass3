/**
 * Author: Võ Anh Ben - SE1910
 * Dịch vụ Đặt phòng Khách sạn (Booking Service)
 * Quản lý các giao dịch đặt phòng trực tuyến (Online Booking), danh sách đặt phòng và chi tiết đặt phòng (Booking Details).
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU ĐẶT PHÒNG (BOOKING TRANSACTION PIPELINE)
 * ===================================================================================
 * 
 * 1. Tạo giao dịch đặt phòng (`create`):
 *    - Nơi gọi:
 *      + `CustomerBookingPage.jsx`: Khách hàng chọn ngày lưu trú + chọn 1 hoặc nhiều phòng và nhấn "Xác nhận đặt phòng".
 *      + `BookingManagementPage.jsx`: Staff tạo đơn đặt phòng trực tiếp cho khách.
 *    - Gửi request: HTTP POST `/api/bookings`.
 *    - Payload: `{ customerId, items: [ { roomId, startDate, endDate, actualPrice }, ... ] }`.
 *    - Giải thuật Backend:
 *      + Tính toán số ngày lưu trú `days = ChronoUnit.DAYS.between(startDate, endDate)`.
 *      + Nhân đơn giá từng phòng theo ngày để ra `actualPrice`.
 *      + Cộng dồn tổng thành tiền vào `TotalPrice` của `BookingReservation`.
 *      + Tạo các bản ghi con `BookingDetail` (khóa kết hợp ReservationID + RoomID) và lưu trong 1 giao dịch `@Transactional`.
 *    - Nhận dữ liệu: Đơn đặt phòng `BookingReservation` đã được tạo thành công kèm danh sách chi tiết phòng.
 *    - Phản hồi giao diện: Bắn Toast xanh báo thành công, chuyển hướng người dùng sang trang Lịch sử (`history`).
 * 
 * 2. Lấy toàn bộ đơn đặt phòng (`getAll`):
 *    - Nơi gọi: Khi Staff vào trang `BookingManagementPage.jsx`.
 *    - Gửi request: HTTP GET `/api/bookings`.
 *    - Nhận dữ liệu: Danh sách toàn bộ đơn đặt phòng sắp xếp theo ngày đặt mới nhất.
 * 
 * 3. Lấy lịch sử đặt phòng riêng của khách hàng (`getHistory`):
 *    - Nơi gọi: `BookingHistoryPage.jsx` khi khách hàng xem danh sách đơn của mình.
 *    - Gửi request: HTTP GET `/api/bookings/history?customerId={customerId}`.
 *    - Nhận dữ liệu: Danh sách các đơn đặt phòng của riêng khách hàng đó.
 * 
 * 4. Cập nhật trạng thái đơn đặt (`updateStatus`):
 *    - Nơi gọi: Khi Staff nhấn nút "Xác nhận", "Hoàn thành" hoặc "Hủy đơn" trên chi tiết đặt phòng.
 *    - Gửi request: HTTP PUT `/api/bookings/{id}/status` kèm `{ bookingStatus }` (1: Confirmed, 2: Completed, 0: Cancelled).
 *    - Nhận dữ liệu: Đơn đặt phòng đã được cập nhật trạng thái mới.
 * 
 * 5. Xóa đơn đặt phòng (`delete`):
 *    - Nơi gọi: Khi Staff nhấn nút Xóa đơn và xác nhận trên Modal.
 *    - Gửi request: HTTP DELETE `/api/bookings/{id}`.
 *    - Nhận dữ liệu: Thông báo xóa đơn thành công từ server.
 * 
 * 6. Tìm kiếm đơn đặt phòng (`search`):
 *    - Nơi gọi: Khi Staff nhập từ khóa (mã đơn, tên khách, email) tại `BookingManagementPage.jsx`.
 *    - Gửi request: HTTP GET `/api/bookings/search?keyword=...`.
 *    - Nhận dữ liệu: Danh sách đơn thỏa mãn từ khóa.
 */

import api from './api.js';

export const bookingService = {
  /**
   * Tạo giao dịch đặt phòng mới (Một hoặc nhiều phòng)
   * @param {Object} bookingData - Thông tin khách hàng và danh sách phòng cần đặt
   * @returns {Promise<Object>} Đơn đặt phòng đã tạo thành công
   */
  async create(bookingData) {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },

  /**
   * Lấy danh sách toàn bộ các đơn đặt phòng trong hệ thống (Quyền Staff)
   * @returns {Promise<Array>} Danh sách toàn bộ đơn đặt phòng
   */
  async getAll() {
    const res = await api.get('/bookings');
    return res.data;
  },

  /**
   * Lấy thông tin chi tiết một đơn đặt phòng kèm danh sách phòng con
   * @param {number} id - Mã ID đơn đặt phòng
   * @returns {Promise<Object>} Đơn đặt phòng chi tiết
   */
  async getById(id) {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  /**
   * Lấy lịch sử đặt phòng của một khách hàng cụ thể
   * @param {number} customerId - Mã ID khách hàng
   * @returns {Promise<Array>} Lịch sử đặt phòng của khách hàng
   */
  async getHistory(customerId) {
    const res = await api.get('/bookings/history', { params: { customerId } });
    return res.data;
  },

  /**
   * Cập nhật trạng thái đơn đặt phòng (1: Xác nhận, 2: Hoàn thành, 0: Hủy)
   * @param {number} id - Mã ID đơn đặt phòng
   * @param {number} bookingStatus - Trạng thái mới
   * @returns {Promise<Object>} Đơn đặt phòng sau khi cập nhật
   */
  async updateStatus(id, bookingStatus) {
    const res = await api.put(`/bookings/${id}/status`, { bookingStatus });
    return res.data;
  },

  /**
   * Xóa một đơn đặt phòng khỏi hệ thống
   * @param {number} id - Mã ID đơn đặt phòng cần xóa
   * @returns {Promise<Object>} Thông điệp kết quả
   */
  async delete(id) {
    const res = await api.delete(`/bookings/${id}`);
    return res.data;
  },

  /**
   * Tìm kiếm đơn đặt phòng theo mã đơn, tên khách hàng hoặc email
   * @param {string} keyword - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách đơn khớp điều kiện
   */
  async search(keyword) {
    const res = await api.get('/bookings/search', { params: { keyword } });
    return res.data;
  },
};
