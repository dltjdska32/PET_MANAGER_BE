package com.petmanager.domain;

import com.petmanager.entity.BaseEntity;
import com.petmanager.entity.Region;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class UserRegion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "region_id")
    private Region region;

    public static UserRegion to(User user,  Region region){

        return  UserRegion
                .builder()
                .user(user)
                .region(region)
                .build();
    }


    /// 유저가 저장한 지역갯수 확인. (유저가 저장한 지역이 3개 이상일 경우 에러 반환.)
    public static void validSavedUserRegionCount(int count) {

        if (count > 3) {
            throw new IllegalStateException("유저가 저장한 지역 갯수가 3개를 초과합니다.");
        } else if (count < 0) {
            throw new IllegalStateException("유저가 저장한 지역의 갯수가 음수일 수 없습니다.");
        }
    }

    public static void validDeleteUserRegionCount(int count) {

        if(count < 0){
            throw new IllegalStateException("유저가 삭제요청한 데이터 크기가 실제 데이터 크기를 초과합니다.");
        }
    }


}
