package com.bencao.service;

import com.bencao.dto.MedicineBoxToggleVO;

import java.util.List;
import java.util.Map;

public interface MedicineBoxService {

    MedicineBoxToggleVO toggle(long userId, long herbId, String action);

    Map<Long, Boolean> status(long userId, List<Long> herbIds);
}
