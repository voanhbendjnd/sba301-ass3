package vn.edu.fpt.a3voanhben_se1910.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Author: Vo Anh Ben - CE190709
 */
public class BookingDetailRequest {
    private Integer roomId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal actualPrice;

    public BookingDetailRequest() {
    }

    public BookingDetailRequest(Integer roomId, LocalDate startDate, LocalDate endDate, BigDecimal actualPrice) {
        this.roomId = roomId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.actualPrice = actualPrice;
    }

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
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
