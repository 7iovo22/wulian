const { getBaseUrl, getTimeout } = require('../config/index');

const DEFAULT_TIMEOUT = getTimeout();
const MAX_RETRY = 1;
const RETRY_DELAY = 500;

function request(options, retryCount = 0) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    loading = true,
    timeout = DEFAULT_TIMEOUT,
    skipNetworkCheck = false
  } = options;

  if (!skipNetworkCheck) {
    return checkNetwork().then(isConnected => {
      if (!isConnected) {
        return Promise.reject(new Error('网络连接不可用'));
      }
      return doRequest(options, retryCount);
    });
  }

  return doRequest(options, retryCount);
}

function doRequest(options, retryCount = 0) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    loading = true,
    timeout = DEFAULT_TIMEOUT
  } = options;

  const isFirstRequest = retryCount === 0;
  const shouldShowLoading = loading && isFirstRequest;

  if (shouldShowLoading) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
  }

  const token = wx.getStorageSync('token');
  const userInfo = wx.getStorageSync('userInfo');
  const defaultHeader = {
    'Content-Type': 'application/json',
    'X-User-Id': userInfo?.id || '',
    'X-User-Phone': userInfo?.phone || ''
  };

  if (token) {
    defaultHeader['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getBaseUrl();
  const requestUrl = baseUrl + url;

  return new Promise((resolve, reject) => {
    wx.request({
      url: requestUrl,
      method: method.toUpperCase(),
      data: data,
      header: { ...defaultHeader, ...header },
      timeout: timeout,
      success: (res) => {
        if (shouldShowLoading) {
          wx.hideLoading();
        }

        if (res.statusCode === 200) {
          const { code, message, data } = res.data;
          if (code === 200) {
            resolve(data);
          } else {
            const errorMsg = message || '请求失败';
            wx.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 2000
            });
            reject(new Error(errorMsg));
          }
        } else if (res.statusCode === 401) {
          handleUnauthorized();
          reject(new Error('未授权'));
        } else {
          wx.showToast({
            title: `请求失败(${res.statusCode})`,
            icon: 'none',
            duration: 2000
          });
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        if (shouldShowLoading) {
          wx.hideLoading();
        }

        const shouldRetry = retryCount < MAX_RETRY && isRetryableError(err);

        if (shouldRetry) {
          setTimeout(() => {
            doRequest(options, retryCount + 1).then(resolve).catch(reject);
          }, RETRY_DELAY);
        } else {
          const errorMsg = getErrorMessage(err);
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
          reject(err);
        }
      }
    });
  });
}

function checkNetwork() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType !== 'none');
      },
      fail: () => {
        resolve(true);
      }
    });
  });
}

function isRetryableError(err) {
  const errMsg = err.errMsg || err.message || '';
  return errMsg.includes('timeout') ||
    errMsg.includes('network') ||
    errMsg.includes('fail') ||
    errMsg.includes('request:fail');
}

function getErrorMessage(err) {
  const errMsg = err.errMsg || err.message || '';

  if (errMsg.includes('timeout')) {
    return '请求超时';
  }
  if (errMsg.includes('network') || errMsg.includes('fail')) {
    return '网络连接失败';
  }
  return '网络请求失败';
}

function handleUnauthorized() {
  wx.showToast({
    title: '登录已过期',
    icon: 'none',
    duration: 2000
  });
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');

  setTimeout(() => {
    wx.reLaunch({
      url: '/pages/login/index'
    });
  }, 1500);
}

function get(url, data = {}, options = {}) {
  return request({ url, method: 'GET', data, ...options });
}

function post(url, data = {}, options = {}) {
  return request({ url, method: 'POST', data, ...options });
}

function put(url, data = {}, options = {}) {
  return request({ url, method: 'PUT', data, ...options });
}

function del(url, data = {}, options = {}) {
  return request({ url, method: 'DELETE', data, ...options });
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  checkNetwork,
  DEFAULT_TIMEOUT,
  MAX_RETRY
};