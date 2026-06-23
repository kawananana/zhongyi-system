package com.bencao.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.PageResult;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.admin.ForumPostAdminVO;
import com.bencao.entity.ForumPost;
import com.bencao.entity.Herb;
import com.bencao.entity.SysUser;
import com.bencao.mapper.ForumPostMapper;
import com.bencao.mapper.HerbMapper;
import com.bencao.mapper.SysUserMapper;
import com.bencao.service.admin.AdminForumManageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminForumManageServiceImpl implements AdminForumManageService {

    private final ForumPostMapper forumPostMapper;
    private final SysUserMapper sysUserMapper;
    private final HerbMapper herbMapper;

    @Override
    public PageResult<ForumPostAdminVO> pagePosts(long page, long pageSize, String keyword,
                                                  String category, Integer auditStatus, Integer status) {
        LambdaQueryWrapper<ForumPost> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(ForumPost::getTitle, keyword)
                    .or()
                    .like(ForumPost::getContent, keyword));
        }
        if (StringUtils.hasText(category) && !"all".equalsIgnoreCase(category)) {
            wrapper.eq(ForumPost::getCategory, category);
        }
        if (auditStatus != null) {
            wrapper.eq(ForumPost::getAuditStatus, auditStatus);
        }
        if (status != null) {
            wrapper.eq(ForumPost::getStatus, status);
        }
        wrapper.orderByDesc(ForumPost::getCreateTime);
        Page<ForumPost> postPage = forumPostMapper.selectPage(new Page<>(page, pageSize), wrapper);
        List<ForumPost> records = postPage.getRecords();
        Map<Long, SysUser> users = loadUserMap(records.stream().map(ForumPost::getUserId).collect(Collectors.toSet()));
        Map<Long, Herb> herbs = loadHerbMap(records);
        List<ForumPostAdminVO> list = records.stream()
                .map(post -> toVo(post, users.get(post.getUserId()), herbs.get(post.getRefId())))
                .toList();
        return PageResult.of(list, postPage.getTotal(), postPage.getCurrent(), postPage.getSize());
    }

    @Override
    public void updateAuditStatus(Long id, int auditStatus) {
        if (auditStatus < 0 || auditStatus > 2) {
            throw new BusinessException("审核状态无效");
        }
        ForumPost post = requirePost(id);
        post.setAuditStatus(auditStatus);
        if (auditStatus == 1) {
            post.setStatus(1);
        }
        forumPostMapper.updateById(post);
    }

    @Override
    public void updateStatus(Long id, int status) {
        if (status != 0 && status != 1) {
            throw new BusinessException("状态值无效");
        }
        ForumPost post = requirePost(id);
        post.setStatus(status);
        forumPostMapper.updateById(post);
    }

    @Override
    public void deletePost(Long id) {
        ForumPost post = requirePost(id);
        int rows = forumPostMapper.deleteById(post.getId());
        if (rows == 0) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
    }

    private ForumPost requirePost(Long id) {
        ForumPost post = forumPostMapper.selectById(id);
        if (post == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return post;
    }

    private ForumPostAdminVO toVo(ForumPost post, SysUser user, Herb herb) {
        ForumPostAdminVO vo = new ForumPostAdminVO();
        vo.setId(post.getId());
        vo.setUserId(post.getUserId());
        vo.setTitle(post.getTitle());
        vo.setContent(post.getContent());
        vo.setCategory(post.getCategory());
        vo.setRefType(post.getRefType());
        vo.setRefId(post.getRefId());
        vo.setLikeCount(post.getLikeCount());
        vo.setCommentCount(post.getCommentCount());
        vo.setAuditStatus(post.getAuditStatus());
        vo.setStatus(post.getStatus());
        vo.setCreateTime(post.getCreateTime());
        if (user != null) {
            vo.setAuthorNickname(StringUtils.hasText(user.getNickname()) ? user.getNickname() : "本草学员");
            vo.setAuthorPhone(user.getPhone());
        } else {
            vo.setAuthorNickname("本草学员");
        }
        if (herb != null) {
            vo.setRefHerbName(herb.getHerbName());
        }
        return vo;
    }

    private Map<Long, SysUser> loadUserMap(Set<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        return sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, u -> u));
    }

    private Map<Long, Herb> loadHerbMap(List<ForumPost> records) {
        Set<Long> herbIds = records.stream()
                .filter(p -> "herb".equals(p.getRefType()) && p.getRefId() != null)
                .map(ForumPost::getRefId)
                .collect(Collectors.toSet());
        if (herbIds.isEmpty()) {
            return Map.of();
        }
        return herbMapper.selectBatchIds(herbIds).stream()
                .collect(Collectors.toMap(Herb::getId, h -> h));
    }
}
