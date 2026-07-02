const { checkNetwork } = require('./utils/request');

App({
  globalData: {
    userInfo: null,
    token: null,
    contactId: null,
    isLogin: false,
    networkConnected: true
  },

  onLaunch: function () {
    this.checkLoginStatus();
    this.checkNetworkStatus();
  },

  onShow: function () {
    this.checkNetworkStatus();
  },

  checkNetworkStatus: function () {
    checkNetwork().then(isConnected => {
      this.globalData.networkConnected = isConnected;
      if (!isConnected) {
        wx.showToast({
          title: '网络连接不可用',
          icon: 'none',
          duration: 2000
        });
      }
    }).catch(() => {
      this.globalData.networkConnected = true;
    });
  },

  checkLoginStatus: function () {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');

    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.contactId = userInfo.id;
      this.globalData.isLogin = true;
    }
  },

  login: function (userInfo, token) {
    this.globalData.userInfo = userInfo;
    this.globalData.token = token;
    this.globalData.contactId = userInfo.id;
    this.globalData.isLogin = true;

    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('token', token);
  },

  logout: function () {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    this.globalData.contactId = null;
    this.globalData.isLogin = false;

    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
  }
});