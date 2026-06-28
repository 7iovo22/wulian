package com.example.qiansan.controller;

import com.example.qiansan.dto.request.WechatLoginRequest;
import com.example.qiansan.dto.response.UserResponse;
import com.example.qiansan.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    public void testWechatLogin() throws Exception {
        WechatLoginRequest request = new WechatLoginRequest();
        request.setCode("test_code");

        UserResponse response = new UserResponse();
        response.setId(1L);
        response.setPhone("13800138000");
        response.setNickname("测试骑手");
        response.setRole("rider");
        response.setToken("test_token");

        when(userService.wechatLogin(any(WechatLoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/user/wechat/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("success"))
                .andExpect(jsonPath("$.data.nickname").value("测试骑手"))
                .andExpect(jsonPath("$.data.role").value("rider"));
    }

    @Test
    public void testGetUserInfo() throws Exception {
        com.example.qiansan.entity.User user = new com.example.qiansan.entity.User();
        user.setId(1L);
        user.setPhone("13800138000");
        user.setNickname("测试骑手");

        when(userService.getUserById(1L)).thenReturn(user);

        mockMvc.perform(post("/api/user/info")
                        .header("X-User-Id", "1"))
                .andExpect(status().isOk());
    }
}
