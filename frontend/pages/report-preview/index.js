const api = require('../../utils/api');

Page({
  data: {
    type: '',
    date: '',
    eventId: '',
    isLoading: true,
    reportData: null
  },

  onLoad: function (options) {
    this.setData({
      type: options.type || 'daily',
      date: options.date || '',
      eventId: options.eventId || ''
    });
    this.loadReport();
  },

  onPullDownRefresh: function () {
    this.loadReport(true);
  },

  loadReport: function (isRefresh = false) {
    if (!isRefresh) {
      this.setData({ isLoading: true });
    }

    if (this.data.type === 'daily') {
      api.report.getDailyReport(this.data.date).then((res) => {
        this.handleReportLoad(res, isRefresh);
      }).catch(() => {
        this.generateMockDailyReport(isRefresh);
      });
    } else {
      api.report.getEventReport(this.data.eventId).then((res) => {
        this.handleReportLoad(res, isRefresh);
      }).catch(() => {
        this.generateMockEventReport(isRefresh);
      });
    }
  },

  handleReportLoad: function (res, isRefresh) {
    if (isRefresh) {
      wx.stopPullDownRefresh();
    }
    
    if (res.events && res.events.length > 0) {
      res.events.forEach(event => {
        event.typeText = this.getEventType(event.type);
      });
    }
    
    this.setData({
      reportData: res,
      isLoading: false
    });
  },

  generateMockDailyReport: function (isRefresh) {
    if (isRefresh) {
      wx.stopPullDownRefresh();
    }

    const mockReport = {
      id: 'daily_' + this.data.date,
      type: 'daily',
      title: `${this.data.date || '今日'} 骑行安全日报`,
      generateTime: new Date().toLocaleString(),
      safetyScore: 85,
      stats: {
        totalRides: 5,
        totalDistance: 45.6,
        avgSpeed: 15.2,
        eventCount: 2
      },
      events: [
        {
          id: 'evt001',
          type: 'fatigue',
          typeText: '疲劳预警',
          content: '疲劳等级达到中度，建议休息',
          time: '14:30',
          location: '北京市海淀区***'
        },
        {
          id: 'evt002',
          type: 'speed',
          typeText: '超速警告',
          content: '检测到超速行驶，当前速度35km/h',
          time: '16:45',
          location: '北京市朝阳区***'
        }
      ],
      health: {
        avgHeartRate: 78,
        avgTemperature: 36.5
      },
      aiAnalysis: '',
      recommendations: [
        '今日骑行状态良好，继续保持安全骑行习惯',
        '午后出现轻度疲劳，建议调整骑行时间避开高温时段',
        '注意控制骑行速度，遵守交通规则',
        '建议定期检查头盔设备状态，确保传感器正常工作'
      ]
    };

    this.setData({
      reportData: mockReport,
      isLoading: false
    });
  },

  generateMockEventReport: function (isRefresh) {
    if (isRefresh) {
      wx.stopPullDownRefresh();
    }

    const mockReport = {
      id: 'event_' + this.data.eventId,
      type: 'event',
      title: '摔倒事件复盘报告',
      generateTime: new Date().toLocaleString(),
      riskLevel: 'high',
      riskScore: 85,
      eventTime: '2024-01-15 10:30:25',
      location: '北京市朝阳区***',
      timeline: [
        { time: '10:30:20', event: '检测到异常加速度' },
        { time: '10:30:22', event: '检测到剧烈旋转' },
        { time: '10:30:24', event: '头盔与地面接触' },
        { time: '10:30:25', event: '摔倒确认，自动触发SOS' }
      ],
      aiAnalysis: '',
      recommendations: [
        '本次事故中头盔有效保护了头部，建议继续佩戴',
        '事发时速度较高，建议在城市道路骑行时控制速度在20km/h以内',
        '建议定期检查头盔内部缓冲材料状态',
        '建议在骑行前进行设备自检，确保传感器正常工作'
      ]
    };

    this.setData({
      reportData: mockReport,
      isLoading: false
    });
  },

  getEventType: function (type) {
    const types = {
      fall: '摔倒检测',
      fatigue: '疲劳预警',
      speed: '超速警告',
      heat: '中暑预警',
      danger: '危险驾驶'
    };
    return types[type] || type;
  },

  copyReport: function () {
    const report = this.data.reportData;
    if (!report) return;

    let text = `${report.title}\n`;
    text += `生成时间：${report.generateTime}\n\n`;

    if (report.type === 'daily') {
      text += `【今日概览】\n`;
      text += `骑行次数：${report.stats.totalRides}次\n`;
      text += `总里程：${report.stats.totalDistance}km\n`;
      text += `平均速度：${report.stats.avgSpeed}km/h\n`;
      text += `安全事件：${report.stats.eventCount}次\n\n`;

      if (report.events && report.events.length > 0) {
        text += `【安全事件】\n`;
        report.events.forEach((item) => {
          text += `${item.time} ${this.getEventType(item.type)} - ${item.content}\n`;
        });
        text += `\n`;
      }

      if (report.health) {
        text += `【健康数据】\n`;
        text += `平均心率：${report.health.avgHeartRate}bpm\n`;
        text += `平均体温：${report.health.avgTemperature}℃\n\n`;
      }
    } else {
      text += `【事件信息】\n`;
      text += `风险等级：${report.riskLevel === 'high' ? '高危' : report.riskLevel === 'medium' ? '中危' : '低危'}\n`;
      text += `风险评分：${report.riskScore}分\n`;
      text += `事件时间：${report.eventTime}\n`;
      text += `事件地点：${report.location}\n\n`;

      if (report.timeline) {
        text += `【事件时间线】\n`;
        report.timeline.forEach((item) => {
          text += `${item.time} - ${item.event}\n`;
        });
        text += `\n`;
      }
    }

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
    const fileName = report.type === 'daily' ? `daily_${this.data.date}` : `event_${this.data.eventId}`;
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}.json`;

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
      title: this.data.reportData?.title || '安全报告',
      path: `/pages/report-preview/index?type=${this.data.type}&date=${this.data.date}&eventId=${this.data.eventId}`
    };
  }
});