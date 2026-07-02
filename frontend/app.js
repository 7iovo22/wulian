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

    // 已登录状态下根据角色跳转首页
    this.navigateToHomeByRole();
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
    const userInfoStr = wx.getStorageSync('userInfo');

    if (token && userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        this.globalData.token = token;
        this.globalData.userInfo = userInfo;
        this.globalData.riderId = userInfo.id;
        this.globalData.isLogin = true;

        if (isLogEnabled()) {
          console.log('[App] 已登录，用户信息:', userInfo);
        }
      } catch (e) {
        if (isLogEnabled()) {
          console.error('[App] 用户信息解析失败:', e);
        }
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

    wx.setStorageSync('userInfo', JSON.stringify(userInfo));
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
  },

  updateUserInfo: function (updateData) {
    if (!this.globalData.userInfo) {
      return;
    }

    const newInfo = {
      ...this.globalData.userInfo,
      ...updateData
    };

    this.globalData.userInfo = newInfo;
    wx.setStorageSync('userInfo', JSON.stringify(newInfo));

    if (isLogEnabled()) {
      console.log('[App] 用户信息已更新:', newInfo);
    }
  },

  navigateToHomeByRole: function () {
    if (!this.globalData.isLogin || !this.globalData.userInfo) {
      return;
    }

    const role = this.globalData.userInfo.role || 'rider';
    const homePages = {
      rider: {
        url: '/pages/index/index',
        isTab: true
      },
      contact: {
        url: '/pages/contact-home/index',
        isTab: false
      }
    };

    const page = homePages[role] || homePages.rider;

    if (page.isTab) {
      wx.switchTab({
        url: page.url,
        fail: (err) => {
          console.error('[App] switchTab fail:', err);
          wx.reLaunch({
            url: page.url,
            fail: () => {
              console.error('[App] reLaunch fail');
            }
          });
        }
      });
    } else {
      wx.reLaunch({
        url: page.url,
        fail: (err) => {
          console.error('[App] reLaunch fail:', err);
        }
      });
    }
  }
});