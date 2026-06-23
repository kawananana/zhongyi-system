package com.bencao.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MarketOrderItemVO {

    private Long productId;

    private String productName;

    private String category;

    private BigDecimal unitPrice;

    private Integer quantity;
}
