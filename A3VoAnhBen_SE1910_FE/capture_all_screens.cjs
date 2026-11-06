const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:5173';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Khởi động trình duyệt Microsoft Edge...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920 });

  // 1. Màn hình Khách vãng lai xem danh sách phòng
  console.log('1. Chụp trang chủ công khai - Danh sách phòng...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_trang_chu_danh_sach_phong.png'), fullPage: false });

  // 2. Tìm kiếm và lọc phòng
  console.log('2. Chụp tính năng tìm kiếm và lọc phòng...');
  const searchInput = await page.$('input[placeholder*="Tìm theo số phòng"]');
  if (searchInput) {
    await searchInput.type('Suite');
    await delay(600);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_tim_kiem_va_loc_phong.png'), fullPage: false });
  // Xóa input tìm kiếm
  if (searchInput) {
    await page.evaluate(el => el.value = '', searchInput);
    await searchInput.type(' ');
    await page.keyboard.press('Backspace');
    await delay(400);
  }

  // 3. Màn hình Đăng nhập
  console.log('3. Chụp màn hình Đăng nhập...');
  await page.evaluate(() => {
    const b = document.querySelector('button.btn-primary');
    if (b) b.click();
  });
  await delay(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_man_hinh_dang_nhap.png'), fullPage: false });

  // 4. Màn hình Đăng ký tài khoản Customer
  console.log('4. Chụp màn hình Đăng ký...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Đăng ký tài khoản'));
    if (b) b.click();
  });
  await delay(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_man_hinh_dang_ky_customer.png'), fullPage: false });

  // 5. Đăng nhập Staff
  console.log('5. Đăng nhập tài khoản Staff...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginTab = btns.find(x => x.textContent.includes('Đăng nhập') && !x.classList.contains('w-100'));
    if (loginTab) loginTab.click();
  });
  await delay(400);

  // Click nút điền mẫu Staff
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const staffBtn = btns.find(x => x.textContent.includes('Staff'));
    if (staffBtn) staffBtn.click();
  });
  await delay(400);

  // Click Đăng nhập submit
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) form.requestSubmit();
  });
  await delay(1400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_staff_dang_nhap_thanh_cong.png'), fullPage: false });

  // 6. Staff - Mở Modal Thêm phòng mới
  console.log('6. Mở Modal Thêm phòng mới...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(x => x.textContent.includes('Thêm phòng mới'));
    if (addBtn) addBtn.click();
  });
  await delay(700);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_staff_them_phong_modal.png'), fullPage: false });

  // 7. Điền thông tin phòng mới
  console.log('7. Điền dữ liệu phòng mới...');
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('.modal-body input, .modal-body select, .modal-body textarea');
    inputs.forEach(input => {
      const name = input.getAttribute('name') || '';
      const placeholder = input.getAttribute('placeholder') || '';
      if (placeholder.includes('101') || name.includes('Number')) {
        input.value = '501';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (placeholder.includes('500000') || name.includes('Price')) {
        input.value = '3500000';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (placeholder.includes('tiện nghi') || name.includes('Description') || input.tagName === 'TEXTAREA') {
        input.value = 'Penthouse tầng 5 view toàn cảnh thành phố, hồ bơi riêng và quầy rượu cao cấp';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (input.tagName === 'SELECT' && name.includes('Type')) {
        if (input.options.length > 1) {
          input.selectedIndex = 1;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  });
  await delay(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_staff_dien_du_lieu_phong_moi.png'), fullPage: false });

  // 8. Lưu phòng mới & chụp Toast
  console.log('8. Lưu phòng mới...');
  await page.evaluate(() => {
    const form = document.querySelector('.modal-dialog form');
    if (form) {
      form.requestSubmit();
    } else {
      const btns = Array.from(document.querySelectorAll('.modal-footer button'));
      const saveBtn = btns.find(b => b.textContent.includes('Lưu') || b.textContent.includes('Thêm') || b.textContent.includes('Tạo'));
      if (saveBtn) saveBtn.click();
    }
  });
  await delay(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_staff_luu_phong_thanh_cong_toast.png'), fullPage: false });
  await delay(2500); // Chờ toast tắt bớt

  // 9. Modal Cập nhật phòng
  console.log('9. Mở Modal Cập nhật phòng...');
  await page.evaluate(() => {
    const editBtns = Array.from(document.querySelectorAll('table tbody tr button')).filter(b => b.classList.contains('btn-outline-primary') || (b.title && b.title.includes('sửa')));
    if (editBtns[0]) editBtns[0].click();
  });
  await delay(700);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_staff_cap_nhat_phong_modal.png'), fullPage: false });

  // Đóng modal sửa phòng
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.modal-header button, .modal-footer button.btn-secondary');
    if (closeBtn) closeBtn.click();
  });
  await delay(500);

  // 10. Xóa phòng - Confirm dialog
  console.log('10. Mở Confirm Dialog Xóa phòng...');
  await page.evaluate(() => {
    const delBtns = Array.from(document.querySelectorAll('table tbody tr button')).filter(b => b.classList.contains('btn-outline-danger') || (b.title && b.title.includes('Xóa')));
    if (delBtns[0]) delBtns[0].click();
  });
  await delay(700);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_staff_xoa_phong_confirm_dialog.png'), fullPage: false });

  // 11. Xác nhận xóa phòng (Soft delete vì phòng 101 đã có lịch sử booking)
  console.log('11. Xác nhận xóa phòng (Soft Delete)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.modal-footer button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Xác nhận') || b.textContent.includes('Xóa'));
    if (confirmBtn) confirmBtn.click();
  });
  await delay(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_staff_xoa_phong_soft_delete_toast.png'), fullPage: false });
  await delay(2500);

  // 12. Staff - Chuyển sang Quản lý Khách hàng
  console.log('12. Chuyển sang Quản lý Khách hàng...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.sidebar-nav button.nav-item'));
    const customerNav = btns.find(b => b.textContent.includes('Khách hàng'));
    if (customerNav) customerNav.click();
  });
  await delay(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_staff_quan_ly_khach_hang.png'), fullPage: false });

  // 13. Staff - Modal Thêm khách hàng
  console.log('13. Mở Modal Thêm khách hàng...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addCustBtn = btns.find(b => b.textContent.includes('Thêm khách hàng'));
    if (addCustBtn) addCustBtn.click();
  });
  await delay(700);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_staff_modal_them_khach_hang.png'), fullPage: false });

  // Đóng modal thêm khách hàng
  await page.evaluate(() => {
    const closeCustModal = document.querySelector('.modal-footer button.btn-secondary, .modal-header button');
    if (closeCustModal) closeCustModal.click();
  });
  await delay(500);

  // 14. Staff - Quản lý Đặt phòng (Booking Management)
  console.log('14. Chuyển sang Quản lý Đặt phòng...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.sidebar-nav button.nav-item'));
    const bookingNav = btns.find(b => b.textContent.includes('Đặt phòng'));
    if (bookingNav) bookingNav.click();
  });
  await delay(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_staff_quan_ly_dat_phong.png'), fullPage: false });

  // 15. Staff - Xem chi tiết đơn đặt phòng
  console.log('15. Mở Modal Chi tiết Đơn đặt phòng...');
  await page.evaluate(() => {
    const detailBtns = Array.from(document.querySelectorAll('table tbody tr button')).filter(b => b.classList.contains('btn-outline-primary') || (b.title && b.title.includes('tiết')));
    if (detailBtns[0]) detailBtns[0].click();
  });
  await delay(700);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_staff_chi_tiet_don_dat_phong.png'), fullPage: false });

  // Đóng modal chi tiết đặt phòng
  await page.evaluate(() => {
    const closeBookingModal = document.querySelector('.modal-footer button.btn-secondary, .modal-header button');
    if (closeBookingModal) closeBookingModal.click();
  });
  await delay(500);

  // 16. Đăng xuất Staff và Đăng nhập Customer
  console.log('16. Đăng xuất Staff & Đăng nhập Customer...');
  await page.evaluate(() => {
    const logoutBtn = document.querySelector('button.logout');
    if (logoutBtn) logoutBtn.click();
  });
  await delay(900);

  // Đến trang đăng nhập
  await page.evaluate(() => {
    const loginNav = document.querySelector('button.btn-primary');
    if (loginNav) loginNav.click();
  });
  await delay(600);

  // Chọn nút mẫu Customer
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const custBtn = btns.find(b => b.textContent.includes('Customer'));
    if (custBtn) custBtn.click();
  });
  await delay(400);

  // Submit đăng nhập Customer
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) form.requestSubmit();
  });
  await delay(1400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_customer_dang_nhap_thanh_cong.png'), fullPage: false });

  // 17. Customer - Đặt phòng trực tuyến (Chọn phòng, xem tóm tắt)
  console.log('17. Customer - Đặt phòng trực tuyến...');
  await page.evaluate(() => {
    const roomSelectButtons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Chọn phòng'));
    if (roomSelectButtons.length > 0) roomSelectButtons[0].click();
    if (roomSelectButtons.length > 1) roomSelectButtons[1].click();
  });
  await delay(700);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17_customer_dat_phong_online.png'), fullPage: false });

  // 18. Customer - Xác nhận đặt phòng & Toast thành công
  console.log('18. Customer - Xác nhận đặt phòng...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Xác nhận đặt phòng'));
    if (confirmBtn) confirmBtn.click();
  });
  await delay(900);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18_customer_dat_phong_thanh_cong_toast.png'), fullPage: false });
  await delay(2500);

  // 19. Customer - Lịch sử đặt phòng
  console.log('19. Customer - Xem Lịch sử đặt phòng...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.sidebar-nav button.nav-item'));
    const historyNav = btns.find(b => b.textContent.includes('Lịch sử'));
    if (historyNav) historyNav.click();
  });
  await delay(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19_customer_lich_su_dat_phong.png'), fullPage: false });

  // 20. Customer - Chi tiết đơn đặt phòng của mình
  console.log('20. Customer - Chi tiết đơn đặt phòng...');
  await page.evaluate(() => {
    const detailBtns = Array.from(document.querySelectorAll('table tbody tr button')).filter(b => b.classList.contains('btn-outline-primary') || (b.title && b.title.includes('tiết')));
    if (detailBtns[0]) detailBtns[0].click();
  });
  await delay(700);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20_customer_chi_tiet_don_dat_phong.png'), fullPage: false });

  // Đóng modal chi tiết
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.modal-footer button.btn-secondary, .modal-header button');
    if (closeBtn) closeBtn.click();
  });
  await delay(500);

  // 21. Customer - Hồ sơ cá nhân (Profile Page)
  console.log('21. Customer - Hồ sơ cá nhân...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.sidebar-nav button.nav-item'));
    const profileNav = btns.find(b => b.textContent.includes('Hồ sơ'));
    if (profileNav) profileNav.click();
  });
  await delay(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21_customer_ho_so_ca_nhan.png'), fullPage: false });

  console.log('Hoàn thành chụp toàn bộ 21 màn hình tính năng!');
  await browser.close();
}

capture().catch(err => {
  console.error('Lỗi khi chụp ảnh:', err);
  process.exit(1);
});
