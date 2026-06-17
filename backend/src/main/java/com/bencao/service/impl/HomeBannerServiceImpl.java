package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bencao.entity.HomeBanner;
import com.bencao.mapper.HomeBannerMapper;
import com.bencao.service.HomeBannerService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class HomeBannerServiceImpl extends ServiceImpl<HomeBannerMapper, HomeBanner> implements HomeBannerService {

    @Override
    public List<HomeBanner> listActiveBanners(String position) {
        LambdaQueryWrapper<HomeBanner> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HomeBanner::getStatus, 1);
        if (StringUtils.hasText(position)) {
            wrapper.eq(HomeBanner::getPosition, position);
        }
        wrapper.orderByAsc(HomeBanner::getSortOrder);
        return list(wrapper);
    }
}
