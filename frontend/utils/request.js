const { getBaseUrl, getTimeout, isLogEnabled } = require('../config/index');

// 默认超时时间（毫秒）
const DEFAULT_TIMEOUT = getTimeout();
// 最大重试次数
const MAX_RETRY = 1;
// 重试延迟（毫秒）
const RETRY_DELAY = 500;

/**
 * 网络请求封装
 * 解决微信小程序环境下的超时问题
 * @param {Object} options 请求配置
 * @param {number} retryCount 当前重试次数（内部使用）
 */
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

  // 日志记录
  if (isLogEnabled()) {
    console.log(`[Request] ${method} ${url}`, { data, timeout, retryCount });
  }

  // 网络状态检测
  if (!skipNetworkCheck) {
    return checkNetwork().then(isConnected => {
      if (!isConnected) {
        return Promise.reject(new Error('网络连接不可用，请检查网络设置'));
      }
      return doRequest(options, retryCount);
    });
  }

  return doRequest(options, retryCount);
}

/**
 * 执行实际请求
 */
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
  let userId = '';
  try {
    const userInfoStr = wx.getStorageSync('userInfo');
    if (userInfoStr) {
      const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr;
      userId = userInfo?.id || '';
    }
  } catch (e) {
    console.error('[Request] Parse userInfo error:', e);
  }
  const defaultHeader = {
    'Content-Type': 'application/json',
    'X-User-Id': userId
  };

  if (token) {
    defaultHeader['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getBaseUrl();
  const requestUrl = baseUrl + url;

  if (isLogEnabled()) {
    console.log(`[Request URL] ${requestUrl}`);
  }

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    wx.request({
      url: requestUrl,
      method: method.toUpperCase(),
      data: data,
      header: { ...defaultHeader, ...header },
      timeout: timeout,
      success: (res) => {
        const duration = Date.now() - startTime;
        if (isLogEnabled()) {
          console.log(`[Response] ${url} ${res.statusCode} (${duration}ms)`, res.data);
        }

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
        } else if (res.statusCode === 404) {
          wx.showToast({
            title: '接口不存在',
            icon: 'none',
            duration: 2000
          });
          reject(new Error('接口不存在'));
        } else if (res.statusCode >= 500) {
          // 尝试从响应中获取详细的错误信息
          let errorMsg = '服务器错误';
          if (res.data && res.data.message) {
            errorMsg = res.data.message;
          }
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          });
          reject(new Error(errorMsg));
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
        const duration = Date.now() - startTime;
        if (isLogEnabled()) {
          console.error(`[Request Failed] ${url} (${duration}ms)`, err);
        }

        if (shouldShowLoading) {
          wx.hideLoading();
        }

        const shouldRetry = retryCount < MAX_RETRY && isRetryableError(err);

        if (shouldRetry) {
          if (isLogEnabled()) {
            console.log(`[Retry] ${url} attempt ${retryCount + 1}/${MAX_RETRY}`);
          }

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

/**
 * 检查网络状态
 */
function checkNetwork() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType;
        if (isLogEnabled()) {
          console.log(`[Network] 当前网络类型: ${networkType}`);
        }
        // none 表示无网络
        resolve(networkType !== 'none');
      },
      fail: () => {
        // 获取网络类型失败，默认认为有网络
        resolve(true);
      }
    });
  });
}

/**
 * 判断是否为可重试的错误
 */
function isRetryableError(err) {
  const errMsg = err.errMsg || err.message || '';
  // 超时、网络错误、连接失败等可重试
  return errMsg.includes('timeout') ||
    errMsg.includes('network') ||
    errMsg.includes('fail') ||
    errMsg.includes('request:fail');
}

/**
 * 获取用户友好的错误信息
 */
function getErrorMessage(err) {
  const errMsg = err.errMsg || err.message || '';

  if (errMsg.includes('timeout')) {
    return '请求超时，请稍后重试';
  }
  if (errMsg.includes('network') || errMsg.includes('fail')) {
    return '网络连接失败，请检查网络';
  }
  return '网络请求失败';
}

/**
 * 处理未授权情况
 */
function handleUnauthorized() {
  wx.showToast({
    title: '登录已过期，请重新登录',
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

/**
 * GET请求
 */
function get(url, data = {}, options = {}) {
  return request({ url, method: 'GET', data, ...options });
}

/**
 * POST请求
 */
function post(url, data = {}, options = {}) {
  return request({ url, method: 'POST', data, ...options });
}

/**
 * PUT请求
 */
function put(url, data = {}, options = {}) {
  return request({ url, method: 'PUT', data, ...options });
}

/**
 * DELETE请求
 */
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