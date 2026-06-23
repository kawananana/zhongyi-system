package com.bencao.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MarketOrderVO {

    private Long id;

    private String orderNo;

    private List<MarketOrderItemVO> items;

    private BigDecimal totalAmount;

    private Integer orderStatus;

    private Integer payStatus;

    private LocalDateTime createTime;

    private String receiverName;

    private String receiverPhone;

    private String receiverAddress;

    private MarketOrderReturnVO returnRequest;
}
