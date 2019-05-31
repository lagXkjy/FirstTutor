/**
 * 注册为外教成功页面
 */
const $common = require('../../../utils/common.js');
Page({
  data: {

  },
  templateMessage() { //设置模板消息
    wx.navigateTo({
      url: '/pages/static/templateMessage/templateMessage',
    })
  },
  releaseCourse() { //发布课程
    wx.navigateTo({
      url: '/pages/New/ReleaseCourse/index?status=3',
    })
  },
  getIsVip(callback) {//获取外教是否为vip
    $common.request(
      "POST",
      $common.config.GetForTeaStatus,
      { openId: wx.getStorageSync('openid') },
      (res) => {
        if (res.data.res) { //我就是为了存一个外教信息方便后面用
          wx.setStorageSync("teacherStatusInfo", res.data);
        }
      },
    );
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getIsVip();
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