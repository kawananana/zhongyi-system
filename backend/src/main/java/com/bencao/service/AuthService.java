package com.bencao.service;

import com.bencao.dto.ChangePasswordRequest;
import com.bencao.dto.LoginRequest;
import com.bencao.dto.LoginResponseVO;
import com.bencao.dto.UpdateProfileRequest;
import com.bencao.dto.UserProfileVO;

public interface AuthService {

    LoginResponseVO login(LoginRequest request);

    UserProfileVO getCurrentProfile(long userId);

    UserProfileVO updateProfile(long userId, UpdateProfileRequest request);

    void changePassword(long userId, ChangePasswordRequest request);
}
