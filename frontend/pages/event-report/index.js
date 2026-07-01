const api = require('../../utils/api');
const storage = require('../../utils/storage');
const { formatNumber, formatText, formatTime } = require('../../utils/helpers');

Page({
  data: {
    eventId: '',
    isLoading: true,
    isGenerating: false,
    reportData: null,
    isAiMode: true,
    riskColor: '#E57373'
  },

  onLoad: function (options) {
    this.setData({ eventId: options.eventId || 'evt001' });
    this.loadReport();
  },

  onPullDownRefresh: function () {
    this.loadReport(true);
  },

  loadReport: function (isRefresh = false) {
    if (!isRefresh) {
      this.setData({ isLoading: true });
    }

    api.report.getEventReport(this.data.eventId).then((res) => {
      if (isRefresh) {
        wx.stopPullDownRefresh();
      }

      this.setData({
        reportData: res,
        isAiMode: !!res.aiAnalysis,
        isLoading: false,
        riskColor: this.getRiskColor(res.riskLevel)
      });

      this.cacheReport(res);
    }).catch(() => {
      if (isRefresh) {
        wx.stopPullDownRefresh();
      }

      const cachedReport = this.getCachedReport();
      if (cachedReport) {
        this.setData({
          reportData: cachedReport,
          isAiMode: !!cachedReport.aiAnalysis,
          isLoading: false
        });
      } else {
        this.generateMockReport();
      }
    });
  },

  generateMockReport: function () {
    const mockReport = {
      id: 'event_' + this.data.eventId,
      eventId: this.data.eventId,
      title: '摔倒事件复盘报告',
      eventType: 'fall',
      riskLevel: 'high',
      riskScore: 85,
      eventTime: '2024-01-15 10:30:25',
      location: '北京市朝阳区***',
      timeline: [
        {
          time: '10:30:20',
          event: '检测到异常加速度',
          type: 'warning',
          data: 'X轴: 4.2g, Y轴: 1.8g, Z轴: -0.5g'
        },
        {
          time: '10:30:22',
          event: '检测到剧烈旋转',
          type: 'warning',
          data: '角速度: 125°/s'
        },
        {
          time: '10:30:24',
          event: '头盔与地面接触',
          type: 'danger',
          data: '撞击力: 1500N'
        },
        {
          time: '10:30:25',
          event: '摔倒确认，自动触发SOS',
          type: 'danger',
          data: 'SOS已发送给紧急联系人'
        },
        {
          time: '10:30:30',
          event: '心率监测恢复正常',
          type: 'normal',
          data: '心率: 98bpm'
        }
      ],
      riskFactors: [
        { name: '撞击力度', score: 92 },
        { name: '头部保护', score: 78 },
        { name: '事故严重程度', score: 85 },
        { name: '环境风险', score: 45 }
      ],
      telemetry: {
        maxAcceleration: 4.8,
        maxRotation: 125,
        heartRate: 98,
        temperature: 36.8,
        speed: 28.5,
        deviceStatus: '正常'
      },
      aiAnalysis: '',
      recommendations: [
        '本次事故中头盔有效保护了头部，建议继续佩戴',
        '事发时速度较高，建议在城市道路骑行时控制速度在20km/h以内',
        '建议定期检查头盔内部缓冲材料状态',
        '建议在骑行前进行设备自检，确保传感器正常工作'
      ],
      generateTime: new Date().toLocaleString()
    };

    this.setData({
      reportData: mockReport,
      isAiMode: false,
      isLoading: false
    });

    this.cacheReport(mockReport);
  },

  generateReport: function () {
    if (this.data.isGenerating) return;

    this.setData({ isGenerating: true });
    wx.showLoading({ title: 'AI分析中...' });

    api.report.generateEventReport(this.data.eventId).then((res) => {
      wx.hideLoading();
      this.setData({
        reportData: res,
        isAiMode: !!res.aiAnalysis,
        isGenerating: false
      });
      this.cacheReport(res);
      wx.showToast({
        title: '分析完成',
        icon: 'success'
      });
    }).catch(() => {
      wx.hideLoading();
      this.setData({ isGenerating: false });
      wx.showToast({
        title: 'AI服务暂不可用',
        icon: 'none'
      });
    });
  },

  cacheReport: function (report) {
    const reports = storage.get('cachedEventReports', {});
    reports[this.data.eventId] = {
      ...report,
      cachedAt: Date.now()
    };
    storage.set('cachedEventReports', reports);
  },

  getCachedReport: function () {
    const reports = storage.get('cachedEventReports', {});
    const cached = reports[this.data.eventId];
    if (cached && Date.now() - cached.cachedAt < 24 * 60 * 60 * 1000) {
      return cached;
    }
    return null;
  },

  getRiskColor: function (level) {
    const colors = {
      high: '#E57373',
      medium: '#FFB74D',
      low: '#4CAF50'
    };
    return colors[level] || '#78909C';
  },

  copyReport: function () {
    const report = this.data.reportData;
    if (!report) return;

    let text = `${report.title}\n`;
    text += `事件ID：${report.eventId}\n`;
    text += `风险等级：${report.riskLevel === 'high' ? '高危' : report.riskLevel === 'medium' ? '中危' : '低危'}\n`;
    text += `风险评分：${report.riskScore}分\n`;
    text += `事件时间：${report.eventTime}\n`;
    text += `事件地点：${report.location}\n\n`;

    text += `【事件过程】\n`;
    report.timeline.forEach((item) => {
      text += `${item.time} - ${item.event}\n`;
    });
    text += `\n【遥测数据】\n`;
    text += `最大加速度：${report.telemetry.maxAcceleration}g\n`;
    text += `最大角速度：${report.telemetry.maxRotation}°/s\n`;
    text += `事发时心率：${report.telemetry.heartRate}bpm\n`;
    text += `事发时速度：${report.telemetry.speed}km/h\n\n`;

    if (report.aiAnalysis) {
      text += `【AI分析】\n${report.aiAnalysis}\n\n`;
    }

    text += `【安全建议】\n`;
    report.recommendations.forEach((item, index) => {
      text += `${index + 1}. ${item}\n`;
    });

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '报告已复制',
          icon: 'success'
        });
      }
    });
  },

  saveReport: function () {
    const report = this.data.reportData;
    if (!report) return;

    const fileContent = JSON.stringify(report, null, 2);
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/event_${this.data.eventId}.json`;

    fs.writeFile({
      filePath,
      data: fileContent,
      encoding: 'utf8',
      success: () => {
        wx.showToast({
          title: '报告已保存',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },

  shareReport: function () {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  onShareAppMessage: function () {
    return {
      title: this.data.reportData?.title || '事故复盘报告',
      path: `/pages/event-report/index?eventId=${this.data.eventId}`
    };
  }
});