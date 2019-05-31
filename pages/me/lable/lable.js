const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    purple: 'purple-bg white',
    pageList: [],
  },
  bindChange: function(e) { //切换，选择
    let index = e.currentTarget.dataset.index,
      pageList = this.data.pageList;
    pageList[index].isShow = !pageList[index].isShow;
    this.setData({
      pageList: pageList
    })
  },
  submit() { //保存按钮
    let pageList = this.data.pageList,
      arr = [];
    pageList.forEach(function(target) {
      if (target.isShow) {
        arr.push({
          id: target.LcId,
          text: target.lableEn ? target.lableEn : target.LcTitle
        });
      }
    })
    if (arr.length <= 0) {
      $common.showModal('Please select the acceptable teaching Key Words.', false, false, 'OK', 'Reminder');
      return;
    }
    app.globalData.teacherFor.TeaLabelSelect = arr;
    wx.navigateBack({
      delta: 1
    })
  },
  init() {
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetLabelInfos, null,
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          let TeaLabelSelect = app.globalData.teacherFor.TeaLabelSelect;
          if (TeaLabelSelect && TeaLabelSelect.length > 0) {
            for (let i = 0, len = data.length; i < len; i++) {
              for (let j = 0, l = TeaLabelSelect.length; j < l; j++) {
                if (TeaLabelSelect[j].id === data[i].LcId) {
                  data[i].isShow = true;
                }
              }
            }
          }
          this.setData({
            pageList: data
          });
        } else {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        }
      },
      (res) => {
        $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
      },
      (res) => {
        wx.hideLoading();
      }
    )
  },
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.init();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
    this.init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return $common.share()
  }
})