package com.bencao.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateHerbRequest {

    @NotBlank(message = "药材名称不能为空")
    private String herbName;

    private String alias;

    private String originProvinceName;

    private String daoDiRegion;

    private Integer isDaoDi;

    private String nature;

    private String taste;

    private String meridian;

    private String propertyDesc;

    private String efficacy;

    private String clinicalUsage;

    private String coverImage;
}
