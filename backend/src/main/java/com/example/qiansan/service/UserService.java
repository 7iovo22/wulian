package com.example.qiansan.service;

import com.example.qiansan.dto.request.AddContactRequest;
import com.example.qiansan.dto.request.AdminLoginRequest;
import com.example.qiansan.dto.request.BindPhoneRequest;
import com.example.qiansan.dto.request.PhoneLoginRequest;
import com.example.qiansan.dto.request.WechatLoginRequest;
import com.example.qiansan.dto.response.UserResponse;
import com.example.qiansan.entity.ContactRelation;
import com.example.qiansan.entity.User;

import java.util.List;

public interface UserService {
    UserResponse wechatLogin(WechatLoginRequest request);
    UserResponse bindPhone(Long userId, BindPhoneRequest request);
    UserResponse phoneLogin(PhoneLoginRequest request);
    User getUserById(Long id);
    User getUserByPhone(String phone);
    User updateUser(User user);
    List<ContactRelation> getContacts(Long riderId);
    ContactRelation addContact(AddContactRequest request);
    void deleteContact(Long id);
    UserResponse adminLogin(AdminLoginRequest request);
}
