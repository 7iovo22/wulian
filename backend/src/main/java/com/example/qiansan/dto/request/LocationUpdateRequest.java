package com.example.qiansan.dto.request;

import lombok.Data;

@Data
public class LocationUpdateRequest {
    private Long riderId;
    private String deviceSn;
    private String longitude;
    private String latitude;
}
