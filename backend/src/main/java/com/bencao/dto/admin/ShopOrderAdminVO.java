package com.bencao.dto.admin;

import com.bencao.dto.MarketOrderItemVO;
import com.bencao.dto.MarketOrderReturnVO;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ShopOrderAdminVO {

    private Long id;

    private String orderNo;

    private Long userId;

    private String userNickname;

    private String userPhone;

    private List<MarketOrderItemVO> items;

    private BigDecimal totalAmount;

    private Integer orderStatus;

    private Integer payStatus;

    private String receiverName;

    private String receiverPhone;

    private String receiverAddress;

    private MarketOrderReturnVO returnRequest;

    private LocalDateTime createTime;

    private LocalDateTime payTime;
}
