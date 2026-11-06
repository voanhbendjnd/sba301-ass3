package vn.edu.fpt.a3voanhben_se1910.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.fpt.a3voanhben_se1910.entity.RoomType;
import vn.edu.fpt.a3voanhben_se1910.repository.RoomTypeRepository;

import java.util.List;

/**
 * Author: Vo Anh Ben - CE190709
 */
@Service
public class RoomTypeService {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    public RoomType getRoomTypeById(Integer id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại phòng với ID: " + id));
    }

    public RoomType createRoomType(RoomType roomType) {
        return roomTypeRepository.save(roomType);
    }

    public RoomType updateRoomType(Integer id, RoomType details) {
        RoomType rt = getRoomTypeById(id);
        rt.setRoomTypeName(details.getRoomTypeName());
        rt.setTypeDescription(details.getTypeDescription());
        rt.setTypeNote(details.getTypeNote());
        return roomTypeRepository.save(rt);
    }

    public void deleteRoomType(Integer id) {
        roomTypeRepository.deleteById(id);
    }
}
