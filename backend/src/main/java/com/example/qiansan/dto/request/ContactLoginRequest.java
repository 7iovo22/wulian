package com.example.qiansan.dto.request;

import lombok.Data;

@Data
public class ContactLoginRequest {
    private String phone;
    private String password;
}