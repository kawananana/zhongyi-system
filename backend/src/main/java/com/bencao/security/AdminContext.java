package com.bencao.security;

import com.bencao.common.ResultCode;
import com.bencao.common.exception.BusinessException;

public final class AdminContext {

    private static final ThreadLocal<Long> ADMIN_ID = new ThreadLocal<>();

    private AdminContext() {
    }

    public static void setAdminId(Long adminId) {
        ADMIN_ID.set(adminId);
    }

    public static Long getAdminId() {
        return ADMIN_ID.get();
    }

    public static long requireAdminId() {
        Long id = ADMIN_ID.get();
        if (id == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "请先登录管理后台");
        }
        return id;
    }

    public static void clear() {
        ADMIN_ID.remove();
    }
}
