// pages/New/Abasic/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['一对二', '一对一', '一对三'],
    date: '1990-01-01',
    index: 1,
    index1: 1,
    GuoJia: ['2', '1.5', '1']
  },
  // 选择时间
  ShiJian: function () {
    wx.navigateTo({
      url: '../ClassTime/index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //普通选择
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  bindPickerChange1: function (e) {
    this.setData({
      index1: e.detail.value
    })
  },
  //日期
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
    wx.stopPullDownRefresh();
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