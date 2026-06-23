package com.bencao.dto;

import lombok.Data;

@Data
public class UserFavoriteToggleVO {

    private boolean collected;

    public UserFavoriteToggleVO(boolean collected) {
        this.collected = collected;
    }
}
