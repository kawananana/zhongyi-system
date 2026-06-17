package com.bencao.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NatureOptionVO {

    private String value;

    private String label;

    private Long count;
}
