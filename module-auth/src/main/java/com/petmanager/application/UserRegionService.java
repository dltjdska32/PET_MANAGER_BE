package com.petmanager.application;


import com.petmanager.application.dto.SaveUserRegionReqDto;
import com.petmanager.application.exception.AuthException;
import com.petmanager.domain.User;
import com.petmanager.domain.UserRegion;
import com.petmanager.domain.repo.UserRegionRepo;
import com.petmanager.entity.Region;
import com.petmanager.entity.Regions;
import com.petmanager.exception.RegionException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserRegionService {

    private final UserRegionRepo userRegionRepo;


    /// 유저가 설정한 지역 업서트 메서드
    @Transactional(readOnly = false)
    public void upsertUserRegions(SaveUserRegionReqDto dto, User user) {

        Integer userRegionCount = userRegionRepo.countByUserId(user.getId());

        if (dto.isSaveLogic() && userRegionCount == 0) {

            saveUserRegion(dto.addRegionIds(), user);
        } else {                /// 위에 걸리지 않는다면 모두 업데이트

            updateUserRegion(dto, user, userRegionCount);
        }

    }

    ///  유저가 설정한 지역 저장 메서드
    @Transactional(readOnly = false)
    public void saveUserRegion(List<Long> addRegionIds, User user) {

        if(addRegionIds == null || addRegionIds.isEmpty()) return;

        List<UserRegion> userRegions = new ArrayList<>();

        for(Long regionId : addRegionIds){

            Regions region = Regions
                    .getRegionById(regionId)
                    .orElseThrow(() -> RegionException.badRequest("지역을 찾을 수 없습니다."));


            UserRegion userRegion = UserRegion.to(user, Region.to(region));

            userRegions.add(userRegion);
        }

        userRegionRepo.saveAll(userRegions);
    }


    /// 유저가 설정한 지역 업데이트 메서드
    public void updateUserRegion(SaveUserRegionReqDto dto, User user, int userRegionCount) {

        int updatedUserRegionCount = userRegionCount + dto.addRegionIds().size() - dto.deleteRegionIds().size();

        /// 유저의 지역개수를 통해 없데이트 검증
        UserRegion.validSavedUserRegionCount(updatedUserRegionCount);
        /// 지역 삭제
        deleteUserRegions(dto.deleteRegionIds(), user);
        /// 지역 저장
        saveUserRegion(dto.addRegionIds(), user);

    }

    /// 유저 지역 삭제
    public void deleteUserRegions(List<Long> deleteUserRegions, User user) {

        Integer userRegionCount = userRegionRepo.countByUserId(user.getId());

        int checkDeleteSize = userRegionCount - deleteUserRegions.size();

        UserRegion.validDeleteUserRegionCount(checkDeleteSize);

        Long deletedCount = userRegionRepo.deleteUserRegionByuserIds(deleteUserRegions);

        if (deletedCount != deleteUserRegions.size()) {
            throw AuthException.badRequest("유저의 지역 삭제 실패 : 삭제할 수 있는 요청량 초과");
        }
    }


}
