const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    phone: '',
    password: '',
    confirmPassword: ''
  },

  onLoad: function () {},

  onPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },

  onPasswordInput: function (e) {
    this.setData({
      password: e.detail.value
    });
  },

  onConfirmPasswordInput: function (e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  register: function () {
    const { phone, password, confirmPassword } = this.data;

    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

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

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '注册中...',
      mask: true
    });

    api.contact.register({ phone: phone, password: password }).then(res => {
      wx.hideLoading();
      const { token, ...user } = res;
      app.login(user, token);

      wx.showToast({
        title: '注册成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/contact-home/index',
          fail: () => {
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      }, 1000);
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: err.message || '注册失败',
        icon: 'none'
      });
    });
  },

  goToLogin: function () {
    wx.navigateBack();
  }
});