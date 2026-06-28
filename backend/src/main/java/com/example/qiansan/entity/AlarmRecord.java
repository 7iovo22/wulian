package com.example.qiansan.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("alarm_record")
public class AlarmRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String deviceSn;

    private Long riderId;

    private String alarmType;

    private String alarmContent;

    private String longitude;

    private String latitude;

    private Integer handleStatus;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}