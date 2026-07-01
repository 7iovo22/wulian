function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDistance(meters) {
  if (!meters || meters < 0) return '0m';
  
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)}km`;
  }
  
  return `${meters.toFixed(0)}m`;
}

function formatSpeed(metersPerSecond) {
  if (!metersPerSecond || metersPerSecond < 0) return '0km/h';
  return `${(metersPerSecond * 3.6).toFixed(1)}km/h`;
}

function formatPhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

function formatNumber(value, fallback = '--') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  const num = parseFloat(value);
  return isNaN(num) ? fallback : value;
}

function formatText(value, fieldName = '') {
  if (value === null || value === undefined || value === '') {
    return fieldName ? `暂无${fieldName}` : '暂无数据';
  }
  return value;
}

function formatTime(value, fallback = '--') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return value;
}

function formatPhoneWithFallback(phone, fallback = '未绑定联系人') {
  if (!phone || phone.length !== 11) {
    return fallback;
  }
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

function validateCode(code) {
  return /^\d{6}$/.test(code);
}

function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

function throttle(fn, delay = 300) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

function getSafetyScoreColor(score) {
  if (score >= 90) return '#32CD32';
  if (score >= 70) return '#1E90FF';
  if (score >= 50) return '#FFA500';
  return '#DC143C';
}

function getSafetyScoreText(score) {
  if (score >= 90) return '优秀';
  if (score >= 70) return '良好';
  if (score >= 50) return '一般';
  return '较差';
}

function getHeartRateStatus(heartRate) {
  if (heartRate >= 60 && heartRate <= 100) return 'normal';
  if (heartRate > 100 && heartRate <= 110) return 'warning';
  return 'danger';
}

function getHeartRateStatusText(heartRate) {
  if (heartRate >= 60 && heartRate <= 100) return '正常';
  if (heartRate > 100 && heartRate <= 110) return '偏高';
  return '异常';
}

function getTemperatureStatus(temp) {
  temp = parseFloat(temp);
  if (temp >= 36.0 && temp <= 37.2) return 'normal';
  if (temp > 37.2 && temp <= 38.0) return 'warning';
  return 'danger';
}

function getTemperatureStatusText(temp) {
  temp = parseFloat(temp);
  if (temp >= 36.0 && temp <= 37.2) return '正常';
  if (temp > 37.2 && temp <= 38.0) return '偏高';
  return '异常';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function getWarningTypeText(type) {
  const types = {
    'fatigue': '疲劳预警',
    'collision': '碰撞预警',
    'fall': '摔倒预警',
    'sos': '紧急求助',
    'temperature': '体温预警',
    'heartrate': '心率预警',
    'speed': '超速预警',
    'zone': '电子围栏预警'
  };
  return types[type] || '未知预警';
}

function getWarningTypeIcon(type) {
  const icons = {
    'fatigue': '😴',
    'collision': '💥',
    'fall': '🛡️',
    'sos': '🚨',
    'temperature': '🌡️',
    'heartrate': '❤️',
    'speed': '⚡',
    'zone': '📍'
  };
  return icons[type] || '⚠️';
}

function getWarningTypeColor(type) {
  const colors = {
    'fatigue': '#FFA500',
    'collision': '#DC143C',
    'fall': '#DC143C',
    'sos': '#DC143C',
    'temperature': '#FF6347',
    'heartrate': '#FF6347',
    'speed': '#FFA500',
    'zone': '#1E90FF'
  };
  return colors[type] || '#999999';
}

function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  });
}

function hideLoading() {
  wx.hideLoading();
}

function showToast(title, icon = 'none', duration = 2000) {
  wx.showToast({
    title,
    icon,
    duration
  });
}

function showModal(title, content, confirmText = '确定', cancelText = '取消') {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText,
      cancelText,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
}

function navigateTo(url, params = {}) {
  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  if (query) {
    url = `${url}?${query}`;
  }
  
  wx.navigateTo({ url });
}

function redirectTo(url, params = {}) {
  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  if (query) {
    url = `${url}?${query}`;
  }
  
  wx.redirectTo({ url });
}

function reLaunch(url, params = {}) {
  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  if (query) {
    url = `${url}?${query}`;
  }
  
  wx.reLaunch({ url });
}

function switchTab(url) {
  wx.switchTab({ url });
}

function goBack(delta = 1) {
  wx.navigateBack({ delta });
}

function getDeviceInfo() {
  try {
    const systemInfo = wx.getSystemInfoSync();
    return {
      model: systemInfo.model,
      system: systemInfo.system,
      version: systemInfo.version,
      platform: systemInfo.platform,
      screenWidth: systemInfo.screenWidth,
      screenHeight: systemInfo.screenHeight,
      statusBarHeight: systemInfo.statusBarHeight,
      safeArea: systemInfo.safeArea
    };
  } catch (e) {
    console.error('Get device info error:', e);
    return null;
  }
}

function getNetworkType() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType);
      },
      fail: () => {
        resolve('unknown');
      }
    });
  });
}

function makePhoneCall(phoneNumber) {
  return new Promise((resolve, reject) => {
    wx.makePhoneCall({
      phoneNumber: String(phoneNumber),
      success: () => resolve(),
      fail: (err) => reject(err)
    });
  });
}

function chooseImage(count = 1, sourceType = ['album', 'camera']) {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sourceType,
      success: (res) => resolve(res.tempFilePaths),
      fail: (err) => reject(err)
    });
  });
}

function previewImage(urls, current = '') {
  wx.previewImage({
    urls,
    current: current || urls[0]
  });
}

function saveImageToPhotos(filePath) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotos({
      filePath,
      success: () => resolve(),
      fail: (err) => reject(err)
    });
  });
}

function getLocation(type = 'gcj02') {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });
}

function openLocation(latitude, longitude, scale = 18, name = '', address = '') {
  wx.openLocation({
    latitude,
    longitude,
    scale,
    name,
    address
  });
}

module.exports = {
  formatDate,
  formatDuration,
  formatDistance,
  formatSpeed,
  formatPhone,
  formatNumber,
  formatText,
  formatTime,
  formatPhoneWithFallback,
  validatePhone,
  validateCode,
  debounce,
  throttle,
  deepClone,
  getSafetyScoreColor,
  getSafetyScoreText,
  getHeartRateStatus,
  getHeartRateStatusText,
  getTemperatureStatus,
  getTemperatureStatusText,
  calculateDistance,
  getWarningTypeText,
  getWarningTypeIcon,
  getWarningTypeColor,
  showLoading,
  hideLoading,
  showToast,
  showModal,
  navigateTo,
  redirectTo,
  reLaunch,
  switchTab,
  goBack,
  getDeviceInfo,
  getNetworkType,
  makePhoneCall,
  chooseImage,
  previewImage,
  saveImageToPhotos,
  getLocation,
  openLocation
};