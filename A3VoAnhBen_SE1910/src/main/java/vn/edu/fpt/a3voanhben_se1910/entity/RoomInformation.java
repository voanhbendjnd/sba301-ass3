package vn.edu.fpt.a3voanhben_se1910.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Author: Vo Anh Ben - CE190709
 * Entity RoomInformation theo dac ta Database Design Assignment 03
 */
@Entity
@Table(name = "RoomInformation")
public class RoomInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoomID")
    private Integer roomId;

    @Column(name = "RoomNumber", nullable = false)
    private String roomNumber;

    @Column(name = "RoomDetailDescription", length = 2000)
    private String roomDetailDescription;

    @Column(name = "RoomMaxCapacity")
    private Integer roomMaxCapacity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "RoomTypeID", nullable = false)
    private RoomType roomType;

    @Column(name = "RoomStatus")
    private Integer roomStatus = 1; // 1: Active, 0: Inactive

    @Column(name = "RoomPricePerDay", precision = 18, scale = 2)
    private BigDecimal roomPricePerDay;

    public RoomInformation() {
    }

    public RoomInformation(String roomNumber, String roomDetailDescription, Integer roomMaxCapacity, RoomType roomType,
            Integer roomStatus, BigDecimal roomPricePerDay) {
        this.roomNumber = roomNumber;
        this.roomDetailDescription = roomDetailDescription;
        this.roomMaxCapacity = roomMaxCapacity;
        this.roomType = roomType;
        this.roomStatus = roomStatus;
        this.roomPricePerDay = roomPricePerDay;
    }

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
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

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
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
