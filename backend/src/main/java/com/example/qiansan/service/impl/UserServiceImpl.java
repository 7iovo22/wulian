package com.example.qiansan.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.qiansan.dto.request.AddContactRequest;
import com.example.qiansan.dto.request.AdminLoginRequest;
import com.example.qiansan.dto.request.BindPhoneRequest;
import com.example.qiansan.dto.request.PhoneLoginRequest;
import com.example.qiansan.dto.request.WechatLoginRequest;
import com.example.qiansan.dto.response.UserResponse;
import com.example.qiansan.entity.ContactRelation;
import com.example.qiansan.entity.User;
import com.example.qiansan.mapper.ContactRelationMapper;
import com.example.qiansan.mapper.UserMapper;
import com.example.qiansan.service.SmsService;
import com.example.qiansan.service.UserService;
import com.example.qiansan.service.WechatService;
import com.example.qiansan.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final ContactRelationMapper contactRelationMapper;
    private final JwtUtil jwtUtil;
    private final WechatService wechatService;
    private final SmsService smsService;

    @Override
    @Transactional
    public UserResponse wechatLogin(WechatLoginRequest request) {
        if (request.getCode() == null || request.getCode().isEmpty()) {
            throw new IllegalArgumentException("微信授权码不能为空");
        }

        log.info("Starting wechat login with code: {}", request.getCode().substring(0, Math.min(10, request.getCode().length())) + "...");

        // 调用微信API获取openId
        Map<String, String> wechatResult = wechatService.jscode2session(request.getCode());
        String openId = wechatResult.get("openid");

        if (openId == null || openId.isEmpty()) {
            log.error("Failed to get openid from wechat API, result: {}", wechatResult);
            throw new RuntimeException("获取微信openid失败");
        }
        log.info("Successfully obtained openid from wechat: {}", openId.substring(0, Math.min(10, openId.length())) + "...");

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getOpenId, openId));

        if (user == null) {
            user = new User();
            user.setOpenId(openId);
            user.setNickname("骑手" + openId.substring(Math.max(0, openId.length() - 8), openId.length()));
            user.setRole("rider");
            user.setCreateTime(LocalDateTime.now());
            user.setUpdateTime(LocalDateTime.now());
            userMapper.insert(user);
            log.info("Created new user with openId: {}", user.getId());
        } else {
            log.info("Found existing user: {}", user.getId());
        }

        String token = jwtUtil.generateToken(user.getId(), user.getPhone(), user.getRole());

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setPhone(user.getPhone());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setRole(user.getRole());
        response.setToken(token);

        return response;
    }

    @Override
    @Transactional
    public UserResponse bindPhone(Long userId, BindPhoneRequest request) {
        User user = getUserById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        
        user.setPhone(request.getPhone());
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
        
        String token = jwtUtil.generateToken(user.getId(), user.getPhone(), user.getRole());
        
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setPhone(user.getPhone());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setRole(user.getRole());
        response.setToken(token);
        
        return response;
    }

    @Override
    @Transactional
    public UserResponse phoneLogin(PhoneLoginRequest request) {
        if (!smsService.verifyCode(request.getPhone(), request.getCode())) {
            throw new IllegalArgumentException("验证码错误或已过期");
        }

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, request.getPhone()));

        if (user == null) {
            user = new User();
            user.setPhone(request.getPhone());
            user.setNickname("用户" + request.getPhone().substring(7));
            user.setRole(request.getRole() != null ? request.getRole() : "rider");
            user.setCreateTime(LocalDateTime.now());
            user.setUpdateTime(LocalDateTime.now());
            userMapper.insert(user);
            log.info("Created new user with phone: {}", user.getId());
        } else {
            if (request.getRole() != null && !request.getRole().isEmpty()) {
                user.setRole(request.getRole());
                user.setUpdateTime(LocalDateTime.now());
                userMapper.updateById(user);
            }
            log.info("Found existing user: {}", user.getId());
        }

        String token = jwtUtil.generateToken(user.getId(), user.getPhone(), user.getRole());

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setPhone(user.getPhone());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setRole(user.getRole());
        response.setToken(token);

        return response;
    }

    @Override
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    @Override
    public User getUserByPhone(String phone) {
        return userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, phone));
    }

    @Override
    @Transactional
    public User updateUser(User user) {
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
        return getUserById(user.getId());
    }

    @Override
    public List<ContactRelation> getContacts(Long riderId) {
        return contactRelationMapper.selectList(new LambdaQueryWrapper<ContactRelation>()
                .eq(ContactRelation::getRiderId, riderId));
    }

    @Override
    @Transactional
    public ContactRelation addContact(AddContactRequest request) {
        ContactRelation contact = new ContactRelation();
        contact.setRiderId(request.getRiderId());
        contact.setContactName(request.getContactName());
        contact.setContactPhone(request.getContactPhone());
        contact.setCreateTime(LocalDateTime.now());
        
        contactRelationMapper.insert(contact);
        return contact;
    }

    @Override
    @Transactional
    public void deleteContact(Long id) {
        contactRelationMapper.deleteById(id);
    }

    @Override
    public UserResponse adminLogin(AdminLoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isEmpty()) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }

        log.info("Admin login request for username: {}", request.getUsername());

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, request.getUsername())
                .eq(User::getRole, "admin"));

        if (user == null) {
            log.warn("Admin user not found: {}", request.getUsername());
            throw new IllegalArgumentException("用户名或密码错误");
        }

        if (user.getPassword() == null || !user.getPassword().equals(request.getPassword())) {
            log.warn("Invalid password for admin user: {}", request.getUsername());
            throw new IllegalArgumentException("用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getPhone(), user.getRole());

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setPhone(user.getPhone());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setRole(user.getRole());
        response.setToken(token);

        log.info("Admin login successful: {}", user.getId());
        return response;
    }
}
