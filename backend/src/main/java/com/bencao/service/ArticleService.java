package com.bencao.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.bencao.entity.Article;

public interface ArticleService extends IService<Article> {

    Page<Article> pageArticles(long page, long pageSize, String articleType,
                             String category, String contentKind);

    Article getArticleDetail(Long id);
}
