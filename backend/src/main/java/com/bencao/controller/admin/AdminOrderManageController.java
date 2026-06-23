package com.bencao.controller.admin;

import com.bencao.common.PageResult;
import com.bencao.common.Result;
import com.bencao.dto.admin.ShopOrderAdminVO;
import com.bencao.security.AdminContext;
import com.bencao.service.admin.AdminOrderManageService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderManageController {

    private final AdminOrderManageService adminOrderManageService;

    @GetMapping
    public Result<PageResult<ShopOrderAdminVO>> page(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(required = false) Integer payStatus) {
        AdminContext.requireAdminId();
        return Result.success(adminOrderManageService.pageOrders(page, pageSize, keyword, orderStatus, payStatus));
    }

    @GetMapping("/{id}")
    public Result<ShopOrderAdminVO> detail(@PathVariable Long id) {
        AdminContext.requireAdminId();
        return Result.success(adminOrderManageService.getOrderDetail(id));
    }

    @PutMapping("/{id}/status")
    public Result<ShopOrderAdminVO> updateStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(required = false) Integer payStatus) {
        AdminContext.requireAdminId();
        return Result.success(adminOrderManageService.updateStatus(id, orderStatus, payStatus));
    }
}
