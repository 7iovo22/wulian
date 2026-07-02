package com.example.qiansan.service;

import com.example.qiansan.dto.request.ContactLoginRequest;
import com.example.qiansan.dto.request.ContactRegisterRequest;
import com.example.qiansan.dto.request.ResetPasswordRequest;
import com.example.qiansan.dto.response.ContactNotificationResponse;
import com.example.qiansan.dto.response.ContactRiderResponse;
import com.example.qiansan.dto.response.UserResponse;

import java.util.List;

public interface ContactService {
    UserResponse register(ContactRegisterRequest request);
    UserResponse login(ContactLoginRequest request);
    void resetPassword(ResetPasswordRequest request);
    List<ContactRiderResponse> getRelatedRiders(String contactPhone);
    List<ContactRiderResponse> getRelatedRidersByUserId(Long userId);
    List<ContactNotificationResponse> getNotifications(Long userId);
}