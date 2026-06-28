module.exports = {
  set: (key, value) => {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const value = wx.getStorageSync(key);
      return value !== '' ? value : defaultValue;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  clear: () => {
    try {
      wx.clearStorageSync();
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  },

  getUserInfo: () => {
    return JSON.parse(wx.getStorageSync('userInfo') || 'null');
  },

  getToken: () => {
    return wx.getStorageSync('token');
  },

  getDeviceInfo: () => {
    return JSON.parse(wx.getStorageSync('deviceInfo') || 'null');
  },

  setUserInfo: (userInfo) => {
    return wx.setStorageSync('userInfo', JSON.stringify(userInfo));
  },

  setToken: (token) => {
    return wx.setStorageSync('token', token);
  },

  setDeviceInfo: (deviceInfo) => {
    return wx.setStorageSync('deviceInfo', JSON.stringify(deviceInfo));
  }
};