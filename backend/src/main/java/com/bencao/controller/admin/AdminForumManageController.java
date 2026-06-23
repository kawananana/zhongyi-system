package com.bencao.controller.admin;

import com.bencao.common.PageResult;
import com.bencao.common.Result;
import com.bencao.dto.admin.ForumPostAdminVO;
import com.bencao.security.AdminContext;
import com.bencao.service.admin.AdminForumManageService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/admin/forum/posts")
@RequiredArgsConstructor
public class AdminForumManageController {

    private final AdminForumManageService adminForumManageService;

    @GetMapping
    public Result<PageResult<ForumPostAdminVO>> page(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer auditStatus,
            @RequestParam(required = false) Integer status) {
        AdminContext.requireAdminId();
        return Result.success(adminForumManageService.pagePosts(
                page, pageSize, keyword, category, auditStatus, status));
    }

    @PutMapping("/{id}/audit")
    public Result<Void> updateAudit(@PathVariable Long id, @RequestParam int auditStatus) {
        AdminContext.requireAdminId();
        adminForumManageService.updateAuditStatus(id, auditStatus);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam int status) {
        AdminContext.requireAdminId();
        adminForumManageService.updateStatus(id, status);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        AdminContext.requireAdminId();
        adminForumManageService.deletePost(id);
        return Result.success();
    }
}
