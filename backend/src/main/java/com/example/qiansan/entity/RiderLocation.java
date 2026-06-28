package com.example.qiansan.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("rider_location")
public class RiderLocation {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long riderId;

    private String deviceSn;

    private String longitude;

    private String latitude;

    private LocalDateTime createTime;
}