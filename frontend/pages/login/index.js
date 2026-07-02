const app = getApp();
const api = require('../../utils/api');
const { isLogEnabled } = require('../../config/index');
const { generateCode, verifyCode } = require('../../utils/mock-sms');

Page({
  data: {
    phone: '',
    code: '',
    password: '',
    codeBtnText: '获取验证码',
    codeBtnDisabled: false,
    currentRole: 'rider'
  },

  codeTimer: null,
  loginTimeoutTimer: null,
  isPageActive: false,

  onLoad: function (options) {
    this.isPageActive = true;
    const token = wx.getStorageSync('token');
    if (token) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  onUnload: function () {
    this.isPageActive = false;
    this.clearAllTimers();
  },

  onHide: function () {
    this.isPageActive = false;
  },

  clearAllTimers: function () {
    if (this.codeTimer) {
      clearInterval(this.codeTimer);
      this.codeTimer = null;
    }
    if (this.loginTimeoutTimer) {
      clearTimeout(this.loginTimeoutTimer);
      this.loginTimeoutTimer = null;
    }
  },

  onPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },

  onCodeInput: function (e) {
    this.setData({
      code: e.detail.value
    });
  },

  onPasswordInput: function (e) {
    this.setData({
      password: e.detail.value
    });
  },

  switchRole: function (e) {
    const role = e.currentTarget.dataset.role;
    this.setData({
      currentRole: role,
      password: '',
      code: ''
    });
  },

  goToRegister: function () {
    wx.navigateTo({
      url: '/pages/register/index'
    });
  },

  getCode: function () {
    if (!this.isPageActive) return;

    const phone = this.data.phone;
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '发送中...',
      mask: true
    });

    setTimeout(() => {
      if (!this.isPageActive) {
        wx.hideLoading();
        return;
      }

      const code = generateCode(phone);

      wx.hideLoading();
      this.setData({
        codeBtnText: '60s后重发',
        codeBtnDisabled: true
      });

      let count = 60;
      this.codeTimer = setInterval(() => {
        if (!this.isPageActive) {
          clearInterval(this.codeTimer);
          this.codeTimer = null;
          return;
        }

        count--;
        if (count <= 0) {
          clearInterval(this.codeTimer);
          this.codeTimer = null;
          this.setData({
            codeBtnText: '获取验证码',
            codeBtnDisabled: false
          });
        } else {
          this.setData({
            codeBtnText: `${count}s后重发`
          });
        }
      }, 1000);

      wx.showModal({
        title: '验证码已发送',
        content: `您的验证码是：${code}（有效期5分钟）`,
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#4FC3F7'
      });
    }, 1000);
  },

  login: function () {
    if (!this.isPageActive) return;

    const { phone, code, password, currentRole } = this.data;

    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (currentRole === 'rider') {
      if (!code || code.length !== 6) {
        wx.showToast({
          title: '请输入6位验证码',
          icon: 'none'
        });
        return;
      }
      this.loginWithCode(phone, code);
    } else {
      if (!password || password.length < 6) {
        wx.showToast({
          title: '请输入6位以上密码',
          icon: 'none'
        });
        return;
      }
      if (password.length > 20) {
        wx.showToast({
          title: '密码不能超过20位',
          icon: 'none'
        });
        return;
      }
      this.loginWithPassword(phone, password);
    }
  },

  loginWithCode: function (phone, code) {
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    setTimeout(() => {
      if (!this.isPageActive) {
        wx.hideLoading();
        return;
      }

      const verifyResult = verifyCode(phone, code);

      if (!verifyResult.success) {
        wx.hideLoading();
        wx.showToast({
          title: verifyResult.message,
          icon: 'none'
        });
        return;
      }

      wx.hideLoading();
      const mockUser = {
        id: 1,
        phone: phone,
        nickname: '骑手',
        avatar: '',
        role: 'rider'
      };
      const mockToken = 'mock_token_' + Date.now();
      app.login(mockUser, mockToken);

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      setTimeout(() => {
        if (this.isPageActive) {
          this.navigateToHome('rider');
        }
      }, 1000);
    }, 1000);
  },

  loginWithPassword: function (phone, password) {
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    api.contact.login({ phone: phone, password: password }).then(res => {
      if (!this.isPageActive) {
        wx.hideLoading();
        return;
      }

      wx.hideLoading();
      const { token, ...user } = res;
      app.login(user, token);

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      setTimeout(() => {
        if (this.isPageActive) {
          this.navigateToHome('contact');
        }
      }, 1000);
    }).catch(err => {
      if (!this.isPageActive) {
        wx.hideLoading();
        return;
      }

      wx.hideLoading();
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      });
    });
  },

  navigateToHome: function (role) {
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

    const navigate = () => {
      if (page.isTab) {
        wx.switchTab({
          url: page.url,
          fail: (err) => {
            console.error('[Login] switchTab fail:', err);
            wx.reLaunch({
              url: page.url,
              fail: () => {
                wx.showToast({
                  title: '页面跳转失败',
                  icon: 'none'
                });
              }
            });
          }
        });
      } else {
        wx.reLaunch({
          url: page.url,
          fail: (err) => {
            console.error('[Login] reLaunch fail:', err);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      }
    };

    navigate();
  },

  wechatLogin: async function () {
    if (!this.isPageActive) return;

    if (!app.globalData.networkConnected) {
      wx.showToast({
        title: '网络连接不可用',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    try {
      // 1. 获取微信登录凭证 code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          timeout: 10000,
          success: resolve,
          fail: reject
        });
      });

      if (!this.isPageActive) return;

      const code = loginRes.code;
      if (!code) {
        wx.showToast({
          title: '获取登录凭证失败',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      if (isLogEnabled()) {
        console.log('[Login] 微信登录code:', code);
      }

      // 2. 获取用户信息（昵称、头像）
      wx.showLoading({
        title: '授权中...',
        mask: true
      });

      const userRes = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善骑手个人资料',
          success: resolve,
          fail: reject
        });
      });

      if (!this.isPageActive) {
        wx.hideLoading();
        return;
      }

      const userInfo = userRes.userInfo;
      const nickName = userInfo.nickName;
      const avatarUrl = userInfo.avatarUrl;

      if (isLogEnabled()) {
        console.log('[Login] 用户信息:', { nickName, avatarUrl });
      }

      // 3. 请求后端登录接口
      wx.showLoading({
        title: '登录中...',
        mask: true
      });

      const data = await api.user.wechatLogin({
        code: code,
        nickName: nickName,
        avatar: avatarUrl
      });

      if (!this.isPageActive) {
        wx.hideLoading();
        return;
      }

      wx.hideLoading();

      if (isLogEnabled()) {
        console.log('[Login] 微信登录成功:', data);
      }

      app.login(data.user, data.token);

      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        if (this.isPageActive) {
          this.navigateToHome('rider');
        }
      }, 1500);

    } catch (err) {
      wx.hideLoading();
      if (!this.isPageActive) return;

      if (isLogEnabled()) {
        console.error('[Login] 微信登录失败:', err);
      }

      let errorMsg = '微信登录失败，请重试';
      if (err.errMsg) {
        if (err.errMsg.includes('getUserProfile:fail auth deny')) {
          errorMsg = '授权取消，请重新点击';
        } else if (err.errMsg.includes('timeout')) {
          errorMsg = '登录超时，请检查网络';
        } else if (err.errMsg.includes('fail')) {
          errorMsg = '微信授权失败，请重试';
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      });
    }
  }
});