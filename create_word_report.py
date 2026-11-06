# -*- coding: utf-8 -*-
"""
Script tao file Word bao cao toan bo hinh anh tinh nang cua he thong FUMiniHotelSystem
Author: Vo Anh Ben - CE190709 - SE1910
Mon hoc: SBA301 - Web Applications Development (Assignment 03)
"""

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOT_DIR = os.path.join(WORKSPACE_DIR, "A3VoAnhBen_SE1910_FE", "screenshots")
OUTPUT_DOCX = os.path.join(WORKSPACE_DIR, "BAO_CAO_HINH_ANH_TINH_NANG_HE_THONG_A3_VOANHBEN_SE1910.docx")

# Mau chu dao (Brand Palette)
PRIMARY_COLOR = RGBColor(13, 110, 253)     # Blue (#0d6efd)
DARK_BLUE = RGBColor(15, 23, 42)          # Slate 900 (#0f172a)
SECONDARY_COLOR = RGBColor(100, 116, 139) # Slate 500 (#64748b)
ACCENT_GREEN = RGBColor(22, 163, 74)      # Green (#16a34a)
CARD_BG = "F8FAFC"
TABLE_HEADER_BG = "0D6EFD"

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def add_callout(doc, title, text, border_color_hex="0D6EFD", bg_hex="F0F7FF"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)

    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

    # Set left border thick
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color_hex}"/>'
        f'<w:top w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:bottom w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    run_title = p.add_run(f"📌 {title}: ")
    run_title.bold = True
    run_title.font.name = "Arial"
    run_title.font.size = Pt(10.5)
    run_title.font.color.rgb = PRIMARY_COLOR

    run_text = p.add_run(text)
    run_text.font.name = "Arial"
    run_text.font.size = Pt(10)
    run_text.font.color.rgb = DARK_BLUE

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_feature_section(doc, fig_num, title, img_filename, desc, tech_note=""):
    # Tieu de muc
    h = doc.add_heading(level=2)
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(4)
    r_h = h.add_run(f"Hình {fig_num}. {title}")
    r_h.bold = True
    r_h.font.name = "Arial"
    r_h.font.size = Pt(13)
    r_h.font.color.rgb = PRIMARY_COLOR

    # Doan mo ta nghiep vu
    p_desc = doc.add_paragraph()
    p_desc.paragraph_format.space_before = Pt(2)
    p_desc.paragraph_format.space_after = Pt(6)
    p_desc.paragraph_format.line_spacing = 1.15
    r_desc_label = p_desc.add_run("• Mô tả nghiệp vụ: ")
    r_desc_label.bold = True
    r_desc_label.font.name = "Arial"
    r_desc_label.font.size = Pt(10.5)
    r_desc_label.font.color.rgb = DARK_BLUE

    r_desc = p_desc.add_run(desc)
    r_desc.font.name = "Arial"
    r_desc.font.size = Pt(10.5)
    r_desc.font.color.rgb = DARK_BLUE

    # Chen anh neu file ton tai
    img_path = os.path.join(SCREENSHOT_DIR, img_filename)
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(4)
        p_img.paragraph_format.space_after = Pt(3)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=Inches(6.2))

        # Caption
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(0)
        p_cap.paragraph_format.space_after = Pt(6)
        r_cap = p_cap.add_run(f"Giao diện thực tế: Hình {fig_num} - {title}")
        r_cap.italic = True
        r_cap.font.name = "Arial"
        r_cap.font.size = Pt(9.5)
        r_cap.font.color.rgb = SECONDARY_COLOR
    else:
        p_warn = doc.add_paragraph()
        p_warn.paragraph_format.space_after = Pt(6)
        r_warn = p_warn.add_run(f"[Chưa tìm thấy ảnh {img_filename}]")
        r_warn.font.color.rgb = RGBColor(220, 38, 38)

    # Thong tin ky thuat / API
    if tech_note:
        add_callout(doc, "Giải pháp kỹ thuật & Luồng API", tech_note)

def create_report():
    print("Bắt đầu khởi tạo tài liệu Word...")
    doc = Document()

    # Thiet lap le trang A4 (Margins = 0.75 inch = 1.9 cm)
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # =========================================================================
    # TRANG BÌA (COVER PAGE)
    # =========================================================================
    p_school = doc.add_paragraph()
    p_school.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_school.paragraph_format.space_before = Pt(10)
    p_school.paragraph_format.space_after = Pt(4)
    r_school = p_school.add_run("TRƯỜNG ĐẠI HỌC FPT CẦN THƠ\nBỘ MÔN CÔNG NGHỆ THÔNG TIN")
    r_school.bold = True
    r_school.font.name = "Arial"
    r_school.font.size = Pt(12)
    r_school.font.color.rgb = SECONDARY_COLOR

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(24)
    r_sub = p_sub.add_run("─────────── ★ ───────────")
    r_sub.font.color.rgb = PRIMARY_COLOR

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(20)
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run("BÁO CÁO TỔNG HỢP HÌNH ẢNH CÁC TÍNH NĂNG\nVÀ THAO TÁC HỆ THỐNG QUẢN LÝ KHÁCH SẠN\nFUMiniHotelSystem")
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(18)
    r_title.font.color.rgb = PRIMARY_COLOR

    p_assign = doc.add_paragraph()
    p_assign.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_assign.paragraph_format.space_before = Pt(0)
    p_assign.paragraph_format.space_after = Pt(24)
    r_assign = p_assign.add_run("Assignment 03: Securing REST Services with Spring Boot & Building React SPA\nMôn học: SBA301 - Web Applications Development")
    r_assign.italic = True
    r_assign.font.name = "Arial"
    r_assign.font.size = Pt(11)
    r_assign.font.color.rgb = DARK_BLUE

    # Khung thong tin sinh vien
    info_table = doc.add_table(rows=6, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_table.columns[0].width = Inches(2.2)
    info_table.columns[1].width = Inches(4.3)

    student_data = [
        ("Sinh viên thực hiện:", "Võ Anh Ben"),
        ("Mã số sinh viên (MSSV):", "CE190709"),
        ("Lớp học phần:", "SE1910"),
        ("Giảng viên hướng dẫn:", "Bộ môn Kỹ thuật phần mềm"),
        ("Kiến trúc hệ thống:", "Spring Boot 3 REST API + Spring Security 6 (JWT) + ReactJS 19"),
        ("Cơ sở dữ liệu:", "Microsoft SQL Server (Database: A3VoAnhBen_SE1910)")
    ]

    for idx, (lbl, val) in enumerate(student_data):
        row = info_table.rows[idx]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        
        set_cell_background(cell_lbl, "F1F5F9" if idx % 2 == 0 else "FFFFFF")
        set_cell_background(cell_val, "F8FAFC" if idx % 2 == 0 else "FFFFFF")
        set_cell_margins(cell_lbl, top=80, bottom=80, left=120, right=120)
        set_cell_margins(cell_val, top=80, bottom=80, left=120, right=120)

        p0 = cell_lbl.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(lbl)
        r0.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(10)
        r0.font.color.rgb = DARK_BLUE

        p1 = cell_val.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(val)
        if idx in [0, 1, 2]:
            r1.bold = True
            r1.font.color.rgb = PRIMARY_COLOR
        else:
            r1.font.color.rgb = DARK_BLUE
        r1.font.name = "Arial"
        r1.font.size = Pt(10)

    p_date = doc.add_paragraph()
    p_date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_date.paragraph_format.space_before = Pt(36)
    p_date.paragraph_format.space_after = Pt(0)
    r_date = p_date.add_run("Tháng 11 / 2026")
    r_date.font.name = "Arial"
    r_date.font.size = Pt(10)
    r_date.font.color.rgb = SECONDARY_COLOR

    doc.add_page_break()

    # =========================================================================
    # PHẦN MỞ ĐẦU & TÓM TẮT HỆ THỐNG
    # =========================================================================
    h1_intro = doc.add_heading(level=1)
    h1_intro.paragraph_format.space_before = Pt(12)
    h1_intro.paragraph_format.space_after = Pt(6)
    r_intro = h1_intro.add_run("I. TỔNG QUAN HỆ THỐNG VÀ CÁC PHÂN HỆ CHỨC NĂNG")
    r_intro.bold = True
    r_intro.font.name = "Arial"
    r_intro.font.size = Pt(15)
    r_intro.font.color.rgb = PRIMARY_COLOR

    p_intro_text = doc.add_paragraph()
    p_intro_text.paragraph_format.line_spacing = 1.15
    p_intro_text.paragraph_format.space_after = Pt(8)
    p_intro_text.add_run(
        "Hệ thống FUMiniHotelSystem được thiết kế nhằm hiện thực hóa mô hình quản lý khách sạn và đặt phòng trực tuyến hiện đại. "
        "Dự án tuân thủ nghiêm ngặt chuẩn kiến trúc doanh nghiệp phân tách giữa Backend RESTful API (Spring Boot 3, Java 21, Spring Security 6) "
        "và Frontend Single Page Application (ReactJS 19, Axios Client, Bootstrap 5). "
        "Hệ thống bảo vệ toàn diện với cơ chế xác thực vô trạng thái (Stateless Authentication) qua JSON Web Token (JWT) "
        "và bảo toàn tính toàn vẹn dữ liệu kế toán với quy tắc xóa phòng thông minh (Soft Delete)."
    )

    add_callout(
        doc,
        "Tài khoản kiểm thử demo định sẵn trong hệ thống",
        "• Tài khoản Nhân viên (Staff): Email: staff@fuminithotel.com | Password: Staff@123 (Cấu hình qua application.properties).\n"
        "• Tài khoản Khách hàng (Customer): Email: customer@gmail.com | Password: 123456 (Lưu trong SQL Server).\n"
        "• Khách vãng lai (Guest): Được duyệt danh sách phòng công khai không cần tài khoản.",
        border_color_hex="16A34A",
        bg_hex="F0FDF4"
    )

    # Bảng tóm tắt các tính năng
    summary_table = doc.add_table(rows=4, cols=3)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    summary_table.columns[0].width = Inches(1.8)
    summary_table.columns[1].width = Inches(3.2)
    summary_table.columns[2].width = Inches(1.7)

    headers = ["Phân hệ / Vai trò", "Danh sách tính năng nghiệp vụ", "Cơ chế bảo mật"]
    for c_idx, h_text in enumerate(headers):
        cell = summary_table.cell(0, c_idx)
        set_cell_background(cell, TABLE_HEADER_BG)
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h_text)
        r.bold = True
        r.font.name = "Arial"
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)

    matrix_data = [
        ("Khách vãng lai\n(Public Guest)", "• Xem danh sách toàn bộ phòng nghỉ Active\n• Tìm kiếm phòng theo số phòng / mô tả\n• Lọc theo loại phòng (Standard, Superior, Deluxe, Suite)", "Public Access\n(Không cần Token)"),
        ("Nhân viên\n(Hotel Staff)", "• Quản lý danh mục phòng (Thêm, Sửa, Xóa phòng)\n• Áp dụng quy tắc xóa phòng (Soft/Hard Delete)\n• Quản lý khách hàng (Thêm, Sửa, Khóa tài khoản)\n• Quản lý tất cả đơn đặt phòng của khách sạn", "Spring Security\nRole: Staff / Role 1\n(JWT Bearer Token)"),
        ("Khách hàng\n(Customer)", "• Đăng ký tài khoản khách hàng mới\n• Đặt phòng online đa phòng (1 hoặc nhiều phòng)\n• Tự động tính tổng tiền theo số ngày lưu trú\n• Xem lịch sử đơn đặt phòng và hóa đơn chi tiết\n• Quản lý hồ sơ cá nhân và đổi mật khẩu", "Spring Security\nRole: Customer / Role 2\n(JWT Bearer Token)")
    ]

    for r_idx, row_content in enumerate(matrix_data, start=1):
        for c_idx, text in enumerate(row_content):
            cell = summary_table.cell(r_idx, c_idx)
            set_cell_background(cell, "F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "Arial"
            r.font.size = Pt(9.5)
            r.font.color.rgb = DARK_BLUE

    doc.add_page_break()

    # =========================================================================
    # PHẦN 1: PHÂN HỆ KHÁCH VÃNG LAI (PUBLIC GUEST)
    # =========================================================================
    h1_p1 = doc.add_heading(level=1)
    h1_p1.paragraph_format.space_before = Pt(12)
    h1_p1.paragraph_format.space_after = Pt(6)
    r_p1 = h1_p1.add_run("II. PHÂN HỆ XEM PHÒNG CÔNG KHAI (PUBLIC GUEST)")
    r_p1.bold = True
    r_p1.font.name = "Arial"
    r_p1.font.size = Pt(15)
    r_p1.font.color.rgb = PRIMARY_COLOR

    add_feature_section(
        doc,
        fig_num=1,
        title="Trang chủ công khai - Danh sách phòng nghỉ khách sạn",
        img_filename="01_trang_chu_danh_sach_phong.png",
        desc="Đáp ứng yêu cầu đề bài: 'Khách vãng lai không cần đăng nhập vẫn xem được toàn bộ danh sách phòng khách sạn'. Giao diện hiển thị danh mục các phòng có trạng thái Active (1) dưới dạng thẻ Card tiện nghi kèm số phòng, tên loại phòng, sức chứa tối đa, đơn giá theo ngày và nút bấm Đặt phòng ngay.",
        tech_note="Frontend gửi HTTP GET tới endpoint công khai '/api/rooms/public'. Spring Boot Security cho phép truy cập PermitAll() mà không yêu cầu Authorization Header. Dữ liệu được gán vào state rooms và hiển thị tự động."
    )

    add_feature_section(
        doc,
        fig_num=2,
        title="Tính năng Tìm kiếm & Lọc phòng theo loại phòng tức thì (Real-time Filter)",
        img_filename="02_tim_kiem_va_loc_phong.png",
        desc="Khách hàng có thể nhập từ khóa bất kỳ (ví dụ: 'Suite', 'Deluxe' hoặc số phòng '101') hoặc chọn danh mục loại phòng trên Dropdown. Danh sách phòng tự động phản hồi và hiển thị các kết quả phù hợp nhất mà không cần tải lại trang.",
        tech_note="Giải thuật lọc Client-side kết hợp: filteredRooms = rooms.filter(r => matchesKeyword(r) && matchesType(r)). Tối ưu trải nghiệm người dùng không tạo áp lực truy vấn lặp lại lên Database."
    )

    doc.add_page_break()

    # =========================================================================
    # PHẦN 2: PHÂN HỆ XÁC THỰC & BẢO MẬT (AUTHENTICATION & JWT)
    # =========================================================================
    h1_p2 = doc.add_heading(level=1)
    h1_p2.paragraph_format.space_before = Pt(12)
    h1_p2.paragraph_format.space_after = Pt(6)
    r_p2 = h1_p2.add_run("III. PHÂN HỆ XÁC THỰC VÀ BẢO MẬT (LOGIN & REGISTRATION)")
    r_p2.bold = True
    r_p2.font.name = "Arial"
    r_p2.font.size = Pt(15)
    r_p2.font.color.rgb = PRIMARY_COLOR

    add_feature_section(
        doc,
        fig_num=3,
        title="Màn hình Đăng nhập hệ thống (LoginPage) với nút hỗ trợ Demo",
        img_filename="03_man_hinh_dang_nhap.png",
        desc="Màn hình đăng nhập được thiết kế chuẩn mực với các ô nhập Email, Mật khẩu, hiển thị/ẩn mật khẩu an toàn và cung cấp 2 nút bấm điền sẵn tài khoản mẫu (Staff & Customer) giúp quá trình kiểm thử của giảng viên nhanh chóng, thuận tiện.",
        tech_note="Gửi HTTP POST tới '/api/auth/login'. Backend kiểm tra tài khoản Staff trong application.properties trước; nếu không trùng thì kiểm tra bảng Customer trong SQL Server. Xác thực thành công trả về JWT Token và quyền tương ứng (Staff / Customer)."
    )

    add_feature_section(
        doc,
        fig_num=4,
        title="Màn hình Đăng ký tài khoản Khách hàng mới (Customer Registration)",
        img_filename="04_man_hinh_dang_ky_customer.png",
        desc="Khách hàng tự đăng ký tài khoản với đầy đủ các trường thông tin: Họ và tên, Số điện thoại, Địa chỉ Email, Ngày sinh và Mật khẩu. Hệ thống kiểm tra hợp lệ dữ liệu phía Client và Server trước khi ghi nhận vào cơ sở dữ liệu.",
        tech_note="Gửi HTTP POST tới '/api/auth/register'. Backend mã hóa mật khẩu bằng BCryptPasswordEncoder, kiểm tra email trùng lặp và lưu vào bảng Customer với trạng thái mặc định Active (1). Sau khi đăng ký thành công, hệ thống tự động điền thông tin sang form đăng nhập."
    )

    doc.add_page_break()

    # =========================================================================
    # PHẦN 3: PHÂN HỆ NHÂN VIÊN QUẢN LÝ (STAFF PORTAL)
    # =========================================================================
    h1_p3 = doc.add_heading(level=1)
    h1_p3.paragraph_format.space_before = Pt(12)
    h1_p3.paragraph_format.space_after = Pt(6)
    r_p3 = h1_p3.add_run("IV. PHÂN HỆ QUẢN TRỊ DÀNH CHO NHÂN VIÊN (STAFF MANAGEMENT)")
    r_p3.bold = True
    r_p3.font.name = "Arial"
    r_p3.font.size = Pt(15)
    r_p3.font.color.rgb = PRIMARY_COLOR

    add_feature_section(
        doc,
        fig_num=5,
        title="Bảng điều khiển Quản lý Phòng (Room Management) sau khi đăng nhập Staff",
        img_filename="05_staff_dang_nhap_thanh_cong.png",
        desc="Nhân viên đăng nhập bằng tài khoản staff@fuminithotel.com. Hệ thống hiển thị Bảng điều khiển Quản lý Phòng kèm Toast xanh chào mừng. Giao diện tích hợp thẻ thống kê tổng số phòng, số phòng đang phục vụ (Active), số phòng tạm dừng (Inactive), bảng dữ liệu đầy đủ và thanh công cụ tìm kiếm.",
        tech_note="Token JWT được Axios Interceptor tự động đính kèm vào Header 'Authorization: Bearer <token>'. Endpoint GET '/api/rooms' kiểm tra quyền @PreAuthorize(\"hasRole('Staff')\") trước khi trả về danh sách toàn bộ phòng."
    )

    add_feature_section(
        doc,
        fig_num=6,
        title="Modal Popup Thêm mới phòng (Insert Room Dialog)",
        img_filename="06_staff_them_phong_modal.png",
        desc="Khi nhân viên nhấn nút '+ Thêm phòng mới', Modal Popup mở ra cho phép nhập Số phòng, chọn Loại phòng từ danh mục liên kết, số người ở tối đa, đơn giá thuê mỗi ngày và mô tả chi tiết tiện nghi của phòng.",
        tech_note="Đúng theo yêu cầu đồ án: Các thao tác Thêm và Sửa phải thực hiện qua Hộp thoại Popup (Modal Dialog). Danh mục loại phòng được nạp tự động qua API GET '/api/room-types'."
    )

    add_feature_section(
        doc,
        fig_num=7,
        title="Nhập liệu thông tin phòng mới (Phòng 501 - Penthouse Luxury)",
        img_filename="07_staff_dien_du_lieu_phong_moi.png",
        desc="Nhân viên điền số phòng 501, chọn loại phòng Suite, sức chứa 4 người, đơn giá 3.500.000 VNĐ/ngày kèm mô tả tiện nghi cao cấp. Các trường dữ liệu được ràng buộc chặt chẽ, kiểm tra số âm và chuỗi rỗng.",
        tech_note="Biểu mẫu sử dụng React Controlled Components; khi người dùng nhập liệu, state formData tự động cập nhật và sẵn sàng đóng gói JSON gửi tới máy chủ."
    )

    add_feature_section(
        doc,
        fig_num=8,
        title="Lưu phòng mới thành công và hiển thị Toast thông báo (Insert Success)",
        img_filename="08_staff_luu_phong_thanh_cong_toast.png",
        desc="Khi nhấn 'Lưu thông tin', hệ thống gửi yêu cầu tạo phòng lên máy chủ, tự động đóng Modal, làm mới danh sách phòng và hiển thị Toast thông báo màu xanh: 'Tạo mới phòng thành công'. Phòng 501 lập tức xuất hiện trên bảng.",
        tech_note="Gửi HTTP POST tới '/api/rooms' với body JSON. Server Spring Boot lưu bản ghi vào bảng RoomInformation và trả về HTTP 201 Created. State rooms trên giao diện được cập nhật tức thì."
    )

    add_feature_section(
        doc,
        fig_num=9,
        title="Modal Popup Cập nhật thông tin phòng (Update Room Dialog)",
        img_filename="09_staff_cap_nhat_phong_modal.png",
        desc="Nhân viên nhấn nút 'Chỉnh sửa' (Icon Edit) tại một hàng phòng bất kỳ. Modal Popup mở ra và tự động điền sẵn toàn bộ dữ liệu hiện tại của phòng đó để nhân viên điều chỉnh giá phòng, sức chứa hoặc mô tả.",
        tech_note="Gửi HTTP PUT tới '/api/rooms/{id}'. Backend cập nhật thông tin phòng tương ứng trong cơ sở dữ liệu và trả về kết quả thành công HTTP 200 OK."
    )

    add_feature_section(
        doc,
        fig_num=10,
        title="Hộp thoại xác nhận Xóa phòng (Delete Confirm Dialog)",
        img_filename="10_staff_xoa_phong_confirm_dialog.png",
        desc="Khi nhân viên nhấn nút 'Xóa phòng', hệ thống mở Hộp thoại xác nhận (Confirm Dialog) cảnh báo nhân viên trước khi thực hiện hành động, tránh việc vô tình xóa nhầm dữ liệu quan trọng.",
        tech_note="Tuân thủ yêu cầu đề bài: Thao tác xóa dữ liệu phải luôn đi kèm hộp thoại xác nhận trước khi gửi yêu cầu HTTP DELETE tới máy chủ."
    )

    add_feature_section(
        doc,
        fig_num=11,
        title="Thực thi Quy tắc xóa phòng nghiêm ngặt (Data Integrity Rule - Soft Delete Toast)",
        img_filename="11_staff_xoa_phong_soft_delete_toast.png",
        desc="ĐẶC TẢ QUAN TRỌNG CỦA ĐỀ BÀI: Khi xóa phòng 101 (phòng ĐÃ CÓ LỊCH SỬ THUÊ trong BookingDetail), hệ thống KHÔNG XÓA VẬT LÝ mà tự động chuyển trạng thái phòng sang 'Inactive' (Soft delete) và bắn Toast thông báo chi tiết: 'Phòng đã có lịch sử đặt phòng nên đã chuyển sang trạng thái Inactive'. Ngược lại, nếu phòng chưa từng được thuê thì mới xóa hoàn toàn khỏi cơ sở dữ liệu.",
        tech_note="Spring Boot Service kiểm tra: boolean hasBookings = detailRepository.existsByRoom_RoomId(roomId). Nếu true: room.setRoomStatus(2); repository.save(room); trả về { action: 'STATUS_CHANGED' }. Đảm bảo an toàn 100% cho dữ liệu kế toán và hóa đơn cũ."
    )

    add_feature_section(
        doc,
        fig_num=12,
        title="Giao diện Quản lý Khách hàng (Customer Management)",
        img_filename="12_staff_quan_ly_khach_hang.png",
        desc="Nhân viên chuyển sang phân hệ Quản lý Khách hàng qua menu Sidebar. Màn hình hiển thị danh sách toàn bộ khách hàng kèm Họ tên, Số điện thoại, Email, Ngày sinh, Trạng thái tài khoản (Active/Inactive) và thanh tìm kiếm khách hàng theo tên hoặc email.",
        tech_note="Gửi HTTP GET tới '/api/customers'. Hỗ trợ tìm kiếm thời gian thực với endpoint '/api/customers/search?keyword=...'."
    )

    add_feature_section(
        doc,
        fig_num=13,
        title="Modal Popup Thêm mới / Chỉnh sửa thông tin Khách hàng",
        img_filename="13_staff_modal_them_khach_hang.png",
        desc="Nhân viên nhấn nút 'Thêm khách hàng', Modal Popup xuất hiện cho phép nhập đầy đủ thông tin khách hàng, số điện thoại, mật khẩu ban đầu và trạng thái hoạt động.",
        tech_note="Gửi HTTP POST hoặc PUT tới '/api/customers'. Server kiểm tra định dạng email và mật khẩu được băm an toàn."
    )

    add_feature_section(
        doc,
        fig_num=14,
        title="Giao diện Quản lý Đơn đặt phòng toàn hệ thống (Booking Management)",
        img_filename="14_staff_quan_ly_dat_phong.png",
        desc="Nhân viên truy cập phân hệ Quản lý Đặt phòng để theo dõi toàn bộ các giao dịch đặt phòng của mọi khách hàng trong khách sạn. Bảng hiển thị Mã đơn, Tên khách hàng, Ngày đặt, Tổng tiền thanh toán và Trạng thái đơn (Đã xác nhận / Hoàn tất).",
        tech_note="Gửi HTTP GET tới '/api/bookings'. Spring Data JPA thực hiện truy vấn bảng BookingReservation liên kết với Customer để hiển thị thông tin trực quan."
    )

    add_feature_section(
        doc,
        fig_num=15,
        title="Modal Xem chi tiết đơn đặt phòng (Booking Details Dialog)",
        img_filename="15_staff_chi_tiet_don_dat_phong.png",
        desc="Khi nhấn 'Xem chi tiết', Modal Popup hiển thị bảng chi tiết các phòng được thuê trong đơn này, bao gồm: Số phòng, Loại phòng, Ngày nhận phòng (Check-in), Ngày trả phòng (Check-out) và Đơn giá thực tế thời điểm thuê.",
        tech_note="Gửi HTTP GET tới '/api/bookings/{id}'. Backend trả về DTO lồng nhau chứa BookingReservation cùng danh sách BookingDetail tương ứng."
    )

    doc.add_page_break()

    # =========================================================================
    # PHẦN 4: PHÂN HỆ KHÁCH HÀNG (CUSTOMER PORTAL)
    # =========================================================================
    h1_p4 = doc.add_heading(level=1)
    h1_p4.paragraph_format.space_before = Pt(12)
    h1_p4.paragraph_format.space_after = Pt(6)
    r_p4 = h1_p4.add_run("V. PHÂN HỆ DỊCH VỤ DÀNH CHO KHÁCH HÀNG (CUSTOMER PORTAL)")
    r_p4.bold = True
    r_p4.font.name = "Arial"
    r_p4.font.size = Pt(15)
    r_p4.font.color.rgb = PRIMARY_COLOR

    add_feature_section(
        doc,
        fig_num=16,
        title="Đăng nhập thành công với vai trò Khách hàng (Customer Dashboard)",
        img_filename="16_customer_dang_nhap_thanh_cong.png",
        desc="Khách hàng đăng nhập bằng tài khoản customer@gmail.com / 123456. Hệ thống tự động chuyển hướng vào phân hệ Khách hàng với menu riêng biệt gồm: 'Đặt phòng trực tuyến', 'Lịch sử đặt phòng' và 'Hồ sơ cá nhân'.",
        tech_note="Hệ thống State Machine trên App.jsx kiểm tra role = 'Customer' (Role 2) và tự động ẩn các menu quản trị phòng/khách hàng của Staff, chỉ cấp quyền truy cập các tính năng dành cho khách hàng."
    )

    add_feature_section(
        doc,
        fig_num=17,
        title="Tính năng Đặt phòng trực tuyến đa phòng (Online Multi-room Booking)",
        img_filename="17_customer_dat_phong_online.png",
        desc="Khách hàng chọn Ngày nhận phòng (Check-in), Ngày trả phòng (Check-out) và có thể chọn 1 HOẶC NHIỀU PHÒNG CÙNG LÚC (ví dụ phòng 102 và 202). Khung 'Tóm tắt đơn đặt' ở bên cạnh tự động tính toán số đêm lưu trú và tổng tiền thanh toán theo thời gian thực.",
        tech_note="Thuật toán tính toán tổng tiền Client-side: nights = Math.max(1, (endDate - startDate) / (1000*60*60*24)); total = selectedRooms.reduce((sum, r) => sum + r.roomPricePerDay * nights, 0)."
    )

    add_feature_section(
        doc,
        fig_num=18,
        title="Xác nhận Đặt phòng thành công và hiển thị Toast thông báo (Booking Success)",
        img_filename="18_customer_dat_phong_thanh_cong_toast.png",
        desc="Khách hàng nhấn nút 'Xác nhận đặt phòng', hệ thống gửi yêu cầu tạo giao dịch lên máy chủ. Giao dịch được lưu trữ an toàn, hệ thống bắn Toast xanh: 'Đặt phòng thành công! Cảm ơn bạn đã lựa chọn FUMiniHotel' và tự động chuyển khách sang trang Lịch sử đặt phòng.",
        tech_note="Gửi HTTP POST tới '/api/bookings'. Backend tạo bản ghi BookingReservation và tự động tạo các bản ghi BookingDetail tương ứng cho từng phòng được chọn trong cùng một Transaction an toàn (@Transactional)."
    )

    add_feature_section(
        doc,
        fig_num=19,
        title="Trang Lịch sử đặt phòng cá nhân (Personal Booking History)",
        img_filename="19_customer_lich_su_dat_phong.png",
        desc="Khách hàng theo dõi toàn bộ các đơn đặt phòng của riêng mình. Bảng hiển thị Mã đơn đặt, Ngày tạo đơn, Tổng số tiền và Trạng thái đơn, giúp khách hàng nắm bắt chi phí lưu trú một cách minh bạch.",
        tech_note="Gửi HTTP GET tới '/api/bookings/history?customerId={id}'. Backend lọc chính xác các đơn thuộc quyền sở hữu của Customer hiện tại, ngăn ngừa truy cập trái phép vào đơn của người khác."
    )

    add_feature_section(
        doc,
        fig_num=20,
        title="Xem Chi tiết đơn đặt phòng cá nhân của khách hàng",
        img_filename="20_customer_chi_tiet_don_dat_phong.png",
        desc="Khách hàng nhấn nút 'Chi tiết' để xem hóa đơn chi tiết các phòng đã thuê, thời gian nhận/trả phòng và giá tiền cụ thể của từng phòng trong chuyến đi.",
        tech_note="Popup Modal hiển thị dữ liệu BookingDetail trực quan, có nút Đóng tiện lợi."
    )

    add_feature_section(
        doc,
        fig_num=21,
        title="Quản lý Hồ sơ cá nhân và Cập nhật mật khẩu (Profile Management)",
        img_filename="21_customer_ho_so_ca_nhan.png",
        desc="Khách hàng có thể kiểm tra và cập nhật thông tin cá nhân của mình gồm Họ và tên, Số điện thoại, Ngày sinh cũng như chủ động thay đổi Mật khẩu tài khoản định kỳ để bảo đảm an toàn.",
        tech_note="Gửi HTTP PUT tới '/api/customers/{id}' và '/api/auth/change-password'. Sau khi cập nhật thành công, hệ thống hiển thị thông báo Toast xác nhận."
    )

    doc.add_page_break()

    # =========================================================================
    # PHẦN 5: TỔNG KẾT & BẢNG DANH MỤC API ENDPOINTS
    # =========================================================================
    h1_p5 = doc.add_heading(level=1)
    h1_p5.paragraph_format.space_before = Pt(12)
    h1_p5.paragraph_format.space_after = Pt(6)
    r_p5 = h1_p5.add_run("VI. DANH MỤC RESTFUL API ENDPOINTS & HTTP STATUS")
    r_p5.bold = True
    r_p5.font.name = "Arial"
    r_p5.font.size = Pt(15)
    r_p5.font.color.rgb = PRIMARY_COLOR

    p_api_intro = doc.add_paragraph()
    p_api_intro.paragraph_format.line_spacing = 1.15
    p_api_intro.paragraph_format.space_after = Pt(8)
    p_api_intro.add_run(
        "Bảng dưới đây tổng hợp toàn bộ các RESTful API Endpoints được cài đặt và vận hành trong hệ thống, "
        "kèm theo phương thức HTTP, vai trò được phép truy cập và mã phản hồi chuẩn:"
    )

    api_table = doc.add_table(rows=11, cols=4)
    api_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    api_table.columns[0].width = Inches(1.1)
    api_table.columns[1].width = Inches(2.6)
    api_table.columns[2].width = Inches(1.4)
    api_table.columns[3].width = Inches(1.6)

    api_headers = ["Phương thức", "URI Endpoint", "Quyền truy cập", "Mã HTTP thành công"]
    for c_idx, h_text in enumerate(api_headers):
        cell = api_table.cell(0, c_idx)
        set_cell_background(cell, TABLE_HEADER_BG)
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h_text)
        r.bold = True
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    api_rows = [
        ("POST", "/api/auth/login", "Public", "200 OK (Trả về JWT)"),
        ("POST", "/api/auth/register", "Public", "201 Created"),
        ("GET", "/api/rooms/public", "Public", "200 OK"),
        ("GET", "/api/room-types", "Public / Auth", "200 OK"),
        ("GET", "/api/rooms", "Staff", "200 OK"),
        ("POST", "/api/rooms", "Staff", "201 Created"),
        ("PUT", "/api/rooms/{id}", "Staff", "200 OK"),
        ("DELETE", "/api/rooms/{id}", "Staff", "200 OK (Soft/Hard Del)"),
        ("GET / POST", "/api/customers/**", "Staff", "200 OK / 201 Created"),
        ("POST", "/api/bookings", "Customer / Staff", "201 Created")
    ]

    for r_idx, row_content in enumerate(api_rows, start=1):
        for c_idx, text in enumerate(row_content):
            cell = api_table.cell(r_idx, c_idx)
            set_cell_background(cell, "F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            if c_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(text)
            r.font.name = "Arial"
            r.font.size = Pt(9)
            if c_idx == 0:
                r.bold = True
                if "POST" in text:
                    r.font.color.rgb = ACCENT_GREEN
                elif "GET" in text:
                    r.font.color.rgb = PRIMARY_COLOR
                elif "DELETE" in text:
                    r.font.color.rgb = RGBColor(220, 38, 38)
            else:
                r.font.color.rgb = DARK_BLUE

    # Phan ket luan
    h1_concl = doc.add_heading(level=1)
    h1_concl.paragraph_format.space_before = Pt(16)
    h1_concl.paragraph_format.space_after = Pt(6)
    r_concl = h1_concl.add_run("VII. KẾT LUẬN")
    r_concl.bold = True
    r_concl.font.name = "Arial"
    r_concl.font.size = Pt(15)
    r_concl.font.color.rgb = PRIMARY_COLOR

    p_concl = doc.add_paragraph()
    p_concl.paragraph_format.line_spacing = 1.15
    p_concl.paragraph_format.space_after = Pt(12)
    p_concl.add_run(
        "Báo cáo trên đã ghi lại trực quan toàn bộ 21 màn hình tính năng và thao tác thực tế của hệ thống FUMiniHotelSystem. "
        "Hệ thống vận hành mượt mà, đáp ứng 100% các tiêu chí kỹ thuật và nghiệp vụ được quy định trong tài liệu Assignment 03:\n"
        "1. Khách vãng lai xem thông tin phòng công khai không cần đăng nhập.\n"
        "2. Đăng nhập phân quyền với JSON Web Token (JWT), hỗ trợ tài khoản Staff cấu hình trong application.properties và tài khoản Customer lưu trong SQL Server.\n"
        "3. Đăng ký khách hàng mới, mã hóa mật khẩu BCrypt.\n"
        "4. Nhân viên quản trị toàn diện danh mục Khách hàng, Phòng nghỉ và Đơn đặt phòng.\n"
        "5. Thực hiện nghiêm ngặt quy tắc xóa phòng (Soft delete chuyển Inactive đối với phòng đã có lịch sử booking detail).\n"
        "6. Khách hàng đặt phòng trực tuyến (chọn nhiều phòng cùng lúc), tự động tính tiền, theo dõi lịch sử đặt phòng và quản lý hồ sơ cá nhân.\n"
        "7. Giao diện Single Page Application (ReactJS) hiện đại, thao tác qua Modal Popup, Confirm Dialog và Toast Notification trực quan."
    )

    print(f"Lưu file Word vào: {OUTPUT_DOCX}")
    doc.save(OUTPUT_DOCX)
    print("Hoàn tất tạo file Word thành công!")

if __name__ == "__main__":
    create_report()
