package com.example.qiansan.dto.request;

import lombok.Data;

@Data
public class SOSRequest {
    private Long riderId;
    private String longitude;
    private String latitude;
    private String description;
}
