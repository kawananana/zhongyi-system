package com.bencao.controller;

import com.bencao.common.Result;
import com.bencao.dto.MedicineBoxStatusRequest;
import com.bencao.dto.MedicineBoxToggleRequest;
import com.bencao.dto.MedicineBoxToggleVO;
import com.bencao.security.UserContext;
import com.bencao.service.MedicineBoxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/user/medicine-box")
@RequiredArgsConstructor
public class MedicineBoxController {

    private final MedicineBoxService medicineBoxService;

    @PostMapping("/toggle")
    public Result<MedicineBoxToggleVO> toggle(@Valid @RequestBody MedicineBoxToggleRequest request) {
        long userId = UserContext.requireUserId();
        return Result.success(medicineBoxService.toggle(userId, request.getHerbId(), request.getAction()));
    }

    @PostMapping("/status")
    public Result<Map<Long, Boolean>> status(@Valid @RequestBody MedicineBoxStatusRequest request) {
        long userId = UserContext.requireUserId();
        return Result.success(medicineBoxService.status(userId, request.getHerbIds()));
    }
}
