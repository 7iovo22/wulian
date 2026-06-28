# 骑安智盔微信小程序 - 开发说明

## 项目简介

本项目是基于微信小程序原生框架开发的"骑安智盔"智能骑行安全应用的前端代码。项目严格遵循需求文档、技术架构文档和后端API文档进行开发。

## 项目结构

```
frontend/
├── app.js              # 应用入口
├── app.json            # 应用配置
├── app.wxss            # 全局样式
├── project.config.json # 项目配置文件
├── sitemap.json        # SEO配置文件
├── images/             # 图片资源
│   └── tab/           # TabBar图标
├── pages/              # 页面文件
│   ├── login/         # 登录页面
│   ├── index/         # 首页
│   ├── device/        # 设备管理页面
│   ├── safety/        # 安全中心页面
│   ├── mine/           # 个人中心页面
│   ├── bind/          # 设备绑定页面
│   ├── sos/           # SOS紧急求助页面
│   ├── warning/       # 预警详情页面
│   ├── health/        # 健康监测页面
│   └── contacts/      # 紧急联系人页面
├── utils/              # 工具函数
│   ├── api.js         # API接口封装
│   ├── request.js     # HTTP请求封装
│   ├── storage.js     # 本地存储封装
│   └── helpers.js     # 常用工具函数
└── scripts/            # 脚本文件
    └── generate-icons.js # 图标生成脚本
```

## 功能特性

### 1. 用户认证
- 手机号+验证码登录
- 微信一键登录
- 用户角色选择（骑手/紧急联系人）

### 2. 设备管理
- 智能头盔绑定
- LED灯控制
- 语音播报设置
- 设备状态实时显示

### 3. 安全中心
- 安全评分展示
- 风险预警卡片
- SOS紧急求助
- 预警中心

### 4. 健康监测
- 心率监测
- 体温监测
- 历史趋势图表
- 健康记录

### 5. 个人中心
- 用户信息管理
- 紧急联系人管理
- 骑行数据统计
- 设备绑定管理

## 技术规范

### 开发规范
1. 所有后端接口调用严格遵循API文档
2. 使用微信小程序原生框架
3. 所有图片资源使用picsum.photos占位服务
4. 代码遵循微信小程序开发规范

### 性能要求
- 首屏加载时间 ≤ 2秒
- 页面切换时间 ≤ 300ms
- 网络请求超时时间 10秒
- 本地存储使用同步API

### 兼容性
- 支持iOS和Android双平台
- 适配不同屏幕尺寸
- 使用rpx单位实现响应式布局

### 安全规范
- 用户敏感信息加密存储
- API请求携带Token认证
- 危险操作需要二次确认

## 如何运行

### 1. 环境要求
- 微信开发者工具（最新版本）
- Node.js（用于图标生成）

### 2. 项目配置

#### 修改app.json中的appid
```json
{
  "appid": "your-appid"
}
```

#### 修改project.config.json中的appid
```json
{
  "appid": "your-appid"
}
```

### 3. 导入项目
1. 打开微信开发者工具
2. 点击"导入项目"
3. 选择 `d:\wulian-proje\frontend` 目录
4. 填写AppID
5. 点击"确定"

### 4. 配置服务器域名
在微信开发者工具中：
1. 进入"项目配置"
2. 点击"详情"
3. 选择"项目配置"
4. 配置"服务器域名"中的request合法域名

### 5. 生成图标（如需要）
```bash
cd d:\wulian-proje\frontend\scripts
node generate-icons.js
```

## API接口说明

所有API接口定义在 `utils/api.js` 中，主要包括：

### 用户模块
- `POST /api/user/wechat/login` - 微信登录
- `POST /api/user/phone/bind` - 手机号绑定
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/info` - 更新用户信息

### 设备模块
- `POST /api/device/bind` - 绑定设备
- `DELETE /api/device/unbind/{id}` - 解绑设备
- `GET /api/device/status` - 获取设备状态
- `PUT /api/device/led` - 控制LED灯

### SOS模块
- `POST /api/sos/trigger` - 触发SOS
- `POST /api/sos/cancel` - 取消SOS
- `GET /api/sos/history` - SOS历史记录

### 预警模块
- `GET /api/warning/list` - 预警列表
- `GET /api/warning/detail/{id}` - 预警详情
- `PUT /api/warning/handle/{id}` - 处理预警

### 健康模块
- `GET /api/health/current` - 当前健康数据
- `GET /api/health/history` - 健康历史
- `GET /api/health/heartrate` - 心率数据

## 开发说明

### 当前状态
- 所有页面已完成开发
- 所有API接口已封装
- Mock数据已配置，可独立运行演示

### 注意事项
1. **Mock数据**：当前所有API调用返回Mock数据，用于前端独立开发和演示
2. **真实环境**：接入真实后端时，只需修改 `utils/request.js` 中的baseURL
3. **图标资源**：tabBar图标已自动生成，如需自定义可替换 `images/tab/` 下的文件

### 自定义配置
修改 `app.js` 中的全局配置：
```javascript
globalData: {
  apiBaseUrl: 'https://your-api-domain.com',
  mqttBroker: 'your-mqtt-broker-url',
  // ...
}
```

## 技术支持

如遇到问题，请检查：
1. AppID是否正确配置
2. 服务器域名是否已配置
3. 微信开发者工具版本是否最新
4. 网络连接是否正常

## 版本信息

- **版本号**: 1.0.0
- **更新时间**: 2024年
- **框架版本**: 微信小程序 2.19.4
- **最低基础库版本**: 2.19.4

## 许可证

本项目仅供开发学习使用，如需商用请联系版权所有方。