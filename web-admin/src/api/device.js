import request from './request'

// 获取设备状态列表
export function getDeviceList(params) {
  return request({
    url: '/device/list',
    method: 'get',
    params
  })
}

// 获取设备详情
export function getDeviceDetail(id) {
  return request({
    url: `/device/detail/${id}`,
    method: 'get'
  })
}

// 获取设备状态
export function getDeviceStatus() {
  return request({
    url: '/device/status',
    method: 'get'
  })
}

// 获取最新设备数据
export function getDeviceDataLatest() {
  return request({
    url: '/device/data/latest',
    method: 'get'
  })
}

// 获取设备历史数据
export function getDeviceDataHistory(params) {
  return request({
    url: '/device/data/history',
    method: 'get',
    params
  })
}

// 控制LED状态
export function controlLed(status) {
  return request({
    url: '/device/led',
    method: 'put',
    params: { status }
  })
}

// 设置语音播报音量
export function setVoiceVolume(volume) {
  return request({
    url: '/device/voice',
    method: 'put',
    params: { volume }
  })
}

// 远程重启设备
export function restartDevice(id) {
  return request({
    url: `/device/restart/${id}`,
    method: 'post'
  })
}

// 绑定设备
export function bindDevice(data) {
  return request({
    url: '/device/bind',
    method: 'post',
    data
  })
}

// 解绑设备
export function unbindDevice(id) {
  return request({
    url: `/device/unbind/${id}`,
    method: 'delete'
  })
}