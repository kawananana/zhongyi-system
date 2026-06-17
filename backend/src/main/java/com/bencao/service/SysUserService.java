package com.bencao.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.bencao.entity.SysUser;

public interface SysUserService extends IService<SysUser> {

    Page<SysUser> pageUsers(long page, long pageSize, String keyword);

    SysUser getUserDetail(Long id);
}
