package com.bencao.service.admin;

import com.bencao.common.PageResult;
import com.bencao.dto.admin.HerbAdminVO;
import com.bencao.dto.admin.UpdateHerbRequest;

public interface AdminHerbManageService {

    PageResult<HerbAdminVO> pageHerbs(long page, long pageSize, String keyword, String nature, Integer status);

    HerbAdminVO getHerb(Long id);

    HerbAdminVO updateHerb(Long id, UpdateHerbRequest request);

    void updateStatus(Long id, int status);

    void deleteHerb(Long id);
}
