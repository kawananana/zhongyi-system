package com.bencao.controller;

import com.bencao.common.Result;
import com.bencao.dto.StudyChatRequest;
import com.bencao.dto.StudyChatResponseVO;
import com.bencao.security.UserContext;
import com.bencao.service.StudyChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/study")
@RequiredArgsConstructor
public class StudyChatController {

    private final StudyChatService studyChatService;

    @PostMapping("/chat")
    public Result<StudyChatResponseVO> chat(@Valid @RequestBody StudyChatRequest request) {
        UserContext.requireUserId();
        return Result.success(studyChatService.chat(request));
    }
}
