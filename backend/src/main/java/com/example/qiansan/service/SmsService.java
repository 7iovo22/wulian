package com.example.qiansan.service;

public interface SmsService {
    void sendVerificationCode(String phone);
    
    boolean verifyCode(String phone, String code);
    
    void clearCode(String phone);
}