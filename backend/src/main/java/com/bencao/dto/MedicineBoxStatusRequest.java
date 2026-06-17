package com.bencao.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class MedicineBoxStatusRequest {

    @NotEmpty
    private List<Long> herbIds;
}
