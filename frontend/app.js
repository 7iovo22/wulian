const { checkNetwork } = require('./utils/request');
const { isLogEnabled } = require('./config/index');

App({
  globalData: {
    userInfo: null,
    deviceInfo: null,
    token: null,
    riderId: null,
    isLogin: false,
    theme: 'day',
    networkConnected: true
  },

  onLaunch: function () {
    if (isLogEnabled()) {
      console.log('[App] onLaunch');
    }

    // 启动阶段只做同步操作，不阻塞
    this.checkLoginStatus();
    this.initTheme();

    // 异步检测网络状态，不阻塞启动
    this.checkNetworkStatus();
  },

  onShow: function () {
    if (isLogEnabled()) {
      console.log('[App] onShow');
    }

    // 每次显示时检测网络状态
    this.checkNetworkStatus();
  },

  onHide: function () {
    if (isLogEnabled()) {
      console.log('[App] onHide');
    }
  },

  /**
   * 检测网络状态（异步，不阻塞）
   */
  checkNetworkStatus: function () {
    checkNetwork().then(isConnected => {
      this.globalData.networkConnected = isConnected;

      if (isLogEnabled()) {
        console.log(`[App] 网络状态: ${isConnected ? '已连接' : '未连接'}`);
      }

      if (!isConnected) {
        wx.showToast({
          title: '网络连接不可用',
          icon: 'none',
          duration: 2000
        });
      }
    }).catch(err => {
      if (isLogEnabled()) {
        console.error('[App] 网络检测失败:', err);
      }
    });
  },

  /**
   * 检查登录状态（同步操作）
   */
  checkLoginStatus: function () {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');

    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.riderId = userInfo.id;
      this.globalData.isLogin = true;

      if (isLogEnabled()) {
        console.log('[App] 已登录，用户信息:', userInfo);
      }
    } else {
      if (isLogEnabled()) {
        console.log('[App] 未登录');
      }
    }
  },

  /**
   * 初始化主题（同步操作）
   */
  initTheme: function () {
    const theme = wx.getStorageSync('theme') || 'day';
    this.globalData.theme = theme;
  },

  /**
   * 设置主题
   */
  setTheme: function (theme) {
    this.globalData.theme = theme;
    wx.setStorageSync('theme', theme);
  },

  /**
   * 登录
   */
  login: function (userInfo, token) {
    this.globalData.userInfo = userInfo;
    this.globalData.token = token;
    this.globalData.riderId = userInfo.id;
    this.globalData.isLogin = true;

    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('token', token);

    if (isLogEnabled()) {
      console.log('[App] 登录成功:', userInfo);
    }
  },

  /**
   * 退出登录
   */
  logout: function () {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    this.globalData.riderId = null;
    this.globalData.isLogin = false;

    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');

    if (isLogEnabled()) {
      console.log('[App] 已退出登录');
    }
  }
});