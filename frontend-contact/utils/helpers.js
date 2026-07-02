function maskPhone(phone) {
  if (!phone || phone.length !== 11) {
    return phone || '';
  }
  return phone.substring(0, 3) + '****' + phone.substring(7);
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else {
    return Math.floor(diff / day) + '天前';
  }
}

function getStatusColor(status) {
  const colors = {
    online: '#52C41A',
    offline: '#999999',
    warning: '#FAAD14',
    danger: '#FF4D4F',
    safe: '#52C41A'
  };
  return colors[status] || '#999999';
}

function getStatusText(status) {
  const texts = {
    online: '在线',
    offline: '离线',
    warning: '预警',
    danger: '危险',
    safe: '安全'
  };
  return texts[status] || status;
}

function cacheSet(key, value, expireSeconds = 300) {
  const data = {
    value: value,
    expireTime: Date.now() + expireSeconds * 1000
  };
  wx.setStorageSync(key, JSON.stringify(data));
}

function cacheGet(key) {
  try {
    const str = wx.getStorageSync(key);
    if (!str) return null;
    
    const data = JSON.parse(str);
    if (Date.now() > data.expireTime) {
      wx.removeStorageSync(key);
      return null;
    }
    
    return data.value;
  } catch (e) {
    return null;
  }
}

function cacheRemove(key) {
  wx.removeStorageSync(key);
}

module.exports = {
  maskPhone,
  formatTime,
  formatRelativeTime,
  getStatusColor,
  getStatusText,
  cacheSet,
  cacheGet,
  cacheRemove
};
