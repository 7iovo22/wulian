package com.example.qiansan.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "wechat.miniapp")
public class WechatConfig {

    private String appid;

    private String appsecret;

    private String loginUrl = "https://api.weixin.qq.com/sns/jscode2session";
}