-- 演示账号（密码均为 password，BCrypt）
-- 用户端：手机号 13800138000 / password
-- 管理端：用户名 admin / password（见 bencao_mengzhi.sql 初始数据）

INSERT INTO `sys_user` (`nickname`, `phone`, `password`, `status`)
SELECT '本草学员', '13800138000', '$2a$10$eFdmkv6P0EYiiER8cfXDkuPtSc4Oo0pJ.JWxcq2g.pI.EP4XN2vOy', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_user` WHERE `phone` = '13800138000');
