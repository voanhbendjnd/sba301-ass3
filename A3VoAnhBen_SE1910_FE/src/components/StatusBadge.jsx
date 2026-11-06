/**
 * Author: Võ Anh Ben - CE190709
 * Component hien thi huy hieu trang thai (StatusBadge)
 * - 1: Active / Confirmed
 * - 2: Completed
 * - 0: Inactive / Cancelled
 */

export default function StatusBadge({ status, type = 'general' }) {
  if (type === 'booking') {
    if (status === 1) {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">
          ● Đã xác nhận
        </span>
      );
    } else if (status === 2) {
      return (
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill">
          ● Hoàn thành
        </span>
      );
    } else {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill">
          ● Đã hủy
        </span>
      );
    }
  }

  const isActive = status === 1;
  return (
    <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
      <span className="status-dot" />
      {isActive ? 'Hoạt động' : 'Không hoạt động'}
    </span>
  );
}
