package com.petmanager.domain.repo;


import com.petmanager.domain.UserRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserRegionRepo extends JpaRepository<UserRegion, Long> {

    @Query("SELECT COUNT(*) " +
            "FROM UserRegion ur " +
            "WHERE ur.user.id = :userId")
    Integer countByUserId(Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE UserRegion ur " +
            "SET ur.isDeleted = true " +
            "WHERE ur.user.id IN :userId")
    Long deleteUserRegionByuserIds(List<Long> userId);
}
