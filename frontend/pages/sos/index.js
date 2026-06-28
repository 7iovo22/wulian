Page({
  data: {
    isSOSActive: false,
    duration: 0,
    hasTriggered: false
  },

  durationTimer: null,
  isPageActive: false,

  onLoad: function (options) {
    this.isPageActive = true;
    if (options && options.triggered === '1') {
      this.triggerSOS();
      this.setData({
        hasTriggered: true
      });
    }
  },

  onUnload: function () {
    this.isPageActive = false;
    this.clearTimer();
  },

  onHide: function () {
    this.isPageActive = false;
  },

  onShow: function () {
    this.isPageActive = true;
  },

  clearTimer: function () {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
  },

  triggerSOS: function () {
    if (!this.isPageActive) return;

    wx.vibrateLong();

    this.setData({
      isSOSActive: true,
      duration: 0
    });

    this.startDurationTimer();

    wx.showToast({
      title: 'SOS求助已触发',
      icon: 'none',
      duration: 2000
    });
  },

  startDurationTimer: function () {
    this.clearTimer();

    this.durationTimer = setInterval(() => {
      if (!this.isPageActive) {
        this.clearTimer();
        return;
      }

      this.setData({
        duration: this.data.duration + 1
      });
    }, 1000);
  },

  formatDuration: function (seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  cancelSOS: function () {
    wx.showModal({
      title: '取消求助',
      content: '确定要取消SOS求助吗？',
      success: (res) => {
        if (res.confirm) {
          this.clearTimer();

          this.setData({
            isSOSActive: false,
            duration: 0
          });

          wx.showToast({
            title: '已取消求助',
            icon: 'success'
          });
        }
      }
    });
  },

  callPolice: function () {
    wx.makePhoneCall({
      phoneNumber: '110',
      fail: () => {
        wx.showToast({
          title: '拨号失败',
          icon: 'none'
        });
      }
    });
  },

  callAmbulance: function () {
    wx.makePhoneCall({
      phoneNumber: '120',
      fail: () => {
        wx.showToast({
          title: '拨号失败',
          icon: 'none'
        });
      }
    });
  },

  callContact: function () {
    wx.showToast({
      title: '正在拨打紧急联系人',
      icon: 'none'
    });

    setTimeout(() => {
      wx.makePhoneCall({
        phoneNumber: '13800138000',
        fail: () => {
          wx.showToast({
            title: '拨号失败',
            icon: 'none'
          });
        }
      });
    }, 1000);
  }
});