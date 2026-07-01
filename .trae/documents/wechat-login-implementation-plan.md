# 微信快捷登录功能实现计划

## 背景与目标

实现微信快捷登录功能，用户点击微信登录按钮后，通过微信授权获取用户头像、昵称和设备信息，自动创建骑手账号并登录系统。

## 现有代码分析

- **前端登录页** (`frontend/pages/login/index.js`): 已有 `wechatLogin()` 函数，但描述文本未提及设备信息，且未收集设备信息
- **后端 WechatLoginRequest**: 缺少 `deviceInfo` 字段
- **后端 User 实体**: 缺少 `deviceInfo` 字段
- **后端 UserServiceImpl**: 未保存设备信息

## 实现步骤

### 步骤 1: 后端 - 更新 DTO

**文件**: `backend/src/main/java/com/example/qiansan/dto/request/WechatLoginRequest.java`

新增字段:
```java
private Map<String, Object> deviceInfo;
```

### 步骤 2: 后端 - 更新实体

**文件**: `backend/src/main/java/com/example/qiansan/entity/User.java`

新增字段:
```java
private String deviceInfo;  // 存储设备信息JSON
```

### 步骤 3: 后端 - 更新服务

**文件**: `backend/src/main/java/com/example/qiansan/service/impl/UserServiceImpl.java`

- 新增 `ObjectMapper` 字段
- 更新 `wechatLogin()` 方法，序列化并保存 `deviceInfo`

### 步骤 4: 数据库迁移

**SQL**:
```sql
ALTER TABLE user ADD COLUMN device_info TEXT COMMENT '设备信息JSON' AFTER rider_id;
```

### 步骤 5: 前端 - 更新授权描述

**文件**: `frontend/pages/login/index.js`

更新 `wx.getUserProfile` 描述:
```javascript
desc: '用于完善骑手个人资料，获取用户头像、昵称和设备信息'
```

### 步骤 6: 前端 - 收集设备信息

**文件**: `frontend/pages/login/index.js`

在获取用户信息后，调用 `wx.getSystemInfo` 收集设备信息（platform, model, system, version, brand, screenWidth, screenHeight）

### 步骤 7: 前端 - 更新 API 调用

**文件**: `frontend/pages/login/index.js`

API 调用新增 `deviceInfo` 参数:
```javascript
api.user.wechatLogin({
  code: code,
  nickName: nickName,
  avatar: avatarUrl,
  deviceInfo: deviceInfo
});
```

## 关键文件修改清单

| 文件 | 修改内容 |
|------|----------|
| `backend/src/main/java/com/example/qiansan/dto/request/WechatLoginRequest.java` | 新增 deviceInfo 字段 |
| `backend/src/main/java/com/example/qiansan/entity/User.java` | 新增 deviceInfo 字段 |
| `backend/src/main/java/com/example/qiansan/service/impl/UserServiceImpl.java` | 保存设备信息到数据库 |
| `frontend/pages/login/index.js` | 更新授权描述、收集并发送设备信息 |

## 验证方案

1. **授权流程测试**: 点击微信登录，验证授权弹窗显示正确描述
2. **账号创建测试**: 使用新微信号登录，验证数据库中 user 表生成新记录，phone 字段为空
3. **设备信息验证**: 登录后查询数据库 device_info 字段，确认为有效 JSON
4. **登录跳转测试**: 授权成功后验证跳转到首页
5. **我的页面渲染测试**: 验证用户头像、昵称正确显示

## 实现顺序

1. 后端修改（步骤 1-4）
2. 前端修改（步骤 5-7）
3. 联合测试验证
