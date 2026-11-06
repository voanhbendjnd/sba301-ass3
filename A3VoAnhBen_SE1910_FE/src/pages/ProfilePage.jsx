/**
 * Author: Võ Anh Ben - SE1910
 * Màn hình Quản lý Hồ sơ Cá nhân (ProfilePage)
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU CẬP NHẬT HỒ SƠ (PROFILE MANAGEMENT PIPELINE)
 * ===================================================================================
 * 
 * 1. Đặc tả nghiệp vụ đề bài (Business Requirement):
 *    "If user is a Customer, this customer role is allowed to:
 *     Manage his/her the profile."
 * 
 * 2. Khởi nạp Dữ liệu Hồ sơ (`useEffect`):
 *    - Đọc từ prop `currentUser` truyền từ `App.jsx` (đã lưu trong `sessionStorage`).
 *    - Gán `name`, `email`, `roleTitle`.
 *    - Nếu là Customer (`currentUser.accountId > 0`):
 *      + Gửi request HTTP GET `/api/customers/{id}` thông qua `customerService.getById(id)`.
 *      + Backend trả về chi tiết `Customer`: Họ tên, Số điện thoại, Email, Ngày sinh.
 *      + Cập nhật các state: `telephone`, `birthday` để hiển thị lên form chỉnh sửa.
 * 
 * 3. Giải thuật Kiểm tra Mật khẩu Đổi mới (Password Change Validation Algorithm):
 *    - Người dùng có thể để trống các ô mật khẩu nếu chỉ muốn cập nhật Họ tên / Số điện thoại / Ngày sinh.
 *    - Nếu người dùng nhập `newPassword`:
 *      + So sánh xác thực: `newPassword !== confirmPassword` -> Nếu không khớp, báo lỗi 'Mật khẩu mới và xác nhận mật khẩu không khớp', dừng gửi request.
 *      + Bổ sung `oldPassword` và `newPassword` vào payload.
 * 
 * 4. Luồng Xử lý Khi Bấm Nút "Lưu thay đổi" (`handleSave`):
 *    - Nhấn nút "Lưu thay đổi" (Submit form):
 *    - Bật cờ `saving = true` hiển thị Spinner đang lưu.
 *    - Gửi dữ liệu:
 *      + Nếu là Customer: Gọi `customerService.updateProfile(id, payload)` -> HTTP PUT `/api/customers/{id}/profile`.
 *      + Phía Backend kiểm tra mật khẩu cũ (nếu có yêu cầu đổi pass) -> Cập nhật thông tin trong SQL Server.
 *    - Đồng bộ phiên làm việc (Session Synchronization):
 *      + Tạo đối tượng phiên mới `newSessionUser = { ...currentUser, accountName: updated.customerFullName }`.
 *      + Cập nhật lại `sessionStorage` qua `authService.saveCurrentUser()`.
 *      + Gọi callback `onProfileUpdated(newSessionUser)` truyền lên `App.jsx` -> Tên người dùng trên thanh Header lập tức đổi mới mà không cần F5 trình duyệt!
 *      + Bắn Toast xanh báo thành công, reset các ô nhập mật khẩu về rỗng.
 */

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, Save, AlertCircle, Phone, Calendar } from 'lucide-react';
import { customerService } from '../services/customerService.js';
import { authService } from '../services/authService.js';

export default function ProfilePage({ currentUser, onProfileUpdated, showToast }) {
  // State họ tên người dùng
  const [name, setName] = useState('');
  // State địa chỉ email (chỉ đọc để bảo toàn tài khoản)
  const [email, setEmail] = useState('');
  // State số điện thoại
  const [telephone, setTelephone] = useState('');
  // State ngày sinh
  const [birthday, setBirthday] = useState('');
  // State nhãn vai trò hiển thị
  const [roleTitle, setRoleTitle] = useState('');

  // State các ô đổi mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State trạng thái lưu và thông báo lỗi
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Nạp dữ liệu hồ sơ cá nhân khi mở trang
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.accountName || '');
      setEmail(currentUser.accountEmail || '');
      const isStaff = currentUser.accountRole === 1 || currentUser.role === 'Staff';
      setRoleTitle(isStaff ? 'Nhân viên (Staff)' : 'Khách hàng (Customer)');

      // Nếu là Customer, load thông tin chi tiết số điện thoại và ngày sinh
      if (!isStaff && currentUser.accountId) {
        customerService.getById(currentUser.accountId).then((data) => {
          if (data) {
            setName(data.customerFullName || '');
            setTelephone(data.telephone || '');
            setBirthday(data.customerBirthday || '');
          }
        }).catch(() => {});
      }
    }
  }, [currentUser]);

  /**
   * Xử lý lưu thông tin hồ sơ và đổi mật khẩu
   * Luồng: Validate -> PUT /api/customers/{id}/profile -> Đồng bộ sessionStorage -> Bắn Toast
   */
  async function handleSave(e) {
    e.preventDefault();
    setError('');

    // Kiểm tra tên rỗng
    if (!name.trim()) {
      setError('Họ và tên không được để trống');
      return;
    }

    // Kiểm tra khớp mật khẩu mới
    if (newPassword && newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setSaving(true);
    try {
      const isStaff = currentUser.accountRole === 1 || currentUser.role === 'Staff';

      if (!isStaff && currentUser.accountId) {
        // Chuẩn bị payload cập nhật cho Customer
        const payload = {
          customerFullName: name.trim(),
          telephone: telephone.trim() || null,
          customerBirthday: birthday || null,
        };
        if (newPassword.trim()) {
          payload.oldPassword = oldPassword.trim();
          payload.newPassword = newPassword.trim();
        }

        // Gửi request cập nhật profile tới backend
        const updated = await customerService.updateProfile(currentUser.accountId, payload);

        // Đồng bộ dữ liệu hiển thị trên Header và thanh Sidebar
        const newSessionUser = {
          ...currentUser,
          accountName: updated.customerFullName,
        };
        authService.saveCurrentUser(newSessionUser);
        onProfileUpdated(newSessionUser);
      } else {
        // Trường hợp Staff đổi tên hiển thị
        const newSessionUser = {
          ...currentUser,
          accountName: name.trim(),
        };
        authService.saveCurrentUser(newSessionUser);
        onProfileUpdated(newSessionUser);
      }

      showToast('Cập nhật thông tin hồ sơ thành công', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Tiêu đề trang */}
      <div className="mb-4">
        <h1 className="h4 fw-bold text-dark mb-1">Hồ sơ cá nhân (My Profile)</h1>
        <p className="text-muted small mb-0">
          Xem và cập nhật thông tin cá nhân của bạn trên FUMiniHotelSystem
        </p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          {/* Cảnh báo lỗi xác thực */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-4">
              <AlertCircle size={16} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Trường Họ và tên */}
            <div className="mb-3">
              <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                <User size={15} /> Họ và tên *
              </label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Trường Email (Chỉ đọc để tránh sai lệch tài khoản đăng nhập) */}
            <div className="mb-3">
              <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                <Mail size={15} /> Địa chỉ Email
              </label>
              <input
                type="email"
                className="form-control bg-light"
                value={email}
                disabled
              />
              <div className="form-text small">
                Email dùng để định danh tài khoản và đăng nhập vào hệ thống.
              </div>
            </div>

            {/* Trường Số điện thoại và Ngày sinh */}
            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                  <Phone size={15} /> Số điện thoại
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="0912345678"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                  <Calendar size={15} /> Ngày sinh
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>
            </div>

            {/* Trường Vai trò tài khoản */}
            <div className="mb-4">
              <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                <Shield size={15} /> Vai trò tài khoản
              </label>
              <input
                type="text"
                className="form-control bg-light"
                value={roleTitle}
                disabled
              />
            </div>

            {/* Khối Đổi Mật Khẩu */}
            <div className="p-3 bg-light rounded-3 mb-4 border">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-1">
                <Key size={16} /> Đổi mật khẩu
              </h6>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu hiện tại (nếu muốn đổi)..."
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Nút bấm Submit Lưu thay đổi */}
            <div className="text-end">
              <button
                type="submit"
                className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
