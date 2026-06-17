package com.bencao.service;

import com.bencao.entity.Acupoint;

import java.util.List;

public interface AcupointService {

    List<Acupoint> listAcupoints(String meridian, String region, String keyword);

    Acupoint getDetail(Long id);
}
