package com.petmanager.application.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum EventType {
     USER_REGIONS_UPSERTED,
     USER_CREATED,
     USER_NICKNAME_UPDATED,
     USER_REGION_DELETED,
     USER_PROFILE_IMG_UPDATED;
}
