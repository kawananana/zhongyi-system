package com.bencao.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.PageResult;
import com.bencao.common.Result;
import com.bencao.dto.HerbFilterOptionsVO;
import com.bencao.dto.HerbDetailVO;
import com.bencao.entity.Herb;
import com.bencao.service.HerbService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/atlas/herbs")
@RequiredArgsConstructor
public class HerbController {

    private final HerbService herbService;

    @GetMapping("/filter-options")
    public Result<HerbFilterOptionsVO> filterOptions() {
        return Result.success(herbService.getFilterOptions());
    }

    @GetMapping("/search")
    public Result<PageResult<Herb>> search(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String natures,
            @RequestParam(required = false) String tastes,
            @RequestParam(required = false) String meridians,
            @RequestParam(required = false) String provinceCodes,
            @RequestParam(required = false) String sort) {
        Page<Herb> herbPage = herbService.searchHerbs(page, pageSize, keyword, natures,
                tastes, meridians, provinceCodes, sort);
        return Result.success(PageResult.of(
                herbPage.getRecords(),
                herbPage.getTotal(),
                herbPage.getCurrent(),
                herbPage.getSize()
        ));
    }

    @GetMapping
    public Result<PageResult<Herb>> page(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String nature,
            @RequestParam(required = false) String originProvince,
            @RequestParam(required = false) String sort) {
        Page<Herb> herbPage = herbService.pageHerbs(page, pageSize, keyword, nature, originProvince, sort);
        PageResult<Herb> pageResult = PageResult.of(
                herbPage.getRecords(),
                herbPage.getTotal(),
                herbPage.getCurrent(),
                herbPage.getSize()
        );
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    public Result<HerbDetailVO> detail(@PathVariable Long id) {
        return Result.success(herbService.getHerbDetail(id));
    }
}
