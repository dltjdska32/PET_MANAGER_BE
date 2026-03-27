package com.petmanager.domain.repo;


import com.petmanager.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsUserByUsername(String username);

    @Query("UPDATE User u " +
            "SET u.nickname = :nickname " +
            "WHERE u.id = :userId")
    int updateNickname(String nickname, Long userId);
}
