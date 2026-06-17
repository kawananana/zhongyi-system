package com.bencao.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.bencao.entity.Recipe;

public interface RecipeService extends IService<Recipe> {

    Page<Recipe> pageRecipes(long page, long pageSize, String category);

    Recipe getFeaturedRecipe();

    Recipe getRecipeDetail(Long id);
}
