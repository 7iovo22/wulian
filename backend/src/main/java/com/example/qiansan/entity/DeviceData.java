package com.example.qiansan.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("device_data")
public class DeviceData {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String deviceSn;

    private Long riderId;

    private Integer heartRate;

    private BigDecimal temperature;

    private String posture;

    private BigDecimal speed;

    private String longitude;

    private String latitude;

    private Integer fallStatus;

    private LocalDateTime createTime;
}