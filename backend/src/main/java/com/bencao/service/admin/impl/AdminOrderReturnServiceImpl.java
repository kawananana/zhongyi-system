package com.bencao.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.PageResult;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.admin.OrderReturnAdminVO;
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
import com.bencao.service.admin.AdminOrderReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminOrderReturnServiceImpl implements AdminOrderReturnService {

    private final OrderReturnRequestMapper orderReturnRequestMapper;
    private final ShopOrderMapper shopOrderMapper;
    private final SysUserMapper sysUserMapper;
    private final OrderItemMapper orderItemMapper;
    private final ProductMapper productMapper;

    @Override
    public PageResult<OrderReturnAdminVO> pageReturns(long page, long pageSize, String keyword, Integer status) {
        LambdaQueryWrapper<OrderReturnRequest> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(OrderReturnRequest::getStatus, status);
        }
        if (StringUtils.hasText(keyword)) {
            String k = keyword.trim();
            Set<Long> orderIds = shopOrderMapper.selectList(new LambdaQueryWrapper<ShopOrder>()
                            .like(ShopOrder::getOrderNo, k))
                    .stream().map(ShopOrder::getId).collect(Collectors.toSet());
            Set<Long> userIds = sysUserMapper.selectList(new LambdaQueryWrapper<SysUser>()
                            .and(w -> w.like(SysUser::getNickname, k).or().like(SysUser::getPhone, k)))
                    .stream().map(SysUser::getId).collect(Collectors.toSet());
            wrapper.and(w -> {
                w.like(OrderReturnRequest::getReason, k);
                if (!orderIds.isEmpty()) {
                    w.or().in(OrderReturnRequest::getOrderId, orderIds);
                }
                if (!userIds.isEmpty()) {
                    w.or().in(OrderReturnRequest::getUserId, userIds);
                }
            });
        }
        wrapper.orderByDesc(OrderReturnRequest::getCreateTime);
        Page<OrderReturnRequest> returnPage = orderReturnRequestMapper.selectPage(new Page<>(page, pageSize), wrapper);
        List<OrderReturnRequest> records = returnPage.getRecords();
        if (records.isEmpty()) {
            return PageResult.of(List.of(), returnPage.getTotal(), returnPage.getCurrent(), returnPage.getSize());
        }

        Set<Long> orderIds = records.stream().map(OrderReturnRequest::getOrderId).collect(Collectors.toSet());
        Map<Long, ShopOrder> orderMap = shopOrderMapper.selectBatchIds(orderIds).stream()
                .collect(Collectors.toMap(ShopOrder::getId, o -> o));
        Set<Long> userIds = records.stream().map(OrderReturnRequest::getUserId).collect(Collectors.toSet());
        Map<Long, SysUser> userMap = sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, u -> u));

        List<OrderReturnAdminVO> list = records.stream()
                .map(record -> toVo(record, orderMap.get(record.getOrderId()), userMap.get(record.getUserId())))
                .toList();
        return PageResult.of(list, returnPage.getTotal(), returnPage.getCurrent(), returnPage.getSize());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approve(Long id, String adminRemark) {
        OrderReturnRequest request = requirePending(id);
        ShopOrder order = requireOrder(request.getOrderId());
        if (order.getPayStatus() == null || order.getPayStatus() != 1) {
            throw new BusinessException("订单状态已变更，无法同意退货");
        }

        request.setStatus(1);
        request.setAdminRemark(StringUtils.hasText(adminRemark) ? adminRemark.trim() : "已同意退货退款");
        request.setAuditTime(LocalDateTime.now());
        orderReturnRequestMapper.updateById(request);

        order.setPayStatus(2);
        order.setOrderStatus(3);
        order.setFinishTime(LocalDateTime.now());
        shopOrderMapper.updateById(order);

        restoreStock(order.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reject(Long id, String adminRemark) {
        OrderReturnRequest request = requirePending(id);
        if (!StringUtils.hasText(adminRemark)) {
            throw new BusinessException("请填写拒绝原因");
        }
        request.setStatus(2);
        request.setAdminRemark(adminRemark.trim());
        request.setAuditTime(LocalDateTime.now());
        orderReturnRequestMapper.updateById(request);
    }

    private OrderReturnRequest requirePending(Long id) {
        OrderReturnRequest request = orderReturnRequestMapper.selectById(id);
        if (request == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        if (request.getStatus() == null || request.getStatus() != 0) {
            throw new BusinessException("该申请已处理");
        }
        return request;
    }

    private ShopOrder requireOrder(Long orderId) {
        ShopOrder order = shopOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "关联订单不存在");
        }
        return order;
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

    private OrderReturnAdminVO toVo(OrderReturnRequest request, ShopOrder order, SysUser user) {
        OrderReturnAdminVO vo = new OrderReturnAdminVO();
        vo.setId(request.getId());
        vo.setOrderId(request.getOrderId());
        vo.setUserId(request.getUserId());
        vo.setReason(request.getReason());
        vo.setStatus(request.getStatus());
        vo.setAdminRemark(request.getAdminRemark());
        vo.setCreateTime(request.getCreateTime());
        vo.setAuditTime(request.getAuditTime());
        if (order != null) {
            vo.setOrderNo(order.getOrderNo());
            vo.setTotalAmount(order.getTotalAmount());
            vo.setOrderStatus(order.getOrderStatus());
            vo.setPayStatus(order.getPayStatus());
            vo.setReceiverName(order.getReceiverName());
            vo.setReceiverPhone(order.getReceiverPhone());
            vo.setReceiverAddress(order.getReceiverAddr());
        }
        if (user != null) {
            vo.setUserNickname(user.getNickname());
            vo.setUserPhone(user.getPhone());
        }
        return vo;
    }
}
