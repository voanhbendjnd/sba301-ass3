/**
 * Author: Võ Anh Ben - CE190709
 */

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Component Hộp thoại Modal dùng chung (Modal)
 * Sử dụng thẻ <dialog> chuẩn HTML5 để hỗ trợ tự động:
 * - Khóa focus trong dialog (focus trapping)
 * - Tự động đóng khi nhấn phím Escape
 * - Làm mờ và vô hiệu hóa tương tác nền bên dưới
 *
 * @param {string} title - Tiêu đề của modal
 * @param {ReactNode} children - Nội dung bên trong modal
 * @param {Function} onClose - Hàm xử lý đóng modal
 * @param {boolean} wide - Chế độ hiển thị rộng hơn (dành cho form soạn bài viết)
 */
export default function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);

  // Mở dialog dạng showModal() ngay khi component được render
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog && dialog.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`app-dialog ${wide ? 'dialog-wide' : ''}`}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault(); // Ngăn sự kiện cancel mặc định để gọi hàm onClose của React
        onClose();
      }}
    >
      {/* Tiêu đề modal và nút đóng X */}
      <div className="dialog-heading">
        <h2 id="dialog-title">{title}</h2>
        <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Nội dung bên trong modal */}
      {children}
    </dialog>
  );
}
