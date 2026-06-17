package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.entity.Acupoint;
import com.bencao.mapper.AcupointMapper;
import com.bencao.service.AcupointService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class AcupointServiceImpl extends ServiceImpl<AcupointMapper, Acupoint> implements AcupointService {

    @Override
    public List<Acupoint> listAcupoints(String meridian, String region, String keyword) {
        LambdaQueryWrapper<Acupoint> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(meridian) && !"all".equalsIgnoreCase(meridian)) {
            wrapper.eq(Acupoint::getMeridian, meridian);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Acupoint::getPointName, keyword)
                    .or()
                    .like(Acupoint::getPositionDesc, keyword)
                    .or()
                    .like(Acupoint::getEfficacy, keyword));
        }
        wrapper.orderByAsc(Acupoint::getMeridian).orderByAsc(Acupoint::getPointName);
        return list(wrapper);
    }

    @Override
    public Acupoint getDetail(Long id) {
        Acupoint point = getById(id);
        if (point == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return point;
    }
}
