-- 修正管理员密码为 password（BCrypt）
UPDATE `admin_user`
SET `password` = '$2a$10$eFdmkv6P0EYiiER8cfXDkuPtSc4Oo0pJ.JWxcq2g.pI.EP4XN2vOy'
WHERE `username` = 'admin';

-- 演示用户（若不存在）
INSERT INTO `sys_user` (`nickname`, `phone`, `password`, `status`)
SELECT '本草学员', '13800138000', '$2a$10$eFdmkv6P0EYiiER8cfXDkuPtSc4Oo0pJ.JWxcq2g.pI.EP4XN2vOy', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_user` WHERE `phone` = '13800138000');

UPDATE `sys_user`
SET `password` = '$2a$10$eFdmkv6P0EYiiER8cfXDkuPtSc4Oo0pJ.JWxcq2g.pI.EP4XN2vOy'
WHERE `phone` = '13800138000';
