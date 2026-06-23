package com.bencao.service.admin;

import com.bencao.common.PageResult;
import com.bencao.dto.admin.ProductAdminVO;
import com.bencao.dto.admin.UpdateProductRequest;

public interface AdminProductManageService {

    PageResult<ProductAdminVO> pageProducts(long page, long pageSize, String keyword, String category, Integer status);

    ProductAdminVO getProduct(Long id);

    ProductAdminVO updateProduct(Long id, UpdateProductRequest request);

    void updateStatus(Long id, int status);
}
