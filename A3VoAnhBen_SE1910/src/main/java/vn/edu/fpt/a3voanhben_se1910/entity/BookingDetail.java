package vn.edu.fpt.a3voanhben_se1910.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Author: Vo Anh Ben - CE190709
 * Entity BookingDetail theo dac ta Database Design Assignment 03
 */
@Entity
@Table(name = "BookingDetail")
public class BookingDetail {

    @EmbeddedId
    private BookingDetailId id = new BookingDetailId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("bookingReservationId")
    @JoinColumn(name = "BookingReservationID")
    @JsonBackReference
    private BookingReservation bookingReservation;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("roomId")
    @JoinColumn(name = "RoomID")
    private RoomInformation roomInformation;

    @Column(name = "StartDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "EndDate", nullable = false)
    private LocalDate endDate;

    @Column(name = "ActualPrice", precision = 18, scale = 2)
    private BigDecimal actualPrice;

    public BookingDetail() {
    }

    public BookingDetail(BookingReservation bookingReservation, RoomInformation roomInformation, LocalDate startDate,
            LocalDate endDate, BigDecimal actualPrice) {
        this.bookingReservation = bookingReservation;
        this.roomInformation = roomInformation;
        this.startDate = startDate;
        this.endDate = endDate;
        this.actualPrice = actualPrice;
        if (bookingReservation != null && bookingReservation.getBookingReservationId() != null) {
            this.id.setBookingReservationId(bookingReservation.getBookingReservationId());
        }
        if (roomInformation != null && roomInformation.getRoomId() != null) {
            this.id.setRoomId(roomInformation.getRoomId());
        }
    }

    public BookingDetailId getId() {
        return id;
    }

    public void setId(BookingDetailId id) {
        this.id = id;
    }

    public BookingReservation getBookingReservation() {
        return bookingReservation;
    }

    public void setBookingReservation(BookingReservation bookingReservation) {
        this.bookingReservation = bookingReservation;
        if (bookingReservation != null && bookingReservation.getBookingReservationId() != null) {
            this.id.setBookingReservationId(bookingReservation.getBookingReservationId());
        }
    }

    public RoomInformation getRoomInformation() {
        return roomInformation;
    }

    public void setRoomInformation(RoomInformation roomInformation) {
        this.roomInformation = roomInformation;
        if (roomInformation != null && roomInformation.getRoomId() != null) {
            this.id.setRoomId(roomInformation.getRoomId());
        }
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getActualPrice() {
        return actualPrice;
    }

    public void setActualPrice(BigDecimal actualPrice) {
        this.actualPrice = actualPrice;
    }
}
