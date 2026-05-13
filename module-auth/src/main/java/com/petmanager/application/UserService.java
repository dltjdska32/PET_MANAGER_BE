package com.petmanager.application;


import com.petmanager.application.dto.*;
import com.petmanager.application.exception.AuthException;
import com.petmanager.domain.User;
import com.petmanager.domain.repo.UserRepo;
import com.petmanager.infra.oauth.OAuth2UserInfo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.petmanager.application.port.OutboxPort;
import com.petmanager.application.event.UserCreatedEvent;
import java.util.Collections;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final OutboxPort outboxPort;


    public User login(OriginLoginReqDto reqDto) {

        User user = userRepo.findByUsername(reqDto.username())
                .orElseThrow(() -> AuthException.badRequest("아이디 또는 비밀번호가 틀렸습니다."));

        user.isValidPassword(reqDto.password(), passwordEncoder);

        return user;
    }

    @Transactional(readOnly = false)
    public void upsertUserImg(Long userId, String urls) {

        int rowCnt = userRepo.upsertUserImg(userId, urls);

        if(rowCnt == 0) {
            throw  AuthException.badRequest("프로필 이미지 등록에 실패했습니다.");
        }
    }


    @Transactional(readOnly = false)
    public SocialLoginUserInfoDto createOrGetOAuthUser(OAuth2UserInfo userInfo) {

        User user = User.from(userInfo);

        Optional<User> getUser = userRepo.findByUsername(user.getUsername());

        SocialLoginUserInfoDto resp;

        if(getUser.isEmpty()) {

            User savedUser = userRepo.save(user);

            /// 신규 저장일 경우에만 지역없는 최초 가입 아웃박스 이벤트 발행
            outboxPort.saveEvent(UserCreatedEvent.of(savedUser, Collections.emptyList()));

            resp = new SocialLoginUserInfoDto(savedUser, true);
        } else {

            User foundUser = getUser.get();

            resp = new SocialLoginUserInfoDto(foundUser, false);
        }

        return resp;
    }


    public User join(CreateOriginUserDto dto) {

        checkId(dto.username());

        User user =  User.from(dto, passwordEncoder);
        return userRepo.save(user);
    }


    public User findById(long userId) {

        return userRepo.findById(userId).orElseThrow(()-> AuthException.badRequest("유저정보를 확인할 수 없음."));
    }


    public void checkId(String username) {


        boolean isExist = userRepo.existsUserByUsername(username);

        if(isExist) {
            throw AuthException.badRequest("이미 존재하는 아이디 입니다.");
        }
    }


    @Transactional(readOnly = false)
    public void updateNickname(String nickname, Long userId) {

        int updatedCount = userRepo.updateNickname(nickname, userId);

        if(updatedCount == 0) {
            throw AuthException.badRequest("닉네임 변경에 실패했습니다.");
        }
    }

    public FindUserImgRespDto findUserImgsById(Long userId) {

        User user = userRepo.findById(userId).orElseThrow(() -> AuthException.badRequest("확인할 수 없는 유저입니다."));

        return new FindUserImgRespDto(user.getUserMainImgUrl());
    }
}
