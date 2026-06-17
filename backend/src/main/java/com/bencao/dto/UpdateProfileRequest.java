package com.bencao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "昵称不能为空")
    @Size(max = 64, message = "昵称最多 64 个字符")
    private String nickname;

    @Size(max = 512, message = "头像地址过长")
    private String avatar;

    /** 0未知 1男 2女 */
    private Integer gender;

    private LocalDate birthday;
}
