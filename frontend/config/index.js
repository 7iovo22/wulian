/**
 * 环境配置文件
 * 解决微信小程序网络请求超时问题
 */

// 环境类型
const ENV_TYPE = {
  DEV: 'dev',      // 开发环境
  TEST: 'test',    // 测试环境
  PROD: 'prod'     // 生产环境
};

// 当前环境（根据需要修改）
const currentEnv = ENV_TYPE.DEV;

// 各环境配置
const envConfig = {
  [ENV_TYPE.DEV]: {
    baseUrl: 'http://localhost:8080',
    timeout: 15000,
    enableLog: true
  },
  [ENV_TYPE.TEST]: {
    baseUrl: 'https://test-api.example.com',
    timeout: 15000,
    enableLog: true
  },
  [ENV_TYPE.PROD]: {
    baseUrl: 'https://api.example.com',
    timeout: 10000,
    enableLog: false
  }
};

/**
 * 获取当前配置
 * 注意：微信小程序真机调试或发布时，需要将 baseUrl 改为实际服务器地址
 * 并在微信公众平台配置服务器域名白名单
 */
function getConfig() {
  return envConfig[currentEnv];
}

/**
 * 获取基础URL
 * 开发环境：使用 localhost（需在开发者工具中勾选"不校验合法域名"）
 * 生产环境：使用正式域名（需在微信公众平台配置）
 */
function getBaseUrl() {
  return getConfig().baseUrl;
}

/**
 * 获取超时时间
 */
function getTimeout() {
  return getConfig().timeout;
}

/**
 * 是否启用日志
 */
function isLogEnabled() {
  return getConfig().enableLog;
}

module.exports = {
  ENV_TYPE,
  currentEnv,
  getConfig,
  getBaseUrl,
  getTimeout,
  isLogEnabled
};