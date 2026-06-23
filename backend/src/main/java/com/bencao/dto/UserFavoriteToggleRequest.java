package com.bencao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserFavoriteToggleRequest {

    @NotBlank(message = "type 不能为空")
    private String type;

    @NotNull(message = "id 不能为空")
    private Long id;

    @NotBlank(message = "action 不能为空")
    private String action;
}
