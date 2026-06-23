package com.bencao.service.admin;

import com.bencao.common.PageResult;
import com.bencao.dto.admin.ShopOrderAdminVO;

public interface AdminOrderManageService {

    PageResult<ShopOrderAdminVO> pageOrders(long page, long pageSize, String keyword,
                                            Integer orderStatus, Integer payStatus);

    ShopOrderAdminVO getOrderDetail(Long id);

    ShopOrderAdminVO updateStatus(Long id, Integer orderStatus, Integer payStatus);
}
