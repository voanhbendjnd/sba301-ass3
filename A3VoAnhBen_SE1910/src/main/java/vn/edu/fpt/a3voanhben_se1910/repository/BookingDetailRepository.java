package vn.edu.fpt.a3voanhben_se1910.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.a3voanhben_se1910.entity.BookingDetail;
import vn.edu.fpt.a3voanhben_se1910.entity.BookingDetailId;

import java.util.List;

/**
 * Author: Vo Anh Ben - CE190709
 */
@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail, BookingDetailId> {

    boolean existsByRoomInformation_RoomId(Integer roomId);

    List<BookingDetail> findByBookingReservation_BookingReservationId(Integer bookingReservationId);
}
