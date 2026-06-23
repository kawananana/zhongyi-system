package com.bencao.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.PageResult;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.admin.UserAdminVO;
import com.bencao.entity.SysUser;
import com.bencao.mapper.SysUserMapper;
import com.bencao.service.admin.AdminUserManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserManageServiceImpl implements AdminUserManageService {

    private final SysUserMapper sysUserMapper;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public PageResult<UserAdminVO> pageUsers(long page, long pageSize, String keyword, Integer status) {
        LambdaQueryWrapper<SysUser> qw = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            String k = keyword.trim();
            qw.and(w -> w.like(SysUser::getNickname, k).or().like(SysUser::getPhone, k));
        }
        if (status != null) {
            qw.eq(SysUser::getStatus, status);
        }
        qw.orderByDesc(SysUser::getCreateTime);
        Page<SysUser> p = sysUserMapper.selectPage(new Page<>(page, pageSize), qw);
        Map<Long, Long> favCounts = loadFavoriteCounts(p.getRecords());
        List<UserAdminVO> list = p.getRecords().stream().map(u -> {
            UserAdminVO vo = new UserAdminVO();
            vo.setId(u.getId());
            vo.setNickname(u.getNickname());
            vo.setPhone(u.getPhone());
            vo.setStatus(u.getStatus());
            vo.setFavoriteCount(favCounts.getOrDefault(u.getId(), 0L));
            vo.setLastLoginTime(u.getLastLoginTime());
            vo.setCreateTime(u.getCreateTime());
            return vo;
        }).collect(Collectors.toList());
        return PageResult.of(list, p.getTotal(), p.getCurrent(), p.getSize());
    }

    @Override
    public void updateStatus(Long userId, int status) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        user.setStatus(status);
        sysUserMapper.updateById(user);
    }

    private Map<Long, Long> loadFavoriteCounts(List<SysUser> users) {
        List<Long> ids = users.stream().map(SysUser::getId).collect(Collectors.toList());
        if (ids.isEmpty()) {
            return Map.of();
        }
        try {
            return jdbcTemplate.query(
                    "SELECT user_id, COUNT(*) cnt FROM user_herb_favorite WHERE user_id IN ("
                            + ids.stream().map(String::valueOf).collect(Collectors.joining(","))
                            + ") GROUP BY user_id",
                    rs -> {
                        Map<Long, Long> map = new HashMap<>();
                        while (rs.next()) {
                            map.put(rs.getLong("user_id"), rs.getLong("cnt"));
                        }
                        return map;
                    });
        } catch (Exception ex) {
            return Map.of();
        }
    }
}
