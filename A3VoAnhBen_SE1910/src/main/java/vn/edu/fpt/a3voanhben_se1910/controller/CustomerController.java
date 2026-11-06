package vn.edu.fpt.a3voanhben_se1910.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.a3voanhben_se1910.dto.CustomerRequest;
import vn.edu.fpt.a3voanhben_se1910.dto.ProfileUpdateRequest;
import vn.edu.fpt.a3voanhben_se1910.entity.Customer;
import vn.edu.fpt.a3voanhben_se1910.service.CustomerService;

import java.util.List;
import java.util.Map;

/**
 * Author: Vo Anh Ben - CE190709
 * Endpoint quản lý khách hàng
 * Phân quyền: Staff CRUD & Search, Customer quản lý Profile cá nhân
 */
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'CUSTOMER')")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Integer id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody CustomerRequest request) {
        Customer created = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Integer id, @RequestBody CustomerRequest request) {
        Customer updated = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Map<String, String>> deleteCustomer(@PathVariable Integer id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(Map.of("message", "Xóa khách hàng thành công"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<Customer>> searchCustomers(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(customerService.searchCustomers(keyword));
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF')")
    public ResponseEntity<Customer> updateProfile(@PathVariable Integer id, @RequestBody ProfileUpdateRequest request) {
        Customer updated = customerService.updateProfile(id, request);
        return ResponseEntity.ok(updated);
    }
}
