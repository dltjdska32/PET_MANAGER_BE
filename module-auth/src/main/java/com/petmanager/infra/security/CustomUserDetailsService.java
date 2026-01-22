package com.petmanager.infra.security;

import com.petmanager.domain.User;
import com.petmanager.domain.repo.UserRepo;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class CustomUserDetailsService implements UserDetailsService {

    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepo
                .findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("확인할 수 없는 유저 아이디 입니다."));

        return null;
    }
}
