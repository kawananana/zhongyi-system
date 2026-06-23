package com.bencao.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateMarketOrderRequest {

    @NotEmpty(message = "订单商品不能为空")
    @Valid
    private List<CreateMarketOrderItemRequest> items;

    @NotBlank(message = "请填写收货人姓名")
    @Size(max = 64, message = "收货人姓名过长")
    private String receiverName;

    @NotBlank(message = "请填写收货手机号")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String receiverPhone;

    @NotBlank(message = "请填写收货地址")
    @Size(max = 512, message = "收货地址过长")
    private String receiverAddr;
}
