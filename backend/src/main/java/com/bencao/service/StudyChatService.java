package com.bencao.service;

import com.bencao.dto.StudyChatRequest;
import com.bencao.dto.StudyChatResponseVO;

public interface StudyChatService {

    StudyChatResponseVO chat(StudyChatRequest request);
}
