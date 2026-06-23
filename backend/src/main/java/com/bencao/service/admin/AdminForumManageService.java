package com.bencao.service.admin;

import com.bencao.common.PageResult;
import com.bencao.dto.admin.ForumPostAdminVO;

public interface AdminForumManageService {

    PageResult<ForumPostAdminVO> pagePosts(long page, long pageSize, String keyword,
                                           String category, Integer auditStatus, Integer status);

    void updateAuditStatus(Long id, int auditStatus);

    void updateStatus(Long id, int status);

    void deletePost(Long id);
}
