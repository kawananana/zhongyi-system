package com.bencao.service.admin.impl;

import com.bencao.dto.admin.DashboardOverviewVO;
import com.bencao.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private static final Map<String, String> WIKI_CATEGORY_LABELS = Map.of(
            "acupuncture", "针灸",
            "thermosensitive_moxibustion", "热敏灸",
            "tuina", "推拿",
            "cupping", "拔罐",
            "diet", "药膳食疗",
            "exercise", "功法锻炼",
            "lifestyle", "起居养生",
            "recommend", "推荐"
    );

    private static final Map<String, String> MARKET_CATEGORY_LABELS = Map.of(
            "tea_therapy", "养生茶疗",
            "moxibustion", "艾灸艾柱",
            "skincare", "中医护肤",
            "books", "中医书籍",
            "food_medicine", "药食同源",
            "herbal_paste", "膏方系列",
            "physio_tools", "理疗工具",
            "foot_therapy", "养生足疗",
            "gift_box", "精品礼盒",
            "decoction", "滋补饮片"
    );

    private final JdbcTemplate jdbcTemplate;

    @Override
    public DashboardOverviewVO getOverview() {
        DashboardOverviewVO vo = new DashboardOverviewVO();
        vo.setContent(buildContent());
        vo.setUserBehavior(buildUserBehavior());
        vo.setModuleMetrics(buildModuleMetrics());
        vo.setLearning(buildLearning());
        vo.setTopHerbs(queryHerbRank());
        vo.setTopArticles(queryArticleRank("article"));
        vo.setTopCourses(queryArticleRank("course"));
        vo.setTopRecipes(queryRecipeRank());
        vo.setTopProducts(queryProductRank());
        vo.setWikiByCategory(queryCategoryCount("article"));
        vo.setCourseByCategory(queryCategoryCount("course"));
        vo.setProductByCategory(queryProductCategoryCount());
        return vo;
    }

    private DashboardOverviewVO.ContentStats buildContent() {
        DashboardOverviewVO.ContentStats s = new DashboardOverviewVO.ContentStats();
        s.setHerbCount(count("SELECT COUNT(*) FROM herb WHERE status=1"));
        s.setArticleCount(count("SELECT COUNT(*) FROM article WHERE status=1 AND content_kind='article'"));
        s.setCourseCount(count("SELECT COUNT(*) FROM article WHERE status=1 AND content_kind='course'"));
        s.setRecipeCount(count("SELECT COUNT(*) FROM recipe WHERE status=1"));
        s.setProductCount(count("SELECT COUNT(*) FROM product WHERE status=1"));
        s.setForumPostCount(count("SELECT COUNT(*) FROM forum_post WHERE status=1"));
        s.setForumPendingAudit(count("SELECT COUNT(*) FROM forum_post WHERE status=1 AND audit_status=0"));
        s.setAcupointCount(count("SELECT COUNT(*) FROM acupoint"));
        s.setHerbViews(longVal("SELECT COALESCE(SUM(view_count),0) FROM herb WHERE status=1"));
        s.setHerbCollects(longVal("SELECT COALESCE(SUM(collect_count),0) FROM herb WHERE status=1"));
        s.setArticleViews(longVal(
                "SELECT COALESCE(SUM(view_count),0) FROM article WHERE status=1 AND content_kind='article'"));
        s.setCourseViews(longVal(
                "SELECT COALESCE(SUM(view_count),0) FROM article WHERE status=1 AND content_kind='course'"));
        s.setRecipeViews(longVal("SELECT COALESCE(SUM(view_count),0) FROM recipe WHERE status=1"));
        s.setProductSales(longVal("SELECT COALESCE(SUM(sales_count),0) FROM product WHERE status=1"));
        return s;
    }

    private DashboardOverviewVO.UserBehaviorStats buildUserBehavior() {
        DashboardOverviewVO.UserBehaviorStats s = new DashboardOverviewVO.UserBehaviorStats();
        s.setTotalUsers(count("SELECT COUNT(*) FROM sys_user"));
        s.setNewUsers(count("SELECT COUNT(*) FROM sys_user WHERE create_time>=DATE_SUB(CURDATE(), INTERVAL 7 DAY)"));
        s.setActiveUsers(count("SELECT COUNT(*) FROM sys_user WHERE last_login_time>=DATE_SUB(CURDATE(), INTERVAL 30 DAY)"));
        s.setLowFreqUsers(Math.max(0, s.getTotalUsers() - s.getActiveUsers()));
        return s;
    }

    private List<DashboardOverviewVO.ModuleMetric> buildModuleMetrics() {
        List<DashboardOverviewVO.ModuleMetric> list = new ArrayList<>();
        list.add(metric("3D针灸",
                0,
                count("SELECT COUNT(*) FROM acupoint")));
        list.add(metric("本草图鉴",
                longVal("SELECT COALESCE(SUM(view_count),0) FROM herb WHERE status=1"),
                count("SELECT COUNT(*) FROM herb WHERE status=1")));
        list.add(metric("本草百科",
                longVal("SELECT COALESCE(SUM(view_count),0) FROM article WHERE status=1 AND content_kind='article'"),
                count("SELECT COUNT(*) FROM article WHERE status=1 AND content_kind='article'")));
        list.add(metric("百科课程",
                longVal("SELECT COALESCE(SUM(view_count),0) FROM article WHERE status=1 AND content_kind='course'"),
                count("SELECT COUNT(*) FROM article WHERE status=1 AND content_kind='course'")));
        list.add(metric("药膳食疗",
                longVal("SELECT COALESCE(SUM(view_count),0) FROM recipe WHERE status=1"),
                count("SELECT COUNT(*) FROM recipe WHERE status=1")));
        list.add(metric("本草市集",
                longVal("SELECT COALESCE(SUM(sales_count),0) FROM product WHERE status=1"),
                count("SELECT COUNT(*) FROM product WHERE status=1")));
        return list;
    }

    private DashboardOverviewVO.ModuleMetric metric(String module, long views, long items) {
        DashboardOverviewVO.ModuleMetric m = new DashboardOverviewVO.ModuleMetric();
        m.setModule(module);
        m.setViewCount(views);
        m.setItemCount(items);
        return m;
    }

    private DashboardOverviewVO.LearningStats buildLearning() {
        DashboardOverviewVO.LearningStats s = new DashboardOverviewVO.LearningStats();
        s.setQuizCount(safeCount("quiz_question", "status=1"));
        s.setFavoriteCount(count("SELECT COUNT(*) FROM user_herb_favorite"));
        s.setFavoriteUsers(count("SELECT COUNT(DISTINCT user_id) FROM user_herb_favorite"));
        return s;
    }

    private List<DashboardOverviewVO.ContentRank> queryHerbRank() {
        return jdbcTemplate.query(
                "SELECT id, herb_name AS title, view_count, collect_count AS extra_count "
                        + "FROM herb WHERE status=1 ORDER BY view_count DESC, collect_count DESC LIMIT 8",
                this::mapRankWithExtra);
    }

    private List<DashboardOverviewVO.ContentRank> queryArticleRank(String kind) {
        return jdbcTemplate.query(
                "SELECT id, title, view_count, NULL AS extra_count FROM article "
                        + "WHERE status=1 AND content_kind=? ORDER BY view_count DESC LIMIT 8",
                this::mapRankWithExtra,
                kind);
    }

    private List<DashboardOverviewVO.ContentRank> queryRecipeRank() {
        return jdbcTemplate.query(
                "SELECT id, recipe_name AS title, view_count, NULL AS extra_count "
                        + "FROM recipe WHERE status=1 ORDER BY view_count DESC LIMIT 8",
                this::mapRankWithExtra);
    }

    private List<DashboardOverviewVO.ContentRank> queryProductRank() {
        return jdbcTemplate.query(
                "SELECT id, product_name AS title, sales_count AS view_count, NULL AS extra_count "
                        + "FROM product WHERE status=1 ORDER BY sales_count DESC LIMIT 8",
                this::mapRankWithExtra);
    }

    private DashboardOverviewVO.ContentRank mapRankWithExtra(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        DashboardOverviewVO.ContentRank r = new DashboardOverviewVO.ContentRank();
        r.setId(rs.getLong("id"));
        r.setTitle(rs.getString("title"));
        r.setViewCount(rs.getLong("view_count"));
        long extra = rs.getLong("extra_count");
        if (!rs.wasNull()) {
            r.setExtraCount(extra);
        }
        return r;
    }

    private List<DashboardOverviewVO.CategoryCount> queryCategoryCount(String kind) {
        return jdbcTemplate.query(
                "SELECT category, COUNT(*) cnt FROM article WHERE status=1 AND content_kind=? "
                        + "GROUP BY category ORDER BY cnt DESC",
                (rs, i) -> {
                    String cat = rs.getString("category");
                    DashboardOverviewVO.CategoryCount c = new DashboardOverviewVO.CategoryCount();
                    c.setCategory(cat);
                    c.setLabel(WIKI_CATEGORY_LABELS.getOrDefault(cat, cat));
                    c.setCount(rs.getLong("cnt"));
                    return c;
                },
                kind);
    }

    private List<DashboardOverviewVO.CategoryCount> queryProductCategoryCount() {
        return jdbcTemplate.query(
                "SELECT category, COUNT(*) cnt FROM product WHERE status=1 GROUP BY category ORDER BY cnt DESC",
                (rs, i) -> {
                    String cat = rs.getString("category");
                    DashboardOverviewVO.CategoryCount c = new DashboardOverviewVO.CategoryCount();
                    c.setCategory(cat);
                    c.setLabel(MARKET_CATEGORY_LABELS.getOrDefault(cat, cat));
                    c.setCount(rs.getLong("cnt"));
                    return c;
                });
    }

    private long safeCount(String table, String where) {
        try {
            return count("SELECT COUNT(*) FROM " + table + " WHERE " + where);
        } catch (Exception ex) {
            return 0;
        }
    }

    private long longVal(String sql, Object... args) {
        Long v = jdbcTemplate.queryForObject(sql, Long.class, args);
        return v == null ? 0 : v;
    }

    private long count(String sql, Object... args) {
        return longVal(sql, args);
    }
}
