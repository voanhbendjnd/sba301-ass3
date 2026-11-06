/**
 * Author: Võ Anh Ben - SE1910
 * Màn hình Đăng nhập & Đăng ký Hệ thống (LoginPage)
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU XÁC THỰC (AUTHENTICATION & REGISTRATION PIPELINE)
 * ===================================================================================
 * 
 * 1. Chuyển đổi qua lại giữa Đăng nhập và Đăng ký (Tab Switching):
 *    - State `tab`: Nhận giá trị 'login' hoặc 'register'.
 *    - Khi ấn nút Tab "Đăng nhập" hoặc "Đăng ký tài khoản":
 *      -> Cập nhật state `tab` và xóa các thông báo lỗi cũ (`setError('')`).
 * 
 * 2. Luồng Xử lý Đăng nhập (`handleLoginSubmit`):
 *    - Người dùng nhập Email, Mật khẩu và nhấn "Đăng nhập".
 *    - Giải thuật kiểm tra Client-side:
 *      + Nếu email rỗng -> báo lỗi 'Vui lòng nhập địa chỉ Email'.
 *      + Nếu password rỗng -> báo lỗi 'Vui lòng nhập Mật khẩu'.
 *    - Bật cờ `loading = true` để khóa các ô nhập liệu, hiển thị Spinner đang xác thực.
 *    - Gửi dữ liệu: Gọi `authService.login(email.trim(), password.trim())` -> HTTP POST `/api/auth/login`.
 *    - Phía Backend Spring Boot:
 *      + So sánh với tài khoản Staff trong `application.properties` (staff.email & staff.password).
 *      + Nếu không trùng Staff: Kiểm tra bảng `Customer` trong SQL Server, xác minh mật khẩu (hỗ trợ hash/BCrypt).
 *      + Nếu tài khoản hợp lệ: Trả về HTTP 200 kèm JSON Web Token (JWT) và quyền (Staff hoặc Customer).
 *    - Nhận dữ liệu: Lưu thông tin vào `sessionStorage`, gọi callback `onLoginSuccess(user)` truyền lên `App.jsx`.
 *    - Xử lý lỗi: Nếu sai mật khẩu hoặc tài khoản bị khóa -> Axios bóc tách câu lỗi và set vào state `error`.
 * 
 * 3. Luồng Xử lý Đăng ký Khách hàng mới (`handleRegisterSubmit`):
 *    - Khách điền Họ tên, Số điện thoại, Email, Ngày sinh, Mật khẩu và ấn "Tạo tài khoản".
 *    - Giải thuật Client-side kiểm tra tính hợp lệ dữ liệu.
 *    - Gửi dữ liệu: Gọi `authService.register({...})` -> HTTP POST `/api/auth/register`.
 *    - Phía Backend Spring Boot: Kiểm tra email đã tồn tại chưa -> Lưu bản ghi mới với trạng thái Active (1).
 *    - Nhận phản hồi thành công:
 *      + Hiển thị Alert xanh chúc mừng (`setSuccessMsg`).
 *      + Tự động điền email và mật khẩu vừa tạo vào form đăng nhập.
 *      + Chuyển state `tab = 'login'` để người dùng chỉ cần nhấn Đăng nhập là hoàn tất!
 * 
 * 4. Luồng Nút bấm Tài khoản Mẫu (Quick Fill Demo Buttons):
 *    - Click "Staff (application.properties)":
 *      -> Điền sẵn email `staff@fuminithotel.com`, pass `Staff@123`, chuyển tab Đăng nhập.
 *    - Click "Customer (Database)":
 *      -> Điền sẵn email `customer@gmail.com`, pass `123456`, chuyển tab Đăng nhập.
 * 
 * 5. Nút "Quay lại danh mục phòng":
 *    - Click nút ArrowLeft:
 *      -> Gọi callback `onBackToPublic()` truyền lên `App.jsx` -> Chuyển `view = 'public'`.
 */

import { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { authService } from '../services/authService.js';

export default function LoginPage({ onLoginSuccess, onBackToPublic }) {
  // Tab điều khiển biểu mẫu: 'login' (Đăng nhập) hoặc 'register' (Đăng ký)
  const [tab, setTab] = useState('login');

  // State các ô nhập liệu cho form Đăng nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State các ô nhập liệu cho form Đăng ký tài khoản Customer
  const [fullName, setFullName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // State trạng thái mạng và thông báo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /**
   * Xử lý submit biểu mẫu Đăng nhập
   * Luồng: Validate -> POST /api/auth/login -> Lưu JWT -> onLoginSuccess()
   */
  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Kiểm tra dữ liệu rỗng
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ Email');
      return;
    }
    if (!password.trim()) {
      setError('Vui lòng nhập Mật khẩu');
      return;
    }

    setLoading(true);
    try {
      // Gửi yêu cầu xác thực tới backend API
      const user = await authService.login(email.trim(), password.trim());
      // Báo thành công lên App root component để đổi màn hình
      onLoginSuccess(user);
    } catch (err) {
      // Bắt thông điệp lỗi từ backend trả về
      setError(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Xử lý submit biểu mẫu Đăng ký tài khoản Khách hàng
   * Luồng: Validate -> POST /api/auth/register -> Báo thành công -> Chuyển sang tab Đăng nhập
   */
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setError('Vui lòng nhập Họ và tên');
      return;
    }
    if (!regEmail.trim()) {
      setError('Vui lòng nhập địa chỉ Email');
      return;
    }
    if (!regPassword.trim()) {
      setError('Vui lòng nhập Mật khẩu');
      return;
    }

    setLoading(true);
    try {
      // Gửi dữ liệu đăng ký tới backend API
      await authService.register({
        customerFullName: fullName.trim(),
        telephone: telephone.trim() || null,
        emailAddress: regEmail.trim(),
        customerBirthday: birthday || null,
        password: regPassword.trim(),
      });
      // Thông báo thành công và chuyển sang form đăng nhập
      setSuccessMsg('Đăng ký tài khoản thành công! Vui lòng đăng nhập với tài khoản vừa tạo.');
      setEmail(regEmail.trim());
      setPassword(regPassword.trim());
      setTab('login');
    } catch (err) {
      setError(err.message || 'Không thể đăng ký tài khoản');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Điền nhanh thông tin tài khoản mẫu hỗ trợ việc kiểm thử đồ án
   */
  function fillDemo(demoEmail, demoPass) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setSuccessMsg('');
    setTab('login');
  }

  return (
    <div className="min-vh-100 bg-light d-flex flex-column justify-content-center align-items-center p-3">
      {/* Nút quay lại xem danh sách phòng công khai */}
      <div className="mb-3">
        <button
          type="button"
          onClick={onBackToPublic}
          className="btn btn-link text-decoration-none text-muted d-flex align-items-center gap-1"
        >
          <ArrowLeft size={16} /> Quay lại danh mục phòng khách sạn
        </button>
      </div>

      <div className="card shadow border-0" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          {/* Tiêu đề & Logo màn hình */}
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-2">
              {tab === 'login' ? <LogIn size={30} /> : <UserPlus size={30} />}
            </div>
            <h2 className="h4 fw-bold text-dark mb-1">FUMiniHotelSystem</h2>
            <p className="text-muted small mb-0">
              {tab === 'login'
                ? 'Đăng nhập Nhân viên (Staff) hoặc Khách hàng (Customer)'
                : 'Đăng ký tài khoản Khách hàng mới để đặt phòng'}
            </p>
          </div>

          {/* Thanh chuyển đổi Tab Đăng nhập / Đăng ký */}
          <div className="btn-group w-100 mb-4" role="group">
            <button
              type="button"
              className={`btn btn-sm ${tab === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setTab('login');
                setError('');
              }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`btn btn-sm ${tab === 'register' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setTab('register');
                setError('');
              }}
            >
              Đăng ký tài khoản
            </button>
          </div>

          {/* Cảnh báo lỗi xác thực */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
              <AlertCircle size={18} className="flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* Thông báo đăng ký thành công */}
          {successMsg && (
            <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Biểu mẫu 1: Đăng nhập */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Địa chỉ Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Mật khẩu</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Đăng nhập</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Biểu mẫu 2: Đăng ký tài khoản mới */
            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Họ và tên *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="0912345678"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Ngày sinh</label>
                  <input
                    type="date"
                    className="form-control"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Địa chỉ Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="customer@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Mật khẩu *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu tạo mới"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Tạo tài khoản</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Vùng các nút bấm tài khoản demo có sẵn phục vụ kiểm thử */}
          <div className="mt-4 pt-3 border-top text-center">
            <p className="text-muted small mb-2">Tài khoản demo sẵn có để kiểm thử:</p>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                onClick={() => fillDemo('staff@fuminithotel.com', 'Staff@123')}
                title="Tài khoản Staff cấu hình trong application.properties"
              >
                <ShieldCheck size={14} /> Staff (application.properties)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                onClick={() => fillDemo('customer@gmail.com', '123456')}
                title="Tài khoản Khách hàng từ Database"
              >
                <UserCheck size={14} /> Customer (Database)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
