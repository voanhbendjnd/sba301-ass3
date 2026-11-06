/**
 * Author: Võ Anh Ben - SE1910
 * Màn hình xem danh mục phòng khách sạn công khai (PublicRoomsPage)
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU CÔNG KHAI (PUBLIC ACCESS & SEARCH/FILTER PIPELINE)
 * ===================================================================================
 * 
 * 1. Đặc tả nghiệp vụ đề bài (Business Requirement):
 *    "Do not need authentication to view the room information in this system."
 *    -> Bất kỳ khách vãng lai nào vào trang cũng có thể duyệt danh sách phòng, xem tiện nghi,
 *       sức chứa tối đa và giá phòng mỗi ngày mà không bị chặn bởi cơ chế đăng nhập.
 * 
 * 2. Khởi nạp Dữ liệu Ban đầu (Initial Data Fetching):
 *    - Hook `useEffect`: Chạy 1 lần khi component mount, gọi song song 2 hàm:
 *      + `loadRooms()`: Gọi `roomService.getPublicRooms()` -> HTTP GET `/api/rooms/public`.
 *        Server lọc các phòng có `roomStatus = 1` trong DB và trả về mảng đối tượng `RoomInformation`.
 *        Dữ liệu nhận về được gán vào state `rooms`.
 *      + `loadRoomTypes()`: Gọi `roomTypeService.getAll()` -> HTTP GET `/api/room-types`.
 *        Nhận về danh sách loại phòng và đổ vào dropdown `<select>` danh mục.
 * 
 * 3. Giải thuật Tìm kiếm & Lọc dữ liệu Real-time (Client-side Search & Filter Algorithm):
 *    - Biến `filteredRooms`: Sử dụng hàm `filter()` trên mảng `rooms` với 2 tiêu chí kết hợp:
 *      + Tiêu chí 1 (`matchesKeyword`): Tìm kiếm không phân biệt hoa thường (`toLowerCase()`)
 *        trên các trường: `roomNumber` (số phòng), `roomDetailDescription` (mô tả tiện nghi),
 *        và `roomType.roomTypeName` (tên loại phòng).
 *      + Tiêu chí 2 (`matchesType`): So sánh mã loại phòng `roomType.roomTypeId` với `selectedType`.
 *        Nếu `selectedType === 'ALL'`, bỏ qua điều kiện lọc theo loại phòng.
 *    - Kết quả: Khi người dùng gõ phím vào ô tìm kiếm hoặc đổi dropdown loại phòng,
 *      danh sách phòng tự động cập nhật ngay lập tức mà không cần gọi lại mạng.
 * 
 * 4. Luồng Sự kiện khi Click Nút (Event Click Flow):
 *    - Click "Đăng nhập / Đăng ký" (Top Navbar):
 *      -> Kích hoạt callback `onNavigateLogin()` -> `App.jsx` đổi `view = 'login'` để hiển thị form đăng nhập.
 *    - Click "Hệ thống (Tên người dùng)" (Khi đã đăng nhập):
 *      -> Kích hoạt `onNavigateLogin()` -> `App.jsx` đổi `view = 'app'` để vào thẳng workspace quản trị.
 *    - Click "Đặt phòng ngay" trên mỗi Card phòng:
 *      -> Gọi callback `onBookRoom(room)`:
 *         + Nếu chưa đăng nhập: Chuyển hướng sang màn hình Đăng nhập kèm Toast vàng thông báo.
 *         + Nếu đã đăng nhập: Chuyển thẳng sang phân hệ `CustomerBookingPage.jsx` để đặt phòng.
 */

import { useState, useEffect } from 'react';
import {
  Bed,
  Users,
  Search,
  DollarSign,
  LogIn,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import Brand from '../components/Brand.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { roomService } from '../services/roomService.js';
import { roomTypeService } from '../services/roomTypeService.js';

export default function PublicRoomsPage({ onNavigateLogin, onBookRoom, currentUser }) {
  // State lưu danh sách toàn bộ phòng công khai nhận từ Backend
  const [rooms, setRooms] = useState([]);
  // State lưu danh mục các loại phòng để đưa vào ô lọc
  const [roomTypes, setRoomTypes] = useState([]);
  // State báo hiệu đang tải dữ liệu từ máy chủ
  const [loading, setLoading] = useState(true);
  // State lưu thông báo lỗi kết nối nếu có
  const [error, setError] = useState('');
  // State lưu từ khóa tìm kiếm người dùng đang nhập
  const [keyword, setKeyword] = useState('');
  // State lưu loại phòng được chọn từ Dropdown ('ALL' hoặc mã ID cụ thể)
  const [selectedType, setSelectedType] = useState('ALL');

  // Khởi nạp danh sách phòng và loại phòng khi mở trang
  useEffect(() => {
    loadRooms();
    loadRoomTypes();
  }, []);

  /**
   * Tải danh sách phòng công khai từ API máy chủ
   * Luồng: Gửi GET /api/rooms/public -> Lưu vào state rooms
   */
  async function loadRooms() {
    setLoading(true);
    setError('');
    try {
      const data = await roomService.getPublicRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách phòng từ máy chủ');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Tải danh mục loại phòng để phục vụ bộ lọc tìm kiếm
   * Luồng: Gửi GET /api/room-types -> Lưu vào state roomTypes
   */
  async function loadRoomTypes() {
    try {
      const data = await roomTypeService.getAll();
      setRoomTypes(data);
    } catch {
      // Bỏ qua lỗi nạp loại phòng để không chặn hiển thị phòng
    }
  }

  /**
   * Giải thuật lọc phòng kết hợp:
   * 1. So khớp từ khóa với số phòng, mô tả và tên loại phòng
   * 2. So khớp ID loại phòng đã chọn
   */
  const filteredRooms = rooms.filter((room) => {
    const matchesKeyword =
      !keyword.trim() ||
      room.roomNumber.toLowerCase().includes(keyword.toLowerCase().trim()) ||
      (room.roomDetailDescription &&
        room.roomDetailDescription.toLowerCase().includes(keyword.toLowerCase().trim())) ||
      (room.roomType?.roomTypeName &&
        room.roomType.roomTypeName.toLowerCase().includes(keyword.toLowerCase().trim()));

    const matchesType =
      selectedType === 'ALL' ||
      (room.roomType && String(room.roomType.roomTypeId) === String(selectedType));

    return matchesKeyword && matchesType;
  });

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* Top Navigation Bar */}
      <header className="navbar navbar-expand-lg navbar-dark bg-dark py-3 px-4 shadow-sm sticky-top">
        <div className="container-fluid max-w-7xl">
          <div className="d-flex align-items-center gap-2">
            <Brand />
          </div>

          <div className="d-flex align-items-center gap-2">
            {currentUser ? (
              // Đã đăng nhập: Nút truy cập vào phân hệ nội bộ
              <button
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                onClick={onNavigateLogin}
              >
                <span>Hệ thống ({currentUser.accountName})</span>
              </button>
            ) : (
              // Chưa đăng nhập: Nút mở màn hình Đăng nhập / Đăng ký
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 shadow-sm"
                onClick={onNavigateLogin}
              >
                <LogIn size={15} />
                <span>Đăng nhập / Đăng ký</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner giới thiệu thương hiệu khách sạn */}
      <section className="bg-primary text-white py-5 text-center shadow-sm">
        <div className="container py-3">
          <span className="badge bg-white text-primary mb-2 px-3 py-2 rounded-pill fw-semibold">
            ✨ Hệ Thống Đặt Phòng Khách Sạn FUMiniHotel
          </span>
          <h1 className="display-5 fw-bold mb-3">Trải Nghiệm Kỳ Nghỉ Đẳng Cấp</h1>
          <p className="lead mb-4 text-white-50 mx-auto" style={{ maxWidth: '650px' }}>
            Không gian phòng hiện đại, tiện nghi sang trọng và dịch vụ chuyên nghiệp. Xem danh sách phòng khả dụng theo thời gian thực.
          </p>
        </div>
      </section>

      {/* Vùng nội dung chính */}
      <main className="container my-5 flex-grow-1">
        {/* Thanh tìm kiếm và bộ lọc loại phòng */}
        <div className="card shadow-sm border-0 mb-4 p-3">
          <div className="row g-3 align-items-center">
            {/* Ô nhập từ khóa tìm kiếm */}
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Tìm phòng theo số phòng, tiện nghi, mô tả..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            {/* Dropdown lọc theo loại phòng */}
            <div className="col-12 col-md-4 col-lg-4">
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="ALL">Tất cả loại phòng</option>
                {roomTypes.map((t) => (
                  <option key={t.roomTypeId} value={t.roomTypeId}>
                    {t.roomTypeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Số lượng phòng khớp điều kiện */}
            <div className="col-12 col-md-2 col-lg-3 text-md-end text-muted small">
              Tìm thấy <strong>{filteredRooms.length}</strong> phòng sẵn sàng
            </div>
          </div>
        </div>

        {/* Cảnh báo lỗi kết nối */}
        {error && (
          <div className="alert alert-danger py-2 mb-4 d-flex align-items-center gap-2">
            <Info size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Trạng thái đang tải dữ liệu */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="text-muted mt-2">Đang tải thông tin phòng từ máy chủ...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          /* Trạng thái không tìm thấy kết quả */
          <div className="text-center py-5 bg-white rounded shadow-sm p-5">
            <Bed size={48} className="text-muted mb-3" />
            <h5 className="fw-semibold">Không tìm thấy phòng phù hợp</h5>
            <p className="text-muted small">Vui lòng thử từ khóa tìm kiếm hoặc bộ lọc loại phòng khác.</p>
          </div>
        ) : (
          /* Lưới hiển thị danh sách phòng */
          <div className="row g-4">
            {filteredRooms.map((room) => (
              <div key={room.roomId} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0 transition-hover">
                  {/* Header thẻ: Loại phòng và Huy hiệu trạng thái */}
                  <div className="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold px-2 py-1">
                      {room.roomType?.roomTypeName || 'Tiêu chuẩn'}
                    </span>
                    <StatusBadge status={room.roomStatus} />
                  </div>

                  {/* Body thẻ: Số phòng, mô tả, sức chứa, giá tiền */}
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Bed size={22} className="text-primary" />
                      <h4 className="card-title fw-bold mb-0">Phòng {room.roomNumber}</h4>
                    </div>

                    <p className="card-text text-muted small mb-3 text-truncate-2" style={{ minHeight: '40px' }}>
                      {room.roomDetailDescription || 'Đầy đủ tiện nghi máy lạnh, wifi, minibar và phòng tắm riêng.'}
                    </p>

                    <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-auto">
                      <div className="d-flex align-items-center gap-1 text-muted small">
                        <Users size={16} />
                        <span>Tối đa {room.roomMaxCapacity || 2} khách</span>
                      </div>
                      <div className="text-end">
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Giá theo ngày</div>
                        <strong className="text-primary fs-5">
                          {Number(room.roomPricePerDay || 0).toLocaleString('vi-VN')} đ
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Footer thẻ: Nút Đặt phòng ngay */}
                  <div className="card-footer bg-white border-0 pt-0 pb-3">
                    <button
                      className="btn btn-outline-primary w-100 d-flex justify-content-center align-items-center gap-1 py-2 fw-semibold"
                      onClick={() => {
                        // Kích hoạt callback đặt phòng truyền lên App.jsx
                        if (onBookRoom) {
                          onBookRoom(room);
                        } else {
                          onNavigateLogin();
                        }
                      }}
                    >
                      <Calendar size={16} />
                      <span>Đặt phòng ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer bản quyền */}
      <footer className="bg-dark text-white-50 py-4 text-center mt-auto border-top">
        <div className="container small">
          <p className="mb-1 text-white">FUMiniHotel Management System - Spring Boot 3 & React REST Service</p>
          <p className="mb-0">Sinh viên: Võ Anh Ben - Lớp SE1910 - Assignment 03 SBA301</p>
        </div>
      </footer>
    </div>
  );
}
