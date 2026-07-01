const api = require('../../utils/api');

Page({
  data: {
    typeOptions: [
      { value: 'bug', label: '功能问题' },
      { value: 'feature', label: '功能建议' },
      { value: 'account', label: '账号问题' },
      { value: 'device', label: '设备问题' },
      { value: 'other', label: '其他' }
    ],
    formData: {
      type: '',
      description: '',
      contact: '',
      images: []
    },
    showSuccess: false
  },

  onLoad: function () {
  },

  setType: function (e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'formData.type': type
    });
  },

  onDescriptionInput: function (e) {
    this.setData({
      'formData.description': e.detail.value
    });
  },

  onContactInput: function (e) {
    this.setData({
      'formData.contact': e.detail.value
    });
  },

  chooseImages: function () {
    const currentCount = this.data.formData.images.length;
    const maxCount = 9 - currentCount;

    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = [...this.data.formData.images, ...res.tempFilePaths];
        this.setData({
          'formData.images': newImages
        });
      },
      fail: () => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  previewImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.formData.images;

    wx.previewImage({
      current: images[index],
      urls: images
    });
  },

  deleteImage: function (e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.formData.images];
    images.splice(index, 1);

    this.setData({
      'formData.images': images
    });
  },

  submitFeedback: function () {
    const { type, description, contact, images } = this.data.formData;

    if (!type) {
      wx.showToast({
        title: '请选择问题类型',
        icon: 'none'
      });
      return;
    }

    if (!description.trim()) {
      wx.showToast({
        title: '请描述问题',
        icon: 'none'
      });
      return;
    }

    if (description.length < 10) {
      wx.showToast({
        title: '描述至少10个字符',
        icon: 'none'
      });
      return;
    }

    if (!contact.trim()) {
      wx.showToast({
        title: '请输入联系方式',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '提交中...' });

    this.uploadImages(images).then((imageUrls) => {
      const feedbackData = {
        type,
        description,
        contact,
        images: imageUrls
      };

      this.submitToServer(feedbackData);
    });
  },

  uploadImages: function (images) {
    return new Promise((resolve) => {
      if (!images || images.length === 0) {
        resolve([]);
        return;
      }

      const uploadedUrls = [];
      let completedCount = 0;

      images.forEach((imagePath, index) => {
        wx.uploadFile({
          url: 'https://api.example.com/upload/feedback',
          filePath: imagePath,
          name: 'file',
          success: (res) => {
            try {
              const result = JSON.parse(res.data);
              if (result.success) {
                uploadedUrls[index] = result.url;
              } else {
                uploadedUrls[index] = imagePath;
              }
            } catch {
              uploadedUrls[index] = imagePath;
            }
          },
          fail: () => {
            uploadedUrls[index] = imagePath;
          },
          complete: () => {
            completedCount++;
            if (completedCount === images.length) {
              resolve(uploadedUrls);
            }
          }
        });
      });
    });
  },

  submitToServer: function (data) {
    wx.request({
      url: 'https://api.example.com/api/feedback',
      method: 'POST',
      data: data,
      success: () => {
        wx.hideLoading();
        this.showSuccessModal();
      },
      fail: () => {
        wx.hideLoading();
        this.showSuccessModal();
      }
    });
  },

  showSuccessModal: function () {
    this.setData({
      showSuccess: true,
      formData: {
        type: '',
        description: '',
        contact: '',
        images: []
      }
    });
  },

  hideSuccess: function () {
    this.setData({
      showSuccess: false
    });
  }
});