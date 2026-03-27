package com.petmanager.application.dto;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


import java.util.List;

public record SaveUserRegionReqDto (@Size(max = 3, message = "추가 지역은 최대 3개까지 가능합니다.")
                                    List<Long> addRegionIds,
                                    @Size(max = 3, message = "삭제 지역은 최대 3개까지 가능합니다.")
                                    List<Long> deleteRegionIds) {


    ///  추가 지역이 있고
    ///  삭제 지역이 없고
    public boolean isSaveLogic() {

        boolean isSaveLogic = false;

        if ((this.addRegionIds() != null && !this.addRegionIds().isEmpty())
                && (this.deleteRegionIds() == null || this.deleteRegionIds().isEmpty())) {

            isSaveLogic = true;
        }

        return isSaveLogic;
    }


}
