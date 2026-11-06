package vn.edu.fpt.a3voanhben_se1910.entity;

import jakarta.persistence.*;

/**
 * Author: Vo Anh Ben - CE190709
 * Entity RoomType theo dac ta Database Design Assignment 03
 */
@Entity
@Table(name = "RoomType")
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoomTypeID")
    private Integer roomTypeId;

    @Column(name = "RoomTypeName", nullable = false)
    private String roomTypeName;

    @Column(name = "TypeDescription", length = 1000)
    private String typeDescription;

    @Column(name = "TypeNote", length = 1000)
    private String typeNote;

    public RoomType() {
    }

    public RoomType(String roomTypeName, String typeDescription, String typeNote) {
        this.roomTypeName = roomTypeName;
        this.typeDescription = typeDescription;
        this.typeNote = typeNote;
    }

    public Integer getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Integer roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public String getRoomTypeName() {
        return roomTypeName;
    }

    public void setRoomTypeName(String roomTypeName) {
        this.roomTypeName = roomTypeName;
    }

    public String getTypeDescription() {
        return typeDescription;
    }

    public void setTypeDescription(String typeDescription) {
        this.typeDescription = typeDescription;
    }

    public String getTypeNote() {
        return typeNote;
    }

    public void setTypeNote(String typeNote) {
        this.typeNote = typeNote;
    }
}
