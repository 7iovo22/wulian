const api = require('../../utils/api');

Page({
  data: {
    stats: {
      total: 15,
      unhandled: 3,
      handled: 12
    },
    warningList: [],
    showFallModal: false,
    countdown: 30,
    countdownAngle: 0
  },

  countdownTimer: null,
  fallDetectionTimer: null,
  isPageActive: true,

  onLoad: function (options) {
    this.isPageActive = true;
    this.loadWarningList();
    this.simulateFallDetection();
  },

  onUnload: function () {
    this.isPageActive = false;
    this.clearAllTimers();
  },

  onHide: function () {
    this.isPageActive = false;
    this.clearAllTimers();
  },

  onShow: function () {
    this.isPageActive = true;
  },

  clearAllTimers: function () {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.fallDetectionTimer) {
      clearTimeout(this.fallDetectionTimer);
      this.fallDetectionTimer = null;
    }
  },

  loadWarningList: function () {
    const mockWarnings = [
      {
        id: 1,
        alarmType: 'fall',
        alarmContent: '检测到摔倒，已自动发送位置给紧急联系人',
        location: '北京市朝阳区望京SOHO',
        handleStatus: 0,
        createTime: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        alarmType: 'fatigue',
        alarmContent: '疲劳等级达到中度，建议休息30分钟',
        location: '北京市海淀区中关村',
        handleStatus: 0,
        createTime: '2024-01-15 09:15:00'
      },
      {
        id: 3,
        alarmType: 'speed',
        alarmContent: '检测到超速行驶，当前速度55km/h',
        location: '北京市西城区长安街',
        handleStatus: 1,
        createTime: '2024-01-15 08:45:00'
      },
      {
        id: 4,
        alarmType: 'heat',
        alarmContent: '体温偏高，请注意防暑降温',
        location: '北京市东城区王府井',
        handleStatus: 1,
        createTime: '2024-01-14 14:20:00'
      },
      {
        id: 5,
        alarmType: 'danger',
        alarmContent: '检测到危险驾驶行为，请减速慢行',
        location: '北京市丰台区南三环',
        handleStatus: 1,
        createTime: '2024-01-14 11:30:00'
      }
    ];

    this.setData({
      warningList: mockWarnings
    });
  },

  simulateFallDetection: function () {
    if (!this.isPageActive) return;

    this.fallDetectionTimer = setTimeout(() => {
      if (!this.isPageActive) return;
      if (!this.data.showFallModal) {
        this.showFallModal();
      }
    }, 8000);
  },

  showFallModal: function () {
    this.setData({
      showFallModal: true,
      countdown: 30
    });

    this.startCountdown();
  },

  startCountdown: function () {
    if (!this.isPageActive) return;

    this.countdownTimer = setInterval(() => {
      if (!this.isPageActive) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        return;
      }

      const countdown = this.data.countdown - 1;
      const countdownAngle = (countdown / 30) * 360;

      if (countdown <= 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.confirmFallAlarm();
      } else {
        this.setData({
          countdown: countdown,
          countdownAngle: countdownAngle
        });
      }
    }, 1000);
  },

  cancelFallAlarm: function () {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.setData({
      showFallModal: false,
      countdown: 30
    });

    wx.showToast({
      title: '已取消报警',
      icon: 'success'
    });
  },

  confirmFallAlarm: function () {
    if (!this.isPageActive) return;

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.setData({
      showFallModal: false
    });

    wx.showToast({
      title: '已触发SOS求助',
      icon: 'none',
      duration: 2000
    });

    setTimeout(() => {
      if (this.isPageActive) {
        wx.navigateTo({
          url: '/pages/sos/index?triggered=1'
        });
      }
    }, 1500);
  },

  triggerSOS: function () {
    if (!this.isPageActive) return;

    wx.vibrateLong();
    wx.showToast({
      title: 'SOS已触发',
      icon: 'none',
      duration: 2000
    });

    setTimeout(() => {
      if (this.isPageActive) {
        wx.navigateTo({
          url: '/pages/sos/index?triggered=1'
        });
      }
    }, 1000);
  },

  onSOSClick: function () {
    wx.showToast({
      title: '请长按触发SOS',
      icon: 'none'
    });
  },

  getWarningColor: function (type) {
    const colors = {
      fall: '#DC143C',
      fatigue: '#FF8C00',
      speed: '#FFD700',
      heat: '#FF6347',
      danger: '#9B59B6'
    };
    return colors[type] || '#1E90FF';
  },

  getWarningIcon: function (type) {
    const icons = {
      fall: '⚠️',
      fatigue: '😴',
      speed: '⚡',
      heat: '🔥',
      danger: '🚨'
    };
    return icons[type] || '📌';
  },

  getWarningTypeName: function (type) {
    const types = {
      fall: '摔倒检测',
      fatigue: '疲劳预警',
      speed: '超速警告',
      heat: '中暑预警',
      danger: '危险驾驶'
    };
    return types[type] || type;
  },

  getStatusColor: function (status) {
    return status === 0 ? '#FF8C00' : '#32CD32';
  },

  formatTime: function (timeStr) {
    return timeStr.split(' ')[1] || timeStr;
  },

  viewWarningDetail: function (e) {
    const warning = e.currentTarget.dataset.warning;
    wx.showModal({
      title: this.getWarningTypeName(warning.alarmType),
      content: warning.alarmContent + '\n\n位置: ' + warning.location + '\n时间: ' + warning.createTime,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  showFilter: function () {
    wx.showToast({
      title: '筛选功能开发中',
      icon: 'none'
    });
  },

  goToHealth: function () {
    wx.navigateTo({
      url: '/pages/health/index'
    });
  },

  goToFatigue: function () {
    wx.showToast({
      title: '疲劳检测功能开发中',
      icon: 'none'
    });
  },

  goToEvidence: function () {
    wx.showToast({
      title: '证据管理功能开发中',
      icon: 'none'
    });
  },

  goToMutual: function () {
    wx.showToast({
      title: '骑手互助功能开发中',
      icon: 'none'
    });
  }
});