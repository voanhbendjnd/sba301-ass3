/**
 * Author: Võ Anh Ben - SE1910
 * Màn hình Quản lý Khách hàng (CustomerManagementPage)
 * Dành cho đối tượng: Nhân viên khách sạn (Staff role) theo đặc tả Assignment 03
 * 
 * ===================================================================================
 * GIẢI THUẬT VÀ LUỒNG DỮ LIỆU QUẢN LÝ KHÁCH HÀNG (CRUD & SEARCH DATA FLOW)
 * ===================================================================================
 * 
 * 1. Khởi nạp Danh sách Khách hàng (`loadCustomers`):
 *    - Hook `useEffect`: Kích hoạt ngay khi mở trang hoặc nhấn nút "Làm mới".
 *    - Bật cờ `loading = true`.
 *    - Gửi request: Gọi `customerService.getAll()` -> HTTP GET `/api/customers`.
 *    - Backend Spring Boot: Đọc toàn bộ bản ghi bảng `Customer` trong SQL Server.
 *    - Nhận dữ liệu: Mảng khách hàng gán vào state `customers`, hiển thị trên bảng.
 *    - Bắt lỗi: Nếu mất mạng hoặc 403 Forbidden, ném thông báo ra Toast đỏ.
 * 
 * 2. Giải thuật Tìm kiếm Khách hàng (`handleSearch`):
 *    - Người dùng nhập từ khóa (Họ tên, Email hoặc Số điện thoại) và ấn "Tìm kiếm":
 *    - Gửi request: Gọi `customerService.search(keyword)` -> HTTP GET `/api/customers/search?keyword=...`.
 *    - Phía Backend: Thực hiện câu lệnh truy vấn HQL không phân biệt hoa thường (`LOWER(LIKE %keyword%)`).
 *    - Nhận dữ liệu: Danh sách khách hàng thỏa mãn và cập nhật lại state `customers`.
 *    - Nút "Đặt lại": Xóa `keyword` về rỗng và gọi lại `loadCustomers()`.
 * 
 * 3. Luồng Tạo mới / Chỉnh sửa Khách hàng (`handleFormSubmit`):
 *    - Nhấn "Thêm khách hàng": Mở modal `openCreateModal()`, reset state `formData`.
 *    - Nhấn icon Cây bút (Sửa): Mở modal `openEditModal(c)`, nạp thông tin khách hàng đang chọn vào `formData`.
 *    - Khi nhấn "Lưu thay đổi" hoặc "Tạo khách hàng":
 *      + Validate Client-side: Kiểm tra bắt buộc `customerFullName` và `emailAddress`.
 *      + Nếu là Thêm mới: Gọi `customerService.create(formData)` -> HTTP POST `/api/customers`.
 *      + Nếu là Chỉnh sửa: Gọi `customerService.update(id, formData)` -> HTTP PUT `/api/customers/{id}`.
 *      + Thành công: Đóng Modal (`setModalOpen(false)`), bắn Toast xanh chúc mừng, tải lại bảng dữ liệu.
 * 
 * 4. Luồng Xóa Khách hàng & Bảo toàn Dữ liệu Lịch sử (`handleConfirmDelete`):
 *    - Khi nhấn icon Thùng rác (Xóa): Mở Modal xác nhận `setDeletingCustomer(customer)`.
 *    - Khi nhấn "Xác nhận xóa":
 *      + Gửi request: Gọi `customerService.delete(id)` -> HTTP DELETE `/api/customers/{id}`.
 *      + Quy tắc nghiệp vụ Backend:
 *        * Nếu khách hàng ĐÃ CÓ lịch sử đặt phòng trong `BookingReservation`:
 *          Không xóa vĩnh viễn, Backend tự động chuyển `CustomerStatus = 0` (Inactive)
 *          và ném exception giải thích.
 *        * Nếu khách hàng CHƯA TỪNG đặt phòng: Xóa vật lý bản ghi khỏi Database.
 *      + Frontend: Bắt kết quả trả về, hiển thị Toast thông báo chi tiết, đóng Modal và reload bảng.
 */

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Key,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { customerService } from '../services/customerService.js';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function CustomerManagementPage({ showToast }) {
  // State lưu danh sách khách hàng hiển thị trên bảng
  const [customers, setCustomers] = useState([]);
  // State báo hiệu đang tải dữ liệu từ máy chủ
  const [loading, setLoading] = useState(true);
  // State lưu từ khóa tìm kiếm
  const [keyword, setKeyword] = useState('');

  // State điều khiển mở/đóng Modal Thêm/Sửa
  const [modalOpen, setModalOpen] = useState(false);
  // Khách hàng đang chọn chỉnh sửa (null nếu là tạo mới)
  const [editingCustomer, setEditingCustomer] = useState(null);
  // Dữ liệu trong biểu mẫu
  const [formData, setFormData] = useState({
    customerFullName: '',
    telephone: '',
    emailAddress: '',
    customerBirthday: '',
    customerStatus: 1,
    password: '',
  });
  // Lỗi hiển thị riêng trong Modal
  const [formError, setFormError] = useState('');
  // Cờ báo hiệu đang submit lưu dữ liệu
  const [submitting, setSubmitting] = useState(false);

  // Khách hàng đang chờ xác nhận xóa
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  // Nạp danh sách khách hàng lần đầu khi vào trang
  useEffect(() => {
    loadCustomers();
  }, []);

  /**
   * Tải toàn bộ danh sách khách hàng từ backend
   * Luồng: GET /api/customers -> Cập nhật state customers
   */
  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await customerService.getAll();
      setCustomers(data || []);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Tìm kiếm khách hàng theo Họ tên, Email hoặc Số điện thoại
   * Luồng: GET /api/customers/search?keyword=... -> Cập nhật bảng
   */
  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await customerService.search(keyword);
      setCustomers(data || []);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Mở Popup Modal thêm mới khách hàng
   * Luồng: Reset form về rỗng -> Mở dialog
   */
  function openCreateModal() {
    setEditingCustomer(null);
    setFormData({
      customerFullName: '',
      telephone: '',
      emailAddress: '',
      customerBirthday: '',
      customerStatus: 1,
      password: '',
    });
    setFormError('');
    setModalOpen(true);
  }

  /**
   * Mở Popup Modal chỉnh sửa khách hàng hiện tại
   * Luồng: Đổ dữ liệu của c vào formData -> Mở dialog
   */
  function openEditModal(customer) {
    setEditingCustomer(customer);
    setFormData({
      customerFullName: customer.customerFullName,
      telephone: customer.telephone || '',
      emailAddress: customer.emailAddress,
      customerBirthday: customer.customerBirthday || '',
      customerStatus: customer.customerStatus ?? 1,
      password: '', // Để trống nếu không muốn đổi mật khẩu
    });
    setFormError('');
    setModalOpen(true);
  }

  /**
   * Xử lý lưu thông tin khách hàng (Thêm mới hoặc Cập nhật)
   * Luồng: Validate client -> Gọi POST hoặc PUT -> Đóng modal -> Tải lại danh sách
   */
  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!formData.customerFullName.trim()) {
      setFormError('Họ và tên khách hàng không được để trống');
      return;
    }
    if (!formData.emailAddress.trim()) {
      setFormError('Email không được để trống');
      return;
    }
    if (!editingCustomer && !formData.password.trim()) {
      setFormError('Mật khẩu không được để trống khi tạo mới khách hàng');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCustomer) {
        // Cập nhật khách hàng hiện tại
        await customerService.update(editingCustomer.customerId, formData);
        showToast('Cập nhật thông tin khách hàng thành công', 'success');
      } else {
        // Tạo mới khách hàng
        await customerService.create(formData);
        showToast('Tạo mới khách hàng thành công', 'success');
      }
      setModalOpen(false);
      loadCustomers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Xác nhận xóa khách hàng
   * Luồng: DELETE /api/customers/{id} -> Xóa hoặc chuyển Inactive -> Bắn Toast -> Load lại dữ liệu
   */
  async function handleConfirmDelete() {
    if (!deletingCustomer) return;
    try {
      await customerService.delete(deletingCustomer.customerId);
      showToast('Xóa khách hàng thành công', 'success');
    } catch (err) {
      // Backend nếu đã có booking sẽ chuyển trạng thái sang Inactive và ném exception giải thích
      showToast(err.message, 'danger');
    } finally {
      setDeletingCustomer(null);
      loadCustomers();
    }
  }

  return (
    <div>
      {/* Tiêu đề trang và Nút hành động */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Quản lý Khách hàng (Customer Management)</h1>
          <p className="text-muted small mb-0">
            Xem, thêm mới, sửa và xóa thông tin khách hàng trong hệ thống (Quyền Nhân viên)
          </p>
        </div>
        <div className="d-flex gap-2">
          {/* Nút làm mới dữ liệu */}
          <button
            onClick={loadCustomers}
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
          {/* Nút mở popup thêm khách hàng */}
          <button
            onClick={openCreateModal}
            className="btn btn-primary d-flex align-items-center gap-1"
          >
            <Plus size={18} /> Thêm khách hàng
          </button>
        </div>
      </div>

      {/* Thanh Tìm Kiếm Khách Hàng */}
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
                placeholder="Tìm kiếm khách hàng theo Họ tên, Email hoặc Số điện thoại..."
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
                  loadCustomers();
                }}
              >
                Đặt lại
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Bảng Hiển Thị Danh Sách Khách Hàng */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Ngày sinh</th>
                <th style={{ width: '130px' }}>Trạng thái</th>
                <th style={{ width: '110px' }} className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang tải dữ liệu khách hàng từ máy chủ...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Không tìm thấy khách hàng nào phù hợp
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.customerId}>
                    <td className="fw-semibold text-muted">#{c.customerId}</td>
                    <td className="fw-semibold text-dark">{c.customerFullName}</td>
                    <td className="text-secondary">{c.emailAddress}</td>
                    <td>{c.telephone || '—'}</td>
                    <td>{c.customerBirthday || '—'}</td>
                    <td>
                      <StatusBadge status={c.customerStatus} />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {/* Nút bấm mở modal chỉnh sửa */}
                        <button
                          className="btn btn-outline-secondary"
                          title="Chỉnh sửa thông tin"
                          onClick={() => openEditModal(c)}
                        >
                          <Edit2 size={14} />
                        </button>
                        {/* Nút bấm mở dialog xác nhận xóa */}
                        <button
                          className="btn btn-outline-danger"
                          title="Xóa khách hàng"
                          onClick={() => setDeletingCustomer(c)}
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

      {/* Popup Modal Thêm / Chỉnh Sửa Khách Hàng */}
      {modalOpen && (
        <Modal
          title={editingCustomer ? `Chỉnh sửa khách hàng #${editingCustomer.customerId}` : 'Thêm khách hàng mới'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleFormSubmit}>
            {formError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
                <AlertCircle size={16} />
                <div>{formError}</div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small fw-semibold">Họ và tên *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={formData.customerFullName}
                onChange={(e) => setFormData({ ...formData, customerFullName: e.target.value })}
                required
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Địa chỉ Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="customer@example.com"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Số điện thoại</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="0912345678"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Ngày sinh</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.customerBirthday}
                  onChange={(e) => setFormData({ ...formData, customerBirthday: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Trạng thái</label>
                <select
                  className="form-select"
                  value={formData.customerStatus}
                  onChange={(e) => setFormData({ ...formData, customerStatus: Number(e.target.value) })}
                >
                  <option value={1}>Hoạt động (Active)</option>
                  <option value={0}>Không hoạt động (Inactive)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">
                {editingCustomer ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu khởi tạo *'}
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Key size={16} />
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder={editingCustomer ? 'Nhập mật khẩu mới...' : 'Mặc định: 123456'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
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
                {submitting ? 'Đang lưu...' : (editingCustomer ? 'Lưu thay đổi' : 'Tạo khách hàng')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Xác Nhận Xóa Khách Hàng */}
      {deletingCustomer && (
        <Modal
          title="Xác nhận xóa khách hàng"
          onClose={() => setDeletingCustomer(null)}
        >
          <div>
            <div className="text-center my-3">
              <div className="d-inline-flex p-3 rounded-circle bg-danger-subtle text-danger mb-3">
                <Trash2 size={36} />
              </div>
              <h5 className="fw-bold">Bạn có chắc chắn muốn xóa khách hàng này?</h5>
              <p className="text-muted mb-1">
                Khách hàng: <strong>{deletingCustomer.customerFullName}</strong> ({deletingCustomer.emailAddress})
              </p>
              <p className="text-secondary small fst-italic">
                * Lưu ý: Nếu khách hàng đã từng có giao dịch đặt phòng, hệ thống sẽ tự động chuyển trạng thái sang Không hoạt động (Inactive) để bảo toàn lịch sử dữ liệu.
              </p>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDeletingCustomer(null)}
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
