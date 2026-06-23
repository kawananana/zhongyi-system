package com.bencao.controller.admin;

import com.bencao.common.PageResult;
import com.bencao.common.Result;
import com.bencao.dto.admin.ProductAdminVO;
import com.bencao.dto.admin.UpdateProductRequest;
import com.bencao.security.AdminContext;
import com.bencao.service.admin.AdminProductManageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductManageController {

    private final AdminProductManageService adminProductManageService;

    @GetMapping
    public Result<PageResult<ProductAdminVO>> page(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer status) {
        AdminContext.requireAdminId();
        return Result.success(adminProductManageService.pageProducts(page, pageSize, keyword, category, status));
    }

    @GetMapping("/{id}")
    public Result<ProductAdminVO> detail(@PathVariable Long id) {
        AdminContext.requireAdminId();
        return Result.success(adminProductManageService.getProduct(id));
    }

    @PutMapping("/{id}")
    public Result<ProductAdminVO> update(@PathVariable Long id,
                                         @Valid @RequestBody UpdateProductRequest request) {
        AdminContext.requireAdminId();
        return Result.success(adminProductManageService.updateProduct(id, request));
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam int status) {
        AdminContext.requireAdminId();
        adminProductManageService.updateStatus(id, status);
        return Result.success();
    }
}
