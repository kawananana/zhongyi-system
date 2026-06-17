package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bencao.entity.Article;
import com.bencao.mapper.ArticleMapper;
import com.bencao.service.ArticleService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ArticleServiceImpl extends ServiceImpl<ArticleMapper, Article> implements ArticleService {

    @Override
    public Page<Article> pageArticles(long page, long pageSize, String articleType,
                                      String category, String contentKind) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, 1);
        if (StringUtils.hasText(articleType)) {
            wrapper.eq(Article::getArticleType, articleType);
        }
        if (StringUtils.hasText(category) && !"all".equalsIgnoreCase(category)) {
            wrapper.eq(Article::getCategory, category);
        }
        if (StringUtils.hasText(contentKind)) {
            wrapper.eq(Article::getContentKind, contentKind);
        }
        wrapper.orderByDesc(Article::getViewCount);
        return page(new Page<>(page, pageSize), wrapper);
    }
}
