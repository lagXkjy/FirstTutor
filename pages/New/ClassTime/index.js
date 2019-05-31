/**
 * 选择时间段
 */
const $common = require('../../../utils/common.js')
const app = getApp()
Page({
  data: {
    timeList: [],
    timeNoTables: -1, //哪些时间不能选
    IsVip: 0, //是否为超级vip
  },
  SonTime(e) { //子组件选择时间触发该事件
    this.data.timeList = e.detail.timeList
  },
  submit() {
    let timeList = this.data.timeList
    let arr = []
    timeList.forEach(function (target, index) {
      if (target.timeType === 2) {
        arr.push({
          TimAfw: target.TimAfw,           //周
          TimClaTime: target.TimClaTime,   //时间段
          TimDateTime: target.TimDateTime     //日期
        })
      }
    })
    if (arr.length <= 0) {  //请选择时间段
      return $common.showModal('Please select time slot.', false, false, 'Ok', 'Reminder')
    }
    app.globalData.releaseCourse.courseTime = arr
    wx.navigateBack({ delta: 1 })
  },
  getCourseTimeTable() { //获取课程占用
    $common.request('POST', $common.config.GetAllTeaTimeTableInfo, {
      teaId: wx.getStorageSync('teacherStatusInfo').teaId
    }, (res) => {
      if (res.data.res) {
        this.setData({ timeNoTables: res.data.timList })
      } else {
        $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder')
      }
    },
      (res) => { },
      (res) => { }
    )
  },
  init() {
    this.getCourseTimeTable()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ IsVip: +options.IsVip })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  onShow: function () {
    this.init();
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
    wx.stopPullDownRefresh()
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