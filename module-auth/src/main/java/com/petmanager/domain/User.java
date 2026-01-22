package com.petmanager.domain;



import com.petmanager.application.dto.CreateOriginUserDto;
import com.petmanager.domain.enums.Provider;
import com.petmanager.entity.Role;
import com.petmanager.entity.BaseEntity;
import com.petmanager.infra.oauth.OAuth2UserInfo;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 *  @Param - nickname -> 유저 닉네임 or 카카오, 구글의 별칭  ex)이보라매의 꿈.
 * @Param - username -> 유저아이디 or provider + "-" + providerId
 * @Param - password -> 유저 회원가입시 필요 (기본값 null)
 * @Param - provider -> GOOGLE , NAVER, KAKAO 등등 일반로그인일경우 ORIGIN
 * @Param - providerId -> 각각의 사이트 pk값  (ORIGIN 의 경우 null)
 * */
@Entity
@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nickname;

    @Column(unique = true)
    private String username;

    private String password;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Provider provider;


    private String providerId;


    /// oauth 사용자 생성
    public static User from(OAuth2UserInfo info){

        Provider provider = info.getProvider();
        String providerId = info.getProviderId();


        String username = provider.getValue() + "_" + providerId;

        return User.builder()
                .nickname(info.getName())
                .email(info.getEmail())
                .provider(provider)
                .providerId(providerId)
                .username(username)
                .password(null)
                .role(Role.ROLE_USER)
                .build();
    }


    /// origin 사용자 생성
    public static User from(CreateOriginUserDto dto, PasswordEncoder passwordEncoder){

        Provider provider = Provider.ORIGIN;

        String encodedPassword = passwordEncoder.encode(dto.password());

        return User.builder()
                .nickname(dto.nickName())
                .email(dto.email())
                .provider(provider)
                .providerId(null)
                .username(dto.username())
                .password(encodedPassword)
                .role(Role.ROLE_USER)
                .build();
    }



    public void isValidPassword(String inputPass, PasswordEncoder encoder){

        if(!encoder.matches(this.password, encoder.encode(inputPass))){
           throw new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다.");
        }
    }

}
