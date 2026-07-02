package com.example.qiansan.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.qiansan.dto.request.ContactLoginRequest;
import com.example.qiansan.dto.request.ContactRegisterRequest;
import com.example.qiansan.dto.request.ResetPasswordRequest;
import com.example.qiansan.dto.response.ContactNotificationResponse;
import com.example.qiansan.dto.response.ContactRiderResponse;
import com.example.qiansan.dto.response.UserResponse;
import com.example.qiansan.entity.ContactRelation;
import com.example.qiansan.entity.RiderLocation;
import com.example.qiansan.entity.User;
import com.example.qiansan.mapper.ContactRelationMapper;
import com.example.qiansan.mapper.RiderLocationMapper;
import com.example.qiansan.mapper.UserMapper;
import com.example.qiansan.service.ContactService;
import com.example.qiansan.service.SmsService;
import com.example.qiansan.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final UserMapper userMapper;
    private final ContactRelationMapper contactRelationMapper;
    private final RiderLocationMapper riderLocationMapper;
    private final JwtUtil jwtUtil;
    private final SmsService smsService;

    @Override
    @Transactional
    public UserResponse register(ContactRegisterRequest request) {
        if (request.getPhone() == null || request.getPhone().isEmpty()) {
            throw new IllegalArgumentException("手机号不能为空");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }

        User existingUser = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, request.getPhone())
                .eq(User::getRole, "contact"));

        if (existingUser != null) {
            throw new IllegalArgumentException("该手机号已注册为紧急联系人");
        }

        User user = new User();
        user.setPhone(request.getPhone());
        user.setPassword(request.getPassword());
        user.setNickname(request.getNickname() != null ? request.getNickname() : "联系人" + request.getPhone().substring(7));
        user.setRole("contact");
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());

        userMapper.insert(user);
        log.info("Created new contact user: {}", user.getId());

        String token = jwtUtil.generateToken(user.getId(), user.getPhone(), user.getRole());

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setPhone(user.getPhone());
        response.setNickname(user.getNickname());
        response.setRole(user.getRole());
        response.setToken(token);

        return response;
    }

    @Override
    @Transactional
    public UserResponse login(ContactLoginRequest request) {
        if (request.getPhone() == null || request.getPhone().isEmpty()) {
            throw new IllegalArgumentException("手机号不能为空");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, request.getPhone())
                .eq(User::getRole, "contact"));

        if (user == null) {
            throw new IllegalArgumentException("手机号或密码错误");
        }

        if (!request.getPassword().equals(user.getPassword())) {
            throw new IllegalArgumentException("手机号或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getPhone(), user.getRole());

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setPhone(user.getPhone());
        response.setNickname(user.getNickname());
        response.setRole(user.getRole());
        response.setToken(token);

        log.info("Contact user login successful: {}", user.getId());
        return response;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!smsService.verifyCode(request.getPhone(), request.getCode())) {
            throw new IllegalArgumentException("验证码错误或已过期");
        }

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, request.getPhone())
                .eq(User::getRole, "contact"));

        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        user.setPassword(request.getNewPassword());
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);

        log.info("Contact user password reset: {}", user.getId());
    }

    @Override
    public List<ContactRiderResponse> getRelatedRiders(String contactPhone) {
        List<ContactRelation> relations = contactRelationMapper.selectList(new LambdaQueryWrapper<ContactRelation>()
                .eq(ContactRelation::getContactPhone, contactPhone));

        List<ContactRiderResponse> result = new ArrayList<>();

        for (ContactRelation relation : relations) {
            User rider = userMapper.selectById(relation.getRiderId());
            if (rider == null) continue;

            RiderLocation location = riderLocationMapper.selectOne(new LambdaQueryWrapper<RiderLocation>()
                    .eq(RiderLocation::getRiderId, relation.getRiderId())
                    .orderByDesc(RiderLocation::getCreateTime)
                    .last("LIMIT 1"));

            ContactRiderResponse response = new ContactRiderResponse();
            response.setRiderId(rider.getId());
            response.setRiderPhone(rider.getPhone());
            response.setRiderNickname(rider.getNickname());
            response.setContactName(relation.getContactName());
            response.setRelation(relation.getRelation());

            if (location != null) {
                response.setLatitude(Double.parseDouble(location.getLatitude()));
                response.setLongitude(Double.parseDouble(location.getLongitude()));
                response.setLastUpdateTime(location.getCreateTime().toString());
            }

            result.add(response);
        }

        log.info("Found {} related riders for contact phone: {}", result.size(), contactPhone);
        return result;
    }

    @Override
    public List<ContactRiderResponse> getRelatedRidersByUserId(Long userId) {
        User contact = userMapper.selectById(userId);
        if (contact == null) {
            throw new IllegalArgumentException("联系人不存在");
        }
        return getRelatedRiders(contact.getPhone());
    }

    @Override
    public List<ContactNotificationResponse> getNotifications(Long userId) {
        User contact = userMapper.selectById(userId);
        if (contact == null) {
            throw new IllegalArgumentException("联系人不存在");
        }

        List<ContactRelation> relations = contactRelationMapper.selectList(new LambdaQueryWrapper<ContactRelation>()
                .eq(ContactRelation::getContactPhone, contact.getPhone()));

        List<ContactNotificationResponse> notifications = new ArrayList<>();

        for (int i = 0; i < relations.size() && i < 5; i++) {
            ContactRelation relation = relations.get(i);
            User rider = userMapper.selectById(relation.getRiderId());
            if (rider == null) continue;

            ContactNotificationResponse notification = new ContactNotificationResponse();
            notification.setId((long) (i + 1));
            notification.setTitle("骑手" + rider.getNickname() + "安全更新");
            notification.setContent("骑手" + rider.getNickname() + "的安全状态已更新，请及时查看。");
            notification.setType("event");
            notification.setRead(i > 2);
            notification.setCreateTime(LocalDateTime.now().minusMinutes(i * 15));
            notification.setRiderId(rider.getId());
            notification.setRiderNickname(rider.getNickname());

            notifications.add(notification);
        }

        ContactNotificationResponse systemNotification = new ContactNotificationResponse();
        systemNotification.setId(100L);
        systemNotification.setTitle("系统通知");
        systemNotification.setContent("欢迎使用紧急联系人服务，您可以实时查看骑手安全状态。");
        systemNotification.setType("system");
        systemNotification.setRead(true);
        systemNotification.setCreateTime(LocalDateTime.now().minusHours(2));
        notifications.add(systemNotification);

        log.info("Found {} notifications for contact user: {}", notifications.size(), userId);
        return notifications;
    }
}