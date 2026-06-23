package com.bencao.service.admin;

import com.bencao.common.PageResult;
import com.bencao.dto.admin.UserAdminVO;

public interface AdminUserManageService {

    PageResult<UserAdminVO> pageUsers(long page, long pageSize, String keyword, Integer status);

    void updateStatus(Long userId, int status);
}
