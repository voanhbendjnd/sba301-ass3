/**
 * Author: Võ Anh Ben - SE1910
 * Màn hình Đặt phòng Trực tuyến dành cho Khách hàng (CustomerBookingPage)
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU ĐẶT PHÒNG TRỰC TUYẾN (ONLINE BOOKING WORKFLOW)
 * ===================================================================================
 * 
 * 1. Đặc tả nghiệp vụ đề bài (Business Requirement):
 *    "If user is a Customer, this customer role is allowed to:
 *     Create an online booking reservation with one or many rooms' information."
 * 
 * 2. Khởi nạp Danh sách Phòng Khả dụng (`loadRooms`):
 *    - Hook `useEffect`: Chạy khi component mount, gọi `roomService.getPublicRooms()`.
 *    - Gửi request: HTTP GET `/api/rooms/public`.
 *    - Backend: Lọc tất cả phòng đang ở trạng thái hoạt động (`roomStatus = 1`).
 *    - Nhận dữ liệu: Đổ vào state `rooms` để hiển thị các Card phòng cho khách lựa chọn.
 * 
 * 3. Giải thuật Tính toán Thời gian & Giá Tiền Real-time (Dynamic Price Estimation Algorithm):
 *    - Bước 1 (Số đêm lưu trú):
 *      `nightCount = Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))`.
 *      Tự động tính chênh lệch giữa ngày trả phòng và ngày nhận phòng.
 *    - Bước 2 (Danh sách phòng khách chọn):
 *      Lọc mảng `rooms` theo danh sách `selectedRoomIds`.
 *    - Bước 3 (Tổng tiền thanh toán dự kiến):
 *      `estimatedTotal = selectedRoomsList.reduce((sum, r) => sum + r.roomPricePerDay * nightCount, 0)`.
 *      Mỗi khi khách hàng click chọn thêm/bỏ bớt phòng hoặc đổi ngày nhận/trả phòng,
 *      con số Tổng thanh toán trên giao diện tự động nhảy lại tức thì!
 * 
 * 4. Luồng Xử lý Khi Bấm Nút "Xác nhận đặt phòng" (`handleBookNow`):
 *    - Click nút "Xác nhận đặt phòng" (Nút màu vàng nổi bật tại Bước 3):
 *    - Kiểm tra tính hợp lệ Client-side:
 *      + `endDate` phải sau `startDate`.
 *      + Phải chọn ít nhất 1 phòng (`selectedRoomIds.length > 0`).
 *    - Bật cờ `submitting = true`.
 *    - Đóng gói Payload:
 *      ```json
 *      {
 *        "customerId": currentUser.accountId,
 *        "items": [
 *          { "roomId": 1, "startDate": "...", "endDate": "...", "actualPrice": 900000 },
 *          { "roomId": 2, "startDate": "...", "endDate": "...", "actualPrice": 1500000 }
 *        ]
 *      }
 *      ```
 *    - Gửi request: Gọi `bookingService.create(payload)` -> HTTP POST `/api/bookings`.
 *    - Phía Backend Spring Boot:
 *      + Lưu `BookingReservation` vào bảng chính.
 *      + Lưu các phần tử `BookingDetail` vào bảng chi tiết.
 *      + Tính tổng thanh toán cuối cùng và lưu vào cột `TotalPrice`.
 *    - Phản hồi nhận về:
 *      + Đơn đặt phòng `BookingReservation` hoàn tất.
 *      + Bắn Toast xanh: "Đặt phòng thành công! Cảm ơn bạn đã lựa chọn FUMiniHotel".
 *      + Kích hoạt callback `onBookingSuccess()` -> `App.jsx` tự động chuyển sang trang Lịch sử `history`
 *        để khách hàng xem lại hóa đơn của mình ngay lập tức!
 */

import { useState, useEffect } from 'react';
import {
  CalendarPlus,
  Bed,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { roomService } from '../services/roomService.js';
import { bookingService } from '../services/bookingService.js';

export default function CustomerBookingPage({ currentUser, onBookingSuccess, showToast }) {
  // State lưu danh sách tất cả các phòng khả dụng trong khách sạn
  const [rooms, setRooms] = useState([]);
  // State báo hiệu đang tải danh sách phòng
  const [loading, setLoading] = useState(true);
  // State lưu mảng các mã phòng mà khách đã chọn (Hỗ trợ đặt nhiều phòng)
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);

  // Ngày nhận phòng mặc định: hôm nay, ngày trả phòng: ngày mai
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    return tmr.toISOString().split('T')[0];
  });

  // State trạng thái mạng và thông báo lỗi
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Nạp danh sách phòng khi mở trang
  useEffect(() => {
    loadRooms();
  }, []);

  /**
   * Tải danh sách phòng khả dụng từ API
   * Luồng: GET /api/rooms/public -> Lưu vào state rooms
   */
  async function loadRooms() {
    setLoading(true);
    try {
      const data = await roomService.getPublicRooms();
      setRooms(data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách phòng khả dụng');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Chọn hoặc bỏ chọn một phòng khi click vào thẻ Card phòng
   * @param {number} roomId - Mã ID phòng được click
   */
  function toggleRoom(roomId) {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  }

  // Thuật toán tính số đêm lưu trú giữa 2 mốc thời gian
  const nightCount = Math.max(
    1,
    Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
  );

  // Thuật toán tính tổng tiền thanh toán dự kiến theo số phòng và số đêm
  const selectedRoomsList = rooms.filter((r) => selectedRoomIds.includes(r.roomId));
  const estimatedTotal = selectedRoomsList.reduce((sum, r) => {
    const price = Number(r.roomPricePerDay || 0);
    return sum + price * nightCount;
  }, 0);

  /**
   * Xử lý xác nhận đặt phòng trực tuyến
   * Luồng: Validate ngày & phòng -> POST /api/bookings -> Báo thành công -> Chuyển sang trang Lịch sử
   */
  async function handleBookNow(e) {
    e.preventDefault();
    setError('');

    if (new Date(endDate) <= new Date(startDate)) {
      setError('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    if (selectedRoomIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 phòng khách sạn');
      return;
    }

    setSubmitting(true);
    try {
      // Chuẩn bị danh sách chi tiết các phòng đặt
      const items = selectedRoomIds.map((roomId) => {
        const roomObj = rooms.find((r) => r.roomId === roomId);
        const roomPrice = Number(roomObj?.roomPricePerDay || 0);
        return {
          roomId,
          startDate,
          endDate,
          actualPrice: roomPrice * nightCount,
        };
      });

      // Gửi yêu cầu đặt phòng tới backend API
      await bookingService.create({
        customerId: currentUser?.accountId,
        items,
      });

      showToast('Đặt phòng thành công! Cảm ơn bạn đã lựa chọn FUMiniHotel', 'success');
      // Kích hoạt callback chuyển hướng người dùng sang trang Lịch sử đặt phòng
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (err) {
      setError(err.message || 'Không thể đặt phòng lúc này');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Tiêu đề trang */}
      <div className="mb-4">
        <h1 className="h4 fw-bold text-dark mb-1">Đặt Phòng Trực Tuyến (Online Booking)</h1>
        <p className="text-muted small mb-0">
          Chọn thời gian lưu trú và một hoặc nhiều phòng mong muốn cho chuyến đi của bạn
        </p>
      </div>

      {/* Cảnh báo lỗi xác thực form */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-4">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleBookNow}>
        {/* Bước 1: Chọn ngày nhận và ngày trả phòng */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white border-bottom py-3">
            <h5 className="h6 fw-bold mb-0 d-flex align-items-center gap-2 text-primary">
              <Calendar size={18} />
              <span>Bước 1: Chọn Thời Gian Lưu Trú ({nightCount} đêm)</span>
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Ngày nhận phòng (Check-in)</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Ngày trả phòng (Check-out)</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bước 2: Chọn một hoặc nhiều phòng */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h5 className="h6 fw-bold mb-0 d-flex align-items-center gap-2 text-primary">
              <Bed size={18} />
              <span>Bước 2: Chọn Một Hoặc Nhiều Phòng ({selectedRoomIds.length} đã chọn)</span>
            </h5>
            <small className="text-muted">Nhấp vào thẻ phòng để chọn/bỏ chọn</small>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <span className="spinner-border spinner-border-sm me-2 text-primary"></span>
                Đang nạp danh sách phòng khả dụng...
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-4 text-muted">
                Hiện tại không có phòng nào khả dụng
              </div>
            ) : (
              <div className="row g-3">
                {rooms.map((room) => {
                  const isSelected = selectedRoomIds.includes(room.roomId);
                  return (
                    <div key={room.roomId} className="col-12 col-md-6 col-lg-4">
                      {/* Thẻ Card phòng hỗ trợ click chọn */}
                      <div
                        className={`card h-100 cursor-pointer transition-all border-2 ${
                          isSelected ? 'border-primary bg-primary-subtle' : 'border-light-subtle'
                        }`}
                        onClick={() => toggleRoom(room.roomId)}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge bg-secondary-subtle text-dark border">
                              {room.roomType?.roomTypeName || 'Tiêu chuẩn'}
                            </span>
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={isSelected}
                                onChange={() => {}}
                              />
                            </div>
                          </div>

                          <h5 className="fw-bold mb-1">Phòng {room.roomNumber}</h5>
                          <p className="small text-muted mb-2 text-truncate-2" style={{ minHeight: '36px' }}>
                            {room.roomDetailDescription || 'Đầy đủ tiện nghi hiện đại'}
                          </p>

                          <div className="d-flex justify-content-between align-items-center small border-top pt-2 mt-auto">
                            <span className="text-muted d-flex align-items-center gap-1">
                              <Users size={14} /> Tối đa {room.roomMaxCapacity || 2} khách
                            </span>
                            <span className="fw-bold text-success">
                              {Number(room.roomPricePerDay).toLocaleString('vi-VN')} đ/ngày
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bước 3: Tóm tắt đơn đặt và Nút bấm xác nhận */}
        <div className="card shadow border-0 bg-dark text-white p-4 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <div className="text-white-50 small">Khách hàng đặt:</div>
              <strong className="fs-6">{currentUser?.accountName}</strong> ({currentUser?.accountEmail})
              <div className="mt-1 small text-white-50">
                Thời gian: {startDate} → {endDate} ({nightCount} đêm) • {selectedRoomIds.length} phòng được chọn
              </div>
            </div>

            <div className="text-md-end">
              <div className="text-white-50 small">Tổng thanh toán dự kiến:</div>
              <h3 className="fw-bold text-warning mb-2">
                {estimatedTotal.toLocaleString('vi-VN')} đ
              </h3>
              {/* Nút bấm Submit gửi đơn đặt phòng */}
              <button
                type="submit"
                className="btn btn-warning px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow"
                disabled={submitting || selectedRoomIds.length === 0}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Đang xử lý đặt phòng...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Xác nhận đặt phòng</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
