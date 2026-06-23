package com.bencao.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MarketOrderReturnVO {

    private Long id;

    /** 0待审核 1已同意 2已拒绝 */
    private Integer status;

    private String reason;

    private String adminRemark;

    private LocalDateTime createTime;

    private LocalDateTime auditTime;
}
