package com.example.qiansan.dto.request;

import lombok.Data;

@Data
public class AdminLoginRequest {
    private String username;
    private String password;
}