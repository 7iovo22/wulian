const app = getApp();
const api = require('../../utils/api');
const { formatPhone: maskPhone } = require('../../utils/helpers');

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

    const parsedUserInfo = userInfo ? JSON.parse(userInfo) : {};
    const phone = parsedUserInfo.phone || '';

    this.setData({
      userInfo: parsedUserInfo,
      hasDevice: !!deviceInfo,
      maskedPhone: phone ? maskPhone(phone) : ''
    });
  },

  editUserInfo: function () {
    wx.navigateTo({
      url: '/pages/settings/index'
    });
  },

  goToBindPhone: function () {
    wx.navigateTo({
      url: '/pages/settings/index'
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
    wx.navigateTo({
      url: '/pages/daily-report/index'
    });
  },

  goToRides: function () {
    wx.navigateTo({
      url: '/pages/daily-report/index'
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
    wx.navigateTo({
      url: '/pages/settings/index'
    });
  },

  goToHelp: function () {
    wx.navigateTo({
      url: '/pages/help/index'
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