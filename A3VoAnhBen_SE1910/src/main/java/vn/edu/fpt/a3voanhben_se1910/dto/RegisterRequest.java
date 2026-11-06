package vn.edu.fpt.a3voanhben_se1910.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

/**
 * Author: Vo Anh Ben - CE190709
 */
public class RegisterRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String customerFullName;

    private String telephone;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String emailAddress;

    private LocalDate customerBirthday;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    public RegisterRequest() {
    }

    public RegisterRequest(String customerFullName, String telephone, String emailAddress, LocalDate customerBirthday,
            String password) {
        this.customerFullName = customerFullName;
        this.telephone = telephone;
        this.emailAddress = emailAddress;
        this.customerBirthday = customerBirthday;
        this.password = password;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
