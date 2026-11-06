package vn.edu.fpt.a3voanhben_se1910.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.a3voanhben_se1910.entity.RoomType;
import vn.edu.fpt.a3voanhben_se1910.service.RoomTypeService;

import java.util.List;
import java.util.Map;

/**
 * Author: Vo Anh Ben - CE190709
 */
@RestController
@RequestMapping("/api/room-types")
public class RoomTypeController {

    @Autowired
    private RoomTypeService roomTypeService;

    // Cho phép xem danh sách loại phòng để phục vụ bộ lọc tìm kiếm
    @GetMapping
    public ResponseEntity<List<RoomType>> getAllRoomTypes() {
        return ResponseEntity.ok(roomTypeService.getAllRoomTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomType> getRoomTypeById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomTypeService.getRoomTypeById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<RoomType> createRoomType(@RequestBody RoomType roomType) {
        RoomType created = roomTypeService.createRoomType(roomType);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<RoomType> updateRoomType(@PathVariable Integer id, @RequestBody RoomType roomType) {
        RoomType updated = roomTypeService.updateRoomType(id, roomType);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Map<String, String>> deleteRoomType(@PathVariable Integer id) {
        roomTypeService.deleteRoomType(id);
        return ResponseEntity.ok(Map.of("message", "Xóa loại phòng thành công"));
    }
}
