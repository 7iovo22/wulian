import request from './request'

// 获取报警列表
export function getAlarmList(params) {
  return request({
    url: '/warning/list',
    method: 'get',
    params
  })
}

// 获取报警详情
export function getAlarmDetail(id) {
  return request({
    url: `/warning/detail/${id}`,
    method: 'get'
  })
}

// 处理报警
export function handleAlarm(id, data) {
  return request({
    url: `/warning/handle/${id}`,
    method: 'put',
    data
  })
}

// 获取报警统计
export function getAlarmStats() {
  return request({
    url: '/warning/stats',
    method: 'get'
  })
}

// 分配报警工单
export function assignAlarm(id, operatorId) {
  return request({
    url: `/warning/assign/${id}`,
    method: 'put',
    params: { operatorId }
  })
}

// 获取报警趋势数据
export function getAlarmTrend(params) {
  return request({
    url: '/warning/trend',
    method: 'get',
    params
  })
}

// 获取报警类型分布
export function getAlarmTypeDistribution() {
  return request({
    url: '/warning/type-distribution',
    method: 'get'
  })
}