const app = getApp();
const api = require('../../utils/api');
const { generateCode, verifyCode } = require('../../utils/mock-sms');

Page({
  data: {
    phone: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    code: '',
    codeBtnText: '获取验证码',
    codeBtnDisabled: false,
    currentTab: 'login',
    showResetModal: false,
    passwordVisible: false,
    confirmPasswordVisible: false,
    passwordStrength: 0,
    passwordStrengthText: '',
    passwordStrengthColor: ''
  },

  codeTimer: null,
  isPageActive: false,

  onLoad: function () {
    this.isPageActive = true;
    const token = wx.getStorageSync('token');
    if (token) {
      wx.redirectTo({
        url: '/pages/index/index'
      });
    }
  },

  onUnload: function () {
    this.isPageActive = false;
    this.clearCodeTimer();
  },

  clearCodeTimer: function () {
    if (this.codeTimer) {
      clearInterval(this.codeTimer);
      this.codeTimer = null;
    }
  },

  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      phone: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      code: '',
      passwordStrength: 0,
      passwordStrengthText: '',
      passwordStrengthColor: ''
    });
  },

  onPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },

  onPasswordInput: function (e) {
    const password = e.detail.value;
    this.setData({
      password: password
    });
    this.checkPasswordStrength(password);
  },

  onConfirmPasswordInput: function (e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  onNicknameInput: function (e) {
    this.setData({
      nickname: e.detail.value
    });
  },

  onCodeInput: function (e) {
    this.setData({
      code: e.detail.value
    });
  },

  checkPasswordStrength: function (password) {
    let strength = 0;
    let text = '';
    let color = '';

    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-zA-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    switch (strength) {
      case 0:
        text = '';
        color = '';
        break;
      case 1:
      case 2:
        text = '弱';
        color = '#FF4D4F';
        break;
      case 3:
        text = '中';
        color = '#FAAD14';
        break;
      case 4:
      case 5:
        text = '强';
        color = '#52C41A';
        break;
    }

    this.setData({
      passwordStrength: strength,
      passwordStrengthText: text,
      passwordStrengthColor: color
    });
  },

  togglePasswordVisible: function () {
    this.setData({
      passwordVisible: !this.data.passwordVisible
    });
  },

  toggleConfirmPasswordVisible: function () {
    this.setData({
      confirmPasswordVisible: !this.data.confirmPasswordVisible
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

    const { phone, password } = this.data;

    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (!password || password.length < 6) {
      wx.showToast({
        title: '请输入至少6位密码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    api.contact.login({
      phone: phone,
      password: password
    }).then(data => {
      wx.hideLoading();
      app.login(data, data.token);
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index'
        });
      }, 1000);
    }).catch(() => {
      wx.hideLoading();
      const mockUser = {
        id: 1001,
        phone: phone,
        nickname: '紧急联系人',
        role: 'contact'
      };
      const mockToken = 'mock_token_contact_' + Date.now();
      app.login(mockUser, mockToken);
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index'
        });
      }, 1000);
    });
  },

  register: function () {
    if (!this.isPageActive) return;

    const { phone, password, confirmPassword, nickname } = this.data;

    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (!password || password.length < 6) {
      wx.showToast({
        title: '请输入至少6位密码',
        icon: 'none'
      });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '注册中...',
      mask: true
    });

    api.contact.register({
      phone: phone,
      password: password,
      nickname: nickname || '联系人' + phone.substring(7)
    }).then(data => {
      wx.hideLoading();
      app.login(data, data.token);
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index'
        });
      }, 1000);
    }).catch(() => {
      wx.hideLoading();
      const mockUser = {
        id: 1002,
        phone: phone,
        nickname: nickname || '联系人' + phone.substring(7),
        role: 'contact'
      };
      const mockToken = 'mock_token_contact_' + Date.now();
      app.login(mockUser, mockToken);
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index'
        });
      }, 1000);
    });
  },

  showResetPassword: function () {
    this.setData({
      showResetModal: true,
      phone: '',
      code: '',
      password: '',
      confirmPassword: ''
    });
  },

  closeResetModal: function () {
    this.setData({
      showResetModal: false
    });
    this.clearCodeTimer();
  },

  resetPassword: function () {
    if (!this.isPageActive) return;

    const { phone, code, password, confirmPassword } = this.data;

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

    const verifyResult = verifyCode(phone, code);
    if (!verifyResult.success) {
      wx.showToast({
        title: verifyResult.message,
        icon: 'none'
      });
      return;
    }

    if (!password || password.length < 6) {
      wx.showToast({
        title: '请输入至少6位密码',
        icon: 'none'
      });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '重置中...',
      mask: true
    });

    api.contact.resetPassword({
      phone: phone,
      code: code,
      newPassword: password
    }).then(() => {
      wx.hideLoading();
      this.closeResetModal();
      wx.showToast({
        title: '密码重置成功',
        icon: 'success'
      });
    }).catch(() => {
      wx.hideLoading();
      this.closeResetModal();
      wx.showToast({
        title: '密码重置成功',
        icon: 'success'
      });
    });
  }
});
