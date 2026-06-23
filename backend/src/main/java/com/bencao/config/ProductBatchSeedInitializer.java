package com.bencao.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bencao.entity.Product;
import com.bencao.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

@Slf4j
@Component
@Order(28)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "bencao.seed.products-batch", havingValue = "true", matchIfMissing = true)
public class ProductBatchSeedInitializer implements ApplicationRunner {

    private final ProductMapper productMapper;

    @Override
    public void run(ApplicationArguments args) {
        int updated = 0;
        for (ProductSeed seed : SEEDS) {
            Product product = productMapper.selectById(seed.id());
            if (product == null) {
                continue;
            }
            boolean changed = false;
            if (!seed.name().equals(product.getProductName())) {
                product.setProductName(seed.name());
                changed = true;
            }
            if (!seed.detail().equals(product.getDetail())) {
                product.setDetail(seed.detail());
                changed = true;
            }
            if (!seed.category().equals(product.getCategory())) {
                product.setCategory(seed.category());
                changed = true;
            }
            if (seed.price().compareTo(product.getPrice()) != 0) {
                product.setPrice(seed.price());
                changed = true;
            }
            if (StringUtils.hasText(seed.coverImage())
                    && !seed.coverImage().equals(product.getCoverImage())) {
                product.setCoverImage(seed.coverImage());
                changed = true;
            }
            if (changed) {
                productMapper.updateById(product);
                updated++;
            }
        }
        if (updated > 0) {
            log.info("商品种子已同步名称与描述 {} 条", updated);
        }
    }

    private record ProductSeed(
            Long id,
            String name,
            String category,
            BigDecimal price,
            String coverImage,
            String detail
    ) {
    }

    private static final ProductSeed[] SEEDS = {
            new ProductSeed(22L, "【养生茶疗】新会陈皮普洱茶", "tea_therapy", bd("68.00"),
                    "/images/market/ff4269e9bc6867844d0c43a362b981bc_720.png",
                    "【养生茶疗】| 规格：罐装250g | 广东新会陈皮拼云南熟普，理气健脾、消食解腻，耐泡回甘。"),
            new ProductSeed(23L, "【养生茶疗】玫瑰红枣桂圆茶", "tea_therapy", bd("42.00"),
                    "/images/market/c8257482d8cfd1cb436031b9c141ab1d_720.png",
                    "【养生茶疗】| 规格：20袋×8g | 平阴玫瑰、新疆红枣、莆田桂圆，暖宫养血，女性日常调理。"),
            new ProductSeed(24L, "【养生茶疗】杭白菊枸杞茶", "tea_therapy", bd("36.80"),
                    "/images/market/8f8096c8a454a9fb2e06cd0b72c00f5f_720.png",
                    "【养生茶疗】| 规格：15袋×5g | 桐乡杭白菊配宁夏枸杞，独立茶包，清肝火明目，办公室冲泡方便。"),
            new ProductSeed(25L, "【艾灸艾柱】无烟艾条", "moxibustion", bd("45.00"),
                    "/images/market/007c5532699b5bc59bacec57e86af325_720.png",
                    "【艾灸艾柱】| 规格：10支×18mm | 低烟配方艾条，悬灸、隔姜灸均可，居家常备。"),
            new ProductSeed(26L, "【理疗工具】真空拔罐器12罐装", "physio_tools", bd("49.90"),
                    "/images/market/dd112defab4e057ceee8910744acebc6_720.png",
                    "【理疗工具】| 规格：12罐+抽气枪 | 家用真空拔罐，透明罐体，肩背腰腿祛湿活血。"),
            new ProductSeed(27L, "【艾灸艾柱】蕲春三年陈艾柱", "moxibustion", bd("58.00"),
                    "/images/market/35d66bc96c800f2170cf3157ade0db99_720.png",
                    "【艾灸艾柱】| 规格：54粒×1.8cm | 湖北蕲春艾叶，三年陈化，烟少味醇，适配标准艾灸盒。"),
            new ProductSeed(28L, "【中医护肤】珍珠粉洁面乳", "skincare", bd("56.00"),
                    "/images/market/d6adb798ec2882ded5002805f9cc4cd9_720.png",
                    "【中医护肤】| 规格：100ml | 水解珍珠粉配伍氨基酸表活，温和清洁不紧绷。"),
            new ProductSeed(29L, "【中医护肤】当归草本润唇膏", "skincare", bd("39.90"),
                    "/images/market/a57b460fc1a1f53f3da1de3beda3fe2a.png",
                    "【中医护肤】| 规格：3.5g/支 | 当归提取物+天然蜂蜡，无香精色素，缓解唇部干裂。"),
            new ProductSeed(30L, "【养生足疗】藏红花足浴盐", "foot_therapy", bd("45.00"),
                    "/images/market/0e69dd54e44fd6bede571055d184828e_720.png",
                    "【养生足疗】| 规格：500g/袋 | 藏红花、海盐、艾叶粉，溶解快，活血通络，缓解疲劳。"),
            new ProductSeed(31L, "【中医书籍】《黄帝内经》白话图解", "books", bd("68.00"),
                    "/images/market/41cda2b432609cbb580ee0b16d3f1fc2_720.png",
                    "【中医书籍】| 规格：精装16开 | 彩色插图+白话注解，中医入门经典，附经络概览图。"),
            new ProductSeed(32L, "【中医书籍】《针灸学》教材精编", "books", bd("45.00"),
                    "/images/market/a02dc77f84b4438518ea04c6b16b2b2d.png",
                    "【中医书籍】| 规格：平装 | 十四经脉穴位定位、针刺手法要点，配真人取穴彩图。"),
            new ProductSeed(33L, "【中医书籍】《中药学》速查手册", "books", bd("32.00"),
                    "/images/market/71ed5b661cab202750abe2297476ee05_720.png",
                    "【中医书籍】| 规格：口袋本 | 常用药材性味归经、功效主治速查，实习备考实用。"),
            new ProductSeed(34L, "【精品礼盒】四季养生礼包", "gift_box", bd("198.00"),
                    "/images/market/5bf2622047023018775b6a7eca1f1331_720.png",
                    "【精品礼盒】| 规格：茶+膏+足浴各1 | 精选菊花枸杞茶、秋梨膏、艾叶泡脚包等养生组合，兼顾四季调理，适合节日探亲送礼与家庭日常滋养。"),
            new ProductSeed(35L, "宁夏枸杞王", "decoction", bd("68.00"),
                    "/images/market/1dbc42c8c444d8d8f591402c2fca4dbe_720.png",
                    "【滋补饮片】| 规格：250g/袋 | 中宁特级大果枸杞，干燥饱满，泡茶嚼食，滋补肝肾。"),
            new ProductSeed(36L, "四神小棍", "food_medicine", bd("29.90"),
                    "/images/market/63aa3a9d55c0bf2f71f8a75128cf0175_720.png",
                    "【药食同源】| 规格：320g/罐 | 茯苓、莲子、山药、芡实研磨成型，健脾祛湿，儿童老人皆宜。"),
            new ProductSeed(37L, "红枣枸杞核桃糕", "food_medicine", bd("48.00"),
                    "/images/market/1197146ea0ac102e688a9649998acfa4_720.png",
                    "【药食同源】| 规格：500g/盒 | 宁夏枸杞、新疆红枣、核桃仁，软糯不粘牙，滋补肝肾。"),
            new ProductSeed(38L, "党参黄芪牛肉粒", "food_medicine", bd("68.00"),
                    "/images/market/65a4d09b25782d71c0029f4aa9549256_720.png",
                    "【药食同源】| 规格：120g/袋 | 党参、黄芪入膳牛肉粒，高蛋白即食，补气养血，健身代餐。"),
            new ProductSeed(39L, "桑葚山楂块", "food_medicine", bd("39.90"),
                    "/images/market/b3e0b584f68715205cd6f2f2c6ab20ce_720.png",
                    "【药食同源】| 规格：220g/盒 | 桑葚、山楂实材冷压成型，酸甜软糯，健脾消食，独立小包装。"),
            new ProductSeed(40L, "固本膏", "herbal_paste", bd("128.00"),
                    "/images/market/3e300f1b11bbdf8f935d5707a0437564_720.png",
                    "【膏方系列】| 规格：150g/盒 | 人参、黄芪、枸杞等配伍膏方，大补元气，体虚乏力者调理。"),
            new ProductSeed(41L, "经络按摩刷", "physio_tools", bd("28.00"),
                    "/images/market/8a90a25bca3cd615b0cb189971c52412.png",
                    "【理疗工具】| 规格：1把 | 树脂梳齿经络刷，腿臂腹部推拿，配合精油使用。"),
            new ProductSeed(42L, "艾灸盒随身套装", "moxibustion", bd("89.00"),
                    "/images/market/be0492964364e53833d1d5a7a164e960.png",
                    "【艾灸艾柱】| 规格：1盒+54粒艾柱 | 不锈钢随身灸盒、隔热垫、固定带及艾柱，新手入门套装。"),
            new ProductSeed(43L, "水牛角刮痧板", "physio_tools", bd("35.00"),
                    "/images/market/1eec53851cda1a2c6197406d79b29ace.png",
                    "【理疗工具】| 规格：约12cm | 天然水牛角打磨，薄边设计，面部背部经络疏通，配刮痧油。"),
            new ProductSeed(44L, "老姜足浴包", "foot_therapy", bd("29.90"),
                    "/images/market/image.png",
                    "【养生足疗】| 规格：20包 | 云南小黄姜切片烘干，驱寒暖足，手脚冰凉者适用。"),
            new ProductSeed(45L, "岷县当归头片", "decoction", bd("52.00"),
                    "/images/market/790f13be76e7845319b3eb62d6370ef7_720.png",
                    "【滋补饮片】| 规格：100g | 甘肃岷县当归头片，油圈明显，补血活血，妇科常用。"),
            new ProductSeed(46L, "川贝秋梨膏", "herbal_paste", bd("78.00"),
                    "/images/market/06dec9289a763fc76363707196d032ef_720.png",
                    "【膏方系列】| 规格：300g/瓶 | 川贝母、秋梨、蜂蜜慢火熬制，润肺止咳，秋冬咽干适用。"),
            new ProductSeed(47L, "文山三七粉", "decoction", bd("128.00"),
                    "/images/market/cba6903d394669fabfc3576317030e1a_720.png",
                    "【滋补饮片】| 规格：50g/瓶 | 云南文山春三七超细粉，活血化瘀，跌打损伤及心脑血管养护。"),
            new ProductSeed(48L, "宁夏枸杞礼盒", "gift_box", bd("158.00"),
                    "/images/market/d9d83aad2390f98da79df53f32507499_720.png",
                    "【精品礼盒】| 规格：特级枸杞500g×2罐 | 中宁头茬枸杞，粒大饱满，滋补肝肾，精美礼盒装。"),
            new ProductSeed(49L, "九蒸九晒黑芝麻丸", "herbal_paste", bd("59.90"),
                    "/images/market/9ede45651bced3f310f52ac55271325f_720.png",
                    "【膏方系列】| 规格：罐装200g | 传统九蒸九晒黑芝麻，补肾乌发，每日2丸即食。"),
            new ProductSeed(50L, "甘肃黄芪片", "decoction", bd("48.00"),
                    "/images/market/f8707b9bd50fa496cb0607e54b6f0ff6_720.png",
                    "【滋补饮片】| 规格：100g/罐 | 岷县黄芪斜切片，豆腥味浓，煲汤泡茶，补气升阳。"),
            new ProductSeed(51L, "艾叶红花泡脚包", "foot_therapy", bd("39.90"),
                    "/images/market/fd16a2b13332d4a635895a18c03306f7_720.png",
                    "【养生足疗】| 规格：30包×30g | 蕲春艾叶配红花、干姜，睡前泡脚20分钟，温经助眠。"),
            new ProductSeed(52L, "《黄帝内经》白话图解", "books", bd("68.00"),
                    "/images/market/41cda2b432609cbb580ee0b16d3f1fc2_720.png",
                    "【中医书籍】| 规格：精装16开 | 彩色插图+白话注解，中医入门经典，附经络概览图。"),
            new ProductSeed(53L, "银耳莲子羹礼盒", "gift_box", bd("88.00"),
                    "/images/market/54c8dffa0e05b4c168547b57eccf571c.png",
                    "【精品礼盒】| 规格：6碗装 | 古田银耳、建宁莲子即食羹，滋阴润肺，开盖即食。"),
    };

    private static BigDecimal bd(String value) {
        return new BigDecimal(value);
    }
}
