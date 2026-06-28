package com.example.qiansan.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("contact_relation")
public class ContactRelation {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long riderId;

    private Long contactUserId;

    private String contactName;

    private String contactPhone;

    private LocalDateTime createTime;
}