package vn.edu.fpt.a3voanhben_se1910.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.a3voanhben_se1910.entity.RoomType;

/**
 * Author: Vo Anh Ben - CE190709
 */
@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
}
