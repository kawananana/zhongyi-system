package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.entity.Product;
import com.bencao.mapper.ProductMapper;
import com.bencao.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

    @Override
    public Page<Product> pageProducts(long page, long pageSize, String keyword, String category) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Product::getStatus, 1);
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Product::getProductName, keyword)
                    .or()
                    .like(Product::getDetail, keyword));
        }
        if (StringUtils.hasText(category) && !"all".equalsIgnoreCase(category)) {
            wrapper.eq(Product::getCategory, category);
        }
        wrapper.orderByDesc(Product::getSalesCount);
        return page(new Page<>(page, pageSize), wrapper);
    }

    @Override
    public Product getProductDetail(Long id) {
        Product product = getById(id);
        if (product == null || product.getStatus() == null || product.getStatus() != 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return product;
    }
}
