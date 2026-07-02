const { request, get, post, put, delete: del } = require('./request');

module.exports = {
  contact: {
    register: (data) => post('/api/contact/register', data),
    login: (data) => post('/api/contact/login', data),
    getRiders: () => get('/api/contact/riders'),
    getNotifications: () => get('/api/contact/notifications')
  },
  user: {
    wechatLogin: (data) => post('/api/user/wechat/login', data),
    phoneBind: (data) => post('/api/user/phone/bind', data),
    getUserInfo: () => get('/api/user/info'),
    updateUserInfo: (data) => put('/api/user/info', data),
    getContacts: () => get('/api/user/contacts'),
    addContact: (data) => post('/api/user/contacts', data),
    updateContact: (data) => put('/api/user/contacts', data),
    deleteContact: (id) => del(`/api/user/contacts/${id}`)
  },

  device: {
    bind: (data) => post('/api/device/bind', data),
    unbind: (id) => del(`/api/device/unbind/${id}`),
    getStatus: () => get('/api/device/status'),
    controlLed: (status) => put('/api/device/led', { status }),
    setVoice: (volume) => put('/api/device/voice', { volume }),
    getLatestData: () => get('/api/device/data/latest')
  },

  sos: {
    trigger: (data) => post('/api/sos/trigger', data),
    cancel: () => post('/api/sos/cancel'),
    confirm: () => post('/api/sos/confirm'),
    getHistory: () => get('/api/sos/history')
  },

  warning: {
    getList: () => get('/api/warning/list'),
    getDetail: (id) => get(`/api/warning/detail/${id}`),
    handle: (id) => put(`/api/warning/handle/${id}`),
    getStats: () => get('/api/warning/stats')
  },

  location: {
    update: (data) => post('/api/location/update', data),
    getRealtime: (riderId) => get(`/api/location/realtime/${riderId}`),
    getHistory: (riderId, params) => get(`/api/location/history/${riderId}`, params),
    share: () => post('/api/location/share')
  },

  health: {
    getCurrent: () => get('/api/health/current'),
    getHistory: (params) => get('/api/health/history', params),
    getHeartRate: (params) => get('/api/health/heartrate', params),
    getTemperature: (params) => get('/api/health/temperature', params)
  },

  report: {
    getDaily: () => get('/api/report/daily'),
    getWeekly: () => get('/api/report/weekly'),
    getMonthly: () => get('/api/report/monthly'),
    getTrend: () => get('/api/report/trend'),
    getDailyReport: (date) => get(`/api/report/daily/${date}`),
    generateDailyReport: (date) => post('/api/report/daily/generate', { date }),
    getEventReport: (eventId) => get(`/api/report/event/${eventId}`),
    generateEventReport: (eventId) => post('/api/report/event/generate', { eventId })
  },

  fatigue: {
    getCurrent: () => get('/api/fatigue/current'),
    getHistory: () => get('/api/fatigue/history'),
    startRest: () => post('/api/fatigue/rest/start'),
    completeRest: () => post('/api/fatigue/rest/complete'),
    setDispatch: (status) => put('/api/fatigue/dispatch', { status })
  },

  evidence: {
    getList: () => get('/api/evidence/list'),
    generateReport: () => post('/api/evidence/report'),
    export: (id) => get(`/api/evidence/export/${id}`),
    claim: (data) => post('/api/evidence/claim', data)
  },

  mutual: {
    requestHelp: (data) => post('/api/mutual/help/request', data),
    cancelHelp: (requestId) => get(`/api/mutual/help/cancel?requestId=${requestId}`),
    respondHelp: (requestId) => get(`/api/mutual/help/respond?requestId=${requestId}`),
    getNearby: () => get('/api/mutual/help/nearby'),
    getHistory: () => get('/api/mutual/help/history')
  }
};