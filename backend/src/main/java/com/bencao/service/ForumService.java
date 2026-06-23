package com.bencao.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.dto.CreateForumPostRequest;
import com.bencao.dto.ForumPostVO;
import com.bencao.dto.ShareHerbRequest;

public interface ForumService {

    Page<ForumPostVO> listPosts(long page, long pageSize, String category, String keyword);

    ForumPostVO createPost(long userId, CreateForumPostRequest request);

    ForumPostVO shareHerb(long userId, ShareHerbRequest request);
}
