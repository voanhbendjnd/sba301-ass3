package vn.edu.fpt.a3voanhben_se1910.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.a3voanhben_se1910.entity.RoomInformation;

import java.util.List;

/**
 * Author: Vo Anh Ben - CE190709
 */
@Repository
public interface RoomInformationRepository extends JpaRepository<RoomInformation, Integer> {

    List<RoomInformation> findByRoomStatus(Integer roomStatus);

    boolean existsByRoomNumber(String roomNumber);

    @Query("SELECT r FROM RoomInformation r WHERE " +
            "LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.roomDetailDescription) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.roomType.roomTypeName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<RoomInformation> searchRooms(@Param("keyword") String keyword);
}
