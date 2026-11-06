/**
 * Author: Võ Anh Ben - SE1910
 * Dịch vụ Quản lý Phòng Khách sạn (Room Service)
 * Giao tiếp với endpoint `/api/rooms` của Backend Spring Boot.
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU PHÒNG KHÁCH SẠN (ROOM DATA FLOW & CONSTRAINT LOGIC)
 * ===================================================================================
 * 
 * 1. Xem danh sách phòng công khai (`getPublicRooms`):
 *    - Nơi gọi: `PublicRoomsPage.jsx` khi khách vãng lai duyệt phòng và `CustomerBookingPage.jsx`.
 *    - Gửi request: HTTP GET `/api/rooms/public` (Không cần xác thực/Authorization header).
 *    - Backend: Lọc tất cả các phòng có `roomStatus = 1` (Đang hoạt động/khả dụng).
 *    - Nhận dữ liệu: Danh sách phòng kèm loại phòng (`RoomType`), sức chứa, mô tả, đơn giá/ngày.
 * 
 * 2. Xem toàn bộ phòng trong hệ thống (`getAll`):
 *    - Nơi gọi: `RoomManagementPage.jsx` của Staff.
 *    - Gửi request: HTTP GET `/api/rooms` (Yêu cầu Token quyền Staff).
 *    - Nhận dữ liệu: Danh sách đầy đủ mọi phòng (bao gồm cả phòng đang Inactive/bảo trì).
 * 
 * 3. Thêm mới phòng (`create`):
 *    - Nơi gọi: Khi Staff nhấn "Tạo phòng" trên modal thêm phòng mới.
 *    - Gửi request: HTTP POST `/api/rooms` kèm payload `{ roomNumber, roomTypeId, roomMaxCapacity, roomPricePerDay, roomStatus, roomDetailDescription }`.
 *    - Nhận dữ liệu: Đối tượng phòng mới được lưu trong database.
 * 
 * 4. Cập nhật phòng (`update`):
 *    - Nơi gọi: Khi Staff nhấn "Lưu thay đổi" trên modal chỉnh sửa phòng.
 *    - Gửi request: HTTP PUT `/api/rooms/{id}`.
 *    - Nhận dữ liệu: Đối tượng phòng đã được cập nhật thành công.
 * 
 * 5. Xóa phòng với logic ràng buộc đặc thù (`delete`):
 *    - Nơi gọi: Khi Staff nhấn nút Xóa phòng và bấm "Xác nhận thực hiện" trên Modal.
 *    - Gửi request: HTTP DELETE `/api/rooms/{id}`.
 *    - Giải thuật Backend thực hiện quy định đề bài:
 *      + Kiểm tra xem mã phòng có tồn tại trong bảng `BookingDetail` không (`existsByRoomInformation_RoomId`).
 *      + Nếu CÓ: Không xóa vật lý để giữ toàn vẹn lịch sử hóa đơn. Thay vào đó, đặt `roomStatus = 0` (Inactive),
 *        trả về `{ action: 'STATUS_CHANGED', message: 'Phòng đã có lịch sử đặt phòng... Đã chuyển trạng thái sang Inactive' }`.
 *      + Nếu CHƯA TỪNG ĐẶT: Xóa vĩnh viễn khỏi Database, trả về `{ action: 'DELETED', message: 'Đã xóa phòng thành công' }`.
 *    - Phản hồi nhận về: Frontend nhận đối tượng kết quả, hiển thị Toast vàng cảnh báo hoặc xanh thành công tương ứng.
 * 
 * 6. Tìm kiếm phòng (`search`):
 *    - Nơi gọi: Khi Staff gõ từ khóa và submit form tìm kiếm tại `RoomManagementPage.jsx`.
 *    - Gửi request: HTTP GET `/api/rooms/search?keyword=...`.
 *    - Nhận dữ liệu: Danh sách phòng khớp số phòng, loại phòng hoặc mô tả.
 */

import api from './api.js';

export const roomService = {
  /**
   * Lấy danh sách phòng công khai đang hoạt động cho khách xem
   * @returns {Promise<Array>} Danh sách phòng có trạng thái Active
   */
  async getPublicRooms() {
    const res = await api.get('/rooms/public');
    return res.data;
  },

  /**
   * Xem chi tiết 1 phòng công khai
   * @param {number} id - Mã ID phòng
   * @returns {Promise<Object>} Chi tiết phòng
   */
  async getPublicRoomDetail(id) {
    const res = await api.get(`/rooms/public/${id}`);
    return res.data;
  },

  /**
   * Lấy tất cả phòng cho nhân viên quản trị (Staff)
   * @returns {Promise<Array>} Toàn bộ danh sách phòng
   */
  async getAll() {
    const res = await api.get('/rooms');
    return res.data;
  },

  /**
   * Lấy thông tin phòng theo ID
   * @param {number} id - Mã ID phòng
   * @returns {Promise<Object>} Thông tin phòng
   */
  async getById(id) {
    const res = await api.get(`/rooms/${id}`);
    return res.data;
  },

  /**
   * Tạo phòng khách sạn mới
   * @param {Object} data - Dữ liệu phòng
   * @returns {Promise<Object>} Phòng đã tạo
   */
  async create(data) {
    const res = await api.post('/rooms', data);
    return res.data;
  },

  /**
   * Cập nhật thông tin phòng
   * @param {number} id - Mã ID phòng
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Phòng sau khi cập nhật
   */
  async update(id, data) {
    const res = await api.put(`/rooms/${id}`, data);
    return res.data;
  },

  /**
   * Xóa phòng hoặc chuyển trạng thái sang Inactive nếu đã từng được đặt
   * @param {number} id - Mã ID phòng cần xóa
   * @returns {Promise<Object>} Kết quả xử lý gồm action ('STATUS_CHANGED' hoặc 'DELETED') và thông điệp
   */
  async delete(id) {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },

  /**
   * Tìm kiếm phòng theo số phòng, tên loại phòng hoặc mô tả
   * @param {string} keyword - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách phòng tìm thấy
   */
  async search(keyword) {
    const res = await api.get('/rooms/search', { params: { keyword } });
    return res.data;
  },
};
