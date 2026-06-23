package com.bencao.service;

import com.bencao.dto.UserFavoriteItemVO;
import com.bencao.dto.UserFavoriteToggleVO;

import java.util.List;
import java.util.Map;

public interface UserFavoriteService {

    List<UserFavoriteItemVO> listHerbs(long userId);

    List<UserFavoriteItemVO> listArticles(long userId);

    List<UserFavoriteItemVO> listCourses(long userId);

    List<UserFavoriteItemVO> listRecipes(long userId);

    UserFavoriteToggleVO toggle(long userId, String type, long id, String action);

    Map<Long, Boolean> articleStatus(long userId, List<Long> articleIds);

    Map<Long, Boolean> recipeStatus(long userId, List<Long> recipeIds);

    boolean isCollected(long userId, String type, long id);
}
