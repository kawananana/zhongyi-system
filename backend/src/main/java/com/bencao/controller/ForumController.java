package com.bencao.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.PageResult;
import com.bencao.common.Result;
import com.bencao.dto.CreateForumPostRequest;
import com.bencao.dto.ForumPostVO;
import com.bencao.dto.ShareHerbRequest;
import com.bencao.security.UserContext;
import com.bencao.service.ForumService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/posts")
    public Result<PageResult<ForumPostVO>> listPosts(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) long pageSize,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        Page<ForumPostVO> postPage = forumService.listPosts(page, pageSize, category, keyword);
        return Result.success(PageResult.of(
                postPage.getRecords(),
                postPage.getTotal(),
                postPage.getCurrent(),
                postPage.getSize()
        ));
    }

    @PostMapping("/posts")
    public Result<ForumPostVO> createPost(@Valid @RequestBody CreateForumPostRequest request) {
        long userId = UserContext.requireUserId();
        return Result.success(forumService.createPost(userId, request));
    }

    @PostMapping("/share/herb")
    public Result<ForumPostVO> shareHerb(@Valid @RequestBody ShareHerbRequest request) {
        long userId = UserContext.requireUserId();
        return Result.success(forumService.shareHerb(userId, request));
    }
}
