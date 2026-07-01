const api = require('../../utils/api');
const storage = require('../../utils/storage');

Page({
  data: {
    isAiMode: true,
    analysisData: {
      riskSummary: '',
      disposalActions: [],
      reviewDraft: '',
      reportDate: '',
      ridingHours: 0,
      ridingDistance: 0,
      alarmCount: 0,
      safetyScore: 0,
      avgHeartRate: 0,
      maxHeartRate: 0,
      avgTemperature: 0,
      eventStats: [],
      safetySuggestions: []
    }
  },

  onLoad: function (options) {
    this.loadAnalysisData();
  },

  loadAnalysisData: function () {
    wx.showLoading({ title: 'AI分析中...' });

    const cachedDraft = storage.get('reviewDraft', '');
    
    const mockData = {
      riskSummary: '本次事件为高危摔倒事件，系统检测到头盔在10:30:00受到约1200N的冲击力，骑手心率在事发后短暂升高至105bpm后恢复正常。根据AI算法分析，事故主要原因为骑行速度较快（25km/h）加上路面湿滑导致失控。建议骑手在城市道路骑行时保持速度在20km/h以内，并注意观察路况。',
      disposalActions: [
        { title: '检查身体状况', description: '确认有无外伤或不适', status: 'completed' },
        { title: '联系紧急联系人', description: '告知当前位置和状况', status: 'completed' },
        { title: '检查头盔状态', description: '确认头盔是否损坏', status: 'pending' },
        { title: '安全评估', description: '评估是否需要就医', status: 'pending' }
      ],
      reviewDraft: cachedDraft,
      reportDate: '2024-01-15',
      ridingHours: 4.5,
      ridingDistance: 86.5,
      alarmCount: 3,
      safetyScore: 82,
      avgHeartRate: 78,
      maxHeartRate: 105,
      avgTemperature: 36.5,
      eventStats: [
        { type: 'fall', icon: '⚠️', name: '摔倒预警', count: 1 },
        { type: 'speed', icon: '⚡', name: '超速警告', count: 1 },
        { type: 'fatigue', icon: '😴', name: '疲劳预警', count: 1 }
      ],
      safetySuggestions: [
        '今日骑行时长较长，建议适当休息',
        '注意控制骑行速度，今日有1次超速记录',
        '头盔状态良好，建议定期检查缓冲材料',
        '心率监测正常，继续保持良好状态'
      ]
    };

    setTimeout(() => {
      wx.hideLoading();
      this.setData({ analysisData: mockData });
    }, 1000);
  },

  onDraftInput: function (e) {
    this.setData({
      'analysisData.reviewDraft': e.detail.value
    });
  },

  saveDraft: function () {
    const draft = this.data.analysisData.reviewDraft;
    storage.set('reviewDraft', draft);
    wx.showToast({
      title: '已保存',
      icon: 'success'
    });
  },

  goBack: function () {
    wx.navigateBack();
  }
});