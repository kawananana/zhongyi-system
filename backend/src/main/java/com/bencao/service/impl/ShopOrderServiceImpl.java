package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.CreateMarketOrderItemRequest;
import com.bencao.dto.CreateMarketOrderRequest;
import com.bencao.dto.CreateOrderReturnRequest;
import com.bencao.dto.MarketOrderItemVO;
import com.bencao.dto.MarketOrderReturnVO;
import com.bencao.dto.MarketOrderVO;
import com.bencao.entity.OrderItem;
import com.bencao.entity.OrderReturnRequest;
import com.bencao.entity.Product;
import com.bencao.entity.ShopOrder;
import com.bencao.mapper.OrderItemMapper;
import com.bencao.mapper.OrderReturnRequestMapper;
import com.bencao.mapper.ProductMapper;
import com.bencao.mapper.ShopOrderMapper;
import com.bencao.service.ShopOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShopOrderServiceImpl implements ShopOrderService {

    private final ShopOrderMapper shopOrderMapper;
    private final OrderItemMapper orderItemMapper;
    private final OrderReturnRequestMapper orderReturnRequestMapper;
    private final ProductMapper productMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MarketOrderVO createOrder(long userId, CreateMarketOrderRequest request) {
        Map<Long, Integer> quantityByProduct = mergeQuantities(request.getItems());
        if (quantityByProduct.isEmpty()) {
            throw new BusinessException("订单商品不能为空");
        }

        List<Product> products = new ArrayList<>();
        for (Long productId : quantityByProduct.keySet()) {
            Product product = productMapper.selectById(productId);
            if (product == null || product.getStatus() == null || product.getStatus() != 1) {
                throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "商品不存在或已下架");
            }
            int qty = quantityByProduct.get(productId);
            int stock = product.getStock() == null ? 0 : product.getStock();
            if (stock < qty) {
                throw new BusinessException("商品库存不足：" + product.getProductName());
            }
            products.add(product);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Product product : products) {
            int qty = quantityByProduct.get(product.getId());
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(qty)));
        }

        ShopOrder order = new ShopOrder();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setTotalAmount(totalAmount);
        order.setPayType("mock");
        order.setPayStatus(1);
        order.setOrderStatus(0);
        order.setReceiverName(request.getReceiverName().trim());
        order.setReceiverPhone(request.getReceiverPhone().trim());
        order.setReceiverAddr(request.getReceiverAddr().trim());
        order.setPayTime(LocalDateTime.now());
        shopOrderMapper.insert(order);

        for (Product product : products) {
            int qty = quantityByProduct.get(product.getId());
            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setProductId(product.getId());
            item.setProductName(product.getProductName());
            item.setUnitPrice(product.getPrice());
            item.setQuantity(qty);
            orderItemMapper.insert(item);

            product.setStock((product.getStock() == null ? 0 : product.getStock()) - qty);
            product.setSalesCount((product.getSalesCount() == null ? 0 : product.getSalesCount()) + qty);
            productMapper.updateById(product);
        }

        return toVo(order, loadItems(order.getId()), products, null);
    }

    @Override
    public List<MarketOrderVO> listUserOrders(long userId) {
        List<ShopOrder> orders = shopOrderMapper.selectList(new LambdaQueryWrapper<ShopOrder>()
                .eq(ShopOrder::getUserId, userId)
                .orderByDesc(ShopOrder::getCreateTime));
        if (orders.isEmpty()) {
            return List.of();
        }
        List<Long> orderIds = orders.stream().map(ShopOrder::getId).toList();
        List<OrderItem> allItems = orderItemMapper.selectList(new LambdaQueryWrapper<OrderItem>()
                .in(OrderItem::getOrderId, orderIds));
        Map<Long, List<OrderItem>> itemsByOrder = allItems.stream()
                .collect(Collectors.groupingBy(OrderItem::getOrderId));
        Map<Long, Product> productMap = loadProductMap(allItems);
        Map<Long, OrderReturnRequest> returnMap = loadReturnMap(orderIds);

        List<MarketOrderVO> result = new ArrayList<>();
        for (ShopOrder order : orders) {
            result.add(toVo(order,
                    itemsByOrder.getOrDefault(order.getId(), List.of()),
                    productMap,
                    returnMap.get(order.getId())));
        }
        return result;
    }

    @Override
    public MarketOrderVO getOrderDetail(long userId, Long orderId) {
        ShopOrder order = shopOrderMapper.selectById(orderId);
        if (order == null || order.getUserId() == null || order.getUserId() != userId) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        List<OrderItem> items = loadItems(orderId);
        OrderReturnRequest returnRequest = orderReturnRequestMapper.selectOne(
                new LambdaQueryWrapper<OrderReturnRequest>().eq(OrderReturnRequest::getOrderId, orderId));
        return toVo(order, items, loadProductMap(items), returnRequest);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MarketOrderReturnVO applyReturn(long userId, Long orderId, CreateOrderReturnRequest request) {
        ShopOrder order = shopOrderMapper.selectById(orderId);
        if (order == null || order.getUserId() == null || order.getUserId() != userId) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        if (order.getPayStatus() == null || order.getPayStatus() != 1) {
            throw new BusinessException("当前订单不可申请退货");
        }
        if (order.getOrderStatus() != null && order.getOrderStatus() == 3) {
            throw new BusinessException("订单已取消");
        }

        OrderReturnRequest existing = orderReturnRequestMapper.selectOne(
                new LambdaQueryWrapper<OrderReturnRequest>().eq(OrderReturnRequest::getOrderId, orderId));
        if (existing != null) {
            if (existing.getStatus() != null && existing.getStatus() == 0) {
                throw new BusinessException("退货申请审核中，请耐心等待");
            }
            if (existing.getStatus() != null && existing.getStatus() == 1) {
                throw new BusinessException("退货已完成");
            }
            existing.setReason(request.getReason().trim());
            existing.setStatus(0);
            existing.setAdminRemark("");
            existing.setAuditTime(null);
            existing.setUpdateTime(LocalDateTime.now());
            orderReturnRequestMapper.updateById(existing);
            return toReturnVo(existing);
        }

        OrderReturnRequest returnRequest = new OrderReturnRequest();
        returnRequest.setOrderId(orderId);
        returnRequest.setUserId(userId);
        returnRequest.setReason(request.getReason().trim());
        returnRequest.setStatus(0);
        returnRequest.setAdminRemark("");
        orderReturnRequestMapper.insert(returnRequest);
        return toReturnVo(returnRequest);
    }

    private Map<Long, Integer> mergeQuantities(List<CreateMarketOrderItemRequest> items) {
        Map<Long, Integer> map = new LinkedHashMap<>();
        for (CreateMarketOrderItemRequest item : items) {
            map.merge(item.getProductId(), item.getQuantity(), Integer::sum);
        }
        return map;
    }

    private List<OrderItem> loadItems(Long orderId) {
        return orderItemMapper.selectList(new LambdaQueryWrapper<OrderItem>()
                .eq(OrderItem::getOrderId, orderId));
    }

    private Map<Long, Product> loadProductMap(List<OrderItem> items) {
        List<Long> productIds = items.stream().map(OrderItem::getProductId).distinct().toList();
        if (productIds.isEmpty()) {
            return Map.of();
        }
        return productMapper.selectBatchIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
    }

    private Map<Long, OrderReturnRequest> loadReturnMap(List<Long> orderIds) {
        if (orderIds.isEmpty()) {
            return Map.of();
        }
        return orderReturnRequestMapper.selectList(new LambdaQueryWrapper<OrderReturnRequest>()
                        .in(OrderReturnRequest::getOrderId, orderIds))
                .stream()
                .collect(Collectors.toMap(OrderReturnRequest::getOrderId, r -> r, (a, b) -> a));
    }

    private MarketOrderVO toVo(ShopOrder order, List<OrderItem> items, List<Product> products,
                               OrderReturnRequest returnRequest) {
        Map<Long, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        return toVo(order, items, productMap, returnRequest);
    }

    private MarketOrderVO toVo(ShopOrder order, List<OrderItem> items, Map<Long, Product> productMap,
                               OrderReturnRequest returnRequest) {
        MarketOrderVO vo = new MarketOrderVO();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setTotalAmount(order.getTotalAmount());
        vo.setOrderStatus(order.getOrderStatus());
        vo.setPayStatus(order.getPayStatus());
        vo.setCreateTime(order.getCreateTime());
        vo.setReceiverName(order.getReceiverName());
        vo.setReceiverPhone(order.getReceiverPhone());
        vo.setReceiverAddress(order.getReceiverAddr());
        vo.setItems(items.stream().map(item -> {
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
        }).toList());
        if (returnRequest != null) {
            vo.setReturnRequest(toReturnVo(returnRequest));
        }
        return vo;
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

    private String generateOrderNo() {
        String t = Long.toString(System.currentTimeMillis(), 36).toUpperCase();
        int r = (int) (Math.random() * 1000);
        return "BC" + t + String.format("%03d", r);
    }
}
