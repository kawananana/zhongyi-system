package com.bencao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("article")
public class Article {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String articleType;

    /** 百科侧边栏分类 */
    private String category;

    /** article=文章 course=课程 */
    private String contentKind;

    private String coverImage;

    private String content;

    private String author;

    /** 参考资料名称 */
    private String sourceName;

    /** 参考资料链接 */
    private String sourceUrl;

    /** 配图 JSON：[{url,caption}] */
    private String galleryJson;

    /** 视频 JSON：[{title,type,bvid|url,poster}] */
    private String videosJson;

    private Integer viewCount;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
