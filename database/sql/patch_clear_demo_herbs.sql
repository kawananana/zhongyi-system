-- 清除图鉴 picsum 占位假数据（可单独执行；后端启动时也会自动执行同等逻辑）
USE `bencao_mengzhi`;

DELETE FROM `herb` WHERE `cover_image` LIKE '%picsum.photos%';
DELETE h FROM `herb` h
INNER JOIN `herb_image` hi ON h.`id` = hi.`herb_id`
WHERE hi.`image_url` LIKE '%picsum.photos%';

UPDATE `home_banner`
SET `link_type` = 'url', `link_target_id` = NULL
WHERE `link_type` = 'herb';

-- 执行后请重启后端，以从 herbs-batch.json 同步紫苏、麻黄等真实数据。
