package com.bencao.controller;

import com.bencao.common.Result;
import com.bencao.dto.UserFavoriteItemVO;
import com.bencao.dto.UserFavoriteToggleRequest;
import com.bencao.dto.UserFavoriteToggleVO;
import com.bencao.security.UserContext;
import com.bencao.service.UserFavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/user/favorites")
@RequiredArgsConstructor
public class UserFavoriteController {

    private final UserFavoriteService userFavoriteService;

    @GetMapping("/herbs")
    public Result<List<UserFavoriteItemVO>> listHerbs() {
        long userId = UserContext.requireUserId();
        return Result.success(userFavoriteService.listHerbs(userId));
    }

    @GetMapping("/articles")
    public Result<List<UserFavoriteItemVO>> listArticles() {
        long userId = UserContext.requireUserId();
        return Result.success(userFavoriteService.listArticles(userId));
    }

    @GetMapping("/courses")
    public Result<List<UserFavoriteItemVO>> listCourses() {
        long userId = UserContext.requireUserId();
        return Result.success(userFavoriteService.listCourses(userId));
    }

    @GetMapping("/recipes")
    public Result<List<UserFavoriteItemVO>> listRecipes() {
        long userId = UserContext.requireUserId();
        return Result.success(userFavoriteService.listRecipes(userId));
    }

    @PostMapping("/toggle")
    public Result<UserFavoriteToggleVO> toggle(@Valid @RequestBody UserFavoriteToggleRequest request) {
        long userId = UserContext.requireUserId();
        return Result.success(userFavoriteService.toggle(userId, request.getType(), request.getId(), request.getAction()));
    }

    @GetMapping("/article-status")
    public Result<Map<Long, Boolean>> articleStatus(@RequestParam String ids) {
        long userId = UserContext.requireUserId();
        List<Long> idList = parseIds(ids);
        return Result.success(userFavoriteService.articleStatus(userId, idList));
    }

    @GetMapping("/recipe-status")
    public Result<Map<Long, Boolean>> recipeStatus(@RequestParam String ids) {
        long userId = UserContext.requireUserId();
        List<Long> idList = parseIds(ids);
        return Result.success(userFavoriteService.recipeStatus(userId, idList));
    }

    @GetMapping("/check")
    public Result<Boolean> check(@RequestParam String type, @RequestParam Long id) {
        long userId = UserContext.requireUserId();
        return Result.success(userFavoriteService.isCollected(userId, type, id));
    }

    private List<Long> parseIds(String ids) {
        if (!StringUtils.hasText(ids)) {
            return List.of();
        }
        return java.util.Arrays.stream(ids.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(Long::valueOf)
                .toList();
    }
}
