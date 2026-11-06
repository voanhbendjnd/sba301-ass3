package vn.edu.fpt.a3voanhben_se1910.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Author: Vo Anh Ben - CE190709
 */
public class BookingRequest {

    @NotNull(message = "ID khách hàng không được để trống")
    private Integer customerId;

    private LocalDate bookingDate;

    @NotEmpty(message = "Danh sách phòng đặt không được để trống")
    private List<BookingDetailRequest> items = new ArrayList<>();

    public BookingRequest() {
    }

    public BookingRequest(Integer customerId, LocalDate bookingDate, List<BookingDetailRequest> items) {
        this.customerId = customerId;
        this.bookingDate = bookingDate;
        this.items = items;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public List<BookingDetailRequest> getItems() {
        return items;
    }

    public void setItems(List<BookingDetailRequest> items) {
        this.items = items;
    }
}
