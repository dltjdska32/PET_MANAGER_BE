package com.petmanager.domain.repo;


import com.petmanager.domain.UserRegion;
import com.petmanager.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserRegionRepo extends JpaRepository<UserRegion, Long> {

    @Query("SELECT COUNT(ur) " +
            "FROM UserRegion ur " +
            "WHERE ur.user.id = :userId")
    Integer countByUserId(Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE UserRegion ur " +
            "SET ur.isDeleted = true " +
            "WHERE ur.user.id IN :userId")
    Long deleteUserRegionByuserIds(List<Long> userId);


    @Query("SELECT ur.region.id " +
            "FROM UserRegion ur " +
            "WHERE ur.user.id = :userId")
    List<Long> findRegionIdByUserId(Long userId);
}
