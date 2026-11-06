package vn.edu.fpt.a3voanhben_se1910.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.a3voanhben_se1910.entity.Customer;

import java.util.List;
import java.util.Optional;

/**
 * Author: Vo Anh Ben - CE190709
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Optional<Customer> findByEmailAddressIgnoreCase(String emailAddress);

    boolean existsByEmailAddressIgnoreCase(String emailAddress);

    @Query("SELECT c FROM Customer c WHERE " +
            "LOWER(c.customerFullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.emailAddress) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.telephone) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Customer> searchCustomers(@Param("keyword") String keyword);
}
