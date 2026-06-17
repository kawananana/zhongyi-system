package com.bencao.controller;

import com.bencao.common.Result;
import com.bencao.entity.HomeBanner;
import com.bencao.service.HomeBannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeBannerService homeBannerService;

    @GetMapping("/banners")
    public Result<List<HomeBanner>> banners(
            @RequestParam(defaultValue = "home") String position) {
        return Result.success(homeBannerService.listActiveBanners(position));
    }
}
