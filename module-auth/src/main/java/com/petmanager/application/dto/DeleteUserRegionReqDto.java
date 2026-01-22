package com.petmanager.application.dto;

import jakarta.validation.constraints.Size;

import java.util.List;

public record DeleteUserRegionReqDto (@Size(min = 0)
                                       List<Long> deleteUserRegions) {
}
