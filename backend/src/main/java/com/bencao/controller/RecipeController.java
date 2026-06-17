package com.bencao.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.PageResult;
import com.bencao.common.Result;
import com.bencao.entity.Recipe;
import com.bencao.service.RecipeService;
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
@RequestMapping("/api/v1/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping("/featured")
    public Result<Recipe> featured() {
        return Result.success(recipeService.getFeaturedRecipe());
    }

    @GetMapping
    public Result<PageResult<Recipe>> page(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "9") @Min(1) @Max(50) long pageSize,
            @RequestParam(required = false) String category) {
        Page<Recipe> recipePage = recipeService.pageRecipes(page, pageSize, category);
        return Result.success(PageResult.of(
                recipePage.getRecords(),
                recipePage.getTotal(),
                recipePage.getCurrent(),
                recipePage.getSize()
        ));
    }

    @GetMapping("/{id}")
    public Result<Recipe> detail(@PathVariable Long id) {
        return Result.success(recipeService.getRecipeDetail(id));
    }
}
