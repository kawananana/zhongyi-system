package com.bencao.dto;

import com.bencao.entity.Herb;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class HerbDetailVO extends Herb {

    private List<String> images = new ArrayList<>();

    /** 当前登录用户是否已收藏；未登录时为 null */
    private Boolean isCollected;
}
