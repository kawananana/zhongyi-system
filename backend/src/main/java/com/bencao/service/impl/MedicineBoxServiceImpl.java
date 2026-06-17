package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.MedicineBoxToggleVO;
import com.bencao.entity.Herb;
import com.bencao.entity.UserHerbFavorite;
import com.bencao.mapper.HerbMapper;
import com.bencao.mapper.UserHerbFavoriteMapper;
import com.bencao.service.MedicineBoxService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineBoxServiceImpl implements MedicineBoxService {

    private final UserHerbFavoriteMapper favoriteMapper;
    private final HerbMapper herbMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MedicineBoxToggleVO toggle(long userId, long herbId, String action) {
        Herb herb = herbMapper.selectById(herbId);
        if (herb == null || herb.getStatus() == null || herb.getStatus() != 1) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "药材不存在");
        }

        UserHerbFavorite existing = favoriteMapper.selectOne(
                new LambdaQueryWrapper<UserHerbFavorite>()
                        .eq(UserHerbFavorite::getUserId, userId)
                        .eq(UserHerbFavorite::getHerbId, herbId));

        if ("add".equalsIgnoreCase(action)) {
            if (existing != null) {
                return new MedicineBoxToggleVO(true, existing.getId());
            }
            UserHerbFavorite row = new UserHerbFavorite();
            row.setUserId(userId);
            row.setHerbId(herbId);
            favoriteMapper.insert(row);
            herb.setCollectCount((herb.getCollectCount() == null ? 0 : herb.getCollectCount()) + 1);
            herbMapper.updateById(herb);
            return new MedicineBoxToggleVO(true, row.getId());
        }

        if ("remove".equalsIgnoreCase(action)) {
            if (existing != null) {
                favoriteMapper.deleteById(existing.getId());
                int count = herb.getCollectCount() == null ? 0 : herb.getCollectCount();
                herb.setCollectCount(Math.max(0, count - 1));
                herbMapper.updateById(herb);
            }
            return new MedicineBoxToggleVO(false, null);
        }

        throw new BusinessException(ResultCode.BAD_REQUEST.getCode(), "action 须为 add 或 remove");
    }

    @Override
    public Map<Long, Boolean> status(long userId, List<Long> herbIds) {
        if (herbIds == null || herbIds.isEmpty()) {
            return Map.of();
        }
        List<UserHerbFavorite> rows = favoriteMapper.selectList(
                new LambdaQueryWrapper<UserHerbFavorite>()
                        .eq(UserHerbFavorite::getUserId, userId)
                        .in(UserHerbFavorite::getHerbId, herbIds));
        Set<Long> collected = rows.stream()
                .map(UserHerbFavorite::getHerbId)
                .collect(Collectors.toSet());
        Map<Long, Boolean> map = new HashMap<>();
        for (Long herbId : herbIds) {
            map.put(herbId, collected.contains(herbId));
        }
        return map;
    }
}
