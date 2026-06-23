package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.MedicineBoxToggleVO;
import com.bencao.dto.UserFavoriteItemVO;
import com.bencao.dto.UserFavoriteToggleVO;
import com.bencao.entity.Article;
import com.bencao.entity.Herb;
import com.bencao.entity.Recipe;
import com.bencao.entity.UserArticleFavorite;
import com.bencao.entity.UserHerbFavorite;
import com.bencao.entity.UserRecipeFavorite;
import com.bencao.mapper.ArticleMapper;
import com.bencao.mapper.HerbMapper;
import com.bencao.mapper.RecipeMapper;
import com.bencao.mapper.UserArticleFavoriteMapper;
import com.bencao.mapper.UserHerbFavoriteMapper;
import com.bencao.mapper.UserRecipeFavoriteMapper;
import com.bencao.service.MedicineBoxService;
import com.bencao.service.UserFavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserFavoriteServiceImpl implements UserFavoriteService {

    private final UserHerbFavoriteMapper userHerbFavoriteMapper;
    private final UserArticleFavoriteMapper userArticleFavoriteMapper;
    private final UserRecipeFavoriteMapper userRecipeFavoriteMapper;
    private final HerbMapper herbMapper;
    private final ArticleMapper articleMapper;
    private final RecipeMapper recipeMapper;
    private final MedicineBoxService medicineBoxService;

    @Override
    public List<UserFavoriteItemVO> listHerbs(long userId) {
        List<UserHerbFavorite> rows = userHerbFavoriteMapper.selectList(
                new LambdaQueryWrapper<UserHerbFavorite>()
                        .eq(UserHerbFavorite::getUserId, userId)
                        .orderByDesc(UserHerbFavorite::getCreateTime));
        if (rows.isEmpty()) {
            return List.of();
        }
        List<Long> herbIds = rows.stream().map(UserHerbFavorite::getHerbId).toList();
        Map<Long, Herb> herbMap = herbMapper.selectBatchIds(herbIds).stream()
                .filter(h -> h.getStatus() != null && h.getStatus() == 1)
                .collect(Collectors.toMap(Herb::getId, h -> h));
        List<UserFavoriteItemVO> result = new ArrayList<>();
        for (UserHerbFavorite row : rows) {
            Herb herb = herbMap.get(row.getHerbId());
            if (herb == null) {
                continue;
            }
            UserFavoriteItemVO vo = new UserFavoriteItemVO();
            vo.setId(herb.getId());
            vo.setType("herb");
            vo.setTitle(herb.getHerbName());
            vo.setCoverImage(herb.getCoverImage());
            vo.setCategory(herb.getOriginProvinceName());
            vo.setSubtitle(herb.getAlias());
            vo.setFavoriteTime(row.getCreateTime());
            result.add(vo);
        }
        return result;
    }

    @Override
    public List<UserFavoriteItemVO> listArticles(long userId) {
        return listArticlesByKind(userId, "article");
    }

    @Override
    public List<UserFavoriteItemVO> listCourses(long userId) {
        return listArticlesByKind(userId, "course");
    }

    @Override
    public List<UserFavoriteItemVO> listRecipes(long userId) {
        List<UserRecipeFavorite> rows = userRecipeFavoriteMapper.selectList(
                new LambdaQueryWrapper<UserRecipeFavorite>()
                        .eq(UserRecipeFavorite::getUserId, userId)
                        .orderByDesc(UserRecipeFavorite::getCreateTime));
        if (rows.isEmpty()) {
            return List.of();
        }
        List<Long> recipeIds = rows.stream().map(UserRecipeFavorite::getRecipeId).toList();
        Map<Long, Recipe> recipeMap = recipeMapper.selectBatchIds(recipeIds).stream()
                .filter(r -> r.getStatus() != null && r.getStatus() == 1)
                .collect(Collectors.toMap(Recipe::getId, r -> r));
        List<UserFavoriteItemVO> result = new ArrayList<>();
        for (UserRecipeFavorite row : rows) {
            Recipe recipe = recipeMap.get(row.getRecipeId());
            if (recipe == null) {
                continue;
            }
            UserFavoriteItemVO vo = new UserFavoriteItemVO();
            vo.setId(recipe.getId());
            vo.setType("recipe");
            vo.setTitle(recipe.getRecipeName());
            vo.setCoverImage(recipe.getCoverImage());
            vo.setCategory(recipe.getCategory());
            vo.setSubtitle(recipe.getCookingTime());
            vo.setFavoriteTime(row.getCreateTime());
            result.add(vo);
        }
        return result;
    }

    private List<UserFavoriteItemVO> listArticlesByKind(long userId, String contentKind) {
        List<UserArticleFavorite> rows = userArticleFavoriteMapper.selectList(
                new LambdaQueryWrapper<UserArticleFavorite>()
                        .eq(UserArticleFavorite::getUserId, userId)
                        .orderByDesc(UserArticleFavorite::getCreateTime));
        if (rows.isEmpty()) {
            return List.of();
        }
        List<Long> articleIds = rows.stream().map(UserArticleFavorite::getArticleId).toList();
        Map<Long, Article> articleMap = articleMapper.selectBatchIds(articleIds).stream()
                .filter(a -> a.getStatus() != null && a.getStatus() == 1)
                .filter(a -> contentKind.equalsIgnoreCase(a.getContentKind()))
                .collect(Collectors.toMap(Article::getId, a -> a));
        List<UserFavoriteItemVO> result = new ArrayList<>();
        for (UserArticleFavorite row : rows) {
            Article article = articleMap.get(row.getArticleId());
            if (article == null) {
                continue;
            }
            UserFavoriteItemVO vo = new UserFavoriteItemVO();
            vo.setId(article.getId());
            vo.setType(contentKind);
            vo.setTitle(article.getTitle());
            vo.setCoverImage(article.getCoverImage());
            vo.setCategory(article.getCategory());
            vo.setSubtitle(article.getAuthor());
            vo.setFavoriteTime(row.getCreateTime());
            result.add(vo);
        }
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserFavoriteToggleVO toggle(long userId, String type, long id, String action) {
        if (!StringUtils.hasText(type) || !StringUtils.hasText(action)) {
            throw new BusinessException(ResultCode.BAD_REQUEST);
        }
        String normalized = type.trim().toLowerCase();
        if ("herb".equals(normalized)) {
            MedicineBoxToggleVO res = medicineBoxService.toggle(userId, id, action);
            return new UserFavoriteToggleVO(res.isCollected());
        }
        if ("article".equals(normalized) || "course".equals(normalized)) {
            return toggleArticleFavorite(userId, id, action, normalized);
        }
        if ("recipe".equals(normalized)) {
            return toggleRecipeFavorite(userId, id, action);
        }
        throw new BusinessException(ResultCode.BAD_REQUEST.getCode(), "不支持的收藏类型");
    }

    private UserFavoriteToggleVO toggleRecipeFavorite(long userId, long recipeId, String action) {
        Recipe recipe = recipeMapper.selectById(recipeId);
        if (recipe == null || recipe.getStatus() == null || recipe.getStatus() != 1) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "药膳不存在或已下架");
        }

        UserRecipeFavorite existing = userRecipeFavoriteMapper.selectOne(
                new LambdaQueryWrapper<UserRecipeFavorite>()
                        .eq(UserRecipeFavorite::getUserId, userId)
                        .eq(UserRecipeFavorite::getRecipeId, recipeId));

        if ("add".equalsIgnoreCase(action)) {
            if (existing == null) {
                UserRecipeFavorite row = new UserRecipeFavorite();
                row.setUserId(userId);
                row.setRecipeId(recipeId);
                userRecipeFavoriteMapper.insert(row);
            }
            return new UserFavoriteToggleVO(true);
        }
        if ("remove".equalsIgnoreCase(action)) {
            if (existing != null) {
                userRecipeFavoriteMapper.deleteById(existing.getId());
            }
            return new UserFavoriteToggleVO(false);
        }
        throw new BusinessException(ResultCode.BAD_REQUEST.getCode(), "action 须为 add 或 remove");
    }

    private UserFavoriteToggleVO toggleArticleFavorite(long userId, long articleId, String action, String expectedKind) {
        Article article = articleMapper.selectById(articleId);
        if (article == null || article.getStatus() == null || article.getStatus() != 1) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "内容不存在或已下架");
        }
        if (!expectedKind.equalsIgnoreCase(article.getContentKind())) {
            throw new BusinessException(ResultCode.BAD_REQUEST.getCode(), "收藏类型与内容不匹配");
        }

        UserArticleFavorite existing = userArticleFavoriteMapper.selectOne(
                new LambdaQueryWrapper<UserArticleFavorite>()
                        .eq(UserArticleFavorite::getUserId, userId)
                        .eq(UserArticleFavorite::getArticleId, articleId));

        if ("add".equalsIgnoreCase(action)) {
            if (existing == null) {
                UserArticleFavorite row = new UserArticleFavorite();
                row.setUserId(userId);
                row.setArticleId(articleId);
                userArticleFavoriteMapper.insert(row);
            }
            return new UserFavoriteToggleVO(true);
        }
        if ("remove".equalsIgnoreCase(action)) {
            if (existing != null) {
                userArticleFavoriteMapper.deleteById(existing.getId());
            }
            return new UserFavoriteToggleVO(false);
        }
        throw new BusinessException(ResultCode.BAD_REQUEST.getCode(), "action 须为 add 或 remove");
    }

    @Override
    public Map<Long, Boolean> articleStatus(long userId, List<Long> articleIds) {
        if (articleIds == null || articleIds.isEmpty()) {
            return Map.of();
        }
        List<UserArticleFavorite> rows = userArticleFavoriteMapper.selectList(
                new LambdaQueryWrapper<UserArticleFavorite>()
                        .eq(UserArticleFavorite::getUserId, userId)
                        .in(UserArticleFavorite::getArticleId, articleIds));
        Set<Long> collected = rows.stream().map(UserArticleFavorite::getArticleId).collect(Collectors.toSet());
        Map<Long, Boolean> map = new HashMap<>();
        for (Long id : articleIds) {
            map.put(id, collected.contains(id));
        }
        return map;
    }

    @Override
    public Map<Long, Boolean> recipeStatus(long userId, List<Long> recipeIds) {
        if (recipeIds == null || recipeIds.isEmpty()) {
            return Map.of();
        }
        List<UserRecipeFavorite> rows = userRecipeFavoriteMapper.selectList(
                new LambdaQueryWrapper<UserRecipeFavorite>()
                        .eq(UserRecipeFavorite::getUserId, userId)
                        .in(UserRecipeFavorite::getRecipeId, recipeIds));
        Set<Long> collected = rows.stream().map(UserRecipeFavorite::getRecipeId).collect(Collectors.toSet());
        Map<Long, Boolean> map = new HashMap<>();
        for (Long id : recipeIds) {
            map.put(id, collected.contains(id));
        }
        return map;
    }

    @Override
    public boolean isCollected(long userId, String type, long id) {
        String normalized = type == null ? "" : type.trim().toLowerCase();
        if ("herb".equals(normalized)) {
            Long count = userHerbFavoriteMapper.selectCount(
                    new LambdaQueryWrapper<UserHerbFavorite>()
                            .eq(UserHerbFavorite::getUserId, userId)
                            .eq(UserHerbFavorite::getHerbId, id));
            return count != null && count > 0;
        }
        if ("article".equals(normalized) || "course".equals(normalized)) {
            Article article = articleMapper.selectById(id);
            if (article == null || !normalized.equalsIgnoreCase(article.getContentKind())) {
                return false;
            }
            Long count = userArticleFavoriteMapper.selectCount(
                    new LambdaQueryWrapper<UserArticleFavorite>()
                            .eq(UserArticleFavorite::getUserId, userId)
                            .eq(UserArticleFavorite::getArticleId, id));
            return count != null && count > 0;
        }
        if ("recipe".equals(normalized)) {
            Long count = userRecipeFavoriteMapper.selectCount(
                    new LambdaQueryWrapper<UserRecipeFavorite>()
                            .eq(UserRecipeFavorite::getUserId, userId)
                            .eq(UserRecipeFavorite::getRecipeId, id));
            return count != null && count > 0;
        }
        return false;
    }
}
