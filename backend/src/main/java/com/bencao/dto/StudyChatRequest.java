package com.bencao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class StudyChatRequest {

    @NotBlank(message = "消息不能为空")
    @Size(max = 4000, message = "消息过长")
    private String message;

    @Size(max = 20, message = "历史消息过多")
    private List<StudyChatMessageDTO> history = new ArrayList<>();

    /** 体质自测等场景的附加上下文，拼入 system prompt */
    @Size(max = 12000, message = "附加上下文过长")
    private String constitutionContext;
}
