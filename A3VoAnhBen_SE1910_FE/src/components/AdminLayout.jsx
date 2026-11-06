/**
 * Author: Võ Anh Ben - SE1910
 * Master Layout Quản Trị & Nghiệp Vụ (AdminLayout Component)
 * 
 * ===================================================================================
 * GIẢI THUẬT PHÂN QUYỀN VÀ LUỒNG ĐIỀU HƯỚNG GIAO DIỆN (RBAC NAVIGATION ALGORITHM)
 * ===================================================================================
 * 
 * 1. Giải thuật Sinh Danh sách Menu theo Vai trò (`getMenuItemsForRole`):
 *    - Input: `role` (1 hoặc 'Staff' cho Nhân viên; 2 hoặc 'Customer' cho Khách hàng).
 *    - Kiểm tra điều kiện:
 *      + Nếu là Staff:
 *        Tạo mảng menu gồm 3 chức năng đặc tả của đề bài:
 *          1. `customers`: 'Quản lý Khách hàng' (Icon: Users)
 *          2. `rooms`: 'Quản lý Phòng' (Icon: Bed)
 *          3. `bookings`: 'Quản lý Đặt phòng' (Icon: CalendarCheck)
 *      + Nếu là Customer:
 *        Tạo mảng menu gồm 3 chức năng đặc tả của đề bài:
 *          1. `book-room`: 'Đặt phòng trực tuyến' (Icon: CalendarPlus)
 *          2. `history`: 'Lịch sử đặt phòng' (Icon: History)
 *          3. `profile`: 'Hồ sơ cá nhân' (Icon: User)
 *    - Output: Mảng các đối tượng menu hợp lệ `{ id, label, icon }` render trực tiếp lên Sidebar.
 * 
 * 2. Luồng Điều khiển Menu trên Thiết bị di động (Responsive Drawer Flow):
 *    - State `menuOpen`: Điều khiển mở/đóng thanh Sidebar trên màn hình điện thoại hoặc máy tính bảng.
 *    - Khi người dùng ấn nút Hamburger Menu (3 gạch) trên Header:
 *      -> Kích hoạt `onMenu()` -> `setMenuOpen(true)` -> Mở sidebar kèm lớp mờ backdrop.
 *    - Khi người dùng ấn vào một mục điều hướng hoặc lớp mờ backdrop hoặc nút X:
 *      -> Kích hoạt `onClose()` -> `setMenuOpen(false)` -> Đóng sidebar.
 * 
 * 3. Luồng Chuyển đổi Nhanh Xem Danh Mục Phòng Khách (Go Public Flow):
 *    - Khi người dùng bấm nút "Xem phòng khách sạn" (trên Header hoặc chân Sidebar):
 *      -> Kích hoạt callback `onGoPublic()` -> `App.jsx` chuyển `view = 'public'`,
 *         cho phép Staff/Customer dễ dàng chuyển qua xem danh sách phòng công khai bên ngoài.
 * 
 * 4. Luồng Đăng xuất Tài khoản (Logout Flow):
 *    - Khi người dùng ấn nút "Đăng xuất" ở chân Sidebar:
 *      -> Kích hoạt callback `onLogout()` truyền từ `App.jsx` -> xóa session và đưa về trang khách.
 */

import {
  Users,
  Bed,
  CalendarCheck,
  CalendarPlus,
  History,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import Brand from './Brand.jsx';

/**
 * Thuật toán sinh danh sách menu điều hướng dựa trên vai trò của tài khoản
 * @param {number|string} role - 1/'Staff': Nhân viên khách sạn, 2/'Customer': Khách hàng
 * @returns {Array} Danh sách các item menu hợp lệ
 */
export function getMenuItemsForRole(role) {
  const isStaff = role === 1 || role === 'Staff';

  if (isStaff) {
    // Quyền Nhân viên (Staff): Quản lý khách hàng, phòng và đặt phòng
    return [
      { id: 'customers', label: 'Quản lý Khách hàng', icon: Users },
      { id: 'rooms', label: 'Quản lý Phòng', icon: Bed },
      { id: 'bookings', label: 'Quản lý Đặt phòng', icon: CalendarCheck },
    ];
  }

  // Quyền Khách hàng (Customer): Đặt phòng, xem lịch sử và hồ sơ cá nhân
  return [
    { id: 'book-room', label: 'Đặt phòng trực tuyến', icon: CalendarPlus },
    { id: 'history', label: 'Lịch sử đặt phòng', icon: History },
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
  ];
}

/**
 * Thanh tiêu đề trên cùng (Header Component)
 * Hiển thị đường dẫn Breadcrumbs, thông tin đại diện người dùng và nút chuyển trang
 */
export function Header({ page, currentUser, onMenu, onGoPublic }) {
  const role = currentUser?.accountRole || (currentUser?.role === 'Staff' ? 1 : 2);
  const menuList = getMenuItemsForRole(role);
  const currentLabel = menuList.find((item) => item.id === page)?.label || 'Bảng điều khiển';
  const isStaff = role === 1 || currentUser?.role === 'Staff';
  const roleTitle = isStaff ? 'Nhân viên (Staff)' : 'Khách hàng (Customer)';

  return (
    <header className="workspace-header">
      {/* Nút mở menu trên thiết bị di động */}
      <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}>
        <Menu size={20} />
      </button>

      {/* Đường dẫn Breadcrumbs hiển thị vị trí trang hiện tại */}
      <div className="breadcrumb-line">
        <span>FUMiniHotel</span>
        <ChevronRight size={14} />
        <span className="current-page">{currentLabel}</span>
      </div>

      <div className="d-flex align-items-center gap-3 ms-auto">
        {/* Nút chuyển nhanh ra xem danh mục phòng ngoài trang chủ */}
        <button
          onClick={onGoPublic}
          className="btn btn-sm btn-outline-primary d-none d-md-flex align-items-center gap-1"
          title="Xem danh sách phòng công khai cho khách"
        >
          <ExternalLink size={14} /> Danh mục phòng
        </button>

        {/* Thông tin đại diện tài khoản */}
        <div className="header-user">
          <div className="avatar">
            {(currentUser?.accountName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <strong>{currentUser?.accountName || 'Người dùng'}</strong>
            <small>{roleTitle}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Thanh điều hướng bên cạnh (Sidebar Component)
 * Hiển thị Logo thương hiệu, các nút chức năng phân quyền và nút đăng xuất
 */
export function Sidebar({ page, onNavigate, onLogout, onGoPublic, currentUser, open, onClose }) {
  const role = currentUser?.accountRole || (currentUser?.role === 'Staff' ? 1 : 2);
  const menuList = getMenuItemsForRole(role);

  return (
    <>
      {/* Lớp nền mờ khi mở Sidebar trên điện thoại */}
      {open && (
        <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />
      )}

      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        {/* Logo thương hiệu và nút đóng sidebar */}
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-menu"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Danh sách các nút chức năng được lọc theo Role */}
        <nav aria-label="Main navigation" className="sidebar-nav">
          {menuList.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'selected' : ''}`}
              aria-current={page === id ? 'page' : undefined}
              onClick={() => {
                onNavigate(id); // Khi click: kích hoạt đổi state page trên App.jsx
                onClose();     // Đóng menu nếu đang ở màn hình điện thoại
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Vùng chân Sidebar: Nút xem danh mục ngoài và nút Đăng xuất */}
        <div className="sidebar-bottom">
          <button
            className="nav-item mb-1 text-primary"
            onClick={() => {
              onGoPublic();
              onClose();
            }}
          >
            <ExternalLink size={18} />
            <span>Xem phòng khách sạn</span>
          </button>
          <button className="nav-item logout" onClick={onLogout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/**
 * Master Layout bao bọc toàn bộ không gian làm việc
 */
export default function AdminLayout({
  page,
  onNavigate,
  onLogout,
  onGoPublic,
  currentUser,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-shell">
      {/* Thanh điều hướng bên trái */}
      <Sidebar
        page={page}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onGoPublic={onGoPublic}
        currentUser={currentUser}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* Vùng nội dung trung tâm */}
      <div className="workspace">
        <Header
          page={page}
          currentUser={currentUser}
          onMenu={() => setMenuOpen(true)}
          onGoPublic={onGoPublic}
        />

        <main id="main-content" className="main-content">
          {children}
        </main>

        <footer className="workspace-footer">
          <span>FUMiniHotel Management System © 2026 - SE1910</span>
        </footer>
      </div>
    </div>
  );
}
