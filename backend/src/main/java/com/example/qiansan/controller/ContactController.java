package com.example.qiansan.controller;

import com.example.qiansan.dto.request.ContactLoginRequest;
import com.example.qiansan.dto.request.ContactRegisterRequest;
import com.example.qiansan.dto.request.ResetPasswordRequest;
import com.example.qiansan.dto.request.SendCodeRequest;
import com.example.qiansan.dto.response.ApiResponse;
import com.example.qiansan.dto.response.ContactNotificationResponse;
import com.example.qiansan.dto.response.ContactRiderResponse;
import com.example.qiansan.dto.response.UserResponse;
import com.example.qiansan.service.ContactService;
import com.example.qiansan.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;
    private final SmsService smsService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody ContactRegisterRequest request) {
        log.info("Contact register request for phone: {}", request.getPhone());
        UserResponse response = contactService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@RequestBody ContactLoginRequest request) {
        log.info("Contact login request for phone: {}", request.getPhone());
        UserResponse response = contactService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/send-code")
    public ResponseEntity<ApiResponse<Void>> sendCode(@RequestBody SendCodeRequest request) {
        log.info("Send verification code for contact phone: {}", request.getPhone());
        smsService.sendVerificationCode(request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("验证码已发送"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody ResetPasswordRequest request) {
        log.info("Reset password request for contact phone: {}", request.getPhone());
        contactService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("密码重置成功"));
    }

    @GetMapping("/riders")
    public ResponseEntity<ApiResponse<List<ContactRiderResponse>>> getRelatedRiders(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get related riders for contact user: {}", userId);
        List<ContactRiderResponse> riders = contactService.getRelatedRidersByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(riders));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<ContactNotificationResponse>>> getNotifications(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get notifications for contact user: {}", userId);
        List<ContactNotificationResponse> notifications = contactService.getNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }
}