package com.bencao.service;

import com.bencao.dto.CreateMarketOrderRequest;
import com.bencao.dto.CreateOrderReturnRequest;
import com.bencao.dto.MarketOrderReturnVO;
import com.bencao.dto.MarketOrderVO;

import java.util.List;

public interface ShopOrderService {

    MarketOrderVO createOrder(long userId, CreateMarketOrderRequest request);

    List<MarketOrderVO> listUserOrders(long userId);

    MarketOrderVO getOrderDetail(long userId, Long orderId);

    MarketOrderReturnVO applyReturn(long userId, Long orderId, CreateOrderReturnRequest request);
}
