package vn.edu.fpt.a3voanhben_se1910.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * Author: Vo Anh Ben - CE190709
 */
public class RoomRequest {

    @NotBlank(message = "Số phòng không được để trống")
    private String roomNumber;

    private String roomDetailDescription;

    private Integer roomMaxCapacity;

    @NotNull(message = "Loại phòng không được để trống")
    private Integer roomTypeId;

    private Integer roomStatus = 1;

    @NotNull(message = "Giá phòng mỗi ngày không được để trống")
    private BigDecimal roomPricePerDay;

    public RoomRequest() {
    }

    public RoomRequest(String roomNumber, String roomDetailDescription, Integer roomMaxCapacity, Integer roomTypeId,
            Integer roomStatus, BigDecimal roomPricePerDay) {
        this.roomNumber = roomNumber;
        this.roomDetailDescription = roomDetailDescription;
        this.roomMaxCapacity = roomMaxCapacity;
        this.roomTypeId = roomTypeId;
        this.roomStatus = roomStatus;
        this.roomPricePerDay = roomPricePerDay;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomDetailDescription() {
        return roomDetailDescription;
    }

    public void setRoomDetailDescription(String roomDetailDescription) {
        this.roomDetailDescription = roomDetailDescription;
    }

    public Integer getRoomMaxCapacity() {
        return roomMaxCapacity;
    }

    public void setRoomMaxCapacity(Integer roomMaxCapacity) {
        this.roomMaxCapacity = roomMaxCapacity;
    }

    public Integer getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Integer roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public Integer getRoomStatus() {
        return roomStatus;
    }

    public void setRoomStatus(Integer roomStatus) {
        this.roomStatus = roomStatus;
    }

    public BigDecimal getRoomPricePerDay() {
        return roomPricePerDay;
    }

    public void setRoomPricePerDay(BigDecimal roomPricePerDay) {
        this.roomPricePerDay = roomPricePerDay;
    }
}
