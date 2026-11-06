package vn.edu.fpt.a3voanhben_se1910.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.a3voanhben_se1910.dto.BookingDetailRequest;
import vn.edu.fpt.a3voanhben_se1910.dto.BookingRequest;
import vn.edu.fpt.a3voanhben_se1910.entity.*;
import vn.edu.fpt.a3voanhben_se1910.repository.BookingDetailRepository;
import vn.edu.fpt.a3voanhben_se1910.repository.BookingReservationRepository;
import vn.edu.fpt.a3voanhben_se1910.repository.CustomerRepository;
import vn.edu.fpt.a3voanhben_se1910.repository.RoomInformationRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Author: Vo Anh Ben - CE190709
 * Quan ly dat phong khach san (Online/Offline Booking + History + Details)
 */
@Service
public class BookingService {

    @Autowired
    private BookingReservationRepository reservationRepository;

    @Autowired
    private BookingDetailRepository detailRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private RoomInformationRepository roomRepository;

    @Transactional
    public BookingReservation createBooking(BookingRequest request) {
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Khách hàng không được để trống");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất 1 phòng để đặt");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Khách hàng không tồn tại"));

        BookingReservation reservation = new BookingReservation();
        reservation.setCustomer(customer);
        reservation.setBookingDate(request.getBookingDate() != null ? request.getBookingDate() : LocalDate.now());
        reservation.setBookingStatus(1); // 1: Confirmed
        reservation.setTotalPrice(BigDecimal.ZERO);

        // Luu truoc de lay sinh ID tu dong
        reservation = reservationRepository.save(reservation);

        BigDecimal grandTotal = BigDecimal.ZERO;
        List<BookingDetail> detailList = new ArrayList<>();

        for (BookingDetailRequest item : request.getItems()) {
            if (item.getRoomId() == null) {
                throw new IllegalArgumentException("Mã phòng không hợp lệ");
            }
            if (item.getStartDate() == null || item.getEndDate() == null) {
                throw new IllegalArgumentException("Ngày nhận phòng và trả phòng không được để trống");
            }
            if (!item.getEndDate().isAfter(item.getStartDate())) {
                throw new IllegalArgumentException("Ngày trả phòng phải sau ngày nhận phòng");
            }

            RoomInformation room = roomRepository.findById(item.getRoomId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Không tìm thấy thông tin phòng ID: " + item.getRoomId()));

            long days = ChronoUnit.DAYS.between(item.getStartDate(), item.getEndDate());
            if (days <= 0)
                days = 1;

            BigDecimal pricePerDay = room.getRoomPricePerDay() != null ? room.getRoomPricePerDay() : BigDecimal.ZERO;
            BigDecimal roomTotal = item.getActualPrice() != null ? item.getActualPrice()
                    : pricePerDay.multiply(BigDecimal.valueOf(days));

            BookingDetail detail = new BookingDetail();
            detail.setBookingReservation(reservation);
            detail.setRoomInformation(room);
            detail.setStartDate(item.getStartDate());
            detail.setEndDate(item.getEndDate());
            detail.setActualPrice(roomTotal);

            detailList.add(detail);
            grandTotal = grandTotal.add(roomTotal);
        }

        reservation.setTotalPrice(grandTotal);
        detailRepository.saveAll(detailList);
        reservation.setBookingDetails(detailList);

        return reservationRepository.save(reservation);
    }

    public List<BookingReservation> getAllBookings() {
        return reservationRepository.findAllByOrderByBookingDateDesc();
    }

    public BookingReservation getBookingById(Integer id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin đặt phòng ID: " + id));
    }

    public List<BookingReservation> getBookingHistoryByCustomer(Integer customerId) {
        return reservationRepository.findByCustomer_CustomerIdOrderByBookingDateDesc(customerId);
    }

    public BookingReservation updateBookingStatus(Integer id, Integer status) {
        BookingReservation reservation = getBookingById(id);
        reservation.setBookingStatus(status);
        return reservationRepository.save(reservation);
    }

    public void deleteBooking(Integer id) {
        BookingReservation reservation = getBookingById(id);
        reservationRepository.delete(reservation);
    }

    public List<BookingReservation> searchBookings(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllBookings();
        }
        return reservationRepository.searchBookings(keyword.trim());
    }
}
