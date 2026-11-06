package vn.edu.fpt.a3voanhben_se1910.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.a3voanhben_se1910.dto.BookingRequest;
import vn.edu.fpt.a3voanhben_se1910.entity.BookingReservation;
import vn.edu.fpt.a3voanhben_se1910.service.BookingService;

import java.util.List;
import java.util.Map;

/**
 * Author: Vo Anh Ben - CE190709
 * Endpoint quản lý đặt phòng
 * - Customer & Staff: Đặt phòng trực tuyến, Xem lịch sử đặt phòng
 * - Staff: Quản lý toàn bộ đặt phòng, cập nhật trạng thái, xóa đơn
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF')")
    public ResponseEntity<BookingReservation> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingReservation created = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<BookingReservation>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF')")
    public ResponseEntity<BookingReservation> getBookingById(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF')")
    public ResponseEntity<List<BookingReservation>> getCustomerBookingHistory(@RequestParam Integer customerId) {
        return ResponseEntity.ok(bookingService.getBookingHistoryByCustomer(customerId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<BookingReservation> updateBookingStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        Integer status = body.get("bookingStatus");
        if (status == null) {
            throw new IllegalArgumentException("Trạng thái bookingStatus không hợp lệ");
        }
        BookingReservation updated = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Map<String, String>> deleteBooking(@PathVariable Integer id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(Map.of("message", "Xóa giao dịch đặt phòng thành công"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<BookingReservation>> searchBookings(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(bookingService.searchBookings(keyword));
    }
}
