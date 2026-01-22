package com.petmanager.config;

import com.petmanager.dto.BasicUserInfo;
import com.petmanager.entity.Role;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

import static com.petmanager.config.GlobalConst.*;


@RequiredArgsConstructor
public class UserHeaderFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {


        String strUserId = request.getHeader(X_USER_ID_COOKIE_KEY);
        String username = request.getHeader(X_USER_NAME_COOKIE_KEY);
        String role = request.getHeader(X_USER_ROLE_COOKIE_KEY);
        String email =  request.getHeader(X_USER_EMAIL_COOKIE_KEY);

        ///  해당 필터에 거치지 않으면 게스트 유저
        if (strUserId != null) {

            /// 헤더에 담겨온 내용을 통해 BasicUserInfo 생성
            BasicUserInfo userInfo = new BasicUserInfo(Long.parseLong(strUserId),
                    username,
                    email,
                    Role.valueOf(role));

            /// Spring Security는 단순 문자열(String)로는 권한을 못 알아먹음
            ///  SimpleGrantedAuthority라는 전용 객체(계급장)로 포장
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

            Authentication auth = new UsernamePasswordAuthenticationToken(userInfo, null, authorities);

            ///  Spring Security는 내부적으로 돌아갈 때 Authentication 객체가 무조건 필요합니다.
            ///  세션 처럼 서버내에 계속 저장하는것이 아닌 응답을 보내고 해당 객체는 제거됨.
            SecurityContextHolder.getContext().setAuthentication(auth);
        }


        filterChain.doFilter(request, response);
    }

}