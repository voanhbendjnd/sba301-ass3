package vn.edu.fpt.a3voanhben_se1910.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import vn.edu.fpt.a3voanhben_se1910.entity.*;
import vn.edu.fpt.a3voanhben_se1910.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Author: Vo Anh Ben - CE190709
 * Khoi tao du lieu mau ban dau cho He thong Khach san FUMiniHotelSystem
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private RoomInformationRepository roomRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BookingReservationRepository reservationRepository;

    @Autowired
    private BookingDetailRepository detailRepository;

    @Override
    public void run(String... args) {
        try {
            // Khoi tao RoomType
            if (roomTypeRepository.count() == 0) {
                RoomType std = roomTypeRepository.save(new RoomType("Standard Room",
                        "Phòng tiêu chuẩn ấm cúng với đầy đủ tiện nghi cơ bản", "Bao gồm Wifi, TV, điều hòa"));
                RoomType sup = roomTypeRepository.save(new RoomType("Superior Room",
                        "Phòng cao cấp không gian rộng rãi hướng phố", "Bao gồm bữa sáng nhẹ"));
                RoomType dlx = roomTypeRepository.save(new RoomType("Deluxe Room",
                        "Phòng sang trọng với ban công thoáng mát và bồn tắm", "Bao gồm bữa sáng buffet"));
                RoomType ste = roomTypeRepository.save(new RoomType("Executive Suite",
                        "Phòng Suite thượng hạng với phòng khách và phòng ngủ riêng", "Dịch vụ VIP 24/7"));

                // Khoi tao RoomInformation
                RoomInformation r101 = roomRepository.save(new RoomInformation("101",
                        "Phòng Standard tầng 1, giường đôi êm ái, yên tĩnh", 2, std, 1, new BigDecimal("450000")));
                RoomInformation r102 = roomRepository
                        .save(new RoomInformation("102", "Phòng Standard tầng 1, 2 giường đơn thích hợp cho bạn bè", 2,
                                std, 1, new BigDecimal("450000")));
                RoomInformation r201 = roomRepository
                        .save(new RoomInformation("201", "Phòng Superior tầng 2 có cửa sổ lớn đón ánh sáng tự nhiên", 3,
                                sup, 1, new BigDecimal("750000")));
                RoomInformation r202 = roomRepository.save(new RoomInformation("202",
                        "Phòng Superior tầng 2 view vườn cây xanh mát", 2, sup, 1, new BigDecimal("750000")));
                RoomInformation r301 = roomRepository
                        .save(new RoomInformation("301", "Phòng Deluxe tầng 3 có ban công ngắm toàn cảnh thành phố", 4,
                                dlx, 1, new BigDecimal("1200000")));
                RoomInformation r401 = roomRepository
                        .save(new RoomInformation("401", "Executive Suite đẳng cấp tổng thống, quầy bar mini cao cấp",
                                4, ste, 1, new BigDecimal("2500000")));

                // Khoi tao Customer mau
                if (customerRepository.count() == 0) {
                    Customer c1 = customerRepository.save(new Customer(
                            "Nguyễn Văn An",
                            "0912345678",
                            "customer@gmail.com",
                            LocalDate.of(1998, 5, 20),
                            1,
                            "123456"));

                    Customer c2 = customerRepository.save(new Customer(
                            "Trần Thị Mai",
                            "0987654321",
                            "mai.tran@gmail.com",
                            LocalDate.of(2001, 10, 15),
                            1,
                            "123456"));

                    // Tao 1 giao dich dat phong mau de test logic xoa phong / doi status
                    BookingReservation reservation = new BookingReservation();
                    reservation.setCustomer(c1);
                    reservation.setBookingDate(LocalDate.now().minusDays(2));
                    reservation.setBookingStatus(1);
                    reservation.setTotalPrice(new BigDecimal("900000"));
                    reservation = reservationRepository.save(reservation);

                    BookingDetail detail = new BookingDetail(
                            reservation,
                            r101,
                            LocalDate.now().plusDays(1),
                            LocalDate.now().plusDays(3),
                            new BigDecimal("900000"));
                    detailRepository.save(detail);
                }
            }
        } catch (Exception e) {
            System.err.println("Note on DataInitializer: " + e.getMessage());
        }
    }
}
