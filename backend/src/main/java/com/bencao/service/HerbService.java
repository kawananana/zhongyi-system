package com.bencao.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.bencao.dto.HerbDetailVO;
import com.bencao.dto.HerbFilterOptionsVO;
import com.bencao.entity.Herb;

public interface HerbService extends IService<Herb> {

    Page<Herb> pageHerbs(long page, long pageSize, String keyword, String nature,
                         String originProvince, String sort);

    Page<Herb> searchHerbs(long page, long pageSize, String keyword, String natures,
                           String tastes, String meridians, String provinceCodes, String sort);

    HerbDetailVO getHerbDetail(Long id);

    HerbFilterOptionsVO getFilterOptions();
}
