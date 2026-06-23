package com.bencao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("order_return_request")
public class OrderReturnRequest {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Long userId;

    private String reason;

    /** 0待审核 1已同意 2已拒绝 */
    private Integer status;

    private String adminRemark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private LocalDateTime auditTime;
}
