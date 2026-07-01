package com.example.qiansan.controller;

import com.example.qiansan.dto.request.AddContactRequest;
import com.example.qiansan.dto.request.AdminLoginRequest;
import com.example.qiansan.dto.request.BindPhoneRequest;
import com.example.qiansan.dto.request.PhoneLoginRequest;
import com.example.qiansan.dto.request.SendCodeRequest;
import com.example.qiansan.dto.request.WechatLoginRequest;
import com.example.qiansan.dto.response.ApiResponse;
import com.example.qiansan.dto.response.UserResponse;
import com.example.qiansan.entity.ContactRelation;
import com.example.qiansan.entity.User;
import com.example.qiansan.service.SmsService;
import com.example.qiansan.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final SmsService smsService;

    @PostMapping("/wechat/login")
    public ResponseEntity<ApiResponse<UserResponse>> wechatLogin(@RequestBody WechatLoginRequest request) {
        log.info("Wechat login request received");
        UserResponse response = userService.wechatLogin(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/phone/code")
    public ResponseEntity<ApiResponse<Void>> sendVerificationCode(@RequestBody SendCodeRequest request) {
        log.info("Send verification code request for phone: {}", request.getPhone());
        smsService.sendVerificationCode(request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("验证码已发送"));
    }

    @PostMapping("/phone/login")
    public ResponseEntity<ApiResponse<UserResponse>> phoneLogin(@RequestBody PhoneLoginRequest request) {
        log.info("Phone login request for phone: {}", request.getPhone());
        UserResponse response = userService.phoneLogin(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/phone/bind")
    public ResponseEntity<ApiResponse<UserResponse>> bindPhone(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody BindPhoneRequest request) {
        log.info("Bind phone request for user {}", userId);
        UserResponse response = userService.bindPhone(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<User>> getUserInfo(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get user info for user {}", userId);
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/info")
    public ResponseEntity<ApiResponse<User>> updateUserInfo(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody User user) {
        user.setId(userId);
        User updatedUser = userService.updateUser(user);
        return ResponseEntity.ok(ApiResponse.success(updatedUser));
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<ContactRelation>>> getContacts(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get contacts for user {}", userId);
        List<ContactRelation> contacts = userService.getContacts(userId);
        return ResponseEntity.ok(ApiResponse.success(contacts));
    }

    @PostMapping("/contacts")
    public ResponseEntity<ApiResponse<ContactRelation>> addContact(@RequestBody AddContactRequest request) {
        log.info("Add contact request for rider {}", request.getRiderId());
        ContactRelation contact = userService.addContact(request);
        return ResponseEntity.ok(ApiResponse.success(contact));
    }

    @PutMapping("/contacts")
    public ResponseEntity<ApiResponse<ContactRelation>> updateContact(@RequestBody AddContactRequest request) {
        log.info("Update contact request for id {}", request.getId());
        ContactRelation contact = userService.updateContact(request);
        return ResponseEntity.ok(ApiResponse.success(contact));
    }

    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable Long id) {
        log.info("Delete contact request for id {}", id);
        userService.deleteContact(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<UserResponse>> adminLogin(@RequestBody AdminLoginRequest request) {
        log.info("Admin login request received");
        UserResponse response = userService.adminLogin(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
