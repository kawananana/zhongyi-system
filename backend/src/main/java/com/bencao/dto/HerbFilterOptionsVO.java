package com.bencao.dto;

import lombok.Data;

import java.util.List;

@Data
public class HerbFilterOptionsVO {

    private List<NatureOptionVO> natures;

    private List<String> tastes;

    private List<String> meridians;

    private List<ProvinceOptionVO> provinces;
}
