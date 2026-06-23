package com.bencao.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.PageResult;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.admin.ProductAdminVO;
import com.bencao.dto.admin.UpdateProductRequest;
import com.bencao.entity.Product;
import com.bencao.mapper.ProductMapper;
import com.bencao.service.admin.AdminProductManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminProductManageServiceImpl implements AdminProductManageService {

    private static final Map<String, String> CATEGORY_LABELS = Map.ofEntries(
            Map.entry("tea_therapy", "养生茶疗"),
            Map.entry("moxibustion", "艾灸艾柱"),
            Map.entry("skincare", "中医护肤"),
            Map.entry("books", "中医书籍"),
            Map.entry("food_medicine", "药食同源"),
            Map.entry("herbal_paste", "膏方系列"),
            Map.entry("physio_tools", "理疗工具"),
            Map.entry("foot_therapy", "养生足疗"),
            Map.entry("gift_box", "精品礼盒"),
            Map.entry("decoction", "滋补饮片")
    );

    private final ProductMapper productMapper;

    @Override
    public PageResult<ProductAdminVO> pageProducts(long page, long pageSize, String keyword,
                                                   String category, Integer status) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Product::getProductName, keyword)
                    .or()
                    .like(Product::getDetail, keyword));
        }
        if (StringUtils.hasText(category)) {
            wrapper.eq(Product::getCategory, category);
        }
        if (status != null) {
            wrapper.eq(Product::getStatus, status);
        }
        wrapper.orderByDesc(Product::getUpdateTime).orderByDesc(Product::getId);
        Page<Product> productPage = productMapper.selectPage(new Page<>(page, pageSize), wrapper);
        List<ProductAdminVO> list = productPage.getRecords().stream().map(this::toVo).toList();
        return PageResult.of(list, productPage.getTotal(), productPage.getCurrent(), productPage.getSize());
    }

    @Override
    public ProductAdminVO getProduct(Long id) {
        Product product = requireProduct(id);
        return toVo(product);
    }

    @Override
    public ProductAdminVO updateProduct(Long id, UpdateProductRequest request) {
        Product product = requireProduct(id);
        product.setProductName(request.getProductName().trim());
        product.setCategory(request.getCategory().trim());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        if (request.getCoverImage() != null) {
            product.setCoverImage(request.getCoverImage().trim());
        }
        if (request.getDetail() != null) {
            product.setDetail(request.getDetail().trim());
        }
        productMapper.updateById(product);
        return toVo(productMapper.selectById(id));
    }

    @Override
    public void updateStatus(Long id, int status) {
        if (status != 0 && status != 1) {
            throw new BusinessException("状态值无效");
        }
        Product product = requireProduct(id);
        product.setStatus(status);
        productMapper.updateById(product);
    }

    private Product requireProduct(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return product;
    }

    private ProductAdminVO toVo(Product product) {
        ProductAdminVO vo = new ProductAdminVO();
        vo.setId(product.getId());
        vo.setProductName(product.getProductName());
        vo.setHerbId(product.getHerbId());
        vo.setCategory(product.getCategory());
        vo.setCategoryLabel(CATEGORY_LABELS.getOrDefault(product.getCategory(), product.getCategory()));
        vo.setPrice(product.getPrice());
        vo.setStock(product.getStock());
        vo.setCoverImage(product.getCoverImage());
        vo.setDetail(product.getDetail());
        vo.setSalesCount(product.getSalesCount());
        vo.setStatus(product.getStatus());
        vo.setCreateTime(product.getCreateTime());
        vo.setUpdateTime(product.getUpdateTime());
        return vo;
    }
}
