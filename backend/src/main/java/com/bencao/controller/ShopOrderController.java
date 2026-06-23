package com.bencao.controller;

import com.bencao.common.Result;
import com.bencao.dto.CreateMarketOrderRequest;
import com.bencao.dto.CreateOrderReturnRequest;
import com.bencao.dto.MarketOrderReturnVO;
import com.bencao.dto.MarketOrderVO;
import com.bencao.security.UserContext;
import com.bencao.service.ShopOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market/orders")
@RequiredArgsConstructor
public class ShopOrderController {

    private final ShopOrderService shopOrderService;

    @PostMapping
    public Result<MarketOrderVO> create(@Valid @RequestBody CreateMarketOrderRequest request) {
        long userId = UserContext.requireUserId();
        return Result.success(shopOrderService.createOrder(userId, request));
    }

    @GetMapping
    public Result<List<MarketOrderVO>> list() {
        long userId = UserContext.requireUserId();
        return Result.success(shopOrderService.listUserOrders(userId));
    }

    @GetMapping("/{id}")
    public Result<MarketOrderVO> detail(@PathVariable Long id) {
        long userId = UserContext.requireUserId();
        return Result.success(shopOrderService.getOrderDetail(userId, id));
    }

    @PostMapping("/{id}/returns")
    public Result<MarketOrderReturnVO> applyReturn(
            @PathVariable Long id,
            @Valid @RequestBody CreateOrderReturnRequest request) {
        long userId = UserContext.requireUserId();
        return Result.success(shopOrderService.applyReturn(userId, id, request));
    }
}
