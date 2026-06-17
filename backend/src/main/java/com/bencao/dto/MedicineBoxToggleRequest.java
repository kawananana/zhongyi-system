package com.bencao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MedicineBoxToggleRequest {

    @NotNull
    private Long herbId;

    @NotBlank
    private String action;
}
