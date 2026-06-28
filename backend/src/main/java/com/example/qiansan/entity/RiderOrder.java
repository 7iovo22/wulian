package com.example.qiansan.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("rider_order")
public class RiderOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long riderId;

    private String orderNo;

    private String startAddress;

    private String endAddress;

    private BigDecimal distance;

    private Integer needMinute;

    private Integer isUnreasonable;

    private LocalDateTime createTime;
}