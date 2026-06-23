package com.bencao.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.PageResult;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.MarketOrderItemVO;
import com.bencao.dto.MarketOrderReturnVO;
import com.bencao.dto.admin.ShopOrderAdminVO;
import com.bencao.entity.OrderItem;
import com.bencao.entity.OrderReturnRequest;
import com.bencao.entity.Product;
import com.bencao.entity.ShopOrder;
import com.bencao.entity.SysUser;
import com.bencao.mapper.OrderItemMapper;
import com.bencao.mapper.OrderReturnRequestMapper;
import com.bencao.mapper.ProductMapper;
import com.bencao.mapper.ShopOrderMapper;
import com.bencao.mapper.SysUserMapper;
import com.bencao.service.admin.AdminOrderManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminOrderManageServiceImpl implements AdminOrderManageService {

    private final ShopOrderMapper shopOrderMapper;
    private final OrderItemMapper orderItemMapper;
    private final OrderReturnRequestMapper orderReturnRequestMapper;
    private final ProductMapper productMapper;
    private final SysUserMapper sysUserMapper;

    @Override
    public PageResult<ShopOrderAdminVO> pageOrders(long page, long pageSize, String keyword,
                                                   Integer orderStatus, Integer payStatus) {
        LambdaQueryWrapper<ShopOrder> wrapper = new LambdaQueryWrapper<>();
        if (orderStatus != null) {
            wrapper.eq(ShopOrder::getOrderStatus, orderStatus);
        }
        if (payStatus != null) {
            wrapper.eq(ShopOrder::getPayStatus, payStatus);
        }
        if (StringUtils.hasText(keyword)) {
            String k = keyword.trim();
            Set<Long> userIds = sysUserMapper.selectList(new LambdaQueryWrapper<SysUser>()
                            .and(w -> w.like(SysUser::getNickname, k).or().like(SysUser::getPhone, k)))
                    .stream().map(SysUser::getId).collect(Collectors.toSet());
            wrapper.and(w -> {
                w.like(ShopOrder::getOrderNo, k)
                        .or().like(ShopOrder::getReceiverName, k)
                        .or().like(ShopOrder::getReceiverPhone, k);
                if (!userIds.isEmpty()) {
                    w.or().in(ShopOrder::getUserId, userIds);
                }
            });
        }
        wrapper.orderByDesc(ShopOrder::getCreateTime);
        Page<ShopOrder> orderPage = shopOrderMapper.selectPage(new Page<>(page, pageSize), wrapper);
        List<ShopOrder> records = orderPage.getRecords();
        if (records.isEmpty()) {
            return PageResult.of(List.of(), orderPage.getTotal(), orderPage.getCurrent(), orderPage.getSize());
        }
        return PageResult.of(buildVoList(records), orderPage.getTotal(), orderPage.getCurrent(), orderPage.getSize());
    }

    @Override
    public ShopOrderAdminVO getOrderDetail(Long id) {
        ShopOrder order = shopOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        List<ShopOrderAdminVO> list = buildVoList(List.of(order));
        return list.get(0);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ShopOrderAdminVO updateStatus(Long id, Integer orderStatus, Integer payStatus) {
        ShopOrder order = shopOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        if (orderStatus == null && payStatus == null) {
            throw new BusinessException("请指定要更新的状态");
        }

        int oldPayStatus = order.getPayStatus() == null ? 0 : order.getPayStatus();
        int newOrderStatus = orderStatus != null ? orderStatus : (order.getOrderStatus() == null ? 0 : order.getOrderStatus());
        int newPayStatus = payStatus != null ? payStatus : oldPayStatus;

        if (newOrderStatus < 0 || newOrderStatus > 3) {
            throw new BusinessException("订单状态无效");
        }
        if (newPayStatus < 0 || newPayStatus > 2) {
            throw new BusinessException("支付状态无效");
        }

        if (newPayStatus == 2 && oldPayStatus != 2) {
            restoreStock(order.getId());
            newOrderStatus = 3;
            order.setFinishTime(LocalDateTime.now());
        }
        if (newOrderStatus == 2 && (order.getOrderStatus() == null || order.getOrderStatus() != 2)) {
            order.setFinishTime(LocalDateTime.now());
        }

        order.setOrderStatus(newOrderStatus);
        order.setPayStatus(newPayStatus);
        shopOrderMapper.updateById(order);
        return getOrderDetail(id);
    }

    private void restoreStock(Long orderId) {
        List<OrderItem> items = orderItemMapper.selectList(new LambdaQueryWrapper<OrderItem>()
                .eq(OrderItem::getOrderId, orderId));
        for (OrderItem item : items) {
            Product product = productMapper.selectById(item.getProductId());
            if (product == null) {
                continue;
            }
            int qty = item.getQuantity() == null ? 0 : item.getQuantity();
            product.setStock((product.getStock() == null ? 0 : product.getStock()) + qty);
            int sales = product.getSalesCount() == null ? 0 : product.getSalesCount();
            product.setSalesCount(Math.max(0, sales - qty));
            productMapper.updateById(product);
        }
    }

    private List<ShopOrderAdminVO> buildVoList(List<ShopOrder> orders) {
        List<Long> orderIds = orders.stream().map(ShopOrder::getId).toList();
        List<OrderItem> allItems = orderItemMapper.selectList(new LambdaQueryWrapper<OrderItem>()
                .in(OrderItem::getOrderId, orderIds));
        Map<Long, List<OrderItem>> itemsByOrder = allItems.stream()
                .collect(Collectors.groupingBy(OrderItem::getOrderId));
        Map<Long, Product> productMap = loadProductMap(allItems);
        Map<Long, OrderReturnRequest> returnMap = orderReturnRequestMapper.selectList(
                        new LambdaQueryWrapper<OrderReturnRequest>().in(OrderReturnRequest::getOrderId, orderIds))
                .stream()
                .collect(Collectors.toMap(OrderReturnRequest::getOrderId, r -> r, (a, b) -> a));
        Set<Long> userIds = orders.stream().map(ShopOrder::getUserId).collect(Collectors.toSet());
        Map<Long, SysUser> userMap = userIds.isEmpty() ? Map.of()
                : sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, u -> u));

        List<ShopOrderAdminVO> result = new ArrayList<>();
        for (ShopOrder order : orders) {
            SysUser user = userMap.get(order.getUserId());
            ShopOrderAdminVO vo = new ShopOrderAdminVO();
            vo.setId(order.getId());
            vo.setOrderNo(order.getOrderNo());
            vo.setUserId(order.getUserId());
            if (user != null) {
                vo.setUserNickname(user.getNickname());
                vo.setUserPhone(user.getPhone());
            }
            vo.setTotalAmount(order.getTotalAmount());
            vo.setOrderStatus(order.getOrderStatus());
            vo.setPayStatus(order.getPayStatus());
            vo.setReceiverName(order.getReceiverName());
            vo.setReceiverPhone(order.getReceiverPhone());
            vo.setReceiverAddress(order.getReceiverAddr());
            vo.setCreateTime(order.getCreateTime());
            vo.setPayTime(order.getPayTime());
            vo.setItems(mapItems(itemsByOrder.getOrDefault(order.getId(), List.of()), productMap));
            OrderReturnRequest returnRequest = returnMap.get(order.getId());
            if (returnRequest != null) {
                vo.setReturnRequest(toReturnVo(returnRequest));
            }
            result.add(vo);
        }
        return result;
    }

    private List<MarketOrderItemVO> mapItems(List<OrderItem> items, Map<Long, Product> productMap) {
        return items.stream().map(item -> {
            MarketOrderItemVO line = new MarketOrderItemVO();
            line.setProductId(item.getProductId());
            line.setProductName(item.getProductName());
            line.setUnitPrice(item.getUnitPrice());
            line.setQuantity(item.getQuantity());
            Product product = productMap.get(item.getProductId());
            if (product != null) {
                line.setCategory(product.getCategory());
            }
            return line;
        }).toList();
    }

    private Map<Long, Product> loadProductMap(List<OrderItem> items) {
        List<Long> productIds = items.stream().map(OrderItem::getProductId).distinct().toList();
        if (productIds.isEmpty()) {
            return Map.of();
        }
        return productMapper.selectBatchIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
    }

    private MarketOrderReturnVO toReturnVo(OrderReturnRequest request) {
        MarketOrderReturnVO vo = new MarketOrderReturnVO();
        vo.setId(request.getId());
        vo.setStatus(request.getStatus());
        vo.setReason(request.getReason());
        vo.setAdminRemark(request.getAdminRemark());
        vo.setCreateTime(request.getCreateTime());
        vo.setAuditTime(request.getAuditTime());
        return vo;
    }
}
