package com.bencao.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.PageResult;
import com.bencao.common.Result;
import com.bencao.entity.Article;
import com.bencao.service.ArticleService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/atlas/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public Result<PageResult<Article>> page(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) long pageSize,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String contentKind) {
        Page<Article> articlePage = articleService.pageArticles(page, pageSize, type, category, contentKind);
        return Result.success(PageResult.of(
                articlePage.getRecords(),
                articlePage.getTotal(),
                articlePage.getCurrent(),
                articlePage.getSize()
        ));
    }

    @GetMapping("/{id}")
    public Result<Article> detail(@PathVariable Long id) {
        Article article = articleService.getById(id);
        if (article == null || article.getStatus() == null || article.getStatus() != 1) {
            return Result.fail(com.bencao.common.ResultCode.NOT_FOUND);
        }
        return Result.success(article);
    }
}
