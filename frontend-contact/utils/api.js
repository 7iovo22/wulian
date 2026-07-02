const { request, get, post, put, delete: del } = require('./request');

module.exports = {
  contact: {
    register: (data) => post('/api/contact/register', data),
    login: (data) => post('/api/contact/login', data),
    sendCode: (data) => post('/api/contact/send-code', data),
    resetPassword: (data) => post('/api/contact/reset-password', data),
    getRiders: () => get('/api/contact/riders'),
    getNotifications: () => get('/api/contact/notifications')
  },

  rider: {
    getLocation: (riderId) => get(`/api/location/realtime/${riderId}`),
    getAlarms: () => get('/api/warning/list'),
    getEventReport: (eventId) => get(`/api/report/event/${eventId}`),
    getDailyReport: (date) => get(`/api/report/daily/${date}`)
  }
};