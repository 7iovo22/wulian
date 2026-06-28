package com.example.qiansan.service;

import com.example.qiansan.dto.request.AddContactRequest;
import com.example.qiansan.dto.request.BindPhoneRequest;
import com.example.qiansan.dto.request.WechatLoginRequest;
import com.example.qiansan.dto.response.UserResponse;
import com.example.qiansan.entity.ContactRelation;
import com.example.qiansan.entity.User;
import com.example.qiansan.service.impl.UserServiceImpl;
import com.example.qiansan.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private com.example.qiansan.mapper.UserMapper userMapper;

    @Mock
    private com.example.qiansan.mapper.ContactRelationMapper contactRelationMapper;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private WechatService wechatService;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    public void testWechatLogin_NewUser() {
        WechatLoginRequest request = new WechatLoginRequest();
        request.setCode("test_code");

        Map<String, String> wechatResult = new HashMap<>();
        wechatResult.put("openid", "test_openid_123456");

        User newUser = new User();
        newUser.setId(1L);
        newUser.setOpenId("test_openid_123456");
        newUser.setNickname("骑手test_op");
        newUser.setRole("rider");

        when(wechatService.jscode2session(anyString())).thenReturn(wechatResult);
        when(userMapper.selectOne(any())).thenReturn(null);
        doAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return 1;
        }).when(userMapper).insert(any(User.class));
        when(jwtUtil.generateToken(anyLong(), any(), anyString())).thenReturn("test_token");

        UserResponse response = userService.wechatLogin(request);

        assertNotNull(response);
        assertEquals("骑手test_ope", response.getNickname());
        assertEquals("rider", response.getRole());
        assertNotNull(response.getToken());
        verify(userMapper, times(1)).insert(any(User.class));
    }

    @Test
    public void testWechatLogin_ExistingUser() {
        WechatLoginRequest request = new WechatLoginRequest();
        request.setCode("test_code");

        Map<String, String> wechatResult = new HashMap<>();
        wechatResult.put("openid", "existing_openid");

        User existingUser = new User();
        existingUser.setId(2L);
        existingUser.setOpenId("existing_openid");
        existingUser.setNickname("老骑手");
        existingUser.setRole("rider");

        when(wechatService.jscode2session(anyString())).thenReturn(wechatResult);
        when(userMapper.selectOne(any())).thenReturn(existingUser);
        when(jwtUtil.generateToken(anyLong(), any(), anyString())).thenReturn("test_token");

        UserResponse response = userService.wechatLogin(request);

        assertNotNull(response);
        assertEquals("老骑手", response.getNickname());
        assertEquals("rider", response.getRole());
        verify(userMapper, never()).insert(any(User.class));
    }

    @Test
    public void testWechatLogin_NullCode() {
        WechatLoginRequest request = new WechatLoginRequest();
        request.setCode(null);

        assertThrows(IllegalArgumentException.class, () -> userService.wechatLogin(request));
    }

    @Test
    public void testWechatLogin_EmptyCode() {
        WechatLoginRequest request = new WechatLoginRequest();
        request.setCode("");

        assertThrows(IllegalArgumentException.class, () -> userService.wechatLogin(request));
    }

    @Test
    public void testGetUserById() {
        User user = new User();
        user.setId(1L);
        user.setPhone("13800138000");
        user.setNickname("测试骑手");

        when(userMapper.selectById(1L)).thenReturn(user);

        User result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals("13800138000", result.getPhone());
    }

    @Test
    public void testGetContacts() {
        ContactRelation contact1 = new ContactRelation();
        contact1.setId(1L);
        contact1.setContactName("家人1");
        contact1.setContactPhone("13900139000");

        ContactRelation contact2 = new ContactRelation();
        contact2.setId(2L);
        contact2.setContactName("家人2");
        contact2.setContactPhone("13900139001");

        when(contactRelationMapper.selectList(any())).thenReturn(Arrays.asList(contact1, contact2));

        List<ContactRelation> contacts = userService.getContacts(1L);

        assertNotNull(contacts);
        assertEquals(2, contacts.size());
        assertEquals("家人1", contacts.get(0).getContactName());
    }

    @Test
    public void testAddContact() {
        AddContactRequest request = new AddContactRequest();
        request.setRiderId(1L);
        request.setContactName("测试联系人");
        request.setContactPhone("13700137000");

        ContactRelation contact = new ContactRelation();
        contact.setId(1L);
        contact.setRiderId(1L);
        contact.setContactName("测试联系人");
        contact.setContactPhone("13700137000");
        contact.setCreateTime(LocalDateTime.now());

        when(contactRelationMapper.insert(any(ContactRelation.class))).thenReturn(1);

        ContactRelation result = userService.addContact(request);

        assertNotNull(result);
        assertEquals("测试联系人", result.getContactName());
        assertEquals("13700137000", result.getContactPhone());
    }

    @Test
    public void testDeleteContact() {
        when(contactRelationMapper.deleteById(1L)).thenReturn(1);

        assertDoesNotThrow(() -> userService.deleteContact(1L));
        verify(contactRelationMapper, times(1)).deleteById(1L);
    }
}
