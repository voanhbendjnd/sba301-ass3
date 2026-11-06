package vn.edu.fpt.a3voanhben_se1910.dto;

import java.time.LocalDate;

/**
 * Author: Vo Anh Ben - CE190709
 */
public class ProfileUpdateRequest {
    private String customerFullName;
    private String telephone;
    private LocalDate customerBirthday;
    private String oldPassword;
    private String newPassword;

    public ProfileUpdateRequest() {
    }

    public ProfileUpdateRequest(String customerFullName, String telephone, LocalDate customerBirthday,
            String oldPassword, String newPassword) {
        this.customerFullName = customerFullName;
        this.telephone = telephone;
        this.customerBirthday = customerBirthday;
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
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

    public LocalDate getCustomerBirthday() {
        return customerBirthday;
    }

    public void setCustomerBirthday(LocalDate customerBirthday) {
        this.customerBirthday = customerBirthday;
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
