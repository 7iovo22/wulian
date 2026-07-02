package com.example.qiansan.dto.response;

import lombok.Data;

@Data
public class ContactRiderResponse {
    private Long riderId;
    private String riderPhone;
    private String riderNickname;
    private String contactName;
    private String relation;
    private Double latitude;
    private Double longitude;
    private String lastUpdateTime;
    private Integer alarmCount;
}