package com.bencao.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineBoxToggleVO {

    private boolean isCollected;
    private Long favoriteId;
}
