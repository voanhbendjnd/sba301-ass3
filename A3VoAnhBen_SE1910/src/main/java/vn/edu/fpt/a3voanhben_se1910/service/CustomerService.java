package vn.edu.fpt.a3voanhben_se1910.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.fpt.a3voanhben_se1910.dto.CustomerRequest;
import vn.edu.fpt.a3voanhben_se1910.dto.ProfileUpdateRequest;
import vn.edu.fpt.a3voanhben_se1910.entity.Customer;
import vn.edu.fpt.a3voanhben_se1910.repository.BookingReservationRepository;
import vn.edu.fpt.a3voanhben_se1910.repository.CustomerRepository;

import java.util.List;
import java.util.Optional;

/**
 * Author: Vo Anh Ben - CE190709
 * Quan ly thong tin khach hang (CRUD + Search + Profile)
 */
@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BookingReservationRepository bookingReservationRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Integer id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng với mã ID: " + id));
    }

    public Customer createCustomer(CustomerRequest request) {
        if (request.getEmailAddress() == null || request.getEmailAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống");
        }
        if (request.getCustomerFullName() == null || request.getCustomerFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Họ và tên không được để trống");
        }
        if (customerRepository.existsByEmailAddressIgnoreCase(request.getEmailAddress().trim())) {
            throw new IllegalArgumentException("Email đã tồn tại trên hệ thống");
        }

        Customer customer = new Customer();
        customer.setCustomerFullName(request.getCustomerFullName().trim());
        customer.setEmailAddress(request.getEmailAddress().trim());
        customer.setTelephone(request.getTelephone() != null ? request.getTelephone().trim() : null);
        customer.setCustomerBirthday(request.getCustomerBirthday());
        customer.setCustomerStatus(request.getCustomerStatus() != null ? request.getCustomerStatus() : 1);
        customer.setPassword(
                request.getPassword() != null && !request.getPassword().trim().isEmpty() ? request.getPassword().trim()
                        : "123456");

        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Integer id, CustomerRequest request) {
        Customer customer = getCustomerById(id);

        if (request.getCustomerFullName() != null && !request.getCustomerFullName().trim().isEmpty()) {
            customer.setCustomerFullName(request.getCustomerFullName().trim());
        }

        if (request.getEmailAddress() != null && !request.getEmailAddress().trim().isEmpty()) {
            String newEmail = request.getEmailAddress().trim();
            if (!newEmail.equalsIgnoreCase(customer.getEmailAddress())
                    && customerRepository.existsByEmailAddressIgnoreCase(newEmail)) {
                throw new IllegalArgumentException("Email đã tồn tại trên hệ thống");
            }
            customer.setEmailAddress(newEmail);
        }

        if (request.getTelephone() != null) {
            customer.setTelephone(request.getTelephone().trim());
        }

        if (request.getCustomerBirthday() != null) {
            customer.setCustomerBirthday(request.getCustomerBirthday());
        }

        if (request.getCustomerStatus() != null) {
            customer.setCustomerStatus(request.getCustomerStatus());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            customer.setPassword(request.getPassword().trim());
        }

        return customerRepository.save(customer);
    }

    public void deleteCustomer(Integer id) {
        Customer customer = getCustomerById(id);
        // Kiem tra neu khach hang da co giao dich dat phong
        var bookings = bookingReservationRepository.findByCustomer_CustomerIdOrderByBookingDateDesc(id);
        if (!bookings.isEmpty()) {
            // Chuyen trang thai sang Inactive thay vi xoa gay loi khoa ngoai
            customer.setCustomerStatus(0);
            customerRepository.save(customer);
            throw new IllegalStateException(
                    "Khách hàng đã có lịch sử giao dịch đặt phòng. Đã chuyển trạng thái khách hàng sang 'Không hoạt động' (Inactive) thay vì xóa hoàn toàn.");
        }
        customerRepository.delete(customer);
    }

    public List<Customer> searchCustomers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCustomers();
        }
        return customerRepository.searchCustomers(keyword.trim());
    }

    public Customer updateProfile(Integer id, ProfileUpdateRequest request) {
        Customer customer = getCustomerById(id);

        if (request.getCustomerFullName() != null && !request.getCustomerFullName().trim().isEmpty()) {
            customer.setCustomerFullName(request.getCustomerFullName().trim());
        }
        if (request.getTelephone() != null) {
            customer.setTelephone(request.getTelephone().trim());
        }
        if (request.getCustomerBirthday() != null) {
            customer.setCustomerBirthday(request.getCustomerBirthday());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            if (request.getOldPassword() == null || !request.getOldPassword().equals(customer.getPassword())) {
                throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
            }
            customer.setPassword(request.getNewPassword().trim());
        }

        return customerRepository.save(customer);
    }
}
