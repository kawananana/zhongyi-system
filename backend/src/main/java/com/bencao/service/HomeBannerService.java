package com.bencao.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.bencao.entity.HomeBanner;

import java.util.List;

public interface HomeBannerService extends IService<HomeBanner> {

    List<HomeBanner> listActiveBanners(String position);
}
