import request from './request'

// 获取健康数据
export function getHealthCurrent() {
  return request({
    url: '/health/current',
    method: 'get'
  })
}

// 获取健康历史数据
export function getHealthHistory(params) {
  return request({
    url: '/health/history',
    method: 'get',
    params
  })
}

// 获取心率数据
export function getHeartRateData(params) {
  return request({
    url: '/health/heartrate',
    method: 'get',
    params
  })
}

// 获取体温数据
export function getTemperatureData(params) {
  return request({
    url: '/health/temperature',
    method: 'get',
    params
  })
}

// 获取疲劳等级
export function getFatigueCurrent() {
  return request({
    url: '/fatigue/current',
    method: 'get'
  })
}

// 获取疲劳历史
export function getFatigueHistory(params) {
  return request({
    url: '/fatigue/history',
    method: 'get',
    params
  })
}