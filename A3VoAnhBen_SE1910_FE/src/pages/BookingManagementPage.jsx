/**
 * Author: Võ Anh Ben - SE1910
 * Màn hình Quản lý Đặt phòng (BookingManagementPage)
 * Dành cho đối tượng: Nhân viên khách sạn (Staff role) theo đặc tả Assignment 03
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU QUẢN LÝ ĐẶT PHÒNG (BOOKING & DETAILS DATA FLOW)
 * ===================================================================================
 * 
 * 1. Khởi nạp Dữ liệu Đặt phòng, Khách hàng và Phòng (`loadBookings`, `loadCustomersAndRooms`):
 *    - Hook `useEffect`: Chạy khi vào trang, gửi đồng thời:
 *      + `bookingService.getAll()` -> HTTP GET `/api/bookings`: Nhận toàn bộ danh sách đơn đặt phòng.
 *      + `customerService.getAll()` & `roomService.getAll()`: Nhận danh sách khách và phòng để phục vụ popup tạo đơn đặt.
 *    - Dữ liệu nhận về được lưu vào state `bookings`, render trực tiếp lên Table.
 * 
 * 2. Giải thuật Tìm kiếm Đơn đặt phòng (`handleSearch`):
 *    - Nhập từ khóa (Mã đơn, Tên khách hàng hoặc Email) và bấm "Tìm kiếm":
 *    - Gửi request: Gọi `bookingService.search(keyword)` -> HTTP GET `/api/bookings/search?keyword=...`.
 *    - Backend: Truy vấn JPA JOIN giữa `BookingReservation` và `Customer`.
 *    - Nhận dữ liệu: Cập nhật state `bookings` và re-render bảng kết quả.
 * 
 * 3. Luồng Xem Chi Tiết Đơn Đặt Phòng (View Booking Details Flow):
 *    - Khi Staff click nút "Chi tiết" (Eye icon) trên dòng của đơn đặt:
 *      -> Set state `viewingBooking = b`.
 *      -> Mở Popup Modal hiển thị thông tin khách hàng, số điện thoại, ngày lập đơn.
 *      -> Đọc mảng `viewingBooking.bookingDetails` (các bản ghi `BookingDetail` do Backend ánh xạ):
 *         Hiển thị bảng chi tiết các phòng đã đặt trong đơn, ngày nhận (`startDate`),
 *         ngày trả (`endDate`), đơn giá từng phòng (`actualPrice`) và tổng tiền thanh toán (`totalPrice`).
 * 
 * 4. Luồng Cập nhật Trạng thái Đặt phòng (`handleStatusChange`):
 *    - Bên trong Modal chi tiết đơn, Staff có 3 nút bấm thao tác nhanh:
 *      + Click "Xác nhận" -> Gọi `handleStatusChange(id, 1)` (Confirmed)
 *      + Click "Hoàn thành" -> Gọi `handleStatusChange(id, 2)` (Completed)
 *      + Click "Hủy đơn" -> Gọi `handleStatusChange(id, 0)` (Cancelled)
 *    - Gửi request: HTTP PUT `/api/bookings/{id}/status` kèm body `{ bookingStatus: newStatus }`.
 *    - Phản hồi: Backend cập nhật trường `BookingStatus` trong DB -> Frontend hiển thị Toast xanh,
 *      đồng bộ lại state `viewingBooking` và tải lại bảng danh sách bên ngoài.
 * 
 * 5. Luồng Tạo Đơn Đặt Phòng Trực Tiếp bởi Staff (`handleCreateBooking`):
 *    - Staff bấm "Tạo đặt phòng" -> Mở modal `openCreateModal()`.
 *    - Chọn khách hàng từ dropdown, nhập ngày nhận/trả phòng và click chọn 1 hoặc nhiều phòng (Checkbox toggle).
 *    - Khi nhấn "Xác nhận đặt phòng":
 *      + Gửi request: Gọi `bookingService.create(payload)` -> HTTP POST `/api/bookings`.
 *      + Backend tự động tính số đêm và tổng tiền, lưu đồng thời bảng cha `BookingReservation`
 *        và các bảng con `BookingDetail`.
 *      + Phản hồi: Đóng modal, hiển thị Toast xanh, tải lại danh sách đơn đặt phòng.
 * 
 * 6. Luồng Xóa Đơn Đặt Phòng (`handleConfirmDelete`):
 *    - Nhấn nút Thùng rác (Xóa) -> Mở modal xác nhận `setDeletingBooking(b)`.
 *    - Nhấn "Xác nhận xóa" -> Gửi HTTP DELETE `/api/bookings/{id}` -> Bắn Toast xanh, reload bảng.
 */

import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  AlertCircle,
  Plus,
  Bed,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import { bookingService } from '../services/bookingService.js';
import { customerService } from '../services/customerService.js';
import { roomService } from '../services/roomService.js';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function BookingManagementPage({ showToast }) {
  // State lưu danh sách toàn bộ đơn đặt phòng
  const [bookings, setBookings] = useState([]);
  // State lưu danh sách khách hàng để chọn trong form tạo đơn
  const [customers, setCustomers] = useState([]);
  // State lưu danh sách phòng để chọn trong form tạo đơn
  const [rooms, setRooms] = useState([]);
  // State báo hiệu đang tải dữ liệu từ máy chủ
  const [loading, setLoading] = useState(true);
  // State từ khóa tìm kiếm
  const [keyword, setKeyword] = useState('');

  // Đơn đặt phòng đang xem chi tiết (null nếu modal đóng)
  const [viewingBooking, setViewingBooking] = useState(null);

  // State biểu mẫu tạo mới đặt phòng dành cho Staff
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Đơn đặt phòng đang chờ xác nhận xóa
  const [deletingBooking, setDeletingBooking] = useState(null);

  // Nạp danh sách đơn đặt phòng, danh sách khách hàng và phòng khi mount
  useEffect(() => {
    loadBookings();
    loadCustomersAndRooms();
  }, []);

  /**
   * Tải toàn bộ đơn đặt phòng từ máy chủ
   * Luồng: GET /api/bookings -> Lưu vào state bookings
   */
  async function loadBookings() {
    setLoading(true);
    try {
      const data = await bookingService.getAll();
      setBookings(data || []);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Tải danh sách khách hàng và phòng để phục vụ popup tạo đơn đặt phòng mới
   */
  async function loadCustomersAndRooms() {
    try {
      const [cList, rList] = await Promise.all([
        customerService.getAll(),
        roomService.getAll(),
      ]);
      setCustomers(cList || []);
      setRooms(rList || []);
    } catch {
      // Bỏ qua lỗi phụ trợ
    }
  }

  /**
   * Tìm kiếm đơn đặt phòng theo Mã đơn, Tên khách hàng hoặc Email
   * Luồng: GET /api/bookings/search?keyword=... -> Cập nhật bảng
   */
  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await bookingService.search(keyword);
      setBookings(data || []);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Cập nhật trạng thái đơn đặt phòng
   * @param {number} bookingId - Mã ID đơn
   * @param {number} newStatus - 1: Xác nhận, 2: Hoàn thành, 0: Hủy
   */
  async function handleStatusChange(bookingId, newStatus) {
    try {
      await bookingService.updateStatus(bookingId, newStatus);
      showToast('Cập nhật trạng thái đặt phòng thành công', 'success');
      loadBookings();
      if (viewingBooking && viewingBooking.bookingReservationId === bookingId) {
        setViewingBooking((prev) => ({ ...prev, bookingStatus: newStatus }));
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }

  /**
   * Xác nhận xóa đơn đặt phòng
   */
  async function handleConfirmDelete() {
    if (!deletingBooking) return;
    try {
      await bookingService.delete(deletingBooking.bookingReservationId);
      showToast('Xóa giao dịch đặt phòng thành công', 'success');
      setDeletingBooking(null);
      loadBookings();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }

  /**
   * Mở modal tạo đơn đặt phòng mới
   */
  function openCreateModal() {
    setSelectedCustomerId(customers[0]?.customerId || '');
    setStartDate(new Date().toISOString().split('T')[0]);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEndDate(tomorrow.toISOString().split('T')[0]);
    setSelectedRoomIds([]);
    setFormError('');
    setCreateModalOpen(true);
  }

  /**
   * Chọn hoặc bỏ chọn một phòng trong danh sách phòng
   */
  function toggleRoomSelection(roomId) {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  }

  /**
   * Submit tạo đơn đặt phòng mới (Offline booking do Staff lập)
   * Luồng: Validate -> POST /api/bookings -> Reload danh sách
   */
  async function handleCreateBooking(e) {
    e.preventDefault();
    setFormError('');

    if (!selectedCustomerId) {
      setFormError('Vui lòng chọn khách hàng');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Vui lòng chọn ngày nhận phòng và ngày trả phòng');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setFormError('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }
    if (selectedRoomIds.length === 0) {
      setFormError('Vui lòng chọn ít nhất 1 phòng');
      return;
    }

    setSubmitting(true);
    try {
      // Đóng gói mảng danh sách chi tiết các phòng đặt
      const items = selectedRoomIds.map((roomId) => ({
        roomId,
        startDate,
        endDate,
      }));

      await bookingService.create({
        customerId: Number(selectedCustomerId),
        items,
      });

      showToast('Tạo giao dịch đặt phòng mới thành công', 'success');
      setCreateModalOpen(false);
      loadBookings();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Tiêu đề trang và Nút hành động */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Quản lý Đặt phòng (Booking Management)</h1>
          <p className="text-muted small mb-0">
            Xem và xử lý các giao dịch đặt phòng, thông tin chi tiết từng phòng và trạng thái
          </p>
        </div>
        <div className="d-flex gap-2">
          {/* Nút làm mới dữ liệu */}
          <button
            onClick={loadBookings}
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
          {/* Nút mở popup tạo đơn đặt phòng */}
          <button
            onClick={openCreateModal}
            className="btn btn-primary d-flex align-items-center gap-1"
          >
            <Plus size={18} /> Tạo đặt phòng
          </button>
        </div>
      </div>

      {/* Thanh Tìm Kiếm Đơn Đặt Phòng */}
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
                placeholder="Tìm đặt phòng theo Mã đơn, Tên khách hàng hoặc Email..."
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
                  loadBookings();
                }}
              >
                Đặt lại
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Bảng Danh Sách Đơn Đặt Phòng */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '90px' }}>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày tạo đơn</th>
                <th>Số lượng phòng</th>
                <th>Tổng thanh toán</th>
                <th style={{ width: '150px' }}>Trạng thái</th>
                <th style={{ width: '140px' }} className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang tải danh sách đặt phòng...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Không tìm thấy đơn đặt phòng nào
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.bookingReservationId}>
                    <td className="fw-semibold text-primary">#{b.bookingReservationId}</td>
                    <td>
                      <div className="fw-semibold text-dark">{b.customer?.customerFullName || 'Khách vãng lai'}</div>
                      <small className="text-muted">{b.customer?.emailAddress || '—'}</small>
                    </td>
                    <td className="text-secondary">{b.bookingDate}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {b.bookingDetails?.length || 1} phòng
                      </span>
                    </td>
                    <td className="fw-bold text-success">
                      {Number(b.totalPrice || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td>
                      <StatusBadge status={b.bookingStatus} type="booking" />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {/* Nút bấm xem modal chi tiết đơn và các phòng */}
                        <button
                          className="btn btn-outline-primary"
                          title="Xem chi tiết đặt phòng"
                          onClick={() => setViewingBooking(b)}
                        >
                          <Eye size={14} /> Chi tiết
                        </button>
                        {/* Nút bấm mở dialog xóa đơn */}
                        <button
                          className="btn btn-outline-danger"
                          title="Xóa đơn đặt phòng"
                          onClick={() => setDeletingBooking(b)}
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

      {/* Modal Xem Chi Tiết Đặt Phòng (Booking Details) & Cập Nhật Trạng Thái */}
      {viewingBooking && (
        <Modal
          title={`Chi tiết đơn đặt phòng #${viewingBooking.bookingReservationId}`}
          onClose={() => setViewingBooking(null)}
        >
          <div>
            <div className="row g-3 mb-3 pb-3 border-bottom">
              <div className="col-6">
                <small className="text-muted d-block">Khách hàng:</small>
                <strong>{viewingBooking.customer?.customerFullName}</strong>
                <div className="text-secondary small">{viewingBooking.customer?.emailAddress}</div>
                <div className="text-secondary small">{viewingBooking.customer?.telephone || 'Không có SĐT'}</div>
              </div>
              <div className="col-6 text-end">
                <small className="text-muted d-block">Ngày đặt đơn:</small>
                <div>{viewingBooking.bookingDate}</div>
                <div className="mt-1">
                  <StatusBadge status={viewingBooking.bookingStatus} type="booking" />
                </div>
              </div>
            </div>

            {/* Bảng chi tiết các phòng đặt */}
            <h6 className="fw-bold mb-2">Danh sách phòng đã đặt:</h6>
            <div className="table-responsive mb-3">
              <table className="table table-sm table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Phòng</th>
                    <th>Loại</th>
                    <th>Từ ngày</th>
                    <th>Đến ngày</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingBooking.bookingDetails && viewingBooking.bookingDetails.length > 0 ? (
                    viewingBooking.bookingDetails.map((d, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold">Phòng {d.roomInformation?.roomNumber || '—'}</td>
                        <td className="small">{d.roomInformation?.roomType?.roomTypeName || 'Tiêu chuẩn'}</td>
                        <td className="small">{d.startDate}</td>
                        <td className="small">{d.endDate}</td>
                        <td className="text-end fw-semibold text-success">
                          {Number(d.actualPrice || 0).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        Chưa có chi tiết phòng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Tổng tiền đơn */}
            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-3">
              <span className="fw-semibold">Tổng tiền thanh toán:</span>
              <span className="fs-5 fw-bold text-success">
                {Number(viewingBooking.totalPrice || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* Thao tác cập nhật trạng thái nhanh dành cho Staff */}
            <div className="d-flex align-items-center justify-content-between pt-2 border-top">
              <div className="d-flex gap-2">
                <span className="small text-muted align-self-center">Cập nhật:</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => handleStatusChange(viewingBooking.bookingReservationId, 1)}
                  disabled={viewingBooking.bookingStatus === 1}
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleStatusChange(viewingBooking.bookingReservationId, 2)}
                  disabled={viewingBooking.bookingStatus === 2}
                >
                  Hoàn thành
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleStatusChange(viewingBooking.bookingReservationId, 0)}
                  disabled={viewingBooking.bookingStatus === 0}
                >
                  Hủy đơn
                </button>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setViewingBooking(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Tạo Đơn Đặt Phòng Mới cho Staff */}
      {createModalOpen && (
        <Modal
          title="Tạo đơn đặt phòng mới"
          onClose={() => setCreateModalOpen(false)}
        >
          <form onSubmit={handleCreateBooking}>
            {formError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
                <AlertCircle size={16} />
                <div>{formError}</div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small fw-semibold">Chọn Khách hàng *</label>
              <select
                className="form-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              >
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.customerFullName} ({c.emailAddress})
                  </option>
                ))}
              </select>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Ngày nhận phòng *</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Ngày trả phòng *</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Chọn phòng đặt (Có thể chọn nhiều phòng) *</label>
              <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {rooms.map((r) => {
                  const isChecked = selectedRoomIds.includes(r.roomId);
                  return (
                    <div
                      key={r.roomId}
                      className={`form-check p-2 rounded mb-1 cursor-pointer ${
                        isChecked ? 'bg-primary-subtle' : 'hover-bg-light'
                      }`}
                      onClick={() => toggleRoomSelection(r.roomId)}
                    >
                      <input
                        className="form-check-input ms-0 me-2"
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                      />
                      <label className="form-check-label d-flex justify-content-between align-items-center w-100 cursor-pointer">
                        <span>
                          <strong>Phòng {r.roomNumber}</strong> - {r.roomType?.roomTypeName} ({r.roomMaxCapacity} khách)
                        </span>
                        <span className="text-success fw-bold">
                          {Number(r.roomPricePerDay).toLocaleString('vi-VN')} đ/ngày
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
              <small className="text-muted">Đã chọn: {selectedRoomIds.length} phòng</small>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-2 border-top">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setCreateModalOpen(false)}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-primary px-3"
                disabled={submitting}
              >
                {submitting ? 'Đang tạo đơn...' : 'Xác nhận đặt phòng'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Xác Nhận Xóa Đơn Đặt Phòng */}
      {deletingBooking && (
        <Modal
          title="Xác nhận xóa đặt phòng"
          onClose={() => setDeletingBooking(null)}
        >
          <div>
            <div className="text-center my-3">
              <div className="d-inline-flex p-3 rounded-circle bg-danger-subtle text-danger mb-3">
                <Trash2 size={36} />
              </div>
              <h5 className="fw-bold">Bạn có chắc chắn muốn xóa đơn #{deletingBooking.bookingReservationId}?</h5>
              <p className="text-muted mb-1">
                Khách hàng: <strong>{deletingBooking.customer?.customerFullName}</strong> - Tổng tiền: {Number(deletingBooking.totalPrice).toLocaleString('vi-VN')} đ
              </p>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDeletingBooking(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-danger px-3"
                onClick={handleConfirmDelete}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
