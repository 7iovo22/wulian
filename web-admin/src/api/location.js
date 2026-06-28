import request from './request'

// 获取位置实时数据
export function getLocationRealtime(riderId) {
  return request({
    url: `/location/realtime/${riderId}`,
    method: 'get'
  })
}

// 获取历史轨迹
export function getLocationHistory(riderId, params) {
  return request({
    url: `/location/history/${riderId}`,
    method: 'get',
    params
  })
}

// 获取骑手位置列表
export function getRiderLocationList(params) {
  return request({
    url: '/location/list',
    method: 'get',
    params
  })
}