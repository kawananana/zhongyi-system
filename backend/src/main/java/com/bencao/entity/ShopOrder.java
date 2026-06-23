package com.bencao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("shop_order")
public class ShopOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long userId;

    private BigDecimal totalAmount;

    private String payType;

    private Integer payStatus;

    private Integer orderStatus;

    private String receiverName;

    private String receiverPhone;

    private String receiverAddr;

    private LocalDateTime createTime;

    private LocalDateTime payTime;

    private LocalDateTime finishTime;

    private LocalDateTime updateTime;
}
