package com.bencao.controller.admin;

import com.bencao.common.PageResult;
import com.bencao.common.Result;
import com.bencao.dto.admin.OrderReturnAdminVO;
import com.bencao.security.AdminContext;
import com.bencao.service.admin.AdminOrderReturnService;
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
@RequestMapping("/api/v1/admin/order-returns")
@RequiredArgsConstructor
public class AdminOrderReturnController {

    private final AdminOrderReturnService adminOrderReturnService;

    @GetMapping
    public Result<PageResult<OrderReturnAdminVO>> page(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        AdminContext.requireAdminId();
        return Result.success(adminOrderReturnService.pageReturns(page, pageSize, keyword, status));
    }

    @PutMapping("/{id}/approve")
    public Result<Void> approve(@PathVariable Long id,
                                @RequestParam(required = false) String adminRemark) {
        AdminContext.requireAdminId();
        adminOrderReturnService.approve(id, adminRemark);
        return Result.success();
    }

    @PutMapping("/{id}/reject")
    public Result<Void> reject(@PathVariable Long id, @RequestParam String adminRemark) {
        AdminContext.requireAdminId();
        adminOrderReturnService.reject(id, adminRemark);
        return Result.success();
    }
}
