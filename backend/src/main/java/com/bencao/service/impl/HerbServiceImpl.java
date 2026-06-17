package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.HerbDetailVO;
import com.bencao.dto.HerbFilterOptionsVO;
import com.bencao.dto.NatureOptionVO;
import com.bencao.dto.ProvinceOptionVO;
import com.bencao.entity.Herb;
import com.bencao.entity.HerbImage;
import com.bencao.entity.UserHerbFavorite;
import com.bencao.mapper.HerbImageMapper;
import com.bencao.mapper.HerbMapper;
import com.bencao.mapper.UserHerbFavoriteMapper;
import com.bencao.security.UserContext;
import com.bencao.service.HerbService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HerbServiceImpl extends ServiceImpl<HerbMapper, Herb> implements HerbService {

    private final UserHerbFavoriteMapper userHerbFavoriteMapper;

    private static final List<ProvinceOptionVO> COMMON_PROVINCES = List.of(
            new ProvinceOptionVO("51", "四川"),
            new ProvinceOptionVO("53", "云南"),
            new ProvinceOptionVO("52", "贵州"),
            new ProvinceOptionVO("45", "广西"),
            new ProvinceOptionVO("44", "广东"),
            new ProvinceOptionVO("35", "福建"),
            new ProvinceOptionVO("36", "江西"),
            new ProvinceOptionVO("33", "浙江"),
            new ProvinceOptionVO("34", "安徽"),
            new ProvinceOptionVO("41", "河南"),
            new ProvinceOptionVO("13", "河北"),
            new ProvinceOptionVO("37", "山东"),
            new ProvinceOptionVO("14", "山西"),
            new ProvinceOptionVO("61", "陕西"),
            new ProvinceOptionVO("62", "甘肃"),
            new ProvinceOptionVO("63", "青海"),
            new ProvinceOptionVO("65", "新疆"),
            new ProvinceOptionVO("54", "西藏"),
            new ProvinceOptionVO("15", "内蒙古"),
            new ProvinceOptionVO("22", "吉林"),
            new ProvinceOptionVO("32", "江苏"),
            new ProvinceOptionVO("42", "湖北"),
            new ProvinceOptionVO("43", "湖南"),
            new ProvinceOptionVO("50", "重庆")
    );

    private static final Map<String, String> PROVINCE_NAME_TO_CODE = COMMON_PROVINCES.stream()
            .collect(Collectors.toMap(ProvinceOptionVO::getName, ProvinceOptionVO::getCode, (a, b) -> a, LinkedHashMap::new));

    private static final Map<String, String> PROVINCE_CODE_TO_NAME = COMMON_PROVINCES.stream()
            .collect(Collectors.toMap(ProvinceOptionVO::getCode, ProvinceOptionVO::getName, (a, b) -> a, LinkedHashMap::new));

    private final HerbImageMapper herbImageMapper;

    @Override
    public Page<Herb> pageHerbs(long page, long pageSize, String keyword, String nature,
                                String originProvince, String sort) {
        LambdaQueryWrapper<Herb> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Herb::getStatus, 1);
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Herb::getHerbName, keyword)
                    .or()
                    .like(Herb::getAlias, keyword));
        }
        if (StringUtils.hasText(nature)) {
            wrapper.eq(Herb::getNature, nature);
        }
        if (StringUtils.hasText(originProvince)) {
            wrapper.eq(Herb::getOriginProvince, originProvince);
        }
        if ("collect".equalsIgnoreCase(sort)) {
            wrapper.orderByDesc(Herb::getCollectCount);
        } else if ("hot".equalsIgnoreCase(sort) || "view".equalsIgnoreCase(sort)) {
            wrapper.orderByDesc(Herb::getViewCount);
        } else {
            wrapper.orderByDesc(Herb::getId);
        }
        return page(new Page<>(page, pageSize), wrapper);
    }

    @Override
    public Page<Herb> searchHerbs(long page, long pageSize, String keyword, String natures,
                                  String tastes, String meridians, String provinceCodes, String sort) {
        LambdaQueryWrapper<Herb> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Herb::getStatus, 1);
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Herb::getHerbName, keyword)
                    .or()
                    .like(Herb::getAlias, keyword));
        }
        applyNatureOrEq(wrapper, natures);
        applyFieldOrLike(wrapper, tastes, Herb::getTaste);
        applyFieldOrLike(wrapper, meridians, Herb::getMeridian);
        applyProvinceFilter(wrapper, provinceCodes);
        if ("collect".equalsIgnoreCase(sort)) {
            wrapper.orderByDesc(Herb::getCollectCount);
        } else if ("hot".equalsIgnoreCase(sort) || "view".equalsIgnoreCase(sort)) {
            wrapper.orderByDesc(Herb::getViewCount);
        } else {
            wrapper.orderByDesc(Herb::getId);
        }
        return page(new Page<>(page, pageSize), wrapper);
    }

    private void applyNatureOrEq(LambdaQueryWrapper<Herb> wrapper, String csv) {
        List<String> values = splitCsv(csv);
        if (values.isEmpty()) {
            return;
        }
        wrapper.and(w -> {
            for (int i = 0; i < values.size(); i++) {
                String value = values.get(i);
                if (i == 0) {
                    w.eq(Herb::getNature, value);
                } else {
                    w.or().eq(Herb::getNature, value);
                }
            }
        });
    }

    private void applyFieldOrLike(LambdaQueryWrapper<Herb> wrapper, String csv,
                                  com.baomidou.mybatisplus.core.toolkit.support.SFunction<Herb, String> column) {
        List<String> values = splitCsv(csv);
        if (values.isEmpty()) {
            return;
        }
        wrapper.and(w -> {
            for (int i = 0; i < values.size(); i++) {
                String value = values.get(i);
                if (i == 0) {
                    w.like(column, value);
                } else {
                    w.or().like(column, value);
                }
            }
        });
    }

    private long parseMapLong(Map<String, Object> row, String... keys) {
        for (String key : keys) {
            Object val = row.get(key);
            if (val != null) {
                return Long.parseLong(String.valueOf(val));
            }
        }
        for (Object val : row.values()) {
            if (val instanceof Number) {
                return ((Number) val).longValue();
            }
        }
        return 0L;
    }

    private List<String> splitCsv(String csv) {
        if (!StringUtils.hasText(csv)) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());
    }

    @Override
    public HerbDetailVO getHerbDetail(Long id) {
        Herb herb = getById(id);
        if (herb == null || herb.getStatus() == null || herb.getStatus() != 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        HerbDetailVO vo = new HerbDetailVO();
        BeanUtils.copyProperties(herb, vo);
        List<HerbImage> images = herbImageMapper.selectList(
                new LambdaQueryWrapper<HerbImage>()
                        .eq(HerbImage::getHerbId, id)
                        .orderByAsc(HerbImage::getSortOrder));
        vo.setImages(images.stream().map(HerbImage::getImageUrl).collect(Collectors.toList()));
        if (vo.getImages().isEmpty() && StringUtils.hasText(herb.getCoverImage())) {
            vo.getImages().add(herb.getCoverImage());
        }
        herb.setViewCount((herb.getViewCount() == null ? 0 : herb.getViewCount()) + 1);
        updateById(herb);
        vo.setViewCount(herb.getViewCount());
        if (UserContext.isLoggedIn()) {
            long userId = UserContext.requireUserId();
            Long count = userHerbFavoriteMapper.selectCount(
                    new LambdaQueryWrapper<UserHerbFavorite>()
                            .eq(UserHerbFavorite::getUserId, userId)
                            .eq(UserHerbFavorite::getHerbId, id));
            vo.setIsCollected(count != null && count > 0);
        }
        return vo;
    }

    @Override
    public HerbFilterOptionsVO getFilterOptions() {
        HerbFilterOptionsVO vo = new HerbFilterOptionsVO();

        QueryWrapper<Herb> countWrapper = new QueryWrapper<>();
        countWrapper.select("nature", "COUNT(*) AS cnt")
                .eq("status", 1)
                .isNotNull("nature")
                .ne("nature", "")
                .groupBy("nature");
        List<Map<String, Object>> natureRows = baseMapper.selectMaps(countWrapper);

        List<NatureOptionVO> natures = natureRows.stream()
                .map(row -> {
                    String value = String.valueOf(row.get("nature"));
                    long count = parseMapLong(row, "cnt", "CNT", "count");
                    return new NatureOptionVO(value, value + "性", count);
                })
                .sorted(Comparator.comparing(NatureOptionVO::getValue))
                .collect(Collectors.toList());
        vo.setNatures(natures);

        List<Herb> herbs = list(new LambdaQueryWrapper<Herb>()
                .eq(Herb::getStatus, 1)
                .select(Herb::getTaste, Herb::getMeridian, Herb::getOriginProvince, Herb::getOriginProvinceName));

        Set<String> tastes = new LinkedHashSet<>();
        Set<String> meridians = new LinkedHashSet<>();
        Map<String, String> provinceMap = new LinkedHashMap<>();
        for (ProvinceOptionVO p : COMMON_PROVINCES) {
            provinceMap.put(p.getCode(), p.getName());
        }
        for (Herb herb : herbs) {
            if (StringUtils.hasText(herb.getTaste())) {
                Arrays.stream(herb.getTaste().split("[,，、]"))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .forEach(tastes::add);
            }
            if (StringUtils.hasText(herb.getMeridian())) {
                Arrays.stream(herb.getMeridian().split("[,，、]"))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .forEach(meridians::add);
            }
            mergeProvincesFromHerb(herb, provinceMap);
        }
        vo.setTastes(new ArrayList<>(tastes));
        vo.setMeridians(new ArrayList<>(meridians));
        vo.setProvinces(provinceMap.entrySet().stream()
                .map(e -> new ProvinceOptionVO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(ProvinceOptionVO::getName))
                .collect(Collectors.toList()));
        return vo;
    }

    private void mergeProvincesFromHerb(Herb herb, Map<String, String> provinceMap) {
        if (StringUtils.hasText(herb.getOriginProvinceName())) {
            for (String name : splitProvinceNames(herb.getOriginProvinceName())) {
                String code = PROVINCE_NAME_TO_CODE.get(name);
                if (code != null) {
                    provinceMap.putIfAbsent(code, name);
                }
            }
        }
        if (StringUtils.hasText(herb.getOriginProvince())) {
            String code = herb.getOriginProvince().trim();
            String name = PROVINCE_CODE_TO_NAME.get(code);
            if (name != null) {
                provinceMap.putIfAbsent(code, name);
            }
        }
    }

    private List<String> splitProvinceNames(String text) {
        return Arrays.stream(text.split("[,，、\\s]+"))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .filter(n -> !n.contains("全国") && !n.contains("各地"))
                .collect(Collectors.toList());
    }

    private void applyProvinceFilter(LambdaQueryWrapper<Herb> wrapper, String provinceCodes) {
        List<String> codes = splitCsv(provinceCodes);
        if (codes.isEmpty()) {
            return;
        }
        List<String> names = codes.stream()
                .map(PROVINCE_CODE_TO_NAME::get)
                .filter(StringUtils::hasText)
                .distinct()
                .collect(Collectors.toList());
        wrapper.and(w -> {
            boolean first = true;
            for (String code : codes) {
                if (first) {
                    w.eq(Herb::getOriginProvince, code);
                    first = false;
                } else {
                    w.or().eq(Herb::getOriginProvince, code);
                }
            }
            for (String name : names) {
                w.or().like(Herb::getOriginProvinceName, name);
            }
        });
    }
}
