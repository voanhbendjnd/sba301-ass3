package vn.edu.fpt.a3voanhben_se1910.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.a3voanhben_se1910.dto.LoginRequest;
import vn.edu.fpt.a3voanhben_se1910.dto.LoginResponse;
import vn.edu.fpt.a3voanhben_se1910.dto.RegisterRequest;
import vn.edu.fpt.a3voanhben_se1910.entity.Customer;
import vn.edu.fpt.a3voanhben_se1910.service.AuthService;

/**
 * Author: Vo Anh Ben - CE190709
 * Endpoint xac thuc: Dang nhap (JWT) va Dang ky tai khoan Customer
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Customer> register(@Valid @RequestBody RegisterRequest request) {
        Customer customer = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(customer);
    }
}
