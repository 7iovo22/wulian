const app = getApp();
const { maskPhone } = require('../../utils/helpers');

Page({
  data: {
    userInfo: null,
    maskedPhone: ''
  },

  onLoad: function () {
    this.loadUserInfo();
  },

  onShow: function () {
    this.loadUserInfo();
  },

  loadUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/login/index'
      });
      return;
    }

    const parsedUserInfo = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
    const phone = parsedUserInfo.phone || '';

    this.setData({
      userInfo: parsedUserInfo,
      maskedPhone: phone ? maskPhone(phone) : ''
    });
  },

  goBack: function () {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({
          url: '/pages/contact-home/index'
        });
      }
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