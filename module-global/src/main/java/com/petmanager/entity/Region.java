package com.petmanager.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;


@Entity
@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class Region extends BaseEntity{

    @Id
    private Long id;

    private Long parentId;

    private int level;

    private String regionName;



    public static Region to(Regions region) {

        return Region.builder()
                .id(region.getId())
                .parentId(region.getParent().getId())
                .level(region.getLevel())
                .regionName(region.getRegionName())
                .build();
    }
}
