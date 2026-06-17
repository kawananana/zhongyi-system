package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.ChangePasswordRequest;
import com.bencao.dto.LoginRequest;
import com.bencao.dto.LoginResponseVO;
import com.bencao.dto.UpdateProfileRequest;
import com.bencao.dto.UserBriefVO;
import com.bencao.dto.UserProfileVO;
import com.bencao.entity.SysUser;
import com.bencao.mapper.SysUserMapper;
import com.bencao.security.JwtService;
import com.bencao.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final SysUserMapper sysUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public LoginResponseVO login(LoginRequest request) {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getPhone, request.getPhone().trim()));
        if (user == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "手机号或密码错误");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "账号已禁用");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "手机号或密码错误");
        }

        user.setLastLoginTime(LocalDateTime.now());
        sysUserMapper.updateById(user);

        String token = jwtService.createAccessToken(user.getId(), JwtService.AUDIENCE_USER, "user");
        UserBriefVO brief = new UserBriefVO(user.getId(), user.getNickname(), user.getAvatar());
        return new LoginResponseVO(token, jwtService.getAccessTokenExpireSeconds(), brief);
    }

    @Override
    public UserProfileVO getCurrentProfile(long userId) {
        SysUser user = requireActiveUser(userId);
        return UserProfileVO.fromEntity(user);
    }

    @Override
    public UserProfileVO updateProfile(long userId, UpdateProfileRequest request) {
        SysUser user = requireActiveUser(userId);
        user.setNickname(request.getNickname().trim());
        user.setAvatar(request.getAvatar() != null ? request.getAvatar().trim() : "");
        user.setGender(normalizeGender(request.getGender()));
        user.setBirthday(request.getBirthday());
        sysUserMapper.updateById(user);
        return UserProfileVO.fromEntity(user);
    }

    @Override
    public void changePassword(long userId, ChangePasswordRequest request) {
        SysUser user = requireActiveUser(userId);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.BAD_REQUEST.getCode(), "原密码不正确");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.BAD_REQUEST.getCode(), "新密码不能与原密码相同");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        sysUserMapper.updateById(user);
    }

    private SysUser requireActiveUser(long userId) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException(ResultCode.FORBIDDEN.getCode(), "账号已禁用");
        }
        return user;
    }

    private Integer normalizeGender(Integer gender) {
        if (gender == null) {
            return 0;
        }
        if (gender < 0 || gender > 2) {
            throw new BusinessException(ResultCode.BAD_REQUEST.getCode(), "性别参数无效");
        }
        return gender;
    }
}
