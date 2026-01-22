package com.petmanager.application;


import com.petmanager.application.dto.CreateOriginUserDto;
import com.petmanager.application.dto.OriginLoginReqDto;
import com.petmanager.application.dto.SaveUserRegionReqDto;
import com.petmanager.application.exception.AuthException;
import com.petmanager.domain.User;
import com.petmanager.domain.repo.UserRepo;
import com.petmanager.infra.oauth.OAuth2UserInfo;
import com.petmanager.infra.security.PassEncoder;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepo userRepo;
    private final PassEncoder passEncoder;


    public User login(OriginLoginReqDto reqDto) {

        User user = userRepo.findByUsername(reqDto.username())
                .orElseThrow(() -> AuthException.badRequest("아이디 또는 비밀번호가 틀렸습니다."));

        user.isValidPassword(reqDto.password(), passEncoder.passEncoder());

        return user;
    }

    @Transactional(readOnly = false)
    public User createOrGetOAuthUser(OAuth2UserInfo userInfo) {

        User user = User.from(userInfo);

        Optional<User> foundUser = userRepo.findByUsername(user.getUsername());

        return foundUser.orElseGet(() -> userRepo.save(user));
    }


    public User join(CreateOriginUserDto dto) {

        boolean isExist = userRepo.existsUserByUsername(dto.username());

        if(isExist) {
            throw AuthException.badRequest("이미 존재하는 아이디 입니다.");
        }

        User user =  User.from(dto, passEncoder.passEncoder());
        return userRepo.save(user);
    }


    public User findById(long userId) {

        return userRepo.findById(userId).orElseThrow(()-> AuthException.badRequest("유저정보를 확인할 수 없음."));
    }


}
