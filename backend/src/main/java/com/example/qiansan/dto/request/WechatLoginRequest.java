package com.example.qiansan.dto.request;

import lombok.Data;

@Data
public class WechatLoginRequest {
    private String code;
    private String encryptedData;
    private String iv;
}
