package com.example.qiansan.dto.response;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String phone;
    private String nickname;
    private String avatar;
    private String role;
    private String token;
}
