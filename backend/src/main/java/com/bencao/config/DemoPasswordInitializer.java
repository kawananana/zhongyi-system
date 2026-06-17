package com.bencao.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bencao.entity.AdminUser;
import com.bencao.entity.SysUser;
import com.bencao.mapper.AdminUserMapper;
import com.bencao.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 开发环境：将演示账号密码同步为 password，避免种子数据哈希不一致导致无法登录。
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "bencao.dev.sync-demo-passwords", havingValue = "true", matchIfMissing = true)
public class DemoPasswordInitializer implements ApplicationRunner {

    private static final String DEMO_PASSWORD = "password";
    private static final String DEMO_PHONE = "13800138000";

    private final AdminUserMapper adminUserMapper;
    private final SysUserMapper sysUserMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        try {
            syncAdmin();
            syncDemoUser();
        } catch (Exception ex) {
            log.warn("演示账号密码同步失败（请检查数据库表 admin_user / sys_user 是否存在）: {}", ex.getMessage());
        }
    }

    private void syncAdmin() {
        AdminUser admin = adminUserMapper.selectOne(
                new LambdaQueryWrapper<AdminUser>().eq(AdminUser::getUsername, "admin"));
        if (admin == null) {
            return;
        }
        if (!passwordEncoder.matches(DEMO_PASSWORD, admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
            adminUserMapper.updateById(admin);
            log.info("已同步管理员 admin 的演示密码为 password");
        }
    }

    private void syncDemoUser() {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getPhone, DEMO_PHONE));
        if (user == null) {
            SysUser created = new SysUser();
            created.setNickname("本草学员");
            created.setPhone(DEMO_PHONE);
            created.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
            created.setStatus(1);
            sysUserMapper.insert(created);
            log.info("已创建演示用户 {} / password", DEMO_PHONE);
            return;
        }
        if (!passwordEncoder.matches(DEMO_PASSWORD, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
            sysUserMapper.updateById(user);
            log.info("已同步演示用户 {} 的密码为 password", DEMO_PHONE);
        }
    }
}
