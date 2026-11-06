/**
 * Author: Võ Anh Ben - CE190709
 */

import { useState } from 'react';
import Modal from './Modal.jsx';
import { validateRecord } from '../services/dataService.js';

/**
 * Giá trị mặc định khi tạo mới một bản ghi tương ứng từng loại thực thể
 */
const defaults = {
  categories: { name: '', description: '', status: 1 },
  news: { title: '', content: '', categoryId: '', tags: '', status: 1 },
  users: { username: '', password: '', role: 2, status: 1 },
};

/**
 * Tên hiển thị đơn lẻ của từng loại thực thể
 */
const names = { categories: 'category', news: 'article', users: 'user' };

/**
 * Component Biểu mẫu bản ghi (RecordForm)
 * Dùng chung cho cả 2 thao tác: Tạo mới (Create) và Chỉnh sửa (Edit)
 * Hỗ trợ validate dữ liệu, thông báo lỗi từng trường và nút Reset khôi phục.
 *
 * @param {string} entity - Loại thực thể ('categories' | 'news' | 'users')
 * @param {Object|null} selected - Dữ liệu bản ghi đang sửa (hoặc null nếu là tạo mới)
 * @param {Object} data - Toàn bộ dữ liệu của hệ thống (dùng để chọn category, validate...)
 * @param {Function} onSave - Hàm lưu bản ghi lên component cha
 * @param {Function} onClose - Hàm đóng form modal
 */
export default function RecordForm({ entity, selected, data, onSave, onClose }) {
  // Khởi tạo giá trị ban đầu cho form (nếu sửa thì lấy từ selected, nếu mới thì lấy defaults)
  const initial = selected
    ? { ...selected, tags: selected.tags?.join(', ') ?? '' }
    : { ...defaults[entity] };

  // State lưu dữ liệu người dùng đang nhập trên form
  const [form, setForm] = useState(initial);

  // State lưu danh sách lỗi validation cho từng trường
  const [errors, setErrors] = useState({});

  // Kiểm tra xem có phải tài khoản Admin cố định không (để vô hiệu hóa không cho sửa theo đề bài)
  const fixedAdmin = entity === 'users' && selected?.id === 'user-admin';

  /**
   * Hàm xử lý khi người dùng thay đổi giá trị của bất kỳ ô nhập liệu nào
   */
  const change = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  /**
   * Helper sinh mã HTML cho từng trường nhập liệu (Input, Select, Textarea)
   * Giúp code ngắn gọn, tái sử dụng và tự động hiển thị lỗi khi có.
   *
   * @param {string} name - Tên trường dữ liệu (vd: 'name', 'title'...)
   * @param {string} label - Nhãn hiển thị
   * @param {Object} options - Các tùy chọn bổ sung (choices, multiline, type...)
   */
  function field(name, label, options = {}) {
    const { multiline, type = 'text', choices, ...rest } = options;
    const props = {
      id: `record-${name}`,
      name,
      value: form[name] ?? '',
      onChange: change,
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name] ? `error-${name}` : undefined,
      ...rest,
    };

    return (
      <div className="field">
        <label htmlFor={props.id}>{label}</label>

        {/* Nếu có danh sách lựa chọn -> render thẻ <select> */}
        {choices ? (
          <select {...props}>
            {choices.map(({ value, label: text }) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        ) : multiline ? (
          /* Nếu là văn bản nhiều dòng -> render thẻ <textarea> */
          <textarea {...props} rows={name === 'content' ? 5 : 3} />
        ) : (
          /* Trường hợp còn lại -> render thẻ <input> */
          <input {...props} type={type} />
        )}

        {/* Thông báo lỗi validation của trường này nếu có */}
        {errors[name] && (
          <small className="field-error" id={`error-${name}`}>
            {errors[name]}
          </small>
        )}
      </div>
    );
  }

  /**
   * Hàm xử lý khi gửi form (Submit)
   * 1. Validate dữ liệu bằng hàm validateRecord trong service
   * 2. Nếu có lỗi: hiển thị lỗi và dừng lại
   * 3. Nếu hợp lệ: gọi hàm onSave
   */
  function submit(event) {
    event.preventDefault();
    const nextErrors = validateRecord(entity, form, data, selected?.id);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const result = onSave(form, selected?.id);
    if (Object.keys(result).length) setErrors(result);
  }

  return (
    <Modal
      title={`${selected ? 'Edit' : 'Create'} ${names[entity]}`}
      onClose={onClose}
      wide={entity === 'news'}
    >
      <form noValidate onSubmit={submit}>
        <div className="dialog-body">
          <p className="muted">
            {selected
              ? 'Update the details below.'
              : `Add a new ${names[entity]} to your newsroom.`}
          </p>

          {/* Các trường nhập liệu riêng cho Category */}
          {entity === 'categories' && (
            <>
              {field('name', 'Category name', { maxLength: 100, autoFocus: true })}
              {field('description', 'Description', { multiline: true, maxLength: 500 })}
            </>
          )}

          {/* Các trường nhập liệu riêng cho News */}
          {entity === 'news' && (
            <>
              {field('title', 'Title', { maxLength: 200, autoFocus: true })}
              {field('categoryId', 'Category', {
                choices: [
                  { value: '', label: 'Select a category' },
                  ...data.categories.map((item) => ({
                    value: item.id,
                    label: `${item.name}${item.status === 0 ? ' (Inactive)' : ''}`,
                  })),
                ],
              })}
              {data.categories.length === 0 && (
                <p className="form-alert">Create a category before saving an article.</p>
              )}
              {field('content', 'Content', { multiline: true, maxLength: 20000 })}
              {field('tags', 'Tags (comma separated)', {
                placeholder: 'e.g. campus, students',
                maxLength: 300,
              })}
            </>
          )}

          {/* Các trường nhập liệu riêng cho Users */}
          {entity === 'users' && (
            <>
              {fixedAdmin && (
                <p className="info-note">
                  Admin/Admin is the fixed demo account required by the assignment.
                </p>
              )}
              {field('username', 'Username', {
                maxLength: 60,
                autoFocus: true,
                disabled: fixedAdmin,
                autoComplete: 'off',
              })}
              {field('password', 'Mock password', {
                type: 'password',
                maxLength: 100,
                disabled: fixedAdmin,
                autoComplete: 'new-password',
              })}
              {field('role', 'Role', {
                disabled: fixedAdmin,
                choices: [
                  { value: 1, label: 'Admin' },
                  { value: 2, label: 'Staff' },
                ],
              })}
            </>
          )}

          {/* Trường trạng thái dùng chung (Active / Inactive) */}
          {field('status', 'Status', {
            disabled: fixedAdmin,
            choices: [
              { value: 1, label: 'Active' },
              { value: 0, label: 'Inactive' },
            ],
          })}

          {/* Lỗi chung của cả form nếu có */}
          {errors.form && (
            <p role="alert" className="form-alert">
              {errors.form}
            </p>
          )}
        </div>

        {/* Thanh nút bấm cuối dialog */}
        <div className="dialog-actions">
          {/* Nút Reset khôi phục lại giá trị lúc mở form */}
          <button
            type="button"
            className="button button-subtle"
            onClick={() => {
              setForm({ ...initial });
              setErrors({});
            }}
          >
            Reset
          </button>
          <div>
            {/* Nút Hủy */}
            <button type="button" className="button button-outline" onClick={onClose}>
              Cancel
            </button>
            {/* Nút Xác nhận lưu */}
            <button type="submit" className="button button-primary">
              {selected ? 'Save changes' : `Create ${names[entity]}`}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
