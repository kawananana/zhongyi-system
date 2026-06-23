package com.bencao.controller;

import com.bencao.common.Result;
import com.bencao.dto.ChangePasswordRequest;
import com.bencao.dto.LoginRequest;
import com.bencao.dto.LoginResponseVO;
import com.bencao.dto.RegisterRequest;
import com.bencao.dto.UpdateProfileRequest;
import com.bencao.dto.UserProfileVO;
import com.bencao.security.UserContext;
import com.bencao.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponseVO> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(authService.login(request));
    }

    @PostMapping("/register")
    public Result<LoginResponseVO> register(@Valid @RequestBody RegisterRequest request) {
        return Result.success(authService.register(request));
    }

    @GetMapping("/me")
    public Result<UserProfileVO> me() {
        long userId = UserContext.requireUserId();
        return Result.success(authService.getCurrentProfile(userId));
    }

    @PutMapping("/me")
    public Result<UserProfileVO> updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        long userId = UserContext.requireUserId();
        return Result.success(authService.updateProfile(userId, request));
    }

    @PutMapping("/me/password")
    public Result<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        long userId = UserContext.requireUserId();
        authService.changePassword(userId, request);
        return Result.success(null);
    }
}
