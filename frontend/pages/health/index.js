const { formatNumber, formatText } = require('../../utils/helpers');

Page({
  data: {
    currentData: {
      heartRate: 75,
      temperature: 36.5
    },
    chartTime: 'day',
    heartRateData: [],
    chartLabels: [],
    historyList: [],
    showHeatWarning: false
  },

  onLoad: function (options) {
    this.loadCurrentData();
    this.loadHeartRateChart();
    this.loadHistoryList();
  },

  loadCurrentData: function () {
    const mockData = {
      heartRate: Math.floor(60 + Math.random() * 30),
      temperature: (36.0 + Math.random() * 1.5).toFixed(1)
    };

    if (parseFloat(mockData.temperature) > 37.5) {
      this.setData({
        showHeatWarning: true
      });
    }

    this.setData({
      currentData: mockData
    });
  },

  loadHeartRateChart: function () {
    const labels = [];
    const data = [];

    for (let i = 0; i < 24; i++) {
      labels.push(`${i}:00`);
      data.push({
        x: (i / 23) * 100,
        y: ((Math.random() * 40) + 50)
      });
    }

    this.setData({
      heartRateData: data,
      chartLabels: labels.filter((_, i) => i % 4 === 0)
    });
  },

  loadHistoryList: function () {
    const mockHistory = [
      { id: 1, time: '10:30', heartRate: 78, temperature: 36.5, status: 'normal' },
      { id: 2, time: '09:15', heartRate: 82, temperature: 36.8, status: 'normal' },
      { id: 3, time: '08:00', heartRate: 72, temperature: 36.3, status: 'normal' },
      { id: 4, time: '07:00', heartRate: 68, temperature: 36.1, status: 'normal' },
      { id: 5, time: '06:00', heartRate: 75, temperature: 37.2, status: 'warning' }
    ];

    this.setData({
      historyList: mockHistory
    });
  },

  setChartTime: function (e) {
    const time = e.currentTarget.dataset.time;
    this.setData({
      chartTime: time
    });
    this.loadHeartRateChart();
  },

  getHeartRateStatus: function (heartRate) {
    if (heartRate >= 60 && heartRate <= 100) return 'normal';
    if (heartRate > 100 && heartRate <= 110) return 'warning';
    return 'danger';
  },

  getHeartRateStatusText: function (heartRate) {
    if (heartRate >= 60 && heartRate <= 100) return '正常';
    if (heartRate > 100 && heartRate <= 110) return '偏高';
    return '异常';
  },

  getTemperatureStatus: function (temp) {
    temp = parseFloat(temp);
    if (temp >= 36.0 && temp <= 37.2) return 'normal';
    if (temp > 37.2 && temp <= 38.0) return 'warning';
    return 'danger';
  },

  getTemperatureStatusText: function (temp) {
    temp = parseFloat(temp);
    if (temp >= 36.0 && temp <= 37.2) return '正常';
    if (temp > 37.2 && temp <= 38.0) return '偏高';
    return '异常';
  },

  dismissHeatWarning: function () {
    this.setData({
      showHeatWarning: false
    });
  },

  goBack: function () {
    wx.navigateBack();
  }
});