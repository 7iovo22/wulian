package com.example.qiansan.dto.request;

import lombok.Data;

@Data
public class ContactRegisterRequest {
    private String phone;
    private String password;
    private String nickname;
}