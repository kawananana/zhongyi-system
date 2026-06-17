package com.bencao.controller;

import com.bencao.common.Result;
import com.bencao.entity.Acupoint;
import com.bencao.service.AcupointService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/atlas/acupoints")
@RequiredArgsConstructor
public class AcupointController {

    private final AcupointService acupointService;

    @GetMapping
    public Result<List<Acupoint>> list(
            @RequestParam(required = false) String meridian,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String keyword) {
        return Result.success(acupointService.listAcupoints(meridian, region, keyword));
    }

    @GetMapping("/{id}")
    public Result<Acupoint> detail(@PathVariable Long id) {
        return Result.success(acupointService.getDetail(id));
    }
}
