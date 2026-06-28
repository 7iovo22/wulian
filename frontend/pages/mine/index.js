const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    userInfo: {},
    hasDevice: false,
    stats: {
      rides: 128,
      distance: 3560,
      warnings: 15,
      score: 88
    }
  },

  onLoad: function (options) {
    this.loadUserInfo();
  },

  onShow: function () {
    this.loadUserInfo();
  },

  loadUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo');
    const deviceInfo = wx.getStorageSync('deviceInfo');
    
    this.setData({
      userInfo: userInfo ? JSON.parse(userInfo) : {},
      hasDevice: !!deviceInfo
    });
  },

  editUserInfo: function () {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  },

  goToDevice: function () {
    wx.switchTab({
      url: '/pages/device/index'
    });
  },

  goToContacts: function () {
    wx.navigateTo({
      url: '/pages/contacts/index'
    });
  },

  goToHealth: function () {
    wx.navigateTo({
      url: '/pages/health/index'
    });
  },

  goToReport: function () {
    wx.showToast({
      title: '报告功能开发中',
      icon: 'none'
    });
  },

  goToWarning: function () {
    wx.navigateTo({
      url: '/pages/warning/index'
    });
  },

  goToSafety: function () {
    wx.switchTab({
      url: '/pages/safety/index'
    });
  },

  goToBind: function () {
    wx.navigateTo({
      url: '/pages/bind/index'
    });
  },

  goToSettings: function () {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
  },

  goToHelp: function () {
    wx.showToast({
      title: '帮助功能开发中',
      icon: 'none'
    });
  },

  goToAbout: function () {
    wx.showModal({
      title: '骑安智盔',
      content: '版本：1.0.0\n\n骑安智盔是一款面向外卖骑手的AI驱动智能安全监护小程序，通过实时接入智能头盔硬件设备数据，为骑手提供全自动实时安全监护服务。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  logout: function () {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          wx.reLaunch({
            url: '/pages/login/index'
          });
        }
      }
    });
  }
});