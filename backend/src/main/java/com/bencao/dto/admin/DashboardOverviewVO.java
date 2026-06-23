package com.bencao.dto.admin;

import lombok.Data;

import java.util.List;

@Data
public class DashboardOverviewVO {

    private ContentStats content;
    private UserBehaviorStats userBehavior;
    private List<ModuleMetric> moduleMetrics;
    private LearningStats learning;
    private List<ContentRank> topHerbs;
    private List<ContentRank> topArticles;
    private List<ContentRank> topCourses;
    private List<ContentRank> topRecipes;
    private List<ContentRank> topProducts;
    private List<CategoryCount> wikiByCategory;
    private List<CategoryCount> courseByCategory;
    private List<CategoryCount> productByCategory;

    @Data
    public static class ContentStats {
        private long herbCount;
        private long articleCount;
        private long courseCount;
        private long recipeCount;
        private long productCount;
        private long forumPostCount;
        private long forumPendingAudit;
        private long acupointCount;
        private long herbViews;
        private long herbCollects;
        private long articleViews;
        private long courseViews;
        private long recipeViews;
        private long productSales;
    }

    @Data
    public static class UserBehaviorStats {
        private long totalUsers;
        private long newUsers;
        private long activeUsers;
        private long lowFreqUsers;
    }

    @Data
    public static class LearningStats {
        private long quizCount;
        private long favoriteCount;
        private long favoriteUsers;
    }

    /** 各模块真实统计：浏览量 + 内容条数 */
    @Data
    public static class ModuleMetric {
        private String module;
        private long viewCount;
        private long itemCount;
    }

    @Data
    public static class ContentRank {
        private Long id;
        private String title;
        private long viewCount;
        private Long extraCount;
    }

    @Data
    public static class CategoryCount {
        private String category;
        private String label;
        private long count;
    }
}
