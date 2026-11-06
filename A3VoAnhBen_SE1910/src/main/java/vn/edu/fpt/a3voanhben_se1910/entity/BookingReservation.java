package vn.edu.fpt.a3voanhben_se1910.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Author: Vo Anh Ben - CE190709
 * Entity BookingReservation theo dac ta Database Design Assignment 03
 */
@Entity
@Table(name = "BookingReservation")
public class BookingReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BookingReservationID")
    private Integer bookingReservationId;

    @Column(name = "BookingDate")
    private LocalDate bookingDate = LocalDate.now();

    @Column(name = "TotalPrice", precision = 18, scale = 2)
    private BigDecimal totalPrice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CustomerID", nullable = false)
    private Customer customer;

    @Column(name = "BookingStatus")
    private Integer bookingStatus = 1; // 1: Confirmed/Active, 2: Completed, 0: Cancelled

    @OneToMany(mappedBy = "bookingReservation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<BookingDetail> bookingDetails = new ArrayList<>();

    public BookingReservation() {
    }

    public BookingReservation(LocalDate bookingDate, BigDecimal totalPrice, Customer customer, Integer bookingStatus) {
        this.bookingDate = bookingDate;
        this.totalPrice = totalPrice;
        this.customer = customer;
        this.bookingStatus = bookingStatus;
    }

    public Integer getBookingReservationId() {
        return bookingReservationId;
    }

    public void setBookingReservationId(Integer bookingReservationId) {
        this.bookingReservationId = bookingReservationId;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Integer getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(Integer bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public List<BookingDetail> getBookingDetails() {
        return bookingDetails;
    }

    public void setBookingDetails(List<BookingDetail> bookingDetails) {
        this.bookingDetails = bookingDetails;
    }
}
