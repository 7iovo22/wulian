package com.example.qiansan.service.impl;

import com.example.qiansan.service.SmsService;
import com.tencentcloudapi.common.Credential;
import com.tencentcloudapi.common.exception.TencentCloudSDKException;
import com.tencentcloudapi.common.profile.ClientProfile;
import com.tencentcloudapi.common.profile.HttpProfile;
import com.tencentcloudapi.sms.v20210111.SmsClient;
import com.tencentcloudapi.sms.v20210111.models.SendSmsRequest;
import com.tencentcloudapi.sms.v20210111.models.SendSmsResponse;
import com.tencentcloudapi.sms.v20210111.models.SendStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class SmsServiceImpl implements SmsService {

    @Value("${sms.tencent.secret-id}")
    private String secretId;

    @Value("${sms.tencent.secret-key}")
    private String secretKey;

    @Value("${sms.tencent.sdk-app-id}")
    private String sdkAppId;

    @Value("${sms.tencent.sign-name}")
    private String signName;

    @Value("${sms.tencent.template-id}")
    private String templateId;

    @Value("${sms.tencent.region:ap-guangzhou}")
    private String region;

    @Value("${sms.expire-minutes:5}")
    private int expireMinutes;

    @Value("${sms.send-interval-seconds:60}")
    private int sendIntervalSeconds;

    @Value("${sms.max-daily-send:10}")
    private int maxDailySend;

    private static class VerificationCode {
        String code;
        LocalDateTime sendTime;
        int sendCount;

        VerificationCode(String code, LocalDateTime sendTime) {
            this.code = code;
            this.sendTime = sendTime;
            this.sendCount = 1;
        }
    }

    private final Map<String, VerificationCode> codeCache = new ConcurrentHashMap<>();

    @Override
    public void sendVerificationCode(String phone) {
        if (!isValidPhone(phone)) {
            throw new IllegalArgumentException("手机号格式不正确");
        }

        VerificationCode existing = codeCache.get(phone);
        LocalDateTime now = LocalDateTime.now();

        if (existing != null) {
            if (existing.sendTime.plusSeconds(sendIntervalSeconds).isAfter(now)) {
                throw new IllegalArgumentException("发送过于频繁，请稍后再试");
            }
            if (existing.sendCount >= maxDailySend) {
                throw new IllegalArgumentException("今日发送次数已达上限");
            }
            existing.sendCount++;
        }

        String code = generateCode();
        
        if (existing != null) {
            existing.code = code;
            existing.sendTime = now;
        } else {
            codeCache.put(phone, new VerificationCode(code, now));
        }

        try {
            sendSms(phone, code);
            log.info("验证码发送成功: {}", phone);
        } catch (Exception e) {
            log.error("验证码发送失败: {}", e.getMessage());
            throw new RuntimeException("短信发送失败，请稍后重试");
        }
    }

    @Override
    public boolean verifyCode(String phone, String code) {
        if (!isValidPhone(phone) || code == null || code.length() != 6) {
            return false;
        }

        VerificationCode verificationCode = codeCache.get(phone);
        if (verificationCode == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        if (verificationCode.sendTime.plusMinutes(expireMinutes).isBefore(now)) {
            codeCache.remove(phone);
            return false;
        }

        if (!verificationCode.code.equals(code)) {
            return false;
        }

        codeCache.remove(phone);
        return true;
    }

    @Override
    public void clearCode(String phone) {
        codeCache.remove(phone);
    }

    private String generateCode() {
        return String.format("%06d", (int) (Math.random() * 900000) + 100000);
    }

    private boolean isValidPhone(String phone) {
        return phone != null && phone.matches("^1[3-9]\\d{9}$");
    }

    private void sendSms(String phone, String code) throws Exception {
        Credential cred = new Credential(secretId, secretKey);

        HttpProfile httpProfile = new HttpProfile();
        httpProfile.setEndpoint("sms.tencentcloudapi.com");

        ClientProfile clientProfile = new ClientProfile();
        clientProfile.setHttpProfile(httpProfile);

        SmsClient client = new SmsClient(cred, region, clientProfile);

        SendSmsRequest req = new SendSmsRequest();
        req.setSmsSdkAppId(sdkAppId);
        req.setSignName(signName);
        req.setTemplateId(templateId);
        
        String[] phoneNumbers = {"+86" + phone};
        req.setPhoneNumberSet(phoneNumbers);
        
        String[] templateParams = {code};
        req.setTemplateParamSet(templateParams);

        SendSmsResponse resp = client.SendSms(req);
        
        if (resp.getSendStatusSet() != null && resp.getSendStatusSet().length > 0) {
            SendStatus status = resp.getSendStatusSet()[0];
            if (!"Ok".equals(status.getCode())) {
                throw new TencentCloudSDKException(status.getCode(), status.getMessage());
            }
        }
    }
}