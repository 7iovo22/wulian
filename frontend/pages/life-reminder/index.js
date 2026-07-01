const api = require('../../utils/api');
const storage = require('../../utils/storage');

Page({
  data: {
    reminderList: [],
    stats: {
      total: 0,
      enabled: 0,
      disabled: 0,
      delivered: 0
    },
    newReminder: {
      title: '',
      content: '',
      category: 'daily',
      date: '',
      time: ''
    }
  },

  onLoad: function (options) {
    this.loadReminderList();
  },

  loadReminderList: function () {
    const cachedReminders = storage.get('reminderList', []);
    
    const mockReminders = cachedReminders.length > 0 ? cachedReminders : [
      {
        id: 1,
        title: '定期检查头盔',
        content: '建议每3个月检查一次头盔内部缓冲材料状态，确保安全防护效果',
        category: 'safety',
        enabled: true,
        nextRemindTime: '2024-02-15 09:00',
        deliveryStatus: 'pending'
      },
      {
        id: 2,
        title: '健康体检提醒',
        content: '您已超过6个月未进行健康体检，建议尽快安排体检',
        category: 'health',
        enabled: true,
        nextRemindTime: '2024-01-20 10:00',
        deliveryStatus: 'delivered'
      },
      {
        id: 3,
        title: '更换电池',
        content: '设备电池已使用超过1年，建议更换新电池以确保正常运行',
        category: 'daily',
        enabled: false,
        nextRemindTime: '2024-01-25 08:00',
        deliveryStatus: 'pending'
      },
      {
        id: 4,
        title: '紧急联系人更新',
        content: '建议定期更新紧急联系人信息，确保紧急情况下能及时联系',
        category: 'emergency',
        enabled: true,
        nextRemindTime: '2024-03-01 09:00',
        deliveryStatus: 'delivered'
      },
      {
        id: 5,
        title: '休息提醒',
        content: '骑行超过2小时建议休息15分钟，避免疲劳驾驶',
        category: 'health',
        enabled: true,
        nextRemindTime: '2024-01-15 14:00',
        deliveryStatus: 'pending'
      }
    ];

    this.setData({ reminderList: mockReminders });
    this.updateStats();
  },

  updateStats: function () {
    const list = this.data.reminderList;
    const stats = {
      total: list.length,
      enabled: list.filter(item => item.enabled).length,
      disabled: list.filter(item => !item.enabled).length,
      delivered: list.filter(item => item.deliveryStatus === 'delivered').length
    };
    this.setData({ stats });
  },

  getCategoryText: function (category) {
    const texts = {
      health: '健康',
      safety: '安全',
      daily: '日常',
      emergency: '紧急'
    };
    return texts[category] || category;
  },

  getCategoryBg: function (category) {
    const colors = {
      health: 'rgba(239, 83, 80, 0.1)',
      safety: 'rgba(30, 144, 255, 0.1)',
      daily: 'rgba(255, 193, 7, 0.1)',
      emergency: 'rgba(220, 20, 60, 0.1)'
    };
    return colors[category] || 'rgba(155, 89, 182, 0.1)';
  },

  getCategoryColor: function (category) {
    const colors = {
      health: '#EF5350',
      safety: '#1E90FF',
      daily: '#FFC107',
      emergency: '#DC143C'
    };
    return colors[category] || '#9B59B6';
  },

  onSwitchChange: function (e) {
    const id = e.currentTarget.dataset.id;
    const checked = e.detail.value;
    
    const reminderList = this.data.reminderList.map(item => {
      if (item.id === parseInt(id)) {
        return { ...item, enabled: checked };
      }
      return item;
    });

    this.setData({ reminderList });
    this.updateStats();
    this.saveReminders();

    wx.showToast({
      title: checked ? '已启用' : '已关闭',
      icon: 'none'
    });
  },

  onTitleInput: function (e) {
    this.setData({
      'newReminder.title': e.detail.value
    });
  },

  onContentInput: function (e) {
    this.setData({
      'newReminder.content': e.detail.value
    });
  },

  selectCategory: function (e) {
    this.setData({
      'newReminder.category': e.currentTarget.dataset.category
    });
  },

  onDateChange: function (e) {
    this.setData({
      'newReminder.date': e.detail.value
    });
  },

  onTimeChange: function (e) {
    this.setData({
      'newReminder.time': e.detail.value
    });
  },

  addReminder: function () {
    const { title, content, category, date, time } = this.data.newReminder;
    
    if (!title.trim()) {
      wx.showToast({ title: '请输入提醒标题', icon: 'none' });
      return;
    }
    if (!date || !time) {
      wx.showToast({ title: '请选择提醒时间', icon: 'none' });
      return;
    }

    const newItem = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      category,
      enabled: true,
      nextRemindTime: `${date} ${time}`,
      deliveryStatus: 'pending'
    };

    const reminderList = [...this.data.reminderList, newItem];
    this.setData({ 
      reminderList,
      newReminder: {
        title: '',
        content: '',
        category: 'daily',
        date: '',
        time: ''
      }
    });
    this.updateStats();
    this.saveReminders();

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  saveReminders: function () {
    storage.set('reminderList', this.data.reminderList);
  },

  goBack: function () {
    wx.navigateBack();
  }
});