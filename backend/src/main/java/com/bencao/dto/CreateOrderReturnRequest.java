package com.bencao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateOrderReturnRequest {

    @NotBlank(message = "请填写退货原因")
    @Size(max = 500, message = "退货原因不超过500字")
    private String reason;
}
