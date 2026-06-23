package com.bencao.dto.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderReturnAdminVO {

    private Long id;

    private Long orderId;

    private String orderNo;

    private Long userId;

    private String userNickname;

    private String userPhone;

    private BigDecimal totalAmount;

    private Integer orderStatus;

    private Integer payStatus;

    private String receiverName;

    private String receiverPhone;

    private String receiverAddress;

    private String reason;

    /** 0待审核 1已同意 2已拒绝 */
    private Integer status;

    private String adminRemark;

    private LocalDateTime createTime;

    private LocalDateTime auditTime;
}
