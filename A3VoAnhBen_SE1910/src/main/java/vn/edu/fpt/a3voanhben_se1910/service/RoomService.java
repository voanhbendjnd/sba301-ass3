package vn.edu.fpt.a3voanhben_se1910.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.fpt.a3voanhben_se1910.dto.RoomRequest;
import vn.edu.fpt.a3voanhben_se1910.entity.RoomInformation;
import vn.edu.fpt.a3voanhben_se1910.entity.RoomType;
import vn.edu.fpt.a3voanhben_se1910.repository.BookingDetailRepository;
import vn.edu.fpt.a3voanhben_se1910.repository.RoomInformationRepository;
import vn.edu.fpt.a3voanhben_se1910.repository.RoomTypeRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Author: Vo Anh Ben - CE190709
 * Quan ly phong khach san (CRUD + Search + Logic dac biet khi xoa phong)
 */
@Service
public class RoomService {

    @Autowired
    private RoomInformationRepository roomRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private BookingDetailRepository bookingDetailRepository;

    // API cong khai: Lay danh sach phong hoat dong cho khach vang lai xem
    public List<RoomInformation> getPublicActiveRooms() {
        return roomRepository.findByRoomStatus(1);
    }

    public List<RoomInformation> getAllRooms() {
        return roomRepository.findAll();
    }

    public RoomInformation getRoomById(Integer id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin phòng với ID: " + id));
    }

    public RoomInformation createRoom(RoomRequest request) {
        if (request.getRoomNumber() == null || request.getRoomNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Số phòng không được để trống");
        }
        if (roomRepository.existsByRoomNumber(request.getRoomNumber().trim())) {
            throw new IllegalArgumentException("Số phòng đã tồn tại trong khách sạn");
        }

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Loại phòng không hợp lệ với ID: " + request.getRoomTypeId()));

        RoomInformation room = new RoomInformation();
        room.setRoomNumber(request.getRoomNumber().trim());
        room.setRoomDetailDescription(request.getRoomDetailDescription());
        room.setRoomMaxCapacity(request.getRoomMaxCapacity() != null ? request.getRoomMaxCapacity() : 2);
        room.setRoomType(roomType);
        room.setRoomStatus(request.getRoomStatus() != null ? request.getRoomStatus() : 1);
        room.setRoomPricePerDay(request.getRoomPricePerDay());

        return roomRepository.save(room);
    }

    public RoomInformation updateRoom(Integer id, RoomRequest request) {
        RoomInformation room = getRoomById(id);

        if (request.getRoomNumber() != null && !request.getRoomNumber().trim().isEmpty()) {
            String newNumber = request.getRoomNumber().trim();
            if (!newNumber.equalsIgnoreCase(room.getRoomNumber()) && roomRepository.existsByRoomNumber(newNumber)) {
                throw new IllegalArgumentException("Số phòng đã tồn tại trong khách sạn");
            }
            room.setRoomNumber(newNumber);
        }

        if (request.getRoomTypeId() != null) {
            RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Loại phòng không hợp lệ"));
            room.setRoomType(roomType);
        }

        if (request.getRoomDetailDescription() != null) {
            room.setRoomDetailDescription(request.getRoomDetailDescription());
        }

        if (request.getRoomMaxCapacity() != null) {
            room.setRoomMaxCapacity(request.getRoomMaxCapacity());
        }

        if (request.getRoomStatus() != null) {
            room.setRoomStatus(request.getRoomStatus());
        }

        if (request.getRoomPricePerDay() != null) {
            room.setRoomPricePerDay(request.getRoomPricePerDay());
        }

        return roomRepository.save(room);
    }

    /**
     * Logic dac biet theo de bai:
     * "The delete action will delete room information in the case this information
     * is not belong
     * to any renting transaction. If the room information is already stored in a
     * booking detail,
     * just change the status."
     */
    public Map<String, Object> deleteRoom(Integer id) {
        RoomInformation room = getRoomById(id);
        boolean hasBooking = bookingDetailRepository.existsByRoomInformation_RoomId(id);

        Map<String, Object> result = new HashMap<>();

        if (hasBooking) {
            // Phong da ton tai trong chi tiet dat phong -> chi doi status sang 0 (Inactive)
            room.setRoomStatus(0);
            roomRepository.save(room);
            result.put("action", "STATUS_CHANGED");
            result.put("message",
                    "Phòng đã có lịch sử đặt phòng (Booking Detail). Theo quy định hệ thống, phòng không bị xóa vĩnh viễn mà được chuyển trạng thái sang Không hoạt động (Inactive).");
            result.put("room", room);
        } else {
            // Phong chua tung duoc dat -> xoa hoan toan khoi co so du lieu
            roomRepository.delete(room);
            result.put("action", "DELETED");
            result.put("message", "Đã xóa phòng thành công khỏi hệ thống.");
        }

        return result;
    }

    public List<RoomInformation> searchRooms(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllRooms();
        }
        return roomRepository.searchRooms(keyword.trim());
    }
}
