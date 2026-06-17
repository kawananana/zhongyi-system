package com.bencao.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserProfileVO {

    private Long id;
    private String nickname;
    private String phone;
    private String avatar;
    private Integer gender;
    private LocalDate birthday;
    private LocalDateTime lastLoginTime;
    private LocalDateTime createTime;

    public static UserProfileVO fromEntity(com.bencao.entity.SysUser user) {
        UserProfileVO vo = new UserProfileVO();
        vo.setId(user.getId());
        vo.setNickname(user.getNickname());
        vo.setPhone(user.getPhone());
        vo.setAvatar(user.getAvatar());
        vo.setGender(user.getGender());
        vo.setBirthday(user.getBirthday());
        vo.setLastLoginTime(user.getLastLoginTime());
        vo.setCreateTime(user.getCreateTime());
        return vo;
    }
}
