package com.bencao.controller.admin;

import com.bencao.common.PageResult;
import com.bencao.common.Result;
import com.bencao.dto.admin.HerbAdminVO;
import com.bencao.dto.admin.UpdateHerbRequest;
import com.bencao.security.AdminContext;
import com.bencao.service.admin.AdminHerbManageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/admin/herbs")
@RequiredArgsConstructor
public class AdminHerbManageController {

    private final AdminHerbManageService adminHerbManageService;

    @GetMapping
    public Result<PageResult<HerbAdminVO>> page(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String nature,
            @RequestParam(required = false) Integer status) {
        AdminContext.requireAdminId();
        return Result.success(adminHerbManageService.pageHerbs(page, pageSize, keyword, nature, status));
    }

    @GetMapping("/{id}")
    public Result<HerbAdminVO> detail(@PathVariable Long id) {
        AdminContext.requireAdminId();
        return Result.success(adminHerbManageService.getHerb(id));
    }

    @PutMapping("/{id}")
    public Result<HerbAdminVO> update(@PathVariable Long id, @Valid @RequestBody UpdateHerbRequest request) {
        AdminContext.requireAdminId();
        return Result.success(adminHerbManageService.updateHerb(id, request));
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam int status) {
        AdminContext.requireAdminId();
        adminHerbManageService.updateStatus(id, status);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        AdminContext.requireAdminId();
        adminHerbManageService.deleteHerb(id);
        return Result.success();
    }
}
