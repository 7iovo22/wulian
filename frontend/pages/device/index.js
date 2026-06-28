const api = require('../../utils/api');

Page({
  data: {
    deviceInfo: {},
    deviceConnected: true,
    bindTime: '2024-01-15',
    ledStatus: 1,
    voiceEnabled: true,
    volume: 75,
    realtimeData: {
      heartRate: 75,
      temperature: 36.5,
      speed: 25.5,
      posture: 'normal'
    }
  },

  updateTimer: null,
  isPageActive: false,

  onLoad: function (options) {
    this.isPageActive = true;
    this.loadDeviceInfo();
  },

  onShow: function () {
    this.isPageActive = true;
    this.startDataUpdate();
  },

  onHide: function () {
    this.isPageActive = false;
    this.clearTimer();
  },

  onUnload: function () {
    this.isPageActive = false;
    this.clearTimer();
  },

  clearTimer: function () {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  },

  loadDeviceInfo: function () {
    const deviceInfo = wx.getStorageSync('deviceInfo');
    if (deviceInfo) {
      this.setData({
        deviceInfo: JSON.parse(deviceInfo),
        deviceConnected: JSON.parse(deviceInfo).status === 1
      });
    }
  },

  startDataUpdate: function () {
    this.clearTimer();

    this.updateTimer = setInterval(() => {
      if (!this.isPageActive) {
        this.clearTimer();
        return;
      }

      const newData = {
        heartRate: Math.floor(60 + Math.random() * 30),
        temperature: (36.0 + Math.random() * 1.5).toFixed(1),
        speed: (15 + Math.random() * 20).toFixed(1),
        posture: ['normal', 'normal', 'normal', 'low_head'][Math.floor(Math.random() * 4)]
      };
      this.setData({
        realtimeData: newData
      });
    }, 3000);
  },

  getBatteryColor: function (battery) {
    if (battery > 50) {
      return 'linear-gradient(90deg, #32CD32 0%, #90EE90 100%)';
    } else if (battery > 20) {
      return 'linear-gradient(90deg, #FF8C00 0%, #FFA500 100%)';
    } else {
      return 'linear-gradient(90deg, #DC143C 0%, #FF4444 100%)';
    }
  },

  getBatteryStatus: function (battery) {
    if (battery > 80) {
      return '电量充足';
    } else if (battery > 50) {
      return '电量正常';
    } else if (battery > 20) {
      return '建议充电';
    } else {
      return '电量过低，请立即充电';
    }
  },

  getPostureLabel: function (posture) {
    const labels = {
      normal: '正常',
      low_head: '低头',
      tilt: '倾斜'
    };
    return labels[posture] || posture;
  },

  toggleLED: function (e) {
    const enabled = e.detail.value;
    if (!enabled) {
      this.setData({
        ledStatus: 0
      });
      wx.showToast({
        title: 'LED已关闭',
        icon: 'none'
      });
    } else {
      this.setData({
        ledStatus: 1
      });
      wx.showToast({
        title: 'LED已开启',
        icon: 'none'
      });
    }
  },

  setLEDMode: function (e) {
    const mode = parseInt(e.currentTarget.dataset.mode);
    this.setData({
      ledStatus: mode
    });

    const modeNames = ['关闭', '常亮', '闪烁', 'SOS'];
    wx.showToast({
      title: `已切换到${modeNames[mode]}模式`,
      icon: 'none'
    });
  },

  toggleVoice: function (e) {
    const enabled = e.detail.value;
    this.setData({
      voiceEnabled: enabled
    });

    wx.showToast({
      title: enabled ? '语音播报已开启' : '语音播报已关闭',
      icon: 'none'
    });
  },

  onVolumeChange: function (e) {
    this.setData({
      volume: e.detail.value
    });
  },

  syncData: function () {
    wx.showLoading({
      title: '同步中...',
      mask: true
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '同步完成',
        icon: 'success'
      });
    }, 1500);
  },

  updateFirmware: function () {
    wx.showLoading({
      title: '检查更新...',
      mask: true
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '当前已是最新版本',
        icon: 'success'
      });
    }, 1500);
  },

  unbindDevice: function () {
    wx.showModal({
      title: '确认解绑',
      content: '解绑后将无法接收设备数据，确定要解绑吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '解绑中...',
            mask: true
          });

          setTimeout(() => {
            wx.hideLoading();
            wx.removeStorageSync('deviceInfo');
            this.setData({
              deviceInfo: {},
              deviceConnected: false
            });
            wx.showToast({
              title: '解绑成功',
              icon: 'success'
            });
          }, 1500);
        }
      }
    });
  }
});