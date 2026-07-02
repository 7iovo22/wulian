package com.example.qiansan.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContactNotificationResponse {
    private Long id;
    private String title;
    private String content;
    private String type;
    private Boolean read;
    private LocalDateTime createTime;
    private Long riderId;
    private String riderNickname;
}
