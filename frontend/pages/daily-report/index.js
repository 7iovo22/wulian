const api = require('../../utils/api');
const storage = require('../../utils/storage');
const { formatDate, showToast, showLoading, hideLoading, getSafetyScoreColor, getSafetyScoreText, getWarningTypeText, getWarningTypeIcon, getWarningTypeColor } = require('../../utils/helpers');

Page({
  data: {
    date: '',
    isLoading: true,
    isGenerating: false,
    reportData: null,
    safetyScore: 0,
    safetyScoreColor: '',
    safetyScoreText: '',
    statsData: null,
    eventList: [],
    healthData: null,
    deviceStatus: null,
    trendData: null,
    aiSummary: '',
    isAiMode: true,
    showFullSummary: false,
    activeTab: 'overview',
    dateList: [],
    selectedDateIndex: 0
  },

  onLoad: function (options) {
    const date = options.date || formatDate(new Date(), 'YYYY-MM-DD');
    this.setData({ date });
    this.generateDateList();
    this.loadReport();
  },

  onPullDownRefresh: function () {
    this.loadReport(true);
  },

  generateDateList: function () {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push({
        value: formatDate(date, 'YYYY-MM-DD'),
        label: i === 0 ? '今天' : i === 1 ? '昨天' : formatDate(date, 'MM/DD'),
        weekday: this.getWeekday(date)
      });
    }
    this.setData({ dateList: dates });
  },

  getWeekday: function (date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  },

  onDateSelect: function (e) {
    const index = e.currentTarget.dataset.index;
    const date = this.data.dateList[index].value;
    this.setData({
      selectedDateIndex: index,
      date
    });
    this.loadReport();
  },

  loadReport: function (isRefresh = false) {
    if (!isRefresh) {
      this.setData({ isLoading: true });
    }

    api.report.getDailyReport(this.data.date).then((res) => {
      hideLoading();
      if (isRefresh) {
        wx.stopPullDownRefresh();
      }

      this.setData({
        reportData: res,
        safetyScore: res.safetyScore || 0,
        statsData: res.stats || null,
        eventList: res.events || [],
        healthData: res.health || null,
        deviceStatus: res.device || null,
        trendData: res.trend || null,
        aiSummary: res.aiSummary || '',
        isAiMode: !!res.aiSummary,
        isLoading: false
      });

      this.updateSafetyScore(res.safetyScore);
      this.cacheReport(res);
    }).catch(() => {
      hideLoading();
      if (isRefresh) {
        wx.stopPullDownRefresh();
      }

      const cachedReport = this.getCachedReport();
      if (cachedReport) {
        this.setData({
          reportData: cachedReport,
          safetyScore: cachedReport.safetyScore || 0,
          statsData: cachedReport.stats || null,
          eventList: cachedReport.events || [],
          healthData: cachedReport.health || null,
          deviceStatus: cachedReport.device || null,
          trendData: cachedReport.trend || null,
          aiSummary: cachedReport.aiSummary || '',
          isAiMode: !!cachedReport.aiSummary,
          isLoading: false
        });
        this.updateSafetyScore(cachedReport.safetyScore);
      } else {
        this.generateMockReport();
      }
    });
  },

  generateReport: function () {
    if (this.data.isGenerating) return;

    this.setData({ isGenerating: true });
    showLoading('AI分析中...');

    api.report.generateDailyReport(this.data.date).then((res) => {
      hideLoading();
      this.setData({
        reportData: res,
        safetyScore: res.safetyScore || 0,
        statsData: res.stats || null,
        eventList: res.events || [],
        healthData: res.health || null,
        deviceStatus: res.device || null,
        trendData: res.trend || null,
        aiSummary: res.aiSummary || '',
        isAiMode: !!res.aiSummary,
        isGenerating: false
      });
      this.updateSafetyScore(res.safetyScore);
      this.cacheReport(res);
      showToast('日报生成成功', 'success');
    }).catch(() => {
      hideLoading();
      this.generateMockReport();
      this.setData({ isGenerating: false });
      showToast('AI服务暂不可用，已使用模板报告');
    });
  },

  generateMockReport: function () {
    const score = 85;
    const mockReport = {
      id: 'daily_' + this.data.date,
      date: this.data.date,
      reportType: 'daily',
      title: `${this.data.date} 骑行安全日报`,
      generateTime: formatDate(new Date()),
      safetyScore: score,
      stats: {
        totalRides: 5,
        totalDistance: 45.6,
        totalDuration: 180,
        avgSpeed: 15.2,
        maxSpeed: 32.5,
        eventCount: 2,
        warningCount: 1,
        dangerCount: 1
      },
      events: [
        {
          id: 'evt001',
          type: 'fatigue',
          content: '疲劳等级达到中度，建议休息',
          time: '14:30',
          location: '北京市海淀区***',
          level: 'warning'
        },
        {
          id: 'evt002',
          type: 'speed',
          content: '检测到超速行驶，当前速度35km/h',
          time: '16:45',
          location: '北京市朝阳区***',
          level: 'warning'
        }
      ],
      health: {
        avgHeartRate: 78,
        maxHeartRate: 112,
        minHeartRate: 62,
        avgTemperature: 36.5,
        maxTemperature: 37.1,
        fatigueLevel: 'light'
      },
      device: {
        onlineTime: 480,
        offlineTime: 0,
        batteryLevel: 75,
        firmwareVersion: 'v2.1.0',
        sensorStatus: 'normal'
      },
      trend: {
        weekScore: [82, 85, 88, 80, 85, 83, score],
        weekLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '今天']
      },
      aiSummary: '',
      recommendations: [
        '今日骑行状态良好，继续保持安全骑行习惯',
        '午后出现轻度疲劳，建议调整骑行时间避开高温时段',
        '注意控制骑行速度，遵守交通规则',
        '建议定期检查头盔设备状态，确保传感器正常工作'
      ]
    };

    this.setData({
      reportData: mockReport,
      safetyScore: score,
      statsData: mockReport.stats,
      eventList: mockReport.events,
      healthData: mockReport.health,
      deviceStatus: mockReport.device,
      trendData: mockReport.trend,
      aiSummary: '',
      isAiMode: false,
      isLoading: false
    });
    this.updateSafetyScore(score);
    this.cacheReport(mockReport);
  },

  updateSafetyScore: function (score) {
    this.setData({
      safetyScoreColor: getSafetyScoreColor(score),
      safetyScoreText: getSafetyScoreText(score)
    });
  },

  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  toggleSummary: function () {
    this.setData({ showFullSummary: !this.data.showFullSummary });
  },

  viewEventDetail: function (e) {
    const event = e.currentTarget.dataset.event;
    wx.navigateTo({
      url: `/pages/event-report/index?eventId=${event.id}`
    });
  },

  viewFullReport: function () {
    wx.navigateTo({
      url: `/pages/report-preview/index?date=${this.data.date}&type=daily`
    });
  },

  copyReport: function () {
    const report = this.data.reportData;
    if (!report) return;

    let text = `${report.title}\n`;
    text += `生成时间：${report.generateTime}\n`;
    text += `安全评分：${this.data.safetyScore}分（${this.data.safetyScoreText}）\n\n`;
    text += `【骑行统计】\n`;
    text += `骑行次数：${this.data.statsData.totalRides}次\n`;
    text += `总里程：${this.data.statsData.totalDistance}km\n`;
    text += `总时长：${Math.floor(this.data.statsData.totalDuration / 60)}小时${this.data.statsData.totalDuration % 60}分钟\n`;
    text += `平均速度：${this.data.statsData.avgSpeed}km/h\n\n`;
    text += `【安全事件】共${this.data.eventList.length}条\n`;
    this.data.eventList.forEach((item, index) => {
      text += `${index + 1}. ${item.time} ${getWarningTypeText(item.type)} - ${item.content}\n`;
    });
    text += `\n【健康数据】\n`;
    text += `平均心率：${this.data.healthData.avgHeartRate}bpm\n`;
    text += `平均体温：${this.data.healthData.avgTemperature}℃\n\n`;
    text += `【安全建议】\n`;
    report.recommendations.forEach((item, index) => {
      text += `${index + 1}. ${item}\n`;
    });

    wx.setClipboardData({
      data: text,
      success: () => {
        showToast('报告已复制', 'success');
      }
    });
  },

  saveReportLocal: function () {
    const report = this.data.reportData;
    if (!report) return;

    const fileContent = JSON.stringify(report, null, 2);
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/daily_${this.data.date}.json`;

    fs.writeFile({
      filePath,
      data: fileContent,
      encoding: 'utf8',
      success: () => {
        showToast('报告已保存到本地', 'success');
      },
      fail: () => {
        showToast('保存失败，请重试');
      }
    });
  },

  cacheReport: function (report) {
    const reports = storage.get('cachedDailyReports', {});
    reports[this.data.date] = {
      ...report,
      cachedAt: Date.now()
    };
    storage.set('cachedDailyReports', reports);
  },

  getCachedReport: function () {
    const reports = storage.get('cachedDailyReports', {});
    const cached = reports[this.data.date];
    if (cached && Date.now() - cached.cachedAt < 12 * 60 * 60 * 1000) {
      return cached;
    }
    return null;
  },

  getEventLevelColor: function (level) {
    const colors = {
      normal: '#4CAF50',
      warning: '#FFB74D',
      danger: '#E57373'
    };
    return colors[level] || '#78909C';
  },

  getEventTypeName: function (type) {
    return getWarningTypeText(type);
  },

  getEventTypeIcon: function (type) {
    return getWarningTypeIcon(type);
  },

  getEventTypeColor: function (type) {
    return getWarningTypeColor(type);
  },

  getFatigueLevelText: function (level) {
    const map = {
      none: '无',
      light: '轻度',
      medium: '中度',
      heavy: '重度'
    };
    return map[level] || level;
  },

  getFatigueLevelColor: function (level) {
    const map = {
      none: '#4CAF50',
      light: '#FFB74D',
      medium: '#FF8A65',
      heavy: '#E57373'
    };
    return map[level] || '#78909C';
  },

  onShareAppMessage: function () {
    return {
      title: `${this.data.date} 骑行安全日报`,
      path: `/pages/daily-report/index?date=${this.data.date}`
    };
  }
});
