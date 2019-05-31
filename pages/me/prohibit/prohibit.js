// pages/me/prohibit/prohibit.js
// 改用户被禁止
const app = getApp();
const $common = require('../../../utils/common.js');
Page({
  data: {
    //学生
    studentList: [{
      url: '/images/problem.png',
      title: "帮助与反馈",
      luJin: '/pages/me/help/help'
    }],
  },
  getUserInfo(e) { //获取用户头像等信息
    let url = e.currentTarget.dataset.url;
    let userInfo = e.detail.userInfo;
    if (!userInfo) return;
    $common.getUserInfo(userInfo, this.jump.bind(this, url));
  },
  jump(url) { // 跳转
    wx.navigateTo({
      url: url,
    })
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