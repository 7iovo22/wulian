const api = require('../../utils/api');
const storage = require('../../utils/storage');

Page({
  data: {
    activeTab: 'share',
    isMapLoading: true,
    currentLocation: {
      latitude: 39.9042,
      longitude: 116.4074
    },
    markers: [],
    rawAddress: '',
    desensitizedAddress: '',
    showShareModal: false,
    selectedDuration: 24,
    shareLink: '',
    shareHistory: [],
    durationOptions: [1, 6, 12, 24, 48, 72]
  },

  onLoad: function () {
    this.getCurrentLocation();
    this.loadShareHistory();
  },

  onPullDownRefresh: function () {
    if (this.data.activeTab === 'share') {
      this.getCurrentLocation();
    } else {
      this.loadShareHistory();
    }
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  getCurrentLocation: function () {
    this.setData({ isMapLoading: true });
    
    wx.getSetting({
      success: (settingRes) => {
        if (!settingRes.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              this.fetchLocation();
            },
            fail: () => {
              wx.showModal({
                title: '需要位置权限',
                content: '请在设置中开启位置权限以使用位置分享功能',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (openRes) => {
                        if (openRes.authSetting['scope.userLocation']) {
                          this.fetchLocation();
                        } else {
                          this.handleLocationError();
                        }
                      },
                      fail: () => {
                        this.handleLocationError();
                      }
                    });
                  } else {
                    this.handleLocationError();
                  }
                }
              });
            }
          });
        } else {
          this.fetchLocation();
        }
      },
      fail: () => {
        this.handleLocationError();
      }
    });
  },

  fetchLocation: function () {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        
        const markers = [{
          id: 1,
          latitude: res.latitude,
          longitude: res.longitude,
          callout: {
            content: '我的位置',
            fontSize: 12,
            borderRadius: 4,
            bgColor: '#FFFFFF',
            padding: 4
          }
        }];

        this.setData({
          currentLocation: location,
          markers: markers,
          isMapLoading: false
        });

        this.reverseGeocode(res.latitude, res.longitude);
      },
      fail: () => {
        this.handleLocationError();
      }
    });
  },

  handleLocationError: function () {
    this.setData({
      isMapLoading: false,
      desensitizedAddress: '北京市朝阳区***'
    });
    wx.showToast({
      title: '获取位置失败',
      icon: 'none'
    });
  },

  reverseGeocode: function (latitude, longitude) {
    const mapApiKey = wx.getStorageSync('map_api_key') || '';
    
    if (!mapApiKey) {
      this.setData({
        desensitizedAddress: '位置信息***'
      });
      return;
    }
    
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        location: `${latitude},${longitude}`,
        key: mapApiKey,
        get_poi: 0
      },
      success: (res) => {
        if (res.data && res.data.status === 0 && res.data.result && res.data.result.address) {
          const address = res.data.result.address;
          this.setData({
            rawAddress: address,
            desensitizedAddress: this.desensitizeAddress(address)
          });
        } else {
          this.setData({
            desensitizedAddress: '位置信息***'
          });
        }
      },
      fail: () => {
        this.setData({
          desensitizedAddress: '位置信息***'
        });
      }
    });
  },

  desensitizeAddress: function (address) {
    if (!address) return '位置信息***';
    
    const parts = address.split('市');
    if (parts.length >= 2) {
      const city = parts[0] + '市';
      const district = parts[1].substring(0, 3);
      return city + district + '***';
    }
    
    return address.substring(0, 6) + '***';
  },

  refreshLocation: function () {
    this.getCurrentLocation();
  },

  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (tab === 'history') {
      this.loadShareHistory();
    }
  },

  loadShareHistory: function () {
    api.location.getShareList().then((res) => {
      this.setData({ shareHistory: res || [] });
    }).catch(() => {
      const mockHistory = [
        {
          shareId: 'shr001',
          desensitizedAddress: '北京市朝阳区***',
          createTime: '2024-01-15 10:30',
          duration: 24,
          viewCount: 5,
          status: 'active'
        },
        {
          shareId: 'shr002',
          desensitizedAddress: '北京市海淀区***',
          createTime: '2024-01-14 14:20',
          duration: 12,
          viewCount: 3,
          status: 'expired'
        }
      ];
      this.setData({ shareHistory: mockHistory });
    });
  },

  openShareModal: function () {
    this.setData({
      showShareModal: true,
      shareLink: 'https://qiansan.com/share/' + Date.now()
    });
  },

  closeShareModal: function () {
    this.setData({ showShareModal: false });
  },

  showDurationPicker: function () {
    wx.showActionSheet({
      itemList: this.data.durationOptions.map(d => `${d}小时`),
      success: (res) => {
        this.setData({
          selectedDuration: this.data.durationOptions[res.tapIndex]
        });
      }
    });
  },

  copyShareLink: function () {
    wx.setClipboardData({
      data: this.data.shareLink,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  },

  createShare: function () {
    wx.showLoading({ title: '创建中...' });
    
    const data = {
      latitude: this.data.currentLocation.latitude,
      longitude: this.data.currentLocation.longitude,
      duration: this.data.selectedDuration,
      address: this.data.rawAddress
    };

    api.location.createShare(data).then((res) => {
      wx.hideLoading();
      wx.showToast({
        title: '分享创建成功',
        icon: 'success'
      });
      this.closeShareModal();
      this.loadShareHistory();
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({
        title: '创建失败，已保存本地',
        icon: 'none'
      });
      
      const mockShare = {
        shareId: 'shr' + Date.now(),
        desensitizedAddress: this.data.desensitizedAddress,
        createTime: new Date().toLocaleString(),
        duration: this.data.selectedDuration,
        viewCount: 0,
        status: 'active'
      };
      
      const history = [...this.data.shareHistory, mockShare];
      this.setData({ shareHistory: history });
      this.closeShareModal();
    });
  },

  cancelShare: function (e) {
    const shareId = e.currentTarget.dataset.shareId;
    
    wx.showModal({
      title: '取消分享',
      content: '确定要取消此位置分享吗？',
      success: (res) => {
        if (res.confirm) {
          api.location.cancelShare(shareId).then(() => {
            wx.showToast({
              title: '已取消分享',
              icon: 'success'
            });
            this.loadShareHistory();
          }).catch(() => {
            wx.showToast({
              title: '取消失败',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  onMapRegionChange: function () {
  },

  onMarkerTap: function () {
  }
});