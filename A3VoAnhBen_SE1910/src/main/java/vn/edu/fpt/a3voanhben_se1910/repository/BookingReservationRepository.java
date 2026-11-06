package vn.edu.fpt.a3voanhben_se1910.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.a3voanhben_se1910.entity.BookingReservation;

import java.util.List;

/**
 * Author: Vo Anh Ben - CE190709
 */
@Repository
public interface BookingReservationRepository extends JpaRepository<BookingReservation, Integer> {

    List<BookingReservation> findByCustomer_CustomerIdOrderByBookingDateDesc(Integer customerId);

    List<BookingReservation> findAllByOrderByBookingDateDesc();

    @Query("SELECT b FROM BookingReservation b WHERE " +
            "LOWER(b.customer.customerFullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.customer.emailAddress) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "CAST(b.bookingReservationId AS string) LIKE CONCAT('%', :keyword, '%')")
    List<BookingReservation> searchBookings(@Param("keyword") String keyword);
}
