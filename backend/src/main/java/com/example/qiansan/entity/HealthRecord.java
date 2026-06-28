package com.example.qiansan.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("health_record")
public class HealthRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long riderId;

    private Integer heartRate;

    private BigDecimal temperature;

    private Integer fatigueStatus;

    private Integer heatRisk;

    private LocalDate recordDate;

    private LocalDateTime createTime;
}