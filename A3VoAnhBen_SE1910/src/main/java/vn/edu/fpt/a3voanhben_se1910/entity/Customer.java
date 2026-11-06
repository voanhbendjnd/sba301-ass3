package vn.edu.fpt.a3voanhben_se1910.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Author: Vo Anh Ben - CE190709
 * Entity Customer theo dac ta Database Design Assignment 03
 */
@Entity
@Table(name = "Customer")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CustomerID")
    private Integer customerId;

    @Column(name = "CustomerFullName", nullable = false)
    private String customerFullName;

    @Column(name = "Telephone")
    private String telephone;

    @Column(name = "EmailAddress", nullable = false, unique = true)
    private String emailAddress;

    @Column(name = "CustomerBirthday")
    private LocalDate customerBirthday;

    @Column(name = "CustomerStatus")
    private Integer customerStatus = 1; // 1: Active, 0: Inactive

    @Column(name = "Password", nullable = false)
    private String password;

    public Customer() {
    }

    public Customer(String customerFullName, String telephone, String emailAddress, LocalDate customerBirthday,
            Integer customerStatus, String password) {
        this.customerFullName = customerFullName;
        this.telephone = telephone;
        this.emailAddress = emailAddress;
        this.customerBirthday = customerBirthday;
        this.customerStatus = customerStatus;
        this.password = password;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getCustomerFullName() {
        return customerFullName;
    }

    public void setCustomerFullName(String customerFullName) {
        this.customerFullName = customerFullName;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public LocalDate getCustomerBirthday() {
        return customerBirthday;
    }

    public void setCustomerBirthday(LocalDate customerBirthday) {
        this.customerBirthday = customerBirthday;
    }

    public Integer getCustomerStatus() {
        return customerStatus;
    }

    public void setCustomerStatus(Integer customerStatus) {
        this.customerStatus = customerStatus;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
