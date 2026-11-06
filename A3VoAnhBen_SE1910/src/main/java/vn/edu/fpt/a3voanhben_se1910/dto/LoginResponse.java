package vn.edu.fpt.a3voanhben_se1910.dto;

/**
 * Author: Vo Anh Ben - CE190709
 * DTO LoginResponse kem JSON Web Token
 */
public class LoginResponse {
    private String token;
    private Integer accountId;
    private String accountName;
    private String accountEmail;
    private Integer accountRole; // 1: Staff, 2: Customer
    private String role; // "Staff" hoac "Customer"

    public LoginResponse() {
    }

    public LoginResponse(String token, Integer accountId, String accountName, String accountEmail, Integer accountRole, String role) {
        this.token = token;
        this.accountId = accountId;
        this.accountName = accountName;
        this.accountEmail = accountEmail;
        this.accountRole = accountRole;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Integer getAccountId() {
        return accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getAccountEmail() {
        return accountEmail;
    }

    public void setAccountEmail(String accountEmail) {
        this.accountEmail = accountEmail;
    }

    public Integer getAccountRole() {
        return accountRole;
    }

    public void setAccountRole(Integer accountRole) {
        this.accountRole = accountRole;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
