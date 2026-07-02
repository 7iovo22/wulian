const app = getApp();
const api = require('../../utils/api');
const { maskPhone, formatRelativeTime, cacheSet, cacheGet, cacheRemove } = require('../../utils/helpers');

Page({
  data: {
    riders: [],
    userInfo: null,
    refreshing: false,
    notificationCount: 0
  },

  onLoad: function () {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/login/index'
      });
      return;
    }
    this.setData({
      userInfo: userInfo
    });
    this.loadRiders();
    this.loadNotificationCount();
  },

  onShow: function () {
    this.loadRiders();
    this.loadNotificationCount();
  },

  onPullDownRefresh: function () {
    this.setData({
      refreshing: true
    });
    cacheRemove('related_riders');
    this.loadRiders().finally(() => {
      this.setData({
        refreshing: false
      });
      wx.stopPullDownRefresh();
    });
  },

  loadRiders: function () {
    const cachedRiders = cacheGet('related_riders');
    if (cachedRiders) {
      this.processRiders(cachedRiders);
      return Promise.resolve();
    }

    return api.contact.getRiders().then(res => {
      cacheSet('related_riders', res, 300);
      this.processRiders(res);
    }).catch(() => {
      const mockRiders = [
        {
          riderId: 1,
          riderPhone: '13800138001',
          riderNickname: '骑手小王',
          contactName: '张三',
          relation: '父母',
          latitude: 39.9087,
          longitude: 116.3975,
          address: '北京市朝阳区',
          lastUpdateTime: Date.now(),
          alarmCount: 1,
          safetyScore: 78,
          safetyStatus: 'warning',
          online: true
        },
        {
          riderId: 2,
          riderPhone: '13800138002',
          riderNickname: '骑手小李',
          contactName: '张三',
          relation: '配偶',
          latitude: 39.9187,
          longitude: 116.4075,
          address: '北京市海淀区',
          lastUpdateTime: Date.now() - 1000 * 60 * 5,
          alarmCount: 0,
          safetyScore: 92,
          safetyStatus: 'safe',
          online: true
        },
        {
          riderId: 3,
          riderPhone: '13800138003',
          riderNickname: '骑手小张',
          contactName: '张三',
          relation: '朋友',
          latitude: 39.8987,
          longitude: 116.3875,
          address: '北京市西城区',
          lastUpdateTime: Date.now() - 1000 * 60 * 30,
          alarmCount: 2,
          safetyScore: 56,
          safetyStatus: 'danger',
          online: false
        }
      ];
      cacheSet('related_riders', mockRiders, 300);
      this.processRiders(mockRiders);
    });
  },

  processRiders: function (riders) {
    const processed = riders.map(item => ({
      riderId: item.riderId,
      riderPhone: item.riderPhone,
      maskedPhone: maskPhone(item.riderPhone),
      riderNickname: item.riderNickname,
      contactName: item.contactName,
      relation: item.relation,
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address,
      lastUpdateTime: item.lastUpdateTime,
      relativeTime: formatRelativeTime(item.lastUpdateTime),
      alarmCount: item.alarmCount || 0,
      safetyScore: item.safetyScore || 80,
      safetyStatus: item.safetyStatus || 'safe',
      online: item.online !== undefined ? item.online : (item.lastUpdateTime ? true : false)
    }));
    const alarmCount = processed.reduce((sum, r) => sum + (r.alarmCount || 0), 0);
    const onlineCount = processed.filter(r => r.online).length;
    this.setData({
      riders: processed,
      alarmCount: alarmCount,
      onlineCount: onlineCount
    });
  },

  loadNotificationCount: function () {
    const cachedCount = cacheGet('notification_count');
    if (cachedCount !== null) {
      this.setData({ notificationCount: cachedCount });
      return;
    }

    api.contact.getNotifications().then(res => {
      const count = res.filter(n => !n.read).length;
      cacheSet('notification_count', count, 60);
      this.setData({ notificationCount: count });
    }).catch(() => {
      this.setData({ notificationCount: 2 });
    });
  },

  goToRiderDetail: function (e) {
    const riderId = e.currentTarget.dataset.riderId;
    const riderNickname = e.currentTarget.dataset.riderNickname;
    wx.navigateTo({
      url: `/pages/rider-detail/index?riderId=${riderId}&riderNickname=${encodeURIComponent(riderNickname)}`
    });
  },

  goToNotifications: function () {
    wx.navigateTo({
      url: '/pages/notification/index'
    });
  },

  logout: function () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          cacheRemove('related_riders');
          cacheRemove('notification_count');
          app.logout();
          wx.redirectTo({
            url: '/pages/login/index'
          });
        }
      }
    });
  },

  makePhoneCall: function (e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showToast({
          title: '拨号失败',
          icon: 'none'
        });
      }
    });
  }
});
