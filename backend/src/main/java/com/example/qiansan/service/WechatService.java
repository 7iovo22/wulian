package com.example.qiansan.service;

import com.example.qiansan.config.WechatConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.ConnectException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WechatService {

    private final WechatConfig wechatConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(10000);
        return new RestTemplate(factory);
    }

    public Map<String, String> jscode2session(String code) {
        log.info("=== WeChat Login Step 1/2: Calling jscode2session API ===");
        log.info("AppId configured: {}", wechatConfig.getAppid() != null ? "yes" : "no");
        log.info("AppSecret configured: {}", wechatConfig.getAppsecret() != null ? "yes" : "no");

        String url = String.format("%s?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                wechatConfig.getLoginUrl(),
                wechatConfig.getAppid(),
                wechatConfig.getAppsecret(),
                code);

        log.info("Request URL (with sensitive info masked): {}?appid=***&secret=***&js_code=***&grant_type=authorization_code",
                wechatConfig.getLoginUrl());

        RestTemplate restTemplate = createRestTemplate();
        String response;

        try {
            long startTime = System.currentTimeMillis();
            response = restTemplate.getForObject(url, String.class);
            long duration = System.currentTimeMillis() - startTime;
            log.info("WeChat API call completed in {}ms", duration);
        } catch (ResourceAccessException e) {
            log.error("=== WeChat API Connection Failed ===", e);
            if (e.getCause() instanceof ConnectException) {
                throw new RuntimeException("无法连接到微信服务器，请检查网络连接", e);
            }
            throw new RuntimeException("微信服务器访问超时或连接失败", e);
        } catch (RestClientException e) {
            log.error("=== WeChat API Call Failed ===", e);
            throw new RuntimeException("微信API调用失败: " + e.getMessage(), e);
        }

        log.info("=== WeChat Login Step 2/2: Processing Response ===");
        log.info("Raw response: {}", response);

        try {
            JsonNode jsonNode = objectMapper.readTree(response);

            if (jsonNode.has("errcode")) {
                int errcode = jsonNode.get("errcode").asInt();
                String errmsg = jsonNode.has("errmsg") ? jsonNode.get("errmsg").asText() : "Unknown error";
                
                log.error("WeChat API returned error: errcode={}, errmsg={}", errcode, errmsg);
                
                String userMessage = getWechatErrorMessage(errcode, errmsg);
                throw new RuntimeException(userMessage);
            }

            Map<String, String> result = new HashMap<>();
            
            if (jsonNode.has("openid")) {
                String openid = jsonNode.get("openid").asText();
                result.put("openid", openid);
                log.info("Successfully retrieved openid");
            }
            
            if (jsonNode.has("session_key")) {
                result.put("session_key", jsonNode.get("session_key").asText());
                log.info("Successfully retrieved session_key");
            }
            
            if (jsonNode.has("unionid")) {
                result.put("unionid", jsonNode.get("unionid").asText());
                log.info("Successfully retrieved unionid");
            }

            if (!result.containsKey("openid")) {
                log.error("Response does not contain openid: {}", response);
                throw new RuntimeException("微信响应中缺少openid字段");
            }

            log.info("=== WeChat Login API Call Successful ===");
            return result;

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse WeChat API response", e);
            throw new RuntimeException("解析微信响应失败", e);
        }
    }

    private String getWechatErrorMessage(int errcode, String errmsg) {
        switch (errcode) {
            case -1:
                return "微信服务系统繁忙，请稍后重试";
            case 40029:
                return "无效的登录凭证(code)，请重新授权登录";
            case 45011:
                return "调用次数过于频繁，请稍候再试";
            case 40013:
                return "小程序AppID或AppSecret配置错误";
            default:
                return String.format("微信登录失败(%d): %s", errcode, errmsg);
        }
    }
}