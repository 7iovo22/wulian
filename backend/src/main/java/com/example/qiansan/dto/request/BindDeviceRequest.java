package com.example.qiansan.dto.request;

import lombok.Data;

@Data
public class BindDeviceRequest {
    private String deviceSn;
    private String bindCode;
}
