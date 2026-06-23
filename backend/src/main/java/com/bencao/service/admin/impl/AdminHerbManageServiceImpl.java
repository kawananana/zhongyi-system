package com.bencao.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.PageResult;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.admin.HerbAdminVO;
import com.bencao.dto.admin.UpdateHerbRequest;
import com.bencao.entity.Herb;
import com.bencao.mapper.HerbMapper;
import com.bencao.service.admin.AdminHerbManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminHerbManageServiceImpl implements AdminHerbManageService {

    private final HerbMapper herbMapper;

    @Override
    public PageResult<HerbAdminVO> pageHerbs(long page, long pageSize, String keyword,
                                             String nature, Integer status) {
        LambdaQueryWrapper<Herb> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Herb::getHerbName, keyword)
                    .or()
                    .like(Herb::getAlias, keyword)
                    .or()
                    .like(Herb::getEfficacy, keyword));
        }
        if (StringUtils.hasText(nature)) {
            wrapper.eq(Herb::getNature, nature);
        }
        if (status != null) {
            wrapper.eq(Herb::getStatus, status);
        }
        wrapper.orderByDesc(Herb::getUpdateTime).orderByDesc(Herb::getId);
        Page<Herb> herbPage = herbMapper.selectPage(new Page<>(page, pageSize), wrapper);
        return PageResult.of(
                herbPage.getRecords().stream().map(this::toVo).toList(),
                herbPage.getTotal(),
                herbPage.getCurrent(),
                herbPage.getSize());
    }

    @Override
    public HerbAdminVO getHerb(Long id) {
        return toVo(requireHerb(id));
    }

    @Override
    public HerbAdminVO updateHerb(Long id, UpdateHerbRequest request) {
        Herb herb = requireHerb(id);
        herb.setHerbName(request.getHerbName().trim());
        herb.setAlias(trimOrNull(request.getAlias()));
        herb.setOriginProvinceName(trimOrNull(request.getOriginProvinceName()));
        herb.setDaoDiRegion(trimOrNull(request.getDaoDiRegion()));
        herb.setIsDaoDi(request.getIsDaoDi() != null ? request.getIsDaoDi() : 0);
        herb.setNature(trimOrNull(request.getNature()));
        herb.setTaste(trimOrNull(request.getTaste()));
        herb.setMeridian(trimOrNull(request.getMeridian()));
        herb.setPropertyDesc(trimOrNull(request.getPropertyDesc()));
        herb.setEfficacy(trimOrNull(request.getEfficacy()));
        herb.setClinicalUsage(trimOrNull(request.getClinicalUsage()));
        if (request.getCoverImage() != null) {
            herb.setCoverImage(request.getCoverImage().trim());
        }
        herbMapper.updateById(herb);
        return toVo(herbMapper.selectById(id));
    }

    @Override
    public void updateStatus(Long id, int status) {
        if (status != 0 && status != 1) {
            throw new BusinessException("状态值无效");
        }
        Herb herb = requireHerb(id);
        herb.setStatus(status);
        herbMapper.updateById(herb);
    }

    @Override
    public void deleteHerb(Long id) {
        Herb herb = requireHerb(id);
        int rows = herbMapper.deleteById(herb.getId());
        if (rows == 0) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
    }

    private Herb requireHerb(Long id) {
        Herb herb = herbMapper.selectById(id);
        if (herb == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return herb;
    }

    private HerbAdminVO toVo(Herb herb) {
        HerbAdminVO vo = new HerbAdminVO();
        vo.setId(herb.getId());
        vo.setHerbName(herb.getHerbName());
        vo.setAlias(herb.getAlias());
        vo.setOriginProvinceName(herb.getOriginProvinceName());
        vo.setDaoDiRegion(herb.getDaoDiRegion());
        vo.setIsDaoDi(herb.getIsDaoDi());
        vo.setNature(herb.getNature());
        vo.setTaste(herb.getTaste());
        vo.setMeridian(herb.getMeridian());
        vo.setPropertyDesc(herb.getPropertyDesc());
        vo.setEfficacy(herb.getEfficacy());
        vo.setClinicalUsage(herb.getClinicalUsage());
        vo.setCoverImage(herb.getCoverImage());
        vo.setViewCount(herb.getViewCount());
        vo.setCollectCount(herb.getCollectCount());
        vo.setStatus(herb.getStatus());
        vo.setCreateTime(herb.getCreateTime());
        vo.setUpdateTime(herb.getUpdateTime());
        return vo;
    }

    private String trimOrNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
