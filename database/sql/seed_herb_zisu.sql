-- 紫苏 · 批量导入示例（含详情 JSON）
USE `bencao_mengzhi`;

INSERT INTO `herb` (
  `herb_name`, `alias`, `origin_province`, `origin_province_name`,
  `dao_di_region`, `is_dao_di`, `nature`, `taste`, `meridian`,
  `property_desc`, `efficacy`, `clinical_usage`, `detail_content`,
  `cover_image`, `view_count`, `collect_count`, `status`
)
SELECT
  '紫苏',
  '紫苏叶、苏叶',
  '',
  '全国各地',
  '我国各地有出产',
  0,
  '温',
  '辛',
  '肺、脾',
  '紫苏为唇形科一年生草本植物皱紫苏的叶（或带嫩枝）。',
  '解表散寒，行气和胃。',
  '感冒风寒，寒热无汗，头痛鼻塞，胸闷，呕吐，妊娠恶阻，胎动不安，食鱼蟹中毒，吐泻腹痛。',
  JSON_OBJECT(
    'intro', '紫苏为唇形科一年生草本植物皱紫苏的叶（或带嫩枝）。',
    'aliasOrigin', '紫苏叶、苏叶等。我国各地有出产。',
    'property', '辛，温。归肺、脾经。',
    'efficacy', '解表散寒，行气和胃。',
    'clinical', '感冒风寒，寒热无汗，头痛鼻塞，胸闷，呕吐，妊娠恶阻，胎动不安，食鱼蟹中毒，吐泻腹痛。',
    'formulas', JSON_ARRAY(
      '紫苏叶9克，生姜3片，水煎热服。功能发散风寒，发汗退热。适用于外感风寒，怕冷发热，无汗头痛，鼻塞流清涕，胸闷泛恶，纳食呆滞。',
      '干苏叶12克，陈橘皮9克，黄酒250克，煮取100毫升，分2次温服。功能理气散寒，活血止痛。适用于卒得风冷，胸闷气逆，脘腹冷痛。',
      '紫苏15克，煎浓汁饮服。功能解鱼蟹毒。适用于食鱼蟹中毒，吐泻腹痛。',
      '苏叶12克，葱白10茎，水煎取汁备用。粳米50克，加水500毫升，煮稀粥，兑入药汁，再煮片刻服食。功能发汗解表，散寒通阳。适用于年老体弱，风寒感冒，畏寒发热，头痛鼻塞或腹痛泻痢。'
    ),
    'nutrition', '紫苏全草含挥发油约0.5%，内有紫苏醛、左旋柠檬烯及少量渍烯。叶的挥发油中含异白苏烯酮。苏叶还含有精氨酸、枯酸、矢车菊素、D-葡萄糖苷等。',
    'references', JSON_ARRAY(
      '《滇南本草》：发汗，解伤风头痛，消痰，定吼喘。',
      '《本草纲目》：行气宽中，消痰利肺，和血，温中，止痛，定喘，安胎。'
    ),
    'commentary', '紫苏辛温芳烈。能入肺脾上中二焦。发汗行气力佳，为治外感风寒而兼气滞之要药。又能安胎，解鱼蟹毒。',
    'appendix', '苏子：即紫苏的成熟果实。辛，温。功能化痰止咳平喘，润肠通便。适用于痰多咳嗽气喘及老人肠燥便秘之证。'
  ),
  '/images/herbs/zisu.png',
  0, 0, 1
FROM (SELECT 1) AS _seed
WHERE NOT EXISTS (SELECT 1 FROM `herb` WHERE `herb_name` = '紫苏' AND `status` = 1);

INSERT INTO `herb_image` (`herb_id`, `image_url`, `sort_order`)
SELECT h.id, '/images/herbs/zisu.png', 1
FROM `herb` h
WHERE h.`herb_name` = '紫苏' AND h.`status` = 1
  AND NOT EXISTS (SELECT 1 FROM `herb_image` i WHERE i.`herb_id` = h.id);
