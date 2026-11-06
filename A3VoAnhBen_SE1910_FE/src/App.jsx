/**
 * Author: Võ Anh Ben - SE1910
 * Component gốc của ứng dụng (App Root Component)
 * Hệ thống Quản lý Khách sạn FUMiniHotelSystem - Assignment 03 SBA301
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG ĐIỀU HƯỚNG TOÀN CỤC (GLOBAL ROUTING & AUTH STATE MACHINE)
 * ===================================================================================
 * 
 * 1. Khởi tạo trạng thái ứng dụng (State Initialization):
 *    - `currentUser`: Lấy phiên đăng nhập hiện tại từ `sessionStorage` qua `authService.getCurrentUser()`.
 *    - `view`: Phân hệ giao diện cấp cao nhất gồm 3 chế độ:
 *        + 'public': Dành cho khách vãng lai duyệt danh sách phòng khách sạn (không cần xác thực theo đề bài).
 *        + 'login': Màn hình đăng nhập tài khoản Staff/Customer và form Đăng ký Customer mới.
 *        + 'app': Khu vực làm việc nội bộ khi đã xác thực thành công qua JSON Web Token (JWT).
 *    - `page`: Trang chức năng cụ thể bên trong giao diện 'app':
 *        + Với Staff (Role 1 hoặc 'Staff'): Mặc định là 'rooms' (Quản lý phòng); cho phép chuyển qua 'customers', 'bookings', 'profile'.
 *        + Với Customer (Role 2 hoặc 'Customer'): Mặc định là 'book-room' (Đặt phòng trực tuyến); cho phép chuyển qua 'history', 'profile'.
 * 
 * 2. Luồng dữ liệu khi người dùng Đăng nhập (Login Data Flow):
 *    - Người dùng nhập Email/Mật khẩu và ấn "Đăng nhập" tại `LoginPage.jsx`.
 *    - `authService.login()` gửi HTTP POST tới `/api/auth/login`.
 *    - Backend trả về JWT Token và thông tin User -> Lưu vào `sessionStorage`.
 *    - Gọi callback `handleLoginSuccess(user)`:
 *        + Cập nhật state `currentUser = user`.
 *        + Chuyển `view = 'app'`.
 *        + Phân luồng trang tự động theo vai trò: Staff -> 'rooms', Customer -> 'book-room'.
 *        + Bắn Toast xanh chào mừng người dùng.
 * 
 * 3. Luồng dữ liệu khi người dùng Đăng xuất (Logout Data Flow):
 *    - Người dùng nhấn nút "Đăng xuất" tại Sidebar của `AdminLayout.jsx`.
 *    - Gọi `handleLogout()`:
 *        + Xóa khóa phiên đăng nhập khỏi `sessionStorage`.
 *        + Đặt state `currentUser = null`.
 *        + Chuyển `view = 'public'` đưa người dùng về trang xem phòng công khai.
 *        + Hiển thị Toast thông báo đã đăng xuất an toàn.
 * 
 * 4. Luồng Chuyển đổi Khách đặt phòng từ trang Công khai (Public-to-Booking Flow):
 *    - Khách vãng lai xem danh mục phòng tại `PublicRoomsPage.jsx` và ấn nút "Đặt phòng ngay":
 *    - Gọi callback `handleBookRoomFromPublic(room)`:
 *        + Nếu CHƯA đăng nhập: Chuyển `view = 'login'`, bắn Toast vàng nhắc người dùng đăng nhập/đăng ký.
 *        + Nếu ĐÃ đăng nhập: Chuyển thẳng vào `view = 'app'` và mở trang `page = 'book-room'`.
 * 
 * 5. Hệ thống Thông báo Toàn cục (Global Toast Notification System):
 *    - State `toast`: Chứa đối tượng `{ message, type: 'success' | 'danger' | 'warning' }`.
 *    - Hàm `showToast(msg, type)`: Được truyền làm prop xuống tất cả các trang con.
 *    - Hook `useEffect`: Tự động kích hoạt bộ hẹn giờ `setTimeout` 4.5 giây để đóng Toast và cleanup timer.
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import PublicRoomsPage from './pages/PublicRoomsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import CustomerManagementPage from './pages/CustomerManagementPage.jsx';
import RoomManagementPage from './pages/RoomManagementPage.jsx';
import BookingManagementPage from './pages/BookingManagementPage.jsx';
import CustomerBookingPage from './pages/CustomerBookingPage.jsx';
import BookingHistoryPage from './pages/BookingHistoryPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { authService } from './services/authService.js';

export default function App() {
  // 1. Khôi phục thông tin tài khoản người dùng từ bộ nhớ phiên sessionStorage
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  // 2. State điều khiển phân hệ hiển thị: 'public' | 'login' | 'app'
  const [view, setView] = useState(() => (authService.getCurrentUser() ? 'app' : 'public'));

  // 3. State điều khiển trang chức năng hiện tại theo phân quyền vai trò
  const [page, setPage] = useState(() => {
    const user = authService.getCurrentUser();
    const isStaff = user?.accountRole === 1 || user?.role === 'Staff';
    return isStaff ? 'rooms' : 'book-room';
  });

  // 4. State thông báo Toast nổi trên màn hình
  const [toast, setToast] = useState(null);

  /**
   * Kích hoạt hiển thị thông báo phản hồi người dùng
   * @param {string} message - Nội dung thông báo
   * @param {'success'|'danger'|'warning'} type - Loại thông báo để đổi màu sắc
   */
  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

  // Tự động tắt Toast thông báo sau 4.5 giây
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  /**
   * Xử lý đăng nhập thành công từ LoginPage
   * @param {Object} user - Đối tượng User kèm JWT token từ server
   */
  function handleLoginSuccess(user) {
    setCurrentUser(user);
    setView('app');
    const isStaff = user.accountRole === 1 || user.role === 'Staff';
    if (isStaff) {
      setPage('rooms'); // Staff vào thẳng trang Quản lý phòng
    } else {
      setPage('book-room'); // Customer vào thẳng trang Đặt phòng
    }
    showToast(`Đăng nhập thành công! Xin chào, ${user.accountName}`, 'success');
  }

  /**
   * Xử lý khi nhấn nút Đăng xuất
   */
  function handleLogout() {
    authService.logout();
    setCurrentUser(null);
    setView('public');
    showToast('Đã đăng xuất khỏi hệ thống', 'success');
  }

  /**
   * Xử lý khi khách bấm nút "Đặt phòng ngay" từ giao diện xem phòng công khai
   * @param {Object} room - Thông tin phòng khách chọn
   */
  function handleBookRoomFromPublic(room) {
    if (!currentUser) {
      // Khách chưa đăng nhập -> chuyển sang form đăng nhập kèm thông báo
      setView('login');
      showToast('Vui lòng đăng nhập hoặc đăng ký tài khoản để đặt phòng', 'warning');
    } else {
      // Khách đã đăng nhập -> chuyển thẳng vào trang đặt phòng
      setView('app');
      setPage('book-room');
    }
  }

  // Kiểm tra vai trò hiện tại có phải là Staff (Nhân viên) hay không
  const isStaff = currentUser?.accountRole === 1 || currentUser?.role === 'Staff';

  return (
    <>
      {/* Toast Notification Container hiển thị góc dưới bên phải màn hình */}
      {toast && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 9999 }}
        >
          <div
            className={`toast show align-items-center text-white bg-${
              toast.type === 'danger'
                ? 'danger'
                : toast.type === 'warning'
                ? 'warning text-dark'
                : 'success'
            } border-0 shadow-lg`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                {toast.type === 'danger' ? (
                  <AlertCircle size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                className={`btn-close ${toast.type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto`}
                onClick={() => setToast(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Phân hệ 1: Xem danh mục phòng công khai (Khách vãng lai không cần đăng nhập) */}
      {view === 'public' && (
        <PublicRoomsPage
          onNavigateLogin={() => setView('login')}
          onBookRoom={handleBookRoomFromPublic}
          currentUser={currentUser}
        />
      )}

      {/* Phân hệ 2: Màn hình Đăng nhập & Đăng ký tài khoản Khách hàng mới */}
      {view === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToPublic={() => setView('public')}
        />
      )}

      {/* Phân hệ 3: Nghiệp vụ theo vai trò khi đã xác thực qua JWT */}
      {view === 'app' && currentUser && (
        <AdminLayout
          page={page}
          onNavigate={setPage}
          onLogout={handleLogout}
          onGoPublic={() => setView('public')}
          currentUser={currentUser}
        >
          {/* Phân quyền 1: Nhân viên (Staff) */}
          {isStaff && (
            <>
              {page === 'customers' && (
                <CustomerManagementPage showToast={showToast} />
              )}
              {page === 'rooms' && (
                <RoomManagementPage showToast={showToast} />
              )}
              {page === 'bookings' && (
                <BookingManagementPage showToast={showToast} />
              )}
              {page === 'profile' && (
                <ProfilePage
                  currentUser={currentUser}
                  onProfileUpdated={setCurrentUser}
                  showToast={showToast}
                />
              )}
            </>
          )}

          {/* Phân quyền 2: Khách hàng (Customer) */}
          {!isStaff && (
            <>
              {page === 'book-room' && (
                <CustomerBookingPage
                  currentUser={currentUser}
                  onBookingSuccess={() => setPage('history')}
                  showToast={showToast}
                />
              )}
              {page === 'history' && (
                <BookingHistoryPage
                  currentUser={currentUser}
                  showToast={showToast}
                />
              )}
              {page === 'profile' && (
                <ProfilePage
                  currentUser={currentUser}
                  onProfileUpdated={setCurrentUser}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </AdminLayout>
      )}
    </>
  );
}
