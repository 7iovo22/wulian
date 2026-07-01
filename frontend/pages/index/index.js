const app = getApp();
const api = require('../../utils/api');
const { formatNumber, formatText, formatTime } = require('../../utils/helpers');

Page({
  data: {
    userInfo: {},
    deviceInfo: {},
    safetyScore: 85,
    scoreAngle: 306,
    todayRides: 12,
    totalDistance: 356,
    warningCount: 3,
    riskList: [],
    healthData: {
      heartRate: 75,
      temperature: 36.5,
      speed: 25.5,
      posture: 'normal'
    },
    dailyReport: {
      rideDistance: 35.5,
      avgSpeed: 25.3,
      safetyScore: 85,
      warningCount: 2,
      suggestion: '今日骑行状态良好，建议每2小时休息一次'
    }
  },

  onLoad: function (options) {
    this.loadData();
  },

  onShow: function () {
    this.loadData();
  },

  loadData: function () {
    const userInfo = wx.getStorageSync('userInfo');
    const deviceInfo = wx.getStorageSync('deviceInfo');

    this.setData({
      userInfo: userInfo ? JSON.parse(userInfo) : {},
      deviceInfo: deviceInfo ? JSON.parse(deviceInfo) : {}
    });

    this.loadRiskList();
    this.loadHealthData();
    this.loadDailyReport();
  },

  loadRiskList: function () {
    const mockRisks = [
      {
        id: 1,
        type: 'fall',
        level: 'high',
        content: '检测到摔倒，已自动发送位置给紧急联系人',
        location: '北京市朝阳区',
        time: '10:30'
      },
      {
        id: 2,
        type: 'fatigue',
        level: 'medium',
        content: '疲劳等级达到中度，建议休息',
        location: '北京市海淀区',
        time: '09:15'
      },
      {
        id: 3,
        type: 'speed',
        level: 'low',
        content: '检测到超速行驶，请减速',
        location: '北京市西城区',
        time: '08:45'
      }
    ];

    this.setData({
      riskList: mockRisks
    });
  },

  loadHealthData: function () {
    const mockData = {
      heartRate: Math.floor(65 + Math.random() * 20),
      temperature: (36.0 + Math.random() * 1.0).toFixed(1),
      speed: (20 + Math.random() * 15).toFixed(1),
      posture: 'normal'
    };

    this.setData({
      healthData: mockData
    });
  },

  loadDailyReport: function () {
    const report = {
      rideDistance: (30 + Math.random() * 20).toFixed(1),
      avgSpeed: (22 + Math.random() * 8).toFixed(1),
      safetyScore: Math.floor(70 + Math.random() * 25),
      warningCount: Math.floor(Math.random() * 5),
      suggestion: this.getRandomSuggestion()
    };

    const scoreAngle = (report.safetyScore / 100) * 360;

    this.setData({
      dailyReport: report,
      safetyScore: report.safetyScore,
      scoreAngle: scoreAngle
    });
  },

  getRandomSuggestion: function () {
    const suggestions = [
      '今日骑行状态良好，建议每2小时休息一次',
      '注意保持骑行姿势，避免长时间低头',
      '心率正常，继续保持',
      '今日骑行里程较多，建议适当休息',
      '注意交通安全，减速慢行'
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  },

  getRiskColor: function (level) {
    const colors = {
      high: '#DC143C',
      medium: '#FF8C00',
      low: '#32CD32'
    };
    return colors[level] || '#999999';
  },

  getRiskTypeName: function (type) {
    const types = {
      fall: '摔倒检测',
      fatigue: '疲劳预警',
      speed: '超速警告',
      heat: '中暑预警',
      danger: '危险驾驶'
    };
    return types[type] || type;
  },

  getPostureText: function (posture) {
    const texts = {
      normal: '正常',
      low_head: '低头',
      tilt: '倾斜'
    };
    return texts[posture] || posture;
  },

  goToWarning: function () {
    wx.navigateTo({
      url: '/pages/warning/index'
    });
  },

  goToSOS: function () {
    wx.navigateTo({
      url: '/pages/sos/index'
    });
  },

  goToHealth: function () {
    wx.navigateTo({
      url: '/pages/health/index'
    });
  },

  goToLocation: function () {
    wx.navigateTo({
      url: '/pages/location-share/index'
    });
  },

  goToReport: function () {
    wx.navigateTo({
      url: '/pages/daily-report/index'
    });
  },

  onPullDownRefresh: function () {
    this.loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});