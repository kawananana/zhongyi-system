package com.bencao.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShareHerbRequest {

    @NotNull
    private Long herbId;

    private String content;
}
