import request from './request'

// 获取日报
export function getDailyReport(params) {
  return request({
    url: '/report/daily',
    method: 'get',
    params
  })
}

// 获取周报
export function getWeeklyReport(params) {
  return request({
    url: '/report/weekly',
    method: 'get',
    params
  })
}

// 获取月报
export function getMonthlyReport(params) {
  return request({
    url: '/report/monthly',
    method: 'get',
    params
  })
}

// 获取趋势数据
export function getTrendData(params) {
  return request({
    url: '/report/trend',
    method: 'get',
    params
  })
}

// 获取统计数据概览
export function getStatisticsOverview(params) {
  return request({
    url: '/report/overview',
    method: 'get',
    params
  })
}