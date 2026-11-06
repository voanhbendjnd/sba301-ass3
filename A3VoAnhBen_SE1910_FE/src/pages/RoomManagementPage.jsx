/**
 * Author: Võ Anh Ben - SE1910
 * Màn hình Quản lý Phòng Khách Sạn (RoomManagementPage)
 * Dành cho đối tượng: Nhân viên khách sạn (Staff role)
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU QUẢN LÝ PHÒNG (ROOM MANAGEMENT & SPECIAL DELETE RULE)
 * ===================================================================================
 * 
 * 1. Khởi nạp Dữ liệu Phòng & Loại phòng (`loadRooms`, `loadRoomTypes`):
 *    - Hook `useEffect`: Kích hoạt khi trang mount, gửi đồng thời:
 *      + `roomService.getAll()` -> HTTP GET `/api/rooms` (lấy toàn bộ phòng bao gồm cả Inactive).
 *      + `roomTypeService.getAll()` -> HTTP GET `/api/room-types` (lấy danh mục loại phòng đổ vào Dropdown).
 *    - Nhận dữ liệu: Lưu vào state `rooms` và `roomTypes`, đổ lên Table danh sách phòng.
 * 
 * 2. Giải thuật Tìm kiếm Phòng (`handleSearch`):
 *    - Người dùng nhập số phòng, tên loại phòng hoặc mô tả tiện nghi và nhấn "Tìm kiếm":
 *    - Gửi request: Gọi `roomService.search(keyword)` -> HTTP GET `/api/rooms/search?keyword=...`.
 *    - Backend Spring Boot: Tìm kiếm trong SQL Server theo số phòng hoặc liên kết `roomType.roomTypeName`.
 *    - Nhận dữ liệu: Đổ danh sách phòng tìm được vào bảng.
 * 
 * 3. Luồng Thêm mới / Cập nhật Phòng (`handleFormSubmit`):
 *    - Nhấn "Thêm phòng mới": Mở modal `openCreateModal()`, reset form về giá trị mặc định.
 *    - Nhấn icon Cây bút (Sửa): Mở modal `openEditModal(r)`, nạp thông tin phòng hiện tại.
 *    - Khi nhấn "Tạo phòng" hoặc "Lưu thay đổi":
 *      + Validate Client-side: Kiểm tra bắt buộc số phòng, loại phòng và giá tiền > 0.
 *      + Nếu là Thêm mới: Gọi `roomService.create(payload)` -> HTTP POST `/api/rooms`.
 *      + Nếu là Cập nhật: Gọi `roomService.update(id, payload)` -> HTTP PUT `/api/rooms/{id}`.
 *      + Phản hồi: Đóng Modal, hiển thị Toast xanh thông báo thành công và tải lại bảng.
 * 
 * 4. Luồng Xóa Phòng với Quy Tắc Đặc Tả Đề Bài (Special Delete Rule Pipeline):
 *    - Đề bài yêu cầu:
 *      "The delete action will delete room information in the case this information is not belong
 *       to any renting transaction. If the room information is already stored in a booking detail,
 *       just change the status."
 *    - Khi Staff nhấn nút Thùng rác (Xóa): Mở Modal cảnh báo `setDeletingRoom(room)`.
 *    - Khi Staff nhấn "Xác nhận thực hiện":
 *      + Gửi request: Gọi `roomService.delete(id)` -> HTTP DELETE `/api/rooms/{id}`.
 *      + Phía Backend `RoomService.java` kiểm tra `bookingDetailRepository.existsByRoomInformation_RoomId(id)`:
 *        * Trường hợp 1 (Phòng ĐÃ TỪNG được thuê): Backend không xóa khỏi DB mà đổi `roomStatus = 0` (Inactive),
 *          trả về `{ action: 'STATUS_CHANGED', message: 'Phòng đã có lịch sử đặt phòng... Đã chuyển trạng thái sang Inactive' }`.
 *          Frontend nhận diện `action === 'STATUS_CHANGED'` -> Bắn Toast VÀNG cảnh báo rõ ràng.
 *        * Trường hợp 2 (Phòng CHƯA TỪNG được thuê): Backend xóa vĩnh viễn khỏi Database,
 *          trả về `{ action: 'DELETED', message: 'Đã xóa phòng thành công khỏi hệ thống' }`.
 *          Frontend bắn Toast XANH thành công.
 *      + Kết quả: Đóng modal và tải lại bảng danh sách phòng để cập nhật trạng thái mới nhất!
 */

import { useState, useEffect } from 'react';
import {
  Bed,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Users,
  DollarSign,
  Info,
} from 'lucide-react';
import { roomService } from '../services/roomService.js';
import { roomTypeService } from '../services/roomTypeService.js';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function RoomManagementPage({ showToast }) {
  // State lưu danh sách toàn bộ phòng khách sạn
  const [rooms, setRooms] = useState([]);
  // State lưu danh mục loại phòng (Standard, Superior, Suite...)
  const [roomTypes, setRoomTypes] = useState([]);
  // State báo hiệu đang tải dữ liệu từ máy chủ
  const [loading, setLoading] = useState(true);
  // State từ khóa tìm kiếm
  const [keyword, setKeyword] = useState('');

  // State điều khiển mở/đóng Modal Thêm/Sửa phòng
  const [modalOpen, setModalOpen] = useState(false);
  // Phòng đang chọn chỉnh sửa (null nếu là tạo mới)
  const [editingRoom, setEditingRoom] = useState(null);
  // Dữ liệu biểu mẫu thêm/sửa phòng
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeId: '',
    roomMaxCapacity: 2,
    roomPricePerDay: '',
    roomStatus: 1,
    roomDetailDescription: '',
  });
  // Lỗi hiển thị trong Modal
  const [formError, setFormError] = useState('');
  // Cờ báo hiệu đang submit gửi request
  const [submitting, setSubmitting] = useState(false);

  // Phòng đang chờ xác nhận xóa
  const [deletingRoom, setDeletingRoom] = useState(null);

  // Khởi nạp danh sách phòng và loại phòng khi mở trang
  useEffect(() => {
    loadRooms();
    loadRoomTypes();
  }, []);

  /**
   * Tải toàn bộ danh sách phòng từ Backend
   * Luồng: GET /api/rooms -> Lưu vào state rooms
   */
  async function loadRooms() {
    setLoading(true);
    try {
      const data = await roomService.getAll();
      setRooms(data || []);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Tải danh mục loại phòng đổ vào Dropdown biểu mẫu
   * Luồng: GET /api/room-types -> Lưu vào state roomTypes
   */
  async function loadRoomTypes() {
    try {
      const data = await roomTypeService.getAll();
      setRoomTypes(data || []);
      if (data && data.length > 0 && !formData.roomTypeId) {
        setFormData((prev) => ({ ...prev, roomTypeId: data[0].roomTypeId }));
      }
    } catch {
      // Bỏ qua lỗi nạp loại phòng
    }
  }

  /**
   * Tìm kiếm phòng theo số phòng, tên loại phòng hoặc mô tả
   * Luồng: GET /api/rooms/search?keyword=... -> Cập nhật lại state rooms
   */
  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await roomService.search(keyword);
      setRooms(data || []);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Mở Popup Modal thêm mới phòng
   * Luồng: Reset form về mặc định -> Mở dialog
   */
  function openCreateModal() {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      roomTypeId: roomTypes[0]?.roomTypeId || '',
      roomMaxCapacity: 2,
      roomPricePerDay: '',
      roomStatus: 1,
      roomDetailDescription: '',
    });
    setFormError('');
    setModalOpen(true);
  }

  /**
   * Mở Popup Modal chỉnh sửa phòng hiện tại
   * Luồng: Đổ dữ liệu phòng r vào formData -> Mở dialog
   */
  function openEditModal(room) {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomTypeId: room.roomType?.roomTypeId || roomTypes[0]?.roomTypeId || '',
      roomMaxCapacity: room.roomMaxCapacity || 2,
      roomPricePerDay: room.roomPricePerDay || '',
      roomStatus: room.roomStatus ?? 1,
      roomDetailDescription: room.roomDetailDescription || '',
    });
    setFormError('');
    setModalOpen(true);
  }

  /**
   * Xử lý lưu thông tin phòng (Thêm mới hoặc Cập nhật)
   * Luồng: Validate client -> POST hoặc PUT -> Đóng modal -> Tải lại danh sách
   */
  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!formData.roomNumber.trim()) {
      setFormError('Số phòng không được để trống');
      return;
    }
    if (!formData.roomTypeId) {
      setFormError('Vui lòng chọn loại phòng');
      return;
    }
    if (!formData.roomPricePerDay || Number(formData.roomPricePerDay) <= 0) {
      setFormError('Giá phòng mỗi ngày phải lớn hơn 0');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        roomNumber: formData.roomNumber.trim(),
        roomTypeId: Number(formData.roomTypeId),
        roomMaxCapacity: Number(formData.roomMaxCapacity),
        roomPricePerDay: Number(formData.roomPricePerDay),
        roomStatus: Number(formData.roomStatus),
      };

      if (editingRoom) {
        // Cập nhật thông tin phòng
        await roomService.update(editingRoom.roomId, payload);
        showToast('Cập nhật thông tin phòng thành công', 'success');
      } else {
        // Tạo phòng mới
        await roomService.create(payload);
        showToast('Tạo mới phòng thành công', 'success');
      }
      setModalOpen(false);
      loadRooms();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Xử lý xóa phòng theo đúng quy tắc đặc tả đề bài:
   * Nếu phòng đã có trong giao dịch booking detail -> backend chuyển trạng thái Inactive.
   * Nếu phòng chưa từng có booking -> xóa hoàn toàn khỏi DB.
   */
  async function handleConfirmDelete() {
    if (!deletingRoom) return;
    try {
      const res = await roomService.delete(deletingRoom.roomId);
      const isStatusChanged = res?.action === 'STATUS_CHANGED';
      // Hiển thị thông báo chi tiết trả về từ Backend (Vàng nếu đổi status, Xanh nếu xóa thành công)
      showToast(
        res?.message || 'Thao tác xóa phòng hoàn tất',
        isStatusChanged ? 'warning' : 'success'
      );
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setDeletingRoom(null);
      loadRooms();
    }
  }

  return (
    <div>
      {/* Tiêu đề trang và Nút hành động */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Quản lý Phòng (Room Management)</h1>
          <p className="text-muted small mb-0">
            Xem, thêm mới, sửa và xóa phòng khách sạn (Quy định: phòng có lịch sử đặt sẽ chỉ đổi trạng thái)
          </p>
        </div>
        <div className="d-flex gap-2">
          {/* Nút làm mới dữ liệu */}
          <button
            onClick={loadRooms}
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
          {/* Nút mở popup tạo phòng mới */}
          <button
            onClick={openCreateModal}
            className="btn btn-primary d-flex align-items-center gap-1"
          >
            <Plus size={18} /> Thêm phòng mới
          </button>
        </div>
      </div>

      {/* Thanh Tìm Kiếm Phòng */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-3">
          <form onSubmit={handleSearch} className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm phòng theo số phòng, tên loại phòng hoặc mô tả..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary px-3">
              Tìm kiếm
            </button>
            {keyword && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setKeyword('');
                  loadRooms();
                }}
              >
                Đặt lại
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Bảng Danh Sách Phòng */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Số phòng</th>
                <th>Loại phòng</th>
                <th>Sức chứa</th>
                <th>Giá / Ngày</th>
                <th>Mô tả chi tiết</th>
                <th style={{ width: '130px' }}>Trạng thái</th>
                <th style={{ width: '110px' }} className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang tải dữ liệu phòng từ máy chủ...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    Không tìm thấy phòng nào phù hợp
                  </td>
                </tr>
              ) : (
                rooms.map((r) => (
                  <tr key={r.roomId}>
                    <td className="fw-semibold text-muted">#{r.roomId}</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark border fs-6">
                        {r.roomNumber}
                      </span>
                    </td>
                    <td className="fw-semibold text-primary">{r.roomType?.roomTypeName || '—'}</td>
                    <td>
                      <span className="d-inline-flex align-items-center gap-1 text-muted">
                        <Users size={14} /> {r.roomMaxCapacity || 2} người
                      </span>
                    </td>
                    <td className="fw-bold text-success">
                      {Number(r.roomPricePerDay || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="text-secondary small text-truncate" style={{ maxWidth: '240px' }}>
                      {r.roomDetailDescription || '—'}
                    </td>
                    <td>
                      <StatusBadge status={r.roomStatus} />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {/* Nút bấm mở popup chỉnh sửa phòng */}
                        <button
                          className="btn btn-outline-secondary"
                          title="Chỉnh sửa thông tin phòng"
                          onClick={() => openEditModal(r)}
                        >
                          <Edit2 size={14} />
                        </button>
                        {/* Nút bấm mở popup xác nhận xóa phòng */}
                        <button
                          className="btn btn-outline-danger"
                          title="Xóa phòng"
                          onClick={() => setDeletingRoom(r)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Modal Thêm / Chỉnh Sửa Phòng */}
      {modalOpen && (
        <Modal
          title={editingRoom ? `Chỉnh sửa phòng ${editingRoom.roomNumber}` : 'Thêm phòng mới'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleFormSubmit}>
            {formError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
                <AlertCircle size={16} />
                <div>{formError}</div>
              </div>
            )}

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Số phòng *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: 101, 202, 305..."
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Loại phòng *</label>
                <select
                  className="form-select"
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                  required
                >
                  {roomTypes.map((t) => (
                    <option key={t.roomTypeId} value={t.roomTypeId}>
                      {t.roomTypeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Sức chứa tối đa *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="form-control"
                  value={formData.roomMaxCapacity}
                  onChange={(e) => setFormData({ ...formData, roomMaxCapacity: e.target.value })}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Giá phòng / ngày (VNĐ) *</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  className="form-control"
                  placeholder="500000"
                  value={formData.roomPricePerDay}
                  onChange={(e) => setFormData({ ...formData, roomPricePerDay: e.target.value })}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Trạng thái</label>
                <select
                  className="form-select"
                  value={formData.roomStatus}
                  onChange={(e) => setFormData({ ...formData, roomStatus: Number(e.target.value) })}
                >
                  <option value={1}>Hoạt động (Active)</option>
                  <option value={0}>Không hoạt động (Inactive)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Mô tả chi tiết phòng</label>
              <textarea
                rows="3"
                className="form-control"
                placeholder="Mô tả hướng nhìn, tiện nghi, giường ngủ, minibar..."
                value={formData.roomDetailDescription}
                onChange={(e) => setFormData({ ...formData, roomDetailDescription: e.target.value })}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 pt-2 border-top">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-primary px-3"
                disabled={submitting}
              >
                {submitting ? 'Đang lưu...' : (editingRoom ? 'Lưu thay đổi' : 'Tạo phòng')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Xác Nhận Xóa Phòng & Cảnh Báo Quy Tắc Nghiệp Vụ */}
      {deletingRoom && (
        <Modal
          title="Xác nhận xóa phòng"
          onClose={() => setDeletingRoom(null)}
        >
          <div>
            <div className="text-center my-3">
              <div className="d-inline-flex p-3 rounded-circle bg-danger-subtle text-danger mb-3">
                <Trash2 size={36} />
              </div>
              <h5 className="fw-bold">Bạn có chắc chắn muốn xóa phòng {deletingRoom.roomNumber}?</h5>
              <p className="text-muted mb-2">
                Loại phòng: <strong>{deletingRoom.roomType?.roomTypeName}</strong> - Giá: {Number(deletingRoom.roomPricePerDay).toLocaleString('vi-VN')} đ/ngày
              </p>
              <div className="alert alert-warning text-start small mb-0">
                <Info size={16} className="me-1 inline" />
                <strong>Quy định nghiệp vụ theo đề bài:</strong> Nếu phòng đã từng phát sinh giao dịch thuê (đã có trong chi tiết đặt phòng), hệ thống sẽ không xóa mà tự động chuyển trạng thái phòng sang <strong>Không hoạt động (Inactive)</strong>.
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDeletingRoom(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-danger px-3"
                onClick={handleConfirmDelete}
              >
                Xác nhận thực hiện
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
