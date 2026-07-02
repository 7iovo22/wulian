const api = require('../../utils/api');
const { maskPhone, formatRelativeTime } = require('../../utils/helpers');

Page({
  data: {
    riderId: null,
    riderNickname: '',
    location: null,
    alarms: [],
    events: [],
    report: null,
    currentTab: 'location',
    markers: [],
    riderPhone: '',
    refreshing: false
  },

  locationTimer: null,

  onLoad: function (options) {
    const riderId = options.riderId;
    const riderNickname = decodeURIComponent(options.riderNickname || '');
    
    this.setData({
      riderId: riderId,
      riderNickname: riderNickname
    });

    wx.setNavigationBarTitle({
      title: riderNickname || '骑手详情'
    });

    this.loadAllData();
    this.startLocationUpdate();
  },

  onShow: function () {
    this.loadAllData();
  },

  onUnload: function () {
    this.stopLocationUpdate();
  },

  startLocationUpdate: function () {
    this.stopLocationUpdate();
    this.locationTimer = setInterval(() => {
      this.loadLocation();
    }, 30000);
  },

  stopLocationUpdate: function () {
    if (this.locationTimer) {
      clearInterval(this.locationTimer);
      this.locationTimer = null;
    }
  },

  loadAllData: function () {
    this.loadLocation();
    this.loadAlarms();
    this.loadEvents();
    this.loadReport();
  },

  loadLocation: function () {
    api.rider.getLocation(this.data.riderId).then(res => {
      const location = {
        latitude: res.latitude,
        longitude: res.longitude,
        address: res.address,
        updateTime: res.updateTime,
        relativeTime: formatRelativeTime(res.updateTime)
      };
      const markers = [{
        id: 1,
        latitude: res.latitude,
        longitude: res.longitude,
        width: 48,
        height: 48,
        label: {
          content: this.data.riderNickname,
          fontSize: 12,
          color: '#333333',
          borderRadius: 4,
          bgColor: '#FFFFFF',
          padding: 4
        }
      }];
      this.setData({
        location: location,
        markers: markers
      });
    }).catch(() => {
      const mockLat = 39.9087 + Math.random() * 0.02;
      const mockLng = 116.3975 + Math.random() * 0.02;
      const now = Date.now();
      const location = {
        latitude: mockLat,
        longitude: mockLng,
        address: '北京市朝阳区',
        updateTime: now,
        relativeTime: formatRelativeTime(now)
      };
      const markers = [{
        id: 1,
        latitude: mockLat,
        longitude: mockLng,
        width: 48,
        height: 48,
        label: {
          content: this.data.riderNickname,
          fontSize: 12,
          color: '#333333',
          borderRadius: 4,
          bgColor: '#FFFFFF',
          padding: 4
        }
      }];
      this.setData({
        location: location,
        markers: markers,
        riderPhone: '13800138001'
      });
    });
  },

  loadAlarms: function () {
    api.rider.getAlarms().then(res => {
      const alarms = res.slice(0, 5).map(item => ({
        id: item.id,
        type: item.type,
        level: item.level,
        message: item.message,
        createTime: item.createTime,
        relativeTime: formatRelativeTime(item.createTime),
        status: item.status
      }));
      this.setData({
        alarms: alarms
      });
    }).catch(() => {
      const now = Date.now();
      const mockAlarms = [
        { id: 1, type: '摔倒', level: 'high', message: '检测到骑手摔倒，请注意', createTime: now - 1000 * 60 * 5, relativeTime: '5分钟前', status: 'OPEN' },
        { id: 2, type: '疲劳驾驶', level: 'medium', message: '骑手连续骑行超过2小时', createTime: now - 1000 * 60 * 60, relativeTime: '1小时前', status: 'RESOLVED' },
        { id: 3, type: '超速', level: 'low', message: '检测到超速行驶', createTime: now - 1000 * 60 * 120, relativeTime: '2小时前', status: 'ACKED' }
      ];
      this.setData({
        alarms: mockAlarms
      });
    });
  },

  loadEvents: function () {
    const now = Date.now();
    const mockEvents = [
      { id: 1, type: 'SOS', time: now - 1000 * 60 * 5, relativeTime: '5分钟前', description: '骑手触发SOS紧急求助', location: '北京市朝阳区' },
      { id: 2, type: '摔倒检测', time: now - 1000 * 60 * 60 * 3, relativeTime: '3小时前', description: '检测到异常摔倒动作', location: '北京市海淀区' },
      { id: 3, type: '碰撞预警', time: now - 1000 * 60 * 60 * 5, relativeTime: '5小时前', description: '检测到车辆碰撞', location: '北京市西城区' },
      { id: 4, type: '长时间未活动', time: now - 1000 * 60 * 60 * 24, relativeTime: '1天前', description: '骑手超过30分钟未活动', location: '北京市东城区' }
    ];
    this.setData({
      events: mockEvents
    });
  },

  loadReport: function () {
    const today = new Date().toISOString().split('T')[0];
    api.rider.getDailyReport(today).then(res => {
      this.setData({
        report: res
      });
    }).catch(() => {
      this.setData({
        report: {
          date: today,
          safetyScore: 85,
          totalEvents: 3,
          resolvedEvents: 2,
          riskLevel: 'medium',
          summary: '今日骑手整体安全状况良好，共发生3起安全事件，其中2起已处理。建议骑手注意休息，避免疲劳驾驶。',
          suggestions: [
            '建议适当休息，缓解疲劳',
            '注意骑行速度，遵守交通规则',
            '定期检查头盔设备状态'
          ],
          behaviorAnalysis: {
            avgSpeed: 32,
            rideHours: 4.5,
            brakeCount: 12,
            accelerationCount: 8
          }
        }
      });
    });
  },

  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
  },

  makePhoneCall: function () {
    const phone = this.data.riderPhone || '13800138001';
    wx.showModal({
      title: '联系骑手',
      content: `确定要拨打骑手电话 ${maskPhone(phone)} 吗？`,
      success: (res) => {
        if (res.confirm) {
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
      }
    });
  },

  onPullDownRefresh: function () {
    this.setData({ refreshing: true });
    this.loadAllData();
    setTimeout(() => {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
