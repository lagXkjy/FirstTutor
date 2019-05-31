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
          id: target.AiId,
          text: target.areaEn ? target.areaEn : target.AiName
        });
      }
    })
    if (arr.length <= 0) {
      $common.showModal('Please select the acceptable teaching area.', false, false, 'OK', 'Reminder');
      return;
    }
    app.globalData.teacherFor.TeaClaArea = arr;
    wx.navigateBack({
      delta: 1
    })
  },
  init() {
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetAreaInfos, {
        canId: this.data.canId
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          let arr = [];
          for (let i = 0, len = data.length; i < len; i++) {
            arr.push(data[i].AiName);
          }
          $common.translate( //翻译
            arr.join('\n'),
            (res) => {
              let arrData = res.data.trans_result;
              if (arrData && arrData.length > 0) {
                for (let i = data.length - 1; i >= 0; i--) {
                  data[i].areaEn = arrData[i].dst
                }
              }
              let TeaClaArea = app.globalData.teacherFor.TeaClaArea;
              for (let i = 0, len = data.length; i < len; i++) {
                for (let j = 0, l = TeaClaArea.length; j < l; j++) {
                  if (TeaClaArea[j].id === data[i].AiId) {
                    data[i].isShow = true;
                  }
                }
              }
              this.setData({
                pageList: data
              });
            }
          )
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

  onLoad: function(options) {
    this.data.canId = options.canId;
  },

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