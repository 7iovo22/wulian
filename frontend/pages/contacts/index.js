Page({
  data: {
    contacts: [],
    showAddModal: false,
    editingContact: null,
    formData: {
      name: '',
      relation: '',
      phone: ''
    }
  },

  onLoad: function () {
    this.loadContacts();
  },

  loadContacts: function () {
    const mockContacts = [
      { id: 1, name: '张三', relation: '父母', phone: '13800138001' },
      { id: 2, name: '李四', relation: '配偶', phone: '13800138002' },
      { id: 3, name: '王五', relation: '朋友', phone: '13800138003' }
    ];
    
    this.setData({
      contacts: mockContacts
    });
  },

  addContact: function () {
    this.setData({
      showAddModal: true,
      editingContact: null,
      formData: {
        name: '',
        relation: '',
        phone: ''
      }
    });
  },

  editContact: function (e) {
    const id = e.currentTarget.dataset.id;
    const contact = this.data.contacts.find(c => c.id === id);
    
    if (contact) {
      this.setData({
        showAddModal: true,
        editingContact: contact,
        formData: {
          name: contact.name,
          relation: contact.relation,
          phone: contact.phone
        }
      });
    }
  },

  deleteContact: function (e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '删除联系人',
      content: '确定要删除该联系人吗？',
      success: (res) => {
        if (res.confirm) {
          const newContacts = this.data.contacts.filter(c => c.id !== id);
          this.setData({
            contacts: newContacts
          });
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  closeModal: function () {
    this.setData({
      showAddModal: false
    });
  },

  onNameInput: function (e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  onPhoneInput: function (e) {
    this.setData({
      'formData.phone': e.detail.value
    });
  },

  setRelation: function (e) {
    const relation = e.currentTarget.dataset.relation;
    this.setData({
      'formData.relation': relation
    });
  },

  saveContact: function () {
    const { name, relation, phone } = this.data.formData;
    
    if (!name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!relation) {
      wx.showToast({
        title: '请选择关系',
        icon: 'none'
      });
      return;
    }
    
    if (!phone.trim() || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.editingContact) {
      const newContacts = this.data.contacts.map(c => 
        c.id === this.data.editingContact.id 
          ? { ...c, name, relation, phone }
          : c
      );
      this.setData({
        contacts: newContacts
      });
      wx.showToast({
        title: '修改成功',
        icon: 'success'
      });
    } else {
      const newContact = {
        id: Date.now(),
        name,
        relation,
        phone
      };
      this.setData({
        contacts: [...this.data.contacts, newContact]
      });
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
    }
    
    this.closeModal();
  },

  callContact: function (e) {
    const phone = e.currentTarget.dataset.phone;
    
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showToast({
          title: '拨号失败',
          icon: 'none'
        });
      }
    });
  },

  goBack: function () {
    wx.navigateBack();
  }
});