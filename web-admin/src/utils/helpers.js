// 格式化日期时间
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 格式化日期
export function formatDate(date) {
  return formatDateTime(date, 'YYYY-MM-DD')
}

// 获取今日日期范围
export function getTodayRange() {
  const today = new Date()
  const start = new Date(today.setHours(0, 0, 0, 0))
  const end = new Date(today.setHours(23, 59, 59, 999))
  return { start, end }
}

// 获取近7天日期范围
export function getRecent7DaysRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

// 获取近30天日期范围
export function getRecent30DaysRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 29)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

// 报警类型映射
export const alarmTypeMap = {
  fall: { label: '摔倒检测', color: 'danger' },
  sos: { label: 'SOS求助', color: 'danger' },
  fatigue: { label: '疲劳预警', color: 'warning' },
  heat: { label: '中暑预警', color: 'warning' },
  danger: { label: '危险驾驶', color: 'warning' }
}

// 设备状态映射
export const deviceStatusMap = {
  0: { label: '离线', color: 'info' },
  1: { label: '在线', color: 'success' }
}

// 处理状态映射
export const handleStatusMap = {
  0: { label: '待处理', color: 'danger' },
  1: { label: '处理中', color: 'warning' },
  2: { label: '已完成', color: 'success' }
}

// 用户角色映射
export const roleMap = {
  rider: { label: '骑手', color: 'primary' },
  contact: { label: '紧急联系人', color: 'info' },
  admin: { label: '管理员', color: 'warning' },
  operator: { label: '运维人员', color: 'success' }
}

// 计算环比变化
export function calculateChange(current, previous) {
  if (!previous || previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
}

// 导出CSV
export function exportCSV(data, filename) {
  if (!data || !data.length) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h] || '').join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${formatDate(new Date())}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}