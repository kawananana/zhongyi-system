package com.bencao.service.admin;

import com.bencao.common.PageResult;
import com.bencao.dto.admin.OrderReturnAdminVO;

public interface AdminOrderReturnService {

    PageResult<OrderReturnAdminVO> pageReturns(long page, long pageSize, String keyword, Integer status);

    void approve(Long id, String adminRemark);

    void reject(Long id, String adminRemark);
}
