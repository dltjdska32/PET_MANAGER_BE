package com.petmanager.domain.repo;


import com.petmanager.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsUserByUsername(String username);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u " +
            "SET u.nickname = :nickname " +
            "WHERE u.id = :userId " +
            "AND u.isDeleted = false ")
    int updateNickname(String nickname, Long userId);


    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u " +
            "SET u.userMainImgUrl = :urls " +
            "WHERE u.id = :userId " +
            "AND u.isDeleted = false ")
    int upsertUserImg(Long userId, String urls);

}
