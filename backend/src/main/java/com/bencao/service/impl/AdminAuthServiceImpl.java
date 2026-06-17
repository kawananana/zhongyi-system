package com.bencao.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;
import com.bencao.dto.AdminBriefVO;
import com.bencao.dto.AdminLoginRequest;
import com.bencao.dto.AdminLoginResponseVO;
import com.bencao.entity.AdminUser;
import com.bencao.mapper.AdminUserMapper;
import com.bencao.security.JwtService;
import com.bencao.service.AdminAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuthServiceImpl implements AdminAuthService {

    private final AdminUserMapper adminUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AdminLoginResponseVO login(AdminLoginRequest request) {
        AdminUser admin = adminUserMapper.selectOne(
                new LambdaQueryWrapper<AdminUser>().eq(AdminUser::getUsername, request.getUsername().trim()));
        if (admin == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "用户名或密码错误");
        }
        if (admin.getStatus() != null && admin.getStatus() == 0) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "账号已禁用");
        }
        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "用户名或密码错误");
        }

        String token = jwtService.createAccessToken(admin.getId(), JwtService.AUDIENCE_ADMIN, admin.getRole());
        AdminBriefVO brief = new AdminBriefVO(admin.getId(), admin.getUsername(), admin.getRole());
        return new AdminLoginResponseVO(token, jwtService.getAccessTokenExpireSeconds(), brief);
    }
}
