package com.bencao.controller;

import com.bencao.common.Result;
import com.bencao.mapper.RecipeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/recipes")
@RequiredArgsConstructor
public class RecipeAdminController {

    private final RecipeMapper recipeMapper;

    @DeleteMapping("/clear")
    public Result<Void> clearAll() {
        recipeMapper.delete(null);
        return Result.success();
    }
}
