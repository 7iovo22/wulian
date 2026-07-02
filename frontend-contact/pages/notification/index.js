const api = require('../../utils/api');
const { formatRelativeTime, cacheRemove } = require('../../utils/helpers');

Page({
  data: {
    notifications: [],
    filteredNotifications: [],
    filterType: 'all',
    types: [
      { value: 'all', label: '全部' },
      { value: 'alarm', label: '告警' },
      { value: 'event', label: '事件' },
      { value: 'system', label: '系统' }
    ],
    loading: false
  },

  onLoad: function () {
    this.loadNotifications();
  },

  loadNotifications: function () {
    this.setData({ loading: true });
    
    api.contact.getNotifications().then(res => {
      const notifications = res.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type,
        read: item.read,
        createTime: item.createTime,
        relativeTime: formatRelativeTime(item.createTime),
        riderId: item.riderId,
        riderNickname: item.riderNickname
      }));
      this.setData({
        notifications: notifications,
        loading: false
      });
      this.updateFilteredNotifications();
    }).catch(() => {
      const mockNotifications = [
        {
          id: 1,
          title: '骑手小王触发SOS告警',
          content: '骑手小王在北京市朝阳区触发了SOS紧急告警，请立即联系确认安全状况。',
          type: 'alarm',
          read: false,
          createTime: Date.now() - 1000 * 60 * 2,
          riderId: 1,
          riderNickname: '骑手小王'
        },
        {
          id: 2,
          title: '骑手小张异常停留',
          content: '骑手小张已在北京市西城区某地点停留超过30分钟，请关注。',
          type: 'event',
          read: false,
          createTime: Date.now() - 1000 * 60 * 15,
          riderId: 3,
          riderNickname: '骑手小张'
        },
        {
          id: 3,
          title: '系统通知',
          content: '骑手小李已将您添加为紧急联系人',
          type: 'system',
          read: true,
          createTime: Date.now() - 1000 * 60 * 60,
          riderId: 2,
          riderNickname: '骑手小李'
        },
        {
          id: 4,
          title: '骑手小王安全评分下降',
          content: '骑手小王今日安全评分下降至78分，建议关注其驾驶行为。',
          type: 'event',
          read: true,
          createTime: Date.now() - 1000 * 60 * 120,
          riderId: 1,
          riderNickname: '骑手小王'
        },
        {
          id: 5,
          title: '骑手小张摔倒检测',
          content: '检测到骑手小张可能发生摔倒，请立即联系确认情况。',
          type: 'alarm',
          read: false,
          createTime: Date.now() - 1000 * 60 * 5,
          riderId: 3,
          riderNickname: '骑手小张'
        }
      ];
      const notifications = mockNotifications.map(item => ({
        ...item,
        relativeTime: formatRelativeTime(item.createTime)
      }));
      this.setData({
        notifications: notifications,
        loading: false
      });
      this.updateFilteredNotifications();
    });
  },

  updateFilteredNotifications: function () {
    const { notifications, filterType } = this.data;
    let filtered;
    if (filterType === 'all') {
      filtered = notifications;
    } else {
      filtered = notifications.filter(n => n.type === filterType);
    }
    this.setData({
      filteredNotifications: filtered
    });
  },

  onPullDownRefresh: function () {
    cacheRemove('notification_count');
    this.loadNotifications().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  filterChanged: function (e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      filterType: type
    });
    this.updateFilteredNotifications();
  },

  markAsRead: function (e) {
    const id = e.currentTarget.dataset.id;
    const index = this.data.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const notifications = [...this.data.notifications];
      notifications[index].read = true;
      this.setData({
        notifications: notifications
      });
      this.updateFilteredNotifications();
      cacheRemove('notification_count');
    }
  },

  goToRiderDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    const riderId = e.currentTarget.dataset.riderId;
    const riderNickname = e.currentTarget.dataset.riderNickname;
    this.markAsRead({ currentTarget: { dataset: { id } } });
    wx.navigateTo({
      url: `/pages/rider-detail/index?riderId=${riderId}&riderNickname=${encodeURIComponent(riderNickname)}`
    });
  }
});
