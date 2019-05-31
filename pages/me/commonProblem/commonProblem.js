/*
  常见问题
 */
const $common = require('../../../utils/common.js');
const WxParse = require('../../../wxParse/wxParse.js'); //字符串转换为微信页面
Page({
  data: {

  },
  init() {
    let isEn = wx.getStorageSync('isEn');
    let text = isEn ? "Loading..." : "努力加载...";
    wx.showLoading({ title: text });
    $common.request(
      'POST',
      $common.config.GetUserHelp,
      {
        type: 2,
      },
      (res) => {
        if (res.data.res) {
          WxParse.wxParse('article', 'html', res.data.UhCon, this, 5);
        }
      },
      (res) => {

      },
      (res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    )
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.init();
  },

  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    this.setData({
      isEn: isEn
    })
    let text = isEn ? "Common problems" : "常见问题";
    wx.setNavigationBarTitle({
      title: text
    })
  },
  onShow: function () {
    this.isEnEvent();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})