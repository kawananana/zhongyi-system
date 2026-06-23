package com.bencao.dto.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductAdminVO {

    private Long id;

    private String productName;

    private Long herbId;

    private String category;

    private String categoryLabel;

    private BigDecimal price;

    private Integer stock;

    private String coverImage;

    private String detail;

    private Integer salesCount;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
