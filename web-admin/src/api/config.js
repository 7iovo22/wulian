import request from './request'

// 获取系统配置
export function getSystemConfig() {
  return request({
    url: '/config/system',
    method: 'get'
  })
}

// 更新MQTT配置
export function updateMqttConfig(data) {
  return request({
    url: '/config/mqtt',
    method: 'put',
    data
  })
}

// 更新报警规则配置
export function updateAlarmRuleConfig(data) {
  return request({
    url: '/config/alarm-rule',
    method: 'put',
    data
  })
}

// 更新短信模板配置
export function updateSmsTemplateConfig(data) {
  return request({
    url: '/config/sms-template',
    method: 'put',
    data
  })
}