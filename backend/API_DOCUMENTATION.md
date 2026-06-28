# 骑安智盔 - 后端接口文档

## 1. 接口概述

本文档描述了骑安智盔后端服务的RESTful API接口规范，所有接口均遵循RESTful设计原则。

### 1.1 基础信息

- **API版本**: v1.0
- **基础路径**: `/api`
- **协议**: HTTPS / HTTP
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 通用响应格式

```json
{
    "code": 200,
    "message": "success",
    "data": {}
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | Integer | 状态码，200表示成功 |
| message | String | 响应消息 |
| data | Object | 响应数据 |

### 1.3 状态码说明

| 状态码 | 说明 |
| --- | --- |
| 200 | 请求成功 |
| 400 | 参数验证失败 |
| 401 | 未授权，token无效或过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 2. 用户相关接口

### 2.1 微信登录

**接口地址**: `POST /api/user/wechat/login`

**请求体**:
```json
{
    "code": "string",
    "encryptedData": "string",
    "iv": "string"
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| code | String | 是 | 微信授权code |
| encryptedData | String | 否 | 加密数据 |
| iv | String | 否 | 解密向量 |

**成功响应**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "phone": "13800138000",
        "nickname": "骑手昵称",
        "avatar": "string",
        "role": "rider",
        "token": "JWT_TOKEN"
    }
}
```

### 2.2 绑定手机号

**接口地址**: `POST /api/user/phone/bind`

**请求头**: `X-User-Id: Long`

**请求体**:
```json
{
    "phone": "string",
    "code": "string"
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| phone | String | 是 | 手机号 |
| code | String | 是 | 验证码 |

### 2.3 获取用户信息

**接口地址**: `GET /api/user/info`

**请求头**: `X-User-Id: Long`

### 2.4 更新用户信息

**接口地址**: `PUT /api/user/info`

**请求头**: `X-User-Id: Long`

**请求体**:
```json
{
    "nickname": "string",
    "avatar": "string"
}
```

### 2.5 获取紧急联系人列表

**接口地址**: `GET /api/user/contacts`

**请求头**: `X-User-Id: Long`

**成功响应**:
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "riderId": 1,
            "contactName": "家人姓名",
            "contactPhone": "13900139000"
        }
    ]
}
```

### 2.6 添加紧急联系人

**接口地址**: `POST /api/user/contacts`

**请求体**:
```json
{
    "riderId": 1,
    "contactName": "string",
    "contactPhone": "string"
}
```

### 2.7 删除紧急联系人

**接口地址**: `DELETE /api/user/contacts/{id}`

**路径参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 联系人ID |

---

## 3. 设备相关接口

### 3.1 绑定设备

**接口地址**: `POST /api/device/bind`

**请求头**: `X-User-Id: Long`

**请求体**:
```json
{
    "deviceSn": "string",
    "bindCode": "string"
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| deviceSn | String | 是 | 设备序列号 |
| bindCode | String | 是 | 绑定码 |

### 3.2 解绑设备

**接口地址**: `DELETE /api/device/unbind/{id}`

**路径参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 设备ID |

### 3.3 获取设备状态

**接口地址**: `GET /api/device/status`

**请求头**: `X-User-Id: Long`

**成功响应**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "deviceSn": "DEVICE_SN",
        "riderId": 1,
        "status": 1,
        "battery": 85,
        "firmwareVersion": "1.0.0"
    }
}
```

### 3.4 控制LED状态

**接口地址**: `PUT /api/device/led`

**请求头**: `X-User-Id: Long`

**请求参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| status | Integer | LED状态：0关闭, 1常亮, 2闪烁, 3SOS |

### 3.5 设置语音播报

**接口地址**: `PUT /api/device/voice`

**请求头**: `X-User-Id: Long`

**请求参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| volume | Integer | 音量 0-100 |

### 3.6 获取最新设备数据

**接口地址**: `GET /api/device/data/latest`

**请求头**: `X-User-Id: Long`

---

## 4. SOS相关接口

### 4.1 触发SOS求助

**接口地址**: `POST /api/sos/trigger`

**请求体**:
```json
{
    "riderId": 1,
    "longitude": "string",
    "latitude": "string",
    "description": "string"
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| riderId | Long | 是 | 骑手ID |
| longitude | String | 是 | 经度 |
| latitude | String | 是 | 纬度 |
| description | String | 否 | 描述信息 |

### 4.2 取消SOS

**接口地址**: `POST /api/sos/cancel`

**请求头**: `X-User-Id: Long`

### 4.3 确认SOS

**接口地址**: `POST /api/sos/confirm`

**请求头**: `X-User-Id: Long`

### 4.4 获取SOS历史记录

**接口地址**: `GET /api/sos/history`

**请求头**: `X-User-Id: Long`

---

## 5. 位置相关接口

### 5.1 更新位置

**接口地址**: `POST /api/location/update`

**请求体**:
```json
{
    "riderId": 1,
    "deviceSn": "string",
    "longitude": "string",
    "latitude": "string"
}
```

### 5.2 获取实时位置

**接口地址**: `GET /api/location/realtime/{riderId}`

**路径参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| riderId | Long | 骑手ID |

### 5.3 获取历史轨迹

**接口地址**: `GET /api/location/history/{riderId}`

**路径参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| riderId | Long | 骑手ID |

**请求参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| startTime | String | 开始时间 |
| endTime | String | 结束时间 |

### 5.4 分享位置

**接口地址**: `POST /api/location/share`

**请求头**: `X-User-Id: Long`

---

## 6. 预警相关接口

### 6.1 获取预警列表

**接口地址**: `GET /api/warning/list`

**请求头**: `X-User-Id: Long`

**成功响应**:
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "riderId": 1,
            "alarmType": "fall",
            "alarmContent": "检测到摔倒",
            "longitude": "string",
            "latitude": "string",
            "handleStatus": 0,
            "createTime": "2024-01-15T10:30:00"
        }
    ]
}
```

### 6.2 获取预警详情

**接口地址**: `GET /api/warning/detail/{id}`

**路径参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 预警ID |

### 6.3 处理预警

**接口地址**: `PUT /api/warning/handle/{id}`

**路径参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 预警ID |

### 6.4 获取预警统计

**接口地址**: `GET /api/warning/stats`

**请求头**: `X-User-Id: Long`

**成功响应**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 10,
        "unhandled": 3
    }
}
```

---

## 7. 健康相关接口

### 7.1 获取当前健康数据

**接口地址**: `GET /api/health/current`

**请求头**: `X-User-Id: Long`

**成功响应**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "heartRate": 75,
        "temperature": 36.5,
        "posture": "normal",
        "speed": 25.5,
        "longitude": "string",
        "latitude": "string"
    }
}
```

### 7.2 获取健康历史数据

**接口地址**: `GET /api/health/history`

**请求头**: `X-User-Id: Long`

**请求参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| startTime | String | 开始时间 |
| endTime | String | 结束时间 |

### 7.3 获取心率数据

**接口地址**: `GET /api/health/heartrate`

**请求头**: `X-User-Id: Long`

**请求参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| startTime | String | 开始时间 |
| endTime | String | 结束时间 |

### 7.4 获取体温数据

**接口地址**: `GET /api/health/temperature`

**请求头**: `X-User-Id: Long`

**请求参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| startTime | String | 开始时间 |
| endTime | String | 结束时间 |

---

## 8. 报告相关接口

### 8.1 获取日报

**接口地址**: `GET /api/report/daily`

**请求头**: `X-User-Id: Long`

**成功响应**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "riderId": 1,
        "date": "2024-01-15",
        "rideDistance": 35.5,
        "avgSpeed": 25.3,
        "safetyScore": 85,
        "warningCount": 2,
        "behaviorAnalysis": "今日骑行状态良好",
        "suggestion": "建议每2小时休息一次"
    }
}
```

### 8.2 获取周报

**接口地址**: `GET /api/report/weekly`

**请求头**: `X-User-Id: Long`

### 8.3 获取月报

**接口地址**: `GET /api/report/monthly`

**请求头**: `X-User-Id: Long`

### 8.4 获取趋势数据

**接口地址**: `GET /api/report/trend`

**请求头**: `X-User-Id: Long`

---

## 9. 疲劳检测相关接口

### 9.1 获取当前疲劳等级

**接口地址**: `GET /api/fatigue/current`

**请求头**: `X-User-Id: Long`

**成功响应**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "riderId": 1,
        "fatigueLevel": 1,
        "fatigueLabel": "轻度疲劳",
        "rideDuration": 180,
        "suggestRest": false
    }
}
```

### 9.2 获取疲劳历史

**接口地址**: `GET /api/fatigue/history`

**请求头**: `X-User-Id: Long`

### 9.3 开始休息

**接口地址**: `POST /api/fatigue/rest/start`

**请求头**: `X-User-Id: Long`

### 9.4 完成休息

**接口地址**: `POST /api/fatigue/rest/complete`

**请求头**: `X-User-Id: Long`

### 9.5 设置接单状态

**接口地址**: `PUT /api/fatigue/dispatch`

**请求头**: `X-User-Id: Long`

**请求参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| status | Integer | 0正常, 1暂停 |

---

## 10. 证据相关接口

### 10.1 获取证据列表

**接口地址**: `GET /api/evidence/list`

**请求头**: `X-User-Id: Long`

### 10.2 生成证明报告

**接口地址**: `POST /api/evidence/report`

**请求头**: `X-User-Id: Long`

### 10.3 导出证据

**接口地址**: `GET /api/evidence/export/{id}`

**路径参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 证据ID |

### 10.4 提交理赔

**接口地址**: `POST /api/evidence/claim`

**请求头**: `X-User-Id: Long`

---

## 11. 互助相关接口

### 11.1 发布求助请求

**接口地址**: `POST /api/mutual/help/request`

**请求头**: `X-User-Id: Long`

**请求参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| type | String | 求助类型 |
| longitude | String | 经度 |
| latitude | String | 纬度 |

### 11.2 取消求助

**接口地址**: `POST /api/mutual/help/cancel`

**请求头**: `X-User-Id: Long`

**请求参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| requestId | String | 求助ID |

### 11.3 响应求助

**接口地址**: `POST /api/mutual/help/respond`

**请求头**: `X-User-Id: Long`

**请求参数**:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| requestId | String | 求助ID |

### 11.4 获取附近求助

**接口地址**: `GET /api/mutual/help/nearby`

**请求头**: `X-User-Id: Long`

### 11.5 获取求助历史

**接口地址**: `GET /api/mutual/help/history`

**请求头**: `X-User-Id: Long`

---

## 12. 附录

### 12.1 角色说明

| 角色 | 说明 |
| --- | --- |
| rider | 骑手 |
| contact | 紧急联系人 |
| admin | 管理员 |

### 12.2 预警类型说明

| 类型 | 说明 |
| --- | --- |
| fall | 摔倒检测 |
| sos | SOS紧急求助 |
| fatigue | 疲劳预警 |
| heat | 中暑预警 |
| danger | 危险驾驶 |

### 12.3 设备状态说明

| 状态 | 说明 |
| --- | --- |
| 0 | 离线 |
| 1 | 在线 |

---

**文档版本**: v1.0  
**创建日期**: 2026年5月25日  
**适用系统**: 骑安智盔后端服务