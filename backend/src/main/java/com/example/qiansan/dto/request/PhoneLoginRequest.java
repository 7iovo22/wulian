package com.example.qiansan.dto.request;

import lombok.Data;

@Data
public class PhoneLoginRequest {
    private String phone;
    private String code;
    private String role;
}