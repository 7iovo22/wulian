const api = require('../../utils/api');

Page({
  data: {
    scanStatus: '正在搜索附近设备...',
    deviceList: [],
    deviceSn: '',
    bindCode: '',
    canBind: false,
    searching: false
  },

  onLoad: function (options) {
    this.startScan();
  },

  startScan: function () {
    this.setData({
      searching: true,
      scanStatus: '正在搜索附近设备...'
    });

    setTimeout(() => {
      const mockDevices = [
        {
          deviceSn: 'HELMET001',
          deviceName: '智能头盔-A001',
          signal: 95
        },
        {
          deviceSn: 'HELMET002',
          deviceName: '智能头盔-A002',
          signal: 78
        },
        {
          deviceSn: 'HELMET003',
          deviceName: '智能头盔-A003',
          signal: 62
        }
      ];
      
      this.setData({
        deviceList: mockDevices,
        scanStatus: '搜索完成，找到3台设备',
        searching: false
      });
    }, 2000);
  },

  onDeviceSnInput: function (e) {
    this.setData({
      deviceSn: e.detail.value
    });
    this.checkCanBind();
  },

  onBindCodeInput: function (e) {
    this.setData({
      bindCode: e.detail.value
    });
    this.checkCanBind();
  },

  checkCanBind: function () {
    const { deviceSn, bindCode } = this.data;
    this.setData({
      canBind: deviceSn.length >= 5 && bindCode.length >= 4
    });
  },

  selectDevice: function (e) {
    const device = e.currentTarget.dataset.device;
    this.setData({
      deviceSn: device.deviceSn
    });
    this.checkCanBind();
  },

  bindDevice: function () {
    const { deviceSn, bindCode } = this.data;
    
    if (!deviceSn || !bindCode) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '绑定中...',
      mask: true
    });

    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '绑定成功',
        icon: 'success'
      });

      const mockDevice = {
        id: 1,
        deviceSn: deviceSn,
        riderId: 1,
        status: 1,
        battery: 85,
        firmwareVersion: '1.0.0'
      };
      
      wx.setStorageSync('deviceInfo', JSON.stringify(mockDevice));
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1500);
  },

  goBack: function () {
    wx.navigateBack();
  }
});