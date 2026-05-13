package com.petmanager.application.dto;

import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record UpsertProfileImgReqDto(@Size(min = 1, max = 1, message = "프로필 이미지는 최대 1개입니다.")
                                     List<MultipartFile> userProfileImgs) {

    public UpsertProfileImgReqDto {

        userProfileImgs = userProfileImgs == null ? List.of() : userProfileImgs;
    }
}
