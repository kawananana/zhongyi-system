package com.bencao.service;

import com.bencao.dto.AdminLoginRequest;
import com.bencao.dto.AdminLoginResponseVO;

public interface AdminAuthService {

    AdminLoginResponseVO login(AdminLoginRequest request);
}
