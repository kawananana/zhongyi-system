-- 产地筛选增加「江西」；可选：为江西道地药材补一条示例数据
USE `bencao_mengzhi`;

-- 若尚无江西产地药材，可插入栀子（江西樟树等地为道地产区之一）
INSERT INTO `herb` (
    `herb_name`, `alias`, `origin_province`, `origin_province_name`,
    `dao_di_region`, `is_dao_di`, `nature`, `taste`, `meridian`,
    `property_desc`, `efficacy`, `clinical_usage`, `cover_image`,
    `view_count`, `collect_count`, `status`
)
SELECT
    '栀子', 'Gardenia jasminoides、山栀子', '36', '江西省', '赣中栀子道地产区', 1, '寒', '苦', '心、肺、三焦',
    '栀子为茜草科植物栀子的干燥成熟果实。呈长卵圆形，表面红黄色或棕红色，质脆，气微，味微酸而苦。',
    '泻火除烦，清热利湿，凉血解毒，消肿止痛。',
    '用于热病心烦、湿热黄疸、淋证涩痛、血热吐衄、目赤肿痛、火毒疮疡；扭挫伤痛。',
    'https://picsum.photos/seed/zhizi/400/320',
    1280, 186, 1
FROM (SELECT 1) AS _seed
WHERE NOT EXISTS (SELECT 1 FROM `herb` WHERE `herb_name` = '栀子' AND `status` = 1);

INSERT INTO `province_herb_mapping` (`province_code`, `province_name`, `herb_id`, `region_label`, `sort_order`)
SELECT '36', '江西省', h.id, '赣中栀子道地产区', 1
FROM `herb` h
WHERE h.`herb_name` = '栀子' AND h.`status` = 1
  AND NOT EXISTS (
    SELECT 1 FROM `province_herb_mapping` m
    WHERE m.`province_code` = '36' AND m.`herb_id` = h.id
  );
