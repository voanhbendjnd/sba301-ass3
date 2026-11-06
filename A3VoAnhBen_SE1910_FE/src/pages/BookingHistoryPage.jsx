/**
 * Author: Võ Anh Ben - SE1910
 * Màn hình Lịch sử Đặt phòng của Khách hàng (BookingHistoryPage)
 * Dành cho đối tượng: Khách hàng (Customer role)
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU LỊCH SỬ ĐẶT PHÒNG (CUSTOMER BOOKING HISTORY PIPELINE)
 * ===================================================================================
 * 
 * 1. Đặc tả nghiệp vụ đề bài (Business Requirement):
 *    "If user is a Customer, this customer role is allowed to:
 *     View booking reservation history."
 * 
 * 2. Khởi nạp Dữ liệu Lịch sử (`loadHistory`):
 *    - Hook `useEffect`: Lắng nghe sự thay đổi của `currentUser`. Nếu khách đã đăng nhập (`currentUser.accountId`):
 *      + Bật cờ `loading = true`.
 *      + Gửi request: Gọi `bookingService.getHistory(currentUser.accountId)` -> HTTP GET `/api/bookings/history?customerId={id}`.
 *      + Backend Spring Boot:
 *        * Lọc bảng `BookingReservation` theo `CustomerID` của khách hàng đó.
 *        * Sắp xếp theo ngày đặt giảm dần (`OrderByBookingDateDesc`).
 *        * Truy vấn các bản ghi `BookingDetail` liên kết với đơn đặt phòng.
 *      + Nhận dữ liệu: Mảng các đơn đặt phòng của riêng tài khoản này được gán vào state `history`.
 * 
 * 3. Hiển thị Trạng thái & Hóa đơn:
 *    - Mỗi dòng trên bảng hiển thị:
 *      + Mã đơn (`#bookingReservationId`)
 *      + Ngày lập đơn (`bookingDate`)
 *      + Tổng số lượng phòng trong đơn (`bookingDetails.length`)
 *      + Tổng tiền thanh toán (`totalPrice` định dạng VNĐ)
 *      + Trạng thái đơn (`bookingStatus`: 1: Đã xác nhận, 2: Hoàn thành, 0: Đã hủy) qua `StatusBadge`.
 * 
 * 4. Luồng Sự kiện Khi Bấm Nút (Event Click Flow):
 *    - Nút "Làm mới":
 *      -> Gọi lại `loadHistory()` để đồng bộ các đơn mới cập nhật từ Server.
 *    - Nút "Chi tiết" (Eye icon trên mỗi dòng):
 *      -> Gán đơn đặt phòng được chọn vào state `viewingBooking = item`.
 *      -> Mở Popup Modal hiển thị chi tiết hóa đơn:
 *         * Bảng danh sách từng phòng khách đã đặt trong đơn.
 *         * Loại phòng, ngày Check-in, ngày Check-out và giá tiền từng phòng (`actualPrice`).
 *         * Tổng số tiền đã thanh toán.
 *    - Nút "Đóng" trên Modal:
 *      -> Set `viewingBooking = null` để ẩn Modal.
 */

import { useState, useEffect } from 'react';
import {
  History,
  Eye,
  RefreshCw,
  Calendar,
  Bed,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { bookingService } from '../services/bookingService.js';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function BookingHistoryPage({ currentUser, showToast }) {
  // State lưu danh sách các đơn đặt phòng của riêng khách hàng này
  const [history, setHistory] = useState([]);
  // State báo hiệu đang tải dữ liệu từ máy chủ
  const [loading, setLoading] = useState(true);
  // State lưu đơn đặt phòng đang xem chi tiết trên Popup Modal
  const [viewingBooking, setViewingBooking] = useState(null);

  // Nạp lịch sử khi component mount hoặc khi thông tin người dùng thay đổi
  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  /**
   * Tải lịch sử đơn đặt phòng của khách hàng
   * Luồng: GET /api/bookings/history?customerId={id} -> Lưu vào state history
   */
  async function loadHistory() {
    if (!currentUser?.accountId) return;
    setLoading(true);
    try {
      const data = await bookingService.getHistory(currentUser.accountId);
      setHistory(data || []);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Tiêu đề trang & Nút làm mới */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Lịch sử Đặt phòng (Booking History)</h1>
          <p className="text-muted small mb-0">
            Xem lại các đơn đặt phòng bạn đã thực hiện tại FUMiniHotel
          </p>
        </div>
        {/* Nút bấm làm mới dữ liệu */}
        <button
          onClick={loadHistory}
          className="btn btn-outline-secondary d-flex align-items-center gap-1"
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Bảng Hiển Thị Lịch Sử Đặt Phòng */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '90px' }}>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Số lượng phòng</th>
                <th>Tổng thanh toán</th>
                <th style={{ width: '150px' }}>Trạng thái</th>
                <th style={{ width: '120px' }} className="text-end">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang nạp lịch sử đặt phòng từ máy chủ...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <Calendar size={36} className="text-muted mb-2 d-block mx-auto" />
                    Bạn chưa có giao dịch đặt phòng nào. Hãy chuyển sang mục Đặt phòng trực tuyến để trải nghiệm dịch vụ!
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.bookingReservationId}>
                    <td className="fw-semibold text-primary">#{item.bookingReservationId}</td>
                    <td className="text-secondary">{item.bookingDate}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {item.bookingDetails?.length || 1} phòng
                      </span>
                    </td>
                    <td className="fw-bold text-success">
                      {Number(item.totalPrice || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td>
                      <StatusBadge status={item.bookingStatus} type="booking" />
                    </td>
                    <td className="text-end">
                      {/* Nút bấm mở Popup xem chi tiết các phòng trong đơn */}
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setViewingBooking(item)}
                      >
                        <Eye size={14} className="me-1 inline" /> Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Modal Xem Chi Tiết Đơn Đặt Phòng */}
      {viewingBooking && (
        <Modal
          title={`Chi tiết đơn đặt phòng #${viewingBooking.bookingReservationId}`}
          onClose={() => setViewingBooking(null)}
        >
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
              <div>
                <small className="text-muted d-block">Ngày tạo đơn:</small>
                <strong>{viewingBooking.bookingDate}</strong>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">Trạng thái:</small>
                <StatusBadge status={viewingBooking.bookingStatus} type="booking" />
              </div>
            </div>

            {/* Bảng chi tiết các phòng trong hóa đơn */}
            <h6 className="fw-bold mb-2">Các phòng đã đặt trong đơn:</h6>
            <div className="table-responsive mb-3">
              <table className="table table-sm table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Phòng</th>
                    <th>Loại</th>
                    <th>Nhận phòng</th>
                    <th>Trả phòng</th>
                    <th className="text-end">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingBooking.bookingDetails?.map((d, i) => (
                    <tr key={i}>
                      <td className="fw-bold">Phòng {d.roomInformation?.roomNumber}</td>
                      <td className="small">{d.roomInformation?.roomType?.roomTypeName || 'Tiêu chuẩn'}</td>
                      <td className="small">{d.startDate}</td>
                      <td className="small">{d.endDate}</td>
                      <td className="text-end fw-bold text-success">
                        {Number(d.actualPrice || 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tổng chi phí thanh toán */}
            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-3">
              <span className="fw-semibold">Tổng chi phí:</span>
              <span className="fs-5 fw-bold text-success">
                {Number(viewingBooking.totalPrice || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* Nút đóng Modal */}
            <div className="text-end">
              <button
                type="button"
                className="btn btn-secondary btn-sm px-3"
                onClick={() => setViewingBooking(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
