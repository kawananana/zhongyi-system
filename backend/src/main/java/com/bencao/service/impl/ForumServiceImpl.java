package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.ForumPostVO;
import com.bencao.dto.ShareHerbRequest;
import com.bencao.entity.ForumPost;
import com.bencao.entity.Herb;
import com.bencao.entity.SysUser;
import com.bencao.mapper.ForumPostMapper;
import com.bencao.mapper.HerbMapper;
import com.bencao.mapper.SysUserMapper;
import com.bencao.service.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumServiceImpl implements ForumService {

    private final ForumPostMapper forumPostMapper;
    private final HerbMapper herbMapper;
    private final SysUserMapper sysUserMapper;

    @Override
    public Page<ForumPostVO> listPosts(long page, long pageSize, String category, String keyword) {
        LambdaQueryWrapper<ForumPost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ForumPost::getStatus, 1).eq(ForumPost::getAuditStatus, 1);
        if (StringUtils.hasText(category) && !"all".equalsIgnoreCase(category)) {
            wrapper.eq(ForumPost::getCategory, category);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(ForumPost::getTitle, keyword).or().like(ForumPost::getContent, keyword));
        }
        wrapper.orderByDesc(ForumPost::getCreateTime);
        Page<ForumPost> postPage = forumPostMapper.selectPage(new Page<>(page, pageSize), wrapper);
        return toVoPage(postPage);
    }

    @Override
    public ForumPostVO shareHerb(long userId, ShareHerbRequest request) {
        Herb herb = herbMapper.selectById(request.getHerbId());
        if (herb == null || herb.getStatus() == null || herb.getStatus() != 1) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "药材不存在");
        }

        StringBuilder body = new StringBuilder();
        body.append("【药材分享】").append(herb.getHerbName());
        if (StringUtils.hasText(herb.getEfficacy())) {
            body.append("\n功效：").append(herb.getEfficacy());
        }
        if (StringUtils.hasText(request.getContent())) {
            body.append("\n\n").append(request.getContent().trim());
        }
        body.append("\n\n查看图鉴：/atlas/herbs/").append(herb.getId());

        ForumPost post = new ForumPost();
        post.setUserId(userId);
        post.setTitle("分享药材 · " + herb.getHerbName());
        post.setContent(body.toString());
        post.setCategory("share");
        post.setRefType("herb");
        post.setRefId(herb.getId());
        post.setLikeCount(0);
        post.setCommentCount(0);
        post.setAuditStatus(1);
        post.setStatus(1);
        forumPostMapper.insert(post);

        ForumPostVO vo = new ForumPostVO();
        fillVo(vo, post, herb, loadUserMap(Set.of(userId)).get(userId));
        return vo;
    }

    private Page<ForumPostVO> toVoPage(Page<ForumPost> postPage) {
        List<ForumPost> records = postPage.getRecords();
        Set<Long> userIds = records.stream().map(ForumPost::getUserId).collect(Collectors.toSet());
        Set<Long> herbIds = records.stream()
                .filter(p -> "herb".equals(p.getRefType()) && p.getRefId() != null)
                .map(ForumPost::getRefId)
                .collect(Collectors.toSet());
        Map<Long, SysUser> users = loadUserMap(userIds);
        Map<Long, Herb> herbs = loadHerbMap(herbIds);

        Page<ForumPostVO> voPage = new Page<>(postPage.getCurrent(), postPage.getSize(), postPage.getTotal());
        voPage.setRecords(records.stream().map(post -> {
            ForumPostVO vo = new ForumPostVO();
            Herb herb = "herb".equals(post.getRefType()) ? herbs.get(post.getRefId()) : null;
            fillVo(vo, post, herb, users.get(post.getUserId()));
            return vo;
        }).toList());
        return voPage;
    }

    private void fillVo(ForumPostVO vo, ForumPost post, Herb herb, SysUser user) {
        vo.setId(post.getId());
        vo.setUserId(post.getUserId());
        vo.setTitle(post.getTitle());
        vo.setContent(post.getContent());
        vo.setCategory(post.getCategory());
        vo.setRefType(post.getRefType());
        vo.setRefId(post.getRefId());
        vo.setLikeCount(post.getLikeCount());
        vo.setCommentCount(post.getCommentCount());
        vo.setCreateTime(post.getCreateTime());
        if (user != null) {
            vo.setAuthorNickname(StringUtils.hasText(user.getNickname()) ? user.getNickname() : "本草学员");
            vo.setAuthorAvatar(user.getAvatar());
        } else {
            vo.setAuthorNickname("本草学员");
        }
        if (herb != null) {
            vo.setRefHerbName(herb.getHerbName());
            vo.setRefHerbCover(herb.getCoverImage());
        }
    }

    private Map<Long, SysUser> loadUserMap(Set<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        return sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, u -> u));
    }

    private Map<Long, Herb> loadHerbMap(Set<Long> herbIds) {
        if (herbIds.isEmpty()) {
            return Map.of();
        }
        return herbMapper.selectBatchIds(herbIds).stream()
                .collect(Collectors.toMap(Herb::getId, h -> h));
    }
}
