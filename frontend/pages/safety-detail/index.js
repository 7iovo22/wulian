const api = require('../../utils/api');

Page({
  data: {
    eventId: '',
    eventData: {}
  },

  onLoad: function (options) {
    this.setData({ eventId: options.id || '1' });
    this.loadEventDetail();
  },

  loadEventDetail: function () {
    wx.showLoading({ title: '加载中...' });

    const mockEvents = {
      '1': {
        id: 1,
        eventType: 'sos',
        description: '用户触发紧急求助SOS',
        location: '北京市朝阳区望京街道望京SOHO T3',
        desensitizedLocation: '北京市朝阳区',
        riskLevel: 'critical',
        status: 'OPEN',
        statusClass: 'open',
        createTime: '2024-01-15 10:30:00',
        telemetry: {
          acceleration: 'X:4.2g Y:1.8g Z:-0.5g',
          rotation: '125°/s',
          heartRate: 98,
          temperature: 36.8,
          speed: 0,
          deviceStatus: '正常'
        },
        timeline: [
          { time: '10:29:55', event: '检测到长按SOS按钮', type: 'warning', data: '压力值: 25N' },
          { time: '10:30:00', event: 'SOS触发成功', type: 'danger', data: '信号已发送' },
          { time: '10:30:05', event: '紧急联系人已通知', type: 'normal', data: '已拨打3位联系人' }
        ],
        recommendations: [
          '保持冷静，等待救援',
          '确认周围环境安全',
          '如有需要可再次触发SOS'
        ]
      },
      '2': {
        id: 2,
        eventType: 'fall',
        description: '检测到摔倒，已自动发送位置给紧急联系人',
        location: '北京市海淀区中关村大街27号',
        desensitizedLocation: '北京市海淀区',
        riskLevel: 'high',
        status: 'OPEN',
        statusClass: 'open',
        createTime: '2024-01-15 09:15:00',
        telemetry: {
          acceleration: 'X:3.5g Y:2.1g Z:-1.2g',
          rotation: '98°/s',
          heartRate: 105,
          temperature: 37.1,
          speed: 25,
          deviceStatus: '正常'
        },
        timeline: [
          { time: '09:14:55', event: '检测到异常加速度', type: 'warning', data: 'X:3.5g Y:2.1g' },
          { time: '09:14:58', event: '检测到剧烈旋转', type: 'warning', data: '角速度: 98°/s' },
          { time: '09:15:00', event: '摔倒确认', type: 'danger', data: '撞击力: 1200N' },
          { time: '09:15:05', event: 'SOS已触发', type: 'danger', data: '位置已发送' },
          { time: '09:15:10', event: '心率监测正常', type: 'normal', data: '心率: 105bpm' }
        ],
        recommendations: [
          '立即检查身体状况',
          '如受伤请及时就医',
          '头盔已有效保护头部',
          '建议休息后再骑行'
        ]
      },
      '3': {
        id: 3,
        eventType: 'collision',
        description: '检测到碰撞，头盔受到冲击力',
        location: '北京市西城区长安街1号',
        desensitizedLocation: '北京市西城区',
        riskLevel: 'medium',
        status: 'ACKED',
        statusClass: 'acked',
        createTime: '2024-01-15 08:45:00',
        telemetry: {
          acceleration: 'X:2.8g Y:0.5g Z:0.3g',
          rotation: '45°/s',
          heartRate: 88,
          temperature: 36.5,
          speed: 35,
          deviceStatus: '正常'
        },
        timeline: [
          { time: '08:44:58', event: '检测到冲击', type: 'warning', data: 'X:2.8g' },
          { time: '08:45:00', event: '碰撞事件记录', type: 'warning', data: '冲击力: 800N' },
          { time: '08:45:05', event: '状态确认', type: 'normal', data: '设备正常' }
        ],
        recommendations: [
          '检查头盔是否损坏',
          '减速行驶确保安全',
          '注意观察周围路况'
        ]
      },
      '4': {
        id: 4,
        eventType: 'stationary',
        description: '检测到长时间静止，可能存在异常',
        location: '北京市东城区王府井大街',
        desensitizedLocation: '北京市东城区',
        riskLevel: 'low',
        status: 'RESOLVED',
        statusClass: 'resolved',
        createTime: '2024-01-14 14:20:00',
        telemetry: {
          acceleration: 'X:0.1g Y:0.0g Z:1.0g',
          rotation: '0°/s',
          heartRate: 72,
          temperature: 36.3,
          speed: 0,
          deviceStatus: '正常'
        },
        timeline: [
          { time: '14:15:00', event: '检测到静止状态', type: 'warning', data: '速度: 0km/h' },
          { time: '14:20:00', event: '持续静止提醒', type: 'warning', data: '已静止5分钟' },
          { time: '14:25:00', event: '用户确认安全', type: 'normal', data: '手动解除预警' }
        ],
        recommendations: [
          '注意休息，避免疲劳驾驶',
          '确认设备连接正常'
        ]
      },
      '5': {
        id: 5,
        eventType: 'fall',
        description: '检测到摔倒事件，已确认安全',
        location: '北京市丰台区南三环中路',
        desensitizedLocation: '北京市丰台区',
        riskLevel: 'high',
        status: 'RESOLVED',
        statusClass: 'resolved',
        createTime: '2024-01-14 11:30:00',
        telemetry: {
          acceleration: 'X:4.1g Y:1.5g Z:-0.8g',
          rotation: '110°/s',
          heartRate: 95,
          temperature: 36.7,
          speed: 22,
          deviceStatus: '正常'
        },
        timeline: [
          { time: '11:29:56', event: '检测到异常运动', type: 'warning', data: 'X:4.1g' },
          { time: '11:30:00', event: '摔倒检测', type: 'danger', data: '撞击力: 1100N' },
          { time: '11:30:10', event: '用户反馈安全', type: 'normal', data: '已确认' }
        ],
        recommendations: [
          '检查身体有无受伤',
          '确认头盔状态'
        ]
      },
      '6': {
        id: 6,
        eventType: 'sos',
        description: 'SOS紧急求助已取消',
        location: '北京市石景山区古城大街',
        desensitizedLocation: '北京市石景山区',
        riskLevel: 'low',
        status: 'CANCELLED',
        statusClass: 'cancelled',
        createTime: '2024-01-14 10:00:00',
        telemetry: {
          acceleration: 'X:0.5g Y:0.3g Z:1.0g',
          rotation: '5°/s',
          heartRate: 70,
          temperature: 36.2,
          speed: 0,
          deviceStatus: '正常'
        },
        timeline: [
          { time: '09:59:55', event: 'SOS触发', type: 'danger', data: '信号发送中' },
          { time: '10:00:00', event: '用户取消', type: 'normal', data: '已取消求助' }
        ],
        recommendations: [
          '确认周围环境安全',
          '如误触请留意操作方式'
        ]
      }
    };

    const eventData = mockEvents[this.data.eventId] || mockEvents['1'];
    
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ eventData });
    }, 500);
  },

  getEventColor: function (type) {
    const colors = {
      sos: '#DC143C',
      fall: '#DC143C',
      collision: '#FF8C00',
      stationary: '#1E90FF'
    };
    return colors[type] || '#9B59B6';
  },

  getEventIcon: function (type) {
    const icons = {
      sos: '🚨',
      fall: '⚠️',
      collision: '💥',
      stationary: '⏸️'
    };
    return icons[type] || '📌';
  },

  getEventTypeText: function (type) {
    const types = {
      sos: 'SOS',
      fall: '摔倒',
      collision: '碰撞',
      stationary: '长时间静止'
    };
    return types[type] || type;
  },

  getEventTypeBg: function (type) {
    const colors = {
      sos: 'rgba(220, 20, 60, 0.1)',
      fall: 'rgba(220, 20, 60, 0.1)',
      collision: 'rgba(255, 140, 0, 0.1)',
      stationary: 'rgba(30, 144, 255, 0.1)'
    };
    return colors[type] || 'rgba(155, 89, 182, 0.1)';
  },

  getEventTypeColor: function (type) {
    const colors = {
      sos: '#DC143C',
      fall: '#DC143C',
      collision: '#FF8C00',
      stationary: '#1E90FF'
    };
    return colors[type] || '#9B59B6';
  },

  getRiskColor: function (level) {
    const colors = {
      critical: '#DC143C',
      high: '#FF8C00',
      medium: '#FFD700',
      low: '#32CD32'
    };
    return colors[level] || '#78909C';
  },

  getRiskText: function (level) {
    const texts = {
      critical: '紧急',
      high: '高',
      medium: '中',
      low: '低'
    };
    return texts[level] || level;
  },

  getStatusText: function (status) {
    const texts = {
      OPEN: '待处理',
      ACKED: '已确认',
      RESOLVED: '已解决',
      CANCELLED: '已取消'
    };
    return texts[status] || status;
  },

  goBack: function () {
    wx.navigateBack();
  },

  copyDetail: function () {
    const data = this.data.eventData;
    let text = `【事件详情】\n`;
    text += `事件类型：${this.getEventTypeText(data.eventType)}\n`;
    text += `风险等级：${this.getRiskText(data.riskLevel)}\n`;
    text += `处理状态：${this.getStatusText(data.status)}\n`;
    text += `发生时间：${data.createTime}\n`;
    text += `地理位置：${data.desensitizedLocation}\n`;
    text += `事件描述：${data.description}\n\n`;
    
    text += `【传感数据】\n`;
    text += `加速度：${data.telemetry?.acceleration || '--'}\n`;
    text += `角速度：${data.telemetry?.rotation || '--'}\n`;
    text += `心率：${data.telemetry?.heartRate || '--'}bpm\n`;
    text += `体温：${data.telemetry?.temperature || '--'}℃\n`;
    text += `速度：${data.telemetry?.speed || '--'}km/h\n`;

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },

  goToReport: function () {
    wx.navigateTo({
      url: `/pages/event-report/index?eventId=${this.data.eventId}`
    });
  }
});