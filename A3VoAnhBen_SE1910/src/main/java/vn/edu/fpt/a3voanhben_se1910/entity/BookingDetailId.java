package vn.edu.fpt.a3voanhben_se1910.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/**
 * Author: Vo Anh Ben - CE190709
 * Composite Primary Key cho BookingDetail (BookingReservationID + RoomID)
 */
@Embeddable
public class BookingDetailId implements Serializable {

    @Column(name = "BookingReservationID")
    private Integer bookingReservationId;

    @Column(name = "RoomID")
    private Integer roomId;

    public BookingDetailId() {
    }

    public BookingDetailId(Integer bookingReservationId, Integer roomId) {
        this.bookingReservationId = bookingReservationId;
        this.roomId = roomId;
    }

    public Integer getBookingReservationId() {
        return bookingReservationId;
    }

    public void setBookingReservationId(Integer bookingReservationId) {
        this.bookingReservationId = bookingReservationId;
    }

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        BookingDetailId that = (BookingDetailId) o;
        return Objects.equals(bookingReservationId, that.bookingReservationId) &&
                Objects.equals(roomId, that.roomId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookingReservationId, roomId);
    }
}
