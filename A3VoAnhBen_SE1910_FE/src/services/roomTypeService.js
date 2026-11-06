/**
 * Author: Võ Anh Ben - SE1910
 * Dịch vụ Loại phòng (Room Type Service)
 * Quản lý danh mục loại phòng (Standard, Superior, Deluxe, Suite, ...)
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU LOẠI PHÒNG (ROOM TYPE DATA FLOW)
 * ===================================================================================
 * 
 * 1. Lấy toàn bộ danh sách loại phòng (`getAll`):
 *    - Nơi gọi:
 *      + `PublicRoomsPage.jsx`: Đổ dữ liệu vào dropdown lọc phòng cho khách xem.
 *      + `RoomManagementPage.jsx`: Đổ dữ liệu vào dropdown chọn loại phòng khi Staff thêm/sửa phòng.
 *    - Gửi request: HTTP GET `/api/room-types`.
 *    - Nhận dữ liệu: Mảng các đối tượng `RoomType` gồm `{ roomTypeId, roomTypeName, typeDescription, typeNote }`.
 *    - Render: Danh sách các `<option>` cho các thẻ `<select>`.
 * 
 * 2. Lấy chi tiết một loại phòng (`getById`):
 *    - Gửi request: HTTP GET `/api/room-types/{id}`.
 *    - Nhận dữ liệu: Thông tin cụ thể của loại phòng đó.
 */

import api from './api.js';

export const roomTypeService = {
  /**
   * Lấy danh sách toàn bộ loại phòng
   * @returns {Promise<Array>} Danh sách các loại phòng trong khách sạn
   */
  async getAll() {
    const res = await api.get('/room-types');
    return res.data;
  },

  /**
   * Lấy chi tiết loại phòng theo ID
   * @param {number} id - Mã ID loại phòng
   * @returns {Promise<Object>} Chi tiết loại phòng
   */
  async getById(id) {
    const res = await api.get(`/room-types/${id}`);
    return res.data;
  },
};
