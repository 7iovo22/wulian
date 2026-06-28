const app = getApp();
const api = require('../../utils/api');
const { isLogEnabled } = require('../../config/index');

Page({
  data: {
    phone: '',
    code: '',
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

  switchRole: function (e) {
    const role = e.currentTarget.dataset.role;
    this.setData({
      currentRole: role
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

      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      });
    }, 1000);
  },

  login: function () {
    if (!this.isPageActive) return;

    const { phone, code, currentRole } = this.data;

    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (!code || code.length !== 6) {
      wx.showToast({
        title: '请输入6位验证码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    setTimeout(() => {
      if (!this.isPageActive) {
        wx.hideLoading();
        return;
      }

      wx.hideLoading();
      const mockUser = {
        id: 1,
        phone: phone,
        nickname: '骑手',
        avatar: '',
        role: currentRole
      };
      const mockToken = 'mock_token_' + Date.now();
      app.login(mockUser, mockToken);

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      setTimeout(() => {
        if (this.isPageActive) {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }, 1000);
    }, 1000);
  },

  wechatLogin: function () {
    if (!this.isPageActive) return;

    if (!app.globalData.networkConnected) {
      wx.showToast({
        title: '网络连接不可用',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const loadingShown = true;
    wx.showLoading({
      title: '微信登录中...',
      mask: true
    });

    const hideLoadingIfShown = () => {
      if (loadingShown) {
        wx.hideLoading();
      }
    };

    this.loginTimeoutTimer = setTimeout(() => {
      hideLoadingIfShown();
      if (!this.isPageActive) return;

      wx.showToast({
        title: '登录超时，请重试',
        icon: 'none',
        duration: 2000
      });
      if (isLogEnabled()) {
        console.error('[Login] 微信登录超时');
      }
    }, 15000);

    wx.login({
      timeout: 10000,
      success: (res) => {
        if (this.loginTimeoutTimer) {
          clearTimeout(this.loginTimeoutTimer);
          this.loginTimeoutTimer = null;
        }

        if (!this.isPageActive) {
          hideLoadingIfShown();
          return;
        }

        if (isLogEnabled()) {
          console.log('[Login] 微信登录code:', res.code);
        }

        if (!res.code) {
          hideLoadingIfShown();
          wx.showToast({
            title: '获取登录凭证失败',
            icon: 'none',
            duration: 2000
          });
          return;
        }

        api.user.wechatLogin({ code: res.code })
          .then(data => {
            hideLoadingIfShown();
            if (!this.isPageActive) return;

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
                wx.switchTab({
                  url: '/pages/index/index'
                });
              }
            }, 1500);
          })
          .catch(err => {
            hideLoadingIfShown();
            if (!this.isPageActive) return;

            if (isLogEnabled()) {
              console.error('[Login] 微信登录失败:', err);
            }

            const errorMsg = err.message || '微信登录失败，请重试';
            wx.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 2000
            });
          });
      },
      fail: (err) => {
        if (this.loginTimeoutTimer) {
          clearTimeout(this.loginTimeoutTimer);
          this.loginTimeoutTimer = null;
        }

        hideLoadingIfShown();
        if (!this.isPageActive) return;

        if (isLogEnabled()) {
          console.error('[Login] wx.login失败:', err);
        }

        let errorMsg = '微信登录失败';
        if (err.errMsg && err.errMsg.includes('timeout')) {
          errorMsg = '登录超时，请检查网络';
        } else if (err.errMsg && err.errMsg.includes('fail')) {
          errorMsg = '微信授权失败，请重试';
        }

        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});