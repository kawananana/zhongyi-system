package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.entity.Recipe;
import com.bencao.mapper.RecipeMapper;
import com.bencao.service.RecipeService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class RecipeServiceImpl extends ServiceImpl<RecipeMapper, Recipe> implements RecipeService {

    @Override
    public Page<Recipe> pageRecipes(long page, long pageSize, String category) {
        LambdaQueryWrapper<Recipe> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Recipe::getStatus, 1);
        if (StringUtils.hasText(category) && !"all".equalsIgnoreCase(category)) {
            wrapper.eq(Recipe::getCategory, category);
        }
        wrapper.orderByDesc(Recipe::getViewCount);
        return page(new Page<>(page, pageSize), wrapper);
    }

    @Override
    public Recipe getFeaturedRecipe() {
        Recipe featured = getOne(new LambdaQueryWrapper<Recipe>()
                .eq(Recipe::getStatus, 1)
                .eq(Recipe::getIsFeatured, 1)
                .orderByDesc(Recipe::getViewCount)
                .last("LIMIT 1"));
        if (featured != null) {
            return featured;
        }
        return getOne(new LambdaQueryWrapper<Recipe>()
                .eq(Recipe::getStatus, 1)
                .orderByDesc(Recipe::getViewCount)
                .last("LIMIT 1"));
    }

    @Override
    public Recipe getRecipeDetail(Long id) {
        Recipe recipe = getById(id);
        if (recipe == null || recipe.getStatus() == null || recipe.getStatus() != 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return recipe;
    }
}
