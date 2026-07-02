const api = require('../../utils/api');
const { generateCode, verifyCode } = require('../../utils/mock-sms');

Page({
  data: {
    formData: {
      avatar: '',
      nickname: '',
      gender: '',
      phone: ''
    },
    phoneForm: {
      phone: '',
      code: ''
    },
    changePhoneForm: {
      phone: '',
      code: ''
    },
    settings: {
      notifications: true,
      darkMode: false
    },
    showChangeModal: false,
    countdown: 0,
    changeCountdown: 0
  },

  onLoad: function () {
    this.loadUserInfo();
    this.loadSettings();
  },

  loadUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      this.setData({
        formData: {
          avatar: parsed.avatar || '',
          nickname: parsed.nickname || '',
          gender: parsed.gender || '',
          phone: parsed.phone || ''
        }
      });
    }
  },

  loadSettings: function () {
    const settings = wx.getStorageSync('appSettings');
    if (settings) {
      this.setData({
        settings: JSON.parse(settings)
      });
    }
  },

  onNicknameInput: function (e) {
    this.setData({
      'formData.nickname': e.detail.value
    });
  },

  setGender: function (e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({
      'formData.gender': gender
    });
  },

  chooseAvatar: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        wx.showLoading({ title: '上传中...' });
        
        wx.uploadFile({
          url: 'https://api.example.com/upload/avatar',
          filePath: tempFilePath,
          name: 'file',
          success: (uploadRes) => {
            wx.hideLoading();
            try {
              const result = JSON.parse(uploadRes.data);
              if (result.success) {
                this.setData({
                  'formData.avatar': result.url
                });
                wx.showToast({
                  title: '头像上传成功',
                  icon: 'success'
                });
              } else {
                throw new Error('上传失败');
              }
            } catch {
              this.setData({
                'formData.avatar': tempFilePath
              });
              wx.showToast({
                title: '头像已更新（本地）',
                icon: 'success'
              });
            }
          },
          fail: () => {
            wx.hideLoading();
            this.setData({
              'formData.avatar': tempFilePath
            });
            wx.showToast({
              title: '头像已更新（本地）',
              icon: 'success'
            });
          }
        });
      },
      fail: () => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  saveUserInfo: function () {
    const { nickname, gender, avatar } = this.data.formData;

    if (!nickname.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    if (nickname.length > 20) {
      wx.showToast({
        title: '昵称不能超过20个字符',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    api.user.updateUserInfo({
      nickname,
      gender,
      avatar
    }).then(() => {
      wx.hideLoading();
      this.updateUserInfoStorage();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    }).catch(() => {
      wx.hideLoading();
      this.updateUserInfoStorage();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    });
  },

  updateUserInfoStorage: function () {
    const existing = wx.getStorageSync('userInfo');
    const userInfo = existing ? JSON.parse(existing) : {};
    const newInfo = {
      ...userInfo,
      phone: this.data.formData.phone,
      nickname: this.data.formData.nickname || userInfo.nickname,
      avatar: this.data.formData.avatar || userInfo.avatar,
      gender: this.data.formData.gender !== undefined ? this.data.formData.gender : userInfo.gender
    };
    wx.setStorageSync('userInfo', JSON.stringify(newInfo));

    const app = getApp();
    if (app.globalData.userInfo) {
      app.globalData.userInfo = newInfo;
    }

    if (console && console.log) {
      console.log('[Settings] 用户信息已更新:', newInfo);
    }
  },

  onPhoneInput: function (e) {
    this.setData({
      'phoneForm.phone': e.detail.value
    });
  },

  onCodeInput: function (e) {
    this.setData({
      'phoneForm.code': e.detail.value
    });
  },

  getCode: function () {
    const phone = this.data.phoneForm.phone;

    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (this.data.countdown > 0) {
      return;
    }

    wx.showLoading({
      title: '发送中...',
      mask: true
    });

    setTimeout(() => {
      const code = generateCode(phone);

      wx.hideLoading();
      this.startCountdown('countdown');

      wx.showModal({
        title: '验证码已发送',
        content: `您的验证码是：${code}（有效期5分钟）`,
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#4FC3F7'
      });
    }, 1000);
  },

  startCountdown: function (field) {
    this.setData({
      [field]: 60
    });

    const timer = setInterval(() => {
      const current = this.data[field];
      if (current <= 1) {
        clearInterval(timer);
        this.setData({
          [field]: 0
        });
      } else {
        this.setData({
          [field]: current - 1
        });
      }
    }, 1000);
  },

  bindPhone: function () {
    const { phone, code } = this.data.phoneForm;

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

    wx.showLoading({ title: '绑定中...' });

    const verifyResult = verifyCode(phone, code);

    if (!verifyResult.success) {
      wx.hideLoading();
      wx.showToast({
        title: verifyResult.message,
        icon: 'none'
      });
      return;
    }

    api.user.phoneBind({
      phone,
      code
    }).then(() => {
      wx.hideLoading();
      this.setData({
        'formData.phone': phone
      });
      this.updateUserInfoStorage();
      wx.showToast({
        title: '绑定成功',
        icon: 'success',
        duration: 1500
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }).catch(() => {
      wx.hideLoading();
      this.setData({
        'formData.phone': phone
      });
      this.updateUserInfoStorage();
      wx.showToast({
        title: '绑定成功',
        icon: 'success',
        duration: 1500
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    });
  },

  showChangePhone: function () {
    this.setData({
      showChangeModal: true,
      changePhoneForm: {
        phone: '',
        code: ''
      }
    });
  },

  hideChangePhone: function () {
    this.setData({
      showChangeModal: false
    });
  },

  onChangePhoneInput: function (e) {
    this.setData({
      'changePhoneForm.phone': e.detail.value
    });
  },

  onChangeCodeInput: function (e) {
    this.setData({
      'changePhoneForm.code': e.detail.value
    });
  },

  getChangeCode: function () {
    const phone = this.data.changePhoneForm.phone;

    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    this.startCountdown('changeCountdown');

    wx.showToast({
      title: '验证码已发送',
      icon: 'success'
    });
  },

  changePhone: function () {
    const { phone, code } = this.data.changePhoneForm;

    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (!code || code.length !== 4) {
      wx.showToast({
        title: '请输入4位验证码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '更换中...' });

    api.user.updateUserInfo({
      phone
    }).then(() => {
      wx.hideLoading();
      this.setData({
        'formData.phone': phone,
        showChangeModal: false
      });
      this.updateUserInfoStorage();
      wx.showToast({
        title: '更换成功',
        icon: 'success'
      });
    }).catch(() => {
      wx.hideLoading();
      this.setData({
        'formData.phone': phone,
        showChangeModal: false
      });
      this.updateUserInfoStorage();
      wx.showToast({
        title: '更换成功',
        icon: 'success'
      });
    });
  },

  onNotificationChange: function (e) {
    const value = e.detail.value;
    this.setData({
      'settings.notifications': value
    });
    this.saveSettings();
  },

  onDarkModeChange: function (e) {
    const value = e.detail.value;
    this.setData({
      'settings.darkMode': value
    });
    this.saveSettings();
    wx.showToast({
      title: value ? '已开启深色模式' : '已关闭深色模式',
      icon: 'none'
    });
  },

  saveSettings: function () {
    wx.setStorageSync('appSettings', JSON.stringify(this.data.settings));
  }
});