const helpers = require('../../utils/helpers');

Page({
  data: {
    warning: null,
    warningId: ''
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        warningId: options.id
      });
      this.loadWarningDetail(options.id);
    } else {
      helpers.showToast('参数错误', 'none');
      setTimeout(() => {
        helpers.goBack();
      }, 1500);
    }
  },

  loadWarningDetail: function (id) {
    helpers.showLoading('加载中...');
    
    const mockWarning = {
      id: id,
      type: 'fatigue',
      icon: '😴',
      title: '疲劳驾驶预警',
      typeText: '疲劳预警',
      time: '2024-01-15 14:30:25',
      location: '北京市朝阳区望京SOHO',
      severity: 'high',
      status: 'unhandled',
      description: '检测到您连续驾驶超过4小时，系统建议您休息15分钟后再继续行驶。疲劳驾驶是造成交通事故的重要原因之一，请务必重视。',
      handleRecords: [
        {
          time: '2024-01-15 14:35:10',
          content: '系统已自动发送提醒通知'
        }
      ]
    };
    
    setTimeout(() => {
      this.setData({
        warning: mockWarning
      });
      helpers.hideLoading();
    }, 500);
  },

  handleWarning: function () {
    wx.showModal({
      title: '确认处理',
      content: '确定要标记该预警为已处理吗？',
      success: (res) => {
        if (res.confirm) {
          helpers.showLoading('处理中...');
          
          setTimeout(() => {
            const warning = this.data.warning;
            warning.status = 'handled';
            
            this.setData({
              warning: warning
            });
            
            helpers.hideLoading();
            helpers.showToast('处理成功', 'success');
          }, 1000);
        }
      }
    });
  },

  goBack: function () {
    helpers.goBack();
  }
});