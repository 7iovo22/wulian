const app = getApp();
const api = require('../../utils/api');
const { maskPhone, formatRelativeTime, cacheSet, cacheGet, cacheRemove } = require('../../utils/helpers');

Page({
  data: {
    riders: [],
    userInfo: null,
    maskedPhone: '',
    refreshing: false,
    notificationCount: 0,
    alarmCount: 0,
    onlineCount: 0,
    showDetailModal: false,
    selectedRider: null,
    currentTab: 'home'
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
      userInfo: userInfo,
      maskedPhone: maskPhone(userInfo.phone || '')
    });
    this.loadRiders();
    this.loadNotificationCount();
  },

  onShow: function () {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.role === 'contact') {
      this.setData({
        userInfo: userInfo,
        maskedPhone: maskPhone(userInfo.phone || '')
      });
      this.loadRiders();
      this.loadNotificationCount();
    }
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
      safetyStatusText: item.safetyStatus === 'safe' ? '安全' : (item.safetyStatus === 'warning' ? '预警' : '危险'),
      safetyStatusColor: item.safetyStatus === 'safe' ? '#1890FF' : (item.safetyStatus === 'warning' ? '#FA8C16' : '#FF4D4F'),
      safetyStatusBg: item.safetyStatus === 'safe' ? '#E6F7FF' : (item.safetyStatus === 'warning' ? '#FFF7E6' : '#FFF1F0'),
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
    const rider = this.data.riders.find(r => r.riderId == riderId);
    if (rider) {
      this.setData({
        showDetailModal: true,
        selectedRider: rider
      });
    }
  },

  closeDetailModal: function () {
    this.setData({
      showDetailModal: false,
      selectedRider: null
    });
  },

  goToNotifications: function () {
    wx.showToast({
      title: '通知中心开发中',
      icon: 'none'
    });
  },

  makePhoneCall: function (e) {
    const phone = e.currentTarget.dataset.phone || (this.data.selectedRider && this.data.selectedRider.riderPhone);
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showToast({
          title: '拨号失败',
          icon: 'none'
        });
      }
    });
  },

  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === 'home') {
      this.setData({ currentTab: 'home' });
    } else if (tab === 'mine') {
      wx.navigateTo({
        url: '/pages/contact-mine/index'
      });
    }
  }
});