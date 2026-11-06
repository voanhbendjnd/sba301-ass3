package vn.edu.fpt.a3voanhben_se1910.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.a3voanhben_se1910.dto.RoomRequest;
import vn.edu.fpt.a3voanhben_se1910.entity.RoomInformation;
import vn.edu.fpt.a3voanhben_se1910.service.RoomService;

import java.util.List;
import java.util.Map;

/**
 * Author: Vo Anh Ben - CE190709
 * Endpoint quản lý phòng khách sạn
 * Đặc tả:
 * - Khách không cần xác thực để xem thông tin phòng (/api/rooms/public)
 * - Staff có quyền quản lý phòng (CRUD)
 */
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    // 1. API CÔNG KHAI: Không cần đăng nhập để xem thông tin phòng
    @GetMapping("/public")
    public ResponseEntity<List<RoomInformation>> getPublicRooms() {
        return ResponseEntity.ok(roomService.getPublicActiveRooms());
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<RoomInformation> getPublicRoomDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    // 2. CÁC API DÀNH CHO NHÂN VIÊN (STAFF)
    @GetMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<RoomInformation>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'CUSTOMER')")
    public ResponseEntity<RoomInformation> getRoomById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<RoomInformation> createRoom(@Valid @RequestBody RoomRequest request) {
        RoomInformation created = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<RoomInformation> updateRoom(@PathVariable Integer id, @Valid @RequestBody RoomRequest request) {
        RoomInformation updated = roomService.updateRoom(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Map<String, Object>> deleteRoom(@PathVariable Integer id) {
        Map<String, Object> response = roomService.deleteRoom(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<RoomInformation>> searchRooms(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(roomService.searchRooms(keyword));
    }
}
