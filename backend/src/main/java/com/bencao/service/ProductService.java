package com.bencao.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.bencao.entity.Product;

public interface ProductService extends IService<Product> {

    Page<Product> pageProducts(long page, long pageSize, String keyword, String category);

    Product getProductDetail(Long id);
}
